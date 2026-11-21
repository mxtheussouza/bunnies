import type { SessionRef } from "./session";
import {
  exchangeTypes,
  type ExchangeDeclaration,
  bindingDirection,
  bindingIdentity,
  bindingText,
  EXCHANGE_PAGE_SIZE,
  exchangeSegmentUnsupported,
  MAX_BINDING_ID_BYTES,
  MAX_EXCHANGE_BINDINGS,
  type BindingDirection,
  type ExchangeBinding,
  type ExchangeBindings,
  type ExchangeData,
  type ExchangeDetail,
  type ExchangePage,
} from "./exchanges";
import {
  MAX_QUEUE_CONSUMERS,
  MAX_QUEUE_PAGE,
  MAX_QUEUE_ARGUMENT_INTEGER,
  QUEUE_OPTION_KEYS,
  type QueueDeclaration,
  QUEUE_PAGE_SIZE,
  queueListRouteConflict,
  queueSegmentUnsupported,
  type QueueDetail,
  type QueuePage,
} from "./queues";
export const MANAGEMENT_CHANNEL = "bunnies:management";
export const MANAGEMENT_TIMEOUT_MS = 10_000;
export const MAX_MANAGEMENT_BODY = 256 * 1024;
export const MAX_MANAGEMENT_HEADERS = 16 * 1024;
export const MAX_VISIBLE_VHOSTS = 200;
export const managementErrors = {
  FORBIDDEN: "Esta janela não pode executar a consulta administrativa.",
  VALIDATION: "A consulta administrativa solicitada é inválida.",
  UNAVAILABLE:
    "Conecte uma sessão com HTTPS disponível e mantenha a janela ativa para consultar.",
  BUSY: "Aguarde ou cancele a consulta administrativa em andamento.",
  CONFLICT: "O contexto da sessão ou do perfil mudou. Consulte novamente.",
  AUTH: "O endpoint recusou a autenticação ou o acesso administrativo.",
  DENIED: "A consulta foi negada por permissão ou tag administrativa.",
  NOT_FOUND: "O recurso não foi encontrado ou não está visível neste endpoint.",
  RATE_LIMIT:
    "O endpoint limitou as consultas. Aguarde antes de tentar novamente.",
  SERVER: "O endpoint não conseguiu atender a consulta administrativa.",
  TLS: "A validação TLS falhou. Confira CA, validade e identidade do servidor.",
  NETWORK: "Não foi possível alcançar o endpoint HTTPS.",
  TIMEOUT: "A consulta excedeu o prazo total de 10 segundos.",
  CANCELLED: "Consulta cancelada. A sessão foi mantida.",
  REDIRECT: "O endpoint respondeu com redirecionamento; ele não foi seguido.",
  RESPONSE: "O endpoint devolveu uma resposta administrativa incompatível.",
  LIMIT:
    "Consulta recusada integralmente: limite de 256 KiB de resposta, 16 KiB de cabeçalhos ou 200 nomes na lista de vhosts.",
  QUEUE_SEGMENT:
    "A API de filas não permite consultar este segmento de nome com segurança.",
  QUEUE_LIST_ROUTE:
    "A listagem no vhost detailed está indisponível porque o RabbitMQ reserva esse caminho para uma consulta global.",
  QUEUE_PAGE:
    "A página de filas solicitada deixou de existir. Volte à primeira página.",
  EXCHANGE_SEGMENT:
    "A API de exchanges não permite consultar este segmento de nome com segurança.",
  EXCHANGE_PAGE:
    "A página de exchanges solicitada deixou de existir. Volte à primeira página.",
  EXCHANGE_BINDINGS_LIMIT:
    "O endpoint retornou mais de 200 bindings nesta direção. A lista não foi carregada.",
  EXCHANGE_DEFAULT_BINDINGS:
    "Os bindings implícitos da exchange padrão não são consultados por esta tela.",
  EXCHANGE_DECLARATION_CONFLICT:
    "A exchange existente tem propriedades incompatíveis com a declaração.",
  EXCHANGE_DECLARATION_REFUSED:
    "O RabbitMQ recusou os parâmetros da declaração da exchange.",
  EXCHANGE_DECLARATION_UNCERTAIN:
    "O resultado da declaração é incerto. Consulte a exchange antes de reenviar.",
  QUEUE_DECLARATION_CONFLICT:
    "A fila existente tem propriedades incompatíveis com a declaração.",
  QUEUE_DECLARATION_UNCERTAIN:
    "O resultado da declaração é incerto. Verifique a fila no broker antes de reenviar.",
  QUEUE_DECLARATION_REFUSED: "O RabbitMQ recusou os parâmetros da declaração.",
  QUEUE_PURGE_TYPE: "A limpeza de mensagens exige uma fila classic ou quorum.",
  QUEUE_PURGE_UNCERTAIN:
    "O resultado da limpeza é incerto. Verifique a fila antes de solicitar outra limpeza.",
  CREDENTIALS:
    "Revise usuário e senha disponíveis nesta execução; use texto UTF-8 e usuário sem dois-pontos.",
  INTERNAL: "Não foi possível concluir a consulta administrativa.",
} as const;
export type ManagementError = keyof typeof managementErrors;
export type ManagementResult<T> =
  | { ok: true; requestId: string; value: T }
  | {
      ok: false;
      requestId: string;
      error: { code: ManagementError; message: string };
    };
