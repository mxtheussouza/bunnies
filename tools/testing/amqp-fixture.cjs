const { createServer } = require("node:tls");
const { once } = require("node:events");
// Minimal scripted connection handshake only. This fixture is not a RabbitMQ
// broker, never routes/consumes messages, and is excluded from the application.
const short = value => {
  const bytes = Buffer.from(value);
  return Buffer.concat([Buffer.from([bytes.length]), bytes]);
};
const long = value => {
  const bytes = Buffer.from(value),
    length = Buffer.alloc(4);
  length.writeUInt32BE(bytes.length);
  return Buffer.concat([length, bytes]);
};
function method(id, ...fields) {
  const ids = Buffer.alloc(4);
  ids.writeUInt16BE(10);
  ids.writeUInt16BE(id, 2);
  const payload = Buffer.concat([ids, ...fields]),
    head = Buffer.alloc(7);
  head[0] = 1;
  head.writeUInt32BE(payload.length, 3);
  return Buffer.concat([head, payload, Buffer.from([0xce])]);
}
function refusal(code) {
  const number = Buffer.alloc(2);
  number.writeUInt16BE(code);
  return method(
    50,
    number,
    short("SYNTHETIC-UNTRUSTED-BROKER-DETAIL"),
    Buffer.alloc(4),
  );
}
async function createAmqpPeer(fixture, options = {}) {
  const sockets = new Set(),
    records = [];
  let attempts = 0;
  const server = createServer(
    { key: fixture.key, cert: options.cert || fixture.cert },
    socket => {
      const record = {
        methods: [],
        channels: [],
        vhost: null,
        credentials: null,
        tune: null,
        closeConfirmed: false,
      };
      records.push(record);
      let pending = Buffer.alloc(0),
        header = false;
      socket.on("error", () => undefined);
      socket.on("data", chunk => {
        pending = Buffer.concat([pending, chunk]);
        if (!header) {
          if (pending.length < 8) return;
          if (
            !pending
              .subarray(0, 8)
              .equals(Buffer.from([65, 77, 81, 80, 0, 0, 9, 1]))
          ) {
            socket.destroy();
            return;
          }
          pending = pending.subarray(8);
          header = true;
          if (peer.mode === "stallStart") return;
          if (peer.mode === "protocol") {
            socket.end("HTTP/1.1 200 OK\r\n\r\n");
            return;
          }
          if (peer.mode === "oversize") {
            const head = Buffer.alloc(7);
            head[0] = 1;
            head.writeUInt32BE(5000, 3);
            socket.write(
              Buffer.concat([head, Buffer.alloc(5000), Buffer.from([0xce])]),
            );
            return;
          }
          socket.write(
            method(
              10,
              Buffer.from([0, 9]),
              Buffer.alloc(4),
              long("PLAIN"),
              long("en_US"),
            ),
          );
        }
        while (pending.length >= 7) {
          const length = pending.readUInt32BE(3);
          if (length > 16384) {
            socket.destroy();
            return;
          }
          if (pending.length < length + 8) return;
          const frame = pending.subarray(0, length + 8);
          pending = pending.subarray(length + 8);
          if (frame[0] === 8) continue;
          if (frame[0] !== 1 || length < 4 || frame[length + 7] !== 0xce) {
            socket.destroy();
            return;
          }
          const channel = frame.readUInt16BE(1),
            classId = frame.readUInt16BE(7),
            id = frame.readUInt16BE(9),
            data = frame.subarray(11, length + 7);
          record.channels.push(channel);
          record.methods.push(`${classId}.${id}`);
          if (channel !== 0 || classId !== 10) {
            socket.destroy();
            return;
          }
          if (id === 11) {
            let offset = 4 + data.readUInt32BE(0);
            const size = data[offset++];
            const mechanism = data.subarray(offset, offset + size).toString();
            offset += size;
            const responseSize = data.readUInt32BE(offset);
            offset += 4;
            record.credentials = {
              mechanism,
              response: data.subarray(offset, offset + responseSize).toString(),
            };
            if (peer.mode === "refuseAuth") {
              socket.write(refusal(403));
              return;
            }
            if (peer.mode === "stallTune") return;
            const tune = Buffer.alloc(8);
            tune.writeUInt16BE(32);
            tune.writeUInt32BE(131072, 2);
            tune.writeUInt16BE(60, 6);
            socket.write(method(30, tune));
          } else if (id === 31) {
            record.tune = {
              channelMax: data.readUInt16BE(0),
              frameMax: data.readUInt32BE(2),
              heartbeat: data.readUInt16BE(6),
            };
          } else if (id === 40) {
            record.vhost = data.subarray(1, 1 + data[0]).toString();
            if (peer.mode === "refuseVhost") {
              socket.write(refusal(530));
              return;
            }
            socket.write(
              peer.mode === "blocked"
                ? Buffer.concat([
                    method(41, short("")),
                    method(60, short("synthetic blocked")),
                  ])
                : method(41, short("")),
            );
          } else if (id === 50) {
            if (peer.mode === "stallClose") return;
            record.closeConfirmed = true;
            socket.end(method(51));
          } else if (id === 51) socket.end();
          else {
            socket.destroy();
            return;
          }
        }
      });
    },
  );
  server.on("tlsClientError", () => undefined);
  server.on("connection", socket => {
    attempts++;
    sockets.add(socket);
    socket.once("close", () => sockets.delete(socket));
  });
  const peer = {
    mode: options.mode || "ok",
    records,
    sockets,
    get attempts() {
      return attempts;
    },
    url: "",
    port: 0,
    async close() {
      for (const socket of sockets) socket.destroy();
      await new Promise(resolve => server.close(resolve));
    },
  };
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  peer.port = server.address().port;
  peer.url = `amqps://127.0.0.1:${peer.port}`;
  return peer;
}
module.exports = { createAmqpPeer };
