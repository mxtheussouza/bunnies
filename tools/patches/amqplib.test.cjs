const { test } = require("node:test");
const assert = require("node:assert/strict");
const {
  mkdtempSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
  rmSync,
  symlinkSync,
} = require("node:fs");
const { tmpdir } = require("node:os");
const { join, resolve } = require("node:path");
const { createHash } = require("node:crypto");
const {
  ensureAmqplibPatch,
  originalHash,
  patchedHash,
} = require("./amqplib.cjs");
const project = resolve(__dirname, "../..");
const installed = readFileSync(
  join(project, "node_modules/amqplib/lib/connection.js"),
  "utf8",
);
const original = installed.replace(
  "      setImmediate(() => self.acceptLoop());",
  "      self.acceptLoop();",
);
const hash = text => createHash("sha256").update(text).digest("hex");
assert.equal(hash(original), originalHash);
function fixture(run) {
  const root = mkdtempSync(join(tmpdir(), "bunnies-patch-test-"));
  try {
    mkdirSync(join(root, "node_modules/amqplib/lib"), { recursive: true });
    mkdirSync(join(root, "tools/patches"), { recursive: true });
    const source = join(root, "node_modules/amqplib/lib/connection.js");
    const metadata = join(root, "node_modules/amqplib/package.json");
    const diff = join(root, "tools/patches/amqplib-2.2.0.patch");
    writeFileSync(source, original);
    writeFileSync(
      metadata,
      JSON.stringify({ name: "amqplib", version: "2.2.0" }),
    );
    writeFileSync(diff, readFileSync(join(__dirname, "amqplib-2.2.0.patch")));
    writeFileSync(join(root, "node_modules/amqplib/untouched"), "preserve");
    run({ root, source, metadata, diff });
    assert.equal(
      readFileSync(join(root, "node_modules/amqplib/untouched"), "utf8"),
      "preserve",
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}
test("verification refuses original without writing; apply is exact and idempotent", () =>
  fixture(({ root, source }) => {
    assert.throws(() => ensureAmqplibPatch(root), /patch missing/);
    assert.equal(readFileSync(source, "utf8"), original);
    assert.equal(ensureAmqplibPatch(root, "apply").sha256, patchedHash);
    const patched = readFileSync(source);
    assert.equal(hash(patched), patchedHash);
    assert.equal(ensureAmqplibPatch(root, "apply").status, "verified");
    assert.deepEqual(readFileSync(source), patched);
    assert.equal(ensureAmqplibPatch(root).sha256, patchedHash);
  }));
test("unknown source is refused in either mode without repair", () =>
  fixture(({ root, source }) => {
    const unknown = original + "// unknown\n";
    writeFileSync(source, unknown);
    for (const mode of ["apply", "verify"])
      assert.throws(() => ensureAmqplibPatch(root, mode), /hash is unexpected/);
    assert.equal(readFileSync(source, "utf8"), unknown);
  }));
test("another version is refused without changing source", () =>
  fixture(({ root, source, metadata }) => {
    writeFileSync(
      metadata,
      JSON.stringify({ name: "amqplib", version: "2.2.1" }),
    );
    assert.throws(() => ensureAmqplibPatch(root, "apply"), /only supports/);
    assert.equal(readFileSync(source, "utf8"), original);
  }));
test("modified patch artifact is refused even with a recognized source", () =>
  fixture(({ root, source, diff }) => {
    writeFileSync(diff, "unknown patch\n");
    assert.throws(() => ensureAmqplibPatch(root, "apply"), /artifact differs/);
    assert.equal(readFileSync(source, "utf8"), original);
  }));
test("modified patched source is refused, not silently patched again", () =>
  fixture(({ root, source }) => {
    ensureAmqplibPatch(root, "apply");
    writeFileSync(source, readFileSync(source, "utf8") + "\n");
    assert.throws(() => ensureAmqplibPatch(root), /hash is unexpected/);
  }));
test(
  "symbolic source file is refused",
  { skip: process.platform === "win32" },
  () =>
    fixture(({ root, source }) => {
      const other = join(root, "original.js");
      writeFileSync(other, original);
      rmSync(source);
      symlinkSync(other, source);
      assert.throws(() => ensureAmqplibPatch(root, "apply"), /non-symlink/);
      assert.equal(readFileSync(other, "utf8"), original);
    }),
);
