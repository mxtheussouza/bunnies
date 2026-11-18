import {
  closedObject,
  isManagementInput,
  type ManagementRequest,
} from "../../shared/management";
export function parseManagementRequest(v: unknown): ManagementRequest | null {
  if (
    !closedObject(v, ["command", "input"]) ||
    typeof v.command !== "string" ||
    !["getBrokerInfo", "listSessionVhosts", "cancelManagementRead"].includes(
      v.command,
    ) ||
    !isManagementInput(v.input)
  )
    return null;
  return v as ManagementRequest;
}
