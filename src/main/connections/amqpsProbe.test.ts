// @vitest-environment node
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { createServer, Socket } from "node:net";
import { once } from "node:events";
import {
  createTlsFixture,
  type TlsFixture,
} from "../../../tools/testing/tls-fixture.cjs";
import {
  createAmqpPeer,
  type AmqpPeer,
} from "../../../tools/testing/amqp-fixture.cjs";
import { probeAmqps } from "./amqpsProbe";
let fixture: TlsFixture;
const peers: AmqpPeer[] = [];
beforeAll(async () => {
  fixture = await createTlsFixture();
}, 20000);
afterAll(async () => {
  for (const peer of peers) await peer.close();
  await fixture.cleanup();
});
async function peer(mode = "ok", cert?: string) {
  const value = await createAmqpPeer(fixture, { mode, cert });
  peers.push(value);
  return value;
}
function input(amqpsUrl: string) {
  return {
    amqpsUrl,
    username: "synthetic:user",
    password: "SYNTHETIC-AMQP-PROBE-SENTINEL",
    trust: { mode: "custom" as const, pem: fixture.ca },
  };
}
describe("owned socket AMQPS probe with real TLS and scripted AMQP peer", () => {
  it("authenticates only over TLS, preserves vhost once and confirms close without opening channels", async () => {
    const p = await peer();
    expect(
      await probeAmqps(
        input(p.url + "/literal%252F"),
        AbortSignal.timeout(2000),
      ),
    ).toBe("literal%2F");
    expect(p.records[0]).toMatchObject({
      vhost: "literal%2F",
      credentials: {
        mechanism: "PLAIN",
        response: "\0synthetic:user\0SYNTHETIC-AMQP-PROBE-SENTINEL",
      },
      tune: { channelMax: 1, frameMax: 131072, heartbeat: 10 },
      closeConfirmed: true,
      methods: ["10.11", "10.31", "10.40", "10.50"],
      channels: [0, 0, 0, 0],
    });
    await vi.waitFor(() => expect(p.sockets.size).toBe(0));
    expect(p.attempts).toBe(1);
  });
  it.each([
    "/%2F",
    "/equipe%2Fpedidos",
    "/%E7%94%9F%E7%94%A3",
    "/%2E%2E",
    "/%20nome%20",
  ])("preserves the exact encoded vhost %s", async path => {
    const p = await peer();
    expect(
      await probeAmqps(input(p.url + path), AbortSignal.timeout(2000)),
    ).toBe(decodeURIComponent(path.slice(1)));
  });
  it("uses the default vhost when absent and validates DNS identity", async () => {
    const p = await peer();
    expect(
      await probeAmqps(
        input(`amqps://localhost:${p.port}`),
        AbortSignal.timeout(2000),
      ),
    ).toBe("/");
  });
  it("rejects unknown CA, wrong SAN and expiry without sending SASL", async () => {
    const p = await peer();
    await expect(
      probeAmqps(
        { ...input(p.url), trust: { mode: "default" } },
        AbortSignal.timeout(2000),
      ),
    ).rejects.toMatchObject({ code: "TEST_TLS" });
    expect(p.records).toHaveLength(0);
    for (const cert of [fixture.wrongCert, fixture.expiredCert]) {
      const p = await peer("ok", cert);
      await expect(
        probeAmqps(input(p.url), AbortSignal.timeout(2000)),
      ).rejects.toMatchObject({ code: "TEST_TLS" });
      expect(p.records).toHaveLength(0);
      await vi.waitFor(() => expect(p.sockets.size).toBe(0));
    }
  });
  it.each(["refuseAuth", "refuseVhost"])(
    "sanitizes broker refusal %s without guessing the cause",
    async mode => {
      const p = await peer(mode);
      await expect(
        probeAmqps(input(p.url), AbortSignal.timeout(2000)),
      ).rejects.toMatchObject({
        code: "AMQP_REFUSED",
        message: "AMQP_REFUSED",
      });
      await vi.waitFor(() => expect(p.sockets.size).toBe(0));
    },
  );
  it.each(["protocol", "oversize"])(
    "rejects an incompatible handshake %s",
    async mode => {
      const p = await peer(mode);
      await expect(
        probeAmqps(input(p.url), AbortSignal.timeout(2000)),
      ).rejects.toMatchObject({ code: "AMQP_PROTOCOL" });
      await vi.waitFor(() => expect(p.sockets.size).toBe(0));
    },
  );
  it.each(["stallStart", "stallTune", "stallClose"])(
    "cancels and frees sockets during %s",
    async mode => {
      const p = await peer(mode),
        controller = new AbortController();
      const pending = probeAmqps(input(p.url), controller.signal);
      const assertion = expect(pending).rejects.toMatchObject({
        code: "AMQP_CANCELLED",
      });
      await vi.waitFor(() => expect(p.records.length).toBe(1));
      if (mode === "stallTune")
        await vi.waitFor(() => expect(p.records[0].credentials).not.toBeNull());
      if (mode === "stallClose")
        await vi.waitFor(() => expect(p.records[0].methods).toContain("10.50"));
      controller.abort();
      await assertion;
      await vi.waitFor(() => expect(p.sockets.size).toBe(0));
    },
  );
  it("bounds a missing close confirmation and does not claim success", async () => {
    const p = await peer("stallClose");
    await expect(
      probeAmqps(input(p.url), AbortSignal.timeout(2500)),
    ).rejects.toMatchObject({ code: "AMQP_CLOSE" });
    await vi.waitFor(() => expect(p.sockets.size).toBe(0));
  });
  it("does not treat a blocked connection's unconfirmed close as success", async () => {
    const p = await peer("blocked");
    await expect(
      probeAmqps(input(p.url), AbortSignal.timeout(2000)),
    ).rejects.toMatchObject({ code: "AMQP_CLOSE" });
    await vi.waitFor(() => expect(p.sockets.size).toBe(0));
  });
  it("rejects invalid input and pre-cancelled requests before network", async () => {
    const p = await peer();
    for (const path of ["/", "/a/b", "/%zz"]) {
      await expect(
        probeAmqps(input(p.url + path), AbortSignal.timeout(1000)),
      ).rejects.toMatchObject({ code: "AMQP_ENDPOINT" });
    }
    await expect(
      probeAmqps(
        { ...input(p.url), password: "bad\0secret" },
        AbortSignal.timeout(1000),
      ),
    ).rejects.toMatchObject({ code: "AMQP_CREDENTIAL_FORMAT" });
    await expect(
      probeAmqps(input(p.url), AbortSignal.abort()),
    ).rejects.toMatchObject({ code: "AMQP_CANCELLED" });
    expect(p.attempts).toBe(0);
  });
  it("cancels while TLS has not completed", async () => {
    const sockets = new Set<import("node:net").Socket>();
    const server = createServer(socket => {
      socket.resume();
      sockets.add(socket);
      socket.on("close", () => sockets.delete(socket));
    });
    server.listen(0, "127.0.0.1");
    await once(server, "listening");
    const controller = new AbortController();
    const port = (server.address() as import("node:net").AddressInfo).port;
    try {
      const pending = probeAmqps(
        input(`amqps://127.0.0.1:${port}`),
        controller.signal,
      );
      const assertion = expect(pending).rejects.toMatchObject({
        code: "AMQP_CANCELLED",
      });
      await vi.waitFor(() => expect(sockets.size).toBe(1));
      controller.abort();
      await assertion;
      await vi.waitFor(() => expect(sockets.size).toBe(0));
    } finally {
      for (const socket of sockets) socket.destroy();
      await new Promise<void>(resolve => server.close(() => resolve()));
    }
  });
  it("destroys the owned socket when cancelled before TCP or DNS completes", async () => {
    const p = await peer();
    const ownedSockets: Socket[] = [];
    const connect = vi
      .spyOn(Socket.prototype, "connect")
      .mockImplementation(function (this: Socket) {
        ownedSockets.push(this);
        return this;
      });
    const controller = new AbortController();
    try {
      const pending = probeAmqps(input(p.url), controller.signal);
      const assertion = expect(pending).rejects.toMatchObject({
        code: "AMQP_CANCELLED",
      });
      controller.abort();
      await assertion;
      expect(ownedSockets[0]?.destroyed).toBe(true);
      ownedSockets[0]?.emit("connect");
      expect(p.attempts).toBe(0);
    } finally {
      connect.mockRestore();
      ownedSockets[0]?.destroy();
    }
  });
});
