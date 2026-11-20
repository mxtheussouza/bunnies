const assert = require("node:assert/strict");
const { execFile } = require("node:child_process");
const { promisify } = require("node:util");
const { createHash, randomBytes, randomUUID } = require("node:crypto");
const { mkdtemp, mkdir, writeFile, readFile, rm } = require("node:fs/promises");
const { tmpdir } = require("node:os");
const path = require("node:path");
const https = require("node:https");
const net = require("node:net");
const { _electron: electron } = require("playwright");
const { createTlsFixture } = require("./tls-fixture.cjs");
const exec = promisify(execFile);
const versions = [
  {
    version: "4.4.0",
    digest:
      "rabbitmq@sha256:af6f50d38098d8bd52fef7f3fa85015dd8b2bf6def58e995bf584ae9ba0f6407",
  },
  {
    version: "4.3.6",
    digest:
      "rabbitmq@sha256:54cb013d76cd1fd6c0a0708f34062ad61c452bb6f016b434c6c33f1a765d2b58",
  },
];
const managementGate = process.argv.includes("--management-gate");
const managementGateA = process.argv.includes("--management-gate-a");
const revisedVhostGate = process.argv.includes("--vhost-gate-revised");
const vhostGate = process.argv.includes("--vhost-gate") || revisedVhostGate;
const queuesGate = process.argv.includes("--queues-gate");
const exchangesGate = process.argv.includes("--exchanges-gate");
const exchangesMatrix = process.argv.includes("--exchanges-matrix");
const purgeGate = process.argv.includes("--purge-gate");
const purgeMatrix = process.argv.includes("--purge-matrix");
const declarationGate = process.argv.includes("--declaration-gate");
const declarationMatrix = process.argv.includes("--declaration-matrix");
const queuesMatrix =
  declarationMatrix || process.argv.includes("--queues-matrix");
assert.ok(
  process.argv.slice(2).length <= 1 &&
    process.argv
      .slice(2)
      .every(arg =>
        [
          "--management-gate",
          "--management-gate-a",
          "--vhost-gate",
          "--vhost-gate-revised",
          "--queues-gate",
          "--exchanges-gate",
          "--exchanges-matrix",
          "--purge-gate",
          "--purge-matrix",
          "--declaration-gate",
          "--declaration-matrix",
          "--queues-matrix",
        ].includes(arg),
      ),
);
const managementFixture = managementGate || managementGateA || vhostGate;
const reportPrefix = exchangesGate
  ? "exchanges-gate-6a"
  : exchangesMatrix
    ? "rabbitmq-real-6a"
    : purgeMatrix
      ? "rabbitmq-real-5c1"
      : purgeGate
        ? "queues-purge-gate-5c1"
        : declarationGate
          ? "queues-declaration-gate-5b"
          : queuesGate
            ? "queues-gate-revised-5a"
            : vhostGate
              ? revisedVhostGate
                ? "vhost-gate-revised-4b2"
                : "vhost-gate-4b2"
              : managementGateA
                ? "management-gate-A-4b1"
                : managementGate
                  ? "management-gate-4b1"
                  : declarationMatrix
                    ? "rabbitmq-real-5b"
                    : queuesMatrix
                      ? "rabbitmq-real-5a"
                      : "rabbitmq-real-4b2";
