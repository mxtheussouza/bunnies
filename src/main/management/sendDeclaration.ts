import type { HttpsProbeInput } from "../connections/httpsProbe";
import {
  MAX_QUEUE_DECLARATION_BODY,
  QUEUE_DECLARATION_TIMEOUT_MS,
} from "../../shared/queues";
import {
  decodeManagementJson,
  isManagementJson,
  managementDepthOk,
  ManagementFailure,
  requestManagement,
} from "./httpsTransport";

export type DeclarationPhase = "unsent" | "sent" | "accepted";
export async function sendDeclaration(
  profile: HttpsProbeInput,
  resource: "queue" | "exchange",
  path: string,
  body: Buffer,
  signal: AbortSignal,
  onPhase: (phase: DeclarationPhase) => void,
  assertContext: () => Promise<void>,
  since: number,
): Promise<void> {
  if (body.length > MAX_QUEUE_DECLARATION_BODY)
    throw new ManagementFailure("LIMIT");
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
    throw declarationRejection(put, resource);
  onPhase("accepted");
}

function declarationRejection(
  {
    status,
    bytes,
  }: {
    status: number;
    bytes: Buffer;
  },
  resource: "queue" | "exchange",
) {
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
        return new ManagementFailure(
          resource === "queue"
            ? "QUEUE_DECLARATION_CONFLICT"
            : "EXCHANGE_DECLARATION_CONFLICT",
        );
      if (data.reason.startsWith("invalid arg "))
        return new ManagementFailure(
          resource === "queue"
            ? "QUEUE_DECLARATION_REFUSED"
            : "EXCHANGE_DECLARATION_REFUSED",
        );
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
