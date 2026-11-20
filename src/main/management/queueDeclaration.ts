import type { HttpsProbeInput } from "../connections/httpsProbe";
import {
  isQueueDeclaration,
  MANAGEMENT_TIMEOUT_MS,
} from "../../shared/management";
import {
  MAX_QUEUE_DECLARATION_BODY,
  QUEUE_DECLARATION_TIMEOUT_MS,
  QUEUE_OPTION_KEYS,
  type QueueDeclaration,
} from "../../shared/queues";
import { parseQueueBody, queueItemPath } from "./queueRead";
import {
  decodeManagementJson,
  isManagementJson,
  managementDepthOk,
  ManagementFailure,
  requestManagement,
} from "./httpsTransport";

export type DeclarationPhase = "unsent" | "sent" | "accepted";

export async function declareQueue(
  profile: HttpsProbeInput,
  vhost: string,
  declaration: QueueDeclaration,
  signal: AbortSignal,
  onPhase: (phase: DeclarationPhase) => void,
  assertContext: () => Promise<void>,
): Promise<"confirmed" | "divergent"> {
  if (!isQueueDeclaration(declaration))
    throw new ManagementFailure("VALIDATION");
  const path = queueItemPath(vhost, declaration.name);
  if (!path) throw new ManagementFailure("QUEUE_SEGMENT");
  const body = Buffer.from(
    JSON.stringify({
      durable: true,
      exclusive: false,
      auto_delete: false,
      arguments: { "x-queue-type": declaration.type, ...declaration.arguments },
    }),
  );
  if (body.length > MAX_QUEUE_DECLARATION_BODY)
    throw new ManagementFailure("LIMIT");
  const since = performance.now();
  await assertContext();
  const put = await requestManagement(
    profile,
    {
      method: "PUT",
      route: path,
      timeout: Math.max(
        1,
        QUEUE_DECLARATION_TIMEOUT_MS - (performance.now() - since),
      ),
      body,
      authorizeSend: assertContext,
      onSend: () => onPhase("sent"),
      checkResponse(status, headers) {
        if (status >= 300 && status < 400)
          throw new ManagementFailure("REDIRECT");
        if (status >= 500) throw new ManagementFailure("SERVER");
        if (status === 201 || status === 204) return;
        if (!isManagementJson(headers)) throw new ManagementFailure("RESPONSE");
      },
    },
    signal,
  );
  if ((put.status !== 201 && put.status !== 204) || put.bytes.length !== 0)
    throw declarationRejection(put);
  onPhase("accepted");
  await assertContext();
  const remaining = QUEUE_DECLARATION_TIMEOUT_MS - (performance.now() - since);
  if (remaining <= 0) throw new ManagementFailure("TIMEOUT");
  const query = new URLSearchParams({
    disable_stats: "true",
    columns: "name,vhost,type,durable,exclusive,auto_delete,arguments",
  });
  const { bytes } = await requestManagement(
    profile,
    {
      method: "GET",
      route: path + "?" + query,
      timeout: Math.min(MANAGEMENT_TIMEOUT_MS, remaining),
      checkResponse(status, headers) {
        if (status !== 200 || !isManagementJson(headers))
          throw new ManagementFailure("RESPONSE");
      },
    },
    signal,
  );
  const bodyValue = decodeManagementJson(bytes);
  if (!managementDepthOk(bodyValue)) throw new ManagementFailure("RESPONSE");
  let detail;
  try {
    detail = parseQueueBody(bodyValue, {
      kind: "queueDetail",
      vhost,
      name: declaration.name,
    });
  } catch {
    throw new ManagementFailure("RESPONSE");
  }
  if (detail.kind !== "queueDetail") throw new ManagementFailure("RESPONSE");
  const { queue } = detail;
  const args = queue.arguments;
  if (
    queue.type === undefined ||
    queue.durable === undefined ||
    queue.exclusive === undefined ||
    queue.autoDelete === undefined ||
    !args
  )
    throw new ManagementFailure("RESPONSE");
  return queue.type === declaration.type &&
    queue.durable &&
    !queue.exclusive &&
    !queue.autoDelete &&
    (args["x-queue-type"] === undefined ||
      args["x-queue-type"] === queue.type) &&
    QUEUE_OPTION_KEYS.every(key => args[key] === declaration.arguments[key])
    ? "confirmed"
    : "divergent";
}

function declarationRejection({
  status,
  bytes,
}: {
  status: number;
  bytes: Buffer;
}) {
  const data = decodeManagementJson(bytes);
  if (
    managementDepthOk(data) &&
    data &&
    typeof data === "object" &&
    "reason" in data &&
    typeof data.reason === "string" &&
    "error" in data
  ) {
    if (status === 400 && data.error === "bad_request") {
      if (data.reason.startsWith("inequivalent arg "))
        return new ManagementFailure("QUEUE_DECLARATION_CONFLICT");
      if (data.reason.startsWith("invalid arg "))
        return new ManagementFailure("QUEUE_DECLARATION_REFUSED");
    }
    if (
      status === 401 &&
      data.error === "not_authorised" &&
      ["Access refused.", "Not management user", "Not authorized"].includes(
        data.reason,
      )
    )
      return new ManagementFailure("DENIED");
  }
  return new ManagementFailure("RESPONSE");
}
