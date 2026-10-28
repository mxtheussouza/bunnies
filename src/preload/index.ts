import { contextBridge, ipcRenderer } from "electron";
import { DESKTOP_CHANNEL } from "../shared/desktop";
import { createDesktopApi } from "./desktopApi";

// No Node shims, raw IPC, event objects, filesystem or arbitrary URLs cross this bridge.
if (process.isMainFrame) {
  if (!process.sandboxed || !process.contextIsolated) {
    throw new Error("Desktop isolation is unavailable");
  }
  contextBridge.exposeInMainWorld(
    "bunnies",
    createDesktopApi(request => ipcRenderer.invoke(DESKTOP_CHANNEL, request)),
  );
}
