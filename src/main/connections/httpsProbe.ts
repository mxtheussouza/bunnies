import { Agent, request, type RequestOptions } from "node:https";
import type { ClientRequest, IncomingMessage } from "node:http";
import { checkServerIdentity } from "node:tls";
import { isUtf8 } from "node:buffer";
import {
  MAX_PROBE_BODY_BYTES,
  MAX_PROBE_HEADER_BYTES,
} from "../../shared/connections";
import { ProfileFailure } from "../profiles/errors";
import type { StoredTrust } from "../security/profileCa";
export type HttpsProbeInput = {
  httpsUrl: string;
  username: string;
  password: string;
  trust: StoredTrust;
};
function transportFailure(error: unknown): ProfileFailure {
  const code = (error as NodeJS.ErrnoException)?.code ?? "";
  if (code.startsWith("HPE_")) return new ProfileFailure("TEST_RESPONSE");
  if (
    /^(ERR_TLS_|ERR_SSL_|ERR_OSSL_|CERT_|UNABLE_TO_|DEPTH_ZERO_|SELF_SIGNED_)/.test(
      code,
    )
  )
    return new ProfileFailure("TEST_TLS");
  return new ProfileFailure("TEST_NETWORK");
}
function withinDepth(value: unknown): boolean {
  const stack = [{ value, depth: 1 }];
  while (stack.length) {
    const item = stack.pop()!;
    if (item.depth > 16) return false;
    if (item.value && typeof item.value === "object") {
      for (const value of Object.values(item.value))
        stack.push({ value, depth: item.depth + 1 });
    }
  }
  return true;
}
export function probeHttps(
  input: HttpsProbeInput,
  signal: AbortSignal,
): Promise<void> {
  if (
    input.username.includes(":") ||
    [input.username, input.password].some(
      value => Buffer.from(value, "utf8").toString("utf8") !== value,
    )
  )
    return Promise.reject(new ProfileFailure("TEST_CREDENTIAL_FORMAT"));
  const url = new URL(input.httpsUrl);
  if (
    url.protocol !== "https:" ||
    url.username ||
    url.password ||
    url.search ||
    url.hash
  )
    return Promise.reject(new ProfileFailure("VALIDATION"));
  url.pathname = url.pathname.replace(/\/+$/, "") + "/api/whoami";
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
    const finish = (error?: ProfileFailure) => {
      if (done) return;
      done = true;
      signal.removeEventListener("abort", abort);
      response?.destroy();
      pending?.destroy();
      agent.destroy();
      if (error) reject(error);
      else resolve();
    };
    const abort = () =>
      finish(
        signal.reason instanceof ProfileFailure
          ? signal.reason
          : new ProfileFailure("TEST_CANCELLED"),
      );
    signal.addEventListener("abort", abort, { once: true });
    if (signal.aborted) {
      abort();
      return;
    }
    const options: RequestOptions = {
      method: "GET",
      agent,
      rejectUnauthorized: true,
      minVersion: "TLSv1.2",
      checkServerIdentity,
      maxHeaderSize: MAX_PROBE_HEADER_BYTES,
      headers: {
        Accept: "application/json",
        "Accept-Encoding": "identity",
        Authorization:
          "Basic " +
          Buffer.from(input.username + ":" + input.password, "utf8").toString(
            "base64",
          ),
      },
    };
    try {
      pending = request(url, options, incoming => {
        response = incoming;
        const status = incoming.statusCode ?? 0;
        if (status >= 300 && status < 400) {
          finish(new ProfileFailure("TEST_REDIRECT"));
          return;
        }
        if (status === 401) {
          finish(new ProfileFailure("TEST_AUTH"));
          return;
        }
        if (status === 403) {
          finish(new ProfileFailure("TEST_FORBIDDEN"));
          return;
        }
        const encoding = incoming.headers["content-encoding"];
        if (
          status !== 200 ||
          !/^application\/json(?:\s*;.*)?$/i.test(
            incoming.headers["content-type"] ?? "",
          ) ||
          (encoding !== undefined &&
            encoding.toLowerCase().trim() !== "identity") ||
          Number(incoming.headers["content-length"] ?? 0) > MAX_PROBE_BODY_BYTES
        ) {
          finish(new ProfileFailure("TEST_RESPONSE"));
          return;
        }
        const chunks: Buffer[] = [];
        let size = 0;
        incoming.on("data", (chunk: Buffer) => {
          size += chunk.length;
          if (size > MAX_PROBE_BODY_BYTES) {
            finish(new ProfileFailure("TEST_RESPONSE"));
            return;
          }
          chunks.push(chunk);
        });
        incoming.on("aborted", () =>
          finish(new ProfileFailure("TEST_NETWORK")),
        );
        incoming.on("error", () => finish(new ProfileFailure("TEST_NETWORK")));
        incoming.on("end", () => {
          if (done) return;
          try {
            const bytes = Buffer.concat(chunks);
            if (!isUtf8(bytes)) throw new Error();
            const data: unknown = JSON.parse(bytes.toString("utf8"));
            if (
              !withinDepth(data) ||
              !data ||
              typeof data !== "object" ||
              Array.isArray(data) ||
              !("name" in data) ||
              data.name !== input.username
            )
              throw new Error();
            finish();
          } catch {
            finish(new ProfileFailure("TEST_RESPONSE"));
          }
        });
      });
      pending.on("error", error => finish(transportFailure(error)));
      pending.end();
    } catch (error) {
      finish(transportFailure(error));
    }
  });
}
