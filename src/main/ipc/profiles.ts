import { dialog, ipcMain, type BrowserWindow } from "electron";
import { randomUUID } from "node:crypto";
import {
  PROFILES_CHANNEL,
  environmentLabels,
  profileErrorMessages,
  type ProfileResult,
} from "../../shared/profiles";
import { ProfileFailure } from "../profiles/errors";
import { ProfileService } from "../profiles/service";
import { parseProfileRequest } from "../profiles/validation";
import { isTrustedSender } from "./desktop";

export function registerProfilesIpc(
  getWindow: () => BrowserWindow | null,
  entry: string,
  service: ProfileService,
) {
  ipcMain.handle(
    PROFILES_CHANNEL,
    async (event, input: unknown): Promise<ProfileResult<unknown>> => {
      const requestId = randomUUID();
      try {
        const window = getWindow();
        if (!isTrustedSender(event, window, entry) || !window)
          throw new ProfileFailure("FORBIDDEN");
        const request = parseProfileRequest(input);
        if (!request) throw new ProfileFailure("VALIDATION");
        let value: unknown;
        switch (request.command) {
          case "listProfiles":
            value = await service.list();
            break;
          case "getSecretProtectionStatus":
            value = await service.protection.status();
            break;
          case "saveProfile":
            value = await service.save(request.input);
            break;
          case "removeProfile":
            value = await service.remove(request.input, async profile => {
              if (!isTrustedSender(event, getWindow(), entry))
                throw new ProfileFailure("FORBIDDEN");
              const result = await dialog.showMessageBox(window, {
                type: "warning",
                title: "Remover perfil local",
                message: `Remover o perfil “${profile.name}”?`,
                detail: `Ambiente: ${environmentLabels[profile.environment]}\nHTTPS: ${profile.httpsUrl}\nAMQPS: ${profile.amqpsUrl}\n\nRemove apenas o perfil e sua senha local. Nenhum recurso ou mensagem do broker será removido.`,
                buttons: ["Cancelar", "Remover perfil"],
                defaultId: 0,
                cancelId: 0,
                noLink: true,
              });
              if (!isTrustedSender(event, getWindow(), entry))
                throw new ProfileFailure("FORBIDDEN");
              return result.response === 1;
            });
            break;
        }
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
  return () => ipcMain.removeHandler(PROFILES_CHANNEL);
}
