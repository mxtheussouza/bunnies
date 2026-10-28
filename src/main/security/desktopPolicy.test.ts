// @vitest-environment node
import { describe, expect, it } from "vitest";
import {
  APP_URL,
  isAllowedDevConnection,
  isTrustedPage,
  parseDesktopRequest,
  resourcePath,
} from "./desktopPolicy";

describe("desktop page identity", () => {
  it("requires the complete expected page URL", () => {
    expect(isTrustedPage(APP_URL, APP_URL)).toBe(true);
    for (const url of [
      APP_URL + "?x",
      APP_URL + "#x",
      APP_URL + "/other",
      "bunnies://app.evil/app_window/index.html",
      "bunnies://user@app/app_window/index.html",
      "file:///app_window/index.html",
      "null",
      "about:blank",
    ]) {
      expect(isTrustedPage(url, APP_URL)).toBe(false);
    }
  });
  it("limits development trust to the configured loopback page", () => {
    const entry = "http://localhost:3000/app_window/index.html";
    expect(isTrustedPage(entry, entry)).toBe(true);
    expect(isTrustedPage(entry.replace("3000", "3001"), entry)).toBe(false);
    expect(
      isTrustedPage(
        "https://remote.test/index.html",
        "https://remote.test/index.html",
      ),
    ).toBe(false);
    expect(isAllowedDevConnection("ws://localhost:3000/ws", entry)).toBe(true);
    for (const url of [
      "http://localhost:3001/",
      "http://localhost.evil:3000/",
      "http://user@localhost:3000/",
      "file:///tmp/app",
      "https://localhost:3000/",
    ]) {
      expect(isAllowedDevConnection(url, entry)).toBe(false);
    }
  });
});

describe("strict desktop requests", () => {
  it.each([
    null,
    [],
    "info",
    1,
    {},
    new Date(),
    { command: "info", extra: true },
    { command: "edit", action: "constructor" },
    { command: "view", action: "unknown" },
    { command: "edit", action: {} },
    { command: "openLink", id: "https://example.test" },
    { command: "openLink", url: "author" },
    { command: "openLink", id: "author", extra: true },
    { command: "info", [Symbol()]: true },
    { command: "x".repeat(2 * 1024 * 1024) },
    { command: "edit", action: "x".repeat(2 * 1024 * 1024) },
  ])("rejects unexpected fields/types/size %#", input => {
    expect(parseDesktopRequest(input)).toBeNull();
  });
  it.each([
    { command: "info" },
    { command: "minimize" },
    { command: "showEditMenu" },
    { command: "view", action: "reload" },
    { command: "openLink", id: "author" },
  ])("accepts a supported exact shape %#", input => {
    expect(parseDesktopRequest(input)).toEqual(input);
  });
});

describe("packaged resource allowlist", () => {
  it.each([
    "app_window/index.html",
    "app_window/index.js",
    "app_window/index.css",
    "assets/abc012.png",
  ])("allows %s", path => {
    expect(resourcePath("bunnies://app/" + path)).toBe(path);
  });
  it.each([
    "bunnies://app/app_window/preload.cjs",
    "bunnies://app/package.json",
    "bunnies://app/../package.json",
    "bunnies://app/%2e%2e/package.json",
    "bunnies://app/%252e%252e/package.json",
    "bunnies://app/app_window%2findex.html",
    "bunnies://app/app_window/index.js.map",
    "bunnies://app/other/index.html",
    "bunnies://app.evil/app_window/index.html",
    "bunnies://user@app/app_window/index.html",
    "bunnies://app:80/app_window/index.html",
    "bunnies://app/app_window/index.html?x",
    "file:///tmp/index.html",
    "invalid",
  ])("denies %s", url => {
    expect(resourcePath(url)).toBeNull();
  });
});
