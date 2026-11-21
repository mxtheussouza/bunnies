const assert = require("node:assert/strict");
const https = require("node:https");

const types = ["direct", "topic", "fanout", "headers"];
const label = suffix => "bunnies-delete-" + suffix;
const special = label("área /%2F #?");
const cases = [
  [label("direct"), "/", "direct"],
  [label("topic"), "detailed", "topic"],
  [label("fanout"), "literal%2F", "fanout"],
  [special, "detailed", "headers"],
];
const exchange = (name, vhost = "/", type = "direct", extra = {}) => ({
  name,
  vhost,
  type,
  durable: true,
  auto_delete: false,
  internal: false,
  arguments: {},
  ...extra,
});
const binding = (source, destination, destination_type = "exchange") => ({
  vhost: "/",
  source,
  destination,
  destination_type,
  routing_key: "route",
  arguments: {},
});
const outgoingQueue = label("out-queue");
const queue = label("queue");
const outExchange = label("out-exchange");
const incoming = label("incoming");
const source = label("source");
const auto = label("auto");
const parent = label("parent");
const cascade = label("cascade");
const target = label("recreated");
const denied = "bunnies-forbidden";
const definitions = {
  exchanges: [
    ...cases.map(([name, vhost, type]) => exchange(name, vhost, type)),
    exchange(special),
    ...[
      "out-queue",
      "out-exchange",
      "incoming",
      "source",
      "cascade",
      "late-out",
      "late-in",
      "recreated",
      "lost",
    ].map(name => exchange(label(name))),
    exchange(auto, "/", "direct", { auto_delete: true }),
    exchange(parent, "/", "direct", { auto_delete: true }),
    exchange(label("internal"), "/", "direct", { internal: true }),
    exchange(denied),
  ],
  queues: [
    {
      name: queue,
      vhost: "/",
      durable: true,
      auto_delete: false,
      arguments: {},
    },
  ],
  bindings: [
    binding(outgoingQueue, queue, "queue"),
    binding(outExchange, source),
    binding(source, incoming),
    binding(parent, auto),
    binding(auto, cascade),
  ],
};

