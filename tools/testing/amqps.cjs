const assert = require("node:assert/strict");
const { mkdtemp, readFile, writeFile, rm } = require("node:fs/promises");
const { tmpdir } = require("node:os");
const path = require("node:path");
const { randomUUID } = require("node:crypto");
const { _electron: electron } = require("playwright");
const { createTlsFixture } = require("./tls-fixture.cjs");
const { createAmqpPeer } = require("./amqp-fixture.cjs");
const sentinel = "BUNNIES-AMQPS-PACKAGE-SYNTHETIC-SENTINEL";
const messages = {
  ok: "Autenticação AMQPS e vhost verificados",
  refused:
    "O broker recusou a negociação AMQP. Confira autenticação e acesso ao vhost.",
  protocol: "O endpoint não concluiu uma negociação AMQP 0-9-1 compatível.",
  cancelled: "Teste AMQPS cancelado. Nenhuma sessão foi ativada.",
  timeout: "O teste AMQPS excedeu o prazo total de 15 segundos.",
  close:
    "O fechamento da conexão AMQPS não foi confirmado no prazo. Os recursos locais foram encerrados.",
  tls: "A validação TLS falhou. Confira CA, validade e identidade do servidor.",
};
async function until(predicate) {
  const started = Date.now();
  while (!predicate()) {
    if (Date.now() - started > 3000)
      throw new Error("AMQPS fixture resource cleanup timed out");
    await new Promise(resolve => setTimeout(resolve, 20));
  }
}
async function run() {
  const fixture = await createTlsFixture();
  const userData = await mkdtemp(path.join(tmpdir(), "bunnies-amqps-package-"));
  const file = path.join(userData, "profiles.json");
  let app, peer;
  const errors = [],
    requests = [];
  try {
    peer = await createAmqpPeer(fixture);
    const id = randomUUID();
    const initial = JSON.stringify({
      schemaVersion: 2,
      writeId: randomUUID(),
      profiles: [
        {
          id,
          name: "AMQP isolado",
          environment: "production",
          httpsUrl: "https://127.0.0.1:1",
          amqpsUrl: peer.url + "/equipe%2Fpedidos",
          username: "synthetic:user",
          secret: { mode: "memory" },
          trust: { mode: "custom", pem: fixture.ca },
        },
      ],
    });
    await writeFile(file, initial, { mode: 0o600 });
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
    let page = await app.firstWindow();
    function observe() {
      page.setDefaultTimeout(25000);
      page.on("pageerror", error => errors.push(error.message));
      page.on("request", request => {
        if (!request.url().startsWith("bunnies://app/"))
          requests.push(request.url());
      });
    }
    observe();
    const select = () =>
      page.getByRole("button", { name: /AMQP isolado/ }).click();
    const test = () =>
      page.getByRole("button", { name: "Testar AMQPS", exact: true });
    const cancel = () =>
      page.getByRole("button", { name: "Cancelar teste AMQPS", exact: true });
    const region = () =>
      page.getByRole("region", {
        name: "Teste de autenticação AMQPS",
        exact: true,
      });
    async function edit() {
      await page
        .getByRole("button", { name: "Editar perfil", exact: true })
        .click();
      return page.getByRole("dialog", { name: "Editar perfil", exact: true });
    }
    async function save(dialog) {
      await dialog
        .getByRole("button", { name: "Salvar perfil", exact: true })
        .click();
      await dialog.waitFor({ state: "hidden" });
    }
    async function capture(name) {
      await page.evaluate(
        () =>
          new Promise(resolve =>
            window.requestAnimationFrame(() =>
              window.requestAnimationFrame(resolve),
            ),
          ),
      );
      const win = await app.browserWindow(page);
      const png = await win.evaluate(async window =>
        (await window.capturePage()).toPNG().toString("base64"),
      );
      await writeFile(`out/amqps-4a2b-${name}.png`, Buffer.from(png, "base64"));
    }
    await select();
    assert.equal(peer.attempts, 0);
    assert.equal(await readFile(file, "utf8"), initial);
    assert.equal(await test().isDisabled(), true);
    const missing = await page.evaluate(async () => {
      const list = await window.bunnies.listProfiles();
      return window.bunnies.testProfileAmqps({
        profileId: list.value.profiles[0].id,
        revision: list.value.revision,
        operationId: window.crypto.randomUUID(),
      });
    });
    assert.equal(missing.error.code, "AMQP_CREDENTIALS");
    assert.equal(peer.attempts, 0);
    let dialog = await edit();
    await dialog.getByLabel("Senha", { exact: true }).selectOption("replace");
    await dialog.getByLabel("Nova senha", { exact: true }).fill(sentinel);
    await save(dialog);
    assert.equal(peer.attempts, 0);
    let saved = await readFile(file, "utf8");
    assert.ok(!saved.includes(sentinel));
    assert.equal(JSON.parse(saved).schemaVersion, 2);
    await test().focus();
    await page.keyboard.press("Enter");
    await region().getByText(messages.ok, { exact: true }).waitFor();
    await until(() => peer.sockets.size === 0);
    assert.equal(peer.attempts, 1);
    assert.deepEqual(peer.records[0].methods, [
      "10.11",
      "10.31",
      "10.40",
      "10.50",
    ]);
    assert.ok(peer.records[0].channels.every(channel => channel === 0));
    assert.equal(peer.records[0].vhost, "equipe/pedidos");
    assert.equal(
      peer.records[0].credentials.response,
      "\0synthetic:user\0" + sentinel,
    );
    assert.equal(peer.records[0].closeConfirmed, true);
    assert.deepEqual(peer.records[0].tune, {
      channelMax: 1,
      frameMax: 131072,
      heartbeat: 10,
    });
    assert.ok(await region().locator("time").getAttribute("datetime"));
    assert.equal(await readFile(file, "utf8"), saved);
    await page
      .getByRole("combobox", { name: "Tema", exact: true })
      .selectOption("light");
    await region().scrollIntoViewIfNeeded();
    await capture("success-light");
    await page
      .getByRole("combobox", { name: "Tema", exact: true })
      .selectOption("dark");
    await page.waitForFunction(
      () => document.documentElement.dataset.theme === "dark",
    );
    await capture("success-dark");
    for (const [mode, message] of [
      ["refuseAuth", messages.refused],
      ["refuseVhost", messages.refused],
      ["protocol", messages.protocol],
      ["oversize", messages.protocol],
      ["stallClose", messages.close],
      ["blocked", messages.close],
    ]) {
      peer.mode = mode;
      const previous = peer.attempts;
      await test().click();
      await region()
        .getByRole("alert")
        .getByText(message, { exact: true })
        .waitFor();
      await until(() => peer.sockets.size === 0);
      assert.equal(peer.attempts, previous + 1);
      assert.ok(
        !(await region()
          .textContent()
          .then(text => text.includes("SYNTHETIC-UNTRUSTED"))),
      );
    }
    peer.mode = "ok";
    dialog = await edit();
    await dialog
      .getByLabel("Endpoint AMQPS", { exact: true })
      .fill(`amqps://localhost:${peer.port}/equipe%2Fpedidos`);
    await save(dialog);
    await test().click();
    await region().getByText(messages.ok, { exact: true }).waitFor();
    await until(() => peer.sockets.size === 0);
    assert.equal(peer.records.at(-1).vhost, "equipe/pedidos");
    peer.mode = "stallTune";
    await test().click();
    await until(() => peer.sockets.size === 1);
    assert.equal(
      await page
        .getByRole("button", { name: "Testar HTTPS", exact: true })
        .isDisabled(),
      true,
    );
    const concurrent = await page.evaluate(async () => {
      const list = await window.bunnies.listProfiles();
      return window.bunnies.testProfileHttps({
        profileId: list.value.profiles[0].id,
        revision: list.value.revision,
        operationId: window.crypto.randomUUID(),
      });
    });
    assert.equal(concurrent.error.code, "UNAVAILABLE");
    await cancel().click();
    await region().getByText(messages.cancelled, { exact: true }).waitFor();
    await until(() => peer.sockets.size === 0);
    const started = Date.now();
    await test().click();
    await region().getByText(messages.timeout, { exact: true }).waitFor();
    const deadlineMs = Date.now() - started;
    assert.ok(deadlineMs >= 14000 && deadlineMs < 20000);
    await until(() => peer.sockets.size === 0);
    // Editing while a test is pending invalidates its result and closes its socket.
    await test().click();
    await until(() => peer.sockets.size === 1);
    dialog = await edit();
    await dialog
      .getByLabel("Nome do perfil", { exact: true })
      .fill("AMQP isolado revisado");
    await save(dialog);
    await until(() => peer.sockets.size === 0);
    assert.equal(
      await region().getByText(messages.ok, { exact: true }).count(),
      0,
    );
    saved = await readFile(file, "utf8");
    // Reload and real macOS window close cancel pending handshakes without losing
    // in-memory credentials until full process quit.
    await test().click();
    await until(() => peer.sockets.size === 1);
    await page.reload();
    await until(() => peer.sockets.size === 0);
    await select();
    assert.equal(await test().isEnabled(), true);
    if (process.platform === "darwin") {
      await test().click();
      await until(() => peer.sockets.size === 1);
      const closed = page.waitForEvent("close");
      await page.evaluate(() => {
        void window.bunnies.close();
      });
      await closed;
      await until(() => peer.sockets.size === 0);
      const opened = app.waitForEvent("window");
      await app.evaluate(({ app }) => app.emit("activate"));
      page = await opened;
      observe();
      await select();
      assert.equal(await test().isEnabled(), true);
    }
    peer.mode = "ok";
    await test().click();
    await region().getByText(messages.ok, { exact: true }).waitFor();
    await until(() => peer.sockets.size === 0);
    const win = await app.browserWindow(page);
    await win.evaluate(window => {
      window.setContentSize(1024, 700);
      window.webContents.setZoomFactor(2);
    });
    await page.waitForFunction(() => window.innerWidth <= 512);
    await test().scrollIntoViewIfNeeded();
    await test().focus();
    assert.equal(
      await test().evaluate(button => button === document.activeElement),
      true,
    );
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth + 1,
      ),
      true,
    );
    await capture("zoom200");
    await win.evaluate(window => {
      window.webContents.setZoomFactor(1);
      window.setContentSize(1200, 800);
    });
    peer.mode = "stallStart";
    await test().click();
    await until(() => peer.sockets.size === 1);
    await app.close();
    app = undefined;
    await until(() => peer.sockets.size === 0);
    app = await electron.launch({
      executablePath,
      args: [`--user-data-dir=${userData}`],
      chromiumSandbox: true,
      timeout: 30000,
    });
    page = await app.firstWindow();
    observe();
    await select();
    assert.equal(await test().isDisabled(), true);
    dialog = await edit();
    await dialog.getByLabel("Senha", { exact: true }).selectOption("replace");
    await dialog.getByLabel("Nova senha", { exact: true }).fill(sentinel);
    await save(dialog);
    peer.mode = "ok";
    dialog = await edit();
    await dialog
      .getByLabel("Endpoint AMQPS", { exact: true })
      .fill(peer.url + "/");
    await save(dialog);
    const previous = peer.attempts;
    await test().click();
    await region().getByRole("alert").waitFor();
    assert.equal(peer.attempts, previous);
    dialog = await edit();
    await dialog
      .getByLabel("Endpoint AMQPS", { exact: true })
      .fill(peer.url + "/equipe%2Fpedidos");
    await dialog
      .getByLabel("Confiança TLS", { exact: true })
      .selectOption("default");
    await save(dialog);
    const records = peer.records.length;
    await test().click();
    await region().getByText(messages.tls, { exact: true }).waitFor();
    await until(() => peer.sockets.size === 0);
    assert.equal(peer.records.length, records);
    const dto = await page.evaluate(() => window.bunnies.listProfiles());
    assert.ok(!JSON.stringify(dto).includes(sentinel));
    assert.ok(!JSON.stringify(dto).includes("BEGIN CERTIFICATE"));
    assert.ok(
      !(await readFile(file, "utf8").then(text => text.includes(sentinel))),
    );
    assert.equal(
      await page.evaluate(
        sentinel =>
          JSON.stringify({ ...window.localStorage }).includes(sentinel),
        sentinel,
      ),
      false,
    );
    for (const name of ["Visão geral", "Filas", "Exchanges", "Publicar"])
      assert.equal(
        await page.getByRole("button", { name, exact: true }).isDisabled(),
        true,
      );
    assert.equal(page.url(), "bunnies://app/app_window/index.html");
    assert.deepEqual(errors, []);
    assert.deepEqual(requests, []);
    const versions = await app.evaluate(() => ({
      node: process.versions.node,
      electron: process.versions.electron,
    }));
    const report = {
      result: "passed",
      platform: process.platform,
      arch: process.arch,
      ...versions,
      noAutomaticConnection: true,
      noCredentialsNoNetwork: true,
      credentialsMainOnly: true,
      vhostPreserved: true,
      confirmedCloseNoChannels: true,
      noTopologyOrMessages: true,
      refusalAndProtocolErrors: true,
      blockedCloseNotSuccess: true,
      sharedConcurrency: true,
      cancellation: true,
      deadlineMs,
      profileInvalidation: true,
      reloadCleanup: true,
      windowCloseCleanup: process.platform === "darwin",
      processQuitCleanup: true,
      memoryClearedOnQuit: true,
      socketsClean: true,
      dnsAndIpInPackagedRuntime: true,
      zoom200: true,
      defaultCaRejectsFixture: true,
      noSessionActivated: true,
      chromiumExternalRequests: requests.length,
      fixture: "isolated Node TLS with scripted AMQP handshake; not RabbitMQ",
    };
    await writeFile(
      "out/amqps-4a2b-results.json",
      JSON.stringify(report, null, 2) + "\n",
    );
    console.log(JSON.stringify(report));
  } finally {
    try {
      if (app) await app.close();
    } finally {
      if (peer) await peer.close();
      await fixture.cleanup();
      await rm(userData, { recursive: true, force: true });
    }
  }
}
run().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
