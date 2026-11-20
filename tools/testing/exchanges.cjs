const assert = require("node:assert/strict");
const { writeFile } = require("node:fs/promises");
const { URL } = require("node:url");
const { navigate } = require("./queues.cjs");

const mockName = "pedidos/equipe %2F •";
const destination = "auditoria";

function fixture() {
  const requests = [];
  let stalls = 0;
  let aborts = 0;
  let stalled = false;
  const row = name => ({
    vhost: "/",
    name,
    type: name ? "topic" : "direct",
    durable: true,
    auto_delete: false,
    internal: false,
  });
  return {
    requests,
    stalls: () => stalls,
    aborts: () => aborts,
    stall: () => {
      stalled = true;
    },
    serve(req, res) {
      assert.equal(req.method, "GET");
      const { pathname, searchParams } = new URL(req.url, "https://fixture");
      const [, , , vhost, name, kind, direction] = pathname.split("/");
      assert.equal(decodeURIComponent(vhost), "/");
      requests.push({ name, direction });
      if (stalled) {
        stalls++;
        res.on("close", () => {
          if (!res.writableEnded) aborts++;
        });
        res.write("[");
        return;
      }
      if (!name) {
        assert.equal(searchParams.get("pagination"), "true");
        assert.equal(searchParams.get("page_size"), "100");
        assert.equal(searchParams.get("use_regex"), "false");
        return res.end(
          JSON.stringify({
            items: [row(""), row(mockName)],
            page: 1,
            page_size: 100,
            total_count: 2,
            filtered_count: 2,
            item_count: 2,
            page_count: 1,
          }),
        );
      }
      if (kind === "bindings") {
        assert.equal(decodeURIComponent(name), mockName);
        assert.ok(["source", "destination"].includes(direction));
        return res.end(
          JSON.stringify(
            direction === "source"
              ? [
                  {
                    vhost: "/",
                    source: mockName,
                    destination,
                    destination_type: "exchange",
                    routing_key: "",
                    properties_key: "binding~marker",
                    arguments: { marker: "<script>" },
                  },
                ]
              : [],
          ),
        );
      }
      const actualName = decodeURIComponent(name);
      assert.ok(["amq.default", mockName].includes(actualName));
      return res.end(
        JSON.stringify({
          ...row(actualName === "amq.default" ? "" : actualName),
          arguments: {},
        }),
      );
    },
  };
}

