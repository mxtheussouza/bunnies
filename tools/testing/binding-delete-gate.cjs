const assert = require("node:assert/strict");
const https = require("node:https");
const { connect } = require("amqplib");
const { isDeepStrictEqual } = require("node:util");

const name = suffix => "bunnies-unbind-" + suffix;
const source = name("origem /á%2F +");
const destination = name("destino /á%2F +");
const deniedSource = "bunnies-no-read";
const deniedDestination = "bunnies-no-write";
const auto = name("auto");
const parent = name("parent");
const leaf = name("leaf");
const vhosts = ["/", "detailed", "literal%2F"];
const exchange = (name, vhost = "/", auto_delete = false) => ({
  name,
  vhost,
  type: "direct",
  durable: true,
  auto_delete,
  internal: false,
  arguments: {},
});
const binding = (from, to, type, key, args = {}, vhost = "/") => ({
  vhost,
  source: from,
  destination: to,
  destination_type: type,
  routing_key: key,
  arguments: args,
});
const pair = (
  source,
  destination,
  destination_type = "exchange",
  vhost = "/",
) => ({ vhost, source, destination, destination_type });
const definitions = {
  exchanges: [
    ...vhosts.flatMap(vhost => [
      exchange(source, vhost),
      exchange(destination, vhost),
    ]),
    exchange(deniedSource),
    exchange(deniedDestination),
    exchange(auto, "/", true),
    exchange(parent, "/", true),
    exchange(leaf),
  ],
  queues: vhosts.map(vhost => ({
    name: destination,
    vhost,
    durable: true,
    auto_delete: false,
    arguments: {},
  })),
  bindings: [
    ...vhosts.flatMap(vhost =>
      ["queue", "exchange"].flatMap(type => [
        binding(source, destination, type, "", {}, vhost),
        binding(source, destination, type, "literal%2F /á+", {}, vhost),
        binding(source, destination, type, "same", { marker: "a" }, vhost),
        binding(source, destination, type, "same", { marker: "b" }, vhost),
      ]),
    ),
    ...[
      ".",
      "..",
      "null",
      "undefined",
      "lost",
      "recreated",
      "recreated-http",
    ].map(key => binding(source, destination, "exchange", key)),
    binding(deniedSource, destination, "exchange", "denied"),
    binding(source, deniedDestination, "exchange", "denied"),
    binding(parent, auto, "exchange", "parent"),
    binding(auto, leaf, "exchange", "first"),
    binding(auto, leaf, "exchange", "last"),
  ],
};
const segment = encodeURIComponent;
function pairPath(target) {
  const kind = target.destination_type === "queue" ? "q" : "e";
  return (
    "/api/bindings/" +
    segment(target.vhost) +
    "/e/" +
    segment(target.source) +
    "/" +
    kind +
    "/" +
    segment(target.destination)
  );
}
const fields = [
  "vhost",
  "source",
  "destination",
  "destination_type",
  "routing_key",
  "arguments",
];
const project = row => Object.fromEntries(fields.map(key => [key, row[key]]));
const sameBinding = (a, b) => isDeepStrictEqual(project(a), project(b));

