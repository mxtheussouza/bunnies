import { isUtf8 } from "node:buffer";
import { constants } from "node:fs";
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

export type StoredSecret =
  { mode: "memory" | "none" } | { mode: "protected"; ciphertext: string };
export type StoredProfile = ProfileFields & {
  id: string;
  secret: StoredSecret;
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
function validProfile(value: unknown): value is StoredProfile {
  return (
    exactObject(value, [
      "id",
      "name",
      "environment",
      "httpsUrl",
      "amqpsUrl",
      "username",
      "secret",
    ]) &&
    validId(value.id) &&
    validFields(value) &&
    validStoredSecret(value.secret)
  );
}
function code(error: unknown) {
  return (error as NodeJS.ErrnoException)?.code;
}

export class ProfileRepository {
  readonly file: string;
  constructor(private readonly directory: string) {
    this.file = join(directory, "profiles.json");
  }
  async read(): Promise<StoredSnapshot> {
    let bytes: Buffer;
    try {
      const file = await open(
        this.file,
        constants.O_RDONLY | (constants.O_NOFOLLOW ?? 0),
      );
      try {
        const stat = await file.stat();
        if (!stat.isFile() || stat.size > MAX_PROFILE_BYTES)
          throw new ProfileFailure("CORRUPT");
        // Read at most the budget + sentinel byte, even if the file grows after stat.
        const buffer = Buffer.alloc(MAX_PROFILE_BYTES + 1);
        let length = 0;
        while (length < buffer.length) {
          const { bytesRead } = await file.read(
            buffer,
            length,
            buffer.length - length,
            null,
          );
          if (!bytesRead) break;
          length += bytesRead;
        }
        if (length > MAX_PROFILE_BYTES) throw new ProfileFailure("CORRUPT");
        bytes = buffer.subarray(0, length);
      } finally {
        await file.close();
      }
    } catch (error) {
      if (code(error) === "ENOENT") return { revision: "absent", profiles: [] };
      if (error instanceof ProfileFailure) throw error;
      throw new ProfileFailure("UNAVAILABLE");
    }
    try {
      if (!isUtf8(bytes)) throw new ProfileFailure("CORRUPT");
      const data: unknown = JSON.parse(bytes.toString("utf8"));
      if (
        !exactObject(data, ["schemaVersion", "writeId", "profiles"]) ||
        data.schemaVersion !== 1 ||
        !validId(data.writeId) ||
        !Array.isArray(data.profiles) ||
        data.profiles.length > MAX_PROFILES ||
        !data.profiles.every(validProfile) ||
        new Set(data.profiles.map(profile => profile.id)).size !==
          data.profiles.length
      )
        throw new ProfileFailure("CORRUPT");
      return {
        revision: createHash("sha256").update(bytes).digest("hex"),
        profiles: data.profiles,
      };
    } catch {
      throw new ProfileFailure("CORRUPT");
    }
  }
  async write(
    expected: string,
    profiles: StoredProfile[],
  ): Promise<StoredSnapshot> {
    if (profiles.length > MAX_PROFILES) throw new ProfileFailure("LIMIT");
    if (
      !profiles.every(validProfile) ||
      new Set(profiles.map(profile => profile.id)).size !== profiles.length
    )
      throw new ProfileFailure("VALIDATION");
    const bytes = Buffer.from(
      JSON.stringify(
        { schemaVersion: 1, writeId: randomUUID(), profiles },
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
      if ((await this.read()).revision !== expected)
        throw new ProfileFailure("CONFLICT");
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
      return {
        revision: createHash("sha256").update(bytes).digest("hex"),
        profiles,
      };
    } catch (error) {
      if (error instanceof ProfileFailure) throw error;
      throw new ProfileFailure("STORAGE");
    } finally {
      // Clean only resources created by this operation. A stale foreign lock is never removed.
      await rm(temporary, { force: true }).catch(() => undefined);
      if (locked) await rm(lock, { recursive: true }).catch(() => undefined);
    }
  }
}
