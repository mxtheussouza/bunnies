// @vitest-environment node
import { describe, expect, it, vi } from "vitest";
import { SecretProtection, type ProviderEvidence } from "./secretProtection";
const evidence: ProviderEvidence = {
  provider: "keychain",
  reopen: true,
  unavailability: true,
  rotation: true,
  release: true,
};
function provider() {
  return {
    isAsyncEncryptionAvailable: vi.fn().mockResolvedValue(true),
    encryptStringAsync: vi
      .fn()
      .mockResolvedValue(Buffer.from("synthetic-ciphertext")),
    decryptStringAsync: vi.fn().mockResolvedValue({
      result: "synthetic-sentinel",
      shouldReEncrypt: false,
    }),
  };
}
describe("asynchronous secret protection gate", () => {
  it.each([
    undefined,
    { ...evidence, provider: "unknown" as const },
    { ...evidence, provider: "fallback" as const },
    { ...evidence, reopen: false },
    { ...evidence, release: false },
    { ...evidence, rotation: false },
    { ...evidence, unavailability: false },
  ])(
    "fails closed for unverified evidence (%#), even with availability",
    async proof => {
      const p = provider();
      const adapter = new SecretProtection(p, proof);
      expect(await adapter.status()).toEqual({
        persistence: "disabled",
        reason: "unverified",
      });
      await expect(adapter.encrypt("sentinel")).rejects.toMatchObject({
        code: "PROTECTION",
      });
      expect(p.isAsyncEncryptionAvailable).not.toHaveBeenCalled();
      expect(p.encryptStringAsync).not.toHaveBeenCalled();
    },
  );
  it("handles temporarily unavailable, absent or failing providers without privileged errors", async () => {
    const p = provider();
    const adapter = new SecretProtection(p, evidence);
    p.isAsyncEncryptionAvailable.mockResolvedValue(false);
    expect((await adapter.status()).persistence).toBe("disabled");
    p.isAsyncEncryptionAvailable.mockRejectedValue(
      new Error("raw sentinel /keychain"),
    );
    await expect(adapter.encrypt("secret")).rejects.toMatchObject({
      message: "PROTECTION",
    });
    p.isAsyncEncryptionAvailable.mockResolvedValue(true);
    p.encryptStringAsync.mockRejectedValue(new Error("raw secret"));
    await expect(adapter.encrypt("secret")).rejects.toMatchObject({
      message: "PROTECTION",
    });
    p.decryptStringAsync.mockRejectedValue(new Error("raw secret"));
    await expect(adapter.restore("YQ==")).rejects.toMatchObject({
      message: "PROTECTION",
    });
  });
  it("supports fake verified provider, reopen and rotation; failed rotation preserves the old ciphertext", async () => {
    const p = provider();
    const adapter = new SecretProtection(p, evidence);
    const ciphertext = await adapter.encrypt("synthetic-sentinel");
    expect(ciphertext).not.toContain("synthetic-sentinel");
    expect(await new SecretProtection(p, evidence).restore(ciphertext)).toEqual(
      { password: "synthetic-sentinel", ciphertext },
    );
    p.decryptStringAsync.mockResolvedValue({
      result: "synthetic-sentinel",
      shouldReEncrypt: true,
    });
    p.encryptStringAsync.mockResolvedValue(Buffer.from("rotated"));
    expect((await adapter.restore(ciphertext)).ciphertext).toBe(
      Buffer.from("rotated").toString("base64"),
    );
    p.encryptStringAsync.mockRejectedValue(new Error("locked"));
    await expect(adapter.restore(ciphertext)).rejects.toMatchObject({
      code: "PROTECTION",
    });
    expect(ciphertext).toBe(
      Buffer.from("synthetic-ciphertext").toString("base64"),
    );
  });
});
