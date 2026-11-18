import { dialog, ipcMain, type BrowserWindow } from "electron";
import { randomUUID } from "node:crypto";
import { CONNECTIONS_CHANNEL } from "../../shared/connections";
import {
  profileErrorMessages,
  type ProfileResult,
} from "../../shared/profiles";
import { ProfileFailure } from "../profiles/errors";
import type { ProfileService } from "../profiles/service";
import type { ConnectionTestService } from "../connections/connectionTestService";
import { parseConnectionRequest } from "../connections/validation";
import { isTrustedSender } from "./desktop";
export function registerConnectionsIpc(
  getWindow: () => BrowserWindow | null,
  entry: string,
  profiles: ProfileService,
  tests: ConnectionTestService,
) {
  const tracked = new Map<number, () => void>();
  function track(window: BrowserWindow) {
    const contents = window.webContents,
      owner = contents.id;
    if (tracked.has(owner)) return;
    const clear = () => {
      profiles.caSelections.disposeOwner(owner);
      tests.cancelOwner(owner);
    };
    const closed = () => {
      clear();
      remove();
      tracked.delete(owner);
    };
    const remove = () => {
      contents.removeListener("did-start-loading", clear);
      contents.removeListener("render-process-gone", clear);
      window.removeListener("closed", closed);
    };
    contents.on("did-start-loading", clear);
    contents.on("render-process-gone", clear);
    window.once("closed", closed);
    tracked.set(owner, () => {
      clear();
      remove();
    });
  }
  ipcMain.handle(
    CONNECTIONS_CHANNEL,
    async (event, input: unknown): Promise<ProfileResult<unknown>> => {
      const requestId = randomUUID();
      try {
        const window = getWindow();
        if (!isTrustedSender(event, window, entry) || !window)
          throw new ProfileFailure("FORBIDDEN");
        const request = parseConnectionRequest(input);
        if (!request) throw new ProfileFailure("VALIDATION");
        track(window);
        const owner = window.webContents.id;
        const trusted = () => isTrustedSender(event, getWindow(), entry);
        let value: unknown;
        switch (request.command) {
          case "selectProfileCa":
            value = await profiles.caSelections.select(
              owner,
              async () => {
                const result = await dialog.showOpenDialog(window, {
                  title: "Selecionar CA pública PEM",
                  buttonLabel: "Usar CA",
                  filters: [
                    {
                      name: "Certificados CA PEM",
                      extensions: ["pem", "crt", "cer"],
                    },
                  ],
                  properties: ["openFile"],
                });
                if (!trusted()) throw new ProfileFailure("FORBIDDEN");
                if (result.canceled) return null;
                if (result.filePaths.length !== 1)
                  throw new ProfileFailure("CA_INVALID");
                return result.filePaths[0];
              },
              trusted,
            );
            break;
          case "discardProfileCa":
            profiles.caSelections.discard(owner, request.selectionId);
            value = undefined;
            break;
          case "testProfileAmqps":
            value = await tests.testAmqps(owner, request.input);
            break;
          case "cancelProfileAmqpsTest":
            tests.cancel(owner, request.operationId, "amqps");
            value = undefined;
            break;
          case "testProfileHttps":
            value = await tests.test(owner, request.input);
            break;
          case "cancelProfileHttpsTest":
            tests.cancel(owner, request.operationId);
            value = undefined;
            break;
        }
        if (!trusted()) throw new ProfileFailure("FORBIDDEN");
        return { ok: true, requestId, value };
      } catch (error) {
        const code = error instanceof ProfileFailure ? error.code : "INTERNAL";
        return {
          ok: false,
          requestId,
          error: { code, message: profileErrorMessages[code] },
        };
      }
    },
  );
  return () => {
    ipcMain.removeHandler(CONNECTIONS_CHANNEL);
    for (const remove of tracked.values()) remove();
    tracked.clear();
  };
}
