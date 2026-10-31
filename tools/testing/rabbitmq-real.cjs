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
assert.ok(
  process.argv.slice(2).length <= 1 &&
    process.argv
      .slice(2)
      .every(arg => ["--management-gate", "--management-gate-a"].includes(arg)),
);
const managementFixture = managementGate || managementGateA;
const reportPrefix = managementGateA
  ? "management-gate-A-4b1"
  : managementGate
    ? "management-gate-4b1"
    : "rabbitmq-real";
let managementAdapter;
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
  const vhosts = [
    "/",
    "equipe/pedidos",
    "literal%2F",
    "área pedidos",
    ".",
    "negado",
    ...(managementFixture
      ? [
          "..",
          ...Array.from(
            { length: managementGateA ? 194 : 110 },
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
          path: `/api/${route}`,
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
      ...(managementFixture
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
            configure: "^$",
            write: "^$",
            read: "^$",
          }))
          .concat(
            managementFixture
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
          ),
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
          httpsUrl: `https://127.0.0.1:${httpsPort}`,
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
      "Endpoint HTTPS": `https://localhost:${httpsPort}`,
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
    async function awaitSession(predicate, limit = 25000, foreground = true) {
      const end = Date.now() + limit;
      while (!(await predicate(await sessionState()))) {
        assert.ok(Date.now() < end, "Real session transition timed out");
        if (foreground && (await sessionState()).paused) {
          await app.evaluate(({ app }) => app.focus({ steal: true }));
          const window = await app.browserWindow(page);
          await window.evaluate(w => {
            w.restore();
            w.show();
            w.focus();
          });
        }
        await sleep(50);
      }
    }
    try {
      const amqpForward = await forward(amqpsPort),
        httpsForward = await forward(httpsPort);
      await edit({
        "Endpoint AMQPS": `amqps://127.0.0.1:${amqpForward.port}/%2F`,
        "Endpoint HTTPS": `https://127.0.0.1:${httpsForward.port}`,
      });
      const win = await app.browserWindow(page);
      await win.evaluate(window => {
        window.restore();
        window.show();
        window.focus();
      });
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
      const first = await sessionState();
      assert.equal(first.flow, "unknown");
      const holdUntil = Date.now() + 22000;
      while (Date.now() < holdUntil) {
        if ((await sessionState()).paused) {
          await app.evaluate(({ app }) => app.focus({ steal: true }));
          await win.evaluate(window => window.focus());
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
      await win.evaluate(window => {
        window.restore();
        window.show();
        window.focus();
      });
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
    assert.equal((await api("queues")).length, 0);
    assert.equal((await api("consumers")).length, 0);
    const overview = await api("overview");
    report.churn = overview.churn_rates;
    assert.equal(overview.churn_rates?.channel_created, 0);
    assert.deepEqual(requests, []);
    assert.deepEqual(errors, []);
    assert.equal(await page.url(), "bunnies://app/app_window/index.html");
    checks.push(
      "no-queues-consumers-live-channels-connections-or-renderer-network",
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
  if (managementGateA)
    managementAdapter =
      await require("./management-gate.cjs").prepareManagementGate();
  try {
    await runMatrix();
  } finally {
    await managementAdapter?.cleanup();
  }
}
async function runMatrix() {
  const reports = [];
  for (const version of versions) reports.push(await runVersion(version));
  await writeFile(
    managementGateA
      ? "out/management-gate-A-4b1-results.json"
      : managementGate
        ? "out/management-gate-4b1-results.json"
        : "out/rabbitmq-real-4b1-results.json",
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
