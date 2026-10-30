import type {
  ProfileEnvironment,
  ProfileErrorCode,
  ProfileResult,
} from "./profiles";
import { profileErrorMessages } from "./profiles";
export const SESSION_CHANNEL = "bunnies:session";
export const SESSION_EVENT = "bunnies:session-state";
export type SessionPhase =
  "idle" | "connecting" | "ready" | "degraded" | "reconnecting" | "closed";
export type EndpointState = {
  phase: "idle" | "connecting" | "available" | "blocked" | "failed" | "closed";
  checking: boolean;
  retries: number;
  checkedAt?: string;
  failedAt?: string;
  nextRetryAt?: string;
  error?: ProfileErrorCode;
};
export type SessionSnapshot = {
  sequence: number;
  generation: number;
  sessionId: string | null;
  state: SessionPhase;
  desired: boolean;
  stopping: boolean;
  paused: boolean;
  profile: {
    id: string;
    name: string;
    environment: ProfileEnvironment;
    vhost: string;
  } | null;
  https: EndpointState;
  amqps: EndpointState;
  flow: "unknown" | "blocked" | "unblocked";
  closeConfirmed?: boolean;
  reason?: ProfileErrorCode;
};
export type ConnectSessionInput = {
  profileId: string;
  revision: string;
  operationId: string;
};
export type SessionRef = { sessionId: string; generation: number };
export type SessionRequest =
  | { command: "getSessionState" }
  | { command: "connectSession"; input: ConnectSessionInput }
  | { command: "disconnectSession"; input: SessionRef };
export interface SessionApi {
  getSessionState(): Promise<ProfileResult<SessionSnapshot>>;
  connectSession(
    input: ConnectSessionInput,
  ): Promise<ProfileResult<SessionSnapshot>>;
  disconnectSession(input: SessionRef): Promise<ProfileResult<SessionSnapshot>>;
  onSessionState(listener: (state: SessionSnapshot) => void): () => void;
}
export const emptySession = (): SessionSnapshot => ({
  sequence: 0,
  generation: 0,
  sessionId: null,
  state: "idle",
  desired: false,
  stopping: false,
  paused: false,
  profile: null,
  https: { phase: "idle", checking: false, retries: 0 },
  amqps: { phase: "idle", checking: false, retries: 0 },
  flow: "unknown",
});

export function isSessionSnapshot(value: unknown): value is SessionSnapshot {
  const object = (v: unknown, keys: string[]) =>
    !!v &&
    typeof v === "object" &&
    !Array.isArray(v) &&
    Object.getPrototypeOf(v) === Object.prototype &&
    Object.keys(v).every(key => keys.includes(key));
  const integer = (v: unknown) => Number.isSafeInteger(v) && Number(v) >= 0;
  const date = (v: unknown) =>
    v === undefined ||
    (typeof v === "string" && v.length <= 64 && Number.isFinite(Date.parse(v)));
  const error = (v: unknown) =>
    v === undefined ||
    (typeof v === "string" && Object.hasOwn(profileErrorMessages, v));
  const endpoint = (v: unknown) => {
    if (
      !object(v, [
        "phase",
        "checking",
        "retries",
        "checkedAt",
        "failedAt",
        "nextRetryAt",
        "error",
      ])
    )
      return false;
    const e = v as Record<string, unknown>;
    return (
      typeof e.phase === "string" &&
      [
        "idle",
        "connecting",
        "available",
        "blocked",
        "failed",
        "closed",
      ].includes(e.phase) &&
      typeof e.checking === "boolean" &&
      integer(e.retries) &&
      Number(e.retries) <= 5 &&
      date(e.checkedAt) &&
      date(e.failedAt) &&
      date(e.nextRetryAt) &&
      error(e.error)
    );
  };
  if (
    !object(value, [
      "sequence",
      "generation",
      "sessionId",
      "state",
      "desired",
      "stopping",
      "paused",
      "profile",
      "https",
      "amqps",
      "flow",
      "closeConfirmed",
      "reason",
    ])
  )
    return false;
  const v = value as Record<string, unknown>;
  if (
    !integer(v.sequence) ||
    !integer(v.generation) ||
    !(
      v.sessionId === null ||
      (typeof v.sessionId === "string" && /^[a-f\d-]{36}$/i.test(v.sessionId))
    ) ||
    typeof v.state !== "string" ||
    ![
      "idle",
      "connecting",
      "ready",
      "degraded",
      "reconnecting",
      "closed",
    ].includes(v.state) ||
    !["desired", "stopping", "paused"].every(k => typeof v[k] === "boolean") ||
    !endpoint(v.https) ||
    !endpoint(v.amqps) ||
    !["unknown", "blocked", "unblocked"].includes(String(v.flow)) ||
    !(
      v.closeConfirmed === undefined || typeof v.closeConfirmed === "boolean"
    ) ||
    !error(v.reason)
  )
    return false;
  if (v.profile === null) return v.sessionId === null;
  if (!object(v.profile, ["id", "name", "environment", "vhost"])) return false;
  const p = v.profile as Record<string, unknown>;
  return (
    typeof p.id === "string" &&
    /^[a-f\d-]{36}$/i.test(p.id) &&
    typeof p.name === "string" &&
    p.name.length <= 120 &&
    ["production", "staging", "development", "other"].includes(
      String(p.environment),
    ) &&
    typeof p.vhost === "string" &&
    new TextEncoder().encode(p.vhost).length <= 255
  );
}
