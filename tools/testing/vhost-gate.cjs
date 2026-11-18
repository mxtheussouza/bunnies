const assert = require("node:assert/strict");
const { createConnection, createServer } = require("node:net");
const { once } = require("node:events");
const { setTimeout: delay } = require("node:timers/promises");

async function startPartitionRelay(port) {
  let partitioned = false;
  let attempts = 0;
  const sockets = new Set();
  const server = createServer(client => {
    attempts++;
    const upstream = createConnection({ host: "127.0.0.1", port });
    for (const socket of [client, upstream]) {
      sockets.add(socket);
      socket.on("error", () => socket.destroy());
      socket.once("close", () => sockets.delete(socket));
    }
    client.on("data", data => {
      if (!partitioned) upstream.write(data);
    });
    upstream.on("data", data => {
      if (!partitioned) client.write(data);
    });
    client.once("close", () => {
      if (!partitioned) upstream.destroy();
    });
    upstream.once("close", () => client.destroy());
  });
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  return {
    port: server.address().port,
    partition: () => {
      partitioned = true;
    },
    socketCount: () => sockets.size,
    attemptCount: () => attempts,
    async cleanup() {
      for (const socket of sockets) socket.destroy();
      await new Promise(resolve => server.close(resolve));
    },
  };
}

async function runVhostGate({
  managementAdapter,
  amqpsAdapter,
  SwitchGuard,
  amqpsPort,
  httpsPort,
  fixture,
  username,
  password,
  vhosts,
  checks,
  report,
  api,
  noConnections,
  liveConnections,
}) {
  report.failures = [];
  const trust = { mode: "custom", pem: fixture.ca };
  const controllers = new Set();
  async function open(vhost, user = username, port = amqpsPort, guard) {
    const controller = new globalThis.AbortController();
    controllers.add(controller);
    const deadline = setTimeout(() => controller.abort(), 15000);
    try {
      const handle = await amqpsAdapter.openAmqpsConnection(
        {
          amqpsUrl: SwitchGuard
            ? `amqps://127.0.0.1:${port}`
            : `amqps://127.0.0.1:${port}/${encodeURIComponent(vhost)}`,
          username: user,
          password,
          trust,
        },
        controller.signal,
        undefined,
        SwitchGuard
          ? { vhost, onHandshakeStart: () => guard?.handshakeStarted() }
          : undefined,
      );
      return {
        async close() {
          try {
            return await handle.close();
          } finally {
            controller.abort();
            controllers.delete(controller);
          }
        },
        destroy() {
          handle.destroy();
          controller.abort();
          controllers.delete(controller);
        },
      };
    } catch (error) {
      controller.abort();
      controllers.delete(controller);
      throw error;
    } finally {
      clearTimeout(deadline);
    }
  }
  async function expectBrokerVhost(vhost) {
    assert.deepEqual(await liveConnections(), [{ vhost, channels: 0 }]);
  }
  async function check(id, task) {
    try {
      await task();
      checks.push(id);
    } catch (error) {
      report.failures.push({
        id,
        code: typeof error.code === "string" ? error.code : "UNEXPECTED_ERROR",
      });
      throw error;
    }
  }

  let relay;
  try {
    await check("exact-vhosts-and-confirmed-close", async () => {
      const guard = SwitchGuard && new SwitchGuard();
      let connection = await open("equipe/pedidos", username, amqpsPort, guard);
      await expectBrokerVhost("equipe/pedidos");
      for (const vhost of vhosts.filter(name => name !== "negado")) {
        assert.equal(
          await (guard ? guard.retire(connection) : connection.close()),
          true,
        );
        connection = await open(vhost, username, amqpsPort, guard);
        await expectBrokerVhost(vhost);
      }
      assert.equal(await connection.close(), true);
    });
    await check("visible-vhost-without-amqp-permission", async () => {
      const monitor = "bunnies-monitor";
      const list = await managementAdapter.readManagement(
        {
          httpsUrl: `https://127.0.0.1:${httpsPort}`,
          username: monitor,
          password,
          trust,
        },
        { kind: "vhosts", vhost: "/" },
        globalThis.AbortSignal.timeout(10000),
      );
      assert.ok(list.names.includes("negado"));
      const connection = await open("/", monitor);
      await expectBrokerVhost("/");
      assert.equal(await connection.close(), true);
      await assert.rejects(open("negado", monitor), { code: "AMQP_REFUSED" });
    });
    await check("no-overlap-after-unconfirmed-close", async () => {
      relay = await startPartitionRelay(amqpsPort);
      const guard = SwitchGuard && new SwitchGuard();
      const original = await open("/", username, relay.port, guard);
      await expectBrokerVhost("/");
      relay.partition();
      const startedAt = Date.now();
      const mayContinue = await (guard
        ? guard.retire(original)
        : original.close());
      assert.equal(mayContinue, false);
      for (
        let attempt = 0;
        attempt < 20 && relay.socketCount() === 2;
        attempt++
      )
        await delay(25);
      assert.equal(
        relay.socketCount(),
        1,
        "Only the broker-side socket remains",
      );
      const before = await liveConnections();
      assert.deepEqual(
        before.map(row => row.vhost),
        ["/"],
      );
      if (guard) {
        assert.equal(guard.blocked, true);
        assert.equal(await guard.retire(), false);
        report.partition = {
          localCloseConfirmed: false,
          elapsedMs: Date.now() - startedAt,
          after: before.map(row => row.vhost),
          channels: before[0].channels,
          replacementOpened: mayContinue,
        };
        return;
      }
      const replacement = await open("equipe/pedidos");
      try {
        const connections = await liveConnections();
        const observed = connections.map(row => row.vhost).sort();
        report.partition = {
          localCloseConfirmed: false,
          elapsedMs: Date.now() - startedAt,
          before: before.map(row => row.vhost),
          after: observed,
          channels: connections.reduce((total, row) => total + row.channels, 0),
        };
        assert.equal(report.partition.channels, 0);
        assert.ok(observed.includes("equipe/pedidos"));
        assert.equal(observed.length, 1);
      } finally {
        await replacement.close();
      }
    });
    if (SwitchGuard)
      await check(
        "pending-handshake-without-remote-proof-blocks-switch",
        async () => {
          await relay.cleanup();
          relay = await startPartitionRelay(amqpsPort);
          const guard = new SwitchGuard();
          // The broker opened the connection, but the session has not obtained
          // a handle yet. Keep the adapter handle only to simulate cancellation.
          const unreleased = await open("/", username, relay.port, guard);
          await expectBrokerVhost("/");
          relay.partition();
          unreleased.destroy();
          assert.equal(await guard.retire(), false);
          assert.equal(await guard.retire(), false);
          await expectBrokerVhost("/");
        },
      );
  } catch (error) {
    if (report.failures.length === 0) throw error;
  } finally {
    for (const controller of controllers) controller.abort();
    await relay?.cleanup();
    await noConnections();
    assert.equal((await api("queues")).length, 0);
    assert.equal((await api("consumers")).length, 0);
    checks.push("zero-connections-channels-queues-consumers-after-cleanup");
  }
}

module.exports = { runVhostGate, startPartitionRelay };
