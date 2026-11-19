import type { SessionRef } from "./session";
import {
  MAX_QUEUE_CONSUMERS,
  MAX_QUEUE_PAGE,
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
export type ManagementReadSnapshot = ManagementSnapshot | QueueSnapshot;
export type QueueListInput = ManagementInput & {
  page: number;
  search?: string;
};
export type QueueDetailInput = ManagementInput & { name: string };
export type ManagementRequest =
  | {
      command: "getBrokerInfo" | "listSessionVhosts" | "cancelManagementRead";
      input: ManagementInput;
    }
  | { command: "listSessionQueues"; input: QueueListInput }
  | { command: "getSessionQueue"; input: QueueDetailInput };
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

export function isQueueDetailInput(v: unknown): v is QueueDetailInput {
  return (
    closedObject(v, [...inputKeys, "name"]) &&
    isManagementRef(v) &&
    boundedManagementText(v.name, 255)
  );
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
