import { Agent, request } from "node:https";
import type { ClientRequest, IncomingMessage } from "node:http";
import { checkServerIdentity } from "node:tls";
import { isUtf8 } from "node:buffer";
import type { HttpsProbeInput } from "../connections/httpsProbe";
import {
  boundedManagementText,
  MAX_MANAGEMENT_BODY,
  MAX_MANAGEMENT_HEADERS,
  MAX_VISIBLE_VHOSTS,
  MANAGEMENT_TIMEOUT_MS,
  type BrokerData,
  type VhostsData,
  type ManagementError,
} from "../../shared/management";
export class ManagementFailure extends Error {
  constructor(readonly code: ManagementError) {
    super(code);
  }
}
export type ManagementQuery =
  { kind: "broker" } | { kind: "vhosts"; vhost: string };
function depthOk(value: unknown) {
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
export function parseManagementBody(
  value: unknown,
  query: ManagementQuery,
): BrokerData | VhostsData {
  if (!depthOk(value)) throw new ManagementFailure("RESPONSE");
  if (query.kind === "broker") {
    if (!value || typeof value !== "object" || Array.isArray(value))
      throw new ManagementFailure("RESPONSE");
    const data = value as Record<string, unknown>,
      result: BrokerData = { kind: "broker", matrix: "unknown" };
    for (const [field, key] of [
      ["rabbitmq_version", "rabbitmqVersion"],
      ["management_version", "managementVersion"],
    ] as const) {
      if (!Object.hasOwn(data, field)) continue;
      if (!boundedManagementText(data[field], 128))
        throw new ManagementFailure("RESPONSE");
      result[key] = data[field];
    }
    if (result.rabbitmqVersion)
      result.matrix = /^4\.(3|4)\.\d+$/.test(result.rabbitmqVersion)
        ? "reference"
        : "outside";
    return result;
  }
  if (!Array.isArray(value)) throw new ManagementFailure("RESPONSE");
  if (value.length > MAX_VISIBLE_VHOSTS) throw new ManagementFailure("LIMIT");
  const names = value.map(item => {
    if (
      !item ||
      typeof item !== "object" ||
      Array.isArray(item) ||
      !boundedManagementText(item.name, 255)
    )
      throw new ManagementFailure("RESPONSE");
    return item.name as string;
  });
  if (
    new Set(names).size !== names.length ||
    !boundedManagementText(query.vhost, 255)
  )
    throw new ManagementFailure("RESPONSE");
  return {
    kind: "vhosts",
    names,
    currentVhost: query.vhost,
    currentVisible: names.includes(query.vhost),
  };
}
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
export async function readManagement(
  input: HttpsProbeInput,
  query: ManagementQuery,
  signal: AbortSignal,
): Promise<BrokerData | VhostsData> {
  if (
    input.username.includes(":") ||
    [input.username, input.password].some(
      v => Buffer.from(v, "utf8").toString("utf8") !== v,
    )
  )
    throw new ManagementFailure("CREDENTIALS");
  const url = new URL(input.httpsUrl);
  if (
    url.protocol !== "https:" ||
    url.username ||
    url.password ||
    url.search ||
    url.hash
  )
    throw new ManagementFailure("VALIDATION");
  const routes = {
    broker: "/api/overview?columns=rabbitmq_version,management_version",
    vhosts: "/api/vhosts?disable_stats=true&columns=name&sort=name",
  };
  const path = url.pathname.replace(/\/+$/, "") + routes[query.kind];
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
    let pending: ClientRequest | undefined,
      response: IncomingMessage | undefined,
      done = false;
    const finish = (
      error?: ManagementFailure,
      data?: BrokerData | VhostsData,
    ) => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      signal.removeEventListener("abort", abort);
      response?.destroy();
      pending?.destroy();
      agent.destroy();
      if (error) reject(error);
      else resolve(data!);
    };
    const abort = () =>
      finish(
        signal.reason instanceof ManagementFailure
          ? signal.reason
          : new ManagementFailure("CANCELLED"),
      );
    const timer = setTimeout(
      () => finish(new ManagementFailure("TIMEOUT")),
      MANAGEMENT_TIMEOUT_MS,
    );
    signal.addEventListener("abort", abort, { once: true });
    if (signal.aborted) {
      abort();
      return;
    }
    try {
      pending = request(
        url,
        {
          method: "GET",
          path,
          agent,
          rejectUnauthorized: true,
          minVersion: "TLSv1.2",
          checkServerIdentity,
          maxHeaderSize: MAX_MANAGEMENT_HEADERS,
          headers: {
            Accept: "application/json",
            "Accept-Encoding": "identity",
            Authorization:
              "Basic " +
              Buffer.from(
                input.username + ":" + input.password,
                "utf8",
              ).toString("base64"),
          },
        },
        incoming => {
          response = incoming;
          const status = incoming.statusCode ?? 0;
          if (status >= 300 && status < 400) {
            finish(new ManagementFailure("REDIRECT"));
            return;
          }
          if (status === 403) {
            finish(new ManagementFailure("DENIED"));
            return;
          }
          if (status === 404) {
            finish(new ManagementFailure("NOT_FOUND"));
            return;
          }
          if (status === 429) {
            finish(new ManagementFailure("RATE_LIMIT"));
            return;
          }
          if (status >= 500) {
            finish(new ManagementFailure("SERVER"));
            return;
          }
          if (
            Number(incoming.headers["content-length"] ?? 0) >
            MAX_MANAGEMENT_BODY
          ) {
            finish(new ManagementFailure("LIMIT"));
            return;
          }
          const encoding = incoming.headers["content-encoding"];
          if (
            (status !== 200 && status !== 401) ||
            !/^application\/json(?:\s*;.*)?$/i.test(
              incoming.headers["content-type"] ?? "",
            ) ||
            (encoding !== undefined &&
              encoding.toLowerCase().trim() !== "identity")
          ) {
            finish(new ManagementFailure(status === 401 ? "AUTH" : "RESPONSE"));
            return;
          }
          const chunks: Buffer[] = [];
          let size = 0;
          incoming.on("data", (chunk: Buffer) => {
            size += chunk.length;
            if (size > MAX_MANAGEMENT_BODY)
              finish(new ManagementFailure("LIMIT"));
            else chunks.push(chunk);
          });
          incoming.on("aborted", () =>
            finish(new ManagementFailure("NETWORK")),
          );
          incoming.on("error", () => finish(new ManagementFailure("NETWORK")));
          incoming.on("end", () => {
            if (done) return;
            try {
              const bytes = Buffer.concat(chunks);
              if (!isUtf8(bytes)) throw new ManagementFailure("RESPONSE");
              const value = JSON.parse(bytes.toString("utf8"));
              if (status === 401) {
                const denied =
                  value &&
                  [
                    "Not management user",
                    "Not administrator user",
                    "Not monitoring user",
                  ].includes(value.reason);
                finish(new ManagementFailure(denied ? "DENIED" : "AUTH"));
                return;
              }
              finish(undefined, parseManagementBody(value, query));
            } catch (error) {
              finish(
                error instanceof ManagementFailure
                  ? error
                  : new ManagementFailure(status === 401 ? "AUTH" : "RESPONSE"),
              );
            }
          });
        },
      );
      pending.on("error", error => finish(networkFailure(error)));
      pending.end();
    } catch {
      finish(new ManagementFailure("INTERNAL"));
    }
  });
}