async function run({
  fixture,
  managementPrefix,
  httpsPort,
  amqpsPort,
  username,
  password,
  checks,
  observations,
  api,
  noConnections,
}) {
  const failures = [];
  const deletes = [];
  function request(
    method,
    path,
    { port = httpsPort, ca = fixture.ca, body } = {},
  ) {
    return new Promise((resolve, reject) => {
      const data =
        body === undefined ? undefined : Buffer.from(JSON.stringify(body));
      const req = https.request(
        {
          hostname: "127.0.0.1",
          port,
          path: managementPrefix + path,
          method,
          agent: false,
          ca,
          minVersion: "TLSv1.2",
          rejectUnauthorized: true,
          auth: username + ":" + password,
          headers: data
            ? {
                "Content-Type": "application/json",
                "Content-Length": data.length,
              }
            : {},
        },
        res => {
          const chunks = [];
          res.on("data", chunk => chunks.push(chunk));
          res.on("error", reject);
          res.on("end", () => {
            let body;
            try {
              body = JSON.parse(Buffer.concat(chunks));
            } catch {
              body = undefined;
            }
            resolve({ status: res.statusCode, body });
          });
        },
      );
      req.setTimeout(5000, () => req.destroy(new Error("REQUEST_TIMEOUT")));
      req.on("error", reject);
      req.end(data);
    });
  }
  const send = (path, options) => {
    deletes.push(path);
    return request("DELETE", path, options);
  };
  async function load(target, key, args = {}) {
    const rows = await api(pairPath(target).slice(5));
    const expected = { ...target, routing_key: key, arguments: args };
    const candidates = rows.filter(row => sameBinding(row, expected));
    assert.equal(
      candidates.length,
      1,
      JSON.stringify({ expected, rows: rows.map(project) }),
    );
    return candidates[0];
  }
  function exactIdentity(rows, selected) {
    const matches = rows.filter(
      row => row.properties_key === selected.properties_key,
    );
    if (matches.length !== 1 || !sameBinding(matches[0], selected))
      throw new Error("AMBIGUOUS");
  }
  async function authorize(selected) {
    const id = selected.properties_key;
    if (
      !id ||
      id === "." ||
      id === ".." ||
      [selected.source, selected.destination].some(
        value => !value || value.startsWith("amq."),
      )
    )
      throw new Error("PROTECTED");
    const base = pairPath(selected);
    const collection = await request("GET", base);
    assert.equal(collection.status, 200);
    exactIdentity(collection.body, selected);
    const path = base + "/" + segment(id);
    const item = await request("GET", path);
    if (
      item.status !== 200 ||
      Array.isArray(item.body) ||
      !item.body ||
      item.body.properties_key !== id ||
      !sameBinding(item.body, selected)
    ) {
      const error = new Error("ITEM_MISMATCH");
      error.status = item.status;
      throw error;
    }
    return path;
  }
  const inventory = async () => {
    const defs = await api("definitions");
    return Object.fromEntries(
      ["exchanges", "queues", "bindings"].map(key => [
        key,
        defs[key].map(row => JSON.stringify(row)).sort(),
      ]),
    );
  };
  function removed(before, bindings = [], exchanges = []) {
    return {
      ...before,
      bindings: before.bindings.filter(
        raw => !bindings.some(row => sameBinding(JSON.parse(raw), row)),
      ),
      exchanges: before.exchanges.filter(
        raw => !exchanges.includes(JSON.parse(raw).name),
      ),
    };
  }
  function result(record, reply) {
    record.response = { status: reply.status, error: reply.body?.error };
    return reply.status;
  }
  async function check(scenario, fn) {
    const record = { scenario },
      count = deletes.length;
    try {
      await fn(record);
      checks.push(scenario);
    } catch (error) {
      failures.push({
        check: scenario,
        diagnostic: String(error.message).replaceAll(password, "[REDACTED]"),
      });
    }
    record.deleteAttempts = deletes.length - count;
    observations.push(record);
  }

  for (const vhost of vhosts)
    for (const type of ["queue", "exchange"])
      await check("exact-" + vhost + "-" + type, async record => {
        const key =
          vhost === "detailed"
            ? "literal%2F /á+"
            : vhost === "literal%2F"
              ? ""
              : "same";
        const selected = await load(
          pair(source, destination, type, vhost),
          key,
          key === "same" ? { marker: "a" } : {},
        );
        const before = await inventory();
        record.identity = selected.properties_key;
        assert.equal(
          result(record, await send(await authorize(selected))),
          204,
        );
        assert.deepEqual(await inventory(), removed(before, [selected]));
      });
  for (const key of ["null", "undefined"])
    await check("literal-" + key, async record => {
      const selected = await load(pair(source, destination), key);
      const before = await inventory();
      record.identity = selected.properties_key;
      try {
        const path = await authorize(selected);
        assert.equal(result(record, await send(path)), 204);
        assert.deepEqual(await inventory(), removed(before, [selected]));
      } catch (error) {
        if (error.message !== "ITEM_MISMATCH") throw error;
        record.itemStatus = error.status;
        record.effect =
          "collection identity could not be confirmed by exact item";
        assert.deepEqual(await inventory(), before);
      }
    });
  await check("ambiguous-points-and-implicit-blocked", async () => {
    const count = deletes.length;
    for (const key of [".", ".."])
      await assert.rejects(
        authorize(await load(pair(source, destination), key)),
        /PROTECTED/,
      );
    await assert.rejects(
      authorize({ ...pair("", destination, "queue"), properties_key: "x" }),
      /PROTECTED/,
    );
    await assert.rejects(
      authorize({
        ...pair("amq.topic", destination, "queue"),
        properties_key: "x",
      }),
      /PROTECTED/,
    );
    const selected = await load(pair(source, destination), "lost");
    assert.throws(
      () =>
        exactIdentity(
          [selected, { ...selected, arguments: { other: true } }],
          selected,
        ),
      /AMBIGUOUS/,
    );
    assert.equal(deletes.length, count);
  });
  await check("missing-item", async record => {
    const original = await load(pair(source, destination), "same", {
      marker: "b",
    });
    const before = await inventory(),
      count = deletes.length;
    const unknown = {
      ...original,
      properties_key: "bunnies-missing",
      routing_key: "bunnies-missing",
      arguments: {},
    };
    await assert.rejects(authorize(unknown), /AMBIGUOUS/);
    const path = pairPath(unknown) + "/" + segment(unknown.properties_key);
    record.itemStatus = (await request("GET", path)).status;
    assert.ok([400, 404].includes(record.itemStatus));
    assert.equal(deletes.length, count);
    assert.deepEqual(await inventory(), before);
  });
  await check("separate-source-and-destination-permissions", async record => {
    const before = await inventory();
    record.responses = [];
    for (const target of [
      pair(deniedSource, destination),
      pair(source, deniedDestination),
    ]) {
      const selected = await load(target, "denied");
      const status = result(record, await send(await authorize(selected)));
      record.responses.push(status);
      assert.ok([401, 403].includes(status));
    }
    assert.deepEqual(await inventory(), before);
  });
  await check(
    "auto-delete-penultimate-and-cascade-after-read",
    async record => {
      const original = await inventory();
      const last = await load(pair(auto, leaf), "last");
      const first = await load(pair(auto, leaf), "first");
      const upstream = await load(pair(parent, auto), "parent");
      const finalPath = await authorize(last);
      record.penultimateStatus = (
        await request("DELETE", await authorize(first))
      ).status;
      assert.equal(record.penultimateStatus, 204);
      assert.deepEqual(await inventory(), removed(original, [first]));
      assert.equal(result(record, await send(finalPath)), 204);
      assert.deepEqual(
        await inventory(),
        removed(original, [first, last, upstream], [auto, parent]),
      );
      record.removed = [auto, parent];
    },
  );
  await check("equivalent-recreation-between-read-and-delete", async record => {
    const target = pair(source, destination);
    const selected = await load(target, "recreated");
    const path = await authorize(selected);
    const original = await inventory();
    record.setupRemoval = (await request("DELETE", path)).status;
    assert.equal(record.setupRemoval, 204);
    assert.deepEqual(await inventory(), removed(original, [selected]));
    const client = await connect(
      {
        protocol: "amqps",
        hostname: "127.0.0.1",
        port: amqpsPort,
        username,
        password,
        vhost: "/",
      },
      {
        ca: fixture.ca,
        rejectUnauthorized: true,
        minVersion: "TLSv1.2",
        timeout: 5000,
      },
    );
    try {
      const channel = await client.createChannel();
      await channel.bindExchange(
        target.destination,
        target.source,
        "recreated",
        {},
      );
      await channel.close();
    } finally {
      await client.close();
    }
    record.setupRecreation = "AMQPS exchange.bind-ok";
    assert.equal(
      (await load(target, "recreated")).properties_key,
      selected.properties_key,
    );
    assert.deepEqual(await inventory(), original);
    assert.equal(result(record, await send(path)), 204);
    assert.deepEqual(await inventory(), removed(original, [selected]));
  });
  await check("equivalent-http-recreation-with-explicit-body", async record => {
    const target = pair(source, destination);
    const key = "recreated-http";
    const selected = await load(target, key);
    const path = await authorize(selected);
    const original = await inventory();
    assert.equal((await request("DELETE", path)).status, 204);
    assert.deepEqual(await inventory(), removed(original, [selected]));
    record.setupRecreation = (
      await request("POST", pairPath(target), {
        body: { routing_key: key, arguments: {} },
      })
    ).status;
    assert.equal(record.setupRecreation, 201);
    assert.equal(
      (await load(target, key)).properties_key,
      selected.properties_key,
    );
    assert.deepEqual(await inventory(), original);
    assert.equal(result(record, await send(path)), 204);
    assert.deepEqual(await inventory(), removed(original, [selected]));
  });
  await check("untrusted-tls-before-http", async record => {
    const selected = await load(pair(source, destination), "lost");
    const before = await inventory();
    await assert.rejects(send(await authorize(selected), { ca: null }), error =>
      /CERT|ISSUER|VERIFY/.test(error.code),
    );
    assert.deepEqual(await inventory(), before);
    record.effect = "TLS rejected before HTTP";
  });
  await check("lost-response-after-single-send", async record => {
    const selected = await load(pair(source, destination), "lost");
    const before = await inventory();
    const path = await authorize(selected);
    let forwarded = 0,
      proxyError;
    const proxy = https.createServer(
      { key: fixture.key, cert: fixture.cert },
      (req, res) => {
        if (
          req.method !== "DELETE" ||
          req.url !== managementPrefix + path ||
          forwarded
        ) {
          res.writeHead(400).end();
          return;
        }
        forwarded++;
        void request("DELETE", path)
          .then(reply => {
            record.brokerStatus = reply.status;
          })
          .catch(error => {
            proxyError = error;
          })
          .finally(() => res.destroy());
      },
    );
    await new Promise((resolve, reject) =>
      proxy.once("error", reject).listen(0, "127.0.0.1", resolve),
    );
    try {
      await assert.rejects(send(path, { port: proxy.address().port }), {
        code: "ECONNRESET",
      });
      if (proxyError) throw proxyError;
      assert.equal(forwarded, 1);
      assert.equal(record.brokerStatus, 204);
      assert.deepEqual(await inventory(), removed(before, [selected]));
    } finally {
      proxy.closeAllConnections();
      await new Promise(resolve => proxy.close(resolve));
    }
  });
  await check("no-retained-amqp-connections-or-channels", noConnections);
  return failures;
}
module.exports = { definitions, run };
