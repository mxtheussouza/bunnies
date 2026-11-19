const assert = require("node:assert/strict");
const { URL } = require("node:url");
const { writeFile } = require("node:fs/promises");

const fixtureName = "pedidos/equipe %2F • #?+";
const resultCounts = (items, page, total, filtered) => ({
  items,
  page,
  page_size: 100,
  item_count: items.length,
  page_count: Math.ceil(filtered / 100),
  total_count: total,
  filtered_count: filtered,
});

function serveQueues(req, res, mode) {
  const { pathname, searchParams } = new URL(
    req.url,
    "https://fixture.invalid",
  );
  const query = Object.fromEntries(searchParams);
  assert.equal(req.method, "GET");
  assert.equal(req.headers["accept-encoding"], "identity");
  const { columns, ...options } = query;
  assert.ok(columns.includes("name,vhost,type,"));
  if (mode === "stall") {
    res.write("{");
    return;
  }
  if (mode === "denied") {
    res.writeHead(401);
    res.end('{"reason":"Not management user","private":"SYNTHETIC-METADATA"}');
    return;
  }
  const row = {
    vhost: "/",
    name: fixtureName,
    type: "classic",
    messages_ready: 0,
    consumers: 101,
    ignored: "SYNTHETIC-METADATA",
  };
  let data;
  if (pathname === "/api/queues/%2F") {
    assert.deepEqual(options, {
      pagination: "true",
      page_size: "100",
      page: options.page,
      sort: "name",
      use_regex: "false",
      ...(options.name === undefined ? {} : { name: options.name }),
    });
    if (options.name) {
      assert.equal(options.name, "%2F • #?+");
      data = resultCounts([row], 1, 101, 1);
    } else if (options.page === "1") {
      data = resultCounts(
        [
          row,
          { vhost: "/", name: ".", type: "quorum" },
          ...Array.from({ length: 98 }, (_, i) => ({
            vhost: "/",
            name: `fila-${i}`,
            type: "classic",
          })),
        ],
        1,
        101,
        101,
      );
    } else {
      assert.equal(options.page, "2");
      data = resultCounts(
        [{ ...row, name: "última", type: "stream" }],
        2,
        101,
        101,
      );
    }
  } else {
    assert.equal(
      pathname,
      `/api/queues/%2F/${encodeURIComponent(fixtureName)}`,
    );
    assert.deepEqual(options, {});
    assert.ok(columns.includes("consumer_details.ack_required"));
    data = {
      ...row,
      durable: true,
      exclusive: false,
      arguments: { "x-message-ttl": 0, "x-private": "SYNTHETIC-METADATA" },
      consumer_details: Array.from({ length: 101 }, (_, i) => ({
        consumer_tag: `fixture-${i}`,
        active: i === 0,
        ack_required: true,
        channel_details: { user: "SYNTHETIC-METADATA" },
      })),
    };
  }
  res.end(JSON.stringify(data));
}

async function navigate(page, name) {
  const button = page.getByRole("button", { name, exact: true });
  await button.focus();
  await page.keyboard.press("Enter");
  await page.getByRole("heading", { name, level: 1, exact: true }).waitFor();
}

