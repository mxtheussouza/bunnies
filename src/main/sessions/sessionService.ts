import { randomUUID } from "node:crypto";
import {
  emptySession,
  type SessionSnapshot,
  type ConnectSessionInput,
  type SessionRef,
} from "../../shared/session";
import type { ProfileErrorCode } from "../../shared/profiles";
import { parseAmqpsEndpoint } from "../../shared/amqpsEndpoint";
import { ProfileFailure } from "../profiles/errors";
import type { ProfileService } from "../profiles/service";
import { ConnectionActivity } from "../connections/activity";
import { probeHttps } from "../connections/httpsProbe";
import {
  openAmqpsConnection,
  type AmqpsConnection,
} from "../connections/amqpsConnection";
type Kind = "https" | "amqps";
type Work = {
  token: number;
  controller?: AbortController;
  timer?: ReturnType<typeof setTimeout>;
  deadline?: ReturnType<typeof setTimeout>;
  pending?: { at: number; retry: boolean };
  attempted: boolean;
  handle?: AmqpsConnection;
};
type Context = {
  owner: number;
  revision: string;
  snapshot: SessionSnapshot;
  https: Work;
  amqps: Work;
  release: () => void;
  loaded: boolean;
  stop?: Promise<void>;
  stopRef?: SessionRef;
  bootstrap?: ReturnType<typeof setTimeout>;
};
const available = (phase: string) =>
  phase === "available" || phase === "blocked";
const transient = (code: ProfileErrorCode) =>
  ["TEST_NETWORK", "TEST_TIMEOUT", "AMQP_NETWORK", "AMQP_TIMEOUT"].includes(
    code,
  );
