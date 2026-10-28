// @vitest-environment node
import { describe, expect, it, vi } from "vitest";
import { randomUUID } from "node:crypto";
import type { ProfileService } from "../profiles/service";
import { HttpsTestService } from "./httpsTestService";
import { HTTPS_TEST_TIMEOUT_MS } from "../../shared/connections";
function fixture() {
  let change = () => {};
  const profile = {
    id: randomUUID(),
    httpsUrl: "https://localhost",
    username: "synthetic",
    password: "PRIVATE-SENTINEL",
    trust: { mode: "default" as const },
  };
  const profiles = {
    onChanged: vi.fn((callback: () => void) => {
      change = callback;
      return vi.fn();
    }),
    connectionSnapshot: vi.fn().mockResolvedValue(profile),
    assertRevision: vi.fn().mockResolvedValue(undefined),
  };
  const probe = vi.fn().mockResolvedValue(undefined);
  const service = new HttpsTestService(
    profiles as unknown as ProfileService,
    probe,
  );
  const input = {
    operationId: randomUUID(),
    profileId: profile.id,
    revision: "a".repeat(64),
  };
  return { service, profiles, probe, input, change: () => change() };
}
describe("main-owned HTTPS test lifecycle", () => {
  it("returns a dated sanitized result only after revalidating the stored revision", async () => {
    const { service, profiles, input } = fixture();
    try {
      const value = await service.test(1, input);
      expect(value).toMatchObject({ ...input, outcome: "authenticated" });
      expect(Date.parse(value.checkedAt)).not.toBeNaN();
      expect(JSON.stringify(value)).not.toMatch(/PRIVATE|password|pem/);
      expect(profiles.assertRevision).toHaveBeenCalledWith(input.revision);
    } finally {
      service.dispose();
    }
  });
  it("does not start transport without credentials or when the snapshot is stale", async () => {
    const { service, profiles, probe, input } = fixture();
    profiles.connectionSnapshot.mockRejectedValue(
      new Error("missing synthetic secret"),
    );
    try {
      await expect(service.test(1, input)).rejects.toThrow();
      expect(probe).not.toHaveBeenCalled();
    } finally {
      service.dispose();
    }
  });
  it("limits concurrency, isolates cancellation by window/operation and invalidates late results", async () => {
    const { service, probe, input, change } = fixture();
    let finish!: () => void;
    probe.mockImplementation(
      () =>
        new Promise<void>(resolve => {
          finish = resolve;
        }),
    );
    try {
      const pending = service.test(1, input);
      await vi.waitFor(() => expect(probe).toHaveBeenCalledOnce());
      await expect(
        service.test(1, { ...input, operationId: randomUUID() }),
      ).rejects.toMatchObject({ code: "UNAVAILABLE" });
      service.cancel(2, input.operationId);
      service.cancel(1, randomUUID());
      change();
      await expect(pending).rejects.toMatchObject({ code: "CONFLICT" });
      finish();
      probe.mockResolvedValue(undefined);
      expect(
        (await service.test(1, { ...input, operationId: randomUUID() }))
          .outcome,
      ).toBe("authenticated");
    } finally {
      service.dispose();
    }
  });
  it("applies a total 10-second deadline even to a delayed snapshot and prevents a later request", async () => {
    const { service, profiles, probe, input } = fixture();
    let finish!: (value: unknown) => void;
    profiles.connectionSnapshot.mockImplementation(
      () =>
        new Promise(resolve => {
          finish = resolve;
        }),
    );
    vi.useFakeTimers();
    try {
      const pending = service.test(1, input);
      const assertion = expect(pending).rejects.toMatchObject({
        code: "TEST_TIMEOUT",
      });
      await vi.advanceTimersByTimeAsync(HTTPS_TEST_TIMEOUT_MS);
      await assertion;
      finish({});
      await Promise.resolve();
      expect(probe).not.toHaveBeenCalled();
    } finally {
      vi.useRealTimers();
      service.dispose();
    }
  });
  it("cancels on window shutdown/disposal and does not allow work after quit", async () => {
    const { service, probe, input } = fixture();
    probe.mockImplementation(() => new Promise(() => {}));
    const pending = service.test(1, input);
    service.cancelOwner(1);
    await expect(pending).rejects.toMatchObject({ code: "TEST_CANCELLED" });
    service.dispose();
    await expect(service.test(1, input)).rejects.toMatchObject({
      code: "UNAVAILABLE",
    });
  });
});
