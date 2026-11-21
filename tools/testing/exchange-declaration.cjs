const { URL } = require("node:url");
const assert = require("node:assert/strict");
const { writeFile } = require("node:fs/promises");
const { navigate } = require("./queues.cjs");

function fixture() {
  const requests = [];
  let mode = "normal",
    stored;
  return {
    requests,
    mode(value) {
      mode = value;
    },
    async serve(req, res) {
      requests.push(req.method);
      const url = new URL(req.url, "https://fixture");
      const segments = url.pathname.split("/");
      const name = decodeURIComponent(segments.pop());
      assert.equal(decodeURIComponent(segments.pop()), "/");
      if (req.method === "PUT") {
        let body = "";
        for await (const chunk of req) body += chunk.toString();
        const data = JSON.parse(body);
        assert.deepEqual(data, {
          type: "headers",
          durable: false,
          auto_delete: true,
          internal: false,
          arguments: {},
        });
        stored = { ...data, name, vhost: "/" };
        if (mode === "lost") return res.destroy();
        if (mode === "stall") return;
        res.writeHead(201);
        return res.end();
      }
      assert.equal(req.method, "GET");
      if (mode === "failed-check") {
        res.writeHead(503);
        return res.end();
      }
      assert.equal(stored.name, name);
      res.end(JSON.stringify(stored));
    },
  };
}

async function verifySmoke({ page, win, focus, until, fixture }) {
  const checks = [];
  const open = page.getByRole("button", { name: "Nova exchange", exact: true });
  const dialog = page.getByRole("dialog", { name: "Nova exchange" });
  const field = dialog.getByLabel("Nome da exchange");
  const submit = dialog.getByRole("button", {
    name: "Declarar exchange",
    exact: true,
  });
  const name = "bunnies-nova /á%2F";
  await navigate(page, "Exchanges");
  for (const [theme, label] of [
    ["light", "claro"],
    ["dark", "escuro"],
  ]) {
    await page.getByLabel("Tema", { exact: true }).first().selectOption(theme);
    await open.press("Enter");
    await until(() => field.evaluate(el => el === document.activeElement));
    await dialog.getByText(/⚠.*Produção/).waitFor();
    await dialog.getByText(/^https:\/\/127\.0\.0\.1/).waitFor();
    await win.evaluate(w => w.webContents.setZoomFactor(2));
    await focus();
    await field.focus();
    assert.equal(
      await dialog.evaluate(el => el.scrollWidth <= el.clientWidth),
      true,
    );
    const capture = await win.evaluate(async w =>
      (await w.capturePage()).toPNG().toString("base64"),
    );
    await writeFile(
      "out/exchange-declaration-6b-" + label + "-zoom.png",
      Buffer.from(capture, "base64"),
    );
    await win.evaluate(w => w.webContents.setZoomFactor(1));
    await dialog.press("Escape");
    await until(() => open.evaluate(el => el === document.activeElement));
  }
  assert.deepEqual(fixture.requests, []);
  checks.push(
    "context-endpoint-production-focus-themes-200-percent-and-zero-writes-on-open",
  );
  await open.press("Enter");
  await field.fill("amq.topic");
  await submit.click();
  await dialog.getByText("Dados inválidos").waitFor();
  assert.deepEqual(fixture.requests, []);
  await field.fill(name);
  await dialog.getByLabel("Tipo da exchange").selectOption("headers");
  await dialog.getByLabel("Durável", { exact: true }).uncheck();
  await dialog.getByLabel("Exclusão automática", { exact: true }).check();
  await submit.click();
  await dialog.getByText("Declaração confirmada", { exact: true }).waitFor();
  assert.deepEqual(fixture.requests, ["PUT", "GET"]);
  checks.push("explicit-single-put-and-verified-headers-flags");
  fixture.mode("failed-check");
  await submit.click();
  await dialog
    .getByText("Declaração aceita, conferência indisponível", { exact: true })
    .waitFor();
  fixture.mode("lost");
  await submit.click();
  await dialog.getByText("Resultado incerto", { exact: true }).waitFor();
  fixture.mode("stall");
  await submit.click();
  await until(() => fixture.requests.filter(x => x === "PUT").length === 4);
  await dialog.getByRole("button", { name: "Parar de aguardar" }).click();
  await dialog.getByText("Resultado incerto", { exact: true }).waitFor();
  fixture.mode("normal");
  await dialog.getByRole("button", { name: "Verificar exchange" }).click();
  await page.getByRole("heading", { name, exact: true }).waitFor();
  await page.getByText("Argumentos", { exact: true }).waitFor();
  assert.deepEqual(fixture.requests, [
    "PUT",
    "GET",
    "PUT",
    "GET",
    "PUT",
    "PUT",
    "GET",
  ]);
  checks.push(
    "accepted-unverified-lost-response-cancel-and-manual-get-without-replay",
  );
  await navigate(page, "Conexões");
  return checks;
}

