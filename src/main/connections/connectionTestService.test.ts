// @vitest-environment node
import { describe, expect, it, vi } from "vitest";
import { randomUUID } from "node:crypto";
import type { ProfileService } from "../profiles/service";
import { ProfileFailure } from "../profiles/errors";
import { ConnectionTestService } from "./connectionTestService";
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
  const service = new ConnectionTestService(
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

describe("AMQPS test shares main ownership with HTTPS", () => {
  function setup() {
    const f = fixture();
    f.service.dispose();
    const amqp = vi.fn().mockResolvedValue("equipe/pedidos");
    const service = new ConnectionTestService(
      f.profiles as unknown as ProfileService,
      f.probe,
      amqp,
    );
    return { ...f, service, amqp };
  }
  it("returns only the dated vhost result after revalidation", async () => {
    const { service, input, amqp, profiles } = setup();
    try {
      expect(await service.testAmqps(1, input)).toMatchObject({
        ...input,
        vhost: "equipe/pedidos",
        outcome: "authenticated",
      });
      expect(amqp).toHaveBeenCalledOnce();
      expect(profiles.assertRevision).toHaveBeenCalledWith(input.revision);
    } finally {
      service.dispose();
    }
  });
  it("refuses AMQPS without credentials before invoking the probe", async () => {
    const { service, profiles, amqp, input } = setup();
    profiles.connectionSnapshot.mockRejectedValue(
      new ProfileFailure("CREDENTIALS"),
    );
    try {
      await expect(service.testAmqps(1, input)).rejects.toMatchObject({
        code: "AMQP_CREDENTIALS",
      });
      expect(amqp).not.toHaveBeenCalled();
    } finally {
      service.dispose();
    }
  });
  it("excludes HTTPS while AMQPS is pending and scopes cancellation to transport/owner/id", async () => {
    const { service, input, amqp } = setup();
    amqp.mockImplementation(() => new Promise(() => {}));
    try {
      const pending = service.testAmqps(1, input);
      const assertion = expect(pending).rejects.toMatchObject({
        code: "AMQP_CANCELLED",
      });
      await vi.waitFor(() => expect(amqp).toHaveBeenCalledOnce());
      await expect(service.test(1, input)).rejects.toMatchObject({
        code: "UNAVAILABLE",
      });
      service.cancel(1, input.operationId);
      service.cancel(2, input.operationId, "amqps");
      service.cancel(1, randomUUID(), "amqps");
      service.cancel(1, input.operationId, "amqps");
      await assertion;
    } finally {
      service.dispose();
    }
  });
  it("excludes AMQPS while HTTPS is pending", async () => {
    const { service, input, probe, amqp } = setup();
    probe.mockImplementation(() => new Promise(() => {}));
    try {
      const pending = service.test(1, input);
      const assertion = expect(pending).rejects.toMatchObject({
        code: "TEST_CANCELLED",
      });
      await expect(service.testAmqps(1, input)).rejects.toMatchObject({
        code: "UNAVAILABLE",
      });
      expect(amqp).not.toHaveBeenCalled();
      service.cancelOwner(1);
      await assertion;
    } finally {
      service.dispose();
    }
  });
  it("uses a total 15s deadline even when snapshot resolution is delayed", async () => {
    const { service, input, profiles, amqp } = setup();
    let finish!: (value: unknown) => void;
    profiles.connectionSnapshot.mockImplementation(
      () =>
        new Promise(resolve => {
          finish = resolve;
        }),
    );
    vi.useFakeTimers();
    try {
      const pending = service.testAmqps(1, input);
      const assertion = expect(pending).rejects.toMatchObject({
        code: "AMQP_TIMEOUT",
      });
      await vi.advanceTimersByTimeAsync(15000);
      await assertion;
      finish({});
      await Promise.resolve();
      expect(amqp).not.toHaveBeenCalled();
    } finally {
      vi.useRealTimers();
      service.dispose();
    }
  });
  it("discards late AMQPS success after profile mutation or shutdown", async () => {
    const { service, input, amqp, change } = setup();
    let finish!: (value: string) => void;
    amqp.mockImplementation(
      () =>
        new Promise(resolve => {
          finish = resolve;
        }),
    );
    try {
      const pending = service.testAmqps(1, input);
      const assertion = expect(pending).rejects.toMatchObject({
        code: "CONFLICT",
      });
      await vi.waitFor(() => expect(amqp).toHaveBeenCalledOnce());
      change();
      await assertion;
      finish("late-vhost");
      await Promise.resolve();
      service.dispose();
      await expect(service.testAmqps(1, input)).rejects.toMatchObject({
        code: "UNAVAILABLE",
      });
    } finally {
      service.dispose();
    }
  });
});
