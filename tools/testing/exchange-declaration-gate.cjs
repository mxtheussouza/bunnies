const assert = require("node:assert/strict");
const https = require("node:https");

const name = "bunnies-new-homônimo /%2F #?";
const declaration = (
  name,
  type = "direct",
  durable = true,
  autoDelete = false,
) => ({ name, type, durable, autoDelete });
const seed = (name, vhost, extra = {}) => ({
  name,
  vhost,
  type: "direct",
  durable: true,
  auto_delete: false,
  internal: false,
  arguments: {},
  ...extra,
});
const definitions = {
  exchanges: [
    seed(name, "/", { type: "headers" }),
    seed("bunnies-new-internal", "/", { internal: true }),
    seed("bunnies-new-arguments", "/", { arguments: { marker: "existing" } }),
  ],
  queues: [
    {
      vhost: "/",
      name: "bunnies-guard",
      durable: true,
      auto_delete: false,
      arguments: {},
    },
  ],
  bindings: [
    {
      vhost: "/",
      source: name,
      destination: "bunnies-guard",
      destination_type: "queue",
      routing_key: "x",
      arguments: {},
    },
  ],
};

async function run({
  adapter,
  fixture,
  httpsPort,
  managementPrefix,
  password,
  username,
  checks,
  observations,
  api,
  noConnections,
}) {
  const failures = [];
  let trace = [];
  // Fixed loopback upstream, using only this fixture's CA. Retain status and broker
  // error tags for the gate report. Credentials and headers stay out of the trace.
  const proxy = https.createServer(
    { key: fixture.key, cert: fixture.cert },
    (req, res) => {
      const upstream = https.request(
        {
          hostname: "127.0.0.1",
          port: httpsPort,
          path: req.url,
          method: req.method,
          headers: req.headers,
          ca: fixture.ca,
        },
        response => {
          const chunks = [];
          response.on("data", chunk => chunks.push(chunk));
          response.on("end", () => {
            const bytes = Buffer.concat(chunks);
            let errorTag;
            if (response.statusCode >= 400) {
              try {
                errorTag = JSON.parse(bytes).error;
              } catch {
                errorTag = "invalid";
              }
            }
            trace.push({
              method: req.method,
              status: response.statusCode,
              ...(errorTag ? { errorTag } : {}),
            });
            res.writeHead(response.statusCode, response.headers);
            res.end(bytes);
          });
        },
      );
      upstream.on("error", () => res.destroy());
      req.pipe(upstream);
    },
  );
  await new Promise((resolve, reject) =>
    proxy.once("error", reject).listen(0, "127.0.0.1", resolve),
  );
  const profile = {
    httpsUrl: "https://127.0.0.1:" + proxy.address().port + managementPrefix,
    username,
    password,
    trust: { mode: "custom", pem: fixture.ca },
  };
  const declare = (req, vhost = "/", fields = {}) =>
    adapter.declareExchange(
      { ...profile, ...fields },
      vhost,
      req,
      new globalThis.AbortController().signal,
      () => {},
      async () => {},
    );
  const observe = (name, vhost = "/") =>
    api(
      "exchanges/" +
        encodeURIComponent(vhost) +
        "/" +
        encodeURIComponent(name) +
        "?disable_stats=true",
    );
  async function check(label, fn) {
    trace = [];
    try {
      await fn();
      checks.push(label);
    } catch (error) {
      failures.push({
        check: label,
        detail: String(error.message).replaceAll(password, "[REDACTED]"),
      });
    }
    observations.push({ scenario: label, requests: trace });
  }
  try {
    const before = await api("definitions");
    for (const type of ["direct", "topic", "fanout", "headers"]) {
      for (const durable of [true, false])
        for (const autoDelete of [true, false]) {
          const req = declaration(
            "bunnies-new-" + [type, durable, autoDelete].join("-"),
            type,
            durable,
            autoDelete,
          );
          await check(req.name, async () => {
            assert.equal(await declare(req), "confirmed");
            const item = await observe(req.name);
            assert.deepEqual(
              [
                item.vhost,
                item.name,
                item.type,
                item.durable,
                item.auto_delete,
                item.internal,
                item.arguments,
              ],
              ["/", req.name, type, durable, autoDelete, false, {}],
            );
            assert.deepEqual(
              trace.map(row => row.method),
              ["PUT", "GET"],
            );
          });
        }
    }
    await check("equivalent-and-conflicts", async () => {
      const req = declaration("bunnies-new-fanout-true-false", "fanout");
      assert.equal(await declare(req), "confirmed");
      for (const diff of [
        { type: "topic" },
        { durable: false },
        { autoDelete: true },
        { name: "bunnies-new-internal", type: "direct" },
      ])
        await assert.rejects(declare({ ...req, ...diff }), {
          code: "EXCHANGE_DECLARATION_CONFLICT",
        });
      const item = await observe(req.name);
      assert.deepEqual(
        [item.type, item.durable, item.auto_delete],
        ["fanout", true, false],
      );
      assert.equal((await observe("bunnies-new-internal")).internal, true);
    });
    await check("external-argument-detected-and-preserved", async () => {
      const result = await declare(declaration("bunnies-new-arguments")).catch(
        e => e.code,
      );
      assert.ok(
        ["divergent", "EXCHANGE_DECLARATION_CONFLICT"].includes(result),
        result,
      );
      assert.deepEqual((await observe("bunnies-new-arguments")).arguments, {
        marker: "existing",
      });
    });
    await check("vhost-name-encoding-and-homonyms", async () => {
      for (const vhost of ["detailed", "literal%2F", "equipe/pedidos"]) {
        assert.equal(
          await declare(declaration(name, "topic"), vhost),
          "confirmed",
        );
        assert.equal((await observe(name, vhost)).type, "topic");
      }
      assert.equal((await observe(name)).type, "headers");
    });
    await check(
      "unicode-fixture-conflict-server-error-no-replay-target-preserved",
      async () => {
        await assert.rejects(declare(declaration(name, "fanout")), {
          code: "SERVER",
        });
        assert.deepEqual(
          trace.map(({ method, status }) => [method, status]),
          [["PUT", 500]],
        );
        assert.equal((await observe(name)).type, "headers");
      },
    );
    await check("reserved-or-invalid-input-before-io", async () => {
      for (const name of [
        "",
        "amq.default",
        "amq.topic",
        ".",
        "..",
        "a".repeat(256),
        "x\n",
        "\ud800",
      ])
        await assert.rejects(declare(declaration(name)), {
          code: "VALIDATION",
        });
      for (const vhost of ["", ".", "..", "x\n"])
        await assert.rejects(declare(declaration(name), vhost), {
          code: "EXCHANGE_SEGMENT",
        });
      assert.equal(trace.length, 0);
    });
    await check(
      "cancellation-at-send-authorization-transmits-zero-puts",
      async () => {
        const controller = new globalThis.AbortController();
        const phases = [];
        let authorizations = 0;
        await assert.rejects(
          adapter.declareExchange(
            profile,
            "/",
            declaration("bunnies-new-cancelled"),
            controller.signal,
            phase => phases.push(phase),
            async () => {
              if (++authorizations === 2) controller.abort();
            },
          ),
          { code: "CANCELLED" },
        );
        assert.equal(authorizations, 2);
        assert.deepEqual(phases, []);
        assert.deepEqual(trace, []);
      },
    );
    await check("configure-denied", async () => {
      await assert.rejects(declare(declaration("bunnies-forbidden")), {
        code: "DENIED",
      });
      assert.deepEqual(
        trace.map(row => row.method),
        ["PUT"],
      );
    });
    await check("tls-fails-before-io", async () => {
      await assert.rejects(
        declare(declaration(name), "/", { trust: { mode: "system" } }),
        { code: "TLS" },
      );
      assert.equal(trace.length, 0);
    });
    await check("only-declared-targets-and-no-product-channels", async () => {
      const after = await api("definitions");
      for (const kind of ["queues", "bindings"])
        assert.deepEqual(after[kind], before[kind]);
      const key = x => JSON.stringify([x.name, x.vhost]);
      for (const row of before.exchanges)
        assert.deepEqual(
          after.exchanges.find(x => key(x) === key(row)),
          row,
        );
      const expected = new Set(before.exchanges.map(key));
      for (const type of ["direct", "topic", "fanout", "headers"])
        for (const durable of [true, false])
          for (const autoDelete of [true, false])
            expected.add(
              key({
                vhost: "/",
                name: "bunnies-new-" + [type, durable, autoDelete].join("-"),
              }),
            );
      for (const vhost of ["detailed", "literal%2F", "equipe/pedidos"])
        expected.add(key({ vhost, name }));
      assert.deepEqual(new Set(after.exchanges.map(key)), expected);
      await noConnections();
    });
  } finally {
    proxy.closeAllConnections();
    await new Promise(resolve => proxy.close(resolve));
  }
  return failures;
}

module.exports = { definitions, run };
