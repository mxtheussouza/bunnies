const assert = require("node:assert/strict");
const { execFile } = require("node:child_process");
const { writeFile } = require("node:fs/promises");
const { promisify } = require("node:util");
const { URL } = require("node:url");
const { navigate } = require("./queues.cjs");

const name = "bunnies-purge-fila/á %2F";
const item = `/api/queues/%2F/${encodeURIComponent(name)}`;
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

function fixture() {
  let ready = 3;
  let mode = "accept";
  let gets = 0;
  let deletes = 0;
  return {
    getCounts: () => ({ gets, deletes, ready }),
    setMode: value => {
      mode = value;
    },
    async serve(req, res) {
      const url = new URL(req.url, "https://fixture.invalid");
      assert.equal(req.headers["accept-encoding"], "identity");
      if (req.method === "DELETE") {
        assert.equal(url.pathname, item + "/contents");
        assert.equal(url.search, "");
        assert.equal(req.headers.accept, "*/*");
        for await (const chunk of req) assert.equal(chunk.length, 0);
        deletes++;
        if (mode === "deny") {
          res.writeHead(401);
          res.end(
            '{"error":"not_authorised","reason":"Access refused.","raw":"SYNTHETIC-METADATA"}',
          );
          return;
        }
        ready = 0;
        if (mode === "stall") return;
        res.writeHead(204);
        res.end();
        return;
      }
      assert.equal(req.method, "GET");
      const row = {
        vhost: "/",
        name,
        type: "quorum",
        messages_ready: ready,
        messages_unacknowledged: 2,
      };
      if (url.pathname === "/api/queues/%2F") {
        assert.equal(url.searchParams.get("pagination"), "true");
        res.end(
          JSON.stringify({
            items: [row],
            item_count: 1,
            page: 1,
            page_size: 100,
            page_count: 1,
            total_count: 1,
            filtered_count: 1,
          }),
        );
        return;
      }
      assert.equal(url.pathname, item);
      gets++;
      res.end(JSON.stringify(row));
    },
  };
}

// Only the launched smoke process is instrumented. The native branch returns the
// actual result from Electron. Scripted replies make network/race cases repeatable.
async function installDialogDriver(app) {
  await app.evaluate(({ dialog }) => {
    const original = dialog.showMessageBox.bind(dialog);
    const driver = { mode: "native", calls: [], nativeResults: [] };
    globalThis.__purgeDialogTest = driver;
    dialog.showMessageBox = (window, options) => {
      const { signal, ...data } = options;
      driver.calls.push({ ...data, owner: window.id, signal: !!signal });
      if (driver.mode === "native")
        return original(window, options).then(result => {
          driver.nativeResults.push(result.response);
          return result;
        });
      const response = driver.mode === "approve" ? 1 : 0;
      return Promise.resolve({ response, checkboxChecked: false });
    };
  });
  return {
    mode: value =>
      app.evaluate((_electron, mode) => {
        globalThis.__purgeDialogTest.mode = mode;
      }, value),
    state: () => app.evaluate(() => globalThis.__purgeDialogTest),
  };
}

async function captureRenderer(win, path) {
  const image = await win.evaluate(async window =>
    (await window.webContents.capturePage()).toPNG().toString("base64"),
  );
  await writeFile(path, Buffer.from(image, "base64"));
}

async function openDetail(page, queue) {
  const button = page.getByRole("button", {
    name: `Ver detalhes da fila ${queue}`,
    exact: true,
  });
  await button.press("Enter");
  const detail = page.getByRole("dialog", { name: queue, exact: true });
  await detail
    .getByRole("button", { name: "Limpar mensagens", exact: true })
    .waitFor();
  return detail;
}

