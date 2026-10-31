const assert = require("node:assert/strict");
const { mkdtemp, writeFile, readFile, rm } = require("node:fs/promises");
const { tmpdir } = require("node:os");
const path = require("node:path");
const { randomUUID } = require("node:crypto");
const https = require("node:https");
const { _electron: electron } = require("playwright");
const { createTlsFixture } = require("./tls-fixture.cjs");
const { createAmqpPeer } = require("./amqp-fixture.cjs");
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
async function until(fn, ms = 15000) {
  const end = Date.now() + ms;
  while (!(await fn())) {
    assert.ok(Date.now() < end, "Management smoke timed out");
    await sleep(40);
  }
}
async function verifyManagement(page, version, names) {
  const region = page.getByRole("region", {
    name: "Informações administrativas",
    exact: true,
  });
  await region.waitFor();
  const info = region.getByRole("button", {
    name: "Consultar informações",
    exact: true,
  });
  await info.focus();
  await page.keyboard.press("Enter");
  const broker = region.getByRole("region", {
    name: "Versão informada pelo endpoint",
    exact: true,
  });
  await broker.getByText(version, { exact: true }).first().waitFor();
  await until(async () => info.evaluate(e => document.activeElement === e));
  await region
    .getByRole("button", { name: "Listar vhosts", exact: true })
    .click();
  const list = region.getByRole("region", {
    name: "Vhosts visíveis no endpoint",
    exact: true,
  });
  await list.getByText(/Lista completa recebida/).waitFor();
  const actual = await list.getByRole("listitem").allTextContents();
  for (const name of names) assert.ok(actual.includes(name));
  assert.equal(await region.locator("select").count(), 0);
  assert.ok((await region.locator("time").count()) >= 2);
  assert.ok((await list.textContent()).includes("Não há paginação"));
  return [
    "management-manual-overview-dated-and-keyboard-focus",
    "management-visible-vhosts-exact-names-without-selector",
  ];
}
async function run() {
  const fixture = await createTlsFixture(),
    root = await mkdtemp(path.join(tmpdir(), "bunnies-management-smoke-"));
  const file = path.join(root, "profiles.json"),
    sentinel = "SYNTHETIC-MANAGEMENT-ONLY",
    profileId = randomUUID();
  let app,
    peer,
    server,
    mode = "ok",
    adminRequests = 0;
  const sockets = new Set(),
    errors = [],
    external = [],
    checks = [];
  const names = [
    "/",
    ".",
    "..",
    "literal%2F",
    "área pedidos",
    "equipe/pedidos",
  ];
  try {
    peer = await createAmqpPeer(fixture, { heartbeat: true });
    server = https.createServer(
      { key: fixture.key, cert: fixture.cert },
      (req, res) => {
        assert.equal(req.method, "GET");
        assert.equal(
          req.headers.authorization,
          "Basic " + Buffer.from("synthetic:" + sentinel).toString("base64"),
        );
        res.setHeader("Content-Type", "application/json");
        if (req.url === "/api/whoami") {
          res.end('{"name":"synthetic"}');
          return;
        }
        adminRequests++;
        assert.ok(
          [
            "/api/overview?columns=rabbitmq_version,management_version",
            "/api/vhosts?disable_stats=true&columns=name&sort=name",
          ].includes(req.url),
        );
        if (mode === "stall") {
          res.write("[");
          return;
        }
        if (mode === "denied") {
          res.writeHead(401);
          res.end(
            '{"reason":"Not management user","secret":"SYNTHETIC-MANAGEMENT-ONLY"}',
          );
          return;
        }
        if (mode === "limit") {
          res.end(
            JSON.stringify(
              Array.from({ length: 201 }, (_, i) => ({ name: String(i) })),
            ),
          );
          return;
        }
        res.end(
          JSON.stringify(
            req.url.startsWith("/api/overview")
              ? { rabbitmq_version: "4.4.0", management_version: "4.4.0" }
              : names.map(name => ({ name, ignored: "SYNTHETIC-METADATA" })),
          ),
        );
      },
    );
    server.on("connection", s => {
      sockets.add(s);
      s.once("close", () => sockets.delete(s));
    });
    await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
    await writeFile(
      file,
      JSON.stringify({
        schemaVersion: 2,
        writeId: randomUUID(),
        profiles: [
          {
            id: profileId,
            name: "Administração isolada",
            environment: "production",
            httpsUrl: `https://127.0.0.1:${server.address().port}`,
            amqpsUrl: peer.url + "/%2F",
            username: "synthetic",
            secret: { mode: "memory" },
            trust: { mode: "custom", pem: fixture.ca },
          },
        ],
      }),
      { mode: 0o600 },
    );
    const artifact = path.resolve(
      `out/Bunnies-${process.platform}-${process.arch}`,
    );
    const executablePath = {
      darwin: path.join(artifact, "Bunnies.app/Contents/MacOS/bunnies"),
      linux: path.join(artifact, "bunnies"),
      win32: path.join(artifact, "bunnies.exe"),
    }[process.platform];
    app = await electron.launch({
      executablePath,
      args: [`--user-data-dir=${root}`],
      chromiumSandbox: true,
    });
    const page = await app.firstWindow();
    page.setDefaultTimeout(15000);
    page.on("pageerror", e => errors.push(e.message));
    page.on("request", r => {
      if (!r.url().startsWith("bunnies://app/")) external.push(r.url());
    });
    const win = await app.browserWindow(page);
    const state = async () =>
      (await page.evaluate(() => window.bunnies.getSessionState())).value;
    async function focus() {
      await app.evaluate(({ app }) => app.focus({ steal: true }));
      await win.evaluate(w => {
        w.restore();
        w.show();
        w.focus();
      });
      await until(async () => !(await state()).paused);
    }
    await page.getByRole("button", { name: /Administração isolada/ }).click();
    await page
      .getByRole("button", { name: "Editar perfil", exact: true })
      .click();
    const dialog = page.getByRole("dialog", {
      name: "Editar perfil",
      exact: true,
    });
    await dialog.getByLabel("Senha", { exact: true }).selectOption("replace");
    await dialog.getByLabel("Nova senha", { exact: true }).fill(sentinel);
    await dialog
      .getByRole("button", { name: "Salvar perfil", exact: true })
      .click();
    await dialog.waitFor({ state: "hidden" });
    await focus();
    await page.getByRole("button", { name: "Conectar", exact: true }).click();
    await until(async () => (await state()).state === "ready");
    assert.equal(adminRequests, 0);
    const before = await readFile(file, "utf8");
    checks.push(...(await verifyManagement(page, "4.4.0", names)));
    const region = page.getByRole("region", {
      name: "Informações administrativas",
      exact: true,
    });
    const listButton = region.getByRole("button", {
      name: "Listar vhosts",
      exact: true,
    });
    mode = "denied";
    await listButton.click();
    await region
      .getByText("A consulta foi negada por permissão ou tag administrativa.", {
        exact: true,
      })
      .waitFor();
    assert.ok((await region.textContent()).includes("Desatualizado"));
    assert.ok(!(await region.textContent()).includes(sentinel));
    assert.equal((await state()).state, "ready");
    checks.push("management-denial-sanitized-stale-snapshot-session-preserved");
    mode = "limit";
    await listButton.click();
    await region.getByText(/Consulta recusada integralmente:/).waitFor();
    checks.push("management-201-refused-without-truncation");
    mode = "stall";
    await listButton.click();
    await region.getByRole("button", { name: "Cancelar consulta" }).click();
    await region
      .getByText("Consulta cancelada. A sessão foi mantida.", { exact: true })
      .waitFor();
    assert.equal((await state()).state, "ready");
    checks.push("management-cancel-keeps-session");
    await listButton.click();
    await win.evaluate(w => w.minimize());
    await until(async () => (await state()).paused);
    await sleep(200);
    await focus();
    await until(async () => await listButton.isEnabled());
    checks.push("management-background-invalidates-request");
    await listButton.click();
    await page.getByRole("button", { name: "Ajuda", exact: true }).click();
    await page
      .getByRole("heading", {
        name: "Consultar versões e vhosts visíveis",
        exact: true,
      })
      .waitFor();
    assert.equal((await state()).desired, true);
    await page.getByRole("button", { name: "Conexões", exact: true }).click();
    await page.getByRole("button", { name: /Administração isolada/ }).click();
    await until(
      async () =>
        await page
          .getByRole("region", {
            name: "Informações administrativas",
            exact: true,
          })
          .getByRole("button", { name: "Listar vhosts", exact: true })
          .isEnabled(),
    );
    checks.push("management-navigation-cancels-and-help-source-is-shared");
    mode = "ok";
    await page
      .getByRole("button", { name: "Listar vhosts", exact: true })
      .click();
    await page.getByText(/Lista completa recebida:/).waitFor();
    await page
      .getByRole("combobox", { name: "Tema", exact: true })
      .selectOption("dark");
    await page.waitForFunction(
      () => document.documentElement.dataset.theme === "dark",
    );
    await page.screenshot({
      path: "out/management-4b1-dark.png",
      fullPage: true,
    });
    await page
      .getByRole("combobox", { name: "Tema", exact: true })
      .selectOption("light");
    await page.waitForFunction(
      () => document.documentElement.dataset.theme === "light",
    );
    await page.screenshot({
      path: "out/management-4b1-light.png",
      fullPage: true,
    });
    await win.evaluate(w => w.webContents.setZoomFactor(2));
    await page.waitForFunction(() => window.innerWidth === 600);
    await page
      .getByRole("heading", {
        name: "Informações administrativas",
        exact: true,
      })
      .scrollIntoViewIfNeeded();
    await page.evaluate(
      () =>
        new Promise(resolve =>
          window.requestAnimationFrame(() =>
            window.requestAnimationFrame(resolve),
          ),
        ),
    );
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
      true,
    );
    await writeFile(
      "out/management-4b1-zoom.png",
      Buffer.from(
        await win.evaluate(async w =>
          (await w.capturePage()).toPNG().toString("base64"),
        ),
        "base64",
      ),
    );
    await win.evaluate(w => w.webContents.setZoomFactor(1));
    assert.equal(await readFile(file, "utf8"), before);
    assert.ok(!before.includes(sentinel));
    assert.ok(
      !(await page.locator("body").textContent()).includes(
        "SYNTHETIC-METADATA",
      ),
    );
    assert.deepEqual(errors, []);
    assert.deepEqual(external, []);
    await page
      .getByRole("button", { name: "Desconectar", exact: true })
      .click();
    await until(
      async () => !(await state()).desired && !(await state()).stopping,
    );
    checks.push(
      "management-no-profile-write-secrets-renderer-network-or-channels",
    );
    await writeFile(
      "out/management-4b1-results.json",
      JSON.stringify(
        {
          passed: true,
          checks,
          platform: process.platform,
          architecture: process.arch,
        },
        null,
        2,
      ) + "\n",
    );
    console.log(`Management smoke: ${checks.length} groups passed`);
  } finally {
    if (app) await app.close();
    if (server) {
      await Promise.all(
        [...sockets].map(
          s =>
            new Promise(resolve => {
              s.once("close", resolve);
              s.destroy();
            }),
        ),
      );
      await new Promise(resolve => server.close(resolve));
    }
    if (peer) await peer.close();
    await fixture.cleanup();
    await rm(root, { recursive: true, force: true });
  }
}
module.exports = { verifyManagement };
if (require.main === module)
  run().catch(error => {
    console.error(error);
    process.exitCode = 1;
  });
