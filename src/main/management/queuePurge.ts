import type { HttpsProbeInput } from "../connections/httpsProbe";
import { readManagement } from "./httpsRead";
import {
  decodeManagementJson,
  isManagementJson,
  managementDepthOk,
  ManagementFailure,
  requestManagement,
} from "./httpsTransport";
import { queueItemPath } from "./queueRead";

export const QUEUE_PURGE_TIMEOUT_MS = 30_000;

export async function inspectPurgeQueue(
  profile: HttpsProbeInput,
  vhost: string,
  name: string,
  signal: AbortSignal,
): Promise<"classic" | "quorum"> {
  const detail = await readManagement(
    profile,
    { kind: "queueDetail", vhost, name },
    signal,
  );
  if (detail.kind !== "queueDetail") throw new ManagementFailure("RESPONSE");
  const { type } = detail.queue;
  if (type !== "classic" && type !== "quorum")
    throw new ManagementFailure("QUEUE_PURGE_TYPE");
  return type;
}

export async function purgeQueue(
  profile: HttpsProbeInput,
  vhost: string,
  name: string,
  signal: AbortSignal,
  onSend: () => void,
  authorizeSend: () => Promise<void>,
): Promise<void> {
  const path = queueItemPath(vhost, name);
  if (!path) throw new ManagementFailure("QUEUE_SEGMENT");
  const { status, bytes } = await requestManagement(
    profile,
    {
      method: "DELETE",
      route: path + "/contents",
      timeout: QUEUE_PURGE_TIMEOUT_MS,
      authorizeSend,
      onSend,
      checkResponse(status, headers) {
        if (status >= 300 && status < 400)
          throw new ManagementFailure("REDIRECT");
        if (status >= 500) throw new ManagementFailure("SERVER");
        if (status !== 204 && !isManagementJson(headers))
          throw new ManagementFailure("RESPONSE");
      },
    },
    signal,
  );
  if (status === 204 && bytes.length === 0) return;
  const data = decodeManagementJson(bytes);
  if (
    !managementDepthOk(data) ||
    !data ||
    typeof data !== "object" ||
    !("reason" in data) ||
    typeof data.reason !== "string" ||
    !("error" in data)
  )
    throw new ManagementFailure("RESPONSE");
  if (
    status === 401 &&
    data.error === "not_authorised" &&
    ["Access refused.", "Not management user", "Not authorized"].includes(
      data.reason,
    )
  )
    throw new ManagementFailure("DENIED");
  if (
    status === 404 &&
    (data.error === "not_found" ||
      (data.error === "Object Not Found" && data.reason === "Not Found"))
  )
    throw new ManagementFailure("NOT_FOUND");
  if (
    status === 400 &&
    data.error === "bad_request" &&
    data.reason.startsWith("queue.purge not supported by stream queues ")
  )
    throw new ManagementFailure("QUEUE_PURGE_TYPE");
  throw new ManagementFailure("RESPONSE");
}