async function verifyPurgeSmoke({
  app,
  page,
  win,
  state,
  focus,
  until,
  fixture,
}) {
  const driver = await installDialogDriver(app);
  const checks = [];
  await navigate(page, "Filas");
  await page
    .getByRole("button", { name: "Carregar filas", exact: true })
    .click();
  await page.getByRole("table").waitFor();
  let detail = await openDetail(page, name);
  const result = expected =>
    detail.getByText(expected, { exact: true }).waitFor();
  const start = async () => {
    const trigger = detail.getByRole("button", {
      name: "Limpar mensagens",
      exact: true,
    });
    await trigger.focus();
    await page.keyboard.press("Enter");
  };

  // Use a known operation ID to cancel the real OS dialog over the same bridge
  // available to Filas, with no test hook in the product.
  const active = await state();
  const ref = {
    sessionId: active.sessionId,
    generation: active.generation,
    operationId: require("node:crypto").randomUUID(),
  };
  const operation = page.evaluate(
    input => window.bunnies.purgeSessionQueue(input),
    { ...ref, name },
  );
  await until(async () => (await driver.state()).calls.length === 1);
  const calls = (await driver.state()).calls;
  assert.equal(calls[0].owner, await win.evaluate(window => window.id));
  assert.equal(calls[0].defaultId, 0);
  assert.equal(calls[0].cancelId, 0);
  assert.equal(calls[0].signal, true);
  assert.ok(calls[0].message.includes("⚠ Produção"));
  assert.ok(calls[0].detail.includes(name));
  assert.ok(calls[0].detail.includes("irreversível"));
  assert.ok(calls[0].detail.includes("dead-lettering pendente"));
  assert.equal(fixture.getCounts().deletes, 0);
  if (
    process.platform === "darwin" &&
    process.env.BUNNIES_PURGE_CAPTURE !== "skip"
  ) {
    await sleep(350);
    const bounds = await win.evaluate(window => window.getBounds());
    await promisify(execFile)("/usr/sbin/screencapture", [
      "-x",
      `-R${bounds.x},${bounds.y},${bounds.width},${bounds.height}`,
      "out/queue-purge-5c1-native.png",
    ]);
  }
  await page.evaluate(input => window.bunnies.cancelQueuePurge(input), ref);
  assert.equal((await operation).error.code, "CANCELLED");
  assert.deepEqual((await driver.state()).nativeResults, [0]);
  assert.equal(fixture.getCounts().deletes, 0);
  checks.push("real-native-modal-default-cancel-context-and-abort-zero-delete");

  await focus();
  await driver.mode("cancel");
  if (!(await detail.isVisible())) detail = await openDetail(page, name);
  await start();
  await result("Limpeza não concluída");
  assert.ok((await detail.textContent()).includes("antes do envio"));
  assert.equal(fixture.getCounts().deletes, 0);
  await until(() =>
    detail
      .getByText("Limpeza não concluída", { exact: true })
      .evaluate(node => document.activeElement?.contains(node)),
  );
  checks.push("keyboard-invokes-confirmation-and-cancel-returns-focus");

  await driver.mode("approve");
  await start();
  await result("Limpeza aceita pelo broker");
  await result("Detalhe desatualizado");
  assert.equal(fixture.getCounts().deletes, 1);
  const previous = fixture.getCounts().gets;
  await detail
    .getByRole("button", { name: "Verificar fila", exact: true })
    .click();
  await until(() => fixture.getCounts().gets === previous + 1);
  await detail.getByText("0", { exact: true }).first().waitFor();
  assert.equal(fixture.getCounts().deletes, 1);
  checks.push("approved-purge-one-delete-and-fresh-get-only");

  fixture.setMode("deny");
  await start();
  await detail.getByText(/Confira a permissão de leitura/).waitFor();
  assert.ok(!(await detail.textContent()).includes("SYNTHETIC-METADATA"));
  fixture.setMode("stall");
  await start();
  await until(() => fixture.getCounts().deletes === 3);
  await detail.getByRole("button", { name: "Parar de aguardar" }).click();
  await result("Resultado incerto");
  await sleep(100);
  assert.equal(fixture.getCounts().deletes, 3);
  checks.push("broker-denial-and-post-send-cancel-without-replay");

  await detail
    .getByRole("button", { name: "Fechar detalhe", exact: true })
    .click();
  for (const theme of ["light", "dark"]) {
    await win.evaluate(window => window.webContents.setZoomFactor(1));
    await page
      .getByRole("combobox", { name: "Tema", exact: true })
      .selectOption(theme);
    await page.waitForFunction(
      value => document.documentElement.dataset.theme === value,
      theme,
    );
    await win.evaluate(window => window.webContents.setZoomFactor(2));
    await focus();
    detail = await openDetail(page, name);
    const trigger = detail.getByRole("button", {
      name: "Limpar mensagens",
      exact: true,
    });
    await trigger.focus();
    await trigger.scrollIntoViewIfNeeded();
    await sleep(80);
    await captureRenderer(win, `out/queue-purge-5c1-${theme}-zoom.png`);
    assert.equal(
      await trigger.evaluate(node => document.activeElement === node),
      true,
    );
    await detail
      .getByRole("button", { name: "Fechar detalhe", exact: true })
      .click();
  }
  await win.evaluate(window => window.webContents.setZoomFactor(1));
  checks.push("both-themes-two-hundred-percent-keyboard-focus");
  await navigate(page, "Conexões");
  return checks;
}

