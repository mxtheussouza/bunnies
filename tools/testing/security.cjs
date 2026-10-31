const assert = require("node:assert/strict");
const http = require("node:http");
const path = require("node:path");

// All privileged inspection here belongs to the test harness, never to the app bridge.
module.exports = async function verifySecurity(application, page) {
  const entry = "bunnies://app/app_window/index.html";
  assert.equal(page.url(), entry);
  const primaryWindow = await application.browserWindow(page);
  const preferences = await primaryWindow.evaluate(window =>
    window.webContents.getLastWebPreferences(),
  );
  for (const flag of ["sandbox", "contextIsolation", "webSecurity"])
    assert.equal(preferences[flag], true);
  for (const flag of [
    "nodeIntegration",
    "nodeIntegrationInWorker",
    "nodeIntegrationInSubFrames",
    "webviewTag",
    "allowRunningInsecureContent",
  ])
    assert.equal(preferences[flag], false);
  assert.equal(
    await application.evaluate(({ app }) =>
      app.commandLine.hasSwitch("no-sandbox"),
    ),
    false,
  );
  assert.deepEqual(
    await page.evaluate(() => [
      typeof require,
      typeof process,
      typeof Buffer,
      typeof window.electron_window,
    ]),
    ["undefined", "undefined", "undefined", "undefined"],
  );
  assert.deepEqual(
    await page.evaluate(() => Object.keys(window.bunnies).sort()),
    [
      "cancelProfileAmqpsTest",
      "cancelProfileHttpsTest",
      "close",
      "connectSession",
      "discardProfileCa",
      "disconnectSession",
      "getInfo",
      "getSecretProtectionStatus",
      "getSessionState",
      "listProfiles",
      "minimize",
      "onSessionState",
      "getBrokerInfo",
      "listSessionVhosts",
      "cancelManagementRead",
      "openLink",
      "quit",
      "removeProfile",
      "saveProfile",
      "selectProfileCa",
      "showEditMenu",
      "testProfileAmqps",
      "testProfileHttps",
      "toggleMaximize",
      "view",
    ].sort(),
  );

  const cdp = await page.context().newCDPSession(page);
  const contexts = [];
  cdp.on("Runtime.executionContextCreated", ({ context }) =>
    contexts.push(context),
  );
  await cdp.send("Runtime.enable");
  const isolated = contexts.find(
    context => context.name === "Electron Isolated Context",
  );
  assert.ok(isolated, "Electron isolated preload context must exist");
  const isolatedGlobals = await cdp.send("Runtime.evaluate", {
    contextId: isolated.id,
    expression: "({ process: typeof process, buffer: typeof Buffer })",
    returnByValue: true,
  });
  assert.deepEqual(isolatedGlobals.result.value, {
    process: "undefined",
    buffer: "undefined",
  });
  // The bundled preload exposes the bridge only after checking process.sandboxed
  // and process.contextIsolated in its lexical wrapper (not globals in this world).
  const mainContext = contexts.find(context => context.auxData?.isDefault);
  assert.ok(mainContext);
  const evaluation = await cdp.send("Runtime.evaluate", {
    contextId: mainContext.id,
    expression:
      "(() => { try { eval('1 + 1'); return 'allowed'; } catch (error) { return error.name; } })()",
    allowUnsafeEvalBlockedByCSP: false,
    returnByValue: true,
  });
  assert.equal(
    evaluation.result.value,
    "EvalError",
    "Production CSP must block eval even when evaluated by the test harness",
  );
  await cdp.detach();

  const css = await page.evaluate(() => ({
    background: getComputedStyle(document.body).backgroundColor,
    linked: !!document.querySelector('link[rel="stylesheet"]'),
    logo: document.querySelector(".brand-symbol").naturalWidth,
  }));
  assert.equal(css.linked, true);
  assert.ok(css.logo > 0);
  assert.equal(css.background, "rgb(246, 247, 249)");
  const injected = await page.evaluate(() => {
    const before = getComputedStyle(document.body).outlineWidth;
    const script = document.createElement("script");
    script.textContent = "window.__bunniesInlineExecuted = true";
    document.head.append(script);
    const style = document.createElement("style");
    style.textContent = "body { outline: 7px solid red !important; }";
    document.head.append(style);
    return {
      before,
      executed: window.__bunniesInlineExecuted === true,
      outline: getComputedStyle(document.body).outlineWidth,
    };
  });
  assert.equal(injected.executed, false);
  assert.equal(injected.outline, injected.before);

  let requests = 0;
  const server = http.createServer((_request, response) => {
    requests++;
    response.writeHead(200, { "Access-Control-Allow-Origin": "*" });
    response.end("test-only");
  });
  await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
  try {
    const target = `http://127.0.0.1:${server.address().port}/blocked-test`;
    assert.equal(
      await page.evaluate(
        url =>
          fetch(url)
            .then(() => true)
            .catch(() => false),
        target,
      ),
      false,
    );
    assert.equal(
      await application.evaluate(
        async ({ net }, url) =>
          net
            .fetch(url)
            .then(() => true)
            .catch(() => false),
        target,
      ),
      false,
    );
    assert.equal(
      requests,
      0,
      "Renderer and protected Chromium session must not reach the fixture server",
    );
  } finally {
    await new Promise(resolve => server.close(resolve));
  }

  const resourceResults = await application.evaluate(async ({ net }) => {
    const paths = [
      "app_window/index.html",
      "app_window/preload.cjs",
      "package.json",
      "../package.json",
      "%252e%252e/package.json",
    ];
    const results = [];
    for (const path of paths) {
      const response = await net.fetch("bunnies://app/" + path);
      results.push({
        status: response.status,
        csp: response.headers.get("content-security-policy"),
      });
    }
    return results;
  });
  assert.deepEqual(
    resourceResults.map(item => item.status),
    [200, 404, 404, 404, 404],
  );
  assert.ok(resourceResults[0].csp.includes("connect-src 'none'"));
  assert.ok(!/unsafe-inline|unsafe-eval/.test(resourceResults[0].csp));

  for (const request of [
    () => page.evaluate(() => window.bunnies.view("constructor")),
    () => page.evaluate(() => window.bunnies.view("x".repeat(2 * 1024 * 1024))),
    () =>
      page.evaluate(() => window.bunnies.openLink("https://external.invalid")),
  ]) {
    const result = await request();
    assert.equal(result.ok, false);
    assert.equal(result.error.code, "VALIDATION");
    assert.ok(!JSON.stringify(result).includes("external.invalid"));
  }
  const tools = await page.evaluate(() =>
    window.bunnies.view("toggleDevTools"),
  );
  assert.equal(tools.ok, false);
  assert.equal(tools.error.code, "UNAVAILABLE");
  assert.equal(
    await page.evaluate(() => Notification.requestPermission()),
    "denied",
  );
  const windowCount = application.windows().length;
  assert.equal(
    await page.evaluate(url => window.open(url) === null, entry),
    true,
  );
  assert.equal(application.windows().length, windowCount);
  for (const target of [
    "bunnies://app/app_window/index.js",
    "https://bunnies.invalid/blocked",
  ]) {
    await page.evaluate(url => {
      location.href = url;
    }, target);
    await page.waitForTimeout(100);
    assert.equal(page.url(), entry);
  }

  // Resynchronize Playwright after deliberately canceled navigations.
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.getByRole("heading", { name: "Conexões", exact: true }).waitFor();

  await page.evaluate(() => {
    const input = document.createElement("textarea");
    input.id = "bunnies-edit-fixture";
    input.value = "synthetic editor value";
    document.body.append(input);
  });
  await page.locator("#bunnies-edit-fixture").focus();
  const platform = await application.evaluate(() => process.platform);
  await page.keyboard.press(platform === "darwin" ? "Meta+A" : "Control+A");
  await page.waitForFunction(() => {
    const input = document.getElementById("bunnies-edit-fixture");
    return (
      input.selectionStart === 0 && input.selectionEnd === input.value.length
    );
  });
  await page.locator("#bunnies-edit-fixture").evaluate(input => input.remove());

  // A real second renderer, even at the same origin with the same safe preload, is unauthorized.
  // Electron 45 omits preload from getLastWebPreferences; use the known packaged entry.
  const preload = path.join(
    await application.evaluate(({ app }) => app.getAppPath()),
    ".webpack/renderer/app_window/preload.cjs",
  );
  const foreignId = await application.evaluate(
    async ({ BrowserWindow }, { preload, entry }) => {
      const foreign = new BrowserWindow({
        show: false,
        webPreferences: {
          sandbox: true,
          contextIsolation: true,
          nodeIntegration: false,
          preload,
        },
      });
      await foreign.loadURL(entry);
      return foreign.id;
    },
    { preload, entry },
  );

  const foreign = application.windows().find(candidate => candidate !== page);
  assert.ok(foreign);
  const denied = await foreign.evaluate(() => window.bunnies.close());
  assert.equal(denied.ok, false);
  assert.equal(denied.error.code, "FORBIDDEN");

  const profilesDenied = await foreign.evaluate(() =>
    window.bunnies.listProfiles(),
  );
  assert.equal(profilesDenied.ok, false);
  assert.equal(profilesDenied.error.code, "FORBIDDEN");

  const caDenied = await foreign.evaluate(() =>
    window.bunnies.selectProfileCa(),
  );
  assert.equal(caDenied.ok, false);
  assert.equal(caDenied.error.code, "FORBIDDEN");
  const testDenied = await foreign.evaluate(() =>
    window.bunnies.testProfileHttps({
      profileId: "01234567-89ab-4def-89ab-0123456789ab",
      revision: "absent",
      operationId: "01234567-89ab-4def-89ab-0123456789ac",
    }),
  );
  assert.equal(testDenied.ok, false);
  assert.equal(testDenied.error.code, "FORBIDDEN");
  const amqpDenied = await foreign.evaluate(() =>
    window.bunnies.testProfileAmqps({
      profileId: "01234567-89ab-4def-89ab-0123456789ab",
      revision: "absent",
      operationId: "01234567-89ab-4def-89ab-0123456789ac",
    }),
  );
  assert.equal(amqpDenied.ok, false);
  assert.equal(amqpDenied.error.code, "FORBIDDEN");
  let current = page;
  for (let index = 0; index < 2; index++) {
    const closed = current.waitForEvent("close");
    await current.evaluate(() => {
      void window.bunnies.close();
    });
    await closed;
    const opened = application.waitForEvent("window", { timeout: 10_000 });
    await application.evaluate(({ app }) => {
      app.emit("activate");
    });
    current = await opened;
    await current
      .getByRole("heading", { name: "Conexões", exact: true })
      .waitFor();
    assert.equal(
      (await current.evaluate(() => window.bunnies.getInfo())).ok,
      true,
    );
    await application.evaluate(({ app }) => {
      app.emit("activate");
    });
    assert.equal(
      application.windows().length,
      2,
      "Activation must not duplicate the primary window",
    );
  }
  await application.evaluate(
    ({ BrowserWindow }, id) => BrowserWindow.fromId(id).destroy(),
    foreignId,
  );
  await current.screenshot({ path: "out/smoke-security.png" });
  return {
    sandbox: true,
    ipc: true,
    csp: true,
    resources: true,
    network: true,
    permissions: true,
    navigation: true,
    reopenings: 2,
  };
};
