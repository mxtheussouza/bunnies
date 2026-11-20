const assert = require("node:assert/strict");
const { createServer, request } = require("node:https");
const { setTimeout: delay } = require("node:timers/promises");
const { connect } = require("amqplib");

const observer = "bunnies-observer";
const exchange = "bunnies-purge-exchange";
const specialName = "bunnies-purge-área/ %2F #?";
const queueRoute = (vhost, name) =>
  `queues/${encodeURIComponent(vhost)}/${encodeURIComponent(name)}`;
const signal = () => new globalThis.AbortController().signal;

function permissions(vhosts, includeResourceDenial) {
  const rules = vhosts
    .filter(vhost => vhost !== "negado")
    .map(vhost => ({
      user: observer,
      vhost,
      configure: ".*",
      write: ".*",
      read: ".*",
    }));
  if (includeResourceDenial)
    rules.push({
      user: "bunnies-denied",
      vhost: "/",
      configure: "^$",
      write: "^$",
      read: "^$",
    });
  return rules;
}

async function withObserver(
  { amqpsPort, fixture, observerPassword },
  vhost,
  run,
) {
  const connection = await connect(
    {
      protocol: "amqps",
      hostname: "127.0.0.1",
      port: amqpsPort,
      username: observer,
      password: observerPassword,
      vhost: encodeURIComponent(vhost),
      heartbeat: 10,
    },
    { ca: fixture.ca },
  );
  try {
    const channel = await connection.createConfirmChannel();
    try {
      return await run(channel);
    } finally {
      await channel.close();
    }
  } finally {
    await connection.close();
  }
}

async function publish(channel, name, text) {
  channel.sendToQueue(name, Buffer.from(text), { persistent: true });
  await channel.waitForConfirms();
}

