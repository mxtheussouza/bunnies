import { app, dialog, Menu, protocol, safeStorage, session } from "electron";
import squirrelStartup from "electron-squirrel-startup";
import { resolve } from "node:path";
import { createAppWindow, getAppWindow, rendererEntry } from "./appWindow";
import { registerDesktopIpc } from "./ipc/desktop";
import { ConnectionTestService } from "./connections/connectionTestService";
import { registerConnectionsIpc } from "./ipc/connections";
import { registerProfilesIpc } from "./ipc/profiles";
import { ProfileRepository } from "./profiles/repository";
import { ProfileService } from "./profiles/service";
import { SecretProtection } from "./security/secretProtection";
import { APP_SCHEME } from "./security/desktopPolicy";
import { createResourceHandler } from "./security/resources";
import { restrictSession } from "./security/session";

if (squirrelStartup) {
  app.quit();
} else {
  app.enableSandbox();
  protocol.registerSchemesAsPrivileged([
    {
      scheme: APP_SCHEME,
      privileges: {
        standard: true,
        secure: true,
        supportFetchAPI: true,
        corsEnabled: true,
      },
    },
  ]);
  app
    .whenReady()
    .then(() => {
      const entry = rendererEntry();
      restrictSession(session.defaultSession, app.isPackaged, entry);
      if (app.isPackaged) {
        protocol.handle(
          APP_SCHEME,
          createResourceHandler(resolve(__dirname, "../renderer")),
        );
      }
      const dispose = registerDesktopIpc(getAppWindow, entry);
      // No platform has completed provider/reopen/rotation/release gates yet.
      // This adapter fails closed without probing or prompting the user keychain.
      const profiles = new ProfileService(
        new ProfileRepository(app.getPath("userData")),
        new SecretProtection(safeStorage),
      );
      const disposeProfiles = registerProfilesIpc(
        getAppWindow,
        entry,
        profiles,
      );
      const connectionTests = new ConnectionTestService(profiles);
      const disposeConnections = registerConnectionsIpc(
        getAppWindow,
        entry,
        profiles,
        connectionTests,
      );
      app.once("will-quit", () => {
        dispose();
        disposeProfiles();
        disposeConnections();
        connectionTests.dispose();
        profiles.dispose();
      });
      Menu.setApplicationMenu(
        Menu.buildFromTemplate([
          ...(process.platform === "darwin"
            ? [{ role: "appMenu" as const }]
            : []),
          { label: "File", submenu: [{ role: "close" }, { role: "quit" }] },
          { role: "editMenu" },
          {
            label: "View",
            submenu: [
              { role: "reload" },
              { role: "forceReload" },
              ...(!app.isPackaged ? [{ role: "toggleDevTools" as const }] : []),
              { role: "resetZoom" },
              { role: "zoomIn" },
              { role: "zoomOut" },
              { role: "togglefullscreen" },
            ],
          },
          ...(process.platform === "darwin"
            ? [{ role: "windowMenu" as const }]
            : []),
        ]),
      );
      createAppWindow();
      app.on("activate", () => createAppWindow());
    })
    .catch(() => {
      dialog.showErrorBox("Bunnies", "Não foi possível iniciar o aplicativo.");
      app.quit();
    });
  app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
  });
}
