import {
  boundedManagementText,
  isQueuePageNumber,
  nonnegativeInteger,
} from "../../shared/management";
import {
  MAX_QUEUE_CONSUMERS,
  QUEUE_PAGE_SIZE,
  queueListRouteConflict,
  queueSegmentUnsupported,
  type QueueArguments,
  type QueueConsumer,
  type QueueDetail,
  type QueuePage,
  type QueueSummary,
} from "../../shared/queues";

export type QueueQuery =
  | { kind: "queuePage"; vhost: string; page: number; search?: string }
  | { kind: "queueDetail"; vhost: string; name: string };

const queueColumns = [
  "name",
  "vhost",
  "type",
  "messages_ready",
  "messages_unacknowledged",
  "messages",
  "consumers",
];
const detailColumns = [
  ...queueColumns,
  "durable",
  "exclusive",
  "auto_delete",
  "state",
  "arguments",
  "consumer_details.consumer_tag",
  "consumer_details.active",
  "consumer_details.ack_required",
];

export function queueRouteError(query: QueueQuery) {
  if (
    queueSegmentUnsupported(query.vhost) ||
    (query.kind === "queueDetail" && queueSegmentUnsupported(query.name))
  )
    return "QUEUE_SEGMENT";
  if (query.kind === "queuePage" && queueListRouteConflict(query.vhost))
    return "QUEUE_LIST_ROUTE";
}

export function queuePath(query: QueueQuery): string | undefined {
  if (!boundedManagementText(query.vhost, 255)) return undefined;
  const path = "/api/queues/" + encodeURIComponent(query.vhost);
  if (query.kind === "queueDetail") {
    if (!boundedManagementText(query.name, 255)) return undefined;
    return (
      path +
      "/" +
      encodeURIComponent(query.name) +
      "?" +
      new URLSearchParams({ columns: detailColumns.join(",") })
    );
  }
  if (
    !isQueuePageNumber(query.page) ||
    (query.search !== undefined && !boundedManagementText(query.search, 255))
  )
    return undefined;
  const params = new URLSearchParams({
    pagination: "true",
    page_size: String(QUEUE_PAGE_SIZE),
    page: String(query.page),
    sort: "name",
    use_regex: "false",
    columns: queueColumns.join(","),
  });
  if (query.search !== undefined) params.set("name", query.search);
  return path + "?" + params;
}

function invalid(): never {
  throw new Error("Invalid queue response");
}
function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) invalid();
  return value as Record<string, unknown>;
}
function text(value: unknown, max = 255): string {
  return boundedManagementText(value, max) ? value : invalid();
}
function count(value: unknown): number {
  return nonnegativeInteger(value) ? value : invalid();
}
function flag(value: unknown): boolean {
  return typeof value === "boolean" ? value : invalid();
}

function summary(row: Record<string, unknown>, vhost: string): QueueSummary {
  if (row.vhost !== vhost) invalid();
  return {
    name: text(row.name),
    ...(row.type === undefined ? {} : { type: text(row.type, 64) }),
    ...(row.messages_ready === undefined
      ? {}
      : { ready: count(row.messages_ready) }),
    ...(row.messages_unacknowledged === undefined
      ? {}
      : { unacknowledged: count(row.messages_unacknowledged) }),
    ...(row.messages === undefined ? {} : { total: count(row.messages) }),
    ...(row.consumers === undefined ? {} : { consumers: count(row.consumers) }),
  };
}

function projectedArguments(value: unknown): QueueArguments {
  const source = record(value);
  const result: QueueArguments = {};
  for (const key of ["x-message-ttl", "x-max-length"] as const)
    if (Object.hasOwn(source, key)) result[key] = count(source[key]);
  for (const key of [
    "x-queue-type",
    "x-dead-letter-exchange",
    "x-dead-letter-routing-key",
  ] as const)
    if (Object.hasOwn(source, key))
      result[key] =
        source[key] === "" && key !== "x-queue-type" ? "" : text(source[key]);
  return result;
}

function projectedConsumers(value: unknown) {
  if (!Array.isArray(value)) invalid();
  const items = value
    .slice(0, MAX_QUEUE_CONSUMERS)
    .map((item): QueueConsumer => {
      const consumer = record(item);
      return {
        tag: text(consumer.consumer_tag),
        ...(consumer.active === undefined
          ? {}
          : { active: flag(consumer.active) }),
        ...(consumer.ack_required === undefined
          ? {}
          : { acknowledgementRequired: flag(consumer.ack_required) }),
      };
    });
  return { items, partial: value.length > MAX_QUEUE_CONSUMERS };
}

export function parseQueueBody(
  value: unknown,
  query: QueueQuery,
): QueuePage | QueueDetail {
  const data = record(value);
  if (query.kind === "queueDetail") {
    const queue = summary(data, query.vhost);
    if (queue.name !== query.name) invalid();
    return {
      kind: query.kind,
      vhost: query.vhost,
      queue: {
        ...queue,
        ...(data.durable === undefined ? {} : { durable: flag(data.durable) }),
        ...(data.exclusive === undefined
          ? {}
          : { exclusive: flag(data.exclusive) }),
        ...(data.auto_delete === undefined
          ? {}
          : { autoDelete: flag(data.auto_delete) }),
        ...(data.state === undefined ? {} : { state: text(data.state, 64) }),
        ...(data.arguments === undefined
          ? {}
          : { arguments: projectedArguments(data.arguments) }),
        ...(data.consumer_details === undefined
          ? {}
          : { consumerDetails: projectedConsumers(data.consumer_details) }),
      },
    };
  }
  const totalCount = count(data.total_count);
  const filteredCount = count(data.filtered_count);
  const pageCount = count(data.page_count);
  const expectedSize = Math.min(
    QUEUE_PAGE_SIZE,
    Math.max(0, filteredCount - (query.page - 1) * QUEUE_PAGE_SIZE),
  );
  if (
    data.page !== query.page ||
    data.page_size !== QUEUE_PAGE_SIZE ||
    filteredCount > totalCount ||
    (query.search === undefined && filteredCount !== totalCount) ||
    pageCount !== Math.ceil(filteredCount / QUEUE_PAGE_SIZE) ||
    !Array.isArray(data.items) ||
    data.item_count !== expectedSize ||
    data.items.length !== expectedSize
  )
    invalid();
  const items = data.items.map(item => summary(record(item), query.vhost));
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
