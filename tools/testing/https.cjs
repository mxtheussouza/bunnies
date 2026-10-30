const assert = require("node:assert/strict");
const {
  mkdtemp,
  readFile,
  writeFile,
  rm,
  readdir,
} = require("node:fs/promises");
const { tmpdir } = require("node:os");
const path = require("node:path");
const { randomUUID } = require("node:crypto");
const { createServer } = require("node:https");
const { createServer: createProxyTrap } = require("node:http");
const { _electron: electron } = require("playwright");
const { createTlsFixture } = require("./tls-fixture.cjs");
const messages = {
  ok: "Autenticação HTTPS verificada",
  auth: "Autenticação HTTPS recusada. Confira usuário e senha.",
  forbidden: "O acesso HTTPS foi negado por permissão.",
  redirect:
    "O endpoint respondeu com redirecionamento. Confira a URL; ele não foi seguido.",
  cancelled: "Teste HTTPS cancelado. Nenhuma sessão foi ativada.",
  timeout: "O teste HTTPS excedeu o prazo total de 10 segundos.",
  tls: "A validação TLS falhou. Confira CA, validade e identidade do servidor.",
};
const sentinel = "BUNNIES-HTTPS-PACKAGE-SYNTHETIC-SENTINEL";
async function until(predicate) {
  const deadline = Date.now() + 3000;
  while (!predicate()) {
    if (Date.now() > deadline)
      throw new Error("Timed out waiting for fixture resource cleanup");
    await new Promise(resolve => setTimeout(resolve, 20));
  }
}
async function run() {
  const fixture = await createTlsFixture();
  const userData = await mkdtemp(path.join(tmpdir(), "bunnies-https-package-"));
  const file = path.join(userData, "profiles.json");
  const backup = path.join(userData, "profiles.v1.backup.json");
  let application;
  let server;
  let proxy;
  let proxyRequests = 0;
  const sockets = new Set();
  let mode = "ok",
    requests = 0;
  const paths = [],
    errors = [],
    chromiumRequests = [];
  try {
    server = createServer(
      { key: fixture.key, cert: fixture.cert },
      (req, res) => {
        requests++;
        paths.push(req.url);
        assert.equal(req.url, "/prefix/api/whoami");
        assert.equal(
          req.headers.authorization,
          "Basic " +
            Buffer.from("synthetic-user:" + sentinel).toString("base64"),
        );
        const status = {
          ok: 200,
          auth: 401,
          forbidden: 403,
          redirect: 302,
          hang: 200,
        }[mode];
        res.writeHead(status, {
          "Content-Type": "application/json",
          ...(mode === "redirect" ? { Location: "/must-not-follow" } : {}),
        });
        if (mode === "hang") res.write("{");
        else
          res.end(
            mode === "ok"
              ? JSON.stringify({ name: "synthetic-user" })
              : JSON.stringify({ secret: sentinel }),
          );
      },
    );
    server.on("secureConnection", socket => {
      sockets.add(socket);
      socket.once("close", () => sockets.delete(socket));
    });
    await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
    proxy = createProxyTrap((_req, res) => {
      proxyRequests++;
      res.writeHead(502);
      res.end();
    });
    proxy.on("connect", (_req, socket) => {
      proxyRequests++;
      socket.end("HTTP/1.1 502 Bad Gateway\r\nConnection: close\r\n\r\n");
    });
    await new Promise(resolve => proxy.listen(0, "127.0.0.1", resolve));
    const proxyUrl = `http://127.0.0.1:${proxy.address().port}`;
    const profileId = randomUUID();
    const original = JSON.stringify({
      schemaVersion: 1,
      writeId: randomUUID(),
      profiles: [
        {
          id: profileId,
          name: "TLS isolado",
          environment: "production",
          httpsUrl: `https://127.0.0.1:${server.address().port}/prefix`,
          amqpsUrl: "amqps://localhost:5671",
          username: "synthetic-user",
          secret: { mode: "memory" },
        },
      ],
    });
    await writeFile(file, original, { mode: 0o600 });
    const artifact = path.resolve(
      `out/Bunnies-${process.platform}-${process.arch}`,
    );
    const executablePath = {
      darwin: path.join(artifact, "Bunnies.app/Contents/MacOS/bunnies"),
      linux: path.join(artifact, "bunnies"),
      win32: path.join(artifact, "bunnies.exe"),
    }[process.platform];
    assert.ok(executablePath);
    application = await electron.launch({
      executablePath,
      env: {
        ...process.env,
        NODE_USE_ENV_PROXY: "1",
        HTTPS_PROXY: proxyUrl,
        HTTP_PROXY: proxyUrl,
        https_proxy: proxyUrl,
        http_proxy: proxyUrl,
        NO_PROXY: "",
        no_proxy: "",
      },
      args: [`--user-data-dir=${userData}`],
      chromiumSandbox: true,
      timeout: 30000,
    });
    let page = await application.firstWindow();
    function observe(current) {
      current.setDefaultTimeout(10000);
      current.on("pageerror", error => errors.push(error.message));
      current.on("request", request => {
        if (!request.url().startsWith("bunnies://app/"))
          chromiumRequests.push(request.url());
      });
    }
    observe(page);
    await page.getByRole("button", { name: /TLS isolado/ }).click();
    assert.equal(await readFile(file, "utf8"), original);
    assert.equal(
      (await readdir(userData)).includes("profiles.v1.backup.json"),
      false,
    );
    assert.equal(
      await page
        .getByRole("button", { name: "Testar HTTPS", exact: true })
        .isDisabled(),
      true,
    );
    let snapshot = await page.evaluate(() => window.bunnies.listProfiles());
    const absent = await page.evaluate(
      input => window.bunnies.testProfileHttps(input),
      {
        profileId,
        revision: snapshot.value.revision,
        operationId: randomUUID(),
      },
    );
    assert.equal(absent.error.code, "CREDENTIALS");
    assert.equal(requests, 0);
    await application.evaluate(
      ({ dialog }, caPath) => {
        globalThis.__bunniesCaPath = caPath;
        dialog.showOpenDialog = async () => ({
          canceled: false,
          filePaths: [globalThis.__bunniesCaPath],
        });
      },
      path.join(fixture.directory, "server.key"),
    );
    async function capture(name) {
      await page.evaluate(
        () =>
          new Promise(resolve =>
            window.requestAnimationFrame(() =>
              window.requestAnimationFrame(resolve),
            ),
          ),
      );
      const win = await application.browserWindow(page);
      const bytes = await win.evaluate(async window =>
        (await window.capturePage()).toPNG().toString("base64"),
      );
      await writeFile(
        `out/https-4a2a-${name}.png`,
        Buffer.from(bytes, "base64"),
      );
    }
    await page
      .getByRole("button", { name: "Editar perfil", exact: true })
      .click();
    let dialog = page.getByRole("dialog", {
      name: "Editar perfil",
      exact: true,
    });
    await dialog
      .getByLabel("Confiança TLS", { exact: true })
      .selectOption("replace");
    await dialog
      .getByRole("button", { name: "Selecionar CA PEM", exact: true })
      .click();
    await dialog
      .getByRole("alert")
      .filter({ hasText: "Selecione um bundle PEM válido" })
      .waitFor();
    assert.equal(await readFile(file, "utf8"), original);
    await application.evaluate(
      (_electron, caPath) => {
        globalThis.__bunniesCaPath = caPath;
      },
      path.join(fixture.directory, "ca.pem"),
    );
    await dialog
      .getByRole("button", { name: "Selecionar CA PEM", exact: true })
      .focus();
    await page.keyboard.press("Enter");
    await dialog
      .getByRole("list", {
        name: "Fingerprints da CA selecionada",
        exact: true,
      })
      .waitFor();
    await dialog.getByLabel("Senha", { exact: true }).selectOption("replace");
    await dialog.getByLabel("Nova senha", { exact: true }).fill(sentinel);
    await dialog
      .getByLabel("Confiança TLS", { exact: true })
      .scrollIntoViewIfNeeded();
    await capture("ca-light");
    await dialog
      .getByRole("button", { name: "Salvar perfil", exact: true })
      .click();
    await dialog.waitFor({ state: "hidden" });
    assert.equal(await readFile(backup, "utf8"), original);
    const saved = await readFile(file, "utf8");
    assert.equal(JSON.parse(saved).schemaVersion, 2);
    assert.ok(!saved.includes(sentinel));
    assert.ok(!saved.includes(fixture.directory));
    snapshot = await page.evaluate(() => window.bunnies.listProfiles());
    assert.equal(snapshot.value.profiles[0].trust.mode, "custom");
    assert.ok(!JSON.stringify(snapshot).includes("CERTIFICATE"));
    assert.equal(requests, 0);
    const testButton = () =>
      page.getByRole("button", { name: "Testar HTTPS", exact: true });
    await testButton().click();
    await page.getByText(messages.ok, { exact: true }).waitFor();
    await until(() => sockets.size === 0);
    assert.equal(requests, 1);
    await page
      .locator('.https-test[aria-label="Teste de autenticação HTTPS"]')
      .scrollIntoViewIfNeeded();
    await capture("success-light");
    for (const current of ["auth", "forbidden", "redirect"]) {
      const before = requests;
      mode = current;
      await testButton().click();
      await page.getByText(messages[current], { exact: true }).waitFor();
      await until(() => sockets.size === 0);
      assert.equal(requests, before + 1);
      assert.ok(!(await page.locator("body").textContent()).includes(sentinel));
    }
    mode = "hang";
    let before = requests;
    await testButton().click();
    await until(() => requests === before + 1);
    await page
      .getByRole("button", { name: "Cancelar teste HTTPS", exact: true })
      .click();
    await page.getByText(messages.cancelled, { exact: true }).waitFor();
    await until(() => sockets.size === 0);
    before = requests;
    const deadlineStart = Date.now();
    await testButton().click();
    await page
      .getByText(messages.timeout, { exact: true })
      .waitFor({ timeout: 15000 });
    const deadlineMs = Date.now() - deadlineStart;
    assert.ok(deadlineMs >= 9000 && deadlineMs < 15000);
    await until(() => sockets.size === 0);
    assert.equal(requests, before + 1);
    // Saving the profile aborts an in-flight test and removes its old result.
    before = requests;
    await testButton().click();
    await until(() => requests === before + 1);
    await page
      .getByRole("button", { name: "Editar perfil", exact: true })
      .click();
    dialog = page.getByRole("dialog", { name: "Editar perfil", exact: true });
    await dialog
      .getByRole("button", { name: "Salvar perfil", exact: true })
      .click();
    await dialog.waitFor({ state: "hidden" });
    await until(() => sockets.size === 0);
    assert.equal(await page.getByText(messages.ok, { exact: true }).count(), 0);
    // Zoom/reflow also covers the new CA controls and fingerprints.
    const win = await application.browserWindow(page);
    await win.evaluate(window => {
      window.setContentSize(1024, 700);
      window.webContents.setZoomFactor(2);
    });
    await page.waitForFunction(() => window.innerWidth <= 512);
    await page
      .getByRole("button", { name: "Editar perfil", exact: true })
      .click();
    dialog = page.getByRole("dialog", { name: "Editar perfil", exact: true });
    await dialog
      .getByLabel("Confiança TLS", { exact: true })
      .selectOption("replace");
    await dialog
      .getByRole("button", { name: "Selecionar CA PEM", exact: true })
      .click();
    await dialog
      .getByRole("list", {
        name: "Fingerprints da CA selecionada",
        exact: true,
      })
      .waitFor();
    await dialog
      .getByRole("button", { name: "Salvar perfil", exact: true })
      .scrollIntoViewIfNeeded();
    await dialog
      .getByRole("button", { name: "Salvar perfil", exact: true })
      .focus();
    assert.equal(
      await dialog.evaluate(
        element => element.scrollWidth <= element.clientWidth + 1,
      ),
      true,
    );
    await capture("ca-zoom200");
    await page.keyboard.press("Escape");
    await dialog
      .getByRole("button", { name: "Descartar alterações", exact: true })
      .click();
    await dialog.waitFor({ state: "hidden" });
    await win.evaluate(window => {
      window.webContents.setZoomFactor(1);
      window.setContentSize(1440, 900);
    });
    await page
      .getByRole("combobox", { name: "Tema", exact: true })
      .selectOption("dark");
    await page.waitForFunction(
      () => document.documentElement.dataset.theme === "dark",
    );
    mode = "ok";
    await testButton().click();
    await page.getByText(messages.ok, { exact: true }).waitFor();
    await page
      .locator('.https-test[aria-label="Teste de autenticação HTTPS"]')
      .scrollIntoViewIfNeeded();
    await capture("success-dark");
    // Closing the real BrowserWindow releases the Node socket; macOS can recreate it.
    if (process.platform === "darwin") {
      mode = "hang";
      before = requests;
      await testButton().click();
      await until(() => requests === before + 1);
      const closed = page.waitForEvent("close");
      await page.evaluate(() => {
        void window.bunnies.close();
      });
      await closed;
      await until(() => sockets.size === 0);
      const opened = application.waitForEvent("window");
      await application.evaluate(({ app }) => app.emit("activate"));
      page = await opened;
      observe(page);
      await page.getByRole("button", { name: /TLS isolado/ }).click();
    }
    // Removing a custom CA restores runtime defaults and fails against this isolated CA.
    await page
      .getByRole("button", { name: "Editar perfil", exact: true })
      .click();
    dialog = page.getByRole("dialog", { name: "Editar perfil", exact: true });
    await dialog
      .getByLabel("Confiança TLS", { exact: true })
      .selectOption("default");
    await dialog
      .getByRole("button", { name: "Salvar perfil", exact: true })
      .click();
    await dialog.waitFor({ state: "hidden" });
    mode = "ok";
    before = requests;
    await testButton().click();
    await page.getByText(messages.tls, { exact: true }).waitFor();
    assert.equal(requests, before);
    await until(() => sockets.size === 0);
    assert.equal(page.url(), "bunnies://app/app_window/index.html");
    assert.ok(
      !JSON.stringify(
        await page.evaluate(() => ({
          local: { ...window.localStorage },
          session: { ...window.sessionStorage },
        })),
      ).includes(sentinel),
    );
    for (const name of ["Visão geral", "Filas", "Exchanges", "Publicar"])
      assert.equal(
        await page
          .getByRole("button", { name, exact: true })
          .getAttribute("aria-disabled"),
        "true",
      );
    assert.equal(proxyRequests, 0);
    assert.deepEqual(errors, []);
    assert.deepEqual(chromiumRequests, []);
    const runtime = await application.evaluate(() => ({
      node: process.versions.node,
      electron: process.versions.electron,
    }));
    const result = {
      result: "passed",
      platform: process.platform,
      arch: process.arch,
      ...runtime,
      schemaV1ReadOnly: true,
      migrationBackupExact: true,
      publicCaImported: true,
      privateKeyRejected: true,
      credentialsMainOnly: true,
      authenticatedHttps: true,
      statuses401403302: true,
      noRedirectOrRetry: true,
      inheritedProxyIgnored: proxyRequests === 0,
      cancellation: true,
      deadlineMs,
      invalidationOnSave: true,
      socketCleanup: true,
      windowCloseCleanup: process.platform === "darwin",
      defaultTrustRejectsFixture: true,
      zoom200: true,
      noSessionActivated: true,
      chromiumExternalRequests: chromiumRequests.length,
      fixture: "isolated Node HTTPS, not RabbitMQ",
      nativePicker: "main-only scripted response; manual OS review pending",
    };
    await writeFile(
      "out/https-4a2a-results.json",
      JSON.stringify(result, null, 2) + "\n",
    );
    console.log(JSON.stringify(result));
  } finally {
    try {
      if (application) await application.close();
    } finally {
      if (server) {
        server.closeAllConnections();
        await new Promise(resolve => server.close(resolve));
      }
      if (proxy) {
        proxy.closeAllConnections();
        await new Promise(resolve => proxy.close(resolve));
      }
      await rm(userData, { recursive: true, force: true });
      await fixture.cleanup();
    }
  }
}
run().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
