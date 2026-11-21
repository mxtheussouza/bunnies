const assert = require("node:assert/strict");
const { URL } = require("node:url");
const { writeFile } = require("node:fs/promises");
const { navigate } = require("./queues.cjs");

const origin = "bunnies-bind-source /á%2F";
const destination = "bunnies-bind-destination /á%2F";
const segment = encodeURIComponent;
function fixture() {
  const calls = [];
  const posts = [];
  let mode = "normal";
  const row = (name, type = "direct") => ({
    name,
    type,
    vhost: "/",
    durable: true,
    auto_delete: false,
    internal: false,
    arguments: {},
  });
  const response = (res, body) => res.end(JSON.stringify(body));
  return {
    calls,
    posts,
    setMode(value) {
      mode = value;
    },
    async serve(req, res) {
      const url = new URL(req.url, "https://fixture.invalid");
      const [, , kind, vhost, first] = url.pathname.split("/");
      assert.equal(decodeURIComponent(vhost), "/");
      calls.push([req.method, kind]);
      if (kind === "exchanges") {
        if (!first)
          return response(res, {
            items: [row(origin)],
            page: 1,
            page_size: 100,
            total_count: 1,
            filtered_count: 1,
            item_count: 1,
            page_count: 1,
          });
        if (url.pathname.endsWith("/bindings/source")) return response(res, []);
        return response(res, row(decodeURIComponent(first)));
      }
      if (kind === "queues")
        return response(res, {
          name: destination,
          vhost: "/",
          type: "classic",
        });
      assert.equal(kind, "bindings");
      if (req.method === "POST") {
        let raw = "";
        for await (const chunk of req) raw += chunk;
        posts.push(JSON.parse(raw));
        if (mode === "lost") return res.destroy();
        if (mode === "stall") return;
        const last = url.pathname.split("/").at(-1);
        res.writeHead(201, {
          Location:
            mode === "invalid" ? "https://example.invalid/x" : last + "/.",
        });
        return res.end();
      }
      assert.equal(
        url.pathname,
        "/api/bindings/%2F/e/" + segment(origin) + "/q/" + segment(destination),
      );
      return response(res, [
        {
          vhost: "/",
          source: origin,
          destination,
          destination_type: "queue",
          routing_key: ".",
          properties_key: ".",
          arguments: posts.at(-1).arguments,
        },
      ]);
    },
  };
}

async function openSource(page, name = origin) {
  await navigate(page, "Exchanges");
  const term = page.getByRole("textbox", { name: "Buscar trecho do nome" });
  await term.fill(name);
  await term.press("Enter");
  await page.getByRole("button", { name, exact: true }).click();
  return page.getByRole("button", { name: "Novo binding", exact: true });
}

async function verifySmoke({ page, win, focus, until, fixture }) {
  const open = await openSource(page);
  const dialog = page.getByRole("dialog", { name: "Novo binding" });
  const dest = dialog.getByLabel("Nome exato do destino");
  const submit = dialog.getByRole("button", {
    name: "Criar binding",
    exact: true,
  });
  for (const theme of ["light", "dark"]) {
    await page.getByLabel("Tema", { exact: true }).first().selectOption(theme);
    await open.press("Enter");
    await until(() => dest.evaluate(el => el === document.activeElement));
    await dialog.getByText(/⚠.*Produção/).waitFor();
    const originalWidth = await page.evaluate(() => window.innerWidth);
    await win.evaluate(w => w.webContents.setZoomFactor(2));
    await until(
      async () =>
        (await page.evaluate(() => window.innerWidth)) < originalWidth * 0.75,
    );
    await focus();
    await dest.focus();
    await page.evaluate(
      () =>
        new Promise(resolve =>
          window.requestAnimationFrame(() =>
            window.requestAnimationFrame(resolve),
          ),
        ),
    );
    assert.equal(
      await dialog.evaluate(el => el.scrollWidth <= el.clientWidth),
      true,
    );
    const screenshot = await win.evaluate(async w =>
      (await w.capturePage()).toPNG().toString("base64"),
    );
    await writeFile(
      "out/binding-create-6d-" + theme + "-zoom.png",
      Buffer.from(screenshot, "base64"),
    );
    await win.evaluate(w => w.webContents.setZoomFactor(1));
    await until(
      async () =>
        (await page.evaluate(() => window.innerWidth)) >= originalWidth * 0.95,
    );
    await dialog.press("Escape");
    await until(() => open.evaluate(el => el === document.activeElement));
  }
  assert.equal(fixture.posts.length, 0);
  await open.press("Enter");
  await dest.fill(destination);
  await dialog.getByLabel("Routing key").fill(".");
  await dialog.getByRole("button", { name: "Adicionar argumento" }).click();
  await dialog.getByLabel("Chave", { exact: true }).fill("enabled");
  await dialog.getByLabel("Tipo de valor").selectOption("boolean");
  await submit.click();
  await dialog.getByText("Binding confirmado", { exact: true }).waitFor();
  assert.deepEqual(fixture.posts, [
    { routing_key: ".", arguments: { enabled: false } },
  ]);
  assert.equal(
    fixture.calls.filter(
      ([method, kind]) => method === "GET" && kind === "bindings",
    ).length,
    1,
  );
  fixture.setMode("invalid");
  await submit.click();
  await dialog.getByText("Criação aceita, conferência indisponível").waitFor();
  assert.equal(
    fixture.calls.filter(
      ([method, kind]) => method === "GET" && kind === "bindings",
    ).length,
    1,
  );
  fixture.setMode("lost");
  await submit.click();
  await dialog.getByText("Resultado incerto", { exact: true }).waitFor();
  fixture.setMode("stall");
  await submit.click();
  await until(() => fixture.posts.length === 4);
  await dialog.getByRole("button", { name: "Parar de aguardar" }).click();
  await dialog.getByText("Resultado incerto", { exact: true }).waitFor();
  await dialog
    .getByRole("button", { name: "Consultar bindings de saída" })
    .click();
  await page.getByText("Nenhum binding retornado nesta direção.").waitFor();
  assert.equal(fixture.posts.length, 4);
  await navigate(page, "Conexões");
  return [
    "focus-keys-zoom-and-production-context-without-write-on-open",
    "single-post-with-point-identity-and-typed-false",
    "invalid-location-no-get-and-network-loss-or-cancel-no-replay",
  ];
}

