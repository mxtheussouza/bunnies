// @vitest-environment node
import { mkdtemp, mkdir, writeFile, rm, symlink } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createResourceHandler } from "./resources";
import { APP_URL, PRODUCTION_CSP } from "./desktopPolicy";

let fixture: string;
beforeEach(async () => {
  fixture = await mkdtemp(join(tmpdir(), "bunnies-resource-test-"));
  await mkdir(join(fixture, "renderer/app_window"), { recursive: true });
  await writeFile(
    join(fixture, "renderer/app_window/index.html"),
    "<h1>Bunnies</h1>",
  );
  await writeFile(join(fixture, "outside.html"), "private sentinel");
});
afterEach(async () => rm(fixture, { recursive: true, force: true }));

describe("local resource handler", () => {
  it("serves only allowed files with MIME, CSP and nosniff headers", async () => {
    const response = await createResourceHandler(join(fixture, "renderer"))(
      new Request(APP_URL),
    );
    expect(response.status).toBe(200);
    expect(await response.text()).toBe("<h1>Bunnies</h1>");
    expect(response.headers.get("content-type")).toBe(
      "text/html; charset=utf-8",
    );
    expect(response.headers.get("content-security-policy")).toBe(
      PRODUCTION_CSP,
    );
    expect(PRODUCTION_CSP).not.toMatch(/unsafe-inline|unsafe-eval/);
    expect(response.headers.get("x-content-type-options")).toBe("nosniff");
  });
  it("supports HEAD without returning a body", async () => {
    const response = await createResourceHandler(join(fixture, "renderer"))(
      new Request(APP_URL, { method: "HEAD" }),
    );
    expect(response.status).toBe(200);
    expect(await response.text()).toBe("");
  });
  it("rejects writes, unavailable files and private paths without leaking errors", async () => {
    const handler = createResourceHandler(join(fixture, "renderer"));
    for (const request of [
      new Request(APP_URL, { method: "POST" }),
      new Request("bunnies://app/app_window/index.css"),
      new Request("bunnies://app/app_window/preload.cjs"),
      new Request("bunnies://app/../outside.html"),
    ]) {
      const response = await handler(request);
      expect(response.status).toBe(404);
      expect(await response.text()).toBe("");
    }
  });
  it("rejects an allowlisted filename that is a symlink outside the resource root", async () => {
    await symlink(
      join(fixture, "outside.html"),
      join(fixture, "renderer/app_window/index.js"),
    );
    const response = await createResourceHandler(join(fixture, "renderer"))(
      new Request("bunnies://app/app_window/index.js"),
    );
    expect(response.status).toBe(404);
    expect(await response.text()).toBe("");
  });
});
