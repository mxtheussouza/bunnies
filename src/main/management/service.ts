import type {
  ManagementInput,
  ManagementReadSnapshot,
  QueueDeclarationInput,
  QueueDeclarationSnapshot,
} from "../../shared/management";
import {
  QUEUE_DECLARATION_TIMEOUT_MS,
  queueSegmentUnsupported,
} from "../../shared/queues";
import { declareQueue, type DeclarationPhase } from "./queueDeclaration";
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
  kind: "read" | "declaration";
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
    private readonly declare = declareQueue,
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
    return this.run(
      owner,
      input,
      "read",
      typeof request === "object",
      async a => {
        const { signal } = a.controller;
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
      },
    );
  }

  async declareQueue(
    owner: number,
    input: QueueDeclarationInput,
    trusted: () => boolean,
  ): Promise<QueueDeclarationSnapshot> {
    const progress = { phase: "unsent" as DeclarationPhase, vhost: "" };
    const snapshot = () => ({
      kind: "queueDeclaration" as const,
      sessionId: input.sessionId,
      generation: input.generation,
      operationId: input.operationId,
      source: "https-management" as const,
      checkedAt: new Date().toISOString(),
      vhost: progress.vhost,
      name: input.declaration.name,
    });
    try {
      return await this.run(owner, input, "declaration", true, async active => {
        const context = this.context(active);
        progress.vhost = context.vhost;
        if (queueSegmentUnsupported(context.vhost))
          throw new ManagementFailure("QUEUE_SEGMENT");
        const profile = await this.profiles.connectionSnapshot(
          context.profileId,
          context.revision,
        );
        const { signal } = active.controller;
        const assertContext = async () => {
          signal.throwIfAborted();
          if (!trusted()) throw new ManagementFailure("FORBIDDEN");
          this.context(active);
          await this.profiles.assertRevision(context.revision);
          signal.throwIfAborted();
          if (!trusted()) throw new ManagementFailure("FORBIDDEN");
          this.context(active);
        };
        const status = await this.declare(
          profile,
          context.vhost,
          input.declaration,
          signal,
          phase => {
            progress.phase = phase;
          },
          assertContext,
        );
        await assertContext();
        return { ...snapshot(), status };
      });
    } catch (error) {
      const reason =
        error instanceof ManagementFailure ? error.code : "INTERNAL";
      if (progress.phase === "accepted")
        return { ...snapshot(), status: "unverified", reason };
      if (
        progress.phase === "sent" &&
        reason !== "DENIED" &&
        reason !== "QUEUE_DECLARATION_REFUSED" &&
        reason !== "QUEUE_DECLARATION_CONFLICT"
      )
        return { ...snapshot(), status: "uncertain", reason };
      throw error;
    }
  }

  private async run<T>(
    owner: number,
    input: ManagementInput,
    kind: Active["kind"],
    requireAmqps: boolean,
    work: (active: Active) => Promise<T>,
  ): Promise<T> {
    if (this.disposed) throw new ManagementFailure("UNAVAILABLE");
    if (this.active) throw new ManagementFailure("BUSY");
    const a: Active = {
      owner,
      input,
      requireAmqps,
      kind,
      controller: new AbortController(),
    };
    this.active = a;
    const { signal } = a.controller;
    const timer = setTimeout(
      () => a.controller.abort(new ManagementFailure("TIMEOUT")),
      kind === "read" ? MANAGEMENT_TIMEOUT_MS : QUEUE_DECLARATION_TIMEOUT_MS,
    );
    let abort!: () => void;
    const aborted = new Promise<never>((_, reject) => {
      abort = () => reject(signal.reason);
      signal.addEventListener("abort", abort, { once: true });
    });

    try {
      return await Promise.race([work(a), aborted]);
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
  cancel(
    owner: number,
    input: ManagementInput,
    kind: Active["kind"] = "read",
  ): undefined {
    const a = this.active;
    if (
      a &&
      a.owner === owner &&
      a.kind === kind &&
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
