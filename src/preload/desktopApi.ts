import {
  closedObject,
  isManagementSnapshot,
  isQueueSnapshot,
  isQueueDeclarationSnapshot,
  isQueuePurgeSnapshot,
  isExchangeSnapshot,
  type ExchangeSnapshot,
  type QueueDeclarationSnapshot,
  type QueuePurgeSnapshot,
  type ManagementResponse,
  type QueueSnapshot,
  managementErrors,
  managementId,
  type ManagementRequest,
  type ManagementResult,
  type ManagementSnapshot,
} from "../shared/management";
import type { QueueDetail, QueuePage } from "../shared/queues";
import type {
  ExchangeBindings,
  ExchangeDetail,
  ExchangePage,
} from "../shared/exchanges";
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
  ): Promise<ManagementResult<ManagementResponse>> {
    try {
      const result = await invokeManagement(request);
      if (
        !closedObject(result, ["ok", "requestId"], ["value", "error"]) ||
        !managementId(result.requestId)
      )
        throw new Error();
      if (
        result.ok === true &&
        closedObject(result, ["ok", "requestId", "value"])
      ) {
        const { input } = request;
        const value = result.value;
        if (
          (request.command === "cancelManagementRead" ||
            request.command === "cancelQueueDeclaration" ||
            request.command === "cancelQueuePurge") &&
          value === undefined
        )
          return { ok: true, requestId: result.requestId, value };
        if (
          !isQueueSnapshot(value) &&
          !isManagementSnapshot(value) &&
          !isExchangeSnapshot(value) &&
          !isQueueDeclarationSnapshot(value) &&
          !isQueuePurgeSnapshot(value)
        )
          throw new Error();
        let matches = false;
        switch (request.command) {
          case "purgeSessionQueue":
            matches =
              value.kind === "queuePurge" && value.name === request.input.name;
            break;
          case "declareSessionQueue":
            matches =
              value.kind === "queueDeclaration" &&
              value.name === request.input.declaration.name;
            break;
          case "listSessionQueues":
            matches =
              value.kind === "queuePage" &&
              value.page === request.input.page &&
              (request.input.search !== undefined ||
                value.totalCount === value.filteredCount);
            break;
          case "getSessionQueue":
            matches =
              value.kind === "queueDetail" &&
              value.queue.name === request.input.name;
            break;
          case "listSessionExchanges":
            matches =
              value.kind === "exchangePage" &&
              value.page === request.input.page &&
              (request.input.search !== undefined ||
                value.totalCount === value.filteredCount);
            break;
          case "getSessionExchange":
            matches =
              value.kind === "exchangeDetail" &&
              value.exchange.name === request.input.name;
            break;
          case "listSessionExchangeBindings":
            matches =
              value.kind === "exchangeBindings" &&
              value.name === request.input.name &&
              value.direction === request.input.direction;
            break;
          case "getBrokerInfo":
            matches = value.kind === "broker";
            break;
          case "listSessionVhosts":
            matches = value.kind === "vhosts";
            break;
        }
        if (
          matches &&
          value.sessionId === input.sessionId &&
          value.generation === input.generation &&
          value.operationId === input.operationId
        )
          return { ok: true, requestId: result.requestId, value };
      }
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
      const code =
        request.command === "purgeSessionQueue"
          ? "QUEUE_PURGE_UNCERTAIN"
          : request.command === "declareSessionQueue"
            ? "QUEUE_DECLARATION_UNCERTAIN"
            : "UNAVAILABLE";
      return {
        ok: false,
        requestId: "transport",
        error: { code, message: managementErrors[code] },
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
    listSessionQueues: input =>
      managementCall({ command: "listSessionQueues", input }) as Promise<
        ManagementResult<QueueSnapshot<QueuePage>>
      >,
    getSessionQueue: input =>
      managementCall({ command: "getSessionQueue", input }) as Promise<
        ManagementResult<QueueSnapshot<QueueDetail>>
      >,
    listSessionExchanges: input =>
      managementCall({ command: "listSessionExchanges", input }) as Promise<
        ManagementResult<ExchangeSnapshot<ExchangePage>>
      >,
    getSessionExchange: input =>
      managementCall({ command: "getSessionExchange", input }) as Promise<
        ManagementResult<ExchangeSnapshot<ExchangeDetail>>
      >,
    listSessionExchangeBindings: input =>
      managementCall({
        command: "listSessionExchangeBindings",
        input,
      }) as Promise<ManagementResult<ExchangeSnapshot<ExchangeBindings>>>,
    declareSessionQueue: input =>
      managementCall({ command: "declareSessionQueue", input }) as Promise<
        ManagementResult<QueueDeclarationSnapshot>
      >,
    cancelQueueDeclaration: input =>
      managementCall({ command: "cancelQueueDeclaration", input }) as Promise<
        ManagementResult<undefined>
      >,
    purgeSessionQueue: input =>
      managementCall({ command: "purgeSessionQueue", input }) as Promise<
        ManagementResult<QueuePurgeSnapshot>
      >,
    cancelQueuePurge: input =>
      managementCall({ command: "cancelQueuePurge", input }) as Promise<
        ManagementResult<undefined>
      >,
    cancelManagementRead: input =>
      managementCall({ command: "cancelManagementRead", input }) as Promise<
        ManagementResult<undefined>
      >,
    getSessionState: () => sessionCall({ command: "getSessionState" }),
    connectSession: input => sessionCall({ command: "connectSession", input }),
    disconnectSession: input =>
      sessionCall({ command: "disconnectSession", input }),
    selectSessionVhost: input =>
      sessionCall({ command: "selectSessionVhost", input }),
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
      if (
        request.command === "selectSessionVhost" &&
        (!managementId(result?.requestId) ||
          (result?.ok === true &&
            (!closedObject(result, ["ok", "requestId", "value"]) ||
              !isSessionSnapshot(result.value) ||
              result.value.sessionId !== request.input.sessionId ||
              result.value.generation <= request.input.generation ||
              result.value.profile?.vhost !== request.input.vhost)) ||
          (result?.ok === false &&
            (!closedObject(result, ["ok", "requestId", "error"]) ||
              !closedObject(result.error, ["code", "message"]) ||
              typeof result.error.code !== "string")))
      )
        throw new Error("Invalid vhost selection response");
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
