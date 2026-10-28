import {
  app,
  ipcMain,
  Menu,
  shell,
  type BrowserWindow,
  type IpcMainInvokeEvent,
} from "electron";
import { randomUUID } from "node:crypto";
import {
  DESKTOP_CHANNEL,
  desktopErrorMessages,
  type DesktopInfo,
  type DesktopRequest,
  type DesktopResult,
} from "../../shared/desktop";
import { isTrustedPage, parseDesktopRequest } from "../security/desktopPolicy";

const links = { author: "https://github.com/mxtheussouza" } as const;

export function isTrustedSender(
  event: IpcMainInvokeEvent,
  window: BrowserWindow | null,
  entry: string,
): boolean {
  try {
    return (
      !!window &&
      !window.isDestroyed() &&
      event.sender === window.webContents &&
      event.senderFrame !== null &&
      event.senderFrame === window.webContents.mainFrame &&
      isTrustedPage(event.senderFrame.url, entry)
    );
  } catch {
    return false;
  }
}

export function registerDesktopIpc(
  getWindow: () => BrowserWindow | null,
  entry: string,
) {
  ipcMain.handle(
    DESKTOP_CHANNEL,
    async (
      event,
      input: unknown,
    ): Promise<DesktopResult<DesktopInfo | undefined>> => {
      const requestId = randomUUID();
      const error = (
        code: keyof typeof desktopErrorMessages,
      ): DesktopResult<never> => ({
        ok: false,
        requestId,
        error: { code, message: desktopErrorMessages[code] },
      });
      const window = getWindow();
      if (!isTrustedSender(event, window, entry) || !window)
        return error("FORBIDDEN");
      const request = parseDesktopRequest(input);
      if (!request) return error("VALIDATION");
      try {
        if (request.command === "info") {
          const platform = process.platform;
          if (
            platform !== "darwin" &&
            platform !== "win32" &&
            platform !== "linux"
          )
            return error("UNAVAILABLE");
          return {
            ok: true,
            requestId,
            value: {
              version: app.getVersion(),
              platform,
              development: !app.isPackaged,
            },
          };
        }
        if (
          request.command === "view" &&
          request.action === "toggleDevTools" &&
          app.isPackaged
        )
          return error("UNAVAILABLE");
        await execute(window, request);
        return { ok: true, requestId, value: undefined };
      } catch {
        return error("INTERNAL");
      }
    },
  );
  return () => ipcMain.removeHandler(DESKTOP_CHANNEL);
}

async function execute(
  window: BrowserWindow,
  request: Exclude<DesktopRequest, { command: "info" }>,
) {
  switch (request.command) {
    case "close":
      window.close();
      break;
    case "quit":
      app.quit();
      break;
    case "minimize":
      window.minimize();
      break;
    case "toggleMaximize":
      if (window.isMaximized()) window.unmaximize();
      else window.maximize();
      break;
    case "openLink":
      await shell.openExternal(links[request.id]);
      break;
    case "showEditMenu": {
      // A renderer may open the native menu, never execute a clipboard operation.
      Menu.buildFromTemplate([
        { role: "undo" },
        { role: "redo" },
        { type: "separator" },
        { role: "cut" },
        { role: "copy" },
        { role: "paste" },
        { role: "delete" },
        { role: "selectAll" },
      ]).popup({ window });
      break;
    }
    case "view": {
      const contents = window.webContents;
      switch (request.action) {
        case "reload":
          contents.reload();
          break;
        case "forceReload":
          contents.reloadIgnoringCache();
          break;
        case "resetZoom":
          contents.setZoomLevel(0);
          break;
        case "zoomIn":
          contents.setZoomLevel(Math.min(3, contents.getZoomLevel() + 0.5));
          break;
        case "zoomOut":
          contents.setZoomLevel(Math.max(-3, contents.getZoomLevel() - 0.5));
          break;
        case "toggleFullscreen":
          window.setFullScreen(!window.isFullScreen());
          break;
        case "toggleDevTools":
          contents.toggleDevTools();
          break;
      }
      break;
    }
  }
}
