// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  mkdtemp,
  readFile,
  writeFile,
  mkdir,
  readdir,
  rm,
  stat,
  symlink,
  rename,
} from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { randomUUID } from "node:crypto";
import { MAX_PROFILE_BYTES } from "../../shared/profiles";
import { ProfileRepository, type StoredProfile } from "./repository";
vi.mock("node:fs/promises", async importOriginal => {
  const fs = await importOriginal<typeof import("node:fs/promises")>();
  return { ...fs, rename: vi.fn(fs.rename) };
});
let directory: string;
let repository: ProfileRepository;
const profile = (): StoredProfile => ({
  id: randomUUID(),
  name: "Isolado",
  environment: "development",
  httpsUrl: "https://localhost:15671",
  amqpsUrl: "amqps://localhost:5671",
  username: "tester",
  secret: { mode: "memory" },
});
beforeEach(async () => {
  directory = await mkdtemp(join(tmpdir(), "bunnies-repo-"));
  repository = new ProfileRepository(directory);
});
afterEach(async () => {
  await rm(directory, { recursive: true, force: true });
});
describe("bounded atomic profile JSON", () => {
  it("creates private versioned metadata, reloads it and leaves no temporary files", async () => {
    expect(await repository.read()).toEqual({
      revision: "absent",
      profiles: [],
    });
    const saved = await repository.write("absent", [profile()]);
    expect(await new ProfileRepository(directory).read()).toEqual(saved);
    expect(await readFile(repository.file, "utf8")).toContain(
      '"schemaVersion": 1',
    );
    expect(await readdir(directory)).toEqual(["profiles.json"]);
    if (process.platform !== "win32")
      expect((await stat(repository.file)).mode & 0o777).toBe(0o600);
  });
  it.each([
    "{",
    JSON.stringify({ schemaVersion: 99 }),
    JSON.stringify({
      schemaVersion: 1,
      writeId: randomUUID(),
      profiles: [{ ...profile(), password: "sentinel" }],
    }),
    "x".repeat(MAX_PROFILE_BYTES + 1),
  ])("preserves invalid or unknown configuration (%#)", async raw => {
    await writeFile(repository.file, raw);
    await expect(repository.read()).rejects.toMatchObject({ code: "CORRUPT" });
    await expect(repository.write("absent", [])).rejects.toMatchObject({
      code: "CORRUPT",
    });
    expect(await readFile(repository.file, "utf8")).toBe(raw);
    expect(await readdir(directory)).toEqual(["profiles.json"]);
  });
  it("rejects stale revisions and simultaneous writers, preserves a foreign lock", async () => {
    const result = await Promise.allSettled([
      repository.write("absent", [profile()]),
      new ProfileRepository(directory).write("absent", [profile()]),
    ]);
    expect(result.filter(item => item.status === "fulfilled")).toHaveLength(1);
    expect(result.filter(item => item.status === "rejected")).toHaveLength(1);
    const original = await readFile(repository.file, "utf8");
    await expect(repository.write("absent", [])).rejects.toMatchObject({
      code: "CONFLICT",
    });
    await mkdir(repository.file + ".lock");
    await expect(
      repository.write((await repository.read()).revision, []),
    ).rejects.toMatchObject({ code: "CONFLICT" });
    expect(await readFile(repository.file, "utf8")).toBe(original);
    expect((await stat(repository.file + ".lock")).isDirectory()).toBe(true);
  });
  it("reports disk failures instead of overwriting non-file paths or targets through symlinks", async () => {
    await mkdir(repository.file);
    await expect(repository.read()).rejects.toMatchObject({ code: "CORRUPT" });
    await rm(repository.file, { recursive: true });
    const target = join(directory, "original.json");
    await writeFile(target, "preserve");
    if (process.platform !== "win32") {
      await symlink(target, repository.file);
      await expect(repository.read()).rejects.toMatchObject({
        code: "UNAVAILABLE",
      });
      await expect(repository.write("absent", [])).rejects.toMatchObject({
        code: "UNAVAILABLE",
      });
      expect(await readFile(target, "utf8")).toBe("preserve");
    }
  });
  it("enforces 50 profiles, unique IDs and 2 MiB including ciphertext", async () => {
    await expect(
      repository.write("absent", Array.from({ length: 51 }, profile)),
    ).rejects.toMatchObject({ code: "LIMIT" });
    const huge = Array.from({ length: 50 }, () => ({
      ...profile(),
      secret: { mode: "protected" as const, ciphertext: "A".repeat(64 * 1024) },
    }));
    await expect(repository.write("absent", huge)).rejects.toMatchObject({
      code: "LIMIT",
    });
    const p = profile();
    await writeFile(
      repository.file,
      JSON.stringify({
        schemaVersion: 1,
        writeId: randomUUID(),
        profiles: [p, p],
      }),
    );
    await expect(repository.read()).rejects.toMatchObject({ code: "CORRUPT" });
  });
  it("preserves the previous file when the final conflict check fails and cleans its own temporary file", async () => {
    const saved = await repository.write("absent", [profile()]);
    const original = await readFile(repository.file, "utf8");
    const realRead = repository.read.bind(repository);
    vi.spyOn(repository, "read")
      .mockImplementationOnce(realRead)
      .mockResolvedValueOnce({ ...saved, revision: "changed" });
    await expect(repository.write(saved.revision, [])).rejects.toMatchObject({
      code: "CONFLICT",
    });
    expect(await readFile(repository.file, "utf8")).toBe(original);
    expect(await readdir(directory)).toEqual(["profiles.json"]);
  });
  it("preserves valid bytes and cleans temporary data when the atomic rename fails", async () => {
    const saved = await repository.write("absent", [profile()]);
    const original = await readFile(repository.file);
    vi.mocked(rename).mockRejectedValueOnce(
      Object.assign(new Error("synthetic write failure"), { code: "EACCES" }),
    );
    await expect(repository.write(saved.revision, [])).rejects.toMatchObject({
      code: "STORAGE",
    });
    expect(await readFile(repository.file)).toEqual(original);
    expect(await readdir(directory)).toEqual(["profiles.json"]);
  });
  it("preserves invalid UTF-8 instead of replacing bytes during the next save", async () => {
    const raw = Buffer.concat([
      Buffer.from('{"bad":"'),
      Buffer.from([0xff]),
      Buffer.from('"}'),
    ]);
    await writeFile(repository.file, raw);
    await expect(repository.read()).rejects.toMatchObject({ code: "CORRUPT" });
    expect(await readFile(repository.file)).toEqual(raw);
  });
});
