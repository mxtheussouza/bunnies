import type { BindingCreation } from "../../shared/exchanges";
import {
  MAX_BINDING_ID_BYTES,
  MAX_EXCHANGE_BINDINGS,
} from "../../shared/exchanges";
import { closedObject } from "../../shared/management";
import { ManagementFailure } from "./httpsTransport";

export type BindingTarget = BindingCreation & { vhost: string };

export function bindingPairPath(target: BindingTarget): string {
  const kind = target.destinationType === "queue" ? "q" : "e";
  return (
    "/api/bindings/" +
    encodeURIComponent(target.vhost) +
    "/e/" +
    encodeURIComponent(target.source) +
    "/" +
    kind +
    "/" +
    encodeURIComponent(target.destination)
  );
}

export function bindingVerification(
  prefix: string,
  target: BindingTarget,
  location: unknown,
) {
  if (typeof location !== "string" || /[?#\\]/.test(location)) return;
  const route = bindingPairPath(target);
  const kind = target.destinationType === "queue" ? "q" : "e";
  const absolute = prefix + route + "/";
  const pieces = location.split("/");
  const decodeName = (value: string) =>
    decodeURIComponent(value.replaceAll("+", " "));
  try {
    let tail: string | undefined;
    if (location.startsWith(absolute)) tail = location.slice(absolute.length);
    else if (
      pieces.length === 6 &&
      pieces[0] === ".." &&
      pieces[1] === ".." &&
      decodeName(pieces[2]) === target.source &&
      pieces[3] === kind &&
      decodeName(pieces[4]) === target.destination
    )
      tail = pieces[5];
    else if (
      pieces.length === 2 &&
      decodeName(pieces[0]) === target.destination
    )
      tail = pieces[1];
    if (!tail || tail.includes("/")) return;
    const id = decodeURIComponent(tail);
    if (
      !id ||
      [...id].some(
        char => char.charCodeAt(0) < 32 || char.charCodeAt(0) === 127,
      ) ||
      Buffer.byteLength(id) > MAX_BINDING_ID_BYTES
    )
      return;
    const pair = id === "." || id === "..";
    return {
      id,
      pair,
      path: pair ? route : route + "/" + encodeURIComponent(id),
    };
  } catch {
    return;
  }
}

export function compareBinding(
  input: unknown,
  target: BindingTarget,
  verification: NonNullable<ReturnType<typeof bindingVerification>>,
) {
  if (verification.pair && !Array.isArray(input))
    throw new ManagementFailure("RESPONSE");
  const rows = Array.isArray(input) ? input : [input];
  if (rows.length > (verification.pair ? MAX_EXCHANGE_BINDINGS : 1))
    throw new ManagementFailure("LIMIT");
  const candidates = [];
  for (const row of rows) {
    if (
      !row ||
      typeof row !== "object" ||
      Array.isArray(row) ||
      row.vhost !== target.vhost ||
      row.source !== target.source ||
      row.destination !== target.destination ||
      row.destination_type !== target.destinationType ||
      typeof row.properties_key !== "string"
    )
      throw new ManagementFailure("RESPONSE");
    if (row.properties_key === verification.id) candidates.push(row);
  }
  if (candidates.length !== 1) throw new ManagementFailure("RESPONSE");
  const row = candidates[0];
  if (
    !row.arguments ||
    typeof row.arguments !== "object" ||
    Array.isArray(row.arguments) ||
    typeof row.routing_key !== "string"
  )
    throw new ManagementFailure("RESPONSE");
  return row.routing_key === target.routingKey &&
    closedObject(row.arguments, Object.keys(target.arguments)) &&
    Object.entries(target.arguments).every(
      ([name, value]) => row.arguments[name] === value,
    )
    ? "confirmed"
    : "divergent";
}