async function verifyReal({ page, session, vhost, api }) {
  const open = await openSource(page);
  await open.click();
  const dialog = page.getByRole("dialog", { name: "Novo binding" });
  await dialog.getByLabel("Nome exato do destino").fill(destination);
  await dialog.getByLabel("Routing key").fill(".");
  await dialog
    .getByRole("button", { name: "Criar binding", exact: true })
    .click();
  await dialog.getByText("Binding confirmado", { exact: true }).waitFor();
  await dialog.getByRole("button", { name: "Fechar", exact: true }).click();
  const { sessionId, generation } = session;
  const sent = [];
  for (const [destinationType, routingKey, args] of [
    ["exchange", "..", {}],
    ["queue", " /á%2F", {}],
    ["exchange", "typed", { test: false, count: 0, text: "" }],
  ]) {
    const binding = {
      source: origin,
      destinationType,
      destination,
      routingKey,
      arguments: args,
    };
    const result = await page.evaluate(
      ({ sessionId, generation, binding }) =>
        window.bunnies.createSessionBinding({
          sessionId,
          generation,
          binding,
          operationId: window.crypto.randomUUID(),
        }),
      { sessionId, generation, binding },
    );
    assert.equal(result.value?.status, "confirmed", JSON.stringify(result));
    assert.equal(result.value.vhost, vhost);
    const rows = await api(
      "bindings/" +
        segment(vhost) +
        "/e/" +
        segment(origin) +
        "/" +
        (destinationType === "queue" ? "q" : "e") +
        "/" +
        segment(destination),
    );
    assert.equal(
      rows.filter(
        row =>
          row.properties_key === result.value.identity &&
          row.routing_key === routingKey,
      ).length,
      1,
    );
    sent.push([vhost, destinationType, routingKey]);
  }
  if (vhost === "/") {
    async function submit(binding) {
      return page.evaluate(
        ({ sessionId, generation, binding }) =>
          window.bunnies.createSessionBinding({
            sessionId,
            generation,
            binding,
            operationId: window.crypto.randomUUID(),
          }),
        { sessionId, generation, binding },
      );
    }
    const binding = {
      source: origin,
      destinationType: "exchange",
      destination,
      routingKey: "typed",
      arguments: { test: false, count: 0, text: "" },
    };
    assert.equal((await submit(binding)).value?.status, "confirmed");
    for (const [change, reason] of [
      [{ destination: "bunnies-bind-absent" }, "NOT_FOUND"],
      [{ destination: "bunnies-denied-destination" }, "DENIED"],
      [{ source: "bunnies-denied-source" }, "DENIED"],
    ]) {
      const result = await submit({ ...binding, ...change });
      assert.equal(result.error?.code, reason, JSON.stringify(result));
    }
  }
  await page
    .getByRole("button", { name: "Voltar à lista", exact: true })
    .click();
  return [[vhost, "queue", "."], ...sent];
}
module.exports = { fixture, verifySmoke, verifyReal, origin, destination };
