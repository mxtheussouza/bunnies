import { ipcMain, type BrowserWindow } from "electron";
import { randomUUID } from "node:crypto";
import {
  MANAGEMENT_CHANNEL,
  managementErrors,
  type ManagementResult,
  type ManagementSnapshot,
} from "../../shared/management";
import { isTrustedSender } from "./desktop";
import { parseManagementRequest } from "../management/validation";
import { ManagementFailure } from "../management/httpsRead";
import type { ManagementService } from "../management/service";
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
    ): Promise<ManagementResult<ManagementSnapshot | undefined>> => {
      const requestId = randomUUID();
      try {
        const window = getWindow();
        if (!window || !isTrustedSender(event, window, entry))
          throw new ManagementFailure("FORBIDDEN");
        const request = parseManagementRequest(input);
        if (!request) throw new ManagementFailure("VALIDATION");
        const owner = window.webContents.id;
        const value =
          request.command === "cancelManagementRead"
            ? service.cancel(owner, request.input)
            : await service.execute(
                owner,
                request.input,
                request.command === "getBrokerInfo" ? "broker" : "vhosts",
              );
        if (!isTrustedSender(event, getWindow(), entry))
          throw new ManagementFailure("FORBIDDEN");
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
