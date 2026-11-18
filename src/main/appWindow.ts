import { app, BrowserWindow, dialog } from "electron";
import { APP_URL, isTrustedPage } from "./security/desktopPolicy";

declare const APP_WINDOW_WEBPACK_ENTRY: string;
declare const APP_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

let mainWindow: BrowserWindow | null = null;
export const getAppWindow = () => mainWindow;
export const rendererEntry = () =>
  app.isPackaged ? APP_URL : APP_WINDOW_WEBPACK_ENTRY;

export function createAppWindow(): BrowserWindow {
  if (mainWindow && !mainWindow.isDestroyed()) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.show();
    mainWindow.focus();
    return mainWindow;
  }
  const entry = rendererEntry();
  const window = new BrowserWindow({
    width: 1200,
    height: 800,
    backgroundColor: "#202020",
    show: false,
    autoHideMenuBar: true,
    frame: false,
    titleBarStyle: "hidden",
    webPreferences: {
      sandbox: true,
      contextIsolation: true,
      nodeIntegration: false,
      nodeIntegrationInWorker: false,
      nodeIntegrationInSubFrames: false,
      webviewTag: false,
      webSecurity: true,
      allowRunningInsecureContent: false,
      devTools: !app.isPackaged,
      preload: APP_WINDOW_PRELOAD_WEBPACK_ENTRY,
    },
  });
  mainWindow = window;
  window.webContents.setWindowOpenHandler(() => ({ action: "deny" }));
  window.webContents.on("will-navigate", event => {
    if (!isTrustedPage(event.url, entry)) event.preventDefault();
  });
  window.webContents.on("will-frame-navigate", event => {
    if (!event.isMainFrame || !isTrustedPage(event.url, entry))
      event.preventDefault();
  });
  window.webContents.on("will-redirect", event => event.preventDefault());
  window.webContents.on("will-attach-webview", event => event.preventDefault());
  window.once("ready-to-show", () => window.show());
  window.once("closed", () => {
    if (mainWindow === window) mainWindow = null;
  });
  void window.loadURL(entry).catch(() => {
    if (!window.isDestroyed()) {
      dialog.showErrorBox("Bunnies", "Não foi possível carregar a interface.");
      window.destroy();
    }
  });
  return window;
}
