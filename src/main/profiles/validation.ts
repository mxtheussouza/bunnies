import { Buffer } from "node:buffer";
import {
  environments,
  MAX_PROFILE_BYTES,
  type ProfileFields,
  type ProfileRequest,
  type SaveProfileInput,
} from "../../shared/profiles";

export function exactObject(
  value: unknown,
  required: string[],
  optional: string[] = [],
): value is Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const proto = Object.getPrototypeOf(value);
  if (proto !== Object.prototype && proto !== null) return false;
  const keys = Reflect.ownKeys(value);
  return (
    keys.length <= required.length + optional.length &&
    required.every(key => Object.hasOwn(value, key)) &&
    keys.every(
      key =>
        typeof key === "string" &&
        [...required, ...optional].includes(key) &&
        Object.getOwnPropertyDescriptor(value, key)?.get === undefined,
    )
  );
}
export function validText(
  value: unknown,
  maximum: number,
  empty = false,
): value is string {
  return (
    typeof value === "string" &&
    value.length <= maximum &&
    (empty || value.trim().length > 0) &&
    [...value].every(
      character =>
        character.charCodeAt(0) >= 32 && character.charCodeAt(0) !== 127,
    )
  );
}
export function validId(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(
      value,
    )
  );
}
export function validRevision(value: unknown): value is string {
  return (
    value === "absent" ||
    (typeof value === "string" && /^[0-9a-f]{64}$/.test(value))
  );
}
function endpoint(
  value: unknown,
  protocol: "https:" | "amqps:",
): value is string {
  if (!validText(value, 2048) || value.trim() !== value || /[\\\s]/.test(value))
    return false;
  try {
    const url = new URL(value);
    return (
      url.protocol === protocol &&
      value.startsWith(protocol + "//") &&
      !!url.hostname &&
      !url.username &&
      !url.password &&
      !value
        .slice(value.indexOf("://") + 3)
        .split("/")[0]
        .includes("@") &&
      !url.search &&
      !url.hash &&
      !value.includes("?") &&
      !value.includes("#")
    );
  } catch {
    return false;
  }
}
export function validFields(
  value: Record<string, unknown>,
): value is Record<string, unknown> & ProfileFields {
  return (
    validText(value.name, 120) &&
    value.name.trim() === value.name &&
    typeof value.environment === "string" &&
    (environments as readonly string[]).includes(value.environment) &&
    endpoint(value.httpsUrl, "https:") &&
    endpoint(value.amqpsUrl, "amqps:") &&
    validText(value.username, 256)
  );
}
const fields = ["name", "environment", "httpsUrl", "amqpsUrl", "username"];
export function validSave(value: unknown): value is SaveProfileInput {
  if (
    !exactObject(value, [...fields, "revision", "secret"], ["id"]) ||
    !validFields(value) ||
    !validRevision(value.revision) ||
    (Object.hasOwn(value, "id") && !validId(value.id))
  )
    return false;
  const secret = value.secret;
  if (
    exactObject(secret, ["action"]) &&
    (secret.action === "keep" || secret.action === "remove")
  )
    return true;
  return (
    exactObject(secret, ["action", "mode", "password"]) &&
    secret.action === "replace" &&
    (secret.mode === "memory" || secret.mode === "protected") &&
    typeof secret.password === "string" &&
    secret.password.length > 0 &&
    secret.password.length <= 4096 &&
    !secret.password.includes("\0")
  );
}
export function parseProfileRequest(value: unknown): ProfileRequest | null {
  if (
    exactObject(value, ["command"]) &&
    (value.command === "listProfiles" ||
      value.command === "getSecretProtectionStatus")
  )
    return value as ProfileRequest;
  if (!exactObject(value, ["command", "input"])) return null;
  if (value.command === "saveProfile" && validSave(value.input)) {
    return Buffer.byteLength(JSON.stringify(value), "utf8") <= MAX_PROFILE_BYTES
      ? (value as ProfileRequest)
      : null;
  }
  if (
    value.command === "removeProfile" &&
    exactObject(value.input, ["id", "revision"]) &&
    validId(value.input.id) &&
    validRevision(value.input.revision)
  )
    return value as ProfileRequest;
  return null;
}
