const assert = require("node:assert/strict");
const { mkdtemp, readFile, writeFile, rm } = require("node:fs/promises");
const { tmpdir } = require("node:os");
const path = require("node:path");
const { randomUUID } = require("node:crypto");
const https = require("node:https");
const { _electron: electron } = require("playwright");
const { createTlsFixture } = require("./tls-fixture.cjs");
const { createAmqpPeer } = require("./amqp-fixture.cjs");
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
async function until(fn, timeout = 10000) {
  const end = Date.now() + timeout;
  while (!(await fn())) {
    if (Date.now() > end) throw new Error("Session assertion timed out");
    await sleep(30);
  }
}
async function run() {
  const fixture = await createTlsFixture();
  const root = await mkdtemp(path.join(tmpdir(), "bunnies-session-"));
  const file = path.join(root, "profiles.json");
  const sentinel = "SYNTHETIC-SESSION-FIXTURE-ONLY";
  let app, peer, server, page;
  let requests = 0,
    mode = "ok";
  const sockets = new Set(),
    errors = [],
    chromiumRequests = [],
    checks = [];
  const report = {
    checks,
    executedAt: new Date().toISOString(),
    fixture: "Node TLS scripted peer, not RabbitMQ",
    passed: false,
  };
  try {
    peer = await createAmqpPeer(fixture, { heartbeat: true });
    server = https.createServer(
      { key: fixture.key, cert: fixture.cert },
      (req, res) => {
        requests++;
        assert.equal(req.url, "/api/whoami");
        assert.equal(
          req.headers.authorization,
          "Basic " + Buffer.from("synthetic:" + sentinel).toString("base64"),
        );
        res.writeHead(mode === "ok" ? 200 : 401, {
          "Content-Type": "application/json",
        });
        res.end(
          JSON.stringify(
            mode === "ok" ? { name: "synthetic" } : { secret: sentinel },
          ),
        );
      },
    );
    server.on("connection", socket => {
      sockets.add(socket);
      socket.once("close", () => sockets.delete(socket));
    });
    await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
    await writeFile(
      file,
      JSON.stringify({
        schemaVersion: 2,
        writeId: randomUUID(),
        profiles: [
          {
            id: randomUUID(),
            name: "Sessão isolada",
            environment: "production",
            httpsUrl: `https://127.0.0.1:${server.address().port}`,
            amqpsUrl: peer.url + "/equipe%2Fpedidos",
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
    async function launch() {
      app = await electron.launch({
        executablePath,
        args: [`--user-data-dir=${root}`],
        chromiumSandbox: true,
      });
      page = await app.firstWindow();
      observe();
    }
    function observe() {
      page.setDefaultTimeout(20000);
      page.on("pageerror", e => errors.push(e.message));
      page.on("request", r => {
        if (!r.url().startsWith("bunnies://app/"))
          chromiumRequests.push(r.url());
      });
    }
    const select = () =>
      page.getByRole("button", { name: /Sessão isolada/ }).click();
    const state = async () => {
      const r = await page.evaluate(() => window.bunnies.getSessionState());
      assert.equal(r.ok, true);
      return r.value;
    };
    async function edit(password) {
      await page
        .getByRole("button", { name: "Editar perfil", exact: true })
        .click();
      const dialog = page.getByRole("dialog", {
        name: "Editar perfil",
        exact: true,
      });
      if (password) {
        await dialog
          .getByLabel("Senha", { exact: true })
          .selectOption("replace");
        await dialog.getByLabel("Nova senha", { exact: true }).fill(sentinel);
      }
      await dialog
        .getByRole("button", { name: "Salvar perfil", exact: true })
        .click();
      await dialog.waitFor({ state: "hidden" });
    }
    async function focus() {
      await app.evaluate(({ app }) => app.focus({ steal: true }));
      const win = await app.browserWindow(page);
      await win.evaluate(w => {
        w.restore();
        w.show();
        w.focus();
      });
      await until(async () => !(await state()).paused);
    }
    async function connect(expected = "ready") {
      await focus();
      const button = page.getByRole("button", {
        name: "Conectar",
        exact: true,
      });
      await button.focus();
      await page.keyboard.press("Enter");
      await until(async () => (await state()).state === expected);
    }
    async function disconnect() {
      const r = await page.evaluate(async () => {
        const r = await window.bunnies.getSessionState();
        return window.bunnies.disconnectSession({
          sessionId: r.value.sessionId,
          generation: r.value.generation,
        });
      });
      assert.equal(r.ok, true);
      await until(() => peer.sockets.size === 0);
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
      const png = await win.evaluate(async w =>
        (await w.capturePage()).toPNG().toString("base64"),
      );
      await writeFile(
        `out/sessions-4a2c-${name}.png`,
        Buffer.from(png, "base64"),
      );
    }
    await launch();
    await select();
    assert.equal((await state()).state, "idle");
    assert.equal(peer.attempts, 0);
    assert.equal(requests, 0);
    assert.equal(
      await page
        .getByRole("button", { name: "Conectar", exact: true })
        .isDisabled(),
      true,
    );
    await edit(true);
    assert.equal(peer.attempts, 0);
    assert.equal(requests, 0);
    checks.push("no-auto-network-and-memory-only-credentials");
    await connect();
    const initial = await state();
    assert.equal(initial.profile.vhost, "equipe/pedidos");
    assert.equal(initial.flow, "unknown");
    assert.equal(
      await page
        .getByRole("button", { name: "Testar HTTPS", exact: true })
        .isDisabled(),
      true,
    );
    const unavailable = await page.evaluate(async () => {
      const p = (await window.bunnies.listProfiles()).value;
      return window.bunnies.testProfileAmqps({
        profileId: p.profiles[0].id,
        revision: p.revision,
        operationId: window.crypto.randomUUID(),
      });
    });
    assert.equal(unavailable.error.code, "UNAVAILABLE");
    await page
      .getByLabel("Contexto da conexão")
      .getByText(/Produção/)
      .waitFor();
    await page
      .getByRole("combobox", { name: "Tema", exact: true })
      .selectOption("dark");
    await capture("dark");
    await page
      .getByRole("combobox", { name: "Tema", exact: true })
      .selectOption("light");
    await capture("light");
    await page.getByText("Perfil da sessão ativa", { exact: false }).waitFor();
    const holdUntil = Date.now() + 22000;
    report.foregroundRestorations = 0;
    while (Date.now() < holdUntil) {
      if ((await state()).paused) {
        await focus();
        report.foregroundRestorations++;
      }
      await sleep(400);
    }
    report.afterHold = {
      requests,
      snapshot: await state(),
      heartbeats: peer.records[0].heartbeatsReceived,
    };
    assert.equal((await state()).state, "ready");
    assert.equal(peer.attempts, 1);
    assert.ok(peer.records[0].heartbeatsReceived >= 2);
    assert.ok(requests >= 4);
    checks.push(
      "persistent-heartbeats-22-seconds-HTTPS-poll-and-probe-exclusion",
    );
    await page.getByRole("button", { name: "Ajuda", exact: true }).click();
    assert.equal((await state()).sessionId, initial.sessionId);
    await page.getByRole("button", { name: "Conexões", exact: true }).click();
    await select();
    assert.equal((await state()).desired, true);
    const win = await app.browserWindow(page);
    await win.evaluate(w => w.minimize());
    await until(async () => (await state()).paused);
    const pausedDate = (await state()).https.checkedAt,
      count = requests;
    await sleep(8000);
    assert.equal(requests, count);
    assert.equal((await state()).https.checkedAt, pausedDate);
    assert.equal(peer.sockets.size, 1);
    await focus();
    await until(async () => (await state()).https.checkedAt !== pausedDate);
    checks.push("background-pauses-poll-without-dropping-established-AMQP");
    await app.evaluate(({ powerMonitor }) => powerMonitor.emit("suspend"));
    await until(() => peer.sockets.size === 0);
    const suspended = await state();
    assert.equal(suspended.paused, true);
    await app.evaluate(({ powerMonitor }) => powerMonitor.emit("resume"));
    await until(async () => (await state()).state === "ready");
    assert.ok((await state()).generation > initial.generation);
    assert.equal((await state()).amqps.retries, 1);
    checks.push("suspend-invalidates-resume-recovers-with-same-budget");
    await disconnect();
    peer.mode = "blockedNoClose";
    await connect("degraded");
    assert.equal((await state()).flow, "blocked");
    await disconnect();
    assert.equal((await state()).closeConfirmed, false);
    checks.push("blocked-is-partial-and-unacknowledged-close-is-not-confirmed");
    peer.mode = "earlyClose";
    await connect("degraded");
    assert.equal((await state()).amqps.retries, 0);
    await disconnect();
    peer.mode = "earlyInvalid";
    await connect("degraded");
    assert.equal((await state()).amqps.error, "AMQP_PROTOCOL");
    await disconnect();
    checks.push("ADR-early-frames-sanitized-in-packaged-main-no-crash");
    peer.mode = "ok";
    mode = "auth";
    await connect("degraded");
    assert.equal((await state()).https.error, "TEST_AUTH");
    assert.equal((await state()).amqps.phase, "available");
    assert.ok(!(await page.locator("body").textContent()).includes(sentinel));
    await capture("partial");
    await disconnect();
    mode = "ok";
    await connect();
    await edit(false);
    await until(async () => (await state()).state === "closed");
    await until(() => peer.sockets.size === 0);
    checks.push("independent-endpoints-and-profile-save-invalidates-session");
    peer.mode = "stallStart";
    await focus();
    await page.getByRole("button", { name: "Conectar", exact: true }).click();
    await until(() => peer.sockets.size === 1);
    const cancel = page.getByRole("button", {
      name: /^(Cancelar conexão|Desconectar)$/,
    });
    await cancel.focus();
    await page.keyboard.press("Enter");
    await until(async () => (await state()).state === "closed");
    await until(() => peer.sockets.size === 0);
    await until(() =>
      page
        .getByRole("button", { name: "Conectar", exact: true })
        .evaluate(button => button === document.activeElement),
    );
    checks.push(
      "keyboard-cancels-pending-handshake-restores-focus-and-keeps-route-session",
    );
    peer.mode = "ok";
    await connect();
    await page.reload();
    await select();
    await until(() => peer.sockets.size === 0);
    assert.equal((await state()).desired, false);
    await connect();
    if (process.platform === "darwin") {
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
      assert.equal((await state()).desired, false);
      assert.equal(
        await page
          .getByRole("button", { name: "Conectar", exact: true })
          .isEnabled(),
        true,
      );
    } else await disconnect();
    checks.push("reload-and-window-close-cleanup-no-auto-reconnect");
    await connect();
    // Obtain the current window: macOS recreation invalidates the old handle.
    const current = await app.browserWindow(page);
    await current.evaluate(w => {
      w.setContentSize(1024, 700);
      w.webContents.setZoomFactor(2);
    });
    await page
      .getByRole("button", { name: "Desconectar", exact: true })
      .scrollIntoViewIfNeeded();
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth + 1,
      ),
      true,
    );
    await capture("zoom200");
    await current.evaluate(w => {
      w.webContents.setZoomFactor(1);
      w.setContentSize(1200, 800);
    });
    await app.close();
    app = undefined;
    await until(() => peer.sockets.size === 0);
    await launch();
    await select();
    assert.equal(
      await page
        .getByRole("button", { name: "Conectar", exact: true })
        .isDisabled(),
      true,
    );
    assert.equal((await state()).desired, false);
    for (const record of peer.records)
      assert.ok(record.channels.every(c => c === 0));
    assert.ok(!(await readFile(file, "utf8")).includes(sentinel));
    assert.equal(page.url(), "bunnies://app/app_window/index.html");
    assert.deepEqual(errors, []);
    assert.deepEqual(chromiumRequests, []);
    checks.push(
      "quit-clears-password-zero-channels-fixed-origin-no-renderer-network-zoom200",
    );
    report.passed = true;
    report.runtime = await app.evaluate(() => process.versions);
  } finally {
    if (app) await app.close();
    if (peer) await peer.close();
    for (const socket of sockets) socket.destroy();
    if (server) await new Promise(resolve => server.close(resolve));
    await fixture.cleanup();
    await rm(root, { recursive: true, force: true });
    report.cleanup = true;
    await writeFile(
      "out/sessions-4a2c-results.json",
      JSON.stringify(report, null, 2) + "\n",
    );
  }
  console.log(JSON.stringify(report));
}
run().catch(e => {
  console.error(e);
  process.exitCode = 1;
});
