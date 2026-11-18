import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, renderHook, waitFor } from "@testing-library/react";
import { useVersions } from "./useVersions";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
function bridge(getInfo: () => Promise<unknown>) {
  vi.stubGlobal("bunnies", { getInfo });
}
describe("desktop version metadata", () => {
  it("presents the version returned by the desktop bridge", async () => {
    bridge(async () => ({
      ok: true,
      requestId: "id",
      value: { version: "1.0.0", platform: "darwin", development: false },
    }));
    const { result } = renderHook(useVersions);
    await waitFor(() =>
      expect(result.current.versions).toEqual({ bunnies: "1.0.0" }),
    );
  });
  it("keeps rendering if the desktop operation is unavailable", async () => {
    const getInfo = vi.fn().mockResolvedValue({ ok: false });
    bridge(getInfo);
    const { result } = renderHook(useVersions);
    await waitFor(() => expect(getInfo).toHaveBeenCalled());
    expect(result.current.versions).toEqual({});
  });
  it("contains a transport rejection", async () => {
    const getInfo = vi.fn().mockRejectedValue(new Error("transport"));
    bridge(getInfo);
    const { result } = renderHook(useVersions);
    await waitFor(() => expect(getInfo).toHaveBeenCalled());
    expect(result.current.versions).toEqual({});
  });
});
