const assert = require("node:assert/strict");
const { createServer } = require("node:https");

const accounts = [
  "bunnies-declare",
  "bunnies-declare-no-read",
  "bunnies-declare-no-write",
];
const exchange = "bunnies-dlx";
const guardQueue = "bunnies-preserve";
const exchanges = [
  {
    name: exchange,
    vhost: "/",
    type: "direct",
    durable: true,
    auto_delete: false,
    internal: false,
    arguments: {},
  },
];
const queues = [
  {
    name: "bunnies-new-auto-delete",
    vhost: "/",
    durable: true,
    auto_delete: true,
    arguments: {},
  },
  {
    name: guardQueue,
    vhost: "/",
    durable: true,
    auto_delete: false,
    arguments: {},
  },
  {
    name: "bunnies-new-homonym",
    vhost: "/",
    durable: true,
    auto_delete: false,
    arguments: { "x-message-ttl": 2500 },
  },
];
function permissions(vhosts) {
  return vhosts
    .filter(vhost => vhost !== "negado")
    .flatMap(vhost =>
      accounts.map(user => ({
        user,
        vhost,
        configure: "^bunnies-new-",
        write: user.endsWith("no-write")
          ? "^no-resources$"
          : "^(bunnies-dlx|amq\\.default)$",
        read: user.endsWith("no-read") ? "^no-resources$" : "^bunnies-new-",
      })),
    );
}
const declaration = (name, type = "classic", args = {}) => ({
  name,
  type,
  arguments: args,
});
const signal = () => new globalThis.AbortController().signal;
const json = (res, value, status = 200) => {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(value));
};
async function run({
  adapter,
  fixture,
  httpsPort,
  managementPrefix,
  password,
  checks,
  api,
  noConnections,
  relaxed,
}) {
  const input = {
    httpsUrl: `https://127.0.0.1:${httpsPort}${managementPrefix}`,
    username: accounts[0],
    password,
    trust: { mode: "custom", pem: fixture.ca },
  };
  const failures = [];
  async function check(name, fn) {
    try {
      await fn();
      checks.push(name);
    } catch (error) {
      failures.push({
        check: name,
        detail: String(error.message).replaceAll(password, "[REDACTED]"),
      });
    }
  }
  const declare = (queue, vhost = "/", username = input.username) =>
    adapter.declareQueue(
      { ...input, username },
      vhost,
      queue,
      signal(),
      () => undefined,
      async () => undefined,
    );
  const observe = (name, vhost = "/") =>
    api(
      `queues/${encodeURIComponent(vhost)}/${encodeURIComponent(name)}?disable_stats=true`,
    );
  const unchanged = await observe(guardQueue);
  const oldHomonym = await observe("bunnies-new-homonym");
  const originalExchanges = (await api("exchanges")).map(x => [
    x.vhost,
    x.name,
  ]);
  const originalBindings = (await api("bindings")).filter(x => x.source !== "");
  await check(
    "declare-classic-quorum-and-verify-stored-properties",
    async () => {
      for (const type of ["classic", "quorum"]) {
        const req = declaration(`bunnies-new-${type}`, type);
        assert.equal(await declare(req), "confirmed");
        const item = await observe(req.name);
        assert.equal(item.type, type);
        assert.equal(item.durable, true);
        assert.equal(item.exclusive, false);
        assert.equal(item.auto_delete, false);
        assert.equal(item.arguments["x-message-ttl"], undefined);
      }
    },
  );
  await check("catalog-limits-zero-and-named-default-dlx", async () => {
    for (const type of ["classic", "quorum"]) {
      for (const dlx of [exchange, ""]) {
        const args = {
          "x-message-ttl": dlx ? 0 : 2_147_483_647,
          "x-max-length": dlx ? 2_147_483_647 : 0,
          "x-dead-letter-exchange": dlx,
          "x-dead-letter-routing-key": "",
        };
        const req = declaration(
          `bunnies-new-args-${type}-${dlx || "default"}`,
          type,
          args,
        );
        assert.equal(await declare(req), "confirmed");
        const stored = await observe(req.name);
        for (const [key, expected] of Object.entries(args))
          assert.equal(stored.arguments[key], expected, key);
      }
    }
  });
  await check("exact-vhosts-and-literal-queue-segments", async () => {
    for (const vhost of [
      "equipe/pedidos",
      "literal%2F",
      "área pedidos",
      "detailed",
    ]) {
      const req = declaration("bunnies-new-literal/ %2F • # ?+ ");
      assert.equal(await declare(req, vhost), "confirmed");
      const item = await observe(req.name, vhost);
      assert.equal(item.name, req.name);
      assert.equal(item.vhost, vhost);
    }
    const req = declaration("bunnies-new-homonym");
    assert.equal(await declare(req, "literal%2F"), "confirmed");
    assert.deepEqual((await observe(req.name)).arguments, oldHomonym.arguments);
  });
  await check(
    "equivalent-redeclaration-and-strict-argument-type-flag-conflicts",
    async () => {
      const req = declaration("bunnies-new-strict", "quorum", {
        "x-message-ttl": 500,
      });
      assert.equal(await declare(req), "confirmed");
      assert.equal(await declare(req), "confirmed");
      const saved = await observe(req.name);
      for (const change of [
        { ...req, type: "classic" },
        { ...req, arguments: { "x-message-ttl": 501 } },
      ])
        await assert.rejects(declare(change), {
          code: "QUEUE_DECLARATION_CONFLICT",
        });
      await assert.rejects(declare(declaration("bunnies-new-auto-delete")), {
        code: "QUEUE_DECLARATION_CONFLICT",
      });
      assert.equal(
        (await observe("bunnies-new-auto-delete")).auto_delete,
        true,
      );
      assert.deepEqual((await observe(req.name)).arguments, saved.arguments);
    },
  );
  await check(
    "unicode-conflict-server-error-leaves-old-properties",
    async () => {
      const name = "bunnies-new-pedidos/á %2F";
      const vhost = "literal%2F";
      const req = declaration(name, "quorum", { "x-message-ttl": 8000 });
      assert.equal(await declare(req, vhost), "confirmed");
      assert.equal(await declare(req, vhost), "confirmed");
      await assert.rejects(
        declare({ ...req, arguments: { "x-message-ttl": 8001 } }, vhost),
        { code: "SERVER" },
      );
      assert.equal(
        (await observe(name, vhost)).arguments["x-message-ttl"],
        8000,
      );
    },
  );
  await check(
    "relaxed-type-acceptance-still-reports-real-divergence",
    async () => {
      const req = declaration("bunnies-new-relaxed", "quorum");
      assert.equal(await declare(req), "confirmed");
      await relaxed(true);
      try {
        assert.equal(await declare({ ...req, type: "classic" }), "divergent");
        assert.equal((await observe(req.name)).type, "quorum");
      } finally {
        await relaxed(false);
      }
    },
  );
  await check(
    "minimum-configure-and-separate-dlx-read-write-permissions",
    async () => {
      await assert.rejects(
        declare(declaration("bunnies-new-denied"), "/", "bunnies-test"),
        { code: "DENIED" },
      );
      for (const user of accounts.slice(1)) {
        const req = declaration(`bunnies-new-${user}`, "classic", {
          "x-dead-letter-exchange": exchange,
        });
        await assert.rejects(declare(req, "/", user), { code: "DENIED" });
      }
    },
  );
  await check(
    "fixture-counts-invalid-input-pre-send-cancel-and-post-send-loss",
    async () => {
      let handler;
      let hits = 0;
      let puts = 0;
      const sockets = new Set();
      const server = createServer(
        { key: fixture.key, cert: fixture.cert },
        (req, res) => {
          hits++;
          if (req.method === "PUT") puts++;
          handler(req, res);
        },
      );
      server.on("connection", socket => {
        sockets.add(socket);
        socket.once("close", () => sockets.delete(socket));
      });
      await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
      const profile = {
        ...input,
        httpsUrl: `https://127.0.0.1:${server.address().port}/prefix`,
      };
      const req = declaration("bunnies-new-fixture", "quorum");
      const declareFixture = (
        value,
        abort = signal(),
        phase = () => undefined,
        vhost = "/",
        trust = profile.trust,
      ) =>
        adapter.declareQueue(
          { ...profile, trust },
          vhost,
          value,
          abort,
          phase,
          async () => undefined,
        );
      try {
        for (const value of [
          declaration("."),
          declaration(".."),
          declaration("amq.reserved"),
          declaration("a\n"),
          declaration("\ud800"),
          declaration("á".repeat(128)),
          declaration("a", "stream"),
          declaration("a", "classic", { "x-max-length": 2_147_483_648 }),
          declaration("a", "classic", { "x-dead-letter-routing-key": "" }),
          { ...req, vhost: "/" },
        ])
          await assert.rejects(declareFixture(value), { code: "VALIDATION" });
        await assert.rejects(declareFixture(req, signal(), undefined, ".."), {
          code: "QUEUE_SEGMENT",
        });
        const controller = new globalThis.AbortController();
        controller.abort();
        await assert.rejects(declareFixture(req, controller.signal), {
          code: "CANCELLED",
        });
        await assert.rejects(
          declareFixture(req, signal(), undefined, "/", { mode: "default" }),
          { code: "TLS" },
        );
        assert.equal(hits, 0);

        const stages = [];
        handler = (request, res) => {
          assert.equal(request.method, "PUT");
          assert.equal(
            request.url,
            "/prefix/api/queues/%2F/bunnies-new-fixture",
          );
          request.resume();
          request.on("end", () => res.destroy());
        };
        await assert.rejects(
          declareFixture(req, signal(), phase => stages.push(phase)),
          { code: "NETWORK" },
        );
        assert.deepEqual(stages, ["sent"]);
        assert.equal(puts, 1);

        handler = (request, res) => {
          assert.equal(request.method, "PUT");
          res.writeHead(302, { Location: "/prefix/wrong" });
          res.end();
        };
        await assert.rejects(declareFixture(req), { code: "REDIRECT" });
        assert.equal(hits, 2);

        stages.length = 0;
        handler = (request, res) => {
          if (request.method === "PUT") {
            request.resume();
            request.on("end", () => {
              res.writeHead(201);
              res.end();
            });
          } else {
            json(res, { oversized: "x".repeat(256 * 1024) });
          }
        };
        await assert.rejects(
          declareFixture(req, signal(), phase => stages.push(phase)),
          { code: "LIMIT" },
        );
        assert.deepEqual(stages, ["sent", "accepted"]);
        assert.equal(puts, 3);
        assert.equal(hits, 4);
        const pending = new globalThis.AbortController();
        stages.length = 0;
        handler = request => {
          assert.equal(request.method, "PUT");
          request.resume();
          request.on("end", () => pending.abort());
        };
        await assert.rejects(
          declareFixture(req, pending.signal, phase => stages.push(phase)),
          { code: "CANCELLED" },
        );
        assert.deepEqual(stages, ["sent"]);
        assert.equal(puts, 4);
        assert.equal(hits, 5);
      } finally {
        for (const socket of sockets) socket.destroy();
        await new Promise(resolve => server.close(resolve));
      }
    },
  );
  await check(
    "original-objects-and-no-client-channels-or-consumers",
    async () => {
      await noConnections();
      assert.deepEqual(
        (await observe(guardQueue)).arguments,
        unchanged.arguments,
      );
      assert.deepEqual(
        (await api("exchanges")).map(x => [x.vhost, x.name]),
        originalExchanges,
      );
      assert.deepEqual(
        (await api("bindings")).filter(x => x.source !== ""),
        originalBindings,
      );
      assert.equal((await api("consumers")).length, 0);
      const overview = await api("overview");
      assert.equal(overview.object_totals.channels, 0);
      assert.equal(overview.churn_rates?.channel_created ?? 0, 0);
    },
  );
  return failures;
}
module.exports = { accounts, exchanges, queues, permissions, run };
