import {
  closedObject,
  isManagementInput,
  isQueueDetailInput,
  isBindingCreationInput,
  isExchangeDeclarationInput,
  isQueueDeclarationInput,
  isQueueListInput,
  isExchangeListInput,
  isExchangeDetailInput,
  isExchangeBindingsInput,
  type ManagementRequest,
} from "../../shared/management";
export function parseManagementRequest(v: unknown): ManagementRequest | null {
  if (!closedObject(v, ["command", "input"])) return null;
  switch (v.command) {
    case "listSessionExchanges":
      return isExchangeListInput(v.input)
        ? { command: v.command, input: v.input }
        : null;
    case "getSessionExchange":
      return isExchangeDetailInput(v.input)
        ? { command: v.command, input: v.input }
        : null;
    case "listSessionExchangeBindings":
      return isExchangeBindingsInput(v.input)
        ? { command: v.command, input: v.input }
        : null;
    case "listSessionQueues":
      return isQueueListInput(v.input)
        ? { command: v.command, input: v.input }
        : null;
    case "getSessionQueue":
    case "purgeSessionQueue":
      return isQueueDetailInput(v.input)
        ? { command: v.command, input: v.input }
        : null;
    case "createSessionBinding":
      return isBindingCreationInput(v.input)
        ? { command: v.command, input: v.input }
        : null;
    case "declareSessionExchange":
      return isExchangeDeclarationInput(v.input)
        ? { command: v.command, input: v.input }
        : null;
    case "declareSessionQueue":
      return isQueueDeclarationInput(v.input)
        ? { command: v.command, input: v.input }
        : null;
    case "getBrokerInfo":
    case "listSessionVhosts":
    case "cancelManagementRead":
    case "cancelBindingCreation":
    case "cancelExchangeDeclaration":
    case "cancelQueueDeclaration":
    case "cancelQueuePurge":
      return isManagementInput(v.input)
        ? { command: v.command, input: v.input }
        : null;
    default:
      return null;
  }
}
