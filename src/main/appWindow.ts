import { app, BrowserWindow } from "electron";
import { resolve } from "path";
import { registerTitlebarIpc } from "@misc/window/titlebarIPC";

// Electron Forge automatically creates these entry points
declare const APP_WINDOW_WEBPACK_ENTRY: string;
declare const APP_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

/**
 * Create Application Window
 * @returns {BrowserWindow} Application Window Instance
 */
export function createAppWindow(): BrowserWindow {
  const window = new BrowserWindow({
    width: 800,
    height: 600,
    backgroundColor: "#202020",
    show: false,
    autoHideMenuBar: true,
    frame: false,
    titleBarStyle: "hidden",
    icon: resolve("assets/images/appIcon.ico"),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      nodeIntegrationInWorker: false,
      nodeIntegrationInSubFrames: false,
      preload: APP_WINDOW_PRELOAD_WEBPACK_ENTRY,
      sandbox: false,
    },
  });

  // Load the index.html of the app window.
  window.loadURL(APP_WINDOW_WEBPACK_ENTRY);

  // Show window when its ready to
  window.on("ready-to-show", () => window.show());

  // Register Inter Process Communication for main process
  registerMainIPC(window);

  // Close all windows when main window is closed
  window.on("close", () => {
    app.quit();
  });

  return window;
}

/**
 * Register Inter Process Communication
 */
function registerMainIPC(window: BrowserWindow) {
  /**
   * Here you can assign IPC related codes for the application window
   * to Communicate asynchronously from the main process to renderer processes.
   */
  registerTitlebarIpc(window);
}
