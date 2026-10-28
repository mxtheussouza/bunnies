// @vitest-environment node
import { beforeAll, afterAll, describe, expect, it, vi } from "vitest";
import { join } from "node:path";
import { writeFile, symlink } from "node:fs/promises";
import {
  createTlsFixture,
  type TlsFixture,
} from "../../../tools/testing/tls-fixture.cjs";
import { MAX_CA_BYTES, CA_SELECTION_TTL_MS } from "../../shared/connections";
import { parseCaPem, ProfileCaSelections, summarizeTrust } from "./profileCa";
let fixture: TlsFixture;
beforeAll(async () => {
  fixture = await createTlsFixture();
}, 20000);
afterAll(async () => {
  await fixture.cleanup();
});
describe("public CA boundaries", () => {
  it("canonicalizes public CA material and only returns fingerprints in summaries", () => {
    const parsed = parseCaPem(fixture.ca);
    expect(parsed.fingerprints).toHaveLength(1);
    expect(summarizeTrust({ mode: "custom", pem: parsed.pem })).toEqual({
      mode: "custom",
      fingerprints: parsed.fingerprints,
    });
    expect(
      JSON.stringify(summarizeTrust({ mode: "custom", pem: parsed.pem })),
    ).not.toContain("CERTIFICATE");
  });
  it("rejects private keys, leaf certificates, garbage, malformed/oversized PEM and too many CAs", () => {
    for (const value of [
      fixture.key,
      fixture.cert,
      fixture.ca + fixture.key,
      fixture.ca + "garbage",
      "-----BEGIN CERTIFICATE-----\ninvalid\n-----END CERTIFICATE-----",
      fixture.ca.repeat(17),
    ])
      expect(() => parseCaPem(value)).toThrow();
    expect(() => parseCaPem("x".repeat(MAX_CA_BYTES + 1))).toThrow();
  });
  it("binds one expiring selection to its window, preserves it on cancel/error and discards it explicitly", async () => {
    let now = 0;
    const selections = new ProfileCaSelections(() => now);
    try {
      const selected = await selections.select(
        1,
        async () => join(fixture.directory, "ca.pem"),
        () => true,
      );
      expect(selected).not.toBeNull();
      expect(JSON.stringify(selected)).not.toContain(fixture.directory);
      expect(() => selections.get(2, selected!.selectionId)).toThrow(
        "CA_SELECTION",
      );
      expect(
        await selections.select(
          1,
          async () => null,
          () => true,
        ),
      ).toBeNull();
      await expect(
        selections.select(
          1,
          async () => join(fixture.directory, "server.key"),
          () => true,
        ),
      ).rejects.toMatchObject({ code: "CA_INVALID" });
      expect(selections.get(1, selected!.selectionId).mode).toBe("custom");
      const replaced = await selections.select(
        1,
        async () => join(fixture.directory, "ca.pem"),
        () => true,
      );
      expect(() => selections.get(1, selected!.selectionId)).toThrow(
        "CA_SELECTION",
      );
      now += CA_SELECTION_TTL_MS;
      expect(() => selections.get(1, replaced!.selectionId)).toThrow(
        "CA_SELECTION",
      );
      now = 0;
      const again = await selections.select(
        1,
        async () => join(fixture.directory, "ca.pem"),
        () => true,
      );
      selections.discard(1, again!.selectionId);
      expect(() => selections.get(1, again!.selectionId)).toThrow();
    } finally {
      selections.dispose();
    }
  });
  it("rejects changed ownership, non-files/symlinks and concurrent native selections", async () => {
    const selections = new ProfileCaSelections();
    try {
      await expect(
        selections.select(
          1,
          async () => join(fixture.directory, "ca.pem"),
          () => false,
        ),
      ).rejects.toMatchObject({ code: "FORBIDDEN" });
      await expect(
        selections.select(
          1,
          async () => fixture.directory,
          () => true,
        ),
      ).rejects.toMatchObject({ code: "CA_INVALID" });
      if (process.platform !== "win32") {
        const alias = join(fixture.directory, "ca-alias.pem");
        await symlink(join(fixture.directory, "ca.pem"), alias);
        await expect(
          selections.select(
            1,
            async () => alias,
            () => true,
          ),
        ).rejects.toMatchObject({ code: "CA_INVALID" });
      }
      const big = join(fixture.directory, "big.pem");
      await writeFile(big, "x".repeat(MAX_CA_BYTES + 1));
      await expect(
        selections.select(
          1,
          async () => big,
          () => true,
        ),
      ).rejects.toMatchObject({ code: "CA_LIMIT" });
      let finish!: (path: string) => void;
      const pending = selections.select(
        1,
        () =>
          new Promise(resolve => {
            finish = resolve;
          }),
        () => true,
      );
      await expect(
        selections.select(
          1,
          async () => null,
          () => true,
        ),
      ).rejects.toMatchObject({ code: "UNAVAILABLE" });
      selections.disposeOwner(1);
      finish(join(fixture.directory, "ca.pem"));
      await expect(pending).rejects.toMatchObject({ code: "CA_SELECTION" });
    } finally {
      selections.dispose();
    }
  });
  it("expires retained PEM without requiring another access", async () => {
    const selections = new ProfileCaSelections();
    try {
      vi.useFakeTimers();
      const selected = await selections.select(
        1,
        async () => join(fixture.directory, "ca.pem"),
        () => true,
      );
      vi.advanceTimersByTime(CA_SELECTION_TTL_MS);
      expect(() => selections.get(1, selected!.selectionId)).toThrow();
    } finally {
      vi.useRealTimers();
      selections.dispose();
    }
  });
  it("rejects non-certificate bytes hidden after DER inside a PEM certificate block", () => {
    const base64 = fixture.ca.replace(/-----[^\n]+-----|\s/g, "");
    const bytes = Buffer.concat([
      Buffer.from(base64, "base64"),
      Buffer.from("synthetic extra bytes"),
    ]);
    const pem =
      "-----BEGIN CERTIFICATE-----\n" +
      bytes.toString("base64") +
      "\n-----END CERTIFICATE-----\n";
    expect(() => parseCaPem(pem)).toThrow("CA_INVALID");
  });
});
