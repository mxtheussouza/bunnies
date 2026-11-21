const assert = require("node:assert/strict");
const https = require("node:https");

const vhosts = ["/", "detailed", "literal%2F"];
const source = "bunnies-bind-source /á%2F";
const headers = "bunnies-bind-source-headers";
const deniedSource = "bunnies-denied-source";
const destination = "bunnies-bind-destination /á%2F";
const deniedDestination = "bunnies-denied-destination";
const exchange = (name, vhost, type = "direct") => ({
  name,
  vhost,
  type,
  durable: true,
  auto_delete: false,
  internal: false,
  arguments: {},
});
const definitions = {
  exchanges: vhosts.flatMap(vhost =>
    [source, headers, destination, deniedSource, deniedDestination].map(name =>
      exchange(name, vhost, name === headers ? "headers" : "direct"),
    ),
  ),
  queues: vhosts.map(vhost => ({
    vhost,
    name: destination,
    durable: true,
    auto_delete: false,
    arguments: {},
  })),
};
const segment = encodeURIComponent;
function pair(vhost, from, type, to) {
  return (
    "/api/bindings/" +
    segment(vhost) +
    "/e/" +
    segment(from) +
    "/" +
    type +
    "/" +
    segment(to)
  );
}

async function run({
  adapter,
  fixture,
  managementPrefix,
  httpsPort,
  username,
  password,
  checks,
  observations,
  api,
  noConnections,
}) {
  const failures = [];
  function request(method, route, body) {
    return new Promise((resolve, reject) => {
      const data =
        body === undefined ? undefined : Buffer.from(JSON.stringify(body));
      const req = https.request(
        {
          hostname: "127.0.0.1",
          port: httpsPort,
          path: managementPrefix + route,
          method,
          auth: username + ":" + password,
          agent: false,
          ca: fixture.ca,
          rejectUnauthorized: true,
          minVersion: "TLSv1.2",
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
            let parsed;
            try {
              parsed = JSON.parse(Buffer.concat(chunks));
            } catch {
              parsed = undefined;
            }
            resolve({
              status: res.statusCode,
              location: res.headers.location,
              body: parsed,
            });
          });
        },
      );
      req.on("error", reject);
      req.setTimeout(5000, () => req.destroy());
      req.end(data);
    });
  }
  async function check(scenario, fn) {
    const record = { scenario };
    try {
      await fn(record);
      checks.push(scenario);
    } catch (error) {
      failures.push({
        check: scenario,
        diagnostic: String(error.message).replaceAll(password, "[REDACTED]"),
      });
    }
    observations.push(record);
  }
  async function create(
    record,
    {
      vhost = "/",
      from = source,
      type = "q",
      to = destination,
      key = "",
      args = {},
    } = {},
  ) {
    const route = pair(vhost, from, type, to);
    const post = await request("POST", route, {
      routing_key: key,
      arguments: args,
    });
    record.post = {
      status: post.status,
      location: post.location,
      error: post.body?.error,
    };
    assert.equal(post.status, 201);
    const target = {
      vhost,
      source: from,
      destinationType: type === "q" ? "queue" : "exchange",
      destination: to,
      routingKey: key,
      arguments: args,
    };
    const candidate = adapter.bindingVerification(
      managementPrefix,
      target,
      post.location,
    );
    assert.ok(candidate, "Location sem identidade compatível");
    const get = await request("GET", candidate.path);
    record.get = {
      status: get.status,
      mode: candidate.pair ? "pair" : "exact",
      identity: candidate.id,
    };
    assert.equal(get.status, 200);
    assert.equal(
      adapter.compareBinding(get.body, target, candidate),
      "confirmed",
    );
    return candidate.id;
  }
  const before = await api("definitions");
  for (const vhost of vhosts)
    for (const type of ["q", "e"])
      await check("target-" + vhost + "-" + type, record =>
        create(record, { vhost, type, key: " /á%2F ?#" }),
      );
  for (const key of ["", ".", "..", "literal%2F"])
    await check("routing-key-" + JSON.stringify(key), record =>
      create(record, { key }),
    );
  await check("typed-arguments-distinct-and-equivalent", async record => {
    const seen = [];
    record.attempts = seen;
    const createAndTrack = async args => {
      const attempt = {};
      seen.push(attempt);
      return create(attempt, { key: "identical", args });
    };
    const args = {
      empty: "",
      flag: false,
      low: -2147483648,
      high: 2147483647,
      zero: 0,
    };
    const a = await createAndTrack(args);
    const b = await createAndTrack({ ...args, flag: true });
    assert.notEqual(a, b);
    assert.equal(await createAndTrack(args), a);
    const rows = (
      await api(pair("/", source, "q", destination).slice(5))
    ).filter(row => row.routing_key === "identical");
    assert.equal(rows.length, 2);
  });
  for (const match of ["all", "any"])
    await check("headers-" + match, record =>
      create(record, {
        from: headers,
        key: "",
        args: { "x-match": match, region: "br", active: false, count: 0 },
      }),
    );
  await check("missing-read-or-write-permission", async record => {
    record.responses = [];
    for (const [from, to] of [
      [deniedSource, destination],
      [source, deniedDestination],
    ]) {
      const result = await request("POST", pair("/", from, "e", to), {
        routing_key: "denied",
        arguments: {},
      });
      record.responses.push({
        status: result.status,
        error: result.body?.error,
      });
      assert.ok([401, 403].includes(result.status));
    }
  });
  await check("untrusted-location-cannot-select-route", async () => {
    const route = pair("/", source, "q", destination);
    for (const value of [
      "https://example.invalid/item",
      "//example.invalid/item",
      "../other/item",
      managementPrefix + pair("detailed", source, "q", destination) + "/x",
      route + "/x",
      "x",
      "bad%zz",
      destination + "/%2e",
      destination + "/%00",
      destination + "/x?extra=1",
      destination + "/x#ignored",
      destination + "/" + "z".repeat(1025),
    ])
      assert.equal(
        adapter.bindingVerification(
          managementPrefix,
          {
            vhost: "/",
            source,
            destinationType: "queue",
            destination,
            routingKey: "",
            arguments: {},
          },
          value,
        ),
        undefined,
      );
  });
  await check("point-identity-list-unique-and-bounded", async () => {
    const target = {
      vhost: "/",
      source,
      destinationType: "queue",
      destination,
      routingKey: ".",
      arguments: {},
    };
    const verification = adapter.bindingVerification(
      managementPrefix,
      target,
      segment(destination) + "/.",
    );
    assert.equal(verification.pair, true);
    const row = {
      vhost: "/",
      source,
      destination_type: "queue",
      destination,
      routing_key: ".",
      properties_key: ".",
      arguments: {},
    };
    const neighbors = Array.from({ length: 199 }, (_, i) => ({
      ...row,
      routing_key: String(i),
      properties_key: String(i),
    }));
    assert.equal(
      adapter.compareBinding([...neighbors, row], target, verification),
      "confirmed",
    );
    assert.throws(
      () =>
        adapter.compareBinding([...neighbors, row, row], target, verification),
      { code: "LIMIT" },
    );
    assert.throws(
      () => adapter.compareBinding([row, row], target, verification),
      { code: "RESPONSE" },
    );
    assert.throws(
      () => adapter.compareBinding(neighbors, target, verification),
      { code: "RESPONSE" },
    );
    assert.equal(
      adapter.compareBinding(
        [{ ...row, arguments: { changed: true } }],
        target,
        verification,
      ),
      "divergent",
    );
  });
  await check("no-other-resources-or-amqp-connections", async () => {
    const after = await api("definitions");
    for (const field of ["exchanges", "queues"])
      assert.deepEqual(
        after[field].map(x => JSON.stringify(x)).sort(),
        before[field].map(x => JSON.stringify(x)).sort(),
      );
    assert.ok(
      after.bindings.every(
        row => row.source === source || row.source === headers,
      ),
    );
    await noConnections();
  });
  return failures;
}
module.exports = { definitions, run };
