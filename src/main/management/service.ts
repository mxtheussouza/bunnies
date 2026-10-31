import type {
  ManagementInput,
  ManagementSnapshot,
} from "../../shared/management";
import { MANAGEMENT_TIMEOUT_MS } from "../../shared/management";
import type { SessionService } from "../sessions/sessionService";
import type { ProfileService } from "../profiles/service";
import { ProfileFailure } from "../profiles/errors";
import { readManagement, ManagementFailure } from "./httpsRead";
type Active = {
  owner: number;
  input: ManagementInput;
  controller: AbortController;
};
export class ManagementService {
  private active?: Active;
  private disposed = false;
  private unsubscribe: () => void;
  constructor(
    private readonly sessions: SessionService,
    private readonly profiles: ProfileService,
    private readonly read = readManagement,
  ) {
    this.unsubscribe = sessions.onChange(() => {
      const a = this.active;
      if (a)
        try {
          this.context(a);
        } catch {
          a.controller.abort(new ManagementFailure("CONFLICT"));
        }
    });
  }
  private context(a: Active) {
    if (this.disposed || this.active !== a)
      throw new ManagementFailure("CONFLICT");
    try {
      return this.sessions.managementContext(a.owner, a.input);
    } catch (error) {
      throw new ManagementFailure(
        error instanceof ProfileFailure && error.code === "CONFLICT"
          ? "CONFLICT"
          : "UNAVAILABLE",
      );
    }
  }
  async execute(
    owner: number,
    input: ManagementInput,
    kind: "broker" | "vhosts",
  ): Promise<ManagementSnapshot> {
    if (this.disposed) throw new ManagementFailure("UNAVAILABLE");
    if (this.active) throw new ManagementFailure("BUSY");
    const a: Active = { owner, input, controller: new AbortController() };
    this.active = a;
    const { signal } = a.controller;
    const timer = setTimeout(
      () => a.controller.abort(new ManagementFailure("TIMEOUT")),
      MANAGEMENT_TIMEOUT_MS,
    );
    let abort!: () => void;
    const aborted = new Promise<never>((_, reject) => {
      abort = () => reject(signal.reason);
      signal.addEventListener("abort", abort, { once: true });
    });
    const work = async (): Promise<ManagementSnapshot> => {
      const context = this.context(a);
      const profile = await this.profiles.connectionSnapshot(
        context.profileId,
        context.revision,
      );
      signal.throwIfAborted();
      this.context(a);
      const data = await this.read(
        profile,
        kind === "broker" ? { kind } : { kind, vhost: context.vhost },
        signal,
      );
      signal.throwIfAborted();
      this.context(a);
      await this.profiles.assertRevision(context.revision);
      signal.throwIfAborted();
      this.context(a);
      return {
        ...input,
        source: "https-management",
        checkedAt: new Date().toISOString(),
        ...data,
      };
    };
    try {
      return await Promise.race([work(), aborted]);
    } catch (error) {
      if (error instanceof ManagementFailure) throw error;
      if (error instanceof ProfileFailure)
        throw new ManagementFailure(
          error.code === "CONFLICT"
            ? "CONFLICT"
            : error.code === "CREDENTIALS"
              ? "CREDENTIALS"
              : "UNAVAILABLE",
        );
      throw new ManagementFailure("INTERNAL");
    } finally {
      clearTimeout(timer);
      signal.removeEventListener("abort", abort);
      a.controller.abort(new ManagementFailure("CANCELLED"));
      if (this.active === a) this.active = undefined;
    }
  }
  cancel(owner: number, input: ManagementInput): undefined {
    const a = this.active;
    if (
      a &&
      a.owner === owner &&
      a.input.operationId === input.operationId &&
      a.input.sessionId === input.sessionId &&
      a.input.generation === input.generation
    )
      a.controller.abort(new ManagementFailure("CANCELLED"));
    return undefined;
  }
  dispose() {
    this.disposed = true;
    this.unsubscribe();
    this.active?.controller.abort(new ManagementFailure("CANCELLED"));
  }
}