async function run(config) {
  const {
    adapter,
    fixture,
    httpsPort,
    managementPrefix,
    username,
    password,
    observerPassword,
    checks,
    api,
    noConnections,
    observations,
  } = config;
  const input = {
    httpsUrl: `https://127.0.0.1:${httpsPort}${managementPrefix}`,
    username,
    password,
    trust: { mode: "custom", pem: fixture.ca },
  };
  const failures = [];
  async function check(label, action) {
    try {
      await action();
      checks.push(label);
    } catch (error) {
      failures.push({
        check: label,
        detail: String(error.message)
          .replaceAll(password, "[REDACTED]")
          .replaceAll(observerPassword, "[REDACTED]"),
      });
    }
  }
  const inspect = (name, vhost = "/", user = username) =>
    adapter.inspectPurgeQueue(
      { ...input, username: user },
      vhost,
      name,
      signal(),
    );
  const purge = (name, vhost = "/", user = username) =>
    adapter.purgeQueue(
      { ...input, username: user },
      vhost,
      name,
      signal(),
      () => undefined,
      async () => undefined,
    );
  const withChannel = (vhost, fn) => withObserver(config, vhost, fn);
  function observeDelete(name, accept) {
    const url = `${input.httpsUrl}/api/${queueRoute("/", name)}/contents`;
    return new Promise((resolve, reject) => {
      const req = request(
        url,
        {
          method: "DELETE",
          headers: { Accept: accept },
          auth: `${username}:${password}`,
          ca: fixture.ca,
          agent: false,
        },
        res => {
          let body = "";
          res.setEncoding("utf8");
          res.on("data", chunk => {
            if (body.length < 512) body += chunk.slice(0, 512 - body.length);
          });
          res.on("end", () =>
            resolve({
              status: res.statusCode,
              contentType: res.headers["content-type"],
              body,
            }),
          );
          res.on("error", reject);
        },
      );
      req.setTimeout(3000, () =>
        req.destroy(new Error("Purge diagnostic timeout")),
      );
      req.on("error", reject);
      req.end();
    });
  }
  async function awaitCounts(name, expected) {
    const columns = Object.keys(expected).join(",");
    let actual;
    for (let attempt = 0; attempt < 70; attempt++) {
      actual = await api(`${queueRoute("/", name)}?columns=${columns}`);
      if (
        Object.entries(expected).every(
          ([field, count]) => actual[field] === count,
        )
      )
        return actual;
      await delay(200);
    }
    assert.deepEqual(actual, expected);
  }

  await check("purge-content-negotiation", () =>
    withChannel("/", async channel => {
      const name = "bunnies-purge-media-type";
      await channel.assertQueue(name, { durable: true });
      const { status } = await observeDelete(name, "application/json");
      observations.jsonOnlyStatus = status;
      assert.equal(status, 406);
      await purge(name);
    }),
  );

  for (const type of ["classic", "quorum"])
    await check(`${type}-purge-ready-preserves-unacked-queue-and-binding`, () =>
      withChannel("/", async channel => {
        const name = `bunnies-purge-${type}`;
        await channel.assertExchange(exchange, "direct", { durable: true });
        await channel.assertQueue(name, {
          durable: true,
          arguments: { "x-queue-type": type },
        });
        await channel.bindQueue(name, exchange, name);
        await publish(channel, name, "unacknowledged");
        await publish(channel, name, "ready");
        const delivery = await channel.get(name, { noAck: false });
        assert.equal(delivery.content.toString(), "unacknowledged");
        const binding = () => api(`${queueRoute("/", name)}/bindings`);
        const beforeBindings = await binding();
        assert.ok(beforeBindings.some(item => item.source === exchange));
        assert.equal(await inspect(name), type);
        await awaitCounts(name, {
          messages_ready: 1,
          messages_unacknowledged: 1,
        });
        await purge(name);
        await awaitCounts(name, {
          messages_ready: 0,
          messages_unacknowledged: 1,
        });
        assert.deepEqual(await binding(), beforeBindings);
        channel.nack(delivery, false, true);
        const redelivery = await channel.get(name, { noAck: true });
        assert.equal(redelivery.content.toString(), "unacknowledged");
        assert.equal(redelivery.fields.redelivered, true);
        assert.equal(await channel.get(name, { noAck: true }), false);
        await purge(name);
        assert.equal((await channel.checkQueue(name)).messageCount, 0);
      }),
    );

  await check("quorum-purge-removes-delayed-and-pending-dead-lettered", () =>
    withChannel("/", async channel => {
      const name = "bunnies-purge-quorum-pending";
      await channel.assertQueue(name, {
        durable: true,
        arguments: {
          "x-queue-type": "quorum",
          "x-delayed-retry-type": "all",
          "x-delayed-retry-min": 120_000,
          "x-delayed-retry-max": 120_000,
          "x-dead-letter-strategy": "at-least-once",
          "x-overflow": "reject-publish",
          "x-dead-letter-exchange": "bunnies-purge-absent-exchange",
        },
      });
      await publish(channel, name, "delayed");
      const retry = await channel.get(name, { noAck: false });
      assert.equal(retry.content.toString(), "delayed");
      channel.nack(retry, false, true);
      await publish(channel, name, "dead-lettered");
      const deadLetter = await channel.get(name, { noAck: false });
      assert.equal(deadLetter.content.toString(), "dead-lettered");
      channel.nack(deadLetter, false, false);
      observations.pendingBefore = await awaitCounts(name, {
        messages_ready: 0,
        messages_unacknowledged: 0,
        messages_delayed: 1,
        messages_dlx: 1,
      });
      assert.equal(await inspect(name), "quorum");
      await purge(name);
      observations.pendingAfter = await awaitCounts(name, {
        messages_ready: 0,
        messages_unacknowledged: 0,
        messages_delayed: 0,
        messages_dlx: 0,
      });
    }),
  );

  await check(
    "vhost-detail-literal-segments-and-untouched-homonym",
    async () => {
      for (const vhost of [
        "/",
        "equipe/pedidos",
        "literal%2F",
        "área pedidos",
        "detailed",
      ])
        await withChannel(vhost, async channel => {
          await channel.assertQueue(specialName, { durable: true });
          await publish(channel, specialName, "exact-target");
          assert.equal(await inspect(specialName, vhost), "classic");
          if (vhost !== "/") {
            await purge(specialName, vhost);
            assert.equal(
              await channel.get(specialName, { noAck: true }),
              false,
            );
          }
        });
      await withChannel("/", async channel => {
        const untouched = await channel.get(specialName, { noAck: true });
        assert.equal(untouched.content.toString(), "exact-target");
      });
    },
  );

  await check("missing-queue-and-no-read-permission", () =>
    withChannel("/", async channel => {
      const name = "bunnies-purge-missing";
      await channel.assertQueue(name, { durable: true });
      await publish(channel, name, "held");
      assert.equal(await inspect(name, "/", "bunnies-denied"), "classic");
      await assert.rejects(purge(name, "/", "bunnies-denied"), {
        code: "DENIED",
      });
      assert.equal((await channel.checkQueue(name)).messageCount, 1);
      await channel.deleteQueue(name);
      observations.missing = await observeDelete(name, "*/*");
      await assert.rejects(purge(name), { code: "NOT_FOUND" });
    }),
  );
  await check("stream-ineligible-and-replacement-rejected-by-broker", () =>
    withChannel("/", async channel => {
      const name = "bunnies-purge-replaced";
      await channel.assertQueue(name, { durable: true });
      assert.equal(await inspect(name), "classic");
      await channel.deleteQueue(name);
      await channel.assertQueue(name, {
        durable: true,
        arguments: { "x-queue-type": "stream" },
      });
      await assert.rejects(inspect(name), { code: "QUEUE_PURGE_TYPE" });
      await assert.rejects(purge(name), { code: "QUEUE_PURGE_TYPE" });
      const item = await api(`${queueRoute("/", name)}?columns=type`);
      assert.equal(item.type, "stream");
    }),
  );
  await check("bounded-tls-delete-exactly-once", () =>
    exerciseTransport(adapter, input, fixture),
  );
  await check("observer-connections-and-channels-drained", noConnections);
  return failures;
}

