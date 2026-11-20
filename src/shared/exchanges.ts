export const EXCHANGE_PAGE_SIZE = 100;
export const MAX_EXCHANGE_BINDINGS = 200;
export const MAX_BINDING_ID_BYTES = 1024;

export type BindingDirection = "incoming" | "outgoing";
export type ExchangeRow = {
  name: string;
  type: string;
  durable: boolean;
  autoDelete: boolean;
  internal: boolean;
};
export type ExchangePage = {
  kind: "exchangePage";
  vhost: string;
  page: number;
  pageCount: number;
  totalCount: number;
  filteredCount: number;
  items: ExchangeRow[];
};
export type ExchangeDetail = {
  kind: "exchangeDetail";
  vhost: string;
  exchange: ExchangeRow & { argumentsJson?: string | null };
};
export type ExchangeBinding = {
  source: string;
  destination: string;
  destinationType: "exchange" | "queue";
  routingKey: string;
  propertiesKey: string;
  argumentsJson?: string | null;
};
export type ExchangeBindings = {
  kind: "exchangeBindings";
  vhost: string;
  name: string;
  direction: BindingDirection;
  items: ExchangeBinding[];
};
export type ExchangeData = ExchangePage | ExchangeDetail | ExchangeBindings;

export function exchangeSegmentUnsupported(name: unknown): boolean {
  return name === "." || name === ".." || name === "amq.default";
}

export function bindingIdentity(binding: ExchangeBinding): string {
  return JSON.stringify([
    binding.source,
    binding.destinationType,
    binding.destination,
    binding.propertiesKey,
  ]);
}

export function bindingDirection(value: unknown): value is BindingDirection {
  return value === "incoming" || value === "outgoing";
}

export function bindingText(value: unknown, bytes: number): value is string {
  return (
    typeof value === "string" &&
    value.length <= bytes &&
    !/[\uD800-\uDFFF]/u.test(value) &&
    new TextEncoder().encode(value).length <= bytes
  );
}
