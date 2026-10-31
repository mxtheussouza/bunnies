// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";
import { randomUUID } from "node:crypto";
import { ManagementService } from "./service";
import { ManagementFailure } from "./httpsRead";
import { ProfileFailure } from "../profiles/errors";
import type { SessionService } from "../sessions/sessionService";
import type { ProfileService } from "../profiles/service";
const input = () => ({
  sessionId: randomUUID(),
  generation: 1,
  operationId: randomUUID(),
});
function fixture() {
  let notify = () => undefined;
  const session = {
    onChange: (fn: () => undefined) => {
      notify = fn;
      return vi.fn();
    },
    managementContext: vi.fn(() => ({
      profileId: "synthetic",
      revision: "revision",
      vhost: "/",
    })),
  };
  const profiles = {
    connectionSnapshot: vi.fn(async () => ({
      httpsUrl: "https://localhost",
      username: "fixture",
      password: "SYNTHETIC-PRIVATE",
      trust: { mode: "default" as const },
    })),
    assertRevision: vi.fn(async () => undefined),
  };
  const read = vi.fn<typeof import("./httpsRead").readManagement>(async () => ({
    kind: "broker" as const,
    matrix: "unknown" as const,
  }));
  const service = new ManagementService(
    session as unknown as SessionService,
    profiles as unknown as ProfileService,
    read,
  );
  return { service, session, profiles, read, notify: () => notify() };
}
afterEach(() => vi.useRealTimers());
describe("manual management operations under session authority", () => {
  it("does no automatic reads, returns only dated projected data, never mutates the session", async () => {
    const f = fixture();
    expect(f.read).not.toHaveBeenCalled();
    const i = input(),
      result = await f.service.execute(1, i, "broker");
    expect(result).toMatchObject({
      ...i,
      kind: "broker",
      source: "https-management",
    });
    expect(Number.isFinite(Date.parse(result.checkedAt))).toBe(true);
    expect(JSON.stringify(result)).not.toContain("SYNTHETIC");
    expect(f.profiles.assertRevision).toHaveBeenCalledWith("revision");
    f.service.dispose();
  });
  it("rejects concurrent requests and old/foreign cancellation; cancels its own request", async () => {
    const f = fixture();
    f.read.mockImplementation(() => new Promise(() => undefined));
    const i = input(),
      p = f.service.execute(1, i, "broker");
    await Promise.resolve();
    await expect(f.service.execute(1, input(), "broker")).rejects.toMatchObject(
      { code: "BUSY" },
    );
    f.service.cancel(2, i);
    f.service.cancel(1, { ...i, generation: 2 });
    expect(f.read.mock.calls[0][2].aborted).toBe(false);
    const failed = expect(p).rejects.toMatchObject({ code: "CANCELLED" });
    f.service.cancel(1, i);
    await failed;
    expect(f.read.mock.calls[0][2].aborted).toBe(true);
    f.service.dispose();
  });
  it("invalidates work during context/lifecycle change, even if transport finishes late", async () => {
    const f = fixture();
    let finish!: (value: { kind: "broker"; matrix: "unknown" }) => void;
    f.read.mockImplementationOnce(
      () =>
        new Promise(resolve => {
          finish = resolve;
        }),
    );
    const p = f.service.execute(1, input(), "broker");
    await Promise.resolve();
    f.session.managementContext.mockImplementation(() => {
      throw new ProfileFailure("CONFLICT");
    });
    const failed = expect(p).rejects.toMatchObject({ code: "CONFLICT" });
    f.notify();
    await failed;
    f.session.managementContext.mockReturnValue({
      profileId: "new",
      revision: "next",
      vhost: "/",
    });
    finish({ kind: "broker", matrix: "unknown" });
    expect((await f.service.execute(1, input(), "broker")).kind).toBe("broker");
    f.service.dispose();
  });
  it("covers credential/revision waits inside total deadline and disposes without waiting for an adapter", async () => {
    vi.useFakeTimers();
    const f = fixture();
    f.profiles.connectionSnapshot.mockImplementation(
      () => new Promise(() => undefined),
    );
    const p = f.service.execute(1, input(), "broker"),
      failed = expect(p).rejects.toMatchObject({ code: "TIMEOUT" });
    await vi.advanceTimersByTimeAsync(10000);
    await failed;
    expect(f.read).not.toHaveBeenCalled();
    const q = f.service.execute(1, input(), "broker"),
      closed = expect(q).rejects.toMatchObject({ code: "CANCELLED" });
    f.service.dispose();
    await closed;
  });
  it("rechecks revision after I/O and never converts permission failure into retry", async () => {
    const f = fixture();
    f.profiles.assertRevision.mockRejectedValueOnce(
      new ProfileFailure("CONFLICT"),
    );
    await expect(f.service.execute(1, input(), "broker")).rejects.toMatchObject(
      { code: "CONFLICT" },
    );
    f.read.mockRejectedValueOnce(new ManagementFailure("DENIED"));
    await expect(f.service.execute(1, input(), "broker")).rejects.toMatchObject(
      { code: "DENIED" },
    );
    expect(f.read).toHaveBeenCalledTimes(2);
    f.service.dispose();
  });
});