export type ManagementInput = SessionRef & { operationId: string };
export type BrokerData = {
  kind: "broker";
  rabbitmqVersion?: string;
  managementVersion?: string;
  matrix: "reference" | "outside" | "unknown";
};
export type VhostsData = {
  kind: "vhosts";
  names: string[];
  currentVhost: string;
  currentVisible: boolean;
};
export type ManagementSnapshotHeader = ManagementInput & {
  source: "https-management";
  checkedAt: string;
};
export type ManagementSnapshot = ManagementSnapshotHeader &
  (BrokerData | (VhostsData & { selectionId: string }));
export type QueueSnapshot<
  T extends QueuePage | QueueDetail = QueuePage | QueueDetail,
> = ManagementSnapshotHeader & T;
export type ExchangeSnapshot<T extends ExchangeData = ExchangeData> =
  ManagementSnapshotHeader & T;
export type ManagementReadSnapshot =
  ManagementSnapshot | QueueSnapshot | ExchangeSnapshot;
export type QueueListInput = ManagementInput & {
  page: number;
  search?: string;
};
export type QueueDetailInput = ManagementInput & { name: string };
export type ExchangeListInput = ManagementInput & {
  page: number;
  search?: string;
};
export type ExchangeDetailInput = ManagementInput & { name: string };
export type ExchangeBindingsInput = ExchangeDetailInput & {
  direction: BindingDirection;
};
export type QueueDeclarationInput = ManagementInput & {
  declaration: QueueDeclaration;
};
export type ExchangeDeclarationInput = ManagementInput & {
  declaration: ExchangeDeclaration;
};
export type QueueDeclarationSnapshot = DeclarationSnapshot<"queueDeclaration">;
export type ExchangeDeclarationSnapshot =
  DeclarationSnapshot<"exchangeDeclaration">;
export type DeclarationSnapshot<
  K extends "queueDeclaration" | "exchangeDeclaration",
> = ManagementSnapshotHeader & {
  kind: K;
  vhost: string;
  name: string;
} & (
    | { status: "confirmed" | "divergent" }
    | { status: "unverified" | "uncertain"; reason: ManagementError }
  );
export type QueuePurgeSnapshot = ManagementSnapshotHeader & {
  kind: "queuePurge";
  vhost: string;
  name: string;
} & ({ status: "accepted" } | { status: "uncertain"; reason: ManagementError });
export type ManagementResponse =
  | ManagementReadSnapshot
  | QueueDeclarationSnapshot
  | ExchangeDeclarationSnapshot
  | QueuePurgeSnapshot
  | undefined;

