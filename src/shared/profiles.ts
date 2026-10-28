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
};
export type RemoveProfileInput = { id: string; revision: string };
export type ProfileSummary = ProfileFields & {
  id: string;
  secret: { saved: boolean; availableThisRun: boolean };
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
