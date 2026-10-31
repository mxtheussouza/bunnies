import type { SessionRef } from "./session";
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
    "Consulta recusada integralmente: limite de 200 vhosts, 256 KiB de resposta ou 16 KiB de cabeçalhos.",
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
export type ManagementSnapshot = ManagementInput & {
  source: "https-management";
  checkedAt: string;
} & (BrokerData | VhostsData);
export type ManagementRequest = {
  command: "getBrokerInfo" | "listSessionVhosts" | "cancelManagementRead";
  input: ManagementInput;
};
export interface ManagementApi {
  getBrokerInfo(
    input: ManagementInput,
  ): Promise<ManagementResult<ManagementSnapshot>>;
  listSessionVhosts(
    input: ManagementInput,
  ): Promise<ManagementResult<ManagementSnapshot>>;
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
  return (
    closedObject(v, ["sessionId", "generation", "operationId"]) &&
    managementId(v.sessionId) &&
    managementId(v.operationId) &&
    Number.isSafeInteger(v.generation) &&
    Number(v.generation) > 0
  );
}
export function isManagementSnapshot(
  value: unknown,
): value is ManagementSnapshot {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const v = value as Record<string, unknown>;
  const base = [
    "sessionId",
    "generation",
    "operationId",
    "source",
    "checkedAt",
    "kind",
  ];
  if (!v || typeof v !== "object" || !("kind" in v)) return false;
  const extra =
    v.kind === "broker"
      ? ["matrix"]
      : v.kind === "vhosts"
        ? ["names", "currentVhost", "currentVisible"]
        : null;
  if (
    !extra ||
    !closedObject(
      v,
      [...base, ...extra],
      v.kind === "broker" ? ["rabbitmqVersion", "managementVersion"] : [],
    )
  )
    return false;
  if (
    !isManagementInput({
      sessionId: v.sessionId,
      generation: v.generation,
      operationId: v.operationId,
    }) ||
    v.source !== "https-management" ||
    typeof v.checkedAt !== "string" ||
    v.checkedAt.length !== 24 ||
    !Number.isFinite(Date.parse(v.checkedAt)) ||
    new Date(v.checkedAt).toISOString() !== v.checkedAt
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
    Array.isArray(v.names) &&
    v.names.length <= MAX_VISIBLE_VHOSTS &&
    v.names.every(name => boundedManagementText(name, 255)) &&
    new Set(v.names).size === v.names.length &&
    typeof v.currentVisible === "boolean" &&
    v.currentVisible === v.names.includes(v.currentVhost)
  );
}
