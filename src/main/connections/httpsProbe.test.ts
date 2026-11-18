// @vitest-environment node
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createServer, type Server } from "node:https";
import { createServer as createTlsServer, type TLSSocket } from "node:tls";
import type { RequestListener } from "node:http";
import type { AddressInfo } from "node:net";
import { once } from "node:events";
import {
  createTlsFixture,
  type TlsFixture,
} from "../../../tools/testing/tls-fixture.cjs";
import {
  MAX_PROBE_BODY_BYTES,
  MAX_PROBE_HEADER_BYTES,
} from "../../shared/connections";
import { probeHttps } from "./httpsProbe";
let fixture: TlsFixture;
const servers: Server[] = [];
beforeAll(async () => {
  fixture = await createTlsFixture();
}, 20000);
afterAll(async () => {
  for (const server of servers) {
    server.closeAllConnections();
    await new Promise<void>(resolve => server.close(() => resolve()));
  }
  await fixture.cleanup();
});
async function server(handler: RequestListener, certificate?: string) {
  const instance = createServer(
    { key: fixture.key, cert: certificate ?? fixture.cert },
    handler,
  );
  servers.push(instance);
  instance.listen(0, "127.0.0.1");
  await once(instance, "listening");
  return `https://127.0.0.1:${(instance.address() as AddressInfo).port}`;
}
function input(httpsUrl: string) {
  return {
    httpsUrl,
    username: "synthetic-user",
    password: "SYNTHETIC-HTTPS-SENTINEL",
    trust: { mode: "custom" as const, pem: fixture.ca },
  };
}
function success(
  _req: Parameters<RequestListener>[0],
  res: Parameters<RequestListener>[1],
) {
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ name: "synthetic-user", ignoredExtension: true }));
}
describe("bounded real TLS authentication probe", () => {
  it("verifies custom CA, sends Basic only to the saved prefix and closes its connection", async () => {
    let requests = 0;
    let socketClosed!: () => void;
    const closed = new Promise<void>(resolve => {
      socketClosed = resolve;
    });
    const url = await server((req, res) => {
      requests++;
      expect(req.url).toBe("/prefix/api/whoami");
      expect(req.method).toBe("GET");
      expect(req.headers["accept-encoding"]).toBe("identity");
      expect(req.headers.authorization).toBe(
        "Basic " +
          Buffer.from("synthetic-user:SYNTHETIC-HTTPS-SENTINEL").toString(
            "base64",
          ),
      );
      req.socket.once("close", socketClosed);
      success(req, res);
    });
    await expect(
      probeHttps(input(url + "/prefix/"), new AbortController().signal),
    ).resolves.toBeUndefined();
    await closed;
    expect(requests).toBe(1);
  });
  it("rejects an unknown CA, a wrong hostname and an expired certificate before sending HTTP", async () => {
    let requests = 0;
    const handler: RequestListener = (req, res) => {
      requests++;
      success(req, res);
    };
    const normal = await server(handler);
    await expect(
      probeHttps(
        { ...input(normal), trust: { mode: "default" } },
        new AbortController().signal,
      ),
    ).rejects.toMatchObject({ code: "TEST_TLS" });
    for (const certificate of [fixture.wrongCert, fixture.expiredCert])
      await expect(
        probeHttps(
          input(await server(handler, certificate)),
          new AbortController().signal,
        ),
      ).rejects.toMatchObject({ code: "TEST_TLS" });
    expect(requests).toBe(0);
  });
  it.each([
    [401, "TEST_AUTH"],
    [403, "TEST_FORBIDDEN"],
    [404, "TEST_RESPONSE"],
    [302, "TEST_REDIRECT"],
  ])(
    "classifies status %s without following or replaying",
    async (status, code) => {
      let requests = 0;
      const url = await server((_req, res) => {
        requests++;
        res.writeHead(status as number, {
          Location: "https://unreachable.invalid/",
          "Content-Type": "application/json",
        });
        res.end("{}");
      });
      await expect(
        probeHttps(input(url), new AbortController().signal),
      ).rejects.toMatchObject({ code });
      expect(requests).toBe(1);
    },
  );
  it("rejects unexpected identity, malformed/deep JSON, oversized/chunked bodies, headers and compression", async () => {
    const cases = [
      { body: '{"name":"other"}' },
      { body: "{" },
      {
        body: JSON.stringify({
          name: "synthetic-user",
          deep: JSON.parse("[".repeat(17) + "0" + "]".repeat(17)),
        }),
      },
      { body: "x".repeat(MAX_PROBE_BODY_BYTES + 1) },
      { body: "{}", headers: { "X-Huge": "x".repeat(MAX_PROBE_HEADER_BYTES) } },
      { body: "{}", headers: { "Content-Encoding": "gzip" } },
      { body: "{}", headers: { "Content-Type": "text/html" } },
    ];
    for (const value of cases) {
      const url = await server((_req, res) => {
        res.writeHead(200, {
          "Content-Type": "application/json",
          ...value.headers,
        });
        res.write(value.body);
        res.end();
      });
      await expect(
        probeHttps(input(url), new AbortController().signal),
      ).rejects.toMatchObject({ code: "TEST_RESPONSE" });
    }
  });
  it("cancels stalled responses, does not retry and sanitizes certificate/connection errors", async () => {
    const controller = new AbortController();
    let entered!: () => void;
    const ready = new Promise<void>(resolve => {
      entered = resolve;
    });
    const url = await server((_req, res) => {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.write("{");
      entered();
    });
    const result = probeHttps(input(url), controller.signal);
    await ready;
    controller.abort();
    await expect(result).rejects.toMatchObject({ code: "TEST_CANCELLED" });
    const unavailable = await server(success);
    const target = servers.at(-1)!;
    await new Promise<void>(resolve => target.close(() => resolve()));
    await expect(
      probeHttps(input(unavailable), new AbortController().signal),
    ).rejects.toMatchObject({ message: "TEST_NETWORK" });
  });
  it("rejects Basic-incompatible credentials without issuing a request", async () => {
    const url = await server(success);
    for (const value of [
      { ...input(url), username: "bad:identity" },
      { ...input(url), password: "\ud800" },
    ])
      await expect(
        probeHttps(value, new AbortController().signal),
      ).rejects.toMatchObject({ code: "TEST_CREDENTIAL_FORMAT" });
  });
  it("rejects insecure URLs or embedded credentials before connecting", async () => {
    for (const url of ["http://localhost", "https://u:p@localhost"])
      await expect(
        probeHttps(input(url), new AbortController().signal),
      ).rejects.toMatchObject({ code: "VALIDATION" });
  });
  it("classifies malformed HTTP framing as protocol failure without exposing parser details", async () => {
    let peer: TLSSocket | undefined;
    const malformed = createTlsServer(
      { key: fixture.key, cert: fixture.cert },
      socket => {
        peer = socket;
        socket.once("data", () => {
          socket.end("HTTP/1.1 200 OK\r\nContent-Length: invalid\r\n\r\n");
          socket.resume();
        });
      },
    );
    malformed.listen(0, "127.0.0.1");
    await once(malformed, "listening");
    try {
      const url = `https://127.0.0.1:${(malformed.address() as AddressInfo).port}`;
      await expect(
        probeHttps(input(url), AbortSignal.timeout(1500)),
      ).rejects.toMatchObject({ code: "TEST_RESPONSE" });
    } finally {
      peer?.destroy();
      await new Promise<void>(resolve => malformed.close(() => resolve()));
    }
  });
});
