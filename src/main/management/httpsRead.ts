import type { HttpsProbeInput } from "../connections/httpsProbe";
import type { QueueDetail, QueuePage } from "../../shared/queues";
import {
  parseQueueBody,
  queuePath,
  queueRouteError,
  type QueueQuery,
} from "./queueRead";
import {
  boundedManagementText,
  MAX_VISIBLE_VHOSTS,
  MANAGEMENT_TIMEOUT_MS,
  type BrokerData,
  type VhostsData,
} from "../../shared/management";
import {
  decodeManagementJson,
  isManagementJson,
  managementDepthOk,
  ManagementFailure,
  requestManagement,
} from "./httpsTransport";
export { ManagementFailure } from "./httpsTransport";
type BrokerQuery = { kind: "broker" } | { kind: "vhosts"; vhost: string };
export type ManagementQuery = BrokerQuery | QueueQuery;
type ManagementData = BrokerData | VhostsData | QueuePage | QueueDetail;
export function parseManagementBody(
  value: unknown,
  query: ManagementQuery,
): ManagementData {
  if (!managementDepthOk(value)) throw new ManagementFailure("RESPONSE");
  if (query.kind === "queuePage" || query.kind === "queueDetail")
    return parseQueueBody(value, query);
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
export async function readManagement(
  input: HttpsProbeInput,
  query: ManagementQuery,
  signal: AbortSignal,
): Promise<ManagementData> {
  const routes = {
    broker: "/api/overview?columns=rabbitmq_version,management_version",
    vhosts: "/api/vhosts?disable_stats=true&columns=name&sort=name",
  };
  const isQueue = query.kind === "queuePage" || query.kind === "queueDetail";
  const routeError = isQueue ? queueRouteError(query) : undefined;
  if (routeError) throw new ManagementFailure(routeError);
  const route = isQueue ? queuePath(query) : routes[query.kind];
  if (!route) throw new ManagementFailure("VALIDATION");
  const { status, bytes } = await requestManagement(
    input,
    {
      method: "GET",
      route,
      timeout: MANAGEMENT_TIMEOUT_MS,
      checkResponse(status, headers) {
        if (status >= 300 && status < 400)
          throw new ManagementFailure("REDIRECT");
        if (status === 403) throw new ManagementFailure("DENIED");
        if (status === 404) throw new ManagementFailure("NOT_FOUND");
        if (status === 429) throw new ManagementFailure("RATE_LIMIT");
        if (status >= 500) throw new ManagementFailure("SERVER");
        if (
          (status !== 200 &&
            status !== 401 &&
            !(status === 400 && query.kind === "queuePage")) ||
          !isManagementJson(headers) ||
          (headers["content-encoding"] !== undefined &&
            headers["content-encoding"].toLowerCase().trim() !== "identity")
        )
          throw new ManagementFailure(status === 401 ? "AUTH" : "RESPONSE");
      },
    },
    signal,
  );
  try {
    const value = decodeManagementJson(bytes);
    if (status === 401) {
      const denied =
        value &&
        typeof value === "object" &&
        "reason" in value &&
        typeof value.reason === "string" &&
        [
          "Not management user",
          "Not administrator user",
          "Not monitoring user",
        ].includes(value.reason);
      throw new ManagementFailure(denied ? "DENIED" : "AUTH");
    }
    if (status === 400) {
      const outOfRange =
        managementDepthOk(value) &&
        value &&
        typeof value === "object" &&
        "reason" in value &&
        typeof value.reason === "string" &&
        value.reason.startsWith("Page out of range,");
      throw new ManagementFailure(outOfRange ? "QUEUE_PAGE" : "RESPONSE");
    }
    return parseManagementBody(value, query);
  } catch (error) {
    if (status === 401)
      throw new ManagementFailure(
        error instanceof ManagementFailure && error.code === "DENIED"
          ? "DENIED"
          : "AUTH",
      );
    throw error instanceof ManagementFailure
      ? error
      : new ManagementFailure("RESPONSE");
  }
}