async function run({
  adapter,
  fixture,
  managementPrefix,
  httpsPort,
  username,
  password,
  checks,
  api,
  noConnections,
  observations,
}) {
  const failures = [];
  const credentials = {
    username,
    password,
    trust: { mode: "custom", pem: fixture.ca },
    httpsUrl: "https://127.0.0.1:" + httpsPort + managementPrefix,
  };
  const segment = value => encodeURIComponent(value);
  const route = (name, vhost) =>
    "/api/exchanges/" + segment(vhost) + "/" + segment(name);
  const requests = [];
  function request(
    method,
    path,
    { body, ca = fixture.ca, port = httpsPort } = {},
  ) {
    return new Promise((resolve, reject) => {
      const data = body ? Buffer.from(JSON.stringify(body)) : undefined;
      const req = https.request(
        {
          hostname: "127.0.0.1",
          port,
          path: managementPrefix + path,
          method,
          ca,
          rejectUnauthorized: true,
          minVersion: "TLSv1.2",
          agent: false,
          auth: username + ":" + password,
          headers: data
            ? {
                "Content-Type": "application/json",
                "Content-Length": data.length,
              }
            : {},
        },
        res => {
          const chunks = [];
          res.on("data", chunk => chunks.push(chunk));
          res.on("error", reject);
          res.on("end", () => {
            let error;
            if (res.statusCode >= 400) {
              try {
                error = JSON.parse(Buffer.concat(chunks)).error;
              } catch {
                error = "non-json";
              }
            }
            resolve({ status: res.statusCode, ...(error ? { error } : {}) });
          });
        },
      );
      req.on("error", reject);
      req.setTimeout(5000, () => req.destroy(new Error("REQUEST_TIMEOUT")));
      req.end(data);
    });
  }
  const read = (name, vhost = "/") =>
    adapter.readManagement(
      credentials,
      { kind: "exchangeDetail", name, vhost },
      new globalThis.AbortController().signal,
    );
  async function remove(name, vhost = "/", options) {
    if (!name || name.startsWith("amq.")) throw new Error("PROTECTED");
    const path = route(name, vhost);
    const detail = await read(name, vhost);
    if (detail.exchange.internal || !types.includes(detail.exchange.type))
      throw new Error("PROTECTED");
    await options?.between?.(detail);
    return sendDelete(path, options);
  }
  async function sendDelete(path, options) {
    requests.push(path);
    return request("DELETE", path + "?if-unused=true", options);
  }
  const inventory = async () => {
    const defs = await api("definitions");
    return Object.fromEntries(
      ["exchanges", "queues", "bindings"].map(key => [
        key,
        defs[key].map(row => JSON.stringify(row)).sort(),
      ]),
    );
  };
  const matches = (raw, name, vhost = "/") => {
    const row = JSON.parse(raw);
    return row.name === name && row.vhost === vhost;
  };
  const projection = (before, names = [], edges = []) => ({
    ...before,
    exchanges: before.exchanges.filter(
      row => !names.some(([name, vhost]) => matches(row, name, vhost)),
    ),
    bindings: before.bindings.filter(raw => {
      const row = JSON.parse(raw);
      return !edges.some(
        ([source, destination]) =>
          row.vhost === "/" &&
          row.source === source &&
          row.destination === destination,
      );
    }),
  });
  async function check(scenario, fn) {
    const start = requests.length;
    const record = { scenario };
    try {
      await fn(record);
      checks.push(scenario);
    } catch (error) {
      failures.push({
        check: scenario,
        diagnostic: String(error.message).replaceAll(password, "[REDACTED]"),
      });
    }
    record.deleteAttempts = requests.length - start;
    observations.push(record);
  }

  for (const [name, vhost, type] of cases)
    await check("unused-" + type, async record => {
      const before = await inventory();
      record.response = await remove(name, vhost);
      assert.ok([200, 204].includes(record.response.status));
      assert.deepEqual(await inventory(), projection(before, [[name, vhost]]));
      record.effect = "only exact exchange removed";
    });
  for (const name of [outgoingQueue, outExchange])
    await check(name, async record => {
      const before = await inventory();
      record.response = await remove(name);
      assert.ok(record.response.status >= 400);
      assert.deepEqual(await inventory(), before);
      record.effect = "exchange and topology preserved";
    });
  await check("incoming-only", async record => {
    const before = await inventory();
    record.response = await remove(incoming);
    assert.ok([200, 204].includes(record.response.status));
    assert.deepEqual(
      await inventory(),
      projection(before, [[incoming]], [[source, incoming]]),
    );
    record.effect = "target and incoming binding removed";
  });
  await check("incoming-only-auto-delete-chain", async record => {
    const before = await inventory();
    record.response = await remove(cascade);
    assert.ok([200, 204].includes(record.response.status));
    const after = await inventory();
    record.removed = before.exchanges
      .filter(row => !after.exchanges.includes(row))
      .map(row => JSON.parse(row).name);
    assert.deepEqual(
      after,
      projection(
        before,
        [[cascade], [auto], [parent]],
        [
          [parent, auto],
          [auto, cascade],
        ],
      ),
    );
  });
  for (const outgoing of [true, false])
    await check(outgoing ? "late-outgoing" : "late-incoming", async record => {
      const name = label(outgoing ? "late-out" : "late-in");
      let before;
      record.response = await remove(name, "/", {
        between: async () => {
          const from = outgoing ? name : source;
          const to = outgoing ? source : name;
          assert.equal(
            (
              await request(
                "POST",
                "/api/bindings/%2F/e/" + segment(from) + "/e/" + segment(to),
                { body: { routing_key: "late", arguments: {} } },
              )
            ).status,
            201,
          );
          before = await inventory();
        },
      });
      assert.ok(
        outgoing
          ? record.response.status >= 400
          : [200, 204].includes(record.response.status),
      );
      assert.deepEqual(
        await inventory(),
        outgoing ? before : projection(before, [[name]], [[source, name]]),
      );
    });
  await check("same-name-recreated-after-read", async record => {
    let before;
    record.response = await remove(target, "/", {
      between: async detail => {
        assert.equal(detail.exchange.type, "direct");
        assert.ok(
          [200, 204].includes(
            (await request("DELETE", route(target, "/") + "?if-unused=true"))
              .status,
          ),
        );
        assert.equal(
          (
            await request("PUT", route(target, "/"), {
              body: {
                type: "topic",
                durable: true,
                auto_delete: false,
                internal: false,
                arguments: {},
              },
            })
          ).status,
          201,
        );
        assert.equal((await read(target)).exchange.type, "topic");
        before = await inventory();
      },
    });
    assert.ok([200, 204].includes(record.response.status));
    assert.deepEqual(await inventory(), projection(before, [[target]]));
    record.effect = "replacement topic deleted after read of original direct";
  });
  await check("absent-target", async record => {
    const before = await inventory();
    await assert.rejects(read(label("absent")), { code: "NOT_FOUND" });
    record.response = await sendDelete(route(label("absent"), "/"));
    assert.equal(record.response.status, 404);
    assert.deepEqual(await inventory(), before);
  });
  await check("insufficient-configure", async record => {
    const before = await inventory();
    record.response = await remove(denied);
    assert.ok([401, 403].includes(record.response.status));
    assert.deepEqual(await inventory(), before);
  });
  await check("untrusted-tls", async record => {
    const before = await inventory();
    await assert.rejects(remove(label("lost"), "/", { ca: null }), error =>
      /CERT|ISSUER|VERIFY/.test(error.code),
    );
    assert.deepEqual(await inventory(), before);
    record.effect = "TLS rejected before HTTP write";
  });
  await check("local-protection", async () => {
    const start = requests.length;
    for (const name of ["", "amq.default", "amq.topic", label("internal")])
      await assert.rejects(remove(name), /PROTECTED/);
    for (const name of [".", "..", "x\n"])
      await assert.rejects(remove(name), { code: "EXCHANGE_SEGMENT" });
    assert.equal(requests.length, start);
  });
  await check("lost-response-no-replay", async record => {
    const name = label("lost");
    const path = route(name, "/") + "?if-unused=true";
    const before = await inventory();
    let forwarded = 0;
    let proxyError;
    const proxy = https.createServer(
      { key: fixture.key, cert: fixture.cert },
      (req, res) => {
        if (
          req.method !== "DELETE" ||
          req.url !== managementPrefix + path ||
          forwarded
        ) {
          res.writeHead(400).end();
          return;
        }
        forwarded++;
        void request("DELETE", path)
          .then(response => {
            record.brokerResponse = response;
          })
          .catch(error => {
            proxyError = error;
          })
          .finally(() => res.destroy());
      },
    );
    await new Promise((resolve, reject) =>
      proxy.once("error", reject).listen(0, "127.0.0.1", resolve),
    );
    try {
      await assert.rejects(remove(name, "/", { port: proxy.address().port }), {
        code: "ECONNRESET",
      });
      if (proxyError) throw proxyError;
      assert.equal(forwarded, 1);
      assert.equal(record.brokerResponse.status, 204);
      assert.deepEqual(await inventory(), projection(before, [[name]]));
      record.effect =
        "observer found target absent after one attempt with no HTTP response at client";
    } finally {
      proxy.closeAllConnections();
      await new Promise(resolve => proxy.close(resolve));
    }
  });
  await check("no-retained-amqp-connections-or-channels", noConnections);
  return failures;
}
module.exports = { definitions, run };
