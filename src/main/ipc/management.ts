import { dialog, ipcMain, type BrowserWindow } from "electron";
import { randomUUID } from "node:crypto";
import {
  MANAGEMENT_CHANNEL,
  managementErrors,
  type ManagementResult,
  isQueueSnapshot,
  isQueueDeclarationSnapshot,
  isQueuePurgeSnapshot,
  type ManagementResponse,
} from "../../shared/management";
import { isTrustedSender } from "./desktop";
import { parseManagementRequest } from "../management/validation";
import { ManagementFailure } from "../management/httpsRead";
import { environmentLabels } from "../../shared/profiles";
import type {
  ManagementService,
  QueuePurgeTarget,
} from "../management/service";

function exactLabel(value: string) {
  return JSON.stringify(value).replace(
    /[\p{C}\p{Zl}\p{Zp}]/gu,
    character => `\\u{${character.codePointAt(0)!.toString(16).toUpperCase()}}`,
  );
}

async function confirmQueuePurge(
  window: BrowserWindow,
  target: QueuePurgeTarget,
  signal: AbortSignal,
) {
  const endpoint = new URL(target.httpsUrl);
  const production = target.environment === "production";
  const result = await dialog.showMessageBox(window, {
    type: "warning",
    title: "Limpar mensagens da fila",
    message: production
      ? "⚠ Produção · Limpar mensagens da fila?"
      : "Limpar mensagens da fila?",
    detail: [
      `Perfil: ${exactLabel(target.profileName)}`,
      `Ambiente: ${environmentLabels[target.environment]}`,
      `HTTPS: ${endpoint.origin}${endpoint.pathname}`,
      `Vhost: ${exactLabel(target.vhost)}`,
      `Fila: ${exactLabel(target.name)} · Tipo encontrado: ${target.queueType}`,
      "",
      "Esta limpeza é irreversível. Remove mensagens prontas e preserva as entregas ainda sem confirmação. Em filas quorum, pode remover também mensagens com nova tentativa adiada ou dead-lettering pendente.",
      "A operação usa o nome da fila na hora do envio. Esse nome pode ter sido recriado desde a consulta.",
    ].join("\n"),
    buttons: ["Cancelar", "Limpar mensagens"],
    cancelId: 0,
    defaultId: 0,
    noLink: true,
    signal,
  });
  return result.response === 1;
}

export function registerManagementIpc(
  getWindow: () => BrowserWindow | null,
  entry: string,
  service: ManagementService,
) {
  ipcMain.handle(
    MANAGEMENT_CHANNEL,
    async (
      event,
      input: unknown,
    ): Promise<ManagementResult<ManagementResponse>> => {
      const requestId = randomUUID();
      try {
        const window = getWindow();
        if (!window || !isTrustedSender(event, window, entry))
          throw new ManagementFailure("FORBIDDEN");
        const request = parseManagementRequest(input);
        if (!request) throw new ManagementFailure("VALIDATION");
        const owner = window.webContents.id;
        let value: ManagementResponse;
        const trusted = () => isTrustedSender(event, getWindow(), entry);
        switch (request.command) {
          case "cancelManagementRead":
            service.cancel(owner, request.input);
            break;
          case "cancelQueueDeclaration":
            service.cancel(owner, request.input, "declaration");
            break;
          case "cancelQueuePurge":
            service.cancel(owner, request.input, "purge");
            break;
          case "purgeSessionQueue": {
            const { input } = request;
            const invalidate = () => service.cancel(owner, input, "purge");
            window.on("hide", invalidate);
            window.on("minimize", invalidate);
            try {
              value = await service.purgeQueue(
                owner,
                input,
                () =>
                  trusted() &&
                  window.isVisible() &&
                  !window.isMinimized() &&
                  window.isFocused(),
                (target, signal) => confirmQueuePurge(window, target, signal),
              );
            } finally {
              window.removeListener("hide", invalidate);
              window.removeListener("minimize", invalidate);
            }
            if (!isQueuePurgeSnapshot(value))
              throw new ManagementFailure("QUEUE_PURGE_UNCERTAIN");
            break;
          }
          case "declareSessionQueue":
            value = await service.declareQueue(owner, request.input, trusted);
            if (!isQueueDeclarationSnapshot(value))
              throw new ManagementFailure("QUEUE_DECLARATION_UNCERTAIN");
            break;
          case "listSessionQueues":
            value = await service.execute(owner, request.input, {
              kind: "queuePage",
              page: request.input.page,
              search: request.input.search,
            });
            if (!isQueueSnapshot(value) || value.kind !== "queuePage")
              throw new ManagementFailure("RESPONSE");
            break;
          case "getSessionQueue":
            value = await service.execute(owner, request.input, {
              kind: "queueDetail",
              name: request.input.name,
            });
            if (!isQueueSnapshot(value) || value.kind !== "queueDetail")
              throw new ManagementFailure("RESPONSE");
            break;
          default:
            value = await service.execute(
              owner,
              request.input,
              request.command === "getBrokerInfo" ? "broker" : "vhosts",
            );
        }
        if (!trusted()) throw new ManagementFailure("FORBIDDEN");
        return { ok: true, requestId, value };
      } catch (error) {
        const code =
          error instanceof ManagementFailure ? error.code : "INTERNAL";
        return {
          ok: false,
          requestId,
          error: { code, message: managementErrors[code] },
        };
      }
    },
  );
  return () => ipcMain.removeHandler(MANAGEMENT_CHANNEL);
}
