import {
  bindingDirection,
  bindingIdentity,
  bindingText,
  EXCHANGE_PAGE_SIZE,
  exchangeSegmentUnsupported,
  MAX_BINDING_ID_BYTES,
  MAX_EXCHANGE_BINDINGS,
  type BindingDirection,
  type ExchangeBinding,
  type ExchangeData,
  type ExchangeRow,
} from "../../shared/exchanges";
import {
  boundedManagementText,
  isQueuePageNumber,
  nonnegativeInteger,
} from "../../shared/management";
import { queueSegmentUnsupported } from "../../shared/queues";
import { ManagementFailure } from "./httpsTransport";

export type ExchangeQuery =
  | { kind: "exchangePage"; vhost: string; page: number; search?: string }
  | { kind: "exchangeDetail"; vhost: string; name: string }
  | {
      kind: "exchangeBindings";
      vhost: string;
      name: string;
      direction: BindingDirection;
    };

const exchangeColumns = "vhost,name,type,durable,auto_delete,internal";
const bindingColumns =
  "vhost,source,destination,destination_type,routing_key,arguments,properties_key";

export function assertExchangeRoute(query: ExchangeQuery): void {
  if (
    !boundedManagementText(query.vhost, 255) ||
    queueSegmentUnsupported(query.vhost)
  )
    throw new ManagementFailure("EXCHANGE_SEGMENT");
  if (query.kind === "exchangePage") {
    if (
      !isQueuePageNumber(query.page) ||
      (query.search !== undefined && !boundedManagementText(query.search, 255))
    )
      throw new ManagementFailure("VALIDATION");
    return;
  }
  if (
    (query.name !== "" && !boundedManagementText(query.name, 255)) ||
    exchangeSegmentUnsupported(query.name)
  )
    throw new ManagementFailure("EXCHANGE_SEGMENT");
  if (query.kind === "exchangeBindings") {
    if (!bindingDirection(query.direction))
      throw new ManagementFailure("VALIDATION");
    if (query.name === "")
      throw new ManagementFailure("EXCHANGE_DEFAULT_BINDINGS");
  }
}

export function exchangePath(query: ExchangeQuery): string {
  assertExchangeRoute(query);
  const base = "/api/exchanges/" + encodeURIComponent(query.vhost);
  if (query.kind === "exchangePage") {
    const params = new URLSearchParams({
      disable_stats: "true",
      pagination: "true",
      page_size: String(EXCHANGE_PAGE_SIZE),
      page: String(query.page),
      sort: "name",
      use_regex: "false",
      columns: exchangeColumns,
    });
    if (query.search !== undefined) params.set("name", query.search);
    return base + "?" + params;
  }
  const resource =
    base +
    "/" +
    (query.name === "" ? "amq.default" : encodeURIComponent(query.name));
  if (query.kind === "exchangeDetail")
    return (
      resource +
      "?" +
      new URLSearchParams({
        disable_stats: "true",
        columns: exchangeColumns + ",arguments",
      })
    );
  const side = query.direction === "outgoing" ? "source" : "destination";
  return (
    resource +
    "/bindings/" +
    side +
    "?" +
    new URLSearchParams({ columns: bindingColumns })
  );
}

function invalid(): never {
  throw new ManagementFailure("RESPONSE");
}

function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) invalid();
  return value as Record<string, unknown>;
}

function text(value: unknown, max: number, empty = false): string {
  if ((empty && value === "") || boundedManagementText(value, max))
    return value;
  return invalid();
}

function flag(value: unknown): boolean {
  return typeof value === "boolean" ? value : invalid();
}

function count(value: unknown): number {
  return nonnegativeInteger(value) ? value : invalid();
}

function unsafeNumber(value: unknown): boolean {
  if (typeof value === "number")
    return (
      !Number.isFinite(value) ||
      (Number.isInteger(value) && !Number.isSafeInteger(value))
    );
  return (
    value !== null &&
    typeof value === "object" &&
    Object.values(value).some(unsafeNumber)
  );
}

function projectArguments(row: Record<string, unknown>) {
  if (!Object.hasOwn(row, "arguments")) return {};
  const args = record(row.arguments);
  return { argumentsJson: unsafeNumber(args) ? null : JSON.stringify(args) };
}

function exchangeRow(row: Record<string, unknown>, vhost: string): ExchangeRow {
  if (row.vhost !== vhost) invalid();
  return {
    name: text(row.name, 255, true),
    type: text(row.type, 255),
    durable: flag(row.durable),
    autoDelete: flag(row.auto_delete),
    internal: flag(row.internal),
  };
}

function bindingRow(
  value: unknown,
  query: Extract<ExchangeQuery, { kind: "exchangeBindings" }>,
): ExchangeBinding {
  const row = record(value);
  const kind = row.destination_type;
  if (row.vhost !== query.vhost || (kind !== "queue" && kind !== "exchange"))
    invalid();
  const source = text(row.source, 255, true);
  const destination = text(row.destination, 255, kind === "exchange");
  if (
    query.direction === "outgoing"
      ? source !== query.name
      : kind !== "exchange" || destination !== query.name
  )
    invalid();
  if (
    !bindingText(row.routing_key, 255) ||
    !bindingText(row.properties_key, MAX_BINDING_ID_BYTES)
  )
    invalid();
  return {
    source,
    destination,
    destinationType: kind,
    routingKey: row.routing_key,
    propertiesKey: row.properties_key,
    ...projectArguments(row),
  };
}

export function parseExchangeBody(
  value: unknown,
  query: ExchangeQuery,
): ExchangeData {
  if (query.kind === "exchangeBindings") {
    if (!Array.isArray(value)) invalid();
    if (value.length > MAX_EXCHANGE_BINDINGS)
      throw new ManagementFailure("EXCHANGE_BINDINGS_LIMIT");
    const items = value.map(item => bindingRow(item, query));
    if (new Set(items.map(bindingIdentity)).size !== items.length) invalid();
    return {
      kind: query.kind,
      vhost: query.vhost,
      name: query.name,
      direction: query.direction,
      items,
    };
  }

  const row = record(value);
  if (query.kind === "exchangeDetail") {
    const exchange = exchangeRow(row, query.vhost);
    if (exchange.name !== query.name) invalid();
    return {
      kind: query.kind,
      vhost: query.vhost,
      exchange: { ...exchange, ...projectArguments(row) },
    };
  }

  const totalCount = count(row.total_count);
  const filteredCount = count(row.filtered_count);
  const pageCount = count(row.page_count);
  const expectedSize = Math.min(
    EXCHANGE_PAGE_SIZE,
    Math.max(0, filteredCount - (query.page - 1) * EXCHANGE_PAGE_SIZE),
  );
  if (
    row.page !== query.page ||
    row.page_size !== EXCHANGE_PAGE_SIZE ||
    filteredCount > totalCount ||
    (query.search === undefined && filteredCount !== totalCount) ||
    pageCount !== Math.ceil(filteredCount / EXCHANGE_PAGE_SIZE) ||
    !Array.isArray(row.items) ||
    row.item_count !== expectedSize ||
    row.items.length !== expectedSize
  )
    invalid();

  const items = row.items.map(item => exchangeRow(record(item), query.vhost));
  if (new Set(items.map(item => item.name)).size !== items.length) invalid();
  return {
    kind: query.kind,
    vhost: query.vhost,
    page: query.page,
    pageCount,
    totalCount,
    filteredCount,
    items,
  };
}