export class SessionService {
  private context?: Context;
  private sequence = 0;
  private generation = 0;
  private visible = true;
  private suspended = false;
  private disposed = false;
  private listeners = new Set<() => void>();
  private unsubscribe: () => void;
  constructor(
    private readonly profiles: ProfileService,
    private readonly activity: ConnectionActivity,
    private readonly open = openAmqpsConnection,
    private readonly httpsProbe = probeHttps,
    private readonly random = Math.random,
  ) {
    this.unsubscribe = profiles.onChanged(() => {
      void this.stop("CONFLICT");
    });
  }
  private get paused() {
    return !this.visible || this.suspended;
  }
  onChange(listener: () => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }
  getState(owner: number): SessionSnapshot {
    const state =
      this.context?.owner === owner
        ? this.context.snapshot
        : { ...emptySession(), sequence: this.sequence };
    return structuredClone(state);
  }
  private live(c: Context) {
    return this.context === c && c.snapshot.desired && !this.disposed;
  }
  private publish(c: Context) {
    if (this.context !== c) return;
    const s = c.snapshot;
    s.paused = this.paused;
    s.sequence = ++this.sequence;
    if (s.stopping) s.state = "connecting";
    else if (!s.desired) s.state = "closed";
    else {
      const h = available(s.https.phase),
        a = available(s.amqps.phase);
      s.state =
        h && a && s.flow !== "blocked"
          ? "ready"
          : h || a
            ? "degraded"
            : !c.loaded ||
                ((s.https.checking || s.amqps.checking) &&
                  s.https.retries === 0 &&
                  s.amqps.retries === 0)
              ? "connecting"
              : "reconnecting";
      if (
        c.loaded &&
        !h &&
        !a &&
        !s.https.checking &&
        !s.amqps.checking &&
        !c.https.pending &&
        !c.amqps.pending &&
        !this.paused
      ) {
        s.desired = false;
        s.state = "closed";
        s.reason = s.https.error ?? s.amqps.error;
        c.release();
      }
    }
    for (const listener of this.listeners) listener();
  }
  connect(owner: number, input: ConnectSessionInput) {
    if (
      this.disposed ||
      this.context?.snapshot.desired ||
      this.context?.snapshot.stopping
    )
      throw new ProfileFailure("UNAVAILABLE");
    const release = this.activity.acquireSession();
    const state = emptySession();
    Object.assign(state, {
      sessionId: randomUUID(),
      generation: ++this.generation,
      desired: true,
      state: "connecting",
      profile: {
        id: input.profileId,
        name: "",
        environment: "other",
        vhost: "",
      },
    });
    const c: Context = {
      owner,
      revision: input.revision,
      snapshot: state,
      release,
      loaded: false,
      https: { token: 0, attempted: false },
      amqps: { token: 0, attempted: false },
    };
    this.context = c;
    c.bootstrap = setTimeout(() => {
      if (this.live(c) && !c.loaded) void this.stop("AMQP_TIMEOUT");
    }, 15000);
    c.bootstrap.unref();
    void this.bootstrap(c, input);
    this.publish(c);
    return this.getState(owner);
  }
  private async bootstrap(c: Context, input: ConnectSessionInput) {
    try {
      const list = await this.profiles.list();
      if (!this.live(c)) return;
      if (list.revision !== input.revision)
        throw new ProfileFailure("CONFLICT");
      const profile = list.profiles.find(p => p.id === input.profileId);
      if (!profile) throw new ProfileFailure("NOT_FOUND");
      const endpoint = parseAmqpsEndpoint(profile.amqpsUrl);
      if (!endpoint) throw new ProfileFailure("AMQP_ENDPOINT");
      if (!profile.secret.availableThisRun)
        throw new ProfileFailure("AMQP_CREDENTIALS");
      c.snapshot.profile = {
        id: profile.id,
        name: profile.name,
        environment: profile.environment,
        vhost: endpoint.vhost,
      };
      clearTimeout(c.bootstrap);
      c.loaded = true;
      if (!this.paused) {
        void this.run(c, "https", false);
        void this.run(c, "amqps", false);
      }
      this.publish(c);
    } catch (error) {
      if (this.live(c))
        await this.stop(
          error instanceof ProfileFailure ? error.code : "INTERNAL",
        );
    }
  }
  private schedule(c: Context, kind: Kind, delay: number, retry: boolean) {
    const work = c[kind];
    clearTimeout(work.timer);
    work.pending = { at: Date.now() + delay, retry };
    c.snapshot[kind].nextRetryAt = retry
      ? new Date(work.pending.at).toISOString()
      : undefined;
    if (!this.paused) {
      work.timer = setTimeout(
        () => {
          work.pending = undefined;
          void this.run(c, kind, retry);
        },
        Math.max(0, delay),
      );
      work.timer.unref();
    }
  }
  private failed(c: Context, kind: Kind, code: ProfileErrorCode) {
    const work = c[kind];
    work.token++;
    clearTimeout(work.deadline);
    work.controller?.abort(new ProfileFailure(code));
    const state = c.snapshot[kind];
    state.phase = "failed";
    state.checking = false;
    state.error = code;
    state.failedAt = new Date().toISOString();
    if (kind === "amqps") c.snapshot.flow = "unknown";
    c[kind].handle = undefined;
    c[kind].controller = undefined;
    if (transient(code) && state.retries < 5) {
      const jitter = Math.min(1, Math.max(0, this.random()));
      this.schedule(
        c,
        kind,
        1000 * 2 ** state.retries * (0.8 + 0.4 * jitter),
        true,
      );
    }
    this.publish(c);
  }
  private async run(c: Context, kind: Kind, retry: boolean) {
    const work = c[kind],
      state = c.snapshot[kind];
    if (!this.live(c) || this.paused || work.controller || work.handle) return;
    if (retry && state.retries >= 5) {
      this.publish(c);
      return;
    }
    if (retry) {
      state.retries++;
      if (kind === "amqps") {
        c.snapshot.generation = ++this.generation;
        const pending = c.https.pending;
        const checking = c.snapshot.https.checking;
        this.cancelWork(c, "https");
        if (pending)
          this.schedule(
            c,
            "https",
            Math.max(0, pending.at - Date.now()),
            pending.retry,
          );
        else if (available(c.snapshot.https.phase))
          this.schedule(c, "https", 5000, false);
        else if (checking && c.snapshot.https.retries < 5)
          this.schedule(c, "https", 1000 * 2 ** c.snapshot.https.retries, true);
      }
    }
    work.pending = undefined;
    state.nextRetryAt = undefined;
    const token = ++work.token,
      controller = new AbortController();
    work.controller = controller;
    state.checking = true;
    if (!available(state.phase)) state.phase = "connecting";
    work.attempted = true;
    const valid = () => this.live(c) && work.token === token;
    work.deadline = setTimeout(
      () =>
        controller.abort(
          new ProfileFailure(
            kind === "https" ? "TEST_TIMEOUT" : "AMQP_TIMEOUT",
          ),
        ),
      kind === "https" ? 10000 : 15000,
    );
    work.deadline.unref();
    this.publish(c);
    let abortListener!: () => void;
    const abort = new Promise<never>((_, reject) => {
      abortListener = () => reject(controller.signal.reason);
      controller.signal.addEventListener("abort", abortListener, {
        once: true,
      });
    });
    const operation = async () => {
      const profile = await this.profiles.connectionSnapshot(
        c.snapshot.profile!.id,
        c.revision,
      );
      controller.signal.throwIfAborted();
      if (kind === "https") await this.httpsProbe(profile, controller.signal);
      else {
        const handle = await this.open(profile, controller.signal, event => {
          if (!valid()) return;
          if (event.kind === "flow") {
            c.snapshot.flow = event.blocked ? "blocked" : "unblocked";
            state.phase = event.blocked ? "blocked" : "available";
            this.publish(c);
          } else {
            clearTimeout(work.deadline);
            this.failed(c, kind, event.code);
          }
        });
        if (!valid() || controller.signal.aborted) {
          handle.destroy();
          controller.signal.throwIfAborted();
          return;
        }
        work.handle = handle;
        c.snapshot.flow = handle.flow;
      }
      controller.signal.throwIfAborted();
      await this.profiles.assertRevision(c.revision);
      controller.signal.throwIfAborted();
    };
    try {
      await Promise.race([operation(), abort]);
      if (!valid()) return;
      state.phase =
        kind === "amqps" && c.snapshot.flow === "blocked"
          ? "blocked"
          : "available";
      state.error = undefined;
      state.failedAt = undefined;
      state.checkedAt = new Date().toISOString();
      state.checking = false;
      if (kind === "https") {
        work.controller = undefined;
        this.schedule(c, kind, 5000, false);
      }
      this.publish(c);
    } catch (error) {
      if (!valid()) return;
      const handle = work.handle as AmqpsConnection | undefined;
      this.failed(
        c,
        kind,
        error instanceof ProfileFailure ? error.code : "INTERNAL",
      );
      handle?.destroy();
    } finally {
      controller.signal.removeEventListener("abort", abortListener);
      if (work.token === token) clearTimeout(work.deadline);
    }
  }
  private cancelWork(c: Context, kind: Kind) {
    const w = c[kind];
    w.token++;
    clearTimeout(w.timer);
    clearTimeout(w.deadline);
    w.controller?.abort(
      new ProfileFailure(
        kind === "https" ? "TEST_CANCELLED" : "AMQP_CANCELLED",
      ),
    );
    w.controller = undefined;
    c.snapshot[kind].checking = false;
  }
  setVisible(visible: boolean) {
    this.visible = visible;
    this.visibilityChanged(false);
  }
  setSuspended(suspended: boolean) {
    this.suspended = suspended;
    this.visibilityChanged(suspended);
  }
  private visibilityChanged(suspend: boolean) {
    const c = this.context;
    if (!c || !this.live(c) || !c.loaded) return;
    if (this.paused) {
      for (const kind of ["https", "amqps"] as const) {
        if (kind === "amqps" && c.amqps.handle && !suspend) continue;
        const w = c[kind],
          wasChecking = c.snapshot[kind].checking;
        this.cancelWork(c, kind);
        if (kind === "amqps" && w.handle) {
          w.handle.destroy();
          w.handle = undefined;
          c.snapshot.amqps.phase = "failed";
          c.snapshot.amqps.error = "AMQP_NETWORK";
          c.snapshot.flow = "unknown";
          c.snapshot.generation = ++this.generation;
          w.pending = { at: Date.now(), retry: true };
        } else if (wasChecking) {
          c.snapshot[kind].phase =
            kind === "https" && c.snapshot.https.checkedAt
              ? "available"
              : "idle";
          w.pending = { at: Date.now(), retry: kind === "amqps" };
        }
      }
    } else
      for (const kind of ["https", "amqps"] as const) {
        const work = c[kind];
        if (work.handle || work.controller) continue;
        if (work.pending)
          this.schedule(
            c,
            kind,
            Math.max(0, work.pending.at - Date.now()),
            work.pending.retry,
          );
        else if (!work.attempted) void this.run(c, kind, false);
      }
    this.publish(c);
  }
  async disconnect(owner: number, ref: SessionRef) {
    const c = this.context;
    if (
      !c ||
      c.owner !== owner ||
      c.snapshot.sessionId !== ref.sessionId ||
      (c.snapshot.generation !== ref.generation &&
        !(
          c.stopRef?.sessionId === ref.sessionId &&
          c.stopRef.generation === ref.generation
        ))
    )
      throw new ProfileFailure("CONFLICT");
    await this.stop();
    return this.getState(owner);
  }
  async stop(reason?: ProfileErrorCode) {
    const c = this.context;
    if (!c) return;
    if (c.stop) return c.stop;
    c.stopRef = {
      sessionId: c.snapshot.sessionId!,
      generation: c.snapshot.generation,
    };
    c.snapshot.desired = false;
    c.snapshot.stopping = true;
    c.snapshot.generation = ++this.generation;
    c.snapshot.reason = reason;
    clearTimeout(c.bootstrap);
    this.cancelWork(c, "https");
    const handle = c.amqps.handle;
    if (!handle) this.cancelWork(c, "amqps");
    clearTimeout(c.amqps.timer);
    clearTimeout(c.amqps.deadline);
    this.publish(c);
    c.stop = (async () => {
      if (handle) c.snapshot.closeConfirmed = await handle.close();
      this.cancelWork(c, "amqps");
      c.amqps.handle = undefined;
      c.https.pending = undefined;
      c.amqps.pending = undefined;
      for (const kind of ["https", "amqps"] as const) {
        c.snapshot[kind].phase = "closed";
        c.snapshot[kind].checking = false;
        c.snapshot[kind].nextRetryAt = undefined;
      }
      c.snapshot.stopping = false;
      c.release();
      this.publish(c);
    })();
    return c.stop;
  }
  stopOwner(owner: number) {
    if (this.context?.owner === owner) return this.stop();
    return Promise.resolve();
  }
  async dispose() {
    await this.stop();
    this.disposed = true;
    this.unsubscribe();
    this.listeners.clear();
  }
}
