import type { ConnectionsApi } from "./connections";
import type { ProfilesApi } from "./profiles";
export const DESKTOP_CHANNEL = "bunnies:desktop";

export const viewActions = [
  "reload",
  "forceReload",
  "resetZoom",
  "zoomIn",
  "zoomOut",
  "toggleFullscreen",
  "toggleDevTools",
] as const;
export type ViewAction = (typeof viewActions)[number];
export type LinkId = "author";
export type DesktopInfo = {
  version: string;
  platform: "darwin" | "win32" | "linux";
  development: boolean;
};
export type DesktopRequest =
  | { command: "info" }
  | {
      command:
        "close" | "quit" | "minimize" | "toggleMaximize" | "showEditMenu";
    }
  | { command: "view"; action: ViewAction }
  | { command: "openLink"; id: LinkId };
export type DesktopErrorCode =
  "FORBIDDEN" | "VALIDATION" | "UNAVAILABLE" | "INTERNAL";
export type DesktopResult<T = undefined> =
  | { ok: true; requestId: string; value: T }
  | {
      ok: false;
      requestId: string;
      error: { code: DesktopErrorCode; message: string };
    };

export const desktopErrorMessages: Record<DesktopErrorCode, string> = {
  FORBIDDEN: "Esta janela não pode executar a operação.",
  VALIDATION: "A operação desktop solicitada é inválida.",
  UNAVAILABLE: "A operação desktop está indisponível neste momento.",
  INTERNAL: "Não foi possível concluir a operação desktop.",
};

export interface DesktopApi extends ProfilesApi, ConnectionsApi {
  getInfo(): Promise<DesktopResult<DesktopInfo>>;
  close(): Promise<DesktopResult>;
  quit(): Promise<DesktopResult>;
  minimize(): Promise<DesktopResult>;
  toggleMaximize(): Promise<DesktopResult>;
  showEditMenu(): Promise<DesktopResult>;
  view(action: ViewAction): Promise<DesktopResult>;
  openLink(id: LinkId): Promise<DesktopResult>;
}
