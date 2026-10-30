const { createHash, randomUUID } = require("node:crypto");
const {
  readFileSync,
  writeFileSync,
  renameSync,
  rmSync,
  realpathSync,
  lstatSync,
} = require("node:fs");
const { resolve, join } = require("node:path");

const originalHash =
  "0966aae8e582c2ec6e137cb8773deb28b962a287d28890c61504b83cee1d803b";
const patchedHash =
  "e429dd17f333dcedf925c692c862bc3aa8a85cbed971396456d9df61d2a98de6";
const before = "      self.acceptLoop();\n      openCallback(null, ok);";
const after =
  "      setImmediate(() => self.acceptLoop());\n      openCallback(null, ok);";
const approvedDiff = [
  "--- a/lib/connection.js",
  "+++ b/lib/connection.js",
  "@@ -217,2 +217,2 @@",
  "-      self.acceptLoop();",
  "+      setImmediate(() => self.acceptLoop());",
  "       openCallback(null, ok);",
  "",
].join("\n");
const hash = bytes => createHash("sha256").update(bytes).digest("hex");

function regularFile(file) {
  const stat = lstatSync(file);
  if (!stat.isFile() || stat.isSymbolicLink())
    throw new Error("AMQP patch requires regular, non-symlink files.");
  return stat;
}
function ensureAmqplibPatch(
  projectRoot = resolve(__dirname, "../.."),
  mode = "verify",
) {
  if (mode !== "apply" && mode !== "verify")
    throw new Error("Use --apply or --verify for the approved AMQP patch.");
  const root = realpathSync(projectRoot);
  const directory = join(root, "node_modules/amqplib");
  if (
    realpathSync(directory) !== directory ||
    realpathSync(join(directory, "lib")) !== join(directory, "lib")
  )
    throw new Error("AMQP patch refuses linked dependency directories.");
  const manifest = join(directory, "package.json");
  regularFile(manifest);
  const metadata = JSON.parse(readFileSync(manifest, "utf8"));
  if (metadata.name !== "amqplib" || metadata.version !== "2.2.0")
    throw new Error("AMQP patch only supports the approved amqplib 2.2.0.");
  const diff = join(root, "tools/patches/amqplib-2.2.0.patch");
  regularFile(diff);
  // Git may check out CRLF on Windows; source hashes remain byte exact.
  if (readFileSync(diff, "utf8").replaceAll("\r\n", "\n") !== approvedDiff)
    throw new Error("AMQP patch artifact differs from ADR-0008.");
  const file = join(directory, "lib/connection.js");
  const stat = regularFile(file);
  const source = readFileSync(file);
  const digest = hash(source);
  if (digest === patchedHash)
    return { version: "2.2.0", status: "verified", sha256: patchedHash };
  if (digest !== originalHash)
    throw new Error(
      "AMQP dependency hash is unexpected; refusing to modify or build.",
    );
  if (mode !== "apply")
    throw new Error(
      "AMQP safety patch missing. Run node tools/patches/amqplib.cjs --apply.",
    );
  const text = source.toString("utf8");
  if (text.split(before).length !== 2)
    throw new Error("AMQP patch requires exactly one approved hunk.");
  const candidate = Buffer.from(text.replace(before, after), "utf8");
  if (hash(candidate) !== patchedHash)
    throw new Error("AMQP patch candidate does not match the approved hash.");
  const temporary = join(directory, "lib", ".bunnies-patch-" + randomUUID());
  try {
    writeFileSync(temporary, candidate, {
      flag: "wx",
      mode: stat.mode & 0o777,
    });
    if (hash(readFileSync(file)) !== originalHash)
      throw new Error("AMQP dependency changed while applying the patch.");
    renameSync(temporary, file);
  } finally {
    rmSync(temporary, { force: true });
  }
  return ensureAmqplibPatch(root, "verify");
}
module.exports = { ensureAmqplibPatch, originalHash, patchedHash };
if (require.main === module) {
  try {
    const mode = process.argv[2];
    if (process.argv.length !== 3 || !["--apply", "--verify"].includes(mode))
      throw new Error("Use --apply or --verify for the approved AMQP patch.");
    console.log(JSON.stringify(ensureAmqplibPatch(undefined, mode.slice(2))));
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
