import { Socket } from "node:net";
import { checkServerIdentity } from "node:tls";
import { connect, type Connection } from "amqplib/callback_api";
import {
  AMQPS_CLOSE_TIMEOUT_MS,
  AMQPS_FRAME_MAX,
  AMQPS_HEARTBEAT,
} from "../../shared/connections";
import { parseAmqpsEndpoint } from "../../shared/amqpsEndpoint";
import { ProfileFailure } from "../profiles/errors";
import type { StoredTrust } from "../security/profileCa";

type Input = {
  amqpsUrl: string;
  username: string;
  password: string;
  trust: StoredTrust;
};

function failure(error: unknown): ProfileFailure {
  const code = (error as NodeJS.ErrnoException)?.code ?? "";
  if (
    /^(ERR_TLS_|ERR_SSL_|ERR_OSSL_|CERT_|UNABLE_TO_|DEPTH_ZERO_|SELF_SIGNED_)/.test(
      code,
    )
  )
    return new ProfileFailure("TEST_TLS");
  if (/^(EAI_|ENOTFOUND|ECONN|EHOST|ENET|EADDR|ETIMEDOUT)/.test(code))
    return new ProfileFailure("AMQP_NETWORK");
  // Pinned amqplib wraps ConnectionClose at these two handshake stages. Only
  // identify its envelope; never interpret or expose the broker's replyText.
  if (
    error instanceof Error &&
    (error.message.startsWith("Handshake terminated by server:") ||
      error.message.startsWith(
        "Expected ConnectionOpenOk; got <ConnectionClose",
      ))
  )
    return new ProfileFailure("AMQP_REFUSED");
  return new ProfileFailure("AMQP_PROTOCOL");
}

export function probeAmqps(input: Input, signal: AbortSignal): Promise<string> {
  const endpoint = parseAmqpsEndpoint(input.amqpsUrl);
  if (!endpoint) return Promise.reject(new ProfileFailure("AMQP_ENDPOINT"));
  if (
    [input.username, input.password].some(
      value =>
        value.includes("\0") ||
        Buffer.from(value, "utf8").toString("utf8") !== value,
    )
  )
    return Promise.reject(new ProfileFailure("AMQP_CREDENTIAL_FORMAT"));
  return new Promise((resolve, reject) => {
    const socket = new Socket();
    let model: Connection | undefined;
    let closeTimer: ReturnType<typeof setTimeout> | undefined;
    let done = false;
    let closing = false;
    const finish = (error?: ProfileFailure) => {
      if (done) return;
      done = true;
      clearTimeout(closeTimer);
      signal.removeEventListener("abort", abort);
      socket.removeListener("connect", startTls);
      socket.destroy();
      if (error) reject(error);
      else resolve(endpoint.vhost);
    };
    const abort = () =>
      finish(
        signal.reason instanceof ProfileFailure
          ? signal.reason
          : new ProfileFailure("AMQP_CANCELLED"),
      );
    const onError = (error: Error) =>
      finish(closing ? new ProfileFailure("AMQP_CLOSE") : failure(error));
    socket.on("error", onError);
    socket.once("close", () => socket.removeListener("error", onError));
    const startTls = () => {
      if (done) return;
      try {
        connect(
          {
            protocol: "amqps",
            hostname: endpoint.hostname,
            port: endpoint.port,
            username: input.username,
            password: input.password,
            vhost: encodeURIComponent(endpoint.vhost),
            heartbeat: AMQPS_HEARTBEAT,
            frameMax: AMQPS_FRAME_MAX,
            channelMax: 1,
          },
          {
            socket,
            rejectUnauthorized: true,
            minVersion: "TLSv1.2",
            checkServerIdentity,
            noDelay: true,
            ...(input.trust.mode === "custom" ? { ca: input.trust.pem } : {}),
          },
          (error, connection) => {
            if (error) {
              finish(failure(error));
              return;
            }
            model = connection;
            model.on("error", onError);
            const onBlocked = () => finish(new ProfileFailure("AMQP_CLOSE"));
            model.on("blocked", onBlocked);
            model.once("close", () => {
              connection.removeListener("error", onError);
              connection.removeListener("blocked", onBlocked);
            });
            if (done) {
              try {
                model.close(() => undefined);
              } catch {
                /* Already closed. */
              }
              return;
            }
            closing = true;
            closeTimer = setTimeout(
              () => finish(new ProfileFailure("AMQP_CLOSE")),
              AMQPS_CLOSE_TIMEOUT_MS,
            );
            closeTimer.unref();
            // The pinned client's blocked shortcut invokes close's callback
            // synchronously without CloseOk. Only accept an asynchronous ack.
            let closeRequested = false;
            try {
              model.close(error =>
                finish(
                  error || !closeRequested
                    ? new ProfileFailure("AMQP_CLOSE")
                    : undefined,
                ),
              );
              closeRequested = true;
            } catch {
              finish(new ProfileFailure("AMQP_CLOSE"));
            }
          },
        );
      } catch (error) {
        finish(failure(error));
      }
    };
    signal.addEventListener("abort", abort, { once: true });
    if (signal.aborted) {
      abort();
      return;
    }
    socket.once("connect", startTls);
    try {
      socket.connect(endpoint.port, endpoint.hostname);
    } catch (error) {
      finish(failure(error));
    }
  });
}
