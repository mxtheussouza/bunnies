// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";
import { SessionService } from "./sessionService";
import { ConnectionActivity } from "../connections/activity";
import { ProfileFailure } from "../profiles/errors";
import type { ProfileService } from "../profiles/service";
import type { AmqpsEvent } from "../connections/amqpsConnection";
const input = {
  profileId: "profile",
  revision: "revision",
  operationId: "operation",
};
const services: SessionService[] = [];
function setup() {
  vi.useFakeTimers();
  let changed = () => undefined;
  const metadata = {
    id: "profile",
    name: "Isolado",
    environment: "production",
    amqpsUrl: "amqps://localhost/%2F",
    secret: { availableThisRun: true },
  };
  const profiles = {
    onChanged: (fn: () => undefined) => {
      changed = fn;
      return () => undefined;
    },
    list: vi.fn(async () => ({ revision: "revision", profiles: [metadata] })),
    connectionSnapshot: vi.fn(async () => ({
      id: "profile",
      amqpsUrl: metadata.amqpsUrl,
      httpsUrl: "https://localhost",
      username: "synthetic",
      password: "SYNTHETIC-SESSION-ONLY",
      trust: { mode: "default" },
    })),
    assertRevision: vi.fn(async () => undefined),
  };
  const handles: Array<{
    vhost: string;
    flow: "unknown";
    close: ReturnType<typeof vi.fn>;
    destroy: ReturnType<typeof vi.fn>;
  }> = [];
  const events: Array<(event: AmqpsEvent) => void> = [];
  const open = vi.fn(async (_profile, _signal, onEvent) => {
    events.push(onEvent);
    const handle = {
      vhost: "/",
      flow: "unknown" as const,
      close: vi.fn(async () => true),
      destroy: vi.fn(),
    };
    handles.push(handle);
    return handle;
  });
  const https = vi.fn(async () => undefined),
    activity = new ConnectionActivity();
  const service = new SessionService(
    profiles as unknown as ProfileService,
    activity,
    open,
    https,
    () => 0.5,
  );
  services.push(service);
  return {
    service,
    profiles,
    open,
    https,
    handles,
    events,
    activity,
    changed: () => changed(),
  };
}
const settle = () => vi.advanceTimersByTimeAsync(0);
afterEach(async () => {
  for (const s of services.splice(0)) await s.dispose();
  vi.useRealTimers();
});
describe("session ownership and bounded recovery", () => {
  it("does no automatic network; owns one context and closes before permitting a probe", async () => {
    const f = setup();
    expect(f.service.getState(1).state).toBe("idle");
    expect(f.profiles.list).not.toHaveBeenCalled();
    const release = f.activity.probe(1);
    expect(() => f.service.connect(1, input)).toThrow();
    release();
    f.service.connect(1, input);
    await settle();
    const state = f.service.getState(1);
    expect(state.state).toBe("ready");
    expect(state.profile?.vhost).toBe("/");
    expect(JSON.stringify(state)).not.toMatch(
      /password|SYNTHETIC|username|pem/,
    );
    expect(() => f.activity.probe(1)).toThrow();
    await expect(
      f.service.disconnect(2, {
        sessionId: state.sessionId!,
        generation: state.generation,
      }),
    ).rejects.toThrow();
    expect(() => f.service.connect(1, input)).toThrow();
    const ref = { sessionId: state.sessionId!, generation: state.generation };
    await f.service.disconnect(1, ref);
    await f.service.disconnect(1, ref);
    expect(f.handles[0].close).toHaveBeenCalledTimes(1);
    expect(f.service.getState(1).state).toBe("closed");
    expect(vi.getTimerCount()).toBe(0);
    f.activity.probe(1)();
  });
  it("pauses polling in background while keeping an established AMQP connection", async () => {
    const f = setup();
    f.service.connect(1, input);
    await settle();
    f.service.setVisible(false);
    await vi.advanceTimersByTimeAsync(60000);
    expect(f.https).toHaveBeenCalledTimes(1);
    expect(f.handles[0].destroy).not.toHaveBeenCalled();
    f.service.setVisible(true);
    await settle();
    expect(f.https).toHaveBeenCalledTimes(2);
    await vi.advanceTimersByTimeAsync(4999);
    expect(f.https).toHaveBeenCalledTimes(2);
    await vi.advanceTimersByTimeAsync(1);
    expect(f.https).toHaveBeenCalledTimes(3);
  });
  it("uses exactly five retries without resetting its quota after initial success", async () => {
    const f = setup();
    f.service.connect(1, input);
    await settle();
    f.open.mockRejectedValue(new ProfileFailure("AMQP_NETWORK"));
    f.events[0]({ kind: "closed", code: "AMQP_NETWORK" });
    for (const delay of [1000, 2000, 4000, 8000, 16000]) {
      const before = f.open.mock.calls.length;
      await vi.advanceTimersByTimeAsync(delay - 1);
      expect(f.open).toHaveBeenCalledTimes(before);
      await vi.advanceTimersByTimeAsync(1);
      expect(f.open).toHaveBeenCalledTimes(before + 1);
    }
    expect(f.service.getState(1).amqps.retries).toBe(5);
    expect(f.service.getState(1).state).toBe("degraded");
    await vi.advanceTimersByTimeAsync(120000);
    expect(f.open).toHaveBeenCalledTimes(6);
  });
  it("does not retry terminal TLS failures and allows a new explicit context", async () => {
    const f = setup();
    f.open.mockRejectedValue(new ProfileFailure("TEST_TLS"));
    f.https.mockRejectedValue(new ProfileFailure("TEST_TLS"));
    f.service.connect(1, input);
    await settle();
    expect(f.service.getState(1).state).toBe("closed");
    expect(f.service.getState(1).https.failedAt).toBeDefined();
    expect(vi.getTimerCount()).toBe(0);
    await vi.advanceTimersByTimeAsync(120000);
    expect(f.open).toHaveBeenCalledTimes(1);
    f.service.connect(1, input);
    await settle();
    expect(f.open).toHaveBeenCalledTimes(2);
  });
  it("stops on profile changes; old events do not resurrect the session", async () => {
    const f = setup();
    f.service.connect(1, input);
    await settle();
    f.changed();
    await settle();
    const state = f.service.getState(1);
    f.events[0]({ kind: "flow", blocked: false });
    f.events[0]({ kind: "closed", code: "AMQP_NETWORK" });
    await vi.advanceTimersByTimeAsync(60000);
    expect(f.service.getState(1).state).toBe("closed");
    expect(f.open).toHaveBeenCalledTimes(1);
    expect(f.service.getState(1).generation).toBe(state.generation);
  });
  it("invalidates and closes on suspend, then recovers without resetting the budget", async () => {
    const f = setup();
    f.service.connect(1, input);
    await settle();
    const generation = f.service.getState(1).generation;
    f.service.setSuspended(true);
    expect(f.handles[0].destroy).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(60000);
    expect(f.open).toHaveBeenCalledTimes(1);
    f.service.setSuspended(false);
    await settle();
    expect(f.open).toHaveBeenCalledTimes(2);
    expect(f.service.getState(1).generation).toBeGreaterThan(generation);
    expect(f.service.getState(1).amqps.retries).toBe(1);
  });
  it("bounds a snapshot that never resolves and cancels all pending deadlines", async () => {
    const f = setup();
    f.profiles.connectionSnapshot.mockImplementation(
      () => new Promise(() => undefined),
    );
    f.service.connect(1, input);
    await settle();
    await vi.advanceTimersByTimeAsync(15000);
    expect(f.open).not.toHaveBeenCalled();
    expect(f.https).not.toHaveBeenCalled();
    await f.service.stop();
    expect(vi.getTimerCount()).toBe(0);
  });
  it("does not restore AMQP after a close during the final revision check", async () => {
    const f = setup();
    let finish!: () => void;
    f.profiles.assertRevision
      .mockImplementationOnce(async () => undefined)
      .mockImplementationOnce(
        () =>
          new Promise<undefined>(resolve => {
            finish = () => resolve(undefined);
          }),
      );
    f.service.connect(1, input);
    await settle();
    f.events[0]({ kind: "closed", code: "AMQP_NETWORK" });
    finish();
    await settle();
    const state = f.service.getState(1);
    expect(state.amqps.phase).toBe("failed");
    expect(state.amqps.error).toBe("AMQP_NETWORK");
    expect(state.amqps.nextRetryAt).toBeDefined();
    expect(state.state).toBe("degraded");
    await vi.advanceTimersByTimeAsync(1000);
    expect(f.open).toHaveBeenCalledTimes(2);
    expect(f.service.getState(1).state).toBe("ready");
  });
  it("keeps blocked state without retrying or inventing publish readiness", async () => {
    const f = setup();
    f.service.connect(1, input);
    await settle();
    f.events[0]({ kind: "flow", blocked: true });
    expect(f.service.getState(1).state).toBe("degraded");
    expect(f.service.getState(1).amqps.phase).toBe("blocked");
    await vi.advanceTimersByTimeAsync(22000);
    expect(f.open).toHaveBeenCalledTimes(1);
    expect(f.service.getState(1).amqps.retries).toBe(0);
    f.events[0]({ kind: "flow", blocked: false });
    expect(f.service.getState(1).state).toBe("ready");
    f.events[0]({ kind: "closed", code: "AMQP_NETWORK" });
    expect(f.service.getState(1).flow).toBe("unknown");
  });
  it("recovers simultaneous failures without resetting a successful retry's budget", async () => {
    const f = setup();
    f.open.mockRejectedValueOnce(new ProfileFailure("AMQP_NETWORK"));
    f.https.mockRejectedValueOnce(new ProfileFailure("TEST_NETWORK"));
    f.service.connect(1, input);
    await settle();
    expect(f.service.getState(1).state).toBe("reconnecting");
    await vi.advanceTimersByTimeAsync(5000);
    expect(f.service.getState(1).state).toBe("ready");
    expect(f.service.getState(1).amqps.retries).toBe(1);
    f.events[0]({ kind: "closed", code: "AMQP_NETWORK" });
    const due =
      Date.parse(f.service.getState(1).amqps.nextRetryAt!) - Date.now();
    expect(due).toBe(2000);
    await vi.advanceTimersByTimeAsync(due);
    expect(f.service.getState(1).amqps.retries).toBe(2);
  });
  it("rejects an old generation after recovery without closing the current handle", async () => {
    const f = setup();
    f.service.connect(1, input);
    await settle();
    const old = f.service.getState(1);
    f.events[0]({ kind: "closed", code: "AMQP_NETWORK" });
    await vi.advanceTimersByTimeAsync(1000);
    await expect(
      f.service.disconnect(1, {
        sessionId: old.sessionId!,
        generation: old.generation,
      }),
    ).rejects.toMatchObject({ code: "CONFLICT" });
    expect(f.service.getState(1).state).toBe("ready");
    expect(f.handles[1].close).not.toHaveBeenCalled();
  });
  it("discards a connection returned after disconnect and leaves no timers", async () => {
    const f = setup();
    const late = {
      vhost: "/",
      flow: "unknown" as const,
      close: vi.fn(async () => true),
      destroy: vi.fn(),
    };
    let finish!: (handle: typeof late) => void;
    f.open.mockImplementationOnce(
      () =>
        new Promise(resolve => {
          finish = resolve;
        }),
    );
    f.service.connect(1, input);
    await settle();
    const current = f.service.getState(1);
    await f.service.disconnect(1, {
      sessionId: current.sessionId!,
      generation: current.generation,
    });
    finish(late);
    await settle();
    expect(late.destroy).toHaveBeenCalledTimes(1);
    expect(late.close).not.toHaveBeenCalled();
    expect(f.service.getState(1).state).toBe("closed");
    expect(vi.getTimerCount()).toBe(0);
  });
});

it("only grants main management context to the active foreground HTTPS session", async () => {
  const f = setup();
  f.service.connect(1, input);
  await settle();
  const state = f.service.getState(1),
    ref = { sessionId: state.sessionId!, generation: state.generation };
  expect(f.service.managementContext(1, ref)).toEqual({
    profileId: "profile",
    revision: "revision",
    vhost: "/",
  });
  expect(() => f.service.managementContext(2, ref)).toThrow();
  expect(() =>
    f.service.managementContext(1, { ...ref, generation: ref.generation + 1 }),
  ).toThrow();
  f.service.setVisible(false);
  expect(() => f.service.managementContext(1, ref)).toThrow();
  f.service.setVisible(true);
  f.service.setSuspended(true);
  expect(() => f.service.managementContext(1, ref)).toThrow();
  await f.service.stop();
  expect(() => f.service.managementContext(1, ref)).toThrow();
});