export type ManagementRequest =
  | {
      command:
        | "getBrokerInfo"
        | "listSessionVhosts"
        | "cancelManagementRead"
        | "cancelExchangeDeclaration"
        | "cancelQueueDeclaration"
        | "cancelQueuePurge";
      input: ManagementInput;
    }
  | { command: "listSessionQueues"; input: QueueListInput }
  | { command: "listSessionExchanges"; input: ExchangeListInput }
  | { command: "getSessionExchange"; input: ExchangeDetailInput }
  | { command: "listSessionExchangeBindings"; input: ExchangeBindingsInput }
  | {
      command: "getSessionQueue" | "purgeSessionQueue";
      input: QueueDetailInput;
    }
  | { command: "declareSessionExchange"; input: ExchangeDeclarationInput }
  | { command: "declareSessionQueue"; input: QueueDeclarationInput };
export interface ManagementApi {
  getBrokerInfo(
    input: ManagementInput,
  ): Promise<ManagementResult<ManagementSnapshot>>;
  listSessionVhosts(
    input: ManagementInput,
  ): Promise<ManagementResult<ManagementSnapshot>>;
  listSessionQueues(
    input: QueueListInput,
  ): Promise<ManagementResult<QueueSnapshot<QueuePage>>>;
  getSessionQueue(
    input: QueueDetailInput,
  ): Promise<ManagementResult<QueueSnapshot<QueueDetail>>>;
  listSessionExchanges(
    input: ExchangeListInput,
  ): Promise<ManagementResult<ExchangeSnapshot<ExchangePage>>>;
  getSessionExchange(
    input: ExchangeDetailInput,
  ): Promise<ManagementResult<ExchangeSnapshot<ExchangeDetail>>>;
  listSessionExchangeBindings(
    input: ExchangeBindingsInput,
  ): Promise<ManagementResult<ExchangeSnapshot<ExchangeBindings>>>;
  declareSessionExchange(
    input: ExchangeDeclarationInput,
  ): Promise<ManagementResult<ExchangeDeclarationSnapshot>>;
  cancelExchangeDeclaration(
    input: ManagementInput,
  ): Promise<ManagementResult<undefined>>;
  declareSessionQueue(
    input: QueueDeclarationInput,
  ): Promise<ManagementResult<QueueDeclarationSnapshot>>;
  cancelQueueDeclaration(
    input: ManagementInput,
  ): Promise<ManagementResult<undefined>>;
  purgeSessionQueue(
    input: QueueDetailInput,
  ): Promise<ManagementResult<QueuePurgeSnapshot>>;
  cancelQueuePurge(
    input: ManagementInput,
  ): Promise<ManagementResult<undefined>>;
  cancelManagementRead(
    input: ManagementInput,
  ): Promise<ManagementResult<undefined>>;
}
export function closedObject(
  value: unknown,
  required: string[],
  optional: string[] = [],
): value is Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const proto = Object.getPrototypeOf(value);
  return (
    (proto === Object.prototype || proto === null) &&
    required.every(key => Object.hasOwn(value, key)) &&
    Reflect.ownKeys(value).every(
      key =>
        typeof key === "string" &&
        [...required, ...optional].includes(key) &&
        Object.getOwnPropertyDescriptor(value, key)?.get === undefined,
    )
  );
}
export const managementId = (v: unknown): v is string =>
  typeof v === "string" &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(
    v,
  );
export function boundedManagementText(v: unknown, bytes: number): v is string {
  if (
    typeof v !== "string" ||
    !v ||
    v.length > bytes ||
    [...v].some(c => c.charCodeAt(0) < 32 || c.charCodeAt(0) === 127)
  )
    return false;
  try {
    encodeURIComponent(v);
    return new TextEncoder().encode(v).length <= bytes;
  } catch {
    return false;
  }
}
export function isManagementInput(v: unknown): v is ManagementInput {
  return closedObject(v, inputKeys) && isManagementRef(v);
}
const inputKeys = ["sessionId", "generation", "operationId"];
const snapshotKeys = [...inputKeys, "source", "checkedAt", "kind"];

