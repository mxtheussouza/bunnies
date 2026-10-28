const assert = require("node:assert/strict");
const {
  mkdtemp,
  readFile,
  readdir,
  rm,
  writeFile,
} = require("node:fs/promises");
const path = require("node:path");
const os = require("node:os");
const { _electron: electron } = require("playwright");
const sentinel = "BUNNIES-SYNTHETIC-MEMORY-SENTINEL";
const profileName = "Perfil isolado de teste";
const entry = "bunnies://app/app_window/index.html";
async function run() {
  const artifact = path.resolve(
    `out/Bunnies-${process.platform}-${process.arch}`,
  );
  const executablePath = {
    darwin: path.join(artifact, "Bunnies.app/Contents/MacOS/bunnies"),
    linux: path.join(artifact, "bunnies"),
    win32: path.join(artifact, "bunnies.exe"),
  }[process.platform];
  assert.ok(executablePath);
  const userData = await mkdtemp(path.join(os.tmpdir(), "bunnies-profiles-"));
  const file = path.join(userData, "profiles.json");
  const errors = [],
    requests = [];
  let application;
  async function launch() {
    application = await electron.launch({
      executablePath,
      args: [`--user-data-dir=${userData}`],
      chromiumSandbox: true,
      timeout: 30000,
    });
    const page = await application.firstWindow();
    page.setDefaultTimeout(10000);
    page.on("pageerror", error => errors.push(error.message));
    page.on("request", request => {
      if (!request.url().startsWith("bunnies://app/"))
        requests.push(request.url());
    });
    await page
      .getByRole("heading", { name: "Conexões", exact: true })
      .waitFor();
    await page
      .getByRole("button", { name: "Novo perfil", exact: true })
      .waitFor();
    await page.waitForFunction(
      () =>
        !document.querySelector("button[aria-busy='true']") &&
        !Array.from(document.querySelectorAll("p")).some(
          p => p.textContent === "Carregando perfis locais…",
        ),
    );
    return page;
  }
  async function capture(page, name) {
    await page.evaluate(
      () =>
        new Promise(resolve =>
          window.requestAnimationFrame(() =>
            window.requestAnimationFrame(resolve),
          ),
        ),
    );
    const window = await application.browserWindow(page);
    const png = await window.evaluate(async win =>
      (await win.capturePage()).toPNG().toString("base64"),
    );
    await writeFile(`out/profiles-4a1-${name}.png`, Buffer.from(png, "base64"));
  }
  async function chooseTheme(page, mode) {
    const expand = page.getByRole("button", {
      name: "Expandir navegação",
      exact: true,
    });
    if (await expand.isVisible()) {
      await expand.click();
      const panel = page.getByRole("dialog", {
        name: "Navegação",
        exact: true,
      });
      await panel
        .getByRole("combobox", { name: "Tema", exact: true })
        .selectOption(mode);
      await panel
        .getByRole("button", { name: "Fechar navegação", exact: true })
        .click();
    } else
      await page
        .getByRole("combobox", { name: "Tema", exact: true })
        .selectOption(mode);
    await page.waitForFunction(
      mode => document.documentElement.dataset.theme === mode,
      mode,
    );
  }
  try {
    let page = await launch();
    const protection = await page.evaluate(() =>
      window.bunnies.getSecretProtectionStatus(),
    );
    assert.deepEqual(protection.value, {
      persistence: "disabled",
      reason: "unverified",
    });
    await page
      .getByRole("button", { name: "Novo perfil", exact: true })
      .click();
    let dialog = page.getByRole("dialog", { name: "Novo perfil", exact: true });
    await dialog.waitFor();
    assert.equal(
      await dialog
        .getByLabel("Nome do perfil", { exact: true })
        .evaluate(input => input === document.activeElement),
      true,
    );
    await dialog
      .getByLabel("Nome do perfil", { exact: true })
      .fill(profileName);
    await dialog
      .getByLabel("Ambiente", { exact: true })
      .selectOption("production");
    await dialog
      .getByLabel("Endpoint HTTPS", { exact: true })
      .fill("https://localhost:15671");
    await dialog
      .getByLabel("Endpoint AMQPS", { exact: true })
      .fill("amqps://localhost:5671/%2F");
    await dialog.getByLabel("Usuário", { exact: true }).fill("synthetic-user");
    await dialog.getByLabel("Nova senha", { exact: true }).fill(sentinel);
    assert.equal(
      await dialog
        .getByLabel("Nova senha", { exact: true })
        .getAttribute("type"),
      "password",
    );
    assert.equal(
      await dialog
        .getByRole("option", { name: "Protegida pelo sistema operacional" })
        .isDisabled(),
      true,
    );
    await dialog.evaluate(element => {
      element.scrollTop = 0;
    });
    await capture(page, "form-light");
    const submit = dialog.getByRole("button", {
      name: "Salvar perfil",
      exact: true,
    });
    await submit.focus();
    await page.keyboard.press("Enter");
    await dialog.waitFor({ state: "hidden" });
    await page
      .getByText("Perfil salvo neste dispositivo. Nenhuma conexão iniciada.", {
        exact: true,
      })
      .waitFor();
    let snapshot = await page.evaluate(() => window.bunnies.listProfiles());
    assert.equal(snapshot.ok, true);
    const id = snapshot.value.profiles[0].id;
    assert.deepEqual(snapshot.value.profiles[0].secret, {
      saved: false,
      availableThisRun: true,
    });
    assert.ok(!JSON.stringify(snapshot).includes(sentinel));
    let disk = await readFile(file, "utf8");
    assert.ok(!disk.includes(sentinel));
    assert.equal(JSON.parse(disk).schemaVersion, 2);
    assert.ok(
      !JSON.stringify(
        await page.evaluate(() => ({
          local: { ...window.localStorage },
          session: { ...window.sessionStorage },
        })),
      ).includes(sentinel),
    );
    await page.getByRole("button", { name: new RegExp(profileName) }).click();
    await page
      .getByRole("heading", { name: profileName, exact: true })
      .waitFor();
    await chooseTheme(page, "dark");
    await capture(page, "selected-dark");
    await page
      .getByRole("button", { name: "Editar perfil", exact: true })
      .click();
    dialog = page.getByRole("dialog", { name: "Editar perfil", exact: true });
    assert.equal(
      await dialog.getByLabel("Nova senha", { exact: true }).count(),
      0,
    );
    await dialog.getByLabel("Senha", { exact: true }).selectOption("replace");
    await dialog
      .getByLabel("Nova senha", { exact: true })
      .fill("DISCARD-SYNTHETIC-SENTINEL");
    await dialog
      .getByLabel("Nome do perfil", { exact: true })
      .fill("Alteração descartada");
    await dialog.getByRole("button", { name: "Cancelar", exact: true }).click();
    await dialog
      .getByRole("button", { name: "Continuar editando", exact: true })
      .waitFor();
    assert.equal(
      await dialog
        .getByRole("button", { name: "Continuar editando", exact: true })
        .evaluate(button => button === document.activeElement),
      true,
    );
    await page.keyboard.press("Enter");
    assert.equal(
      await dialog.getByLabel("Nova senha", { exact: true }).inputValue(),
      "",
    );
    await page.keyboard.press("Escape");
    await dialog
      .getByRole("button", { name: "Descartar alterações", exact: true })
      .click();
    await dialog.waitFor({ state: "hidden" });
    assert.equal(await readFile(file, "utf8"), disk);
    assert.equal(
      await page
        .getByRole("button", { name: "Editar perfil", exact: true })
        .evaluate(button => button === document.activeElement),
      true,
    );
    // Save a metadata edit, preserving the in-memory password explicitly.
    await page
      .getByRole("button", { name: "Editar perfil", exact: true })
      .click();
    dialog = page.getByRole("dialog", { name: "Editar perfil", exact: true });
    await dialog
      .getByLabel("Usuário", { exact: true })
      .fill("synthetic-renamed");
    await dialog
      .getByRole("button", { name: "Salvar perfil", exact: true })
      .click();
    await dialog.waitFor({ state: "hidden" });
    snapshot = await page.evaluate(() => window.bunnies.listProfiles());
    assert.equal(snapshot.value.profiles[0].username, "synthetic-renamed");
    assert.equal(snapshot.value.profiles[0].secret.availableThisRun, true);
    // Keyboard focus stays inside the modal, including at minimum size/200% zoom.
    const window = await application.browserWindow(page);
    await window.evaluate(win => {
      win.setContentSize(1024, 700);
      win.webContents.setZoomFactor(2);
    });
    await page.waitForFunction(() => window.innerWidth <= 512);
    await page
      .getByRole("button", { name: "Editar perfil", exact: true })
      .click();
    dialog = page.getByRole("dialog", { name: "Editar perfil", exact: true });
    await dialog.getByLabel("Nome do perfil", { exact: true }).focus();
    await page.keyboard.press("Shift+Tab");
    assert.equal(
      await dialog.evaluate(element =>
        element.contains(document.activeElement),
      ),
      true,
    );
    await page.keyboard.press("Tab");
    assert.equal(
      await dialog.evaluate(element =>
        element.contains(document.activeElement),
      ),
      true,
    );
    await dialog.getByLabel("Senha", { exact: true }).selectOption("replace");
    await dialog
      .getByLabel("Nova senha", { exact: true })
      .scrollIntoViewIfNeeded();
    const saveAtZoom = dialog.getByRole("button", {
      name: "Salvar perfil",
      exact: true,
    });
    await saveAtZoom.scrollIntoViewIfNeeded();
    await saveAtZoom.focus();
    assert.equal(
      await saveAtZoom.evaluate(button => {
        const rect = button.getBoundingClientRect();
        const modal = button.closest("dialog").getBoundingClientRect();
        return (
          rect.top >= modal.top &&
          rect.bottom <= modal.bottom &&
          rect.left >= modal.left &&
          rect.right <= modal.right
        );
      }),
      true,
    );
    assert.equal(
      await dialog.evaluate(
        element => element.scrollWidth <= element.clientWidth + 1,
      ),
      true,
    );
    await capture(page, "form-dark-zoom200");
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth + 1,
      ),
      true,
    );
    await page.keyboard.press("Escape");
    await dialog
      .getByRole("button", { name: "Descartar alterações", exact: true })
      .click();
    await dialog.waitFor({ state: "hidden" });
    await window.evaluate(win => {
      win.webContents.setZoomFactor(1);
      win.setContentSize(1200, 800);
    });
    assert.equal(page.url(), entry);
    assert.deepEqual(requests, []);
    // Full process restart: local metadata survives, memory password does not.
    await application.close();
    application = undefined;
    page = await launch();
    snapshot = await page.evaluate(() => window.bunnies.listProfiles());
    assert.equal(snapshot.value.profiles[0].id, id);
    assert.equal(snapshot.value.profiles[0].username, "synthetic-renamed");
    assert.deepEqual(snapshot.value.profiles[0].secret, {
      saved: false,
      availableThisRun: false,
    });
    await page.getByRole("button", { name: new RegExp(profileName) }).click();
    await page
      .getByText("Não disponível nesta execução", { exact: true })
      .waitFor();
    await chooseTheme(page, "light");
    await capture(page, "reopened-light");
    // Main-only harness intercepts the native dialog. Never add a renderer confirmation flag.
    await application.evaluate(({ dialog }) => {
      globalThis.__profileDialogs = [];
      dialog.showMessageBox = async (_window, options) => {
        globalThis.__profileDialogs.push(options);
        return { response: 0, checkboxChecked: false };
      };
    });
    await page
      .getByRole("button", { name: "Remover perfil", exact: true })
      .click();
    await page
      .getByText("Remoção cancelada. O perfil foi mantido.", { exact: true })
      .waitFor();
    const dialogs = await application.evaluate(
      () => globalThis.__profileDialogs,
    );
    assert.equal(dialogs.length, 1);
    assert.equal(dialogs[0].defaultId, 0);
    assert.equal(dialogs[0].cancelId, 0);
    assert.ok(dialogs[0].detail.includes("Nenhum recurso ou mensagem"));
    assert.ok(dialogs[0].detail.includes("Produção"));
    await application.evaluate(({ dialog }) => {
      dialog.showMessageBox = async () => ({
        response: 1,
        checkboxChecked: false,
      });
    });
    await page
      .getByRole("button", { name: "Remover perfil", exact: true })
      .click();
    await page
      .getByRole("heading", {
        name: "Nenhuma conexão configurada",
        exact: true,
      })
      .waitFor();
    assert.equal(JSON.parse(await readFile(file, "utf8")).profiles.length, 0);
    const corrupted = '{"schemaVersion":999,"doNotOverwrite":true}';
    await writeFile(file, corrupted);
    await page
      .getByRole("button", { name: "Recarregar lista", exact: true })
      .click();
    await page
      .getByRole("alert")
      .filter({ hasText: "O original foi preservado" })
      .waitFor();
    assert.equal(
      await page
        .getByRole("button", { name: "Novo perfil", exact: true })
        .isDisabled(),
      true,
    );
    assert.equal(await readFile(file, "utf8"), corrupted);
    await capture(page, "corrupt-light");
    assert.deepEqual(errors, []);
    assert.deepEqual(requests, []);
    assert.ok(
      !(await readdir(userData)).some(
        name => name.startsWith(".profiles-") || name === "profiles.json.lock",
      ),
    );
    const result = {
      result: "passed",
      platform: process.platform,
      arch: process.arch,
      crud: true,
      fullProcessRestart: true,
      memoryDiscarded: true,
      noPlaintextOnDiskOrDtos: true,
      unverifiedProtectionDisabled: true,
      cancelDiscard: true,
      modalFocus: true,
      zoom200: true,
      corruptionPreserved: true,
      nativeConfirmation:
        "main-only scripted responses; manual OS review pending",
      chromiumExternalRequests: requests.length,
    };
    await writeFile(
      "out/profiles-4a1-results.json",
      JSON.stringify(result, null, 2) + "\n",
    );
    console.log(JSON.stringify(result));
  } finally {
    try {
      if (application) await application.close();
    } finally {
      await rm(userData, { recursive: true, force: true });
    }
  }
}
run().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
