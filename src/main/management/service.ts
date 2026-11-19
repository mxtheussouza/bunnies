import type {
  ManagementInput,
  ManagementReadSnapshot,
} from "../../shared/management";
import { MANAGEMENT_TIMEOUT_MS } from "../../shared/management";
import type { SessionService } from "../sessions/sessionService";
import type { ProfileService } from "../profiles/service";
import { ProfileFailure } from "../profiles/errors";
import {
  readManagement,
  ManagementFailure,
  type ManagementQuery,
} from "./httpsRead";
import type { SelectSessionVhostInput } from "../../shared/session";
import { queueRouteError, type QueueQuery } from "./queueRead";
import { VhostCatalog } from "./vhostCatalog";
type Read =
  | "broker"
  | "vhosts"
  | Omit<Extract<QueueQuery, { kind: "queuePage" }>, "vhost">
  | Omit<Extract<QueueQuery, { kind: "queueDetail" }>, "vhost">;
type Active = {
  owner: number;
  input: ManagementInput;
  requireAmqps: boolean;
  controller: AbortController;
};
export class ManagementService {
  private active?: Active;
  private disposed = false;
  private unsubscribe: () => void;
  private catalog = new VhostCatalog();
  constructor(
    private readonly sessions: SessionService,
    private readonly profiles: ProfileService,
    private readonly read = readManagement,
  ) {
    this.unsubscribe = sessions.onChange(() => {
      this.catalog.validateCurrent(
        c => this.sessions.managementContext(c.owner, c).revision,
      );
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
      return this.sessions.managementContext(a.owner, a.input, a.requireAmqps);
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
    request: Read,
  ): Promise<ManagementReadSnapshot> {
    if (this.disposed) throw new ManagementFailure("UNAVAILABLE");
    if (this.active) throw new ManagementFailure("BUSY");
    const a: Active = {
      owner,
      input,
      requireAmqps: typeof request === "object",
      controller: new AbortController(),
    };
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
    const work = async (): Promise<ManagementReadSnapshot> => {
      const context = this.context(a);
      const query: ManagementQuery =
        request === "broker"
          ? { kind: request }
          : request === "vhosts"
            ? { kind: request, vhost: context.vhost }
            : { ...request, vhost: context.vhost };
      if (query.kind === "queuePage" || query.kind === "queueDetail") {
        const routeError = queueRouteError(query);
        if (routeError) throw new ManagementFailure(routeError);
      }
      const profile = await this.profiles.connectionSnapshot(
        context.profileId,
        context.revision,
      );
      signal.throwIfAborted();
      this.context(a);
      const data = await this.read(profile, query, signal);
      signal.throwIfAborted();
      this.context(a);
      await this.profiles.assertRevision(context.revision);
      signal.throwIfAborted();
      this.context(a);
      const header = {
        sessionId: input.sessionId,
        generation: input.generation,
        operationId: input.operationId,
        source: "https-management" as const,
        checkedAt: new Date().toISOString(),
      };
      if (data.kind !== query.kind) throw new ManagementFailure("RESPONSE");
      if (data.kind === "queuePage" || data.kind === "queueDetail") {
        if (data.vhost !== context.vhost)
          throw new ManagementFailure("RESPONSE");
      }
      if (data.kind !== "vhosts") return { ...header, ...data };
      const selectionId = this.catalog.replace(
        {
          owner,
          sessionId: input.sessionId,
          generation: input.generation,
          revision: context.revision,
        },
        data.names,
      );
      return { ...header, ...data, selectionId };
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
  authorizeVhost(owner: number, input: SelectSessionVhostInput) {
    if (this.disposed) throw new ProfileFailure("UNAVAILABLE");
    const { revision } = this.sessions.managementContext(owner, input);
    this.catalog.authorize(owner, revision, input);
  }
  dispose() {
    this.disposed = true;
    this.catalog.clear();
    this.unsubscribe();
    this.active?.controller.abort(new ManagementFailure("CANCELLED"));
  }
}
