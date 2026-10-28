const assert = require("node:assert/strict");
const {
  mkdtemp,
  realpath,
  rm,
  writeFile,
  readFile,
} = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const { _electron: electron } = require("playwright");
const { version } = require("../../package.json");
const verifySecurity = require("./security.cjs");

const entry = "bunnies://app/app_window/index.html";
const themeKey = "bunnies.theme-preference";
function contrast(foreground, background) {
  function luminance(color) {
    const channels = color.startsWith("#")
      ? [1, 3, 5].map(index => parseInt(color.slice(index, index + 2), 16))
      : color
          .match(/[\d.]+/g)
          .slice(0, 3)
          .map(Number);
    const linear = channels.map(value => {
      const c = value / 255;
      return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    });
    return linear.reduce(
      (sum, value, index) => sum + value * [0.2126, 0.7152, 0.0722][index],
      0,
    );
  }
  const [low, high] = [luminance(foreground), luminance(background)].sort(
    (a, b) => a - b,
  );
  return (high + 0.05) / (low + 0.05);
}
async function smoke() {
  const artifact = path.resolve(
    `out/Bunnies-${process.platform}-${process.arch}`,
  );
  const executablePath = {
    darwin: path.join(artifact, "Bunnies.app/Contents/MacOS/bunnies"),
    linux: path.join(artifact, "bunnies"),
    win32: path.join(artifact, "bunnies.exe"),
  }[process.platform];
  assert.ok(executablePath, "Unsupported smoke platform");
  const userData = await mkdtemp(path.join(os.tmpdir(), "bunnies-smoke-"));
  let application;
  try {
    application = await electron.launch({
      executablePath,
      args: [`--user-data-dir=${userData}`],
      chromiumSandbox: true,
      timeout: 30_000,
    });
    const page = await application.firstWindow({ timeout: 15_000 });
    const errors = [];
    const unexpectedRequests = [];
    page.on("pageerror", error => errors.push(error.message));
    page.on("request", request => {
      if (!request.url().startsWith("bunnies://app/"))
        unexpectedRequests.push(request.url());
    });
    await page
      .getByRole("heading", { name: "Conexões", exact: true })
      .waitFor();
    const window = await application.browserWindow(page);
    async function resize(width, height) {
      await window.evaluate(
        (win, size) => win.setContentSize(size.width, size.height),
        { width, height },
      );
      await page.waitForFunction(
        ({ width, height }) =>
          window.innerWidth === width && window.innerHeight === height,
        { width, height },
      );
    }
    async function theme(value) {
      await page.waitForFunction(
        value => document.documentElement.dataset.theme === value,
        value,
      );
    }
    async function captureNative(file) {
      await page.evaluate(
        () =>
          new Promise(resolve =>
            window.requestAnimationFrame(() =>
              window.requestAnimationFrame(resolve),
            ),
          ),
      );
      const png = await window.evaluate(async win =>
        (await win.capturePage()).toPNG().toString("base64"),
      );
      await writeFile(file, Buffer.from(png, "base64"));
    }
    await resize(1440, 900);
    const measuredContrast = [];
    const acceptedPairs = JSON.parse(
      await readFile(
        "docs/03-architecture/ui-proposals/contrast-report.json",
        "utf8",
      ),
    ).pairs;
    async function verifyContrast(mode) {
      const pairs = acceptedPairs.filter(pair => pair.theme === mode);
      const actual = await page.evaluate(pairs => {
        const css = getComputedStyle(document.documentElement);
        const token = key =>
          css
            .getPropertyValue(
              "--bn-" + key.replace(/[A-Z]/g, char => "-" + char.toLowerCase()),
            )
            .trim();
        return pairs.map(pair => ({
          foreground: token(pair.foreground),
          background: token(pair.background),
        }));
      }, pairs);
      for (const [index, pair] of pairs.entries()) {
        const value = actual[index];
        assert.equal(
          value.foreground.toUpperCase(),
          pair.hexForeground.toUpperCase(),
        );
        assert.equal(
          value.background.toUpperCase(),
          pair.hexBackground.toUpperCase(),
        );
        const ratio = contrast(value.foreground, value.background);
        assert.ok(ratio >= pair.minimum);
        measuredContrast.push({
          theme: mode,
          pair: pair.foreground + "/" + pair.background,
          ratio,
          minimum: pair.minimum,
        });
      }
      // Only the privileged test harness creates these temporary style fixtures.
      for (const variant of ["primary", "secondary", "quiet"]) {
        for (const disabled of [false, true]) {
          const colors = await page.evaluate(
            ({ variant, disabled }) => {
              const fixture = document.createElement("div");
              fixture.className = "card";
              const button = document.createElement("button");
              button.className = "button button--" + variant;
              button.disabled = disabled;
              button.textContent = "Synthetic style fixture";
              fixture.append(button);
              document.querySelector("main").append(fixture);
              const css = getComputedStyle(button);
              const parent = getComputedStyle(fixture);
              const result = {
                foreground: css.color,
                background:
                  css.backgroundColor === "rgba(0, 0, 0, 0)"
                    ? parent.backgroundColor
                    : css.backgroundColor,
              };
              fixture.remove();
              return result;
            },
            { variant, disabled },
          );
          const ratio = contrast(colors.foreground, colors.background);
          assert.ok(
            ratio >= 4.5,
            JSON.stringify({ mode, variant, disabled, ratio }),
          );
          measuredContrast.push({
            theme: mode,
            pair: "button/" + variant + (disabled ? "/disabled" : "/default"),
            ratio,
            minimum: 4.5,
          });
        }
      }
    }
    await page.emulateMedia({ colorScheme: "dark" });
    await theme("dark");
    await verifyContrast("dark");
    assert.equal(
      await page
        .getByRole("combobox", { name: "Tema", exact: true })
        .inputValue(),
      "system",
    );
    await page.emulateMedia({ colorScheme: "light" });
    await theme("light");
    await page
      .getByRole("combobox", { name: "Tema", exact: true })
      .selectOption("dark");
    await theme("dark");
    await page.screenshot({ path: "out/ui-3b-dark.png" });
    await page.reload();
    await page
      .getByRole("heading", { name: "Conexões", exact: true })
      .waitFor();
    await theme("dark");
    assert.equal(
      await page
        .getByRole("combobox", { name: "Tema", exact: true })
        .inputValue(),
      "dark",
    );
    await page.emulateMedia({ colorScheme: "light" });
    await theme("dark");
    await page
      .getByRole("combobox", { name: "Tema", exact: true })
      .selectOption("light");
    await theme("light");
    await verifyContrast("light");
    await page.screenshot({ path: "out/ui-3b-light.png" });
    assert.equal(
      await page
        .getByRole("heading", { name: "Nenhuma conexão configurada" })
        .count(),
      1,
    );
    for (const name of ["Visão geral", "Filas", "Exchanges", "Publicar"]) {
      const button = page.getByRole("button", { name, exact: true });
      assert.equal(await button.getAttribute("aria-disabled"), "true");
      await button.focus();
      await page.keyboard.press("Enter");
      assert.equal(page.url(), entry);
      await page
        .getByRole("heading", { name: "Conexões", exact: true })
        .waitFor();
    }
    await page
      .getByRole("button", { name: "Sobre o Bunnies", exact: true })
      .click();
    await page
      .getByTestId("app-version")
      .filter({ hasText: version })
      .waitFor();
    assert.equal(await page.getByTestId("app-version").textContent(), version);
    assert.equal(
      await page.evaluate(() => document.activeElement?.tagName),
      "H1",
    );
    await page.screenshot({ path: "out/ui-3b-about.png" });
    await page.getByRole("button", { name: "Conexões", exact: true }).click();
    assert.equal(page.url(), entry);

    // Exercise migration in this isolated profile only; no real user settings are touched.
    for (const [legacy, expected] of [
      ["0", "light"],
      ["1", "dark"],
    ]) {
      await page.evaluate(
        ({ themeKey, legacy }) => {
          window.localStorage.removeItem(themeKey);
          window.localStorage.setItem("dark-mode", legacy);
        },
        { themeKey, legacy },
      );
      await page.reload();
      await theme(expected);
      assert.equal(
        await page
          .getByRole("combobox", { name: "Tema", exact: true })
          .inputValue(),
        expected,
      );
    }
    await page
      .getByRole("combobox", { name: "Tema", exact: true })
      .selectOption("light");
    await theme("light");
    const layout = [];
    for (const [width, height] of [
      [1024, 700],
      [800, 600],
    ]) {
      await resize(width, height);
      const expand = page.getByRole("button", {
        name: "Expandir navegação",
        exact: true,
      });
      await expand.click();
      const panel = page.getByRole("dialog", {
        name: "Navegação",
        exact: true,
      });
      await panel.waitFor();
      const close = panel.getByRole("button", {
        name: "Fechar navegação",
        exact: true,
      });
      await close.focus();
      await page.keyboard.press("Shift+Tab");
      assert.equal(
        await panel.evaluate(dialog => dialog.contains(document.activeElement)),
        true,
      );
      await page.keyboard.press("Tab");
      assert.equal(
        await panel.evaluate(dialog => dialog.contains(document.activeElement)),
        true,
      );
      await page.keyboard.press("Escape");
      await panel.waitFor({ state: "hidden" });
      assert.equal(
        await expand.evaluate(button => button === document.activeElement),
        true,
      );
      await page.screenshot({ path: `out/ui-3b-${width}.png` });
      const geometry = await page.evaluate(() => ({
        width: window.innerWidth,
        height: window.innerHeight,
        documentWidth: document.documentElement.scrollWidth,
        sidebar: document.querySelector(".sidebar").getBoundingClientRect()
          .width,
      }));
      assert.equal(geometry.sidebar, 64);
      assert.ok(geometry.documentWidth <= width + 1);
      layout.push(geometry);
    }
    await resize(1024, 700);
    // Privileged harness sets Chromium zoom, not a new app API. UI commands stay unchanged.
    await window.evaluate(win => win.webContents.setZoomFactor(2));
    await page.waitForFunction(() => window.innerWidth <= 512);
    await page
      .getByRole("button", { name: "Expandir navegação", exact: true })
      .click();
    const panel = page.getByRole("dialog", { name: "Navegação", exact: true });
    const zoomTheme = panel.getByRole("combobox", {
      name: "Tema",
      exact: true,
    });
    await zoomTheme.scrollIntoViewIfNeeded();
    await zoomTheme.focus();
    await zoomTheme.selectOption("dark");
    await theme("dark");
    await captureNative("out/ui-3b-panel-zoom200.png");
    await panel
      .getByRole("button", { name: "Fechar navegação", exact: true })
      .click();
    await panel.waitFor({ state: "hidden" });
    await page
      .getByRole("button", { name: "Sobre o Bunnies", exact: true })
      .click();
    const author = page.getByRole("button", {
      name: "Conhecer o autor",
      exact: true,
    });
    await author.scrollIntoViewIfNeeded();
    assert.equal(
      await author.evaluate(button => {
        const rect = button.getBoundingClientRect();
        const main = document.querySelector("main").getBoundingClientRect();
        return (
          rect.top >= main.top &&
          rect.bottom <= main.bottom &&
          rect.left >= main.left &&
          rect.right <= main.right
        );
      }),
      true,
    );
    await page.getByRole("heading", { level: 1 }).focus();
    await page.keyboard.press(
      process.platform === "darwin" ? "Meta+5" : "Control+5",
    );
    await page
      .getByRole("heading", { name: "Conexões", exact: true })
      .waitFor();
    assert.equal(page.url(), entry);
    await page.getByRole("main").evaluate(main => {
      main.scrollTop = main.scrollHeight;
    });
    await captureNative("out/ui-3b-zoom200.png");
    assert.ok(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth + 1,
      ),
    );
    await window.evaluate(win => win.webContents.setZoomFactor(1));
    await resize(1440, 900);
    await page
      .getByRole("combobox", { name: "Tema", exact: true })
      .selectOption("light");
    await theme("light");
    await page.getByRole("button", { name: "Visualizar", exact: true }).focus();
    await page.keyboard.press("Enter");
    await page
      .getByRole("button", { name: "Aumentar zoom", exact: false })
      .waitFor();
    await page.keyboard.press("Escape");
    assert.equal(
      await page
        .getByRole("button", { name: "Visualizar", exact: true })
        .evaluate(button => button === document.activeElement),
      true,
    );
    const beforeZoom = await window.evaluate(win =>
      win.webContents.getZoomFactor(),
    );
    const zoomResult = await page.evaluate(() => window.bunnies.view("zoomIn"));
    assert.equal(zoomResult.ok, true);
    assert.ok(
      (await window.evaluate(win => win.webContents.getZoomFactor())) >
        beforeZoom,
    );
    await page.evaluate(() => window.bunnies.view("resetZoom"));
    assert.equal(
      await page
        .locator(".window-titlebar")
        .evaluate(element =>
          getComputedStyle(element).getPropertyValue("-webkit-app-region"),
        ),
      "drag",
    );
    assert.equal(
      await page
        .getByRole("button", { name: "Minimizar", exact: true })
        .evaluate(element =>
          getComputedStyle(element).getPropertyValue("-webkit-app-region"),
        ),
      "no-drag",
    );
    for (const [name, state] of [
      ["Minimizar", "isMinimized"],
      ["Maximizar ou restaurar", "isMaximized"],
    ]) {
      await page.getByRole("button", { name, exact: true }).click();
      assert.equal(
        await window.evaluate(async (win, state) => {
          const start = Date.now();
          while (!win[state]() && Date.now() - start < 3000)
            await new Promise(resolve => setTimeout(resolve, 50));
          return win[state]();
        }, state),
        true,
      );
      await window.evaluate((win, state) => {
        if (state === "isMinimized") win.restore();
        else win.unmaximize();
      }, state);
    }
    assert.equal(page.url(), entry);
    const runtime = await application.evaluate(({ app }) => ({
      packaged: app.isPackaged,
      version: app.getVersion(),
      userData: app.getPath("userData"),
      platform: process.platform,
      arch: process.arch,
      electron: process.versions.electron,
    }));
    assert.equal(runtime.packaged, true);
    assert.equal(runtime.version, version);
    assert.equal(await realpath(runtime.userData), await realpath(userData));
    assert.deepEqual(errors, []);
    assert.deepEqual(unexpectedRequests, []);
    await page.screenshot({ path: "out/smoke-package.png" });
    const security = await verifySecurity(application, page);
    const result = {
      result: "passed",
      ...runtime,
      userData: "temporary",
      ui: {
        systemTheme: true,
        manualThemes: true,
        persistence: true,
        migration: true,
        offline: true,
        navigation: true,
        focus: true,
        compactPanel: true,
        zoom200: true,
        nativeControls: true,
        dragRegions: true,
        shortcut: true,
        layout,
      },
      security,
      measuredContrast,
    };
    await writeFile(
      "out/ui-3b-results.json",
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
smoke().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
