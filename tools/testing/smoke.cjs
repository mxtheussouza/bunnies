const assert = require("node:assert/strict");
const { mkdtemp, realpath, rm } = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const { _electron: electron } = require("playwright");
const { version } = require("../../package.json");
const verifySecurity = require("./security.cjs");

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
    page.on("pageerror", error => errors.push(error.message));
    await page.getByRole("heading", { name: "Bunnies", exact: true }).waitFor();
    assert.equal(
      await page.locator(".versions .item > span").textContent(),
      version,
    );
    await page
      .getByRole("button", { name: "Light Theme", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Dark Theme", exact: true })
      .waitFor();
    await page.reload();
    await page
      .getByRole("button", { name: "Dark Theme", exact: true })
      .waitFor();
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
    await page.screenshot({ path: path.resolve("out/smoke-package.png") });
    const security = await verifySecurity(application, page);
    console.log(
      JSON.stringify({
        result: "passed",
        ...runtime,
        userData: "temporary",
        security,
      }),
    );
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
