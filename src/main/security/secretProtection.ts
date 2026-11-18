import type { SecretProtectionStatus } from "../../shared/profiles";
import { ProfileFailure } from "../profiles/errors";

export interface AsyncSecretProvider {
  isAsyncEncryptionAvailable(): Promise<boolean>;
  encryptStringAsync(value: string): Promise<Buffer>;
  decryptStringAsync(
    value: Buffer,
  ): Promise<{ result: string; shouldReEncrypt: boolean }>;
}
// Evidence is main-owned. Availability, OS name or a renderer flag cannot create it.
export type ProviderEvidence = {
  provider:
    "keychain" | "dpapi" | "portal" | "secret-service" | "fallback" | "unknown";
  reopen: boolean;
  unavailability: boolean;
  rotation: boolean;
  release: boolean;
};
export class SecretProtection {
  constructor(
    private readonly provider: AsyncSecretProvider,
    private readonly evidence?: ProviderEvidence,
  ) {}
  async status(): Promise<SecretProtectionStatus> {
    const e = this.evidence;
    if (
      !e ||
      ["unknown", "fallback"].includes(e.provider) ||
      !e.reopen ||
      !e.unavailability ||
      !e.rotation ||
      !e.release
    )
      return { persistence: "disabled", reason: "unverified" };
    try {
      if (await this.provider.isAsyncEncryptionAvailable())
        return { persistence: "enabled", reason: "verified" };
    } catch {
      /* Privileged provider errors never leave the adapter. */
    }
    return { persistence: "disabled", reason: "unavailable" };
  }
  private async requireProtection() {
    if ((await this.status()).persistence !== "enabled")
      throw new ProfileFailure("PROTECTION");
  }
  async encrypt(password: string): Promise<string> {
    await this.requireProtection();
    try {
      const bytes = await this.provider.encryptStringAsync(password);
      if (!Buffer.isBuffer(bytes) || !bytes.length || bytes.length > 48 * 1024)
        throw new Error();
      return bytes.toString("base64");
    } catch {
      throw new ProfileFailure("PROTECTION");
    }
  }
  async restore(
    ciphertext: string,
  ): Promise<{ password: string; ciphertext: string }> {
    await this.requireProtection();
    try {
      const result = await this.provider.decryptStringAsync(
        Buffer.from(ciphertext, "base64"),
      );
      if (
        typeof result.result !== "string" ||
        !result.result.length ||
        result.result.length > 4096 ||
        result.result.includes("\0") ||
        typeof result.shouldReEncrypt !== "boolean"
      )
        throw new Error();
      // Rotation encrypts the recovered value; never overwrite the old ciphertext on failure.
      return {
        password: result.result,
        ciphertext: result.shouldReEncrypt
          ? await this.encrypt(result.result)
          : ciphertext,
      };
    } catch {
      throw new ProfileFailure("PROTECTION");
    }
  }
}
