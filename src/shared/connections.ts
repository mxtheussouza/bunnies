import type { ProfileResult } from "./profiles";
export const CONNECTIONS_CHANNEL = "bunnies:connections";
export const MAX_CA_BYTES = 256 * 1024;
export const MAX_CA_CERTIFICATES = 16;
export const CA_SELECTION_TTL_MS = 10 * 60 * 1000;
export const HTTPS_TEST_TIMEOUT_MS = 10_000;
export const AMQPS_TEST_TIMEOUT_MS = 15_000;
export const AMQPS_CLOSE_TIMEOUT_MS = 1_000;
export const AMQPS_FRAME_MAX = 128 * 1024;
export const AMQPS_HEARTBEAT = 10;
export const MAX_PROBE_BODY_BYTES = 64 * 1024;
export const MAX_PROBE_HEADER_BYTES = 16 * 1024;
export type TrustSummary =
  { mode: "default" } | { mode: "custom"; fingerprints: string[] };
export type CaSelection = { selectionId: string; fingerprints: string[] };
export type TrustChange =
  { action: "keep" | "default" } | { action: "replace"; selectionId: string };
export type HttpsTestInput = {
  profileId: string;
  revision: string;
  operationId: string;
};
export type HttpsTestOutcome = HttpsTestInput & {
  outcome: "authenticated";
  checkedAt: string;
  durationMs: number;
};
export type AmqpsTestOutcome = HttpsTestOutcome & { vhost: string };
export type ConnectionRequest =
  | { command: "selectProfileCa" }
  | { command: "discardProfileCa"; selectionId: string }
  | { command: "testProfileHttps"; input: HttpsTestInput }
  | { command: "cancelProfileHttpsTest"; operationId: string }
  | { command: "testProfileAmqps"; input: HttpsTestInput }
  | { command: "cancelProfileAmqpsTest"; operationId: string };
export interface ConnectionsApi {
  selectProfileCa(): Promise<ProfileResult<CaSelection | null>>;
  discardProfileCa(selectionId: string): Promise<ProfileResult<undefined>>;
  testProfileHttps(
    input: HttpsTestInput,
  ): Promise<ProfileResult<HttpsTestOutcome>>;
  cancelProfileHttpsTest(
    operationId: string,
  ): Promise<ProfileResult<undefined>>;
  testProfileAmqps(
    input: HttpsTestInput,
  ): Promise<ProfileResult<AmqpsTestOutcome>>;
  cancelProfileAmqpsTest(
    operationId: string,
  ): Promise<ProfileResult<undefined>>;
}
