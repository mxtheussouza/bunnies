const assert = require("node:assert/strict");
const { spawn } = require("node:child_process");
const { Socket } = require("node:net");
const { join } = require("node:path");
const { checkServerIdentity } = require("node:tls");
const { writeFile, readFile } = require("node:fs/promises");
const { connect } = require("amqplib/callback_api");
const { createTlsFixture } = require("./tls-fixture.cjs");
const { createAmqpPeer } = require("./amqp-fixture.cjs");
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

// A disposable child proves the pinned public API before privileged app changes.
// No uncaughtException handler, private import, stream/state access or patch.
async function client() {
  let input = "";
  for await (const chunk of process.stdin) input += chunk;
  const { port, ca, holdMs, api, action } = JSON.parse(input);
  const socket = new Socket();
  const events = [];
  let model,
    closeConfirmed = false,
    opened = false,
    closing = false;
  socket.on("error", () => events.push("socket-error"));
  socket.on("close", () => events.push("socket-close"));
  const destroy = () =>
    socket.destroy(new Error("Bunnies lifecycle cancellation"));
  const close = () =>
    new Promise(resolve => {
      closing = true;
      let requested = false;
      const timer = setTimeout(() => {
        destroy();
        resolve();
      }, 1000);
      try {
        const completed = error => {
          closeConfirmed = !error && requested;
          clearTimeout(timer);
          resolve();
        };
        const pending =
          api === "promise" ? model.close() : model.close(completed);
        requested = true;
        if (api === "promise") pending.then(() => completed(), completed);
      } catch {
        clearTimeout(timer);
        destroy();
        resolve();
      }
    });
  const deadline = setTimeout(() => {
    socket.destroy();
    process.exitCode = 2;
  }, 42000);
  try {
    await new Promise((resolve, reject) => {
      socket.once("connect", resolve);
      socket.once("error", reject);
      socket.connect(port, "127.0.0.1");
    });
    if (action === "abortBeforeTls") {
      destroy();
      throw new Error("Cancelled before TLS");
    }
    await new Promise((resolve, reject) => {
      const publicConnect =
        api === "promise"
          ? (url, options, callback) =>
              require("amqplib")
                .connect(url, options)
                .then(
                  model => callback(null, model),
                  error => callback(error),
                )
          : connect;
      publicConnect(
        {
          protocol: "amqps",
          hostname: "127.0.0.1",
          port,
          username: "synthetic:user",
          password: "SYNTHETIC-LIFECYCLE-ONLY",
          vhost: "%2F",
          heartbeat: 10,
          frameMax: 131072,
          channelMax: 1,
        },
        {
          socket,
          ca,
          rejectUnauthorized: true,
          minVersion: "TLSv1.2",
          checkServerIdentity,
        },
        (error, connection) => {
          if (error) {
            events.push("connect-error");
            reject(new Error("connect failed"));
            return;
          }
          model = connection;
          events.push("callback");
          model.on("error", () => events.push("model-error"));
          model.on("close", () =>
            events.push(closing ? "closed" : "unexpected-close"),
          );
          model.on("blocked", () => events.push("blocked"));
          model.on("unblocked", () => events.push("unblocked"));
          if (action === "closeInCallback") {
            void close().then(resolve);
            return;
          }
          if (action === "abortInCallback") {
            destroy();
            setTimeout(resolve, 0);
            return;
          }
          // Public owned socket, no model.connection/stream/blocked inspection.
          setTimeout(() => {
            opened =
              !socket.destroyed &&
              !events.includes("unexpected-close") &&
              !events.includes("model-error");
            resolve();
          }, 0);
        },
      );
    });
    if (opened) {
      await sleep(holdMs);
      if (action === "abortAfterTurn") destroy();
      else if (!socket.destroyed && !events.includes("unexpected-close"))
        await close();
    }
  } catch {
    events.push("client-rejected");
  } finally {
    clearTimeout(deadline);
    destroy();
    await sleep(50);
  }
  process.stdout.write(
    JSON.stringify({ opened, closeConfirmed, events }) + "\n",
  );
}

