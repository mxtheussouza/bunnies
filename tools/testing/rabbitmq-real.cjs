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
          })),
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
      `out/rabbitmq-real-${version}-results.json`,
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
  const reports = [];
  for (const version of versions) reports.push(await runVersion(version));
  await writeFile(
    "out/rabbitmq-real-4a2b-results.json",
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
}
run().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
