const assert = require("node:assert/strict");

const exchangeName = "bunnies/exchange %2F • #?+";
const specialVhosts = [
  "/",
  "detailed",
  "literal%2F",
  "área pedidos",
  "equipe/pedidos",
];
const destination = "bunnies-destination";
const queueName = "bunnies-binding-queue";
const emptyName = "bunnies-empty";
const literalSearchName = "bunnies [literal]";
const atLimit = "bunnies-binding-limit";
const overLimit = "bunnies-binding-over-limit";
const exchange = (vhost, name, type = "direct", extra = {}) => ({
  vhost,
  name,
  type,
  durable: true,
  auto_delete: false,
  internal: false,
  arguments: {},
  ...extra,
});
const binding = (source, target, destination_type, routing_key, args = {}) => ({
  vhost: "/",
  source,
  destination: target,
  destination_type,
  routing_key,
  arguments: args,
});

const definitions = {
  exchanges: [
    ...specialVhosts.map(vhost =>
      exchange(vhost, exchangeName, "topic", { arguments: { scope: vhost } }),
    ),
    exchange("/", literalSearchName),
    exchange("/", "bunnies literal"),
    exchange("/", emptyName),
    exchange("/", atLimit),
    exchange("/", overLimit),
    exchange("/", destination, "headers", { internal: true }),
    exchange("negado", exchangeName),
    ...Array.from({ length: 101 }, (_, index) =>
      exchange("/", "bunnies-page-" + String(index).padStart(3, "0")),
    ),
  ],
  queues: [
    {
      vhost: "/",
      name: queueName,
      durable: true,
      auto_delete: false,
      arguments: {},
    },
  ],
  bindings: [
    binding(exchangeName, queueName, "queue", "", { marker: "a" }),
    binding(exchangeName, queueName, "queue", "", { marker: "b" }),
    binding(exchangeName, destination, "exchange", "follow"),
    ...Array.from({ length: 200 }, (_, index) =>
      binding(atLimit, queueName, "queue", "limit." + index),
    ),
    ...Array.from({ length: 201 }, (_, index) =>
      binding(overLimit, queueName, "queue", "limit." + index),
    ),
  ],
};

