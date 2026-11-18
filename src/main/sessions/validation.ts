import { exactObject, validId, validRevision } from "../profiles/validation";
import type { SessionRequest } from "../../shared/session";
import { boundedManagementText, managementId } from "../../shared/management";
export function parseSessionRequest(v: unknown): SessionRequest | null {
  if (exactObject(v, ["command"]) && v.command === "getSessionState")
    return v as SessionRequest;
  if (!exactObject(v, ["command", "input"])) return null;
  if (
    v.command === "connectSession" &&
    exactObject(v.input, ["profileId", "revision", "operationId"]) &&
    validId(v.input.profileId) &&
    validRevision(v.input.revision) &&
    validId(v.input.operationId)
  )
    return v as SessionRequest;
  if (
    v.command === "disconnectSession" &&
    exactObject(v.input, ["sessionId", "generation"]) &&
    validId(v.input.sessionId) &&
    Number.isSafeInteger(v.input.generation) &&
    Number(v.input.generation) > 0
  )
    return v as SessionRequest;
  if (
    v.command === "selectSessionVhost" &&
    exactObject(v.input, [
      "sessionId",
      "generation",
      "operationId",
      "selectionId",
      "vhost",
    ]) &&
    managementId(v.input.sessionId) &&
    managementId(v.input.operationId) &&
    managementId(v.input.selectionId) &&
    Number.isSafeInteger(v.input.generation) &&
    Number(v.input.generation) > 0 &&
    boundedManagementText(v.input.vhost, 255)
  )
    return v as SessionRequest;
  return null;
}
