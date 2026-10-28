// @vitest-environment node
import { describe, expect, it, vi } from "vitest";
import { createDesktopApi } from "./desktopApi";

describe("preload API", () => {
  it("exposes only named operations and no generic invoke or Electron objects", async () => {
    const invoke = vi
      .fn()
      .mockResolvedValue({ ok: true, value: undefined, requestId: "id" });
    const api = createDesktopApi(invoke);
    expect(Object.keys(api).sort()).toEqual([
      "close",
      "getInfo",
      "minimize",
      "openLink",
      "quit",
      "showEditMenu",
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
    const api = createDesktopApi(async () => {
      throw new Error("private /secret/path token sentinel");
    });
    const result = await api.getInfo();
    expect(result.ok).toBe(false);
    expect(JSON.stringify(result)).not.toMatch(/private|secret|sentinel|stack/);
    if (!result.ok) expect(result.error.code).toBe("UNAVAILABLE");
  });
});