async function verifyRecoveryAndReload({
  page,
  peer,
  focus,
  until,
  state,
  fixture,
}) {
  const baseline = [...fixture.requests];
  const attempts = peer.attempts;
  const draft = async () => {
    await page
      .getByRole("button", { name: "Nova exchange", exact: true })
      .click();
    await page.getByLabel("Nome da exchange").fill("bunnies-recovery-draft");
  };
  await navigate(page, "Exchanges");
  await draft();
  await focus();
  for (const socket of peer.sockets) socket.destroy();
  await until(
    async () => peer.attempts > attempts && (await state()).state === "ready",
    20000,
  );
  await page
    .getByRole("dialog", { name: "Nova exchange" })
    .waitFor({ state: "hidden" });
  assert.deepEqual(fixture.requests, baseline);
  await draft();
  await page.reload();
  await page.getByRole("button", { name: /Administração isolada/ }).waitFor();
  await until(async () => !(await state()).desired && peer.sockets.size === 0);
  assert.deepEqual(fixture.requests, baseline);
}

async function verifyReal({ page, api, checks, session, vhost }) {
  const name = "bunnies-new-pacote /%2F •";
  const { sessionId, generation } = session;
  async function declare(fields) {
    return page.evaluate(
      ({ sessionId, generation, declaration }) =>
        window.bunnies.declareSessionExchange({
          sessionId,
          generation,
          operationId: window.crypto.randomUUID(),
          declaration,
        }),
      {
        sessionId,
        generation,
        declaration: {
          name,
          type: "topic",
          durable: true,
          autoDelete: false,
          ...fields,
        },
      },
    );
  }
  await navigate(page, "Exchanges");
  await page
    .getByRole("button", { name: "Nova exchange", exact: true })
    .click();
  const dialog = page.getByRole("dialog", { name: "Nova exchange" });
  await dialog.getByLabel("Nome da exchange").fill(name);
  await dialog.getByLabel("Tipo da exchange").selectOption("topic");
  await dialog
    .getByRole("button", { name: "Declarar exchange", exact: true })
    .click();
  await dialog.getByText("Declaração confirmada", { exact: true }).waitFor();
  await dialog.getByRole("button", { name: "Verificar exchange" }).click();
  await page.getByRole("heading", { name, exact: true }).waitFor();
  await page.getByText("Argumentos", { exact: true }).waitFor();
  await page
    .getByRole("button", { name: "Voltar à lista", exact: true })
    .click();
  const names = [name];
  if (vhost === "/") {
    for (const type of ["direct", "topic", "fanout", "headers"])
      for (const durable of [true, false])
        for (const autoDelete of [true, false]) {
          const id = "bunnies-new-app-" + [type, durable, autoDelete].join("-");
          const result = await declare({ name: id, type, durable, autoDelete });
          assert.equal(
            result.value?.status,
            "confirmed",
            JSON.stringify(result),
          );
          names.push(id);
          const item = await api(
            "exchanges/%2F/" + encodeURIComponent(id) + "?disable_stats=true",
          );
          assert.deepEqual(
            [
              item.type,
              item.durable,
              item.auto_delete,
              item.internal,
              item.arguments,
            ],
            [type, durable, autoDelete, false, {}],
          );
        }
    assert.equal((await declare({})).value.status, "confirmed");
    const ambiguous = await declare({ type: "direct" });
    assert.equal(ambiguous.value?.status, "uncertain");
    assert.equal(ambiguous.value.reason, "SERVER");
    assert.equal(
      (
        await api(
          "exchanges/%2F/" + encodeURIComponent(name) + "?disable_stats=true",
        )
      ).type,
      "topic",
    );
    const conflict = await declare({
      name: "bunnies-new-app-topic-true-false",
      type: "direct",
    });
    assert.equal(
      conflict.error?.code,
      "EXCHANGE_DECLARATION_CONFLICT",
      JSON.stringify(conflict),
    );
    assert.equal(
      (await declare({ name: "bunnies-forbidden" })).error.code,
      "DENIED",
    );
    assert.equal(
      (await declare({ name: "amq.default" })).error.code,
      "VALIDATION",
    );
    checks.push(
      "package-sixteen-combinations-equivalent-conflict-reserved-and-permission",
    );
  }
  checks.push("package-ui-declaration-and-manual-detail-in-" + vhost);
  return names.map(n => [vhost, n]);
}
module.exports = { fixture, verifySmoke, verifyReal, verifyRecoveryAndReload };
