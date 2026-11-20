import type {
  ManagementInput,
  ManagementReadSnapshot,
  QueueDetailInput,
  QueueDeclarationInput,
  QueueDeclarationSnapshot,
  QueuePurgeSnapshot,
} from "../../shared/management";
import type { ProfileEnvironment } from "../../shared/profiles";
import {
  QUEUE_DECLARATION_TIMEOUT_MS,
  queueSegmentUnsupported,
} from "../../shared/queues";
import { declareQueue, type DeclarationPhase } from "./queueDeclaration";
import {
  inspectPurgeQueue,
  purgeQueue,
  QUEUE_PURGE_TIMEOUT_MS,
} from "./queuePurge";
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
  kind: "read" | "declaration" | "purge";
  controller: AbortController;
  confirmation?: Promise<boolean>;
};
export type QueuePurgeTarget = {
  profileName: string;
  environment: ProfileEnvironment;
  httpsUrl: string;
  vhost: string;
  name: string;
  queueType: "classic" | "quorum";
};
const PURGE_CONFIRMATION_TIMEOUT_MS = 60_000;

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
    private readonly inspectPurge = inspectPurgeQueue,
    private readonly purge = purgeQueue,
  ) {
    this.unsubscribe = sessions.onChange(() => {
      this.catalog.validateCurrent(
        c => this.sessions.managementContext(c.owner, c).revision,
      );
      const a = this.active;
      if (a)
        try {
          this.context(a, !!a.confirmation);
        } catch {
          a.controller.abort(new ManagementFailure("CONFLICT"));
        }
    });
  }
  private context(a: Active, awaitingNativeDialog = false) {
    if (this.disposed || this.active !== a)
      throw new ManagementFailure("CONFLICT");
    try {
      return this.sessions.managementContext(
        a.owner,
        a.input,
        a.requireAmqps,
        awaitingNativeDialog,
      );
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

  async purgeQueue(
    owner: number,
    input: QueueDetailInput,
    trustedActiveWindow: () => boolean,
    confirm: (
      target: QueuePurgeTarget,
      signal: AbortSignal,
    ) => Promise<boolean>,
  ): Promise<QueuePurgeSnapshot> {
    let sent = false;
    let vhost = "";
    const snapshot = () => ({
      kind: "queuePurge" as const,
      sessionId: input.sessionId,
      generation: input.generation,
      operationId: input.operationId,
      source: "https-management" as const,
      checkedAt: new Date().toISOString(),
      vhost,
      name: input.name,
    });
    try {
      return await this.run(
        owner,
        input,
        "purge",
        true,
        async (active, setDeadline) => {
          const context = this.context(active);
          vhost = context.vhost;
          const { signal } = active.controller;
          const assertContext = async () => {
            signal.throwIfAborted();
            if (!trustedActiveWindow())
              throw new ManagementFailure("FORBIDDEN");
            this.context(active);
            await this.profiles.assertRevision(context.revision);
            signal.throwIfAborted();
            if (!trustedActiveWindow())
              throw new ManagementFailure("FORBIDDEN");
            this.context(active);
          };
          const profile = await this.profiles.connectionSnapshot(
            context.profileId,
            context.revision,
          );
          await assertContext();
          const queueType = await this.inspectPurge(
            profile,
            vhost,
            input.name,
            signal,
          );
          await assertContext();

          setDeadline(PURGE_CONFIRMATION_TIMEOUT_MS);
          active.confirmation = Promise.resolve().then(() => {
            signal.throwIfAborted();
            return confirm(
              {
                profileName: profile.name,
                environment: profile.environment,
                httpsUrl: profile.httpsUrl,
                vhost,
                name: input.name,
                queueType,
              },
              signal,
            );
          });
          const confirmed = await active.confirmation;
          active.confirmation = undefined;
          signal.throwIfAborted();
          if (!confirmed) throw new ManagementFailure("CANCELLED");

          setDeadline(QUEUE_PURGE_TIMEOUT_MS);
          await assertContext();
          await this.purge(
            profile,
            vhost,
            input.name,
            signal,
            () => {
              sent = true;
            },
            assertContext,
          );
          await assertContext();
          return { ...snapshot(), status: "accepted" };
        },
      );
    } catch (error) {
      const reason =
        error instanceof ManagementFailure ? error.code : "INTERNAL";
      if (
        sent &&
        reason !== "DENIED" &&
        reason !== "NOT_FOUND" &&
        reason !== "QUEUE_PURGE_TYPE"
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
    work: (active: Active, setDeadline: (ms: number) => void) => Promise<T>,
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
    let timer: ReturnType<typeof setTimeout> | undefined;
    const setDeadline = (ms: number) => {
      clearTimeout(timer);
      timer = setTimeout(
        () => a.controller.abort(new ManagementFailure("TIMEOUT")),
        ms,
      );
    };
    setDeadline(
      kind === "declaration"
        ? QUEUE_DECLARATION_TIMEOUT_MS
        : MANAGEMENT_TIMEOUT_MS,
    );
    let abort!: () => void;
    const aborted = new Promise<never>((_, reject) => {
      abort = () => reject(signal.reason);
      signal.addEventListener("abort", abort, { once: true });
    });

    try {
      return await Promise.race([work(a, setDeadline), aborted]);
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
      if (a.confirmation) await a.confirmation.catch(() => undefined);
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