function isManagementRef(value: Record<string, unknown>): boolean {
  return (
    managementId(value.sessionId) &&
    managementId(value.operationId) &&
    nonnegativeInteger(value.generation) &&
    value.generation > 0
  );
}

export function nonnegativeInteger(v: unknown): v is number {
  return typeof v === "number" && Number.isSafeInteger(v) && v >= 0;
}

export function isQueuePageNumber(v: unknown): v is number {
  return nonnegativeInteger(v) && v >= 1 && v <= MAX_QUEUE_PAGE;
}

export function isQueueListInput(v: unknown): v is QueueListInput {
  return (
    closedObject(v, [...inputKeys, "page"], ["search"]) &&
    isManagementRef(v) &&
    isQueuePageNumber(v.page) &&
    (!Object.hasOwn(v, "search") || boundedManagementText(v.search, 255))
  );
}

export const isExchangeListInput: (v: unknown) => v is ExchangeListInput =
  isQueueListInput;

function exchangeName(value: unknown): value is string {
  return value === "" || boundedManagementText(value, 255);
}

export function isExchangeDetailInput(v: unknown): v is ExchangeDetailInput {
  return (
    closedObject(v, [...inputKeys, "name"]) &&
    isManagementRef(v) &&
    exchangeName(v.name)
  );
}

export function isExchangeBindingsInput(
  v: unknown,
): v is ExchangeBindingsInput {
  return (
    closedObject(v, [...inputKeys, "name", "direction"]) &&
    isManagementRef(v) &&
    exchangeName(v.name) &&
    bindingDirection(v.direction)
  );
}

export function isQueueDetailInput(v: unknown): v is QueueDetailInput {
  return (
    closedObject(v, [...inputKeys, "name"]) &&
    isManagementRef(v) &&
    boundedManagementText(v.name, 255)
  );
}

export function isQueueDeclarationInput(
  value: unknown,
): value is QueueDeclarationInput {
  return (
    closedObject(value, [...inputKeys, "declaration"]) &&
    isManagementRef(value) &&
    isQueueDeclaration(value.declaration)
  );
}

export function isExchangeDeclarationInput(
  value: unknown,
): value is ExchangeDeclarationInput {
  return (
    closedObject(value, [...inputKeys, "declaration"]) &&
    isManagementRef(value) &&
    isExchangeDeclaration(value.declaration)
  );
}

export function isExchangeDeclarationSnapshot(
  value: unknown,
): value is ExchangeDeclarationSnapshot {
  return declarationSnapshot(value, "exchangeDeclaration");
}

export function isQueueDeclarationSnapshot(
  value: unknown,
): value is QueueDeclarationSnapshot {
  return declarationSnapshot(value, "queueDeclaration");
}

function declarationSnapshot(
  value: unknown,
  kind: "queueDeclaration" | "exchangeDeclaration",
) {
  const keys = [...snapshotKeys, "name", "vhost", "status"];
  if (
    !closedObject(value, keys, ["reason"]) ||
    value.kind !== kind ||
    !isSnapshotHeader(value) ||
    !boundedManagementText(value.name, 255) ||
    queueSegmentUnsupported(value.name) ||
    value.name.startsWith("amq.") ||
    !boundedManagementText(value.vhost, 255) ||
    queueSegmentUnsupported(value.vhost)
  )
    return false;
  if (value.status === "confirmed" || value.status === "divergent")
    return !Object.hasOwn(value, "reason");
  return (
    (value.status === "unverified" || value.status === "uncertain") &&
    typeof value.reason === "string" &&
    Object.hasOwn(managementErrors, value.reason)
  );
}

