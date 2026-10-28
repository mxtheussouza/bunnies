import { randomUUID } from "node:crypto";
import {
  MAX_PROFILES,
  type ProfileSnapshot,
  type RemoveProfileInput,
  type SaveProfileInput,
  type SecretChange,
} from "../../shared/profiles";
import { SecretProtection } from "../security/secretProtection";
import {
  ProfileRepository,
  type StoredProfile,
  type StoredSecret,
  type StoredSnapshot,
} from "./repository";
import { ProfileFailure } from "./errors";

export class ProfileService {
  private pending: Promise<unknown> = Promise.resolve();
  private passwords = new Map<string, string>();
  private revision: string | undefined;
  private closed = false;
  private queued = 0;
  constructor(
    private readonly repository: ProfileRepository,
    readonly protection: SecretProtection,
  ) {}
  dispose() {
    this.closed = true;
    this.passwords.clear();
  }
  private queue<T>(operation: () => Promise<T>): Promise<T> {
    if (this.closed || this.queued >= 16)
      return Promise.reject(new ProfileFailure("UNAVAILABLE"));
    this.queued++;
    const result = this.pending.then(() => {
      if (this.closed) throw new ProfileFailure("UNAVAILABLE");
      return operation();
    });
    this.pending = result.catch(() => undefined);
    void result.then(
      () => {
        this.queued--;
      },
      () => {
        this.queued--;
      },
    );
    return result;
  }
  private async read() {
    const snapshot = await this.repository.read();
    // External changes invalidate all transient credentials, rather than reuse a password for changed metadata.
    if (this.revision !== snapshot.revision) this.passwords.clear();
    this.revision = snapshot.revision;
    return snapshot;
  }
  private summary(snapshot: StoredSnapshot): ProfileSnapshot {
    return {
      revision: snapshot.revision,
      profiles: snapshot.profiles.map(({ secret, ...fields }) => ({
        ...fields,
        secret: {
          saved: secret.mode === "protected",
          availableThisRun: this.passwords.has(fields.id),
        },
      })),
    };
  }
  list() {
    return this.queue(async () => this.summary(await this.read()));
  }
  private async prepare(
    change: SecretChange,
    previous: StoredSecret,
  ): Promise<{ stored: StoredSecret; password?: string; keep: boolean }> {
    if (change.action === "keep") return { stored: previous, keep: true };
    if (change.action === "remove")
      return { stored: { mode: "none" }, keep: false };
    if (change.mode === "memory")
      return {
        stored: { mode: "memory" },
        password: change.password,
        keep: false,
      };
    return {
      stored: {
        mode: "protected",
        ciphertext: await this.protection.encrypt(change.password),
      },
      password: change.password,
      keep: false,
    };
  }
  save(input: SaveProfileInput) {
    return this.queue(async () => {
      const snapshot = await this.read();
      if (snapshot.revision !== input.revision)
        throw new ProfileFailure("CONFLICT");
      const previous = snapshot.profiles.find(
        profile => profile.id === input.id,
      );
      if (input.id && !previous) throw new ProfileFailure("NOT_FOUND");
      if (!previous && snapshot.profiles.length >= MAX_PROFILES)
        throw new ProfileFailure("LIMIT");
      const id = previous?.id ?? randomUUID();
      const prepared = await this.prepare(
        input.secret,
        previous?.secret ?? { mode: "none" },
      );
      const profile: StoredProfile = {
        id,
        name: input.name,
        environment: input.environment,
        httpsUrl: input.httpsUrl,
        amqpsUrl: input.amqpsUrl,
        username: input.username,
        secret: prepared.stored,
      };
      const profiles = previous
        ? snapshot.profiles.map(item => (item.id === id ? profile : item))
        : [...snapshot.profiles, profile];
      if (this.closed) throw new ProfileFailure("UNAVAILABLE");
      const saved = await this.repository.write(snapshot.revision, profiles);
      if (!this.closed) {
        if (!prepared.keep) this.passwords.delete(id);
        if (prepared.password !== undefined)
          this.passwords.set(id, prepared.password);
      }
      this.revision = saved.revision;
      return this.summary(saved);
    });
  }
  remove(
    input: RemoveProfileInput,
    confirm: (profile: StoredProfile) => Promise<boolean>,
  ) {
    return this.queue(async () => {
      const snapshot = await this.read();
      if (snapshot.revision !== input.revision)
        throw new ProfileFailure("CONFLICT");
      const profile = snapshot.profiles.find(item => item.id === input.id);
      if (!profile) throw new ProfileFailure("NOT_FOUND");
      if (!(await confirm(profile))) throw new ProfileFailure("CANCELLED");
      // Revalidate the revision after the native dialog, including changes by another process.
      if (this.closed) throw new ProfileFailure("UNAVAILABLE");
      const saved = await this.repository.write(
        snapshot.revision,
        snapshot.profiles.filter(item => item.id !== input.id),
      );
      this.passwords.delete(input.id);
      this.revision = saved.revision;
      return this.summary(saved);
    });
  }
}