async function child(input) {
  return new Promise((resolve, reject) => {
    const started = Date.now();
    const electronRuntime = input.runtime === "electron";
    const processChild = spawn(
      electronRuntime ? require("electron") : process.execPath,
      [join(__dirname, "amqps-lifecycle.cjs"), "--client"],
      {
        stdio: ["pipe", "pipe", "pipe"],
        env: {
          ...process.env,
          ...(electronRuntime ? { ELECTRON_RUN_AS_NODE: "1" } : {}),
        },
      },
    );
    let stdout = "",
      stderr = "";
    const timer = setTimeout(() => processChild.kill("SIGKILL"), 46000);
    processChild.stdout.on("data", chunk => {
      stdout += chunk;
    });
    processChild.stderr.on("data", chunk => {
      stderr += chunk;
    });
    processChild.once("error", error => {
      clearTimeout(timer);
      reject(error);
    });
    processChild.once("close", (code, signal) => {
      clearTimeout(timer);
      let result = null;
      try {
        result = JSON.parse(stdout);
      } catch {
        /* Native failure or uncaught error. */
      }
      resolve({
        code,
        signal,
        result,
        elapsedMs: Date.now() - started,
        // Fixture values only; do not retain SASL response or uncontrolled replyText.
        diagnostic: stderr
          .split("\n")
          .filter(line =>
            /Unhandled 'error' event|Error:|throw er;|node:events:/.test(line),
          )
          .map(line =>
            line.replaceAll(
              "SYNTHETIC-UNTRUSTED-BROKER-DETAIL",
              "[fixture detail]",
            ),
          )
          .slice(0, 6),
      });
    });
    processChild.stdin.on("error", () => undefined);
    processChild.stdin.end(JSON.stringify(input));
  });
}

async function run() {
  const fixture = await createTlsFixture();
  const reports = [];
  try {
    const cases = [
      "ok",
      "stallClose",
      "blocked",
      "lateEvents",
      "earlyClose",
      "earlyNormalClose",
      "earlyInvalid",
      "heartbeatLost",
    ].map(mode => ({ mode, api: "callback", runtime: "node" }));
    for (const mode of ["earlyClose", "earlyInvalid"]) {
      cases.push({ mode, api: "promise", runtime: "node" });
      cases.push({ mode, api: "callback", runtime: "electron" });
      cases.push({ mode, api: "promise", runtime: "electron" });
    }
    for (const action of [
      "abortBeforeTls",
      "abortInCallback",
      "closeInCallback",
      "abortAfterTurn",
    ])
      for (const api of ["callback", "promise"])
        for (const runtime of ["node", "electron"])
          cases.push({ mode: "ok", action, api, runtime });
    const quick = process.argv.includes("--quick");
    for (const { mode, api, runtime, action } of cases.filter(
      row =>
        !quick ||
        (row.mode !== "ok" && row.mode !== "heartbeatLost") ||
        row.action,
    )) {
      const peer = await createAmqpPeer(fixture, { mode, heartbeat: true });
      try {
        const result = await child({
          port: peer.port,
          ca: fixture.ca,
          holdMs:
            mode === "heartbeatLost"
              ? 34000
              : mode === "ok" && !action
                ? 22000
                : 400,
          api,
          runtime,
          action,
        });
        for (let n = 0; peer.sockets.size && n < 100; n++) await sleep(20);
        const record = peer.records[0];
        const cleanup = peer.sockets.size === 0;
        const report = {
          mode,
          api,
          runtime,
          action,
          ...result,
          cleanup,
          heartbeatsReceived: record?.heartbeatsReceived ?? 0,
          zeroChannels: peer.records.every(record =>
            record.channels.every(channel => channel === 0),
          ),
          peerCloseConfirmed: record?.closeConfirmed ?? false,
        };
        reports.push(report);
        console.log(mode, JSON.stringify(report));
      } finally {
        await peer.close();
      }
    }
    const installed = JSON.parse(
      await readFile(
        join(__dirname, "../../node_modules/amqplib/package.json"),
        "utf8",
      ),
    );
    const report = {
      node: process.versions.node,
      client: installed.version,
      reports,
    };
    await writeFile(
      quick
        ? "out/4a2c-lifecycle-gate-quick.json"
        : "out/4a2c-lifecycle-gate.json",
      JSON.stringify(report, null, 2) + "\n",
    );
    const healthy = reports.find(row => row.mode === "ok" && !row.action);
    if (!quick)
      assert.ok(
        healthy.result.opened &&
          healthy.result.closeConfirmed &&
          healthy.heartbeatsReceived >= 2,
      );
    assert.ok(reports.every(row => row.cleanup && row.zeroChannels));
    if (!quick)
      assert.ok(
        reports
          .find(row => row.mode === "heartbeatLost")
          .result.events.includes("model-error"),
      );
    assert.ok(
      reports.every(row => row.code === 0),
      "Public API lifecycle gate failed: child process exited abnormally",
    );
    for (const row of reports) {
      assert.ok(
        row.elapsedMs <
          (row.mode === "heartbeatLost"
            ? 39000
            : row.mode === "ok" && !row.action
              ? 27000
              : 5000),
        "Client kept resources alive beyond the scenario budget",
      );
      if (["earlyClose", "earlyNormalClose", "earlyInvalid"].includes(row.mode))
        assert.equal(row.result.opened, false);
      if (row.action === "closeInCallback")
        assert.equal(row.result.closeConfirmed, true);
      if (row.action?.startsWith("abort"))
        assert.equal(row.result.closeConfirmed, false);
    }
  } finally {
    await fixture.cleanup();
  }
}
if (process.argv.includes("--client")) {
  void client();
} else {
  run().catch(error => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
