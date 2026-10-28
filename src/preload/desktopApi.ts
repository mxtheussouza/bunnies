import type { ConnectionRequest, ConnectionsApi } from "../shared/connections";
import {
  profileErrorMessages,
  type ProfileRequest,
  type ProfileResult,
  type ProfilesApi,
} from "../shared/profiles";
import {
  desktopErrorMessages,
  type DesktopApi,
  type DesktopRequest,
  type DesktopResult,
} from "../shared/desktop";

export function createDesktopApi(
  invoke: (request: DesktopRequest) => Promise<unknown>,
  invokeProfiles: (request: ProfileRequest) => Promise<unknown>,
  invokeConnections: (request: ConnectionRequest) => Promise<unknown>,
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
  async function profileCall<T>(
    request: ProfileRequest | ConnectionRequest,
  ): Promise<ProfileResult<T>> {
    try {
      return (await (request.command === "selectProfileCa" ||
      request.command === "discardProfileCa" ||
      request.command === "testProfileHttps" ||
      request.command === "cancelProfileHttpsTest"
        ? invokeConnections(request as ConnectionRequest)
        : invokeProfiles(request as ProfileRequest))) as ProfileResult<T>;
    } catch {
      return {
        ok: false,
        requestId: "transport",
        error: {
          code: "UNAVAILABLE",
          message: profileErrorMessages.UNAVAILABLE,
        },
      };
    }
  }
  const profiles: ProfilesApi = {
    listProfiles: () => profileCall({ command: "listProfiles" }),
    saveProfile: input => profileCall({ command: "saveProfile", input }),
    removeProfile: input => profileCall({ command: "removeProfile", input }),
    getSecretProtectionStatus: () =>
      profileCall({ command: "getSecretProtectionStatus" }),
  };
  const connections: ConnectionsApi = {
    selectProfileCa: () => profileCall({ command: "selectProfileCa" }),
    discardProfileCa: selectionId =>
      profileCall({ command: "discardProfileCa", selectionId }),
    testProfileHttps: input =>
      profileCall({ command: "testProfileHttps", input }),
    cancelProfileHttpsTest: operationId =>
      profileCall({ command: "cancelProfileHttpsTest", operationId }),
  };
  return Object.freeze({
    ...connections,
    ...profiles,
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
