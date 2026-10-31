const assert = require("node:assert/strict");
const { mkdtemp, rm } = require("node:fs/promises");
const { tmpdir } = require("node:os");
const path = require("node:path");
const { createServer } = require("node:https");
const webpack = require("webpack");
async function prepareManagementGate() {
  const root = await mkdtemp(path.join(tmpdir(), "bunnies-management-build-"));
  try {
    await new Promise((resolve, reject) => {
      const compiler = webpack({
        mode: "development",
        target: "node",
        devtool: false,
        entry: path.resolve("src/main/management/httpsRead.ts"),
        output: {
          path: root,
          filename: "adapter.cjs",
          library: { type: "commonjs2" },
        },
        resolve: { extensions: [".ts", ".js"] },
        module: {
          rules: [
            {
              test: /\.ts$/,
              loader: require.resolve("ts-loader"),
              options: { transpileOnly: true },
            },
          ],
        },
      });
      compiler.run((error, stats) =>
        compiler.close(closeError => {
          if (error || closeError || stats.hasErrors())
            reject(
              error ||
                closeError ||
                new Error(stats.toString({ all: false, errors: true })),
            );
          else resolve();
        }),
      );
    });
    return {
      ...require(path.join(root, "adapter.cjs")),
      cleanup: () => rm(root, { recursive: true, force: true }),
    };
  } catch (error) {
    await rm(root, { recursive: true, force: true });
    throw error;
  }
}
async function runManagementGate({
  adapter,
  port,
  fixture,
  username,
  password,
  vhosts,
  checks,
  version,
  deleteOne,
  noConnections,
  api,
}) {
  const input = {
    httpsUrl: `https://127.0.0.1:${port}`,
    username,
    password,
    trust: { mode: "custom", pem: fixture.ca },
  };
  const read = (
    query,
    fields = {},
    signal = new globalThis.AbortController().signal,
  ) => adapter.readManagement({ ...input, ...fields }, query, signal);
  async function check(label, task) {
    await task();
    checks.push(label);
  }
  await check("A-overview-real-projected-version", async () => {
    assert.deepEqual(await read({ kind: "broker" }), {
      kind: "broker",
      matrix: "reference",
      rabbitmqVersion: version,
      managementVersion: version,
    });
  });
  await check(
    "A-management-200-complete-names-and-special-characters",
    async () => {
      const data = await read({ kind: "vhosts", vhost: "." });
      assert.equal(data.names.length, 200);
      assert.deepEqual(
        [...data.names].sort(),
        vhosts.filter(v => v !== "negado").sort(),
      );
      assert.equal(data.currentVisible, true);
      assert.deepEqual(
        Object.keys(data).sort(),
        ["kind", "names", "currentVhost", "currentVisible"].sort(),
      );
    },
  );
  await check("A-visible-does-not-imply-AMQP-and-201-is-rejected", async () => {
    await assert.rejects(
      read(
        { kind: "vhosts", vhost: "negado" },
        { username: "bunnies-monitor" },
      ),
      { code: "LIMIT" },
    );
  });
  await check("A-missing-current-name-is-only-not-listed", async () => {
    const data = await read({ kind: "vhosts", vhost: "negado" });
    assert.equal(data.currentVisible, false);
    assert.equal(data.names.length, 200);
  });
  await check("A-no-management-tag-denied-with-valid-password", async () => {
    for (const query of [{ kind: "broker" }, { kind: "vhosts", vhost: "/" }])
      await assert.rejects(read(query, { username: "bunnies-no-tag" }), {
        code: "DENIED",
      });
  });
  await deleteOne();
  await check(
    "A-monitor-200-includes-vhost-without-AMQP-permission",
    async () => {
      const data = await read(
        { kind: "vhosts", vhost: "negado" },
        { username: "bunnies-monitor" },
      );
      assert.equal(data.names.length, 200);
      assert.equal(data.currentVisible, true);
      assert.ok(data.names.includes(".."));
      assert.ok(data.names.includes("literal%2F"));
    },
  );
  // Same production adapter; adversarial bodies belong only to this loopback fixture.
  const sockets = new Set();
  let handler;
  const server = createServer(
    { key: fixture.key, cert: fixture.cert },
    (req, res) => handler(req, res),
  );
  server.on("connection", socket => {
    sockets.add(socket);
    socket.once("close", () => sockets.delete(socket));
  });
  await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
  const local = (query = { kind: "vhosts", vhost: "/" }, signal) =>
    read(
      query,
      { httpsUrl: `https://127.0.0.1:${server.address().port}/prefix` },
      signal,
    );
  try {
    await check("A-allowlist-prefix-and-No-individual-dot-route", async () => {
      handler = (req, res) => {
        assert.equal(req.method, "GET");
        assert.equal(
          req.url,
          "/prefix/api/vhosts?disable_stats=true&columns=name&sort=name",
        );
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify([{ name: "..", ignored: true }]));
      };
      const data = await local({ kind: "vhosts", vhost: ".." });
      assert.equal(data.currentVisible, true);
    });
    await check(
      "A-streamed-body-limit-is-rejected-before-parsing",
      async () => {
        handler = (_req, res) => {
          res.setHeader("Content-Type", "application/json");
          res.write(" ".repeat(256 * 1024));
          res.end(" ");
        };
        await assert.rejects(local(), { code: "LIMIT" });
      },
    );
    await check("A-compression-is-rejected", async () => {
      handler = (_req, res) => {
        res.writeHead(200, {
          "Content-Type": "application/json",
          "Content-Encoding": "gzip",
        });
        res.end("[]");
      };
      await assert.rejects(local(), { code: "RESPONSE" });
    });
    await check("A-cancellation-closes-stalled-read", async () => {
      const controller = new globalThis.AbortController();
      handler = (_req, res) => {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.write("[");
        controller.abort();
      };
      await assert.rejects(local(undefined, controller.signal), {
        code: "CANCELLED",
      });
    });
  } finally {
    await Promise.all(
      [...sockets].map(
        socket =>
          new Promise(resolve => {
            socket.once("close", resolve);
            socket.destroy();
          }),
      ),
    );
    await new Promise(resolve => server.close(resolve));
    assert.equal(sockets.size, 0);
  }
  await check("A-zero-channels-connections-queues-consumers", async () => {
    await noConnections();
    assert.equal((await api("queues")).length, 0);
    assert.equal((await api("consumers")).length, 0);
  });
}
module.exports = { prepareManagementGate, runManagementGate };
