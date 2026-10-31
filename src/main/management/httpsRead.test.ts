// @vitest-environment node
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createServer, type Server } from "node:https";
import type { RequestListener } from "node:http";
import type { AddressInfo } from "node:net";
import { once } from "node:events";
import {
  createTlsFixture,
  type TlsFixture,
} from "../../../tools/testing/tls-fixture.cjs";
import {
  readManagement,
  parseManagementBody,
  ManagementFailure,
} from "./httpsRead";
let fixture: TlsFixture;
const servers: Server[] = [];
beforeAll(async () => {
  fixture = await createTlsFixture();
}, 20000);
afterAll(async () => {
  for (const s of servers) {
    s.closeAllConnections();
    await new Promise<void>(r => s.close(() => r()));
  }
  await fixture.cleanup();
});
async function server(handler: RequestListener, cert?: string) {
  const s = createServer(
    { key: fixture.key, cert: cert ?? fixture.cert },
    handler,
  );
  servers.push(s);
  s.listen(0, "127.0.0.1");
  await once(s, "listening");
  return {
    httpsUrl: `https://127.0.0.1:${(s.address() as AddressInfo).port}`,
    username: "synthetic",
    password: "SYNTHETIC-ADMIN-ONLY",
    trust: { mode: "custom" as const, pem: fixture.ca },
  };
}
const query = { kind: "vhosts" as const, vhost: "/" };
const signal = () => new AbortController().signal;
describe("bounded management reads", () => {
  it("preserves exact names, strips extensions, accepts 200 and refuses 201 without truncation", () => {
    const names = [
      "/",
      ".",
      "..",
      "área pedidos",
      "literal%2F",
      "equipe/pedidos",
      ...Array.from({ length: 194 }, (_, i) => String(i)),
    ];
    const result = parseManagementBody(
      names.map(name => ({ name, password: "synthetic extra" })),
      query,
    );
    expect(result).toEqual({
      kind: "vhosts",
      names,
      currentVhost: "/",
      currentVisible: true,
    });
    expect(() =>
      parseManagementBody(
        [...names, "extra"].map(name => ({ name })),
        query,
      ),
    ).toThrowError(new ManagementFailure("LIMIT"));
    expect(parseManagementBody([], query)).toMatchObject({
      names: [],
      currentVisible: false,
    });
  });
  it("rejects incompatible shapes, duplicate names, invalid UTF-8 names and excess depth", () => {
    for (const value of [
      { items: [] },
      [{ name: "same" }, { name: "same" }],
      [{ name: "" }],
      [{ name: "\ud800" }],
      [{ name: "x\u0000" }],
      [{ name: "é".repeat(128) }],
      [{ name: "/", deep: JSON.parse("[".repeat(17) + "0" + "]".repeat(17)) }],
    ])
      expect(() => parseManagementBody(value, query)).toThrowError(
        new ManagementFailure("RESPONSE"),
      );
  });
  it("distinguishes unknown and outside-reference versions without inferring capabilities", () => {
    expect(parseManagementBody({}, { kind: "broker" })).toEqual({
      kind: "broker",
      matrix: "unknown",
    });
    for (const version of ["4.3.6", "4.4.0", "5.0.0", "4.4.0-rc.1"])
      expect(
        parseManagementBody({ rabbitmq_version: version }, { kind: "broker" }),
      ).toMatchObject({
        matrix:
          version === "4.3.6" || version === "4.4.0" ? "reference" : "outside",
      });
    expect(() =>
      parseManagementBody({ rabbitmq_version: 44 }, { kind: "broker" }),
    ).toThrow();
  });
  it.each([
    [401, "AUTH"],
    [403, "DENIED"],
    [404, "NOT_FOUND"],
    [429, "RATE_LIMIT"],
    [500, "SERVER"],
    [302, "REDIRECT"],
  ])("maps status %s without retry or response echo", async (status, code) => {
    let calls = 0;
    const input = await server((_req, res) => {
      calls++;
      res.writeHead(status as number, {
        "Content-Type": "application/json",
        Location: "https://unreachable.invalid",
      });
      res.end('{"reason":"SYNTHETIC-UNTRUSTED"}');
    });
    await expect(readManagement(input, query, signal())).rejects.toMatchObject({
      code,
      message: code,
    });
    expect(calls).toBe(1);
  });
  it("recognizes tag denial under 401, sends only the fixed allowlist and validates TLS", async () => {
    const paths: string[] = [];
    const input = await server((req, res) => {
      paths.push(req.url!);
      res.writeHead(401, { "Content-Type": "application/json" });
      res.end('{"reason":"Not management user"}');
    });
    await expect(
      readManagement(
        { ...input, httpsUrl: input.httpsUrl + "/prefix/" },
        { kind: "broker" },
        signal(),
      ),
    ).rejects.toMatchObject({ code: "DENIED" });
    expect(paths).toEqual([
      "/prefix/api/overview?columns=rabbitmq_version,management_version",
    ]);
    await expect(
      readManagement({ ...input, trust: { mode: "default" } }, query, signal()),
    ).rejects.toMatchObject({ code: "TLS" });
    for (const cert of [fixture.wrongCert, fixture.expiredCert])
      await expect(
        readManagement(
          await server((_req, res) => res.end("[]"), cert),
          query,
          signal(),
        ),
      ).rejects.toMatchObject({ code: "TLS" });
    expect(paths).toHaveLength(1);
  });
  it("enforces content, encoding, size, UTF-8 and header limits", async () => {
    for (const data of [
      { body: "[]", headers: { "Content-Encoding": "gzip" }, code: "RESPONSE" },
      {
        body: "[]",
        headers: { "Content-Type": "text/html" },
        code: "RESPONSE",
      },
      { body: "x".repeat(256 * 1024 + 1), code: "LIMIT" },
      {
        body: "[]",
        headers: { "X-Huge": "x".repeat(16 * 1024) },
        code: "LIMIT",
      },
      { body: Buffer.from([0xff]), code: "RESPONSE" },
      { body: "{", code: "RESPONSE" },
    ]) {
      const input = await server((_req, res) => {
        res.writeHead(200, {
          "Content-Type": "application/json",
          ...data.headers,
        });
        res.write(data.body);
        res.end();
      });
      await expect(
        readManagement(input, query, signal()),
      ).rejects.toMatchObject({ code: data.code });
    }
  });
  it("honors pre-cancel and aborts stalled responses without retries", async () => {
    let calls = 0;
    const controller = new AbortController();
    const input = await server((_req, res) => {
      calls++;
      res.setHeader("Content-Type", "application/json");
      res.write("[");
      controller.abort();
    });
    await expect(
      readManagement(input, query, AbortSignal.abort()),
    ).rejects.toMatchObject({ code: "CANCELLED" });
    expect(calls).toBe(0);
    await expect(
      readManagement(input, query, controller.signal),
    ).rejects.toMatchObject({ code: "CANCELLED" });
    expect(calls).toBe(1);
  });
  it("applies its own total deadline even when the peer never completes", async () => {
    const input = await server(() => undefined);
    const started = Date.now();
    await expect(readManagement(input, query, signal())).rejects.toMatchObject({
      code: "TIMEOUT",
    });
    expect(Date.now() - started).toBeLessThan(12000);
  }, 15000);
});
