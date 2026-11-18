import type { ConnectionRequest } from "../../shared/connections";
import { exactObject, validId, validRevision } from "../profiles/validation";
export function parseConnectionRequest(
  value: unknown,
): ConnectionRequest | null {
  if (exactObject(value, ["command"]) && value.command === "selectProfileCa")
    return value as ConnectionRequest;
  if (
    exactObject(value, ["command", "selectionId"]) &&
    value.command === "discardProfileCa" &&
    validId(value.selectionId)
  )
    return value as ConnectionRequest;
  if (
    exactObject(value, ["command", "operationId"]) &&
    (value.command === "cancelProfileHttpsTest" ||
      value.command === "cancelProfileAmqpsTest") &&
    validId(value.operationId)
  )
    return value as ConnectionRequest;
  if (
    exactObject(value, ["command", "input"]) &&
    (value.command === "testProfileHttps" ||
      value.command === "testProfileAmqps") &&
    exactObject(value.input, ["profileId", "revision", "operationId"]) &&
    validId(value.input.profileId) &&
    validRevision(value.input.revision) &&
    validId(value.input.operationId)
  )
    return value as ConnectionRequest;
  return null;
}