export function isQueuePurgeSnapshot(
  value: unknown,
): value is QueuePurgeSnapshot {
  if (
    !closedObject(
      value,
      [...snapshotKeys, "name", "vhost", "status"],
      ["reason"],
    ) ||
    value.kind !== "queuePurge" ||
    !isSnapshotHeader(value) ||
    !boundedManagementText(value.name, 255) ||
    queueSegmentUnsupported(value.name) ||
    !boundedManagementText(value.vhost, 255) ||
    queueSegmentUnsupported(value.vhost)
  )
    return false;
  if (value.status === "accepted") return !Object.hasOwn(value, "reason");
  return (
    value.status === "uncertain" &&
    typeof value.reason === "string" &&
    Object.hasOwn(managementErrors, value.reason)
  );
}

export function isExchangeDeclaration(
  value: unknown,
): value is ExchangeDeclaration {
  return (
    closedObject(value, ["name", "type", "durable", "autoDelete"]) &&
    boundedManagementText(value.name, 255) &&
    !exchangeSegmentUnsupported(value.name) &&
    !value.name.startsWith("amq.") &&
    exchangeTypes.some(type => type === value.type) &&
    typeof value.durable === "boolean" &&
    typeof value.autoDelete === "boolean"
  );
}

export function isQueueDeclaration(value: unknown): value is QueueDeclaration {
  if (
    !closedObject(value, ["name", "type", "arguments"]) ||
    !boundedManagementText(value.name, 255) ||
    queueSegmentUnsupported(value.name) ||
    value.name.startsWith("amq.") ||
    (value.type !== "classic" && value.type !== "quorum") ||
    !closedObject(value.arguments, [], [...QUEUE_OPTION_KEYS])
  )
    return false;
  const args = value.arguments;
  if (
    Object.hasOwn(args, "x-dead-letter-routing-key") &&
    !Object.hasOwn(args, "x-dead-letter-exchange")
  )
    return false;
  for (const key of QUEUE_OPTION_KEYS) {
    if (!Object.hasOwn(args, key)) continue;
    const field = args[key];
    if (key === "x-message-ttl" || key === "x-max-length") {
      if (!nonnegativeInteger(field) || field > MAX_QUEUE_ARGUMENT_INTEGER)
        return false;
    } else if (field !== "" && !boundedManagementText(field, 255)) return false;
  }
  return true;
}

function isSnapshotHeader(v: Record<string, unknown>) {
  return (
    isManagementRef(v) &&
    v.source === "https-management" &&
    typeof v.checkedAt === "string" &&
    v.checkedAt.length === 24 &&
    Number.isFinite(Date.parse(v.checkedAt)) &&
    new Date(v.checkedAt).toISOString() === v.checkedAt
  );
}

export function isManagementSnapshot(
  value: unknown,
): value is ManagementSnapshot {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const v = value as Record<string, unknown>;
  const extra =
    v.kind === "broker"
      ? ["matrix"]
      : v.kind === "vhosts"
        ? ["names", "currentVhost", "currentVisible", "selectionId"]
        : null;
  if (
    !extra ||
    !closedObject(
      v,
      [...snapshotKeys, ...extra],
      v.kind === "broker" ? ["rabbitmqVersion", "managementVersion"] : [],
    ) ||
    !isSnapshotHeader(v)
  )
    return false;
  if (v.kind === "broker")
    return (
      typeof v.matrix === "string" &&
      ["reference", "outside", "unknown"].includes(v.matrix) &&
      ["rabbitmqVersion", "managementVersion"].every(
        key => !Object.hasOwn(v, key) || boundedManagementText(v[key], 128),
      )
    );
  return (
    boundedManagementText(v.currentVhost, 255) &&
    managementId(v.selectionId) &&
    Array.isArray(v.names) &&
    v.names.length <= MAX_VISIBLE_VHOSTS &&
    v.names.every(name => boundedManagementText(name, 255)) &&
    new Set(v.names).size === v.names.length &&
    typeof v.currentVisible === "boolean" &&
    v.currentVisible === v.names.includes(v.currentVhost)
  );
}