let managementAdapter;
let amqpsAdapter;
let switchAdapter;
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
async function docker(...args) {
  return (
    await exec("docker", args, { timeout: 90000, maxBuffer: 2 ** 22 })
  ).stdout.trim();
}
function passwordHash(password) {
  const salt = randomBytes(4);
  return Buffer.concat([
    salt,
    createHash("sha256").update(salt).update(password).digest(),
  ]).toString("base64");
}
async function runVersion({ version, digest }) {
  const fixture = await createTlsFixture();
  const root = await mkdtemp(path.join(tmpdir(), "bunnies-real-rabbitmq-"));
  const name = `bunnies-test-${version.replaceAll(".", "-")}-${randomUUID()}`;
  const image = `rabbitmq:${version}-management`;
  const password = randomBytes(24).toString("hex");
  const observerPassword = randomBytes(24).toString("hex");
  const username = "bunnies-test";
  const queueFixture =
    queuesGate || queuesMatrix ? require("./queues-gate.cjs") : undefined;
  const declarationFixture = declarationGate
    ? require("./queue-declaration-gate.cjs")
    : undefined;
  const purgeFixture =
    purgeGate || purgeMatrix ? require("./queue-purge-gate.cjs") : undefined;
  const exchangeFixture =
    exchangesGate || exchangesMatrix
      ? require("./exchanges-gate.cjs")
      : undefined;
  const managementPrefix =
    queueFixture || declarationFixture || purgeFixture || exchangeFixture
      ? "/bunnies-test"
      : "";
  const vhosts = [
    "/",
    "equipe/pedidos",
    "literal%2F",
    "área pedidos",
    ".",
    "negado",
    ...(queueFixture || declarationFixture || purgeFixture || exchangeFixture
      ? ["detailed"]
      : []),
    ...(managementFixture
      ? [
          "..",
          ...Array.from(
            { length: vhostGate ? 0 : managementGateA ? 194 : 110 },
            (_, i) => `page-${String(i).padStart(3, "0")}`,
          ),
        ]
      : []),
  ];
  const config = path.join(root, "config");
  const userData = path.join(root, "user-data");
  const checks = [];
  const requests = [],
    errors = [];
  let app, container, network, relay;
  const relaySockets = new Set();
  let relayBytes = 0;
  let httpsPort, amqpsPort;
  const report = {
    version,
    executedAt: new Date().toISOString(),
    checks,
    cleanup: false,
  };
  function api(route) {
    return new Promise((resolve, reject) => {
      const request = https.get(
        {
          hostname: "127.0.0.1",
          port: httpsPort,
          path: `${managementPrefix}/api/${route}`,
          ca: fixture.ca,
          minVersion: "TLSv1.2",
          rejectUnauthorized: true,
          auth: `bunnies-observer:${observerPassword}`,
          agent: false,
        },
        response => {
          const chunks = [];
          response.on("data", chunk => chunks.push(chunk));
          response.on("end", () => {
            try {
              assert.equal(response.statusCode, 200);
              resolve(JSON.parse(Buffer.concat(chunks).toString("utf8")));
            } catch (error) {
              reject(error);
            }
          });
          response.on("error", reject);
        },
      );
      request.setTimeout(3000, () =>
        request.destroy(new Error("Observer timeout")),
      );
      request.on("error", reject);
    });
  }
  async function noConnections() {
    for (let attempt = 0; attempt < 30; attempt++) {
      if ((await api("connections")).length === 0) {
        assert.equal((await api("channels")).length, 0);
        return;
      }
      await sleep(200);
    }
    throw new Error("Broker retained a connection after test completion");
  }
  async function oneConnection() {
    for (let attempt = 0; attempt < 50; attempt++) {
      const connections = await api("connections");
      if (connections.length === 1) return connections;
      await sleep(200);
    }
    throw new Error(
      "Management API did not register exactly one established connection",
    );
  }
  try {
    await mkdir(config, { mode: 0o755 });
    await mkdir(userData, { mode: 0o700 });
    // Only this synthetic child is mounted; the host parent remains private 0700.
    for (const [file, content] of Object.entries({
      "ca.pem": fixture.ca,
      "server.pem": fixture.cert,
      "server.key": fixture.key,
    }))
      await writeFile(path.join(config, file), content, { mode: 0o644 });
    const users = [
      {
        name: username,
        password_hash: passwordHash(password),
        tags: ["management"],
      },
      {
        name: "bunnies-denied",
        password_hash: passwordHash(password),
        tags: ["management"],
      },
      {
        name: "bunnies-observer",
        password_hash: passwordHash(observerPassword),
        tags: ["administrator"],
      },
      ...(declarationFixture
        ? declarationFixture.accounts.map(name => ({
            name,
            password_hash: passwordHash(password),
            tags: ["management"],
          }))
        : []),
      ...(managementFixture || queueFixture
        ? [
            {
              name: "bunnies-monitor",
              password_hash: passwordHash(password),
              tags: ["monitoring"],
            },
            {
              name: "bunnies-no-tag",
              password_hash: passwordHash(password),
              tags: [],
            },
          ]
        : []),
    ].map(user => ({
      ...user,
      hashing_algorithm: "rabbit_password_hashing_sha256",
    }));
    await writeFile(
      path.join(config, "definitions.json"),
      JSON.stringify({
        users,
        vhosts: vhosts.map(name => ({ name })),
        permissions: vhosts
          .filter(vhost => vhost !== "negado")
          .map(vhost => ({
            user: username,
            vhost,
            configure: declarationMatrix ? "^bunnies-new-" : "^$",
            write: "^$",
            read: purgeFixture ? "^bunnies-purge-" : "^$",
          }))
          .concat(
            managementFixture || queueFixture
              ? [
                  {
                    user: "bunnies-monitor",
                    vhost: "/",
                    configure: "^$",
                    write: "^$",
                    read: "^$",
                  },
                  {
                    user: "bunnies-no-tag",
                    vhost: "/",
                    configure: "^$",
                    write: "^$",
                    read: "^$",
                  },
                ]
              : [],
          )
          .concat(
            queueFixture
              ? [
                  {
                    user: "bunnies-observer",
                    vhost: "/",
                    configure: "^$",
                    write: "^$",
                    read: ".*",
                  },
                ]
              : [],
          )
          .concat(declarationFixture?.permissions(vhosts) ?? [])
          .concat(purgeFixture?.permissions(vhosts, purgeGate) ?? []),
        ...(declarationFixture
          ? {
              exchanges: declarationFixture.exchanges,
              queues: declarationFixture.queues,
            }
          : {}),
        ...(queueFixture ? { queues: queueFixture.queues } : {}),
        ...exchangeFixture?.definitions,
      }),
      { mode: 0o644 },
    );
    await writeFile(
      path.join(config, "rabbitmq.conf"),
      [
        "listeners.tcp = none",
        "ssl_handshake_timeout = 30000",
        "handshake_timeout = 30000",
        "listeners.ssl.default = 5671",
        "ssl_options.cacertfile = /fixture/ca.pem",
        "ssl_options.certfile = /fixture/server.pem",
        "ssl_options.keyfile = /fixture/server.key",
        // Server-only TLS; Bunnies still verifies the server chain and identity.
        "ssl_options.verify = verify_none",
        "ssl_options.fail_if_no_peer_cert = false",
        "ssl_options.versions.1 = tlsv1.3",
        "ssl_options.versions.2 = tlsv1.2",
        "management.tcp.ip = 127.0.0.1",
        "management.ssl.port = 15671",
        "management.ssl.cacertfile = /fixture/ca.pem",
        "management.ssl.certfile = /fixture/server.pem",
        "management.ssl.keyfile = /fixture/server.key",
        "management.ssl.versions.1 = tlsv1.3",
        "management.ssl.versions.2 = tlsv1.2",
        ...(managementPrefix
          ? [`management.path_prefix = ${managementPrefix}`]
          : []),
        "definitions.import_backend = local_filesystem",
        "definitions.local.path = /fixture/definitions.json",
        "collect_statistics_interval = 100",
        "log.console.level = info",
        "",
      ].join("\n"),
      { mode: 0o644 },
    );
    const inspection = JSON.parse(await docker("image", "inspect", digest))[0];
    assert.ok(
      inspection.RepoDigests.includes(digest),
      "Pull the pinned official digest before running this harness",
    );
    report.image = {
      tag: image,
      digest,
      id: inspection.Id,
      architecture: inspection.Architecture,
    };
    network = await docker(
      "network",
      "create",
      "--label",
      `bunnies.test=${name}`,
      name,
    );
    container = await docker(
      "create",
      "--name",
      name,
      "--hostname",
      "bunnies-fixture",
      "--label",
      `bunnies.test=${name}`,
      "--network",
      network,
      "--publish",
      "127.0.0.1::5671",
      "--publish",
      "127.0.0.1::15671",
      "--mount",
      `type=bind,src=${config},dst=/fixture,readonly`,
      "--tmpfs",
      "/var/lib/rabbitmq:rw,nosuid,nodev,size=256m",
      "--env",
      "RABBITMQ_CONFIG_FILE=/fixture/rabbitmq",
      "--env",
      "RABBITMQ_SERVER_ADDITIONAL_ERL_ARGS=+S 2:2",
      digest,
    );
    await docker("start", container);
    const details = JSON.parse(await docker("inspect", container))[0];
    const binding = port => {
      const [bound] = details.NetworkSettings.Ports[`${port}/tcp`];
      assert.equal(bound.HostIp, "127.0.0.1");
      return Number(bound.HostPort);
    };
    amqpsPort = binding(5671);
    httpsPort = binding(15671);
    for (let attempt = 0; ; attempt++) {
      try {
        report.brokerVersion = (await api("overview")).rabbitmq_version;
        break;
      } catch {
        const state = JSON.parse(await docker("inspect", container))[0].State;
        if (!state.Running) {
          const logs = (await docker("logs", container))
            .replaceAll(password, "[REDACTED]")
            .replaceAll(observerPassword, "[REDACTED]");
          report.startupFailure = logs.slice(-6000);
          throw new Error(
            `RabbitMQ exited before readiness:\n${report.startupFailure}`,
          );
        }
        if (attempt >= 89) throw new Error("RabbitMQ TLS readiness timed out");
        await sleep(1000);
      }
    }
    assert.equal(report.brokerVersion, version);
    console.log(`RabbitMQ ${version}: TLS ready (${inspection.Architecture})`);
    checks.push("exact-broker-version-and-TLS-readiness");
    await noConnections();
    if (exchangesGate) {
      report.failures = await exchangeFixture.run({
        adapter: managementAdapter,
        fixture,
        managementPrefix,
        httpsPort,
        username,
        password,
        checks,
        api,
        noConnections,
      });
      report.passed = report.failures.length === 0;
      console.log(
        `RabbitMQ ${version}: exchanges gate ${checks.length} passed, ${report.failures.length} failed`,
      );
      return report;
    }
    if (purgeGate) {
      report.failures = await purgeFixture.run({
        adapter: managementAdapter,
        fixture,
        httpsPort,
        amqpsPort,
        managementPrefix,
        username,
        password,
        observerPassword,
        checks,
        api,
        noConnections,
        observations: (report.purgeObservations = {}),
      });
      report.passed = report.failures.length === 0;
      console.log(
        `RabbitMQ ${version}: purge gate ${checks.length} passed, ${report.failures.length} failed`,
      );
      return report;
    }
    if (declarationGate) {
      report.failures = await declarationFixture.run({
        adapter: managementAdapter,
        fixture,
        httpsPort,
        managementPrefix,
        password,
        checks,
        api,
        noConnections,
        relaxed: async enabled => {
          assert.equal(
            JSON.parse(await docker("inspect", container))[0].Config.Labels[
              "bunnies.test"
            ],
            name,
          );
          await docker(
            "exec",
            container,
            "rabbitmqctl",
            "eval",
            `application:set_env(rabbit, quorum_relaxed_checks_on_redeclaration, ${enabled}).`,
          );
        },
      });
      report.passed = report.failures.length === 0;
      console.log(
        `RabbitMQ ${version}: declaration gate ${checks.length} passed, ${report.failures.length} failed`,
      );
      return report;
    }
    if (queuesGate) {
      report.failures = await queueFixture.runQueuesGate({
        adapter: managementAdapter,
        fixture,
        httpsPort,
        amqpsPort,
        managementPrefix,
        username,
        password,
        observerPassword,
        checks,
        observations: (report.queueObservations = {}),
        api,
        noConnections,
      });
      report.passed = report.failures.length === 0;
      console.log(
        `RabbitMQ ${version}: queues gate ${checks.length} passed, ${report.failures.length} failed`,
      );
      return report;
    }
    if (vhostGate) {
      await require("./vhost-gate.cjs").runVhostGate({
        managementAdapter,
        amqpsAdapter,
        SwitchGuard: switchAdapter?.VhostSwitchGuard,
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
        liveConnections: async () => {
          const owned = JSON.parse(await docker("inspect", container))[0];
          assert.equal(owned.Config.Labels["bunnies.test"], name);
          return JSON.parse(
            await docker(
              "exec",
              container,
              "rabbitmqctl",
              "list_connections",
              "vhost",
              "channels",
              "--formatter",
              "json",
            ),
          );
        },
      });
      report.passed = report.failures.length === 0;
      console.log(
        `RabbitMQ ${version}: vhost gate ${checks.length} passed, ${report.failures.length} failed`,
      );
      return report;
    }
    if (managementGateA) {
      await require("./management-gate.cjs").runManagementGate({
        adapter: managementAdapter,
        port: httpsPort,
        fixture,
        username,
        password,
        vhosts,
        checks,
        version,
        noConnections,
        api,
        deleteOne: async () => {
          const owned = JSON.parse(await docker("inspect", container))[0];
          assert.equal(owned.Config.Labels["bunnies.test"], name);
          await docker(
            "exec",
            container,
            "rabbitmqctl",
            "delete_vhost",
            "page-193",
          );
        },
      });
      report.passed = true;
      console.log(`RabbitMQ ${version}: A gate ${checks.length} checks passed`);
      return report;
    }
    if (managementGate) {
      async function read(route, user = username) {
        return new Promise((resolve, reject) => {
          const request = https.get(
            {
              hostname: "127.0.0.1",
              port: httpsPort,
              path: `/api/${route}`,
              ca: fixture.ca,
              rejectUnauthorized: true,
              minVersion: "TLSv1.2",
              auth: `${user}:${user === "bunnies-observer" ? observerPassword : password}`,
              agent: false,
              maxHeaderSize: 16 * 1024,
              headers: {
                Accept: "application/json",
                "Accept-Encoding": "identity",
              },
            },
            response => {
              const chunks = [];
              let size = 0;
              response.on("data", chunk => {
                size += chunk.length;
                if (size > 256 * 1024)
                  request.destroy(new Error("Gate response limit"));
                else chunks.push(chunk);
              });
              response.on("error", reject);
              response.on("end", () => {
                const bytes = Buffer.concat(chunks);
                let body;
                try {
                  body = JSON.parse(bytes.toString("utf8"));
                } catch {
                  body = null;
                }
                report.responses ??= [];
                report.responses.push({
                  route,
                  user,
                  status: response.statusCode,
                  contentType: response.headers["content-type"],
                  bytes: bytes.length,
                  shape: Array.isArray(body)
                    ? `array:${body.length}`
                    : body && typeof body === "object"
                      ? Object.keys(body)
                      : "non-JSON",
                  keys:
                    Array.isArray(body) && body.length
                      ? Object.keys(body[0])
                      : undefined,
                  reason:
                    body && typeof body.reason === "string"
                      ? body.reason.slice(0, 120)
                      : undefined,
                });
                resolve({ status: response.statusCode, body });
              });
            },
          );
          const timer = setTimeout(
            () => request.destroy(new Error("Gate deadline")),
            10000,
          );
          request.once("close", () => clearTimeout(timer));
          request.on("error", reject);
        });
      }
      const failures = [];
      async function check(label, task) {
        try {
          await task();
          checks.push(label);
        } catch (error) {
          failures.push({ label, message: error.message.split("\n")[0] });
        }
      }
      await check("overview-projected-version", async () => {
        const r = await read(
          "overview?columns=rabbitmq_version,management_version",
        );
        assert.equal(r.status, 200);
        assert.equal(r.body.rabbitmq_version, version);
        assert.equal(typeof r.body.management_version, "string");
        assert.ok(
          Object.keys(r.body).every(key =>
            ["rabbitmq_version", "management_version"].includes(key),
          ),
        );
      });
      const query =
        "pagination=true&page_size=100&sort=name&disable_stats=true&columns=name";
      let first, second;
      for (const page of [1, 2])
        await check(`management-page-${page}-projection`, async () => {
          const r = await read(`vhosts?${query}&page=${page}`);
          assert.equal(r.status, 200);
          assert.ok(
            !Array.isArray(r.body),
            "Server returned an unpaginated array",
          );
          assert.ok(Array.isArray(r.body.items), "Missing items envelope");
          assert.equal(r.body.page, page);
          assert.equal(r.body.page_size, 100);
          assert.equal(r.body.total_count, vhosts.length - 1);
          assert.equal(r.body.filtered_count, vhosts.length - 1);
          assert.equal(r.body.page_count, 2);
          assert.equal(
            r.body.items.length,
            page === 1 ? 100 : vhosts.length - 101,
          );
          for (const item of r.body.items)
            assert.deepEqual(Object.keys(item), ["name"]);
          if (page === 1) first = r.body.items;
          else second = r.body.items;
        });
      await check("pages-complete-distinct-and-denied-hidden", async () => {
        assert.ok(first && second);
        const names = [...first, ...second].map(item => item.name);
        assert.equal(new Set(names).size, vhosts.length - 1);
        assert.deepEqual(
          [...names].sort(),
          vhosts.filter(v => v !== "negado").sort(),
        );
      });
      await check("monitor-sees-vhost-without-AMQP-permission", async () => {
        const r = await read(`vhosts?${query}&page=1`, "bunnies-monitor");
        assert.equal(r.status, 200);
        assert.equal(r.body.total_count, vhosts.length);
      });
      await check("no-management-tag-is-denied", async () => {
        for (const route of [
          "overview",
          `vhosts?${query}&page=1`,
          "vhosts/%2F?disable_stats=true&columns=name",
        ])
          assert.equal((await read(route, "bunnies-no-tag")).status, 401);
      });
      for (const name of [
        "/",
        "equipe/pedidos",
        "literal%2F",
        "área pedidos",
        ".",
        "..",
      ]) {
        await check(`current-vhost-encoded:${name}`, async () => {
          const encoded = encodeURIComponent(name).replaceAll(".", "%2E");
          const r = await read(
            `vhosts/${encoded}?disable_stats=true&columns=name`,
          );
          assert.equal(r.status, 200);
          assert.deepEqual(r.body, { name });
        });
      }
      await check("current-vhost-denied-and-missing", async () => {
        const denied = await read(
          "vhosts/negado?disable_stats=true&columns=name",
        );
        assert.ok([403, 404].includes(denied.status));
        assert.equal(
          (await read("vhosts/missing-vhost?disable_stats=true&columns=name"))
            .status,
          404,
        );
      });
      await check("zero-channels-connections-queues-consumers", async () => {
        await noConnections();
        assert.equal((await api("queues")).length, 0);
        assert.equal((await api("consumers")).length, 0);
      });
      // Diagnostic permutations remain bounded and only target this isolated broker.
      for (const route of [
        "vhosts?page=1&page_size=100&pagination=true&sort=name&disable_stats=true",
        "vhosts?page=1&page_size=100&pagination=true&sort=name&columns=name",
        "vhosts?page=1&page_size=100&pagination=true&sort=name",
        "vhosts/%2F?disable_stats=true",
        "vhosts/%2F?columns=name",
        "vhosts/%2F",
        "vhosts/negado?disable_stats=true&columns=name",
      ])
        await read(route);
      // Compare normal successful administrative reads with explicit permission refusals.
      for (const user of [username, "bunnies-monitor", "bunnies-observer"]) {
        await read("vhosts?disable_stats=true&columns=name", user);
        for (const route of [
          "vhosts/%2F?disable_stats=true&columns=name",
          "vhosts/equipe%2Fpedidos?disable_stats=true&columns=name",
          "vhosts/literal%252F?disable_stats=true&columns=name",
          "vhosts/%C3%A1rea%20pedidos?disable_stats=true&columns=name",
          "vhosts/%2E?disable_stats=true&columns=name",
          "vhosts/%2E%2E?disable_stats=true&columns=name",
          "vhosts/.?disable_stats=true&columns=name",
          "vhosts/..?disable_stats=true&columns=name",
        ])
          await read(route, user);
      }
      const logs = (await docker("logs", container))
        .replaceAll(password, "[REDACTED]")
        .replaceAll(observerPassword, "[REDACTED]");
      await writeFile(`out/${reportPrefix}-${version}-broker.log`, logs);
      report.failures = failures;
      report.passed = failures.length === 0;
      console.log(
        `RabbitMQ ${version}: gate ${checks.length} passed, ${failures.length} failed`,
      );
      return report;
    }
    async function queueIdentity() {
      return (await api("queues"))
        .map(queue => ({
          vhost: queue.vhost,
          name: queue.name,
          type: queue.type,
          arguments: queue.arguments,
        }))
        .sort(
          (a, b) =>
            a.vhost.localeCompare(b.vhost) || a.name.localeCompare(b.name),
        );
    }
    if (purgeMatrix) {
      await purgeFixture.seedMatrix({ fixture, amqpsPort, observerPassword });
      await noConnections();
    }
    const initialQueues = await queueIdentity();
    const exchangeTopology = async () => {
      const definitions = await api("definitions");
      return ["exchanges", "bindings"].map(key =>
        definitions[key].map(row => JSON.stringify(row)).sort(),
      );
    };
    const initialExchanges = exchangesMatrix
      ? await exchangeTopology()
      : undefined;
    const declaredQueues = [];
    const profileId = randomUUID();
    const profileFile = path.join(userData, "profiles.json");
    const initial = JSON.stringify({
      schemaVersion: 2,
      writeId: randomUUID(),
      profiles: [
        {
          id: profileId,
          name: "RabbitMQ real isolado",
          environment: "development",
          httpsUrl: `https://127.0.0.1:${httpsPort}${managementPrefix}`,
          amqpsUrl: `amqps://127.0.0.1:${amqpsPort}/%2F`,
          username,
          secret: { mode: "memory" },
          trust: { mode: "custom", pem: fixture.ca },
        },
      ],
    });
    await writeFile(profileFile, initial, { mode: 0o600 });
    const artifact = path.resolve(
      `out/Bunnies-${process.platform}-${process.arch}`,
    );
    const executablePath = {
      darwin: path.join(artifact, "Bunnies.app/Contents/MacOS/bunnies"),
      linux: path.join(artifact, "bunnies"),
      win32: path.join(artifact, "bunnies.exe"),
    }[process.platform];
    assert.ok(executablePath);
    app = await electron.launch({
      executablePath,
      args: [`--user-data-dir=${userData}`],
      chromiumSandbox: true,
      timeout: 30000,
    });
    const page = await app.firstWindow();
    page.setDefaultTimeout(20000);
    page.on("pageerror", error => errors.push(error.message));
    page.on("request", request => {
      if (!request.url().startsWith("bunnies://app/"))
        requests.push(request.url());
    });
    await page.getByRole("button", { name: /RabbitMQ real isolado/ }).click();
    assert.equal(await readFile(profileFile, "utf8"), initial);
    assert.equal(
      await page
        .getByRole("button", { name: "Testar AMQPS", exact: true })
        .isDisabled(),
      true,
    );
    await noConnections();
    checks.push("no-auto-connect-or-profile-rewrite");
    async function edit(fields = {}, newPassword) {
      await page
        .getByRole("button", { name: "Editar perfil", exact: true })
        .click();
      const dialog = page.getByRole("dialog", {
        name: "Editar perfil",
        exact: true,
      });
      for (const [label, value] of Object.entries(fields))
        await dialog.getByLabel(label, { exact: true }).fill(value);
      if (newPassword !== undefined) {
        await dialog
          .getByLabel("Senha", { exact: true })
          .selectOption("replace");
        await dialog
          .getByLabel("Nova senha", { exact: true })
          .fill(newPassword);
      }
      await dialog
        .getByRole("button", { name: "Salvar perfil", exact: true })
        .click();
      await dialog.waitFor({ state: "hidden" });
    }
    async function test(transport, expected) {
      const before = await readFile(profileFile, "utf8");
      await page
        .getByRole("button", { name: `Testar ${transport}`, exact: true })
        .click();
      const region = page.getByRole("region", {
        name: `Teste de autenticação ${transport}`,
        exact: true,
      });
      await region.getByText(expected, { exact: true }).waitFor();
      assert.equal(await readFile(profileFile, "utf8"), before);
      await noConnections();
      assert.ok(
        await page.getByText("Sem sessão ativa", { exact: true }).count(),
      );
      assert.ok(!(await page.locator("body").textContent()).includes(password));
      assert.ok(!before.includes(password));
    }
    await edit({}, password);
    await test("HTTPS", "Autenticação HTTPS verificada");
    checks.push("HTTPS-whoami-real-management-plugin");
    const success = "Autenticação AMQPS e vhost verificados";
    const refused =
      "O broker recusou a negociação AMQP. Confira autenticação e acesso ao vhost.";
    const cases = [
      ["/%2F", "/"],
      ["", "/"],
      ["/equipe%2Fpedidos", "equipe/pedidos"],
      ["/literal%252F", "literal%2F"],
      ["/%C3%A1rea%20pedidos", "área pedidos"],
      ["/.", "."],
    ];
    for (const [encoded, vhost] of cases) {
      await edit({
        "Endpoint AMQPS": `amqps://127.0.0.1:${amqpsPort}${encoded}`,
      });
      await test("AMQPS", success);
      checks.push(`AMQPS-open-close-vhost:${vhost}:${encoded || "absent"}`);
    }
    await edit({
      "Endpoint AMQPS": `amqps://localhost:${amqpsPort}/%2F`,
      "Endpoint HTTPS": `https://localhost:${httpsPort}${managementPrefix}`,
    });
    await test("AMQPS", success);
    await test("HTTPS", "Autenticação HTTPS verificada");
    checks.push("DNS-localhost-and-IP-SAN-with-shared-CA");
    await edit({}, randomBytes(24).toString("hex"));
    await test("AMQPS", refused);
    await test(
      "HTTPS",
      "Autenticação HTTPS recusada. Confira usuário e senha.",
    );
    checks.push("wrong-password-sanitized-refusal-both-transports");
    await edit(
      { "Endpoint AMQPS": `amqps://127.0.0.1:${amqpsPort}/missing-vhost` },
      password,
    );
    await test("AMQPS", refused);
    checks.push("nonexistent-vhost-refused");
    await edit({ "Endpoint AMQPS": `amqps://127.0.0.1:${amqpsPort}/negado` });
    await test("AMQPS", refused);
    checks.push("existing-vhost-without-permission-refused");
    await edit({
      Usuário: "bunnies-denied",
      "Endpoint AMQPS": `amqps://127.0.0.1:${amqpsPort}/%2F`,
    });
    await test("AMQPS", refused);
    checks.push("authenticated-user-without-vhost-access-refused");
    await edit({ Usuário: username });
    await test("AMQPS", success);
    checks.push("recovery-by-explicit-new-test");
    // Only these loopback relays and the harness-owned broker are interrupted.
    const forwarders = [];
    async function forward(port) {
      const state = { blocked: false, sockets: new Set() };
      state.server = net.createServer(client => {
        if (state.blocked) {
          client.destroy();
          return;
        }
        const upstream = net.connect(port, "127.0.0.1");
        for (const socket of [client, upstream]) {
          state.sockets.add(socket);
          socket.on("error", () => undefined);
          socket.once("close", () => state.sockets.delete(socket));
        }
        client.pipe(upstream);
        upstream.pipe(client);
        client.once("close", () => upstream.destroy());
        upstream.once("close", () => client.destroy());
      });
      forwarders.push(state);
      await new Promise(resolve =>
        state.server.listen(0, "127.0.0.1", resolve),
      );
      state.port = state.server.address().port;
      state.cut = () => {
        state.blocked = true;
        for (const socket of state.sockets) socket.destroy();
      };
      return state;
    }
    async function sessionState() {
      const result = await page.evaluate(() =>
        window.bunnies.getSessionState(),
      );
      assert.equal(result.ok, true);
      return result.value;
    }
    const win = await app.browserWindow(page);
    async function focusSessionWindow() {
      await win.evaluate(w => {
        if (w.isMinimized()) w.restore();
        if (!w.isVisible()) w.show();
      });
      await app.evaluate(({ app }) => app.focus({ steal: true }));
      await win.evaluate(w => {
        w.focus();
        w.webContents.focus();
      });
    }
    async function awaitSession(predicate, limit = 25000, foreground = true) {
      const end = Date.now() + limit;
      let nextFocus = 0;
      for (;;) {
        const state = await sessionState();
        if (await predicate(state)) return;
        if (Date.now() >= end) {
          const nativeWindow = await win.evaluate(w => ({
            visible: w.isVisible(),
            focused: w.isFocused(),
            minimized: w.isMinimized(),
          }));
          throw new Error(
            "Real session transition timed out: " +
              JSON.stringify({
                paused: state.paused,
                state: state.state,
                vhost: state.profile?.vhost,
                amqps: state.amqps.phase,
                https: state.https.phase,
                httpsChecking: state.https.checking,
                httpsCheckedAt: state.https.checkedAt,
                httpsError: state.https.error,
                nativeWindow,
              }),
          );
        }
        if (foreground && state.paused && Date.now() >= nextFocus) {
          nextFocus = Date.now() + 250;
          await focusSessionWindow();
        }
        await sleep(50);
      }
    }
    try {
      const amqpForward = await forward(amqpsPort),
        httpsForward = await forward(httpsPort);
      await edit({
        "Endpoint AMQPS": `amqps://127.0.0.1:${amqpForward.port}/%2F`,
        "Endpoint HTTPS": `https://127.0.0.1:${httpsForward.port}${managementPrefix}`,
      });
      await focusSessionWindow();
      await page.getByRole("button", { name: "Conectar", exact: true }).click();
      await awaitSession(s => s.state === "ready");
      checks.push(
        ...(await require("./management.cjs").verifyManagement(page, version, [
          "/",
          ".",
          "literal%2F",
          "área pedidos",
          "equipe/pedidos",
        ])),
      );
      const current = await sessionState();
      assert.equal(current.state, "ready");
      checks.push("real-management-reads-preserve-session-and-privileges");
      const saved = await readFile(profileFile);
      const { selectVhost } = require("./management.cjs");
      const { navigate } = require("./queues.cjs");
      async function openConnections() {
        await navigate(page, "Conexões");
        await page
          .getByRole("button", { name: /RabbitMQ real isolado/ })
          .click();
      }
      if (exchangesMatrix) {
        const { verifyReal } = require("./exchanges.cjs");
        const verify = async vhost => {
          await focusSessionWindow();
          await awaitSession(
            s => !s.paused && s.state === "ready" && s.profile.vhost === vhost,
          );
          await verifyReal(page, {
            name: exchangeFixture.exchangeName,
            vhost,
            remoteDestination: exchangeFixture.destination,
          });
        };
        await verify("/");
        await openConnections();
        checks.push(
          "real-exchanges-list-exact-detail-arguments-incoming-and-outgoing",
        );
        for (const vhost of ["detailed", "literal%2F", "/"]) {
          await page
            .getByRole("button", { name: "Listar vhosts", exact: true })
            .click();
          await page.getByText(/Lista completa recebida:/).waitFor();
          await page
            .getByRole("button", {
              name: `Usar este vhost: ${vhost}`,
              exact: true,
            })
            .click();
          await awaitSession(
            s => s.state === "ready" && s.profile.vhost === vhost,
          );
          if (vhost !== "/") {
            await verify(vhost);
            await openConnections();
          }
        }
        const stale = await page.evaluate(
          ({ sessionId, generation }) =>
            window.bunnies.listSessionExchanges({
              sessionId,
              generation,
              operationId: window.crypto.randomUUID(),
              page: 1,
            }),
          current,
        );
        assert.equal(stale.error.code, "CONFLICT");
        assert.deepEqual(await readFile(profileFile), saved);
        checks.push(
          "real-exchanges-in-detailed-and-percent-vhost-with-stale-generation-rejected",
        );
        await page
          .getByRole("button", { name: "Listar vhosts", exact: true })
          .click();
      }
      const loadQueues = () =>
        page.getByRole("button", { name: "Carregar filas", exact: true });
      if (queuesMatrix) {
        await navigate(page, "Filas");
        assert.equal(await page.getByRole("table").count(), 0);
        await loadQueues().click();
        await page.getByText(/^107 de 107 filas/).waitFor();
        assert.equal(await page.locator("table tbody tr").count(), 100);
        await page.getByRole("button", { name: "Próxima página" }).click();
        await page.getByText(/Página 2 de 2/).waitFor();
        assert.equal(await page.locator("table tbody tr").count(), 7);
        const search = page.getByRole("textbox", {
          name: "Buscar trecho do nome",
        });
        await search.fill("[literal]");
        await search.press("Enter");
        await page.getByText(/^1 de 107 filas/).waitFor();
        const name = "pedidos [literal]";
        await page
          .getByRole("button", {
            name: `Ver detalhes da fila ${name}`,
            exact: true,
          })
          .click();
        const detail = page.getByRole("dialog", { name, exact: true });
        await detail.getByText("5000", { exact: true }).waitFor();
        await page.keyboard.press("Escape");
        await detail.waitFor({ state: "hidden" });
        await openConnections();
        await page
          .getByRole("button", { name: "Listar vhosts", exact: true })
          .click();
        await page.getByText(/Lista completa recebida:/).waitFor();
        checks.push("real-queue-pagination-literal-search-and-exact-detail");
      }
      await selectVhost(page, "literal%2F");
      await awaitSession(
        s =>
          s.generation > current.generation &&
          s.state === "ready" &&
          s.profile.vhost === "literal%2F",
      );
      const [selected] = await oneConnection();
      assert.equal(selected.vhost, "literal%2F");
      assert.equal(selected.channels, 0);
      assert.equal((await sessionState()).profile.savedVhost, "/");
      assert.deepEqual(await readFile(profileFile), saved);
      if (purgeMatrix) {
        const purge = require("./queue-purge.cjs");
        const driver = await purge.installDialogDriver(app);
        const matrix = {
          page,
          driver,
          api,
          checks,
          queue: purgeFixture.specialName,
        };
        await purge.verifyRealPurge(matrix, "literal%2F");
        await openConnections();
        await page
          .getByRole("button", { name: "Listar vhosts", exact: true })
          .click();
        await page.getByText(/Lista completa recebida:/).waitFor();
        await selectVhost(page, "detailed");
        await awaitSession(
          s => s.state === "ready" && s.profile.vhost === "detailed",
        );
        await purge.verifyRealPurge(matrix, "detailed");
        await openConnections();
        assert.deepEqual(await readFile(profileFile), saved);
      }
      if (queuesMatrix) {
        const stale = await page.evaluate(
          ref =>
            window.bunnies.listSessionQueues({
              ...ref,
              operationId: window.crypto.randomUUID(),
              page: 1,
            }),
          { sessionId: current.sessionId, generation: current.generation },
        );
        assert.equal(stale.error.code, "CONFLICT");
        await navigate(page, "Filas");
        assert.equal(await page.getByRole("table").count(), 0);
        await page.getByText(/Vhost literal%2F.*temporário/).waitFor();
        await loadQueues().click();
        await page.getByText(/^1 de 1 filas/).waitFor();
        const name = "pedidos/equipe %2F • #?+";
        await page
          .getByRole("button", {
            name: `Ver detalhes da fila ${name}`,
            exact: true,
          })
          .click();
        const detail = page.getByRole("dialog", { name, exact: true });
        await detail.getByText("6000", { exact: true }).waitFor();
        await page.keyboard.press("Escape");
        await detail.waitFor({ state: "hidden" });
        if (declarationMatrix) {
          const {
            openForm,
            submit,
            closeForm,
          } = require("./queue-declaration.cjs");
          const queue = "bunnies-new-pedidos/á %2F";
          const form = await openForm(page, {
            name: queue,
            type: "quorum",
            ttl: "8000",
          });
          await submit(form, "Declaração confirmada");
          await submit(form, "Declaração confirmada");
          await form
            .getByRole("textbox", {
              name: "TTL de mensagens (ms)",
              exact: true,
            })
            .fill("8001");
          await submit(form, "Resultado incerto");
          await form
            .getByRole("button", { name: "Verificar fila", exact: true })
            .click();
          const verified = page.getByRole("dialog", {
            name: queue,
            exact: true,
          });
          await verified.getByText("8000", { exact: true }).waitFor();
          await page.keyboard.press("Escape");
          await verified.waitFor({ state: "hidden" });
          const conflictName = "bunnies-new-strict";
          const conflictForm = await openForm(page, {
            name: conflictName,
            ttl: "500",
          });
          await submit(conflictForm, "Declaração confirmada");
          await conflictForm
            .getByRole("textbox", {
              name: "TTL de mensagens (ms)",
              exact: true,
            })
            .fill("501");
          await submit(conflictForm, "Declaração recusada");
          await conflictForm.getByText(/propriedades incompatíveis/).waitFor();
          await closeForm(conflictForm);
          declaredQueues.push({
            vhost: "literal%2F",
            name: conflictName,
            type: "classic",
            arguments: { "x-queue-type": "classic", "x-message-ttl": 500 },
          });
          checks.push(
            "real-unicode-conflict-server-error-preserves-original-and-manual-verification",
          );
          const denial = await openForm(page, { name: "fora-da-permissao" });
          await submit(denial, "Declaração recusada");
          await denial.getByText(/O acesso foi recusado/).waitFor();
          await closeForm(denial);
          declaredQueues.push({
            vhost: "literal%2F",
            name: queue,
            type: "quorum",
            arguments: { "x-queue-type": "quorum", "x-message-ttl": 8000 },
          });
          assert.deepEqual(await readFile(profileFile), saved);
          checks.push(
            "real-declaration-in-current-temporary-vhost-equivalence-conflict-and-permission",
          );
        }
        await openConnections();
        await page
          .getByRole("button", { name: "Listar vhosts", exact: true })
          .click();
        await page.getByText(/Lista completa recebida:/).waitFor();
        await selectVhost(page, "detailed");
        await awaitSession(
          s => s.state === "ready" && s.profile.vhost === "detailed",
        );
        await navigate(page, "Filas");
        await page.getByText(/RabbitMQ reserva esse caminho/).waitFor();
        assert.equal(await loadQueues().count(), 0);
        const unsupported = await page.evaluate(async () => {
          const state = (await window.bunnies.getSessionState()).value;
          return window.bunnies.listSessionQueues({
            sessionId: state.sessionId,
            generation: state.generation,
            operationId: window.crypto.randomUUID(),
            page: 1,
          });
        });
        assert.equal(unsupported.error.code, "QUEUE_LIST_ROUTE");
        if (declarationMatrix) {
          const { openForm, submit } = require("./queue-declaration.cjs");
          const queue = "bunnies-new-detailed";
          const form = await openForm(page, { name: queue });
          await submit(form, "Declaração confirmada");
          await form
            .getByRole("button", { name: "Verificar fila", exact: true })
            .click();
          const item = page.getByRole("dialog", { name: queue, exact: true });
          await item.getByText("classic", { exact: true }).first().waitFor();
          await page.keyboard.press("Escape");
          await item.waitFor({ state: "hidden" });
          declaredQueues.push({
            vhost: "detailed",
            name: queue,
            type: "classic",
            arguments: { "x-queue-type": "classic" },
          });
          checks.push(
            "real-declaration-and-exact-detail-in-detailed-without-global-list",
          );
        }
        await openConnections();
        checks.push(
          "real-queue-stale-generation-temporary-vhost-and-detailed-refusal",
        );
      }
      await page
        .getByRole("button", { name: "Listar vhosts", exact: true })
        .click();
      await page.getByText(/Lista completa recebida:/).waitFor();
      await selectVhost(page, "/");
      await awaitSession(s => s.state === "ready" && s.profile.vhost === "/");
      await page
        .getByRole("button", { name: "Desconectar", exact: true })
        .click();
      await awaitSession(s => s.state === "closed" && !s.stopping);
      await noConnections();
      await page.getByRole("button", { name: "Conectar", exact: true }).click();
      await awaitSession(s => s.state === "ready" && s.profile.vhost === "/");
      assert.deepEqual(await readFile(profileFile), saved);
      checks.push(
        "real-vhost-switch-preserves-profile-exact-name-and-reactivation",
      );
      if (queuesMatrix) {
        await page
          .getByRole("button", { name: "Desconectar", exact: true })
          .click();
        await awaitSession(s => s.state === "closed" && !s.stopping);
        await edit({ Usuário: "bunnies-no-tag" });
        await page
          .getByRole("button", { name: "Conectar", exact: true })
          .click();
        await awaitSession(
          s => s.amqps.phase === "available" && s.https.phase === "failed",
        );
        const denied = await page.evaluate(async () => {
          const state = (await window.bunnies.getSessionState()).value;
          return window.bunnies.listSessionQueues({
            sessionId: state.sessionId,
            generation: state.generation,
            operationId: window.crypto.randomUUID(),
            page: 1,
          });
        });
        assert.equal(denied.error.code, "UNAVAILABLE");
        assert.equal((await oneConnection())[0].user, "bunnies-no-tag");
        await page
          .getByRole("button", { name: "Desconectar", exact: true })
          .click();
        await awaitSession(s => s.state === "closed" && !s.stopping);
        await edit({ Usuário: username });
        await page
          .getByRole("button", { name: "Conectar", exact: true })
          .click();
        await awaitSession(s => s.state === "ready");
        checks.push("real-queue-access-denied-when-HTTPS-authentication-fails");
      }
      const first = await sessionState();
      assert.equal(first.flow, "unknown");
      const holdUntil = Date.now() + 22000;
      while (Date.now() < holdUntil) {
        if ((await sessionState()).paused) {
          await focusSessionWindow();
        }
        await sleep(400);
      }
      assert.equal((await sessionState()).state, "ready");
      const connections = await api("connections");
      assert.equal(connections.length, 1);
      assert.equal(connections[0].vhost, "/");
      assert.equal(connections[0].timeout, 10);
      assert.equal(connections[0].channels, 0);
      assert.equal(connections[0].frame_max, 131072);
      assert.ok((await sessionState()).https.checkedAt > first.https.checkedAt);
      const busy = await page.evaluate(async () => {
        const p = (await window.bunnies.listProfiles()).value;
        return window.bunnies.testProfileHttps({
          profileId: p.profiles[0].id,
          revision: p.revision,
          operationId: window.crypto.randomUUID(),
        });
      });
      assert.equal(busy.error.code, "UNAVAILABLE");
      checks.push(
        "real-session-22-second-heartbeats-zero-channels-periodic-HTTPS-probe-exclusion",
      );
      await win.evaluate(window => window.minimize());
      await awaitSession(s => s.paused, 25000, false);
      const paused = (await sessionState()).https.checkedAt;
      await sleep(8000);
      assert.equal((await sessionState()).https.checkedAt, paused);
      assert.equal((await oneConnection()).length, 1);
      await focusSessionWindow();
      await awaitSession(s => !s.paused);
      await awaitSession(s => !s.paused && s.https.checkedAt > paused);
      checks.push("real-background-retains-AMQP-pauses-HTTPS-and-resumes");
      amqpForward.cut();
      await awaitSession(
        s => s.amqps.phase === "failed" && s.https.phase === "available",
      );
      await sleep(2500);
      amqpForward.blocked = false;
      await awaitSession(s => s.state === "ready");
      const recovered = await sessionState();
      assert.ok(recovered.generation > first.generation);
      assert.ok(recovered.amqps.retries > 0 && recovered.amqps.retries <= 5);
      assert.equal((await oneConnection()).length, 1);
      checks.push(
        "real-AMQP-cut-independent-partial-state-bounded-recovery-new-generation",
      );
      httpsForward.cut();
      await awaitSession(
        s => s.https.phase === "failed" && s.amqps.phase === "available",
      );
      assert.equal((await oneConnection()).length, 1);
      httpsForward.blocked = false;
      await awaitSession(s => s.state === "ready");
      assert.ok((await sessionState()).https.retries > 0);
      checks.push("real-HTTPS-cut-preserves-AMQP-independent-recovery");
      amqpForward.cut();
      httpsForward.cut();
      await awaitSession(
        s => s.amqps.phase === "failed" && s.https.phase === "failed",
        30000,
      );
      const bothFailed = await sessionState();
      assert.equal(bothFailed.state, "reconnecting");
      amqpForward.blocked = false;
      httpsForward.blocked = false;
      await awaitSession(s => s.state === "ready");
      const bothRecovered = await sessionState();
      assert.ok(
        bothRecovered.amqps.retries > recovered.amqps.retries &&
          bothRecovered.amqps.retries <= 5,
      );
      assert.ok(
        bothRecovered.https.retries > 0 && bothRecovered.https.retries <= 5,
      );
      await oneConnection();
      checks.push(
        "real-simultaneous-cuts-recovery-without-resetting-retry-budgets",
      );
      await page
        .getByRole("button", { name: "Desconectar", exact: true })
        .click();
      await awaitSession(s => s.state === "closed" && !s.stopping);
      assert.equal((await sessionState()).closeConfirmed, true);
      await noConnections();
      checks.push("real-session-close-ack-and-zero-retained-connections");
      const partitionRelay =
        await require("./vhost-gate.cjs").startPartitionRelay(amqpsPort);
      try {
        await edit({
          "Endpoint AMQPS": `amqps://127.0.0.1:${partitionRelay.port}/%2F`,
        });
        await page
          .getByRole("button", { name: "Conectar", exact: true })
          .click();
        await awaitSession(s => s.state === "ready");
        await page
          .getByRole("button", { name: "Listar vhosts", exact: true })
          .click();
        await page.getByText(/Lista completa recebida:/).waitFor();
        partitionRelay.partition();
        await selectVhost(page, "equipe/pedidos");
        await awaitSession(s => s.amqps.error === "AMQP_REMOTE_UNCONFIRMED");
        assert.equal((await sessionState()).https.phase, "available");
        assert.equal(partitionRelay.attemptCount(), 1);
        assert.equal((await oneConnection())[0].vhost, "/");
        await page
          .getByRole("button", { name: "Desconectar", exact: true })
          .click();
        await awaitSession(s => s.state === "closed" && !s.stopping);
      } finally {
        await partitionRelay.cleanup();
      }
      await noConnections();
      checks.push("real-unconfirmed-close-does-not-open-replacement");
      await edit({
        "Endpoint AMQPS": `amqps://127.0.0.1:${amqpsPort}/%2F`,
        "Endpoint HTTPS": `https://127.0.0.1:${httpsPort}`,
      });
    } catch (error) {
      report.sessionFailure = error.message;
      throw error;
    } finally {
      const cleaned = await Promise.allSettled(
        forwarders.map(async f => {
          for (const socket of f.sockets) socket.destroy();
          await new Promise(resolve => f.server.close(resolve));
          for (let attempt = 0; f.sockets.size; attempt++) {
            assert.ok(attempt < 100, "Forwarding relay retained sockets");
            await sleep(20);
          }
        }),
      );
      assert.ok(
        cleaned.every(result => result.status === "fulfilled"),
        "Forwarding relay cleanup failed",
      );
    }
    // Opaque TCP relay: the real broker receives the client's TLS hello but
    // replies are held, making cancellation/deadline reproducible before SASL.
    relay = net.createServer(client => {
      const upstream = net.connect(amqpsPort, "127.0.0.1");
      for (const socket of [client, upstream]) {
        relaySockets.add(socket);
        socket.on("error", () => undefined);
        socket.once("close", () => relaySockets.delete(socket));
      }
      client.pipe(upstream);
      upstream.on("data", chunk => {
        relayBytes += chunk.length;
      });
      client.once("close", () => upstream.destroy());
      upstream.once("close", () => client.destroy());
    });
    await new Promise(resolve => relay.listen(0, "127.0.0.1", resolve));
    await edit({
      "Endpoint AMQPS": `amqps://127.0.0.1:${relay.address().port}/%2F`,
    });
    await page
      .getByRole("button", { name: "Testar AMQPS", exact: true })
      .click();
    for (let attempt = 0; relayBytes === 0; attempt++) {
      assert.ok(
        attempt < 100,
        "Real broker did not answer TLS through the relay",
      );
      await sleep(20);
    }
    assert.equal(
      await page
        .getByRole("button", { name: "Testar HTTPS", exact: true })
        .isDisabled(),
      true,
    );
    await page
      .getByRole("button", { name: "Cancelar teste AMQPS", exact: true })
      .click();
    await page
      .getByText("Teste AMQPS cancelado. Nenhuma sessão foi ativada.", {
        exact: true,
      })
      .waitFor();
    await noConnections();
    checks.push(
      "cancel-during-real-broker-TLS-with-opaque-relay-and-mutual-exclusion",
    );
    const start = Date.now();
    await test("AMQPS", "O teste AMQPS excedeu o prazo total de 15 segundos.");
    report.deadlineMs = Date.now() - start;
    assert.ok(report.deadlineMs >= 14500 && report.deadlineMs < 20000);
    for (let attempt = 0; relaySockets.size; attempt++) {
      assert.ok(
        attempt < 100,
        "Relay retained a socket after cancellation/deadline",
      );
      await sleep(20);
    }
    checks.push("15-second-deadline-and-owned-relay-sockets-released");
    await page
      .getByRole("button", { name: "Editar perfil", exact: true })
      .click();
    const trustDialog = page.getByRole("dialog", {
      name: "Editar perfil",
      exact: true,
    });
    await trustDialog
      .getByLabel("Endpoint AMQPS", { exact: true })
      .fill(`amqps://127.0.0.1:${amqpsPort}/%2F`);
    await trustDialog
      .getByLabel("Confiança TLS", { exact: true })
      .selectOption("default");
    await trustDialog
      .getByRole("button", { name: "Salvar perfil", exact: true })
      .click();
    await trustDialog.waitFor({ state: "hidden" });
    const tlsFailure =
      "A validação TLS falhou. Confira CA, validade e identidade do servidor.";
    await test("AMQPS", tlsFailure);
    await test("HTTPS", tlsFailure);
    checks.push("default-trust-rejects-private-CA-both-real-endpoints");
    await page.getByRole("button", { name: "Conectar", exact: true }).click();
    await awaitSession(s => s.state === "closed");
    const rejected = await sessionState();
    assert.equal(rejected.https.error, "TEST_TLS");
    assert.equal(rejected.amqps.error, "TEST_TLS");
    assert.equal(rejected.https.retries, 0);
    assert.equal(rejected.amqps.retries, 0);
    await noConnections();
    checks.push("real-session-untrusted-CA-terminal-no-retry-both-endpoints");
    // Inspect actual server events as well as the application's visible results.
    const logs = (await docker("logs", container))
      .replaceAll(password, "[REDACTED]")
      .replaceAll(observerPassword, "[REDACTED]");
    await writeFile(`out/rabbitmq-real-${version}-broker.log`, logs);
    for (const vhost of [
      "/",
      "equipe/pedidos",
      "literal%2F",
      "área pedidos",
      ".",
    ])
      assert.ok(
        logs.includes(`authenticated and granted access to vhost '${vhost}'`),
        `Missing broker vhost proof: ${vhost}`,
      );
    assert.ok(logs.includes("closing AMQP connection"));
    checks.push("broker-log-confirms-exact-vhosts-and-connection-close");
    assert.deepEqual(
      await queueIdentity(),
      [...initialQueues, ...declaredQueues].sort(
        (a, b) =>
          a.vhost.localeCompare(b.vhost) || a.name.localeCompare(b.name),
      ),
    );
    assert.equal((await api("consumers")).length, 0);
    if (initialExchanges) {
      assert.deepEqual(await exchangeTopology(), initialExchanges);
      checks.push("real-exchanges-and-bindings-inventory-unchanged");
    }
    const overview = await api("overview");
    report.churn = overview.churn_rates;
    if (purgeMatrix) {
      assert.equal(overview.object_totals.channels, 0);
      assert.equal(overview.churn_rates?.channel_created, 3);
      assert.equal(
        (
          await api(
            `${purgeFixture.queueRoute("/", purgeFixture.specialName)}?columns=messages_ready`,
          )
        ).messages_ready,
        1,
      );
      checks.push(
        "homonym-in-other-vhost-kept-messages-and-broker-topology-unchanged",
      );
    } else assert.equal(overview.churn_rates?.channel_created, 0);
    assert.deepEqual(requests, []);
    assert.deepEqual(errors, []);
    assert.equal(await page.url(), "bunnies://app/app_window/index.html");
    checks.push(
      purgeMatrix
        ? "no-client-channels-or-consumers-live-connections-or-renderer-network"
        : exchangesMatrix
          ? "no-topology-changes-consumers-channels-connections-or-renderer-network"
          : declarationMatrix
            ? "only-declared-queues-changed-no-consumers-channels-connections-or-renderer-network"
            : queuesMatrix
              ? "fixture-queues-unchanged-no-consumers-channels-connections-or-renderer-network"
              : "no-queues-consumers-live-channels-connections-or-renderer-network",
    );
    report.app = await app.evaluate(({ app }) => ({
      version: app.getVersion(),
      electron: process.versions.electron,
      node: process.versions.node,
    }));
    report.passed = true;
  } finally {
    const cleanupErrors = [];
    if (app)
      try {
        await app.close();
      } catch {
        cleanupErrors.push("application");
      }
    if (relay) {
      for (const socket of relaySockets) socket.destroy();
      try {
        await new Promise(resolve => relay.close(resolve));
      } catch {
        cleanupErrors.push("relay");
      }
    }
    if (container) {
      try {
        const owned = JSON.parse(await docker("inspect", container))[0];
        assert.equal(owned.Config.Labels["bunnies.test"], name);
        await docker("rm", "--force", "--volumes", container);
      } catch {
        cleanupErrors.push("container");
      }
    }
    if (network)
      try {
        await docker("network", "rm", network);
      } catch {
        cleanupErrors.push("network");
      }
    try {
      await rm(root, { recursive: true, force: true });
    } catch {
      cleanupErrors.push("temporary-data");
    }
    try {
      await fixture.cleanup();
    } catch {
      cleanupErrors.push("certificates");
    }
    report.cleanup = cleanupErrors.length === 0;
    report.cleanupErrors = cleanupErrors;
    await writeFile(
      `out/${reportPrefix}-${version}-results.json`,
      JSON.stringify(report, null, 2) + "\n",
    );
    assert.deepEqual(cleanupErrors, [], "Owned fixture cleanup failed");
  }
  console.log(
    `RabbitMQ ${version}: ${checks.length} checks passed; owned resources removed`,
  );
  return report;
}
async function run() {
  try {
    if (purgeGate)
      managementAdapter =
        await require("./management-gate.cjs").prepareGateAdapter(
          "src/main/management/queuePurge.ts",
        );
    if (declarationGate)
      managementAdapter =
        await require("./management-gate.cjs").prepareGateAdapter(
          "src/main/management/queueDeclaration.ts",
        );
    if (managementGateA || vhostGate || queuesGate || exchangesGate)
      managementAdapter =
        await require("./management-gate.cjs").prepareManagementGate();
    if (vhostGate)
      amqpsAdapter = await require("./management-gate.cjs").prepareGateAdapter(
        "src/main/connections/amqpsConnection.ts",
      );
    if (revisedVhostGate)
      switchAdapter = await require("./management-gate.cjs").prepareGateAdapter(
        "src/main/sessions/vhostSwitch.ts",
      );
    await runMatrix();
  } finally {
    try {
      await switchAdapter?.cleanup();
    } finally {
      try {
        await amqpsAdapter?.cleanup();
      } finally {
        await managementAdapter?.cleanup();
      }
    }
  }
}
async function runMatrix() {
  const reports = [];
  for (const version of versions) reports.push(await runVersion(version));
  await writeFile(
    `out/${reportPrefix}-results.json`,
    JSON.stringify(
      {
        platform: process.platform,
        architecture: process.arch,
        reports,
      },
      null,
      2,
    ) + "\n",
  );
  if (reports.some(report => !report.passed || !report.cleanup))
    process.exitCode = 1;
}
run().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
