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