const queueMetrics = ["ready", "unacknowledged", "total", "consumers"];
const queueProperties = [
  "durable",
  "exclusive",
  "autoDelete",
  "state",
  "arguments",
  "consumerDetails",
];
const queueTextArguments = [
  "x-dead-letter-exchange",
  "x-dead-letter-routing-key",
];
const queueNumericArguments = ["x-message-ttl", "x-max-length"];

function optionalField(
  value: Record<string, unknown>,
  key: string,
  validate: (field: unknown) => boolean,
) {
  return !Object.hasOwn(value, key) || validate(value[key]);
}

function isQueueArguments(value: unknown) {
  return (
    closedObject(
      value,
      [],
      ["x-queue-type", ...queueTextArguments, ...queueNumericArguments],
    ) &&
    optionalField(value, "x-queue-type", field =>
      boundedManagementText(field, 255),
    ) &&
    queueTextArguments.every(key =>
      optionalField(
        value,
        key,
        field => field === "" || boundedManagementText(field, 255),
      ),
    ) &&
    queueNumericArguments.every(key =>
      optionalField(value, key, nonnegativeInteger),
    )
  );
}

const isFlag = (field: unknown) => typeof field === "boolean";

function isQueueConsumers(value: unknown) {
  return (
    closedObject(value, ["items", "partial"]) &&
    Array.isArray(value.items) &&
    value.items.length <= MAX_QUEUE_CONSUMERS &&
    typeof value.partial === "boolean" &&
    (!value.partial || value.items.length === MAX_QUEUE_CONSUMERS) &&
    value.items.every(
      item =>
        closedObject(item, ["tag"], ["active", "acknowledgementRequired"]) &&
        boundedManagementText(item.tag, 255) &&
        optionalField(item, "active", isFlag) &&
        optionalField(item, "acknowledgementRequired", isFlag),
    )
  );
}

function isQueueRow(value: unknown, detail = false): boolean {
  return (
    closedObject(
      value,
      ["name"],
      ["type", ...queueMetrics, ...(detail ? queueProperties : [])],
    ) &&
    boundedManagementText(value.name, 255) &&
    optionalField(value, "type", field => boundedManagementText(field, 64)) &&
    queueMetrics.every(key => optionalField(value, key, nonnegativeInteger)) &&
    (!detail ||
      (!queueSegmentUnsupported(value.name) &&
        ["durable", "exclusive", "autoDelete"].every(key =>
          optionalField(value, key, isFlag),
        ) &&
        optionalField(value, "state", field =>
          boundedManagementText(field, 64),
        ) &&
        optionalField(value, "arguments", isQueueArguments) &&
        optionalField(value, "consumerDetails", isQueueConsumers)))
  );
}

export function isQueueSnapshot(value: unknown): value is QueueSnapshot {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const v = value as Record<string, unknown>;
  if (v.kind === "queueDetail")
    return (
      closedObject(v, [...snapshotKeys, "vhost", "queue"]) &&
      isSnapshotHeader(v) &&
      boundedManagementText(v.vhost, 255) &&
      !queueSegmentUnsupported(v.vhost) &&
      isQueueRow(v.queue, true)
    );
  return (
    v.kind === "queuePage" &&
    closedObject(v, [
      ...snapshotKeys,
      "vhost",
      "page",
      "pageCount",
      "totalCount",
      "filteredCount",
      "items",
    ]) &&
    isSnapshotHeader(v) &&
    boundedManagementText(v.vhost, 255) &&
    !queueSegmentUnsupported(v.vhost) &&
    !queueListRouteConflict(v.vhost) &&
    isQueuePageNumber(v.page) &&
    nonnegativeInteger(v.totalCount) &&
    nonnegativeInteger(v.filteredCount) &&
    v.filteredCount <= v.totalCount &&
    v.pageCount === Math.ceil(v.filteredCount / QUEUE_PAGE_SIZE) &&
    Array.isArray(v.items) &&
    v.items.length ===
      Math.min(
        QUEUE_PAGE_SIZE,
        Math.max(0, v.filteredCount - (v.page - 1) * QUEUE_PAGE_SIZE),
      ) &&
    v.items.every(item => isQueueRow(item)) &&
    new Set(v.items.map(item => item.name)).size === v.items.length
  );
}

