import { isUtf8 } from "node:buffer";
import type {
  ClientRequest,
  IncomingHttpHeaders,
  IncomingMessage,
} from "node:http";
import { Agent, request } from "node:https";
import { checkServerIdentity, type TLSSocket } from "node:tls";
import type { HttpsProbeInput } from "../connections/httpsProbe";
import {
  MAX_MANAGEMENT_BODY,
  MAX_MANAGEMENT_HEADERS,
  type ManagementError,
} from "../../shared/management";

export class ManagementFailure extends Error {
  constructor(readonly code: ManagementError) {
    super(code);
  }
}

export function decodeManagementJson(bytes: Buffer): unknown {
  if (!isUtf8(bytes)) throw new ManagementFailure("RESPONSE");
  try {
    return JSON.parse(bytes.toString("utf8"));
  } catch {
    throw new ManagementFailure("RESPONSE");
  }
}

export function managementDepthOk(value: unknown): boolean {
  const stack = [{ value, depth: 1 }];
  while (stack.length) {
    const item = stack.pop()!;
    if (item.depth > 16) return false;
    if (item.value && typeof item.value === "object")
      for (const value of Object.values(item.value))
        stack.push({ value, depth: item.depth + 1 });
  }
  return true;
}

export const isManagementJson = (headers: IncomingHttpHeaders) =>
  /^application\/json(?:\s*;.*)?$/i.test(headers["content-type"] ?? "");

function networkFailure(error: unknown): ManagementFailure {
  const code = (error as NodeJS.ErrnoException)?.code ?? "";
  if (code === "HPE_HEADER_OVERFLOW") return new ManagementFailure("LIMIT");
  if (code.startsWith("HPE_")) return new ManagementFailure("RESPONSE");
  if (
    /^(ERR_TLS_|ERR_SSL_|ERR_OSSL_|CERT_|UNABLE_TO_|DEPTH_ZERO_|SELF_SIGNED_)/.test(
      code,
    )
  )
    return new ManagementFailure("TLS");
  return new ManagementFailure("NETWORK");
}

type RequestOptions = {
  route: string;
  timeout: number;
  checkResponse(status: number, headers: IncomingHttpHeaders): void;
} & (
  | { method: "GET" }
  | (({ method: "PUT"; body: Buffer } | { method: "DELETE" }) & {
      authorizeSend(): Promise<void>;
      onSend(): void;
    })
);

export async function requestManagement(
  input: HttpsProbeInput,
  options: RequestOptions,
  signal: AbortSignal,
): Promise<{ status: number; bytes: Buffer }> {
  if (
    input.username.includes(":") ||
    [input.username, input.password].some(
      value => Buffer.from(value, "utf8").toString("utf8") !== value,
    )
  )
    throw new ManagementFailure("CREDENTIALS");
  let url: URL;
  try {
    url = new URL(input.httpsUrl);
  } catch {
    throw new ManagementFailure("VALIDATION");
  }
  if (
    url.protocol !== "https:" ||
    url.username ||
    url.password ||
    url.search ||
    url.hash
  )
    throw new ManagementFailure("VALIDATION");
  const path = url.pathname.replace(/\/+$/, "") + options.route;
  const agent = new Agent({
    keepAlive: false,
    maxSockets: 1,
    maxCachedSessions: 0,
    proxyEnv: {},
    rejectUnauthorized: true,
    minVersion: "TLSv1.2",
    ...(input.trust.mode === "custom" ? { ca: input.trust.pem } : {}),
  });

  return new Promise((resolve, reject) => {
    let pending: ClientRequest | undefined;
    let response: IncomingMessage | undefined;
    let done = false;
    function clean() {
      if (done) return false;
      done = true;
      clearTimeout(timer);
      signal.removeEventListener("abort", abort);
      response?.destroy();
      pending?.destroy();
      agent.destroy();
      return true;
    }
    function fail(error: ManagementFailure) {
      if (clean()) reject(error);
    }
    const abort = () =>
      fail(
        signal.reason instanceof ManagementFailure
          ? signal.reason
          : new ManagementFailure("CANCELLED"),
      );
    const timer = setTimeout(
      () => fail(new ManagementFailure("TIMEOUT")),
      options.timeout,
    );
    signal.addEventListener("abort", abort, { once: true });
    if (signal.aborted) {
      abort();
      return;
    }
    try {
      const req = request(
        url,
        {
          method: options.method,
          path,
          agent,
          rejectUnauthorized: true,
          minVersion: "TLSv1.2",
          checkServerIdentity,
          maxHeaderSize: MAX_MANAGEMENT_HEADERS,
          headers: {
            Accept: options.method === "DELETE" ? "*/*" : "application/json",
            "Accept-Encoding": "identity",
            Authorization:
              "Basic " +
              Buffer.from(
                input.username + ":" + input.password,
                "utf8",
              ).toString("base64"),
            ...(options.method === "PUT"
              ? {
                  "Content-Type": "application/json",
                  "Content-Length": options.body.length,
                }
              : {}),
          },
        },
        incoming => {
          response = incoming;
          const status = incoming.statusCode ?? 0;
          try {
            options.checkResponse(status, incoming.headers);
            if (
              Number(incoming.headers["content-length"] ?? 0) >
              MAX_MANAGEMENT_BODY
            )
              throw new ManagementFailure("LIMIT");
            const encoding = incoming.headers["content-encoding"];
            if (
              encoding !== undefined &&
              encoding.toLowerCase().trim() !== "identity"
            )
              throw new ManagementFailure("RESPONSE");
          } catch (error) {
            fail(
              error instanceof ManagementFailure
                ? error
                : new ManagementFailure("INTERNAL"),
            );
            return;
          }
          const chunks: Buffer[] = [];
          let size = 0;
          incoming.on("data", (chunk: Buffer) => {
            size += chunk.length;
            if (size > MAX_MANAGEMENT_BODY)
              fail(new ManagementFailure("LIMIT"));
            else chunks.push(chunk);
          });
          incoming.on("aborted", () => fail(new ManagementFailure("NETWORK")));
          incoming.on("error", () => fail(new ManagementFailure("NETWORK")));
          incoming.on("end", () => {
            if (clean())
              resolve({ status, bytes: Buffer.concat(chunks, size) });
          });
        },
      );
      pending = req;
      req.on("error", error => fail(networkFailure(error)));
      if (options.method === "GET") req.end();
      else {
        // A fresh TLS socket sends the write only after certificate validation.
        req.once("socket", (socket: TLSSocket) => {
          socket.once("secureConnect", () => {
            if (done || signal.aborted) return;
            void options
              .authorizeSend()
              .then(() => {
                if (done || signal.aborted) return;
                options.onSend();
                if (options.method === "PUT") req.end(options.body);
                else req.end();
              })
              .catch(error =>
                fail(
                  error instanceof ManagementFailure
                    ? error
                    : new ManagementFailure("INTERNAL"),
                ),
              );
          });
        });
      }
    } catch {
      fail(new ManagementFailure("INTERNAL"));
    }
  });
}
