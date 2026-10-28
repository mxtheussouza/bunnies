import { afterEach, describe, expect, it } from "vitest";
import { cleanup, renderHook } from "@testing-library/react";
import { useVersions } from "./useVersions";

afterEach(() => {
  cleanup();
  document.getElementById("app")?.remove();
});

describe("version metadata", () => {
  it("only presents string version values", () => {
    const root = document.createElement("div");
    root.id = "app";
    root.dataset.versions = JSON.stringify({
      bunnies: "1.0.0",
      unexpected: 42,
    });
    document.body.append(root);
    const { result } = renderHook(useVersions);
    expect(result.current.versions).toEqual({ bunnies: "1.0.0" });
  });

  it.each(["{invalid", "null", "[]", '"text"', ""])(
    "does not crash for invalid metadata %s",
    metadata => {
      const root = document.createElement("div");
      root.id = "app";
      root.dataset.versions = metadata;
      document.body.append(root);
      const { result } = renderHook(useVersions);
      expect(result.current.versions).toEqual({});
    },
  );

  it("does not crash when the metadata element is absent", () => {
    const { result } = renderHook(useVersions);
    expect(result.current.versions).toEqual({});
  });
});