const exchangeFields = ["name", "type", "durable", "autoDelete", "internal"];
const directionFields = ["name", "direction", "items"];

function isArgumentsJson(value: unknown): boolean {
  return (
    value === null ||
    (typeof value === "string" &&
      value.length <= 2 * MAX_MANAGEMENT_BODY &&
      value.startsWith("{") &&
      value.endsWith("}"))
  );
}

function isExchangeRow(value: unknown, detail = false) {
  return (
    closedObject(value, exchangeFields, detail ? ["argumentsJson"] : []) &&
    exchangeName(value.name) &&
    boundedManagementText(value.type, 255) &&
    ["durable", "autoDelete", "internal"].every(field =>
      isFlag(value[field]),
    ) &&
    (!detail ||
      (!exchangeSegmentUnsupported(value.name) &&
        optionalField(value, "argumentsJson", isArgumentsJson)))
  );
}

function isExchangeBinding(value: unknown): value is ExchangeBinding {
  return (
    closedObject(
      value,
      [
        "source",
        "destination",
        "destinationType",
        "routingKey",
        "propertiesKey",
      ],
      ["argumentsJson"],
    ) &&
    exchangeName(value.source) &&
    (value.destinationType === "exchange"
      ? exchangeName(value.destination)
      : value.destinationType === "queue" &&
        boundedManagementText(value.destination, 255)) &&
    bindingText(value.routingKey, 255) &&
    bindingText(value.propertiesKey, MAX_BINDING_ID_BYTES) &&
    optionalField(value, "argumentsJson", isArgumentsJson)
  );
}

export function isExchangeSnapshot(value: unknown): value is ExchangeSnapshot {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const v = value as Record<string, unknown>;
  if (
    !isSnapshotHeader(v) ||
    !boundedManagementText(v.vhost, 255) ||
    queueSegmentUnsupported(v.vhost)
  )
    return false;
  const keys = [...snapshotKeys, "vhost"];
  switch (v.kind) {
    case "exchangeDetail":
      return (
        closedObject(v, [...keys, "exchange"]) &&
        isExchangeRow(v.exchange, true)
      );
    case "exchangeBindings":
      return (
        closedObject(v, [...keys, ...directionFields]) &&
        boundedManagementText(v.name, 255) &&
        !exchangeSegmentUnsupported(v.name) &&
        bindingDirection(v.direction) &&
        Array.isArray(v.items) &&
        v.items.length <= MAX_EXCHANGE_BINDINGS &&
        v.items.every(
          item =>
            isExchangeBinding(item) &&
            (v.direction === "outgoing"
              ? item.source === v.name
              : item.destinationType === "exchange" &&
                item.destination === v.name),
        ) &&
        new Set(v.items.map(bindingIdentity)).size === v.items.length
      );
    case "exchangePage":
      return (
        closedObject(v, [
          ...keys,
          "page",
          "pageCount",
          "totalCount",
          "filteredCount",
          "items",
        ]) &&
        isQueuePageNumber(v.page) &&
        nonnegativeInteger(v.totalCount) &&
        nonnegativeInteger(v.filteredCount) &&
        v.filteredCount <= v.totalCount &&
        v.pageCount === Math.ceil(v.filteredCount / EXCHANGE_PAGE_SIZE) &&
        Array.isArray(v.items) &&
        v.items.length ===
          Math.min(
            EXCHANGE_PAGE_SIZE,
            Math.max(0, v.filteredCount - (v.page - 1) * EXCHANGE_PAGE_SIZE),
          ) &&
        v.items.every(item => isExchangeRow(item)) &&
        new Set(v.items.map(item => item.name)).size === v.items.length
      );
    default:
      return false;
  }
}
