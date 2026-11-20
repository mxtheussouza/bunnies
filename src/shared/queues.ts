export const QUEUE_PAGE_SIZE = 100;
export const MAX_QUEUE_PAGE = 2_147_483_647;
export const MAX_QUEUE_CONSUMERS = 100;

export function queueSegmentUnsupported(value: string): boolean {
  return value === "." || value === "..";
}

export function queueListRouteConflict(vhost: string): boolean {
  return vhost === "detailed";
}

export type QueueSummary = {
  name: string;
  type?: string;
  ready?: number;
  unacknowledged?: number;
  total?: number;
  consumers?: number;
};

export type QueueArguments = {
  "x-queue-type"?: string;
  "x-message-ttl"?: number;
  "x-max-length"?: number;
  "x-dead-letter-exchange"?: string;
  "x-dead-letter-routing-key"?: string;
};

export const QUEUE_DECLARATION_TIMEOUT_MS = 30_000;
export const MAX_QUEUE_DECLARATION_BODY = 2 * 1024;
export const MAX_QUEUE_ARGUMENT_INTEGER = 2_147_483_647;
export const QUEUE_OPTION_KEYS = [
  "x-message-ttl",
  "x-max-length",
  "x-dead-letter-exchange",
  "x-dead-letter-routing-key",
] as const;

export type QueueDeclaration = {
  name: string;
  type: "classic" | "quorum";
  arguments: Omit<QueueArguments, "x-queue-type">;
};

export type QueueConsumer = {
  tag: string;
  active?: boolean;
  acknowledgementRequired?: boolean;
};

export type QueuePage = {
  kind: "queuePage";
  vhost: string;
  page: number;
  pageCount: number;
  totalCount: number;
  filteredCount: number;
  items: QueueSummary[];
};

export type QueueDetail = {
  kind: "queueDetail";
  vhost: string;
  queue: QueueSummary & {
    durable?: boolean;
    exclusive?: boolean;
    autoDelete?: boolean;
    state?: string;
    arguments?: QueueArguments;
    consumerDetails?: { items: QueueConsumer[]; partial: boolean };
  };
};
