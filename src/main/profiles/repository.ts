import { isUtf8 } from "node:buffer";
import { open, mkdir, rename, rm } from "node:fs/promises";
import { createHash, randomUUID } from "node:crypto";
import { join } from "node:path";
import {
  MAX_PROFILES,
  MAX_PROFILE_BYTES,
  type ProfileFields,
} from "../../shared/profiles";
import { exactObject, validFields, validId } from "./validation";
import { ProfileFailure } from "./errors";
import { FileLimitFailure, readBoundedFile } from "../security/boundedFile";
import { validStoredTrust, type StoredTrust } from "../security/profileCa";
export type StoredSecret =
  { mode: "memory" | "none" } | { mode: "protected"; ciphertext: string };
export type StoredProfile = ProfileFields & {
  id: string;
  secret: StoredSecret;
  trust: StoredTrust;
};
export type StoredSnapshot = { revision: string; profiles: StoredProfile[] };
export function validStoredSecret(value: unknown): value is StoredSecret {
  if (
    exactObject(value, ["mode"]) &&
    (value.mode === "memory" || value.mode === "none")
  )
    return true;
  return (
    exactObject(value, ["mode", "ciphertext"]) &&
    value.mode === "protected" &&
    typeof value.ciphertext === "string" &&
    value.ciphertext.length > 0 &&
    value.ciphertext.length <= 64 * 1024 &&
    value.ciphertext.length % 4 === 0 &&
    /^[A-Za-z0-9+/]+={0,2}$/.test(value.ciphertext)
  );
}
function validProfile(value: unknown, version: 1 | 2): boolean {
  return (
    exactObject(value, [
      "id",
      "name",
      "environment",
      "httpsUrl",
      "amqpsUrl",
      "username",
      "secret",
      ...(version === 2 ? ["trust"] : []),
    ]) &&
    validId(value.id) &&
    validFields(value) &&
    validStoredSecret(value.secret) &&
    (version === 1 || validStoredTrust(value.trust))
  );
}
function code(error: unknown) {
  return (error as NodeJS.ErrnoException)?.code;
}
const revision = (bytes: Buffer) =>
  createHash("sha256").update(bytes).digest("hex");
export class ProfileRepository {
  readonly file: string;
  readonly backup: string;
  constructor(private readonly directory: string) {
    this.file = join(directory, "profiles.json");
    this.backup = join(directory, "profiles.v1.backup.json");
  }
  private async load(): Promise<{
    snapshot: StoredSnapshot;
    bytes: Buffer | null;
    version: 1 | 2 | null;
  }> {
    let bytes: Buffer;
    try {
      bytes = await readBoundedFile(this.file, MAX_PROFILE_BYTES);
    } catch (error) {
      if (code(error) === "ENOENT")
        return {
          snapshot: { revision: "absent", profiles: [] },
          bytes: null,
          version: null,
        };
      throw new ProfileFailure(
        error instanceof FileLimitFailure ? "CORRUPT" : "UNAVAILABLE",
      );
    }
    try {
      if (!isUtf8(bytes)) throw new Error();
      const data: unknown = JSON.parse(bytes.toString("utf8"));
      if (
        !exactObject(data, ["schemaVersion", "writeId", "profiles"]) ||
        (data.schemaVersion !== 1 && data.schemaVersion !== 2) ||
        !validId(data.writeId) ||
        !Array.isArray(data.profiles) ||
        data.profiles.length > MAX_PROFILES ||
        !data.profiles.every(profile =>
          validProfile(profile, data.schemaVersion as 1 | 2),
        ) ||
        new Set(data.profiles.map(profile => profile.id)).size !==
          data.profiles.length
      )
        throw new Error();
      const profiles: StoredProfile[] = data.profiles.map(profile =>
        data.schemaVersion === 1
          ? { ...profile, trust: { mode: "default" } }
          : profile,
      );
      return {
        snapshot: { revision: revision(bytes), profiles },
        bytes,
        version: data.schemaVersion,
      };
    } catch {
      throw new ProfileFailure("CORRUPT");
    }
  }
  async read(): Promise<StoredSnapshot> {
    return (await this.load()).snapshot;
  }
  private async preserveV1(bytes: Buffer) {
    let output;
    try {
      output = await open(this.backup, "wx", 0o600);
    } catch (error) {
      if (code(error) !== "EEXIST") throw error;
      let backup: Buffer;
      try {
        backup = await readBoundedFile(this.backup, MAX_PROFILE_BYTES);
      } catch {
        throw new ProfileFailure("CONFLICT");
      }
      if (!backup.equals(bytes)) throw new ProfileFailure("CONFLICT");
      return;
    }
    try {
      await output.writeFile(bytes);
      await output.sync();
    } catch (error) {
      await output.close();
      await rm(this.backup, { force: true }).catch(() => undefined);
      throw error;
    }
    await output.close();
  }
  async write(
    expected: string,
    profiles: StoredProfile[],
  ): Promise<StoredSnapshot> {
    if (profiles.length > MAX_PROFILES) throw new ProfileFailure("LIMIT");
    if (
      !profiles.every(profile => validProfile(profile, 2)) ||
      new Set(profiles.map(profile => profile.id)).size !== profiles.length
    )
      throw new ProfileFailure("VALIDATION");
    const bytes = Buffer.from(
      JSON.stringify(
        { schemaVersion: 2, writeId: randomUUID(), profiles },
        null,
        2,
      ) + "\n",
    );
    if (bytes.length > MAX_PROFILE_BYTES) throw new ProfileFailure("LIMIT");
    const lock = this.file + ".lock";
    const temporary = join(this.directory, `.profiles-${randomUUID()}.tmp`);
    let locked = false;
    try {
      await mkdir(this.directory, { recursive: true, mode: 0o700 });
      try {
        await mkdir(lock, { mode: 0o700 });
        locked = true;
      } catch (error) {
        if (code(error) === "EEXIST") throw new ProfileFailure("CONFLICT");
        throw error;
      }
      const previous = await this.load();
      if (previous.snapshot.revision !== expected)
        throw new ProfileFailure("CONFLICT");
      if (previous.version === 1 && previous.bytes)
        await this.preserveV1(previous.bytes);
      const output = await open(temporary, "wx", 0o600);
      try {
        await output.writeFile(bytes);
        await output.sync();
      } finally {
        await output.close();
      }
      if ((await this.read()).revision !== expected)
        throw new ProfileFailure("CONFLICT");
      await rename(temporary, this.file);
      return { revision: revision(bytes), profiles };
    } catch (error) {
      if (error instanceof ProfileFailure) throw error;
      throw new ProfileFailure("STORAGE");
    } finally {
      await rm(temporary, { force: true }).catch(() => undefined);
      if (locked) await rm(lock, { recursive: true }).catch(() => undefined);
    }
  }
}
