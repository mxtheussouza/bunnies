// @vitest-environment node
import {
  beforeAll,
  afterAll,
  beforeEach,
  afterEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import {
  mkdtemp,
  writeFile,
  readFile,
  readdir,
  rm,
  rename,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import {
  createTlsFixture,
  type TlsFixture,
} from "../../../tools/testing/tls-fixture.cjs";
import { ProfileRepository } from "./repository";
import { ProfileService } from "./service";
import { SecretProtection } from "../security/secretProtection";
vi.mock("node:fs/promises", async importOriginal => {
  const fs = await importOriginal<typeof import("node:fs/promises")>();
  return { ...fs, rename: vi.fn(fs.rename) };
});
let directory: string;
let repo: ProfileRepository;
let fixture: TlsFixture;
const legacy = () => ({
  id: randomUUID(),
  name: "Legacy",
  environment: "development" as const,
  httpsUrl: "https://localhost:15671",
  amqpsUrl: "amqps://localhost:5671",
  username: "tester",
  secret: { mode: "protected", ciphertext: "c3ludGhldGlj" },
});
beforeAll(async () => {
  fixture = await createTlsFixture();
}, 20000);
afterAll(async () => {
  await fixture.cleanup();
});
beforeEach(async () => {
  directory = await mkdtemp(join(tmpdir(), "bunnies-migrate-"));
  repo = new ProfileRepository(directory);
});
afterEach(async () => {
  await rm(directory, { recursive: true, force: true });
});
describe("explicit v1 to v2 migration and CA persistence", () => {
  it("reads v1 without mutation and backs up exact original bytes before first v2 save", async () => {
    const raw = JSON.stringify({
      schemaVersion: 1,
      writeId: randomUUID(),
      profiles: [legacy()],
    });
    await writeFile(repo.file, raw);
    const old = await repo.read();
    expect(old.profiles[0].trust).toEqual({ mode: "default" });
    expect(await readdir(directory)).toEqual(["profiles.json"]);
    const saved = await repo.write(old.revision, old.profiles);
    expect(await readFile(repo.backup, "utf8")).toBe(raw);
    expect(JSON.parse(await readFile(repo.file, "utf8")).schemaVersion).toBe(2);
    expect(saved.profiles[0].secret).toEqual(old.profiles[0].secret);
    expect(await repo.read()).toEqual(saved);
  });
  it("refuses a foreign backup, preserves v1 on write failure and reuses only an identical backup", async () => {
    const raw = JSON.stringify({
      schemaVersion: 1,
      writeId: randomUUID(),
      profiles: [legacy()],
    });
    await writeFile(repo.file, raw);
    const old = await repo.read();
    await writeFile(repo.backup, "foreign");
    await expect(repo.write(old.revision, old.profiles)).rejects.toMatchObject({
      code: "CONFLICT",
    });
    expect(await readFile(repo.file, "utf8")).toBe(raw);
    expect(await readFile(repo.backup, "utf8")).toBe("foreign");
    await rm(repo.backup);
    vi.mocked(rename).mockRejectedValueOnce(
      new Error("synthetic disk failure"),
    );
    await expect(repo.write(old.revision, old.profiles)).rejects.toMatchObject({
      code: "STORAGE",
    });
    expect(await readFile(repo.file, "utf8")).toBe(raw);
    expect(await readFile(repo.backup, "utf8")).toBe(raw);
    await repo.write(old.revision, old.profiles);
    expect(await readFile(repo.backup, "utf8")).toBe(raw);
  });
  it("keeps CA selection on failed save, consumes it after success, and never exposes PEM/password in summaries", async () => {
    const protection = new SecretProtection({
      isAsyncEncryptionAvailable: vi.fn(),
      encryptStringAsync: vi.fn(),
      decryptStringAsync: vi.fn(),
    });
    const service = new ProfileService(repo, protection);
    try {
      const ca = await service.caSelections.select(
        1,
        async () => join(fixture.directory, "ca.pem"),
        () => true,
      );
      const value = {
        ...legacy(),
        secret: {
          action: "replace" as const,
          mode: "memory" as const,
          password: "CA-SAVE-SYNTHETIC-SENTINEL",
        },
        revision: "absent",
        trust: { action: "replace" as const, selectionId: ca!.selectionId },
      };
      const { id: _legacyId, ...input } = value;
      void _legacyId;
      vi.mocked(rename).mockRejectedValueOnce(new Error("synthetic failure"));
      await expect(service.save(input, 1)).rejects.toMatchObject({
        code: "STORAGE",
      });
      expect(service.caSelections.get(1, ca!.selectionId).mode).toBe("custom");
      const saved = await service.save(input, 1);
      expect(saved.profiles[0].trust).toMatchObject({
        mode: "custom",
        fingerprints: ca!.fingerprints,
      });
      expect(JSON.stringify(saved)).not.toMatch(
        /CERTIFICATE|CA-SAVE-SYNTHETIC-SENTINEL/,
      );
      expect(await readFile(repo.file, "utf8")).not.toContain(
        "CA-SAVE-SYNTHETIC-SENTINEL",
      );
      expect(() => service.caSelections.get(1, ca!.selectionId)).toThrow(
        "CA_SELECTION",
      );
      const edited = await service.save(
        {
          ...input,
          id: saved.profiles[0].id,
          revision: saved.revision,
          secret: { action: "keep" },
          trust: { action: "default" },
        },
        1,
      );
      expect(edited.profiles[0].trust).toEqual({ mode: "default" });
      expect(edited.profiles[0].secret.availableThisRun).toBe(true);
    } finally {
      service.dispose();
    }
  });
});