async function exerciseTransport(adapter, input, fixture) {
  const requests = [];
  let respond;
  const server = createServer(
    { key: fixture.key, cert: fixture.cert },
    (req, res) => {
      const chunks = [];
      req.on("data", chunk => chunks.push(chunk));
      req.on("end", () => {
        requests.push({
          method: req.method,
          url: req.url,
          bytes: Buffer.concat(chunks).length,
        });
        respond(req, res);
      });
    },
  );
  const sockets = new Set();
  server.on("connection", socket => {
    sockets.add(socket);
    socket.once("close", () => sockets.delete(socket));
  });
  await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
  const profile = {
    ...input,
    httpsUrl: `https://127.0.0.1:${server.address().port}/prefix`,
  };
  let sent = 0;
  const purge = ({
    abort = signal(),
    trust = profile.trust,
    name = specialName,
    authorize = async () => undefined,
  } = {}) =>
    adapter.purgeQueue(
      { ...profile, trust },
      "literal%2F",
      name,
      abort,
      () => sent++,
      authorize,
    );
  try {
    const beforeSend = new globalThis.AbortController();
    await assert.rejects(
      purge({
        abort: beforeSend.signal,
        authorize: async () => beforeSend.abort(),
      }),
      { code: "CANCELLED" },
    );
    await assert.rejects(purge({ trust: { mode: "default" } }), {
      code: "TLS",
    });
    for (const name of [".", "..", "a\n", "\ud800", "á".repeat(128)])
      await assert.rejects(purge({ name }), { code: "QUEUE_SEGMENT" });
    assert.equal(sent, 0);
    assert.deepEqual(requests, []);

    respond = (req, res) => res.destroy();
    await assert.rejects(purge(), { code: "NETWORK" });
    assert.equal(sent, 1);

    respond = (req, res) => {
      res.writeHead(302, { Location: "/wrong" });
      res.end();
    };
    await assert.rejects(purge(), { code: "REDIRECT" });

    const afterSend = new globalThis.AbortController();
    respond = () => afterSend.abort();
    await assert.rejects(purge({ abort: afterSend.signal }), {
      code: "CANCELLED",
    });

    respond = (req, res) => {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ reason: "x".repeat(256 * 1024) }));
    };
    await assert.rejects(purge(), { code: "LIMIT" });
    assert.deepEqual(
      requests,
      Array.from({ length: 4 }, () => ({
        method: "DELETE",
        url: `/prefix/api/${queueRoute("literal%2F", specialName)}/contents`,
        bytes: 0,
      })),
    );
    assert.equal(sent, 4);
  } finally {
    for (const socket of sockets) socket.destroy();
    await new Promise(resolve => server.close(resolve));
  }
}

async function seedMatrix(config) {
  for (const vhost of ["/", "literal%2F", "detailed"])
    await withObserver(config, vhost, async channel => {
      await channel.assertQueue(specialName, {
        durable: true,
        arguments: {
          "x-queue-type": vhost === "detailed" ? "quorum" : "classic",
        },
      });
      await publish(channel, specialName, "fixture-ready");
      if (vhost === "literal%2F") {
        await channel.assertQueue("fila-fora-da-permissao", { durable: true });
        await publish(channel, "fila-fora-da-permissao", "untouched");
      }
    });
}

module.exports = { permissions, run, seedMatrix, specialName, queueRoute };