async function run({
  adapter,
  fixture,
  managementPrefix,
  httpsPort,
  username,
  password,
  checks,
  api,
  noConnections,
}) {
  const failures = [];
  const input = {
    httpsUrl: `https://127.0.0.1:${httpsPort}${managementPrefix}`,
    username,
    password,
    trust: { mode: "custom", pem: fixture.ca },
  };
  const read = (
    query,
    fields = {},
    signal = new globalThis.AbortController().signal,
  ) => adapter.readManagement({ ...input, ...fields }, query, signal);
  const page = (page = 1, search, vhost = "/") => ({
    kind: "exchangePage",
    vhost,
    page,
    search,
  });
  const detail = (name, vhost = "/") => ({
    kind: "exchangeDetail",
    vhost,
    name,
  });
  const bindings = (name, direction = "outgoing", vhost = "/") => ({
    kind: "exchangeBindings",
    vhost,
    name,
    direction,
  });
  async function check(label, fn) {
    try {
      await fn();
      checks.push(label);
    } catch (error) {
      failures.push({
        check: label,
        code: error.code ?? error.name,
        diagnostic: String(error.message).replaceAll(password, "[REDACTED]"),
      });
    }
  }
  const inventory = () =>
    api("definitions").then(data =>
      Object.fromEntries(
        Object.keys(definitions).map(key => [
          key,
          data[key].map(row => JSON.stringify(row)).sort(),
        ]),
      ),
    );
  const before = await inventory();

  await check("broker-exchange-pages-and-true-counts", async () => {
    const first = await read(page());
    const second = await read(page(2));
    const expected = (await api("exchanges/%2F")).map(item => item.name).sort();
    assert.equal(first.pageCount, 2);
    assert.equal(second.totalCount, expected.length);
    assert.equal(first.items.length, 100);
    assert.deepEqual(
      [...first.items, ...second.items].map(item => item.name).sort(),
      expected,
    );
  });
  await check("literal-exchange-search-and-empty", async () => {
    const search = await read(page(1, "[literal]"));
    assert.equal(search.filteredCount, 1);
    assert.equal(search.items[0].name, literalSearchName);
    const empty = await read(page(1, "bunnies-no-such-exchanges"));
    assert.equal(empty.filteredCount, 0);
    assert.equal(empty.pageCount, 0);
    assert.deepEqual(empty.items, []);
  });
  await check("outside-page-and-recover-to-first", async () => {
    const outside = await read(page(3)).catch(error => error);
    if (outside instanceof Error) assert.equal(outside.code, "EXCHANGE_PAGE");
    else {
      assert.equal(outside.pageCount, 2);
      assert.deepEqual(outside.items, []);
    }
    assert.equal((await read(page())).items.length, 100);
  });
  await check("special-vhost-and-exchange-segments-with-homonyms", async () => {
    for (const vhost of specialVhosts) {
      const item = await read(detail(exchangeName, vhost));
      assert.equal(item.vhost, vhost);
      assert.equal(item.exchange.name, exchangeName);
      assert.equal(item.exchange.type, "topic");
      assert.deepEqual(JSON.parse(item.exchange.argumentsJson), {
        scope: vhost,
      });
      const list = await read(page(1, "%2F • #?+", vhost));
      assert.deepEqual(
        list.items.map(item => item.name),
        [exchangeName],
      );
      if (vhost !== "/")
        assert.deepEqual(
          (await read(bindings(exchangeName, "outgoing", vhost))).items,
          [],
        );
    }
  });
  await check("default-exchange-alias-and-reserved-and-internal", async () => {
    const result = await read(detail(""));
    assert.equal(result.exchange.name, "");
    assert.equal(result.exchange.type, "direct");
    assert.equal((await read(detail("amq.topic"))).exchange.type, "topic");
    const item = (await read(detail(destination))).exchange;
    assert.equal(item.type, "headers");
    assert.equal(item.internal, true);
    assert.equal(item.durable, true);
    assert.equal(item.autoDelete, false);
    assert.deepEqual(JSON.parse(item.argumentsJson), {});
    await assert.rejects(read(bindings("")), {
      code: "EXCHANGE_DEFAULT_BINDINGS",
    });
    for (const name of [".", "..", "amq.default"])
      await assert.rejects(read(detail(name)), { code: "EXCHANGE_SEGMENT" });
    await assert.rejects(read(page(1, undefined, ".")), {
      code: "EXCHANGE_SEGMENT",
    });
  });
  await check("outgoing-and-incoming-preserve-binding-identities", async () => {
    const outgoing = (await read(bindings(exchangeName))).items;
    const incoming = (await read(bindings(destination, "incoming"))).items;
    assert.equal(outgoing.length, 3);
    const toQueue = outgoing.filter(item => item.destinationType === "queue");
    assert.equal(toQueue.length, 2);
    assert.ok(
      toQueue.every(
        item => item.routingKey === "" && item.destination === queueName,
      ),
    );
    assert.equal(new Set(toQueue.map(item => item.propertiesKey)).size, 2);
    assert.deepEqual(
      toQueue.map(item => JSON.parse(item.argumentsJson).marker).sort(),
      ["a", "b"],
    );
    assert.deepEqual(
      incoming,
      outgoing.filter(item => item.destinationType === "exchange"),
    );
    assert.deepEqual((await read(bindings(emptyName))).items, []);
  });
  await check("binding-limit-refuses-entire-direction", async () => {
    assert.equal((await read(bindings(atLimit))).items.length, 200);
    await assert.rejects(read(bindings(overLimit)), {
      code: "EXCHANGE_BINDINGS_LIMIT",
    });
  });
  await check("missing-exchange-and-denied-vhost", async () => {
    await assert.rejects(read(detail("bunnies-nonexistent")), {
      code: "NOT_FOUND",
    });
    await assert.rejects(read(detail(exchangeName, "negado")), error =>
      ["AUTH", "DENIED", "NOT_FOUND"].includes(error.code),
    );
  });
  await check("invalid-tls-and-cancelled-read", async () => {
    await assert.rejects(read(page(), { trust: { mode: "system" } }), {
      code: "TLS",
    });
    const cancel = new globalThis.AbortController();
    cancel.abort(new adapter.ManagementFailure("CANCELLED"));
    await assert.rejects(read(page(), {}, cancel.signal), {
      code: "CANCELLED",
    });
  });
  await check(
    "inventory-unchanged-and-zero-product-amqp-connections-or-channels",
    async () => {
      assert.deepEqual(await inventory(), before);
      await noConnections();
    },
  );
  return failures;
}

module.exports = { definitions, exchangeName, destination, run };
