// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { SaveProfileInput } from "../../shared/profiles";
import { SecretProtection } from "../security/secretProtection";
import { ProfileRepository } from "./repository";
import { ProfileService } from "./service";
let directory: string;
let repository: ProfileRepository;
let service: ProfileService;
const provider = {
  isAsyncEncryptionAvailable: vi.fn(),
  encryptStringAsync: vi.fn(),
  decryptStringAsync: vi.fn(),
};
const input = (revision = "absent"): SaveProfileInput => ({
  name: "Isolado",
  environment: "production",
  httpsUrl: "https://localhost:15671",
  amqpsUrl: "amqps://localhost:5671",
  username: "synthetic-user",
  revision,
  secret: {
    action: "replace",
    mode: "memory",
    password: "ONLY-MEMORY-SENTINEL",
  },
});
beforeEach(async () => {
  directory = await mkdtemp(join(tmpdir(), "bunnies-service-"));
  repository = new ProfileRepository(directory);
  service = new ProfileService(repository, new SecretProtection(provider));
});
afterEach(async () => {
  service.dispose();
  await rm(directory, { recursive: true, force: true });
});
describe("local profiles and transient secrets", () => {
  it("never returns or persists the password, preserves metadata on restart and drops transient credentials", async () => {
    const saved = await service.save(input());
    expect(saved.profiles[0].secret).toEqual({
      saved: false,
      availableThisRun: true,
    });
    expect(JSON.stringify(saved)).not.toContain("ONLY-MEMORY-SENTINEL");
    expect(await readFile(repository.file, "utf8")).not.toContain(
      "ONLY-MEMORY-SENTINEL",
    );
    service.dispose();
    service = new ProfileService(repository, new SecretProtection(provider));
    const reopened = await service.list();
    expect(reopened.profiles[0].id).toBe(saved.profiles[0].id);
    expect(reopened.profiles[0].secret).toEqual({
      saved: false,
      availableThisRun: false,
    });
  });
  it("supports explicit keep, replace and remove without repopulating a form", async () => {
    const first = await service.save(input());
    const id = first.profiles[0].id;
    const kept = await service.save({
      ...input(first.revision),
      id,
      name: "Renomeado",
      secret: { action: "keep" },
    });
    expect(kept.profiles[0].secret.availableThisRun).toBe(true);
    const removed = await service.save({
      ...input(kept.revision),
      id,
      secret: { action: "remove" },
    });
    expect(removed.profiles[0].secret.availableThisRun).toBe(false);
    expect(
      (await service.save({ ...input(removed.revision), id })).profiles[0]
        .secret.availableThisRun,
    ).toBe(true);
  });
  it("preserves the previous secret and file after provider failure or disk error", async () => {
    const first = await service.save(input());
    const id = first.profiles[0].id;
    const bytes = await readFile(repository.file, "utf8");
    await expect(
      service.save({
        ...input(first.revision),
        id,
        secret: {
          action: "replace",
          mode: "protected",
          password: "NEW-SENTINEL",
        },
      }),
    ).rejects.toMatchObject({ code: "PROTECTION" });
    vi.spyOn(repository, "write").mockRejectedValueOnce(
      new Error("synthetic disk failure"),
    );
    await expect(
      service.save({
        ...input(first.revision),
        id,
        secret: { action: "remove" },
      }),
    ).rejects.toThrow();
    expect(await readFile(repository.file, "utf8")).toBe(bytes);
    expect((await service.list()).profiles[0].secret.availableThisRun).toBe(
      true,
    );
  });
  it("serializes changes, rejects stale edits and invalidates credentials on external writes", async () => {
    const result = await Promise.allSettled([
      service.save(input()),
      service.save(input()),
    ]);
    expect(result.map(item => item.status)).toEqual(["fulfilled", "rejected"]);
    const snapshot = await repository.read();
    await new ProfileRepository(directory).write(
      snapshot.revision,
      snapshot.profiles.map(p => ({ ...p, username: "changed-externally" })),
    );
    expect((await service.list()).profiles[0].secret.availableThisRun).toBe(
      false,
    );
  });
  it("requires native confirmation, revalidates after it and removes only the local profile", async () => {
    const first = await service.save(input());
    const id = first.profiles[0].id;
    const request = { id, revision: first.revision };
    await expect(
      service.remove(request, async () => false),
    ).rejects.toMatchObject({ code: "CANCELLED" });
    expect((await service.list()).profiles).toHaveLength(1);
    await expect(
      service.remove(request, async () => {
        const current = await repository.read();
        await new ProfileRepository(directory).write(
          current.revision,
          current.profiles,
        );
        return true;
      }),
    ).rejects.toMatchObject({ code: "CONFLICT" });
    const latest = await service.list();
    expect(
      (
        await service.remove(
          { id, revision: latest.revision },
          async () => true,
        )
      ).profiles,
    ).toEqual([]);
  });
  it("preserves stored ciphertext when protection is gated, and only replaces/removes it explicitly", async () => {
    const saved = await service.save({
      ...input(),
      secret: { action: "remove" },
    });
    const disk = await repository.read();
    disk.profiles[0].secret = { mode: "protected", ciphertext: "c3ludGhldGlj" };
    const protectedFile = await repository.write(disk.revision, disk.profiles);
    const list = await service.list();
    expect(list.profiles[0].secret).toEqual({
      saved: true,
      availableThisRun: false,
    });
    expect(JSON.stringify(list)).not.toContain("c3ludGhldGlj");
    const kept = await service.save({
      ...input(protectedFile.revision),
      id: saved.profiles[0].id,
      secret: { action: "keep" },
    });
    expect((await repository.read()).profiles[0].secret).toEqual(
      disk.profiles[0].secret,
    );
    expect(kept.profiles[0].secret.saved).toBe(true);
    const removed = await service.save({
      ...input(kept.revision),
      id: saved.profiles[0].id,
      secret: { action: "remove" },
    });
    expect(removed.profiles[0].secret.saved).toBe(false);
  });
  it("rejects operations after disposal and clears secrets", async () => {
    await service.save(input());
    service.dispose();
    await expect(service.list()).rejects.toMatchObject({ code: "UNAVAILABLE" });
  });
  it("bounds queued operations while the user is deciding a native confirmation", async () => {
    const saved = await service.save(input());
    let confirm!: (value: boolean) => void;
    let entered!: () => void;
    const ready = new Promise<void>(resolve => {
      entered = resolve;
    });
    const removal = service.remove(
      { id: saved.profiles[0].id, revision: saved.revision },
      () => {
        entered();
        return new Promise(resolve => {
          confirm = resolve;
        });
      },
    );
    await ready;
    const queued = Array.from({ length: 15 }, () => service.list());
    await expect(service.list()).rejects.toMatchObject({ code: "UNAVAILABLE" });
    confirm(true);
    expect((await removal).profiles).toEqual([]);
    await Promise.all(queued);
  });
});
