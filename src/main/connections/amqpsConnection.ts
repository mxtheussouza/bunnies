import { Socket } from "node:net";
import { checkServerIdentity } from "node:tls";
import { setImmediate, clearImmediate } from "node:timers";
import { connect, type Connection } from "amqplib/callback_api";
import {
  AMQPS_CLOSE_TIMEOUT_MS,
  AMQPS_FRAME_MAX,
  AMQPS_HEARTBEAT,
} from "../../shared/connections";
import { parseAmqpsEndpoint } from "../../shared/amqpsEndpoint";
import type { ProfileErrorCode } from "../../shared/profiles";
import { ProfileFailure } from "../profiles/errors";
import type { StoredTrust } from "../security/profileCa";
export type AmqpsInput = {
  amqpsUrl: string;
  username: string;
  password: string;
  trust: StoredTrust;
};
export type AmqpsEvent =
  | { kind: "flow"; blocked: boolean }
  | { kind: "closed"; code: ProfileErrorCode };
export type AmqpsConnection = {
  vhost: string;
  flow: "unknown" | "blocked" | "unblocked";
  close(): Promise<boolean>;
  destroy(): void;
};
function failure(error: unknown, established: boolean): ProfileFailure {
  const code = (error as NodeJS.ErrnoException)?.code ?? "";
  if (
    /^(ERR_TLS_|ERR_SSL_|ERR_OSSL_|CERT_|UNABLE_TO_|DEPTH_ZERO_|SELF_SIGNED_)/.test(
      code,
    )
  )
    return new ProfileFailure("TEST_TLS");
  if (/^(EAI_|ENOTFOUND|ECONN|EHOST|ENET|EADDR|ETIMEDOUT)/.test(code))
    return new ProfileFailure("AMQP_NETWORK");
  if (
    Number(code) === 403 ||
    Number(code) === 530 ||
    (error instanceof Error &&
      (error.message.startsWith("Handshake terminated by server:") ||
        error.message.startsWith(
          "Expected ConnectionOpenOk; got <ConnectionClose",
        )))
  )
    return new ProfileFailure("AMQP_REFUSED");
  if (
    established &&
    error instanceof Error &&
    ["Heartbeat timeout", "Unexpected close"].includes(error.message)
  )
    return new ProfileFailure("AMQP_NETWORK");
  return new ProfileFailure("AMQP_PROTOCOL");
}
export function openAmqpsConnection(
  input: AmqpsInput,
  signal: AbortSignal,
  onEvent: (e: AmqpsEvent) => void = () => undefined,
): Promise<AmqpsConnection> {
  const endpoint = parseAmqpsEndpoint(input.amqpsUrl);
  if (!endpoint) return Promise.reject(new ProfileFailure("AMQP_ENDPOINT"));
  if (
    [input.username, input.password].some(
      v => v.includes("\0") || Buffer.from(v).toString("utf8") !== v,
    )
  )
    return Promise.reject(new ProfileFailure("AMQP_CREDENTIAL_FORMAT"));
  return new Promise((resolve, reject) => {
    const socket = new Socket();
    let model: Connection | undefined,
      opened = false,
      done = false,
      closing = false;
    let immediate: ReturnType<typeof setImmediate> | undefined,
      timer: ReturnType<typeof setTimeout> | undefined;
    let completeClose: ((confirmed: boolean) => void) | undefined,
      closeResult: Promise<boolean> | undefined;
    const release = () => {
      done = true;
      clearImmediate(immediate);
      clearTimeout(timer);
      signal.removeEventListener("abort", abort);
      socket.removeListener("connect", startTls);
      socket.destroy(new Error("AMQP resources released"));
    };
    const fail = (error: ProfileFailure) => {
      if (done) return;
      release();
      completeClose?.(false);
      if (!opened) reject(error);
      else if (!closing) onEvent({ kind: "closed", code: error.code });
    };
    const abort = () =>
      fail(
        signal.reason instanceof ProfileFailure
          ? signal.reason
          : new ProfileFailure("AMQP_CANCELLED"),
      );
    const onError = (error: Error) => fail(failure(error, opened));
    const onClosed = () => fail(new ProfileFailure("AMQP_NETWORK"));
    const onBlocked = () => {
      handle.flow = "blocked";
      if (opened && !done) onEvent({ kind: "flow", blocked: true });
    };
    const onUnblocked = () => {
      handle.flow = "unblocked";
      if (opened && !done) onEvent({ kind: "flow", blocked: false });
    };
    const handle: AmqpsConnection = {
      vhost: endpoint.vhost,
      flow: "unknown",
      destroy: () => fail(new ProfileFailure("AMQP_CANCELLED")),
      close() {
        if (closeResult) return closeResult;
        if (done || !model) return Promise.resolve(false);
        closing = true;
        closeResult = new Promise<boolean>(complete => {
          completeClose = complete;
          timer = setTimeout(() => {
            release();
            complete(false);
          }, AMQPS_CLOSE_TIMEOUT_MS);
          timer.unref();
          let requested = false;
          try {
            model!.close(error => {
              const confirmed = !error && requested;
              release();
              complete(confirmed);
            });
            requested = true;
          } catch {
            release();
            complete(false);
          }
        });
        return closeResult;
      },
    };
    socket.on("error", onError);
    socket.once("close", () => {
      onClosed();
      socket.removeListener("error", onError);
    });
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
              fail(failure(error, false));
              return;
            }
            model = connection;
            model.on("error", onError);
            model.on("close", onClosed);
            model.on("blocked", onBlocked);
            model.on("unblocked", onUnblocked);
            model.once("close", () => {
              model?.removeListener("error", onError);
              model?.removeListener("close", onClosed);
              model?.removeListener("blocked", onBlocked);
              model?.removeListener("unblocked", onUnblocked);
            });
            if (done) {
              socket.destroy(new Error("AMQP resources released"));
              return;
            }
            // Queued after the ADR-0008 initial loop; reject early frames before ready.
            immediate = setImmediate(() => {
              if (done) return;
              if (signal.aborted) {
                abort();
                return;
              }
              if (socket.destroyed) {
                onClosed();
                return;
              }
              opened = true;
              resolve(handle);
            });
          },
        );
      } catch (error) {
        fail(failure(error, false));
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
      fail(failure(error, false));
    }
  });
}
