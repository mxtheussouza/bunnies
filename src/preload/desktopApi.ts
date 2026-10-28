import {
  desktopErrorMessages,
  type DesktopApi,
  type DesktopRequest,
  type DesktopResult,
} from "../shared/desktop";

export function createDesktopApi(
  invoke: (request: DesktopRequest) => Promise<unknown>,
): DesktopApi {
  async function call<T = undefined>(
    request: DesktopRequest,
  ): Promise<DesktopResult<T>> {
    try {
      return (await invoke(request)) as DesktopResult<T>;
    } catch {
      return {
        ok: false,
        requestId: "transport",
        error: {
          code: "UNAVAILABLE",
          message: desktopErrorMessages.UNAVAILABLE,
        },
      };
    }
  }
  return Object.freeze({
    getInfo: () => call({ command: "info" }),
    close: () => call({ command: "close" }),
    quit: () => call({ command: "quit" }),
    minimize: () => call({ command: "minimize" }),
    toggleMaximize: () => call({ command: "toggleMaximize" }),
    showEditMenu: () => call({ command: "showEditMenu" }),
    view: action => call({ command: "view", action }),
    openLink: id => call({ command: "openLink", id }),
  } satisfies DesktopApi);
}
