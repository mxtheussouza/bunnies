const assert = require("node:assert/strict");
const { createServer } = require("node:https");
const { connect } = require("amqplib");

const specialName = "pedidos/equipe %2F • #?+";
const searchName = "pedidos [literal]";
const detailedVhost = "detailed";
const rootQueueNames = [
  ...Array.from(
    { length: 101 },
    (_, index) => `fila-${String(index).padStart(3, "0")}`,
  ),
  specialName,
  searchName,
  "pedidos literal",
  "quorum",
  "stream",
  ".",
];
function queue(vhost, name) {
  return {
    vhost,
    name,
    durable: true,
    auto_delete: false,
    arguments:
      name === "quorum" || name === "stream"
        ? { "x-queue-type": name }
        : { "x-message-ttl": vhost === "/" ? 5000 : 6000 },
  };
}
const queues = [
  ...rootQueueNames.map(name => queue("/", name)),
  ...["equipe/pedidos", "literal%2F", "área pedidos", detailedVhost].map(
    vhost => queue(vhost, specialName),
  ),
  queue("negado", "privada"),
];

async function runQueuesGate({
  adapter,
  fixture,
  httpsPort,
  amqpsPort,
  managementPrefix,
  username,
  password,
  observerPassword,
  checks,
  observations,
  api,
  noConnections,
}) {
  const input = {
    httpsUrl: `https://127.0.0.1:${httpsPort}${managementPrefix}`,
    username,
    password,
    trust: { mode: "custom", pem: fixture.ca },
  };
  const failures = [];
  const read = (
    query,
    fields = {},
    signal = new globalThis.AbortController().signal,
  ) => adapter.readManagement({ ...input, ...fields }, query, signal);
  const page = (page = 1, search, vhost = "/") => ({
    kind: "queuePage",
    page,
    search,
    vhost,
  });
  const detail = (name = specialName, vhost = "/") => ({
    kind: "queueDetail",
    name,
    vhost,
  });
  async function check(label, run) {
    try {
      await run();
      checks.push(label);
    } catch (error) {
      const diagnostic = String(error.message)
        .replaceAll(password, "[REDACTED]")
        .replaceAll(observerPassword, "[REDACTED]");
      failures.push({
        check: label,
        code: error.code ?? error.name,
        diagnostic,
      });
    }
  }
  await check("broker-pagination-two-real-pages", async () => {
    const first = await read(page());
    const second = await read(page(2));
    assert.equal(first.page, 1);
    assert.equal(second.page, 2);
    assert.equal(first.pageCount, 2);
    assert.equal(second.pageCount, 2);
    assert.equal(first.totalCount, rootQueueNames.length);
    assert.equal(second.totalCount, rootQueueNames.length);
    assert.equal(first.items.length, 100);
    assert.equal(second.items.length, rootQueueNames.length - 100);
    assert.deepEqual(
      [...first.items, ...second.items].map(item => item.name).sort(),
      [...rootQueueNames].sort(),
    );
    assert.ok(
      [...first.items, ...second.items].some(item => item.name === "."),
    );
  });
  await check(
    "broker-literal-name-filter-including-meta-and-utf8",
    async () => {
      for (const [search, match] of [
        ["[literal]", searchName],
        ["%2F • #?+", specialName],
      ]) {
        const found = await read(page(1, search));
        assert.equal(found.filteredCount, 1);
        assert.equal(found.totalCount, rootQueueNames.length);
        assert.equal(found.pageCount, 1);
        assert.deepEqual(
          found.items.map(item => item.name),
          [match],
        );
      }
      const empty = await read(page(1, "nenhuma-fila"));
      assert.equal(empty.filteredCount, 0);
      assert.equal(empty.pageCount, 0);
      assert.deepEqual(empty.items, []);
    },
  );
  await check("broker-page-outside-current-range", async () => {
    const result = await read(page(3)).catch(error => error);
    // The broker can report the missing page through its status or empty rows.
    if (result instanceof Error) assert.equal(result.code, "QUEUE_PAGE");
    else {
      assert.equal(result.page, 3);
      assert.equal(result.pageCount, 2);
      assert.deepEqual(result.items, []);
    }
  });
  await check("broker-identities-isolated-across-special-vhosts", async () => {
    for (const vhost of ["/", "equipe/pedidos", "literal%2F", "área pedidos"]) {
      const row = await read(detail(specialName, vhost));
      assert.equal(row.vhost, vhost);
      assert.equal(row.queue.name, specialName);
      assert.equal(row.queue.durable, true);
      assert.equal(row.queue.exclusive, false);
      assert.equal(row.queue.autoDelete, false);
      assert.equal(
        row.queue.arguments?.["x-message-ttl"],
        vhost === "/" ? 5000 : 6000,
      );
      const found = await read(page(1, specialName, vhost));
      assert.equal(found.filteredCount, 1);
      assert.equal(found.items[0].name, specialName);
    }
  });
  await check("broker-vhost-named-detailed", async () => {
    await assert.rejects(read(page(1, specialName, detailedVhost)), {
      code: "QUEUE_LIST_ROUTE",
    });
    const result = await read(detail(specialName, detailedVhost));
    assert.equal(result.vhost, detailedVhost);
    assert.equal(result.queue.name, specialName);
  });
  await check("broker-queue-types-and-optional-metadata", async () => {
    observations.emptyQueues = {};
    for (const [name, type] of [
      [specialName, "classic"],
      ["quorum", "quorum"],
      ["stream", "stream"],
    ]) {
      const { queue } = await read(detail(name));
      assert.equal(queue.type, type);
      const metrics = Object.fromEntries(
        ["ready", "unacknowledged", "total", "consumers"].map(field => {
          assert.ok(queue[field] === undefined || queue[field] === 0);
          return [field, queue[field] ?? null];
        }),
      );
      if (queue.consumerDetails !== undefined)
        assert.deepEqual(queue.consumerDetails, { items: [], partial: false });
      observations.emptyQueues[type] = {
        ...metrics,
        consumerDetails: queue.consumerDetails?.items.length ?? null,
      };
    }
  });
  await check("broker-denied-and-absent-resources", async () => {
    for (const request of [page(), detail()]) {
      await assert.rejects(read(request, { username: "bunnies-no-tag" }), {
        code: "DENIED",
      });
      await assert.rejects(
        read(request, { username: "bunnies-denied" }),
        error => ["AUTH", "DENIED", "NOT_FOUND"].includes(error.code),
      );
    }
    await assert.rejects(read(page(1, undefined, "negado")), error =>
      ["AUTH", "DENIED", "NOT_FOUND"].includes(error.code),
    );
    await assert.rejects(read(detail("fila-ausente")), { code: "NOT_FOUND" });
  });
  await check("broker-projects-live-synthetic-consumer", async () => {
    const connection = await connect(
      {
        protocol: "amqps",
        hostname: "127.0.0.1",
        port: amqpsPort,
        username: "bunnies-observer",
        password: observerPassword,
        vhost: "/",
      },
      { ca: fixture.ca, rejectUnauthorized: true, timeout: 5000 },
    );
    try {
      const channel = await connection.createChannel();
      const { consumerTag } = await channel.consume(specialName, () => {}, {
        consumerTag: "bunnies-fixture-consumer",
      });
      const expires = Date.now() + 5000;
      for (;;) {
        const data = await read(detail());
        if (data.queue.consumerDetails?.items.length) {
          assert.deepEqual(data.queue.consumerDetails, {
            items: [
              { tag: consumerTag, active: true, acknowledgementRequired: true },
            ],
            partial: false,
          });
          break;
        }
        assert.ok(
          Date.now() < expires,
          "Management did not observe the synthetic consumer",
        );
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      await channel.cancel(consumerTag);
      await channel.close();
    } finally {
      await connection.close();
    }
  });

  let handler;
  let requests = 0;
  const sockets = new Set();
  const server = createServer(
    { key: fixture.key, cert: fixture.cert },
    (req, res) => {
      requests++;
      handler(req, res);
    },
  );
  server.on("connection", socket => {
    sockets.add(socket);
    socket.once("close", () => sockets.delete(socket));
  });
  await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
  const local = (query, signal) =>
    read(
      query,
      { httpsUrl: `https://127.0.0.1:${server.address().port}/fixture` },
      signal,
    );
  const json = (res, data) => {
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(data));
  };
  try {
    await check("fixture-dot-segments-rejected-before-IO", async () => {
      const before = requests;
      for (const query of [
        page(1, undefined, "."),
        page(1, undefined, ".."),
        detail("."),
        detail(".."),
      ])
        await assert.rejects(local(query), { code: "QUEUE_SEGMENT" });
      assert.equal(requests, before);
    });
    await check("fixture-detailed-list-rejected-before-IO", async () => {
      const before = requests;
      await assert.rejects(local(page(1, undefined, detailedVhost)), {
        code: "QUEUE_LIST_ROUTE",
      });
      assert.equal(requests, before);
      handler = (_req, res) =>
        json(res, {
          page: 1,
          page_size: 100,
          page_count: 0,
          total_count: 0,
          filtered_count: 0,
          item_count: 0,
          items: [],
        });
      const allowed = await local(page(1, undefined, "Detailed"));
      assert.equal(allowed.vhost, "Detailed");
      assert.equal(requests, before + 1);
    });
    await check(
      "fixture-encoded-path-missing-fields-and-other-vhost-rejection",
      async () => {
        let path;
        handler = (req, res) => {
          path = (req.url ?? "").split("?")[0];
          json(res, {
            name: specialName,
            vhost: "/",
            arguments: { ignored: "discard" },
          });
        };
        const data = await local(detail());
        assert.equal(
          path,
          `/fixture/api/queues/%2F/${encodeURIComponent(specialName)}`,
        );
        assert.deepEqual(data.queue, { name: specialName, arguments: {} });
        await assert.rejects(local(detail(specialName, "equipe/pedidos")), {
          code: "RESPONSE",
        });
        handler = (_req, res) =>
          json(res, {
            name: specialName,
            vhost: "/",
            messages: 0,
            consumer_details: [],
          });
        const zero = await local(detail());
        assert.deepEqual(zero.queue, {
          name: specialName,
          total: 0,
          consumerDetails: { items: [], partial: false },
        });
      },
    );
    await check("fixture-streaming-body-limit-and-cancellation", async () => {
      handler = (_req, res) => {
        res.setHeader("Content-Type", "application/json");
        res.write(" ".repeat(256 * 1024));
        res.end(" ");
      };
      await assert.rejects(local(page()), { code: "LIMIT" });
      const controller = new globalThis.AbortController();
      handler = (_req, res) => {
        res.setHeader("Content-Type", "application/json");
        res.write("{");
        controller.abort();
      };
      await assert.rejects(local(detail(), controller.signal), {
        code: "CANCELLED",
      });
    });
  } finally {
    await Promise.all(
      [...sockets].map(
        socket =>
          new Promise(resolve => {
            socket.once("close", resolve);
            socket.destroy();
          }),
      ),
    );
    await new Promise(resolve => server.close(resolve));
    assert.equal(sockets.size, 0);
  }
  await check("broker-fixtures-unchanged-and-no-active-consumers", async () => {
    await noConnections();
    assert.equal((await api("consumers")).length, 0);
    assert.equal((await api("queues")).length, queues.length);
  });
  return failures;
}

module.exports = { queues, runQueuesGate };
