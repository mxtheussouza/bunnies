import {
  closedObject,
  isManagementInput,
  isQueueDetailInput,
  isQueueListInput,
  type ManagementRequest,
} from "../../shared/management";
export function parseManagementRequest(v: unknown): ManagementRequest | null {
  if (!closedObject(v, ["command", "input"])) return null;
  switch (v.command) {
    case "listSessionQueues":
      return isQueueListInput(v.input)
        ? { command: v.command, input: v.input }
        : null;
    case "getSessionQueue":
      return isQueueDetailInput(v.input)
        ? { command: v.command, input: v.input }
        : null;
    case "getBrokerInfo":
    case "listSessionVhosts":
    case "cancelManagementRead":
      return isManagementInput(v.input)
        ? { command: v.command, input: v.input }
        : null;
    default:
      return null;
  }
}
