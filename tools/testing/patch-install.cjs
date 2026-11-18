const assert = require("node:assert/strict");
const { execFile } = require("node:child_process");
const { promisify } = require("node:util");
const { createHash } = require("node:crypto");
const {
  mkdtemp,
  copyFile,
  cp,
  readFile,
  writeFile,
  rm,
} = require("node:fs/promises");
const { join, resolve } = require("node:path");
const { tmpdir } = require("node:os");
const exec = promisify(execFile);
const hash = data => createHash("sha256").update(data).digest("hex");
async function run() {
  const project = resolve(__dirname, "../..");
  const root = await mkdtemp(join(tmpdir(), "bunnies-patch-install-"));
  const logs = [];
  const report = { cleanup: false };
  async function command(file, args, expected = 0) {
    let result,
      code = 0;
    try {
      result = await exec(file, args, {
        cwd: root,
        timeout: 240000,
        maxBuffer: 8 * 1024 * 1024,
      });
    } catch (error) {
      result = error;
      code = error.code;
    }
    logs.push(
      JSON.stringify({ file, args, code }),
      result.stdout || "",
      result.stderr || "",
    );
    assert.equal(
      code,
      expected,
      "Isolated installation command returned an unexpected status",
    );
    return result.stdout;
  }
  try {
    for (const file of [
      "package.json",
      "package-lock.json",
      ".npmrc",
      ".nvmrc",
    ])
      await copyFile(join(project, file), join(root, file));
    await cp(join(project, "tools"), join(root, "tools"), { recursive: true });
    const lockBefore = await readFile(join(root, "package-lock.json"));
    const npm = process.platform === "win32" ? "npm.cmd" : "npm";
    await command(npm, ["ci", "--ignore-scripts", "--no-audit", "--no-fund"]);
    const source = join(root, "node_modules/amqplib/lib/connection.js");
    assert.equal(
      hash(await readFile(source)),
      "0966aae8e582c2ec6e137cb8773deb28b962a287d28890c61504b83cee1d803b",
    );
    await command(
      process.execPath,
      ["tools/patches/amqplib.cjs", "--verify"],
      1,
    );
    await command(
      process.execPath,
      ["-e", "require('./tools/webpack/webpack.main.js')"],
      1,
    );
    report.ignoredScriptsRejectedByVerificationAndBuild = true;
    // Only the owned temporary tree is reinstalled; the workspace is untouched.
    await command(npm, ["ci", "--no-audit", "--no-fund"]);
    const verified = JSON.parse(
      await command(process.execPath, [
        "tools/patches/amqplib.cjs",
        "--verify",
      ]),
    );
    assert.equal(
      verified.sha256,
      "e429dd17f333dcedf925c692c862bc3aa8a85cbed971396456d9df61d2a98de6",
    );
    await command(process.execPath, [
      "-e",
      "require('./tools/webpack/webpack.main.js')",
    ]);
    await command(npm, ["run", "test:patch"]);
    assert.deepEqual(
      await readFile(join(root, "package-lock.json")),
      lockBefore,
    );
    report.cleanCiWithPostinstall = true;
    report.sha256 = verified.sha256;
    report.lockUnchanged = true;
    report.passed = true;
  } finally {
    await rm(root, { recursive: true, force: true });
    report.cleanup = true;
    await writeFile(
      join(project, "out/4a2c-patch-install-results.json"),
      JSON.stringify(report, null, 2) + "\n",
    );
    await writeFile(
      join(project, "out/4a2c-patch-install.log"),
      logs.join("\n"),
    );
  }
  console.log(JSON.stringify(report));
}
run().catch(error => {
  console.error(error.message);
  process.exitCode = 1;
});
