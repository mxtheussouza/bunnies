import type { TrustChange, TrustSummary } from "./connections";
export const PROFILES_CHANNEL = "bunnies:profiles";
export const MAX_PROFILES = 50;
export const MAX_PROFILE_BYTES = 2 * 1024 * 1024;
export const environments = [
  "development",
  "staging",
  "production",
  "other",
] as const;
export type ProfileEnvironment = (typeof environments)[number];
export const environmentLabels: Record<ProfileEnvironment, string> = {
  development: "Desenvolvimento",
  staging: "Homologação",
  production: "Produção",
  other: "Outro",
};
export type ProfileFields = {
  name: string;
  environment: ProfileEnvironment;
  httpsUrl: string;
  amqpsUrl: string;
  username: string;
};
export type SecretChange =
  | { action: "keep" }
  | { action: "remove" }
  | { action: "replace"; mode: "memory" | "protected"; password: string };
export type SaveProfileInput = ProfileFields & {
  id?: string;
  revision: string;
  secret: SecretChange;
  trust?: TrustChange;
};
export type RemoveProfileInput = { id: string; revision: string };
export type ProfileSummary = ProfileFields & {
  id: string;
  secret: { saved: boolean; availableThisRun: boolean };
  trust: TrustSummary;
};
export type ProfileSnapshot = { revision: string; profiles: ProfileSummary[] };
export type SecretProtectionStatus = {
  persistence: "enabled" | "disabled";
  reason: "verified" | "unverified" | "unavailable";
};
export const profileErrorMessages = {
  FORBIDDEN: "Esta janela não pode gerenciar perfis.",
  VALIDATION: "Revise os campos, protocolos e limites do perfil.",
  UNAVAILABLE: "Não foi possível acessar os perfis neste momento.",
  CONFLICT:
    "Os perfis foram alterados ou estão em uso. Recarregue a lista antes de tentar novamente.",
  CORRUPT:
    "O arquivo de perfis é inválido ou usa uma versão desconhecida. O original foi preservado.",
  STORAGE:
    "Não foi possível gravar os perfis. Recarregue a lista para conferir o estado.",
  LIMIT: "O limite é de 50 perfis e 2 MiB de configuração.",
  NOT_FOUND: "O perfil não existe mais. Recarregue a lista.",
  PROTECTION:
    "A proteção de senha pelo sistema não está comprovada ou está indisponível. Use memória ou tente novamente mais tarde.",
  CANCELLED: "Remoção cancelada. O perfil foi mantido.",
  INTERNAL: "Não foi possível concluir a operação com o perfil.",
  CA_INVALID:
    "Selecione um bundle PEM válido, apenas com certificados de CA e sem chaves privadas.",
  CA_LIMIT: "A CA deve conter até 16 certificados e 256 KiB.",
  CA_SELECTION:
    "A seleção de CA expirou ou foi descartada. Selecione o arquivo novamente.",
  CREDENTIALS: "Informe a senha nesta execução antes de testar HTTPS.",
  TEST_CANCELLED: "Teste HTTPS cancelado. Nenhuma sessão foi ativada.",
  TEST_TIMEOUT: "O teste HTTPS excedeu o prazo total de 10 segundos.",
  TEST_NETWORK: "Não foi possível alcançar o endpoint HTTPS.",
  TEST_TLS:
    "A validação TLS falhou. Confira CA, validade e identidade do servidor.",
  TEST_CREDENTIAL_FORMAT:
    "Para HTTPS, o usuário não pode conter dois-pontos; usuário e senha devem ser texto UTF-8 válido.",
  TEST_AUTH: "Autenticação HTTPS recusada. Confira usuário e senha.",
  TEST_FORBIDDEN: "O acesso HTTPS foi negado por permissão.",
  TEST_REDIRECT:
    "O endpoint respondeu com redirecionamento. Confira a URL; ele não foi seguido.",
  TEST_RESPONSE:
    "O endpoint não devolveu uma resposta de autenticação compatível dentro dos limites.",
} as const;
export type ProfileErrorCode = keyof typeof profileErrorMessages;
export type ProfileResult<T> =
  | { ok: true; requestId: string; value: T }
  | {
      ok: false;
      requestId: string;
      error: { code: ProfileErrorCode; message: string };
    };
export type ProfileRequest =
  | { command: "listProfiles" | "getSecretProtectionStatus" }
  | { command: "saveProfile"; input: SaveProfileInput }
  | { command: "removeProfile"; input: RemoveProfileInput };
export interface ProfilesApi {
  listProfiles(): Promise<ProfileResult<ProfileSnapshot>>;
  saveProfile(input: SaveProfileInput): Promise<ProfileResult<ProfileSnapshot>>;
  removeProfile(
    input: RemoveProfileInput,
  ): Promise<ProfileResult<ProfileSnapshot>>;
  getSecretProtectionStatus(): Promise<ProfileResult<SecretProtectionStatus>>;
}
