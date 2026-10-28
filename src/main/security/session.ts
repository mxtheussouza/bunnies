import type { Session } from "electron";
import { isAllowedDevConnection } from "./desktopPolicy";

export function restrictSession(
  session: Session,
  packaged: boolean,
  entry: string,
) {
  session.setPermissionCheckHandler(() => false);
  session.setPermissionRequestHandler((_contents, _permission, callback) =>
    callback(false),
  );
  session.setDevicePermissionHandler(() => false);
  session.on("will-download", event => event.preventDefault());
  session.webRequest.onBeforeRequest(
    {
      urls: [
        "http://*/*",
        "https://*/*",
        "ws://*/*",
        "wss://*/*",
        "file://*/*",
      ],
    },
    (details, callback) => {
      callback({
        cancel: packaged || !isAllowedDevConnection(details.url, entry),
      });
    },
  );
}
