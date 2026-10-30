// @vitest-environment node
import { describe, expect, it, vi } from "vitest";
import { createDesktopApi } from "./desktopApi";

describe("preload API", () => {
  it("exposes only named operations and no generic invoke or Electron objects", async () => {
    const invoke = vi
      .fn()
      .mockResolvedValue({ ok: true, value: undefined, requestId: "id" });
    const api = createDesktopApi(invoke, invoke, invoke);
    expect(Object.keys(api).sort()).toEqual([
      "cancelProfileAmqpsTest",
      "cancelProfileHttpsTest",
      "close",
      "discardProfileCa",
      "getInfo",
      "getSecretProtectionStatus",
      "listProfiles",
      "minimize",
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
    ]);
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
