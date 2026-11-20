const assert = require("node:assert/strict");
const { writeFile } = require("node:fs/promises");
const { URL } = require("node:url");
const { navigate } = require("./queues.cjs");

function fixture() {
  const rows = new Map();
  let puts = 0;
  let mode = "ok";
  return {
    count: () => puts,
    setMode: value => {
      mode = value;
    },
    async serve(req, res) {
      const url = new URL(req.url, "https://test.invalid");
      const parts = /^\/api\/queues\/%2F\/([^/]+)$/.exec(url.pathname);
      assert.ok(parts);
      const name = decodeURIComponent(parts[1]);
      if (req.method === "PUT") {
        puts++;
        assert.equal(req.headers["content-type"], "application/json");
        assert.equal(req.headers["accept-encoding"], "identity");
        assert.equal(url.search, "");
        const chunks = [];
        for await (const chunk of req) chunks.push(chunk);
        const body = JSON.parse(Buffer.concat(chunks).toString("utf8"));
        assert.equal(body.durable, true);
        assert.equal(body.auto_delete, false);
        assert.equal(body.exclusive, false);
        assert.equal(body.node, undefined);
        if (mode === "denied") {
          res.writeHead(401);
          res.end(
            '{"error":"not_authorised","reason":"Access refused.","ignored":"SYNTHETIC-METADATA"}',
          );
          return;
        }
        rows.set(name, {
          ...body,
          name,
          type: body.arguments["x-queue-type"],
          vhost: "/",
        });
        if (mode === "stall") return;
        res.writeHead(201);
        res.end();
        return;
      }
      assert.equal(req.method, "GET");
      assert.ok(url.searchParams.get("columns").includes("arguments"));
      res.end(
        JSON.stringify({ ...rows.get(name), ignored: "SYNTHETIC-METADATA" }),
      );
    },
  };
}

async function openForm(page, { name, type = "classic", ttl = "" }) {
  const button = page.getByRole("button", { name: "Nova fila", exact: true });
  await button.focus();
  await page.keyboard.press("Enter");
  const dialog = page.getByRole("dialog", { name: "Nova fila", exact: true });
  const input = dialog.getByRole("textbox", {
    name: "Nome da fila",
    exact: true,
  });
  await input.waitFor();
  await input.fill(name);
  await dialog
    .getByRole("combobox", { name: "Tipo da fila", exact: true })
    .selectOption(type);
  await dialog
    .getByRole("textbox", { name: "TTL de mensagens (ms)", exact: true })
    .fill(ttl);
  return dialog;
}

async function submit(dialog, expected) {
  const button = dialog.getByRole("button", {
    name: "Declarar fila",
    exact: true,
  });
  await button.focus();
  await button.press("Enter");
  try {
    await dialog.getByText(expected, { exact: true }).waitFor();
  } catch (error) {
    const status = await dialog.getByRole("status").allTextContents();
    throw new Error(
      `Expected ${expected}. Declaration status: ${status.join(" | ")}`,
      { cause: error },
    );
  }
}
async function closeForm(dialog) {
  await dialog.getByRole("button", { name: "Fechar", exact: true }).click();
  await dialog.waitFor({ state: "hidden" });
}

async function verifyDeclarationSmoke(page, win, controls, until) {
  await navigate(page, "Filas");
  const name = "fila/quorum %2F • +";
  const open = () => openForm(page, { name, type: "quorum", ttl: "0" });
  let dialog = await open();
  await dialog.getByText(/Produção/).waitFor();
  assert.equal(controls.count(), 0);
  await dialog
    .getByRole("checkbox", { name: "Configurar dead-letter exchange (DLX)" })
    .check();
  await dialog.getByRole("checkbox", { name: "Definir routing key" }).check();
  await submit(dialog, "Declaração confirmada");
  assert.equal(controls.count(), 1);
  await dialog.getByRole("button", { name: "Verificar fila" }).click();
  const details = page.getByRole("dialog", { name, exact: true });
  await details.getByText("x-message-ttl", { exact: true }).waitFor();
  await details.getByText("0", { exact: true }).waitFor();
  await details.getByText("Texto vazio", { exact: true }).first().waitFor();
  assert.equal(
    await details.getByText("Texto vazio", { exact: true }).count(),
    2,
  );
  await page.keyboard.press("Escape");
  await details.waitFor({ state: "hidden" });
  await page.waitForFunction(
    () => document.activeElement?.textContent === "Nova fila",
  );
  for (const theme of ["light", "dark"]) {
    await win.evaluate(w => w.webContents.setZoomFactor(1));
    await page
      .getByRole("combobox", { name: "Tema", exact: true })
      .selectOption(theme);
    await page.waitForFunction(
      value => document.documentElement.dataset.theme === value,
      theme,
    );
    await win.evaluate(w => w.webContents.setZoomFactor(2));
    await page.waitForFunction(() => window.innerWidth <= 650);
    dialog = await open();
    assert.ok(
      await dialog.evaluate(
        element => element.scrollWidth <= element.clientWidth + 1,
      ),
    );
    const image = await win.evaluate(async w =>
      (await w.capturePage()).toPNG().toString("base64"),
    );
    await writeFile(
      `out/queue-declaration-5b-${theme}-zoom.png`,
      Buffer.from(image, "base64"),
    );
    await page.keyboard.press("Escape");
    await dialog.waitFor({ state: "hidden" });
  }
  await win.evaluate(w => w.webContents.setZoomFactor(1));
  controls.setMode("denied");
  dialog = await open();
  await submit(dialog, "Declaração recusada");
  assert.ok(!(await dialog.textContent()).includes("SYNTHETIC-METADATA"));
  await closeForm(dialog);
  controls.setMode("stall");
  dialog = await open();
  await submit(dialog, "Aguardando declaração");
  await until(() => controls.count() === 3);
  await dialog.getByRole("button", { name: "Parar de aguardar" }).click();
  await dialog.getByText("Resultado incerto", { exact: true }).waitFor();
  assert.equal(controls.count(), 3);
  await dialog.getByRole("button", { name: "Verificar fila" }).click();
  await details.getByText("x-message-ttl", { exact: true }).waitFor();
  await page.keyboard.press("Escape");
  await details.waitFor({ state: "hidden" });
  await navigate(page, "Conexões");
  return [
    "declaration-confirmed-by-metadata-and-explicit-item-read",
    "declaration-produces-no-automatic-put-and-sanitizes-permission-denial",
    "declaration-post-send-cancel-explicit-uncertainty-no-replay",
    "declaration-focus-keyboard-and-both-themes-at-200-percent",
  ];
}
module.exports = {
  fixture,
  openForm,
  submit,
  closeForm,
  verifyDeclarationSmoke,
};
