const {
  mkdtemp,
  writeFile,
  readFile,
  mkdir,
  rm,
  chmod,
} = require("node:fs/promises");
const { tmpdir } = require("node:os");
const { join } = require("node:path");
const { execFile } = require("node:child_process");
const { promisify } = require("node:util");
const run = promisify(execFile);
// All certificates, keys and names belong only to this temporary test fixture.
async function createTlsFixture() {
  const directory = await mkdtemp(join(tmpdir(), "bunnies-tls-"));
  const file = name => join(directory, name);
  async function openssl(...args) {
    await run("openssl", args, {
      cwd: directory,
      timeout: 15000,
      maxBuffer: 1024 * 1024,
    });
  }
  try {
    await writeFile(
      file("ca.cnf"),
      "[req]\ndistinguished_name=dn\nx509_extensions=v3\nprompt=no\n[dn]\nCN=Bunnies Isolated CA\n[v3]\nbasicConstraints=critical,CA:TRUE\nkeyUsage=critical,keyCertSign,cRLSign\nsubjectKeyIdentifier=hash\n",
    );
    await openssl(
      "req",
      "-x509",
      "-newkey",
      "rsa:2048",
      "-nodes",
      "-keyout",
      "ca.key",
      "-out",
      "ca.pem",
      "-days",
      "2",
      "-config",
      "ca.cnf",
    );
    await openssl(
      "req",
      "-new",
      "-newkey",
      "rsa:2048",
      "-nodes",
      "-keyout",
      "server.key",
      "-out",
      "server.csr",
      "-subj",
      "/CN=localhost",
    );
    await writeFile(
      file("leaf.cnf"),
      "basicConstraints=critical,CA:FALSE\nkeyUsage=critical,digitalSignature,keyEncipherment\nextendedKeyUsage=serverAuth\nsubjectAltName=DNS:localhost,IP:127.0.0.1\n",
    );
    await openssl(
      "x509",
      "-req",
      "-in",
      "server.csr",
      "-CA",
      "ca.pem",
      "-CAkey",
      "ca.key",
      "-CAcreateserial",
      "-out",
      "server.pem",
      "-days",
      "1",
      "-extfile",
      "leaf.cnf",
    );
    await writeFile(
      file("wrong.cnf"),
      "basicConstraints=critical,CA:FALSE\nsubjectAltName=DNS:wrong.bunnies.invalid\n",
    );
    await openssl(
      "x509",
      "-req",
      "-in",
      "server.csr",
      "-CA",
      "ca.pem",
      "-CAkey",
      "ca.key",
      "-CAserial",
      "ca.srl",
      "-out",
      "wrong.pem",
      "-days",
      "1",
      "-extfile",
      "wrong.cnf",
    );
    await mkdir(file("newcerts"));
    await writeFile(file("index.txt"), "");
    await writeFile(file("serial"), "1000\n");
    await writeFile(
      file("sign.cnf"),
      "[ca]\ndefault_ca=local\n[local]\ndatabase=index.txt\nserial=serial\nnew_certs_dir=newcerts\ncertificate=ca.pem\nprivate_key=ca.key\ndefault_md=sha256\ndefault_days=1\npolicy=policy\nx509_extensions=leaf\n[policy]\ncommonName=supplied\n[leaf]\nbasicConstraints=critical,CA:FALSE\nsubjectAltName=DNS:localhost,IP:127.0.0.1\n",
    );
    await openssl(
      "ca",
      "-batch",
      "-config",
      "sign.cnf",
      "-in",
      "server.csr",
      "-out",
      "expired.pem",
      "-startdate",
      "20200101000000Z",
      "-enddate",
      "20210101000000Z",
      "-notext",
    );
    await chmod(file("ca.key"), 0o600);
    await chmod(file("server.key"), 0o600);
    return {
      directory,
      ca: await readFile(file("ca.pem"), "utf8"),
      cert: await readFile(file("server.pem"), "utf8"),
      key: await readFile(file("server.key"), "utf8"),
      wrongCert: await readFile(file("wrong.pem"), "utf8"),
      expiredCert: await readFile(file("expired.pem"), "utf8"),
      cleanup: () => rm(directory, { recursive: true, force: true }),
    };
  } catch (error) {
    await rm(directory, { recursive: true, force: true });
    throw error;
  }
}
module.exports = { createTlsFixture };
