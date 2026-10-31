import { MANAGEMENT_CHANNEL } from "../shared/management";
import { contextBridge, ipcRenderer } from "electron";
import { CONNECTIONS_CHANNEL } from "../shared/connections";
import { PROFILES_CHANNEL } from "../shared/profiles";
import { DESKTOP_CHANNEL } from "../shared/desktop";
import { createDesktopApi } from "./desktopApi";
import {
  SESSION_CHANNEL,
  SESSION_EVENT,
  isSessionSnapshot,
} from "../shared/session";

// No Node shims, raw IPC, event objects, filesystem or arbitrary URLs cross this bridge.
if (process.isMainFrame) {
  if (!process.sandboxed || !process.contextIsolated) {
    throw new Error("Desktop isolation is unavailable");
  }
  contextBridge.exposeInMainWorld(
    "bunnies",
    createDesktopApi(
      request => ipcRenderer.invoke(DESKTOP_CHANNEL, request),
      request => ipcRenderer.invoke(PROFILES_CHANNEL, request),
      request => ipcRenderer.invoke(CONNECTIONS_CHANNEL, request),
      request => ipcRenderer.invoke(SESSION_CHANNEL, request),
      listener => {
        const receive = (
          _event: Electron.IpcRendererEvent,
          value: import("../shared/session").SessionSnapshot,
        ) => {
          if (isSessionSnapshot(value)) listener(value);
        };
        ipcRenderer.on(SESSION_EVENT, receive);
        return () => {
          ipcRenderer.removeListener(SESSION_EVENT, receive);
        };
      },
      request => ipcRenderer.invoke(MANAGEMENT_CHANNEL, request),
    ),
  );
}
