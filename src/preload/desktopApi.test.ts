// @vitest-environment node
import { describe, expect, it, vi } from "vitest";
import { createDesktopApi } from "./desktopApi";
import { emptySession } from "../shared/session";

describe("preload API", () => {
  it("routes session commands separately and releases only its own subscription", async () => {
    const other = vi.fn(),
      session = vi.fn().mockResolvedValue({
        ok: true,
        value: emptySession(),
        requestId: "test",
      });
    const release = vi.fn(),
      subscribe = vi.fn(() => release);
    const api = createDesktopApi(other, other, other, session, subscribe);
    const listener = vi.fn();
    const unsubscribe = api.onSessionState(listener);
    await api.getSessionState();
    await api.connectSession({
      profileId: "id",
      revision: "rev",
      operationId: "op",
    });
    await api.disconnectSession({ sessionId: "id", generation: 2 });
    expect(other).not.toHaveBeenCalled();
    expect(session.mock.calls.map(([v]) => v.command)).toEqual([
      "getSessionState",
      "connectSession",
      "disconnectSession",
    ]);
    expect(subscribe).toHaveBeenCalledWith(listener);
    unsubscribe();
    expect(release).toHaveBeenCalledTimes(1);
    session.mockResolvedValue({
      ok: true,
      value: { ...emptySession(), password: "private-sentinel" },
    });
    const bad = await api.getSessionState();
    expect(bad).toMatchObject({ ok: false, error: { code: "UNAVAILABLE" } });
    expect(JSON.stringify(bad)).not.toContain("sentinel");
  });
  it("exposes only named operations and no generic invoke or Electron objects", async () => {
    const invoke = vi
      .fn()
      .mockResolvedValue({ ok: true, value: undefined, requestId: "id" });
    const api = createDesktopApi(invoke, invoke, invoke);
    expect(Object.keys(api).sort()).toEqual(
      [
        "cancelProfileAmqpsTest",
        "cancelProfileHttpsTest",
        "close",
        "connectSession",
        "discardProfileCa",
        "disconnectSession",
        "getInfo",
        "getSecretProtectionStatus",
        "getSessionState",
        "listProfiles",
        "minimize",
        "onSessionState",
        "getBrokerInfo",
        "listSessionVhosts",
        "listSessionQueues",
        "getSessionQueue",
        "declareSessionQueue",
        "cancelQueueDeclaration",
        "selectSessionVhost",
        "cancelManagementRead",
        "openLink",
        "quit",
        "removeProfile",
        "saveProfile",
        "selectProfileCa",
        "showEditMenu",
        "testProfileAmqps",
        "testProfileHttps",
        "toggleMaximize",
        "view",
      ].sort(),
    );
    expect(Object.isFrozen(api)).toBe(true);
    await api.openLink("author");
    await api.showEditMenu();
    expect(invoke.mock.calls).toEqual([
      [{ command: "openLink", id: "author" }],
      [{ command: "showEditMenu" }],
    ]);
  });
  it("sanitizes transport rejections without exposing a stack or privileged path", async () => {
    const reject = async () => {
      throw new Error("private /secret/path token sentinel");
    };
    const api = createDesktopApi(reject, reject, reject);
    const result = await api.getInfo();
    expect(result.ok).toBe(false);
    expect(JSON.stringify(result)).not.toMatch(/private|secret|sentinel|stack/);
    if (!result.ok) expect(result.error.code).toBe("UNAVAILABLE");
  });
  it("routes only explicit profile operations through their own channel and sanitizes profile transport errors", async () => {
    const desktop = vi.fn();
    const profiles = vi
      .fn()
      .mockResolvedValue({ ok: true, requestId: "id", value: {} });
    const api = createDesktopApi(desktop, profiles, profiles);
    await api.listProfiles();
    await api.getSecretProtectionStatus();
    await api.removeProfile({ id: "synthetic-id", revision: "absent" });
    expect(desktop).not.toHaveBeenCalled();
    expect(profiles.mock.calls.map(([request]) => request.command)).toEqual([
      "listProfiles",
      "getSecretProtectionStatus",
      "removeProfile",
    ]);
    profiles.mockRejectedValue(new Error("password sentinel /private stack"));
    const result = await api.listProfiles();
    expect(result).toMatchObject({ ok: false, error: { code: "UNAVAILABLE" } });
    expect(JSON.stringify(result)).not.toMatch(/sentinel|private|stack/);
  });
  it("routes AMQPS through the connection channel without desktop or profile authority", async () => {
    const desktop = vi.fn(),
      profiles = vi.fn(),
      connections = vi.fn().mockResolvedValue({ ok: true });
    const api = createDesktopApi(desktop, profiles, connections);
    const input = {
      profileId: "id",
      revision: "revision",
      operationId: "operation",
    };
    await api.testProfileAmqps(input);
    await api.cancelProfileAmqpsTest(input.operationId);
    expect(connections.mock.calls.map(([request]) => request.command)).toEqual([
      "testProfileAmqps",
      "cancelProfileAmqpsTest",
    ]);
    expect(desktop).not.toHaveBeenCalled();
    expect(profiles).not.toHaveBeenCalled();
  });
});