async function verifyRealPurge({ page, driver, api, checks, queue }, vhost) {
  await navigate(page, "Filas");
  const observe = (name = queue) =>
    api(
      `queues/${encodeURIComponent(vhost)}/${encodeURIComponent(name)}?columns=type,messages_ready`,
    );
  const before = await observe();
  assert.equal(before.messages_ready, 1);
  assert.equal(before.type, vhost === "detailed" ? "quorum" : "classic");
  let detail;
  if (vhost === "detailed") {
    assert.equal(
      await page
        .getByRole("button", { name: "Carregar filas", exact: true })
        .count(),
      0,
    );
    await page
      .getByRole("textbox", { name: "Nome exato da fila", exact: true })
      .fill(queue);
    await page
      .getByRole("button", { name: "Consultar fila", exact: true })
      .click();
    detail = page.getByRole("dialog", { name: queue, exact: true });
  } else {
    await page
      .getByRole("button", { name: "Carregar filas", exact: true })
      .click();
    detail = await openDetail(page, queue);
  }
  const trigger = detail.getByRole("button", {
    name: "Limpar mensagens",
    exact: true,
  });
  await driver.mode("cancel");
  await trigger.click();
  await detail.getByText(/cancelada antes do envio/).waitFor();
  assert.deepEqual(await observe(), before);

  await driver.mode("approve");
  await trigger.click();
  await detail
    .getByText("Limpeza aceita pelo broker", { exact: true })
    .waitFor();
  await detail.getByText("Detalhe desatualizado", { exact: true }).waitFor();
  const deadline = Date.now() + 10_000;
  while ((await observe()).messages_ready !== 0) {
    assert.ok(Date.now() < deadline, "Broker did not report purge");
    await sleep(200);
  }
  const lastDialog = (await driver.state()).calls.at(-1);
  assert.ok(lastDialog.detail.includes(JSON.stringify(vhost)));
  assert.ok(lastDialog.detail.includes(JSON.stringify(queue)));
  await detail
    .getByRole("button", { name: "Verificar fila", exact: true })
    .click();
  await detail
    .getByText("Detalhe desatualizado", { exact: true })
    .waitFor({ state: "hidden" });
  assert.equal((await observe()).type, before.type);
  await detail
    .getByRole("button", { name: "Fechar detalhe", exact: true })
    .click();
  checks.push(
    `real-${before.type}-purge-confirmation-and-verification-in-${vhost}`,
  );

  if (vhost === "literal%2F") {
    const denied = "fila-fora-da-permissao";
    const blocked = await openDetail(page, denied);
    await blocked
      .getByRole("button", { name: "Limpar mensagens", exact: true })
      .click();
    await blocked.getByText(/Confira a permissão de leitura/).waitFor();
    assert.equal((await observe(denied)).messages_ready, 1);
    await blocked
      .getByRole("button", { name: "Fechar detalhe", exact: true })
      .click();
    checks.push("real-read-permission-denial-keeps-target-message");
  }
}

module.exports = {
  fixture,
  installDialogDriver,
  openDetail,
  verifyPurgeSmoke,
  verifyRealPurge,
};
