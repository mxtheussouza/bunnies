import { ipcMain, powerMonitor, type BrowserWindow } from "electron";
import { randomUUID } from "node:crypto";
import { SESSION_CHANNEL, SESSION_EVENT } from "../../shared/session";
import {
  profileErrorMessages,
  type ProfileResult,
} from "../../shared/profiles";
import { isTrustedSender } from "./desktop";
import { isTrustedPage } from "../security/desktopPolicy";
import { ProfileFailure } from "../profiles/errors";
import { parseSessionRequest } from "../sessions/validation";
import type { SessionService } from "../sessions/sessionService";
export function registerSessionIpc(
  getWindow: () => BrowserWindow | null,
  entry: string,
  service: SessionService,
) {
  const tracked = new Map<number, () => void>();
  function track(window: BrowserWindow) {
    const contents = window.webContents,
      owner = contents.id;
    if (tracked.has(owner)) return;
    const visible = () =>
      service.setVisible(
        !window.isDestroyed() &&
          window.isVisible() &&
          window.isFocused() &&
          !window.isMinimized(),
      );
    const clear = () => {
      void service.stopOwner(owner);
    };
    window.on("focus", visible);
    window.on("blur", visible);
    window.on("show", visible);
    window.on("hide", visible);
    window.on("minimize", visible);
    window.on("restore", visible);
    contents.on("did-start-loading", clear);
    contents.on("render-process-gone", clear);
    const closed = () => {
      clear();
      remove();
    };
    const remove = () => {
      window.removeListener("focus", visible);
      window.removeListener("blur", visible);
      window.removeListener("show", visible);
      window.removeListener("hide", visible);
      window.removeListener("minimize", visible);
      window.removeListener("restore", visible);
      contents.removeListener("did-start-loading", clear);
      contents.removeListener("render-process-gone", clear);
      window.removeListener("closed", closed);
      tracked.delete(owner);
    };
    window.once("closed", closed);
    tracked.set(owner, () => {
      clear();
      remove();
    });
    visible();
  }
  const publish = () => {
    const window = getWindow();
    try {
      if (!window || window.isDestroyed()) return;
      const frame = window.webContents.mainFrame;
      if (isTrustedPage(frame.url, entry))
        frame.send(SESSION_EVENT, service.getState(window.webContents.id));
    } catch {
      /* Destroyed during publication. */
    }
  };
  const unsubscribe = service.onChange(publish);
  const suspend = () => service.setSuspended(true),
    resume = () => service.setSuspended(false);
  powerMonitor.on("suspend", suspend);
  powerMonitor.on("resume", resume);
  ipcMain.handle(
    SESSION_CHANNEL,
    async (event, input: unknown): Promise<ProfileResult<unknown>> => {
      const requestId = randomUUID();
      try {
        const window = getWindow();
        if (!window || !isTrustedSender(event, window, entry))
          throw new ProfileFailure("FORBIDDEN");
        const request = parseSessionRequest(input);
        if (!request) throw new ProfileFailure("VALIDATION");
        track(window);
        const owner = window.webContents.id;
        const value =
          request.command === "connectSession"
            ? service.connect(owner, request.input)
            : request.command === "disconnectSession"
              ? await service.disconnect(owner, request.input)
              : service.getState(owner);
        if (!isTrustedSender(event, getWindow(), entry))
          throw new ProfileFailure("FORBIDDEN");
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
    ipcMain.removeHandler(SESSION_CHANNEL);
    unsubscribe();
    powerMonitor.removeListener("suspend", suspend);
    powerMonitor.removeListener("resume", resume);
    for (const remove of [...tracked.values()]) remove();
  };
}
