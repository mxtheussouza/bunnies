import {
  closedObject,
  isManagementSnapshot,
  managementErrors,
  managementId,
  type ManagementRequest,
  type ManagementResult,
  type ManagementSnapshot,
} from "../shared/management";
import type { ConnectionRequest, ConnectionsApi } from "../shared/connections";
import type { SessionRequest, SessionSnapshot } from "../shared/session";
import { isSessionSnapshot } from "../shared/session";
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
  invokeSession: (request: SessionRequest) => Promise<unknown> = async () => {
    throw new Error("Unavailable");
  },
  subscribeSession: (
    listener: (state: SessionSnapshot) => void,
  ) => () => void = () => () => undefined,
  invokeManagement: (
    request: ManagementRequest,
  ) => Promise<unknown> = async () => {
    throw new Error("Unavailable");
  },
): DesktopApi {
  async function managementCall(
    request: ManagementRequest,
  ): Promise<
    ManagementResult<ManagementSnapshot> | ManagementResult<undefined>
  > {
    try {
      const result = await invokeManagement(request);
      if (
        !closedObject(result, ["ok", "requestId"], ["value", "error"]) ||
        !managementId(result.requestId)
      )
        throw new Error();
      if (
        result.ok === true &&
        closedObject(result, ["ok", "requestId", "value"]) &&
        (request.command === "cancelManagementRead"
          ? result.value === undefined
          : isManagementSnapshot(result.value) &&
            result.value.sessionId === request.input.sessionId &&
            result.value.generation === request.input.generation &&
            result.value.operationId === request.input.operationId &&
            result.value.kind ===
              (request.command === "getBrokerInfo" ? "broker" : "vhosts"))
      )
        return result as
          ManagementResult<ManagementSnapshot> | ManagementResult<undefined>;
      if (
        result.ok === false &&
        closedObject(result, ["ok", "requestId", "error"]) &&
        closedObject(result.error, ["code", "message"]) &&
        typeof result.error.code === "string" &&
        Object.hasOwn(managementErrors, result.error.code)
      ) {
        const code = result.error.code as keyof typeof managementErrors;
        return {
          ok: false,
          requestId: result.requestId,
          error: { code, message: managementErrors[code] },
        };
      }
      throw new Error();
    } catch {
      return {
        ok: false,
        requestId: "transport",
        error: { code: "UNAVAILABLE", message: managementErrors.UNAVAILABLE },
      };
    }
  }
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
      request.command === "cancelProfileHttpsTest" ||
      request.command === "testProfileAmqps" ||
      request.command === "cancelProfileAmqpsTest"
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
    testProfileAmqps: input =>
      profileCall({ command: "testProfileAmqps", input }),
    cancelProfileAmqpsTest: operationId =>
      profileCall({ command: "cancelProfileAmqpsTest", operationId }),
    selectProfileCa: () => profileCall({ command: "selectProfileCa" }),
    discardProfileCa: selectionId =>
      profileCall({ command: "discardProfileCa", selectionId }),
    testProfileHttps: input =>
      profileCall({ command: "testProfileHttps", input }),
    cancelProfileHttpsTest: operationId =>
      profileCall({ command: "cancelProfileHttpsTest", operationId }),
  };
  return Object.freeze({
    getBrokerInfo: input =>
      managementCall({ command: "getBrokerInfo", input }) as Promise<
        ManagementResult<ManagementSnapshot>
      >,
    listSessionVhosts: input =>
      managementCall({ command: "listSessionVhosts", input }) as Promise<
        ManagementResult<ManagementSnapshot>
      >,
    cancelManagementRead: input =>
      managementCall({ command: "cancelManagementRead", input }) as Promise<
        ManagementResult<undefined>
      >,
    getSessionState: () => sessionCall({ command: "getSessionState" }),
    connectSession: input => sessionCall({ command: "connectSession", input }),
    disconnectSession: input =>
      sessionCall({ command: "disconnectSession", input }),
    onSessionState: listener =>
      typeof listener === "function"
        ? subscribeSession(listener)
        : () => undefined,
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
  async function sessionCall(
    request: SessionRequest,
  ): Promise<ProfileResult<SessionSnapshot>> {
    try {
      const result = (await invokeSession(
        request,
      )) as ProfileResult<SessionSnapshot>;
      if (result?.ok === true && isSessionSnapshot(result.value)) return result;
      if (
        result?.ok === false &&
        Object.hasOwn(profileErrorMessages, result.error?.code)
      )
        return {
          ok: false,
          requestId: "session",
          error: {
            code: result.error.code,
            message: profileErrorMessages[result.error.code],
          },
        };
      throw new Error("Invalid session response");
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
}