it("validates administrative replies and replaces untrusted error messages", async () => {
  const input = {
    sessionId: "00000000-0000-4000-8000-000000000001",
    generation: 1,
    operationId: "00000000-0000-4000-8000-000000000002",
  };
  const invoke = vi.fn(async () => undefined),
    management = vi.fn(async () => ({
      ok: true,
      requestId: "00000000-0000-4000-8000-000000000003",
      value: {
        ...input,
        kind: "broker",
        matrix: "unknown",
        source: "https-management",
        checkedAt: "2026-10-30T12:00:00.000Z",
      },
    }));
  const api = createDesktopApi(
    invoke,
    invoke,
    invoke,
    undefined,
    undefined,
    management,
  );
  expect((await api.getBrokerInfo(input)).ok).toBe(true);
  management.mockResolvedValueOnce({
    ok: true,
    requestId: "00000000-0000-4000-8000-000000000003",
    value: {
      ...input,
      kind: "broker",
      matrix: "unknown",
      source: "https-management",
      checkedAt: "2026-10-30T12:00:00.000Z",
      password: "SENTINEL",
    },
  } as never);
  expect((await api.getBrokerInfo(input)).ok).toBe(false);
  management.mockResolvedValueOnce({
    ok: false,
    requestId: "00000000-0000-4000-8000-000000000003",
    error: { code: "DENIED", message: "SENTINEL" },
  } as never);
  expect(JSON.stringify(await api.getBrokerInfo(input))).not.toContain(
    "SENTINEL",
  );
});

it("accepts the exact queue projection and rejects extra fields or a mismatched operation", async () => {
  const call = vi.fn();
  const management = vi.fn();
  const api = createDesktopApi(
    call,
    call,
    call,
    undefined,
    undefined,
    management,
  );
  const input = {
    sessionId: "00000000-0000-4000-8000-000000000001",
    operationId: "00000000-0000-4000-8000-000000000002",
    generation: 1,
    name: "fila/",
  };
  const { name, ...ref } = input;
  const value = {
    ...ref,
    kind: "queueDetail",
    vhost: "/",
    source: "https-management",
    checkedAt: "2026-11-19T12:00:00.000Z",
    queue: { name, ready: 0, consumerDetails: { items: [], partial: false } },
  };
  const response = { ok: true, requestId: input.operationId, value };
  management.mockResolvedValueOnce(response);
  expect((await api.getSessionQueue(input)).ok).toBe(true);
  expect(management).toHaveBeenCalledWith({
    command: "getSessionQueue",
    input,
  });
  for (const bad of [
    { ...value, generation: 2 },
    { ...value, queue: { name: "different" } },
    { ...value, queue: { name, arguments: { password: "private-fixture" } } },
    {
      ...value,
      queue: { name, consumerDetails: { items: [], partial: true } },
    },
  ]) {
    management.mockResolvedValueOnce({ ...response, value: bad });
    const result = await api.getSessionQueue(input);
    expect(result.ok).toBe(false);
    expect(JSON.stringify(result)).not.toContain("private-fixture");
  }
});

it("rejects mismatched declaration responses conservatively after an IPC call", async () => {
  const call = vi.fn(),
    management = vi.fn();
  const api = createDesktopApi(
    call,
    call,
    call,
    undefined,
    undefined,
    management,
  );
  const ref = {
    sessionId: "00000000-0000-4000-8000-000000000001",
    operationId: "00000000-0000-4000-8000-000000000002",
    generation: 1,
  };
  const input = {
    ...ref,
    declaration: {
      name: "literal%2F",
      type: "classic" as const,
      arguments: {},
    },
  };
  const value = {
    ...ref,
    kind: "queueDeclaration",
    source: "https-management",
    checkedAt: "2026-11-20T12:00:00.000Z",
    vhost: "/",
    name: input.declaration.name,
    status: "uncertain",
    reason: "CANCELLED",
  };
  management.mockResolvedValueOnce({
    ok: true,
    requestId: ref.operationId,
    value,
  });
  expect((await api.declareSessionQueue(input)).ok).toBe(true);
  for (const changed of [
    { name: "different" },
    { generation: 2 },
    { private: "SENTINEL" },
  ]) {
    management.mockResolvedValueOnce({
      ok: true,
      requestId: ref.operationId,
      value: { ...value, ...changed },
    });
    const result = await api.declareSessionQueue(input);
    expect(result).toMatchObject({
      ok: false,
      error: { code: "QUEUE_DECLARATION_UNCERTAIN" },
    });
    expect(JSON.stringify(result)).not.toContain("SENTINEL");
  }
});
