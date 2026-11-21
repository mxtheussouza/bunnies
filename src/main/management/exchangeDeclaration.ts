import type { ExchangeDeclaration } from "../../shared/exchanges";
import {
  isExchangeDeclaration,
  MANAGEMENT_TIMEOUT_MS,
} from "../../shared/management";
import { QUEUE_DECLARATION_TIMEOUT_MS } from "../../shared/queues";
import type { HttpsProbeInput } from "../connections/httpsProbe";
import { exchangePath } from "./exchangeRead";
import { parseManagementBody } from "./httpsRead";
import {
  decodeManagementJson,
  isManagementJson,
  ManagementFailure,
  requestManagement,
} from "./httpsTransport";
import { sendDeclaration, type DeclarationPhase } from "./sendDeclaration";

export async function declareExchange(
  profile: HttpsProbeInput,
  vhost: string,
  declaration: ExchangeDeclaration,
  signal: AbortSignal,
  onPhase: (phase: DeclarationPhase) => void,
  assertContext: () => Promise<void>,
): Promise<"confirmed" | "divergent"> {
  if (!isExchangeDeclaration(declaration))
    throw new ManagementFailure("VALIDATION");
  const query = {
    kind: "exchangeDetail" as const,
    vhost,
    name: declaration.name,
  };
  const route = exchangePath(query);
  const body = Buffer.from(
    JSON.stringify({
      type: declaration.type,
      durable: declaration.durable,
      auto_delete: declaration.autoDelete,
      internal: false,
      arguments: {},
    }),
  );
  const since = performance.now();
  await sendDeclaration(
    profile,
    "exchange",
    route.split("?")[0],
    body,
    signal,
    onPhase,
    assertContext,
    since,
  );
  await assertContext();
  const remaining = QUEUE_DECLARATION_TIMEOUT_MS - (performance.now() - since);
  if (remaining <= 0) throw new ManagementFailure("TIMEOUT");
  const response = await requestManagement(
    profile,
    {
      method: "GET",
      route,
      timeout: Math.min(MANAGEMENT_TIMEOUT_MS, remaining),
      checkResponse(status, headers) {
        if (status !== 200 || !isManagementJson(headers))
          throw new ManagementFailure("RESPONSE");
      },
    },
    signal,
  );
  const data = parseManagementBody(decodeManagementJson(response.bytes), query);
  if (data.kind !== "exchangeDetail" || data.exchange.argumentsJson == null)
    throw new ManagementFailure("RESPONSE");
  const row = data.exchange;
  return row.type === declaration.type &&
    row.durable === declaration.durable &&
    row.autoDelete === declaration.autoDelete &&
    !row.internal &&
    row.argumentsJson === "{}"
    ? "confirmed"
    : "divergent";
}