async function verifySmoke({ page, win, focus, until, fixture }) {
  const checks = [];
  await navigate(page, "Exchanges");
  assert.equal(fixture.requests.length, 0);
  const list = page.getByRole("button", {
    name: "Carregar exchanges",
    exact: true,
  });
  await list.press("Enter");
  const exact = page.getByRole("button", { name: mockName, exact: true });
  await exact.waitFor();
  await page
    .getByRole("button", { name: "Exchange padrão", exact: true })
    .press("Enter");
  await page.getByText(/Esses vínculos são implícitos/).waitFor();
  assert.equal(
    await page.getByRole("button", { name: /Consultar bindings/ }).count(),
    0,
  );
  assert.equal(fixture.requests.length, 2);
  await page
    .getByRole("button", { name: "Voltar à lista", exact: true })
    .press("Enter");
  await until(() =>
    page
      .getByRole("button", { name: "Exchange padrão", exact: true })
      .evaluate(el => el === document.activeElement),
  );
  checks.push(
    "manual-load-and-default-exchange-detail-without-binding-requests",
  );

  await exact.press("Enter");
  const heading = page.getByRole("heading", { name: mockName, exact: true });
  await until(() => heading.evaluate(el => el === document.activeElement));
  const outgoing = page.getByRole("button", {
    name: "Consultar bindings de saída",
    exact: true,
  });
  await outgoing.press("Enter");
  await page.getByText('"binding~marker"', { exact: true }).waitFor();
  await page.getByText('{"marker":"<script>"}', { exact: true }).waitFor();
  assert.equal(await page.locator(".exchange-arguments script").count(), 0);
  for (const [theme, file] of [
    ["light", "light"],
    ["dark", "dark"],
  ]) {
    await win.evaluate(w => w.webContents.setZoomFactor(1));
    await page.getByLabel("Tema", { exact: true }).first().selectOption(theme);
    await win.evaluate(w => w.webContents.setZoomFactor(2));
    await focus();
    await outgoing.focus();
    await outgoing.evaluate(el => el.scrollIntoView({ block: "start" }));
    await until(() => outgoing.evaluate(el => el === document.activeElement));
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
      true,
    );
    const capture = await win.evaluate(async w =>
      (await w.capturePage()).toPNG().toString("base64"),
    );
    await writeFile(
      `out/exchanges-6a-${file}-zoom.png`,
      Buffer.from(capture, "base64"),
    );
  }
  await win.evaluate(w => w.webContents.setZoomFactor(1));
  await focus();
  await page
    .getByRole("button", { name: "Consultar bindings de entrada", exact: true })
    .press("Enter");
  await page.getByText("Nenhum binding retornado nesta direção.").waitFor();
  await page
    .getByRole("button", { name: "Voltar à lista", exact: true })
    .press("Enter");
  await until(() => exact.evaluate(el => el === document.activeElement));
  checks.push(
    "bindings-by-direction-escape-text-keyboard-focus-themes-and-200-percent-zoom",
  );

  fixture.stall();
  await list.click();
  await until(() => fixture.stalls() === 1);
  await page
    .getByRole("button", { name: "Cancelar consulta", exact: true })
    .click();
  await page.getByText("Consulta cancelada", { exact: true }).waitFor();
  await until(() => fixture.aborts() === 1);
  await list.click();
  await until(() => fixture.stalls() === 2);
  await navigate(page, "Conexões");
  await until(() => fixture.aborts() === 2);
  checks.push("explicit-cancel-and-navigation-abort-in-flight-https");
  return checks;
}

async function verifyReal(page, { name, vhost, remoteDestination }) {
  await navigate(page, "Exchanges");
  const region = page.getByRole("region", { name: "Consultar exchanges" });
  await region
    .getByText(`Vhost ${vhost} · HTTPS Management`, { exact: true })
    .waitFor();
  const term = region.getByRole("textbox", { name: "Buscar trecho do nome" });
  await term.fill("%2F • #?+");
  await term.press("Enter");
  try {
    await region.getByRole("button", { name, exact: true }).click();
  } catch (error) {
    const visible = await page.locator("main").innerText();
    throw new Error(
      `Exchange search in ${vhost} did not return its fixture: ${visible.slice(-1000)}`,
      { cause: error },
    );
  }
  await region
    .getByText(JSON.stringify({ scope: vhost }), { exact: true })
    .waitFor();
  await region
    .getByRole("button", { name: "Consultar bindings de saída", exact: true })
    .click();
  const outgoing = region.getByRole("region", { name: "Bindings de saída" });
  if (vhost !== "/") {
    await outgoing
      .getByText("Nenhum binding retornado nesta direção.")
      .waitFor();
    return;
  }
  await outgoing.getByText(remoteDestination, { exact: true }).waitFor();
  for (const marker of ["a", "b"])
    await outgoing
      .getByText(JSON.stringify({ marker }), { exact: true })
      .waitFor();
  assert.equal(await outgoing.getByText("Vazia", { exact: true }).count(), 2);
  await region
    .getByRole("button", { name: "Voltar à lista", exact: true })
    .click();
  await region
    .getByRole("textbox", { name: "Buscar trecho do nome" })
    .fill(remoteDestination);
  await region
    .getByRole("button", { name: "Buscar exchanges", exact: true })
    .click();
  await region
    .getByRole("button", { name: remoteDestination, exact: true })
    .click();
  await region
    .getByRole("button", { name: "Consultar bindings de entrada", exact: true })
    .click();
  await region
    .getByRole("region", { name: "Bindings de entrada" })
    .getByText(name, { exact: true })
    .waitFor();
}

module.exports = { fixture, verifySmoke, verifyReal };