async function verifyQueueSmoke(page, win, controls) {
  await navigate(page, "Filas");
  assert.equal(controls.count(), 0);
  assert.equal(
    await page.evaluate(() => document.activeElement?.textContent),
    "Filas",
  );
  const load = page.getByRole("button", {
    name: "Carregar filas",
    exact: true,
  });
  const summary = page.getByText(/^101 de 101 filas/);
  await load.focus();
  await page.keyboard.press("Enter");
  await summary.waitFor();
  const table = page.getByRole("table");
  assert.equal(await table.locator("tbody tr").count(), 100);
  await page.getByText("Detalhe indisponível para este nome.").waitFor();
  await page
    .getByRole("button", { name: "Próxima página", exact: true })
    .click();
  await page.getByText(/Página 2 de 2/).waitFor();
  await page.getByText("última", { exact: true }).waitFor();
  await page
    .getByRole("button", { name: "Página anterior", exact: true })
    .click();
  await page.getByText(/Página 1 de 2/).waitFor();
  const search = page.getByRole("textbox", { name: "Buscar trecho do nome" });
  const beforeSearch = controls.count();
  await search.fill("%2F • #?+");
  assert.equal(controls.count(), beforeSearch);
  await search.press("Enter");
  await page.getByText(/^1 de 101 filas/).waitFor();
  const filter = page.getByRole("combobox", { name: "Tipo (Nesta página)" });
  const beforeFilter = controls.count();
  await filter.selectOption("stream");
  await page
    .getByText("Nenhuma fila corresponde ao filtro nesta página.")
    .waitFor();
  assert.equal(controls.count(), beforeFilter);
  await filter.selectOption("all");
  const trigger = page.getByRole("button", {
    name: `Ver detalhes da fila ${fixtureName}`,
    exact: true,
  });
  const detail = page.getByRole("dialog", { name: fixtureName, exact: true });
  const close = detail.getByRole("button", {
    name: "Fechar detalhe",
    exact: true,
  });
  async function openDetail() {
    await trigger.focus();
    await page.keyboard.press("Enter");
    await detail.waitFor();
    await page.waitForFunction(() => document.activeElement?.tagName === "H2");
  }
  await openDetail();
  await detail.getByText(/Dados parciais/).waitFor();
  assert.equal(await detail.locator("li").count(), 100);
  assert.equal(
    await detail.getByText("fixture-100", { exact: true }).count(),
    0,
  );
  assert.equal(await detail.getByText("0", { exact: true }).count(), 2);
  assert.ok(
    (await detail.getByText("Indisponível", { exact: true }).count()) > 0,
  );
  assert.ok(!(await detail.textContent()).includes("SYNTHETIC-METADATA"));
  await page.keyboard.press("Escape");
  await detail.waitFor({ state: "hidden" });
  await page.waitForFunction(
    () => document.activeElement?.textContent === "pedidos/equipe %2F • #?+",
  );
  async function capture(path) {
    await page.evaluate(
      () =>
        new Promise(resolve =>
          window.requestAnimationFrame(() =>
            window.requestAnimationFrame(resolve),
          ),
        ),
    );
    const image = await win.evaluate(async w =>
      (await w.capturePage()).toPNG().toString("base64"),
    );
    await writeFile(path, Buffer.from(image, "base64"));
  }
  for (const theme of ["dark", "light"]) {
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
    await trigger.scrollIntoViewIfNeeded();
    assert.ok(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    );
    await capture(`out/queues-5a-${theme}-zoom.png`);
    await openDetail();
    await detail.getByText(/Dados parciais/).waitFor();
    assert.ok(await detail.evaluate(e => e.scrollWidth <= e.clientWidth));
    await capture(`out/queues-5a-detail-${theme}-zoom.png`);
    await close.click();
  }
  await win.evaluate(w => w.webContents.setZoomFactor(1));
  controls.setMode("denied");
  await search.press("Enter");
  await page.getByText(/A consulta foi negada por permissão/).waitFor();
  await page.getByText(/Desatualizado/).waitFor();
  assert.ok(
    !(await page.locator("body").textContent()).includes("SYNTHETIC-METADATA"),
  );
  controls.setMode("stall");
  let beforeAbort = controls.aborted();
  let beforeStall = controls.started();
  await openDetail();
  await detail.getByText("Carregando detalhe…").waitFor();
  await controls.until(() => controls.started() > beforeStall);
  await page.keyboard.press("Escape");
  await controls.until(() => controls.aborted() > beforeAbort);
  beforeAbort = controls.aborted();
  beforeStall = controls.started();
  await search.press("Enter");
  await controls.until(() => controls.started() > beforeStall);
  await navigate(page, "Conexões");
  await controls.until(() => controls.aborted() > beforeAbort);
  assert.equal((await controls.state()).desired, true);
  return [
    "queue-navigation-manual-page-search-and-local-type-filter",
    "queue-detail-closed-projection-partial-metadata-and-keyboard-focus",
    "queue-both-themes-at-200-percent",
    "queue-sanitized-denial-and-stale-snapshot",
    "queue-close-detail-and-navigation-abort-with-session-preserved",
  ];
}

module.exports = { serveQueues, verifyQueueSmoke, navigate };
