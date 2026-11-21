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
      name: "Isolado",
      environment: "production" as const,
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
  const declaration = vi.fn<typeof import("./queueDeclaration").declareQueue>();
  const inspectPurge = vi.fn<typeof import("./queuePurge").inspectPurgeQueue>(
    async () => "classic",
  );
  const purge = vi.fn<typeof import("./queuePurge").purgeQueue>();
  const exchangeDeclare =
    vi.fn<typeof import("./exchangeDeclaration").declareExchange>();
  const bindingCreate = vi.fn<typeof import("./bindingCreate").createBinding>();
  const service = new ManagementService(
    session as unknown as SessionService,
    profiles as unknown as ProfileService,
    read,
    declaration,
    inspectPurge,
    purge,
    exchangeDeclare,
    bindingCreate,
  );
  return {
    service,
    exchangeDeclare,
    bindingCreate,
    session,
    profiles,
    read,
    declaration,
    inspectPurge,
    purge,
    notify: () => notify(),
  };
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

it("shares the administrative slot and cancels queue reads when the AMQPS context is lost", async () => {
  const f = fixture();
  const i = input();
  const query = { kind: "queuePage", page: 1, search: "[literal]" } as const;
  f.session.managementContext.mockReturnValue({
    profileId: "synthetic",
    revision: "revision",
    vhost: "literal%2F",
  });
  f.read.mockImplementationOnce(() => new Promise(() => undefined));
  const p = f.service.execute(1, i, query);
  await Promise.resolve();
  expect(f.session.managementContext).toHaveBeenCalledWith(1, i, true, false);
  expect(f.read.mock.calls[0][1]).toEqual({ ...query, vhost: "literal%2F" });
  await expect(f.service.execute(1, input(), "vhosts")).rejects.toMatchObject({
    code: "BUSY",
  });
  f.session.managementContext.mockImplementation(() => {
    throw new ProfileFailure("UNAVAILABLE");
  });
  const failed = expect(p).rejects.toMatchObject({ code: "CONFLICT" });
  f.notify();
  await failed;
  expect(f.read.mock.calls[0][2].aborted).toBe(true);
  f.service.dispose();
});

it("rejects the conflicting list route before reading credentials or using the transport", async () => {
  const f = fixture();
  f.session.managementContext.mockReturnValue({
    profileId: "synthetic",
    revision: "revision",
    vhost: "detailed",
  });
  await expect(
    f.service.execute(1, input(), { kind: "queuePage", page: 1 }),
  ).rejects.toMatchObject({
    code: "QUEUE_LIST_ROUTE",
  });
  expect(f.profiles.connectionSnapshot).not.toHaveBeenCalled();
  expect(f.read).not.toHaveBeenCalled();
  f.service.dispose();
});

const declarationInput = () => ({
  ...input(),
  declaration: { name: "synthetic", type: "quorum" as const, arguments: {} },
});

it.each(["unsent", "sent", "accepted"] as const)(
  "cancels declaration in phase %s, keeps the shared slot and classifies the outcome",
  async phase => {
    const f = fixture();
    const request = declarationInput();
    f.declaration.mockImplementation(
      async (_profile, _vhost, _input, signal, progress, check) => {
        await check();
        progress(phase);
        await new Promise<void>((_resolve, reject) => {
          signal.addEventListener("abort", () => reject(signal.reason), {
            once: true,
          });
        });
        return "confirmed";
      },
    );
    const result = f.service.declareQueue(1, request, () => true);
    const verified =
      phase === "unsent"
        ? expect(result).rejects.toMatchObject({ code: "CANCELLED" })
        : expect(result).resolves.toMatchObject({
            status: phase === "sent" ? "uncertain" : "unverified",
            reason: "CANCELLED",
          });
    await expect(f.service.execute(1, input(), "broker")).rejects.toMatchObject(
      { code: "BUSY" },
    );
    const abortSignal = f.declaration.mock.calls[0][3];
    f.service.cancel(1, request);
    f.service.cancel(2, request, "declaration");
    expect(abortSignal.aborted).toBe(false);
    f.service.cancel(1, request, "declaration");
    await verified;
    await expect(
      f.service.execute(1, input(), "broker"),
    ).resolves.toMatchObject({ kind: "broker" });
    f.service.dispose();
  },
);

it("times out declaration after possible dispatch and rejects a new owner before delivery", async () => {
  vi.useFakeTimers();
  const f = fixture();
  f.declaration.mockImplementation(
    async (_profile, _vhost, _input, _signal, progress, check) => {
      await check();
      progress("sent");
      return new Promise(() => undefined);
    },
  );
  const result = f.service.declareQueue(1, declarationInput(), () => true);
  const pending = expect(result).resolves.toMatchObject({
    status: "uncertain",
    reason: "TIMEOUT",
  });
  await vi.advanceTimersByTimeAsync(30_000);
  await pending;
  await expect(
    f.service.declareQueue(1, declarationInput(), () => false),
  ).rejects.toMatchObject({
    code: "FORBIDDEN",
  });
  f.service.dispose();
});

it("treats changed profile revision after the declared write as unverified", async () => {
  const f = fixture();
  f.declaration.mockImplementation(
    async (_profile, _vhost, _input, _signal, progress, check) => {
      await check();
      progress("sent");
      progress("accepted");
      f.profiles.assertRevision.mockRejectedValueOnce(
        new ProfileFailure("CONFLICT"),
      );
      return "confirmed";
    },
  );
  await expect(
    f.service.declareQueue(1, declarationInput(), () => true),
  ).resolves.toMatchObject({
    status: "unverified",
    reason: "CONFLICT",
  });
  f.service.dispose();
});

const purgeInput = () => ({ ...input(), name: "fila %2F" });

it("derives the purge target in the main and transmits once only after confirmation", async () => {
  const f = fixture();
  const request = purgeInput();
  const confirm = vi.fn(async () => false);
  await expect(
    f.service.purgeQueue(1, request, () => true, confirm),
  ).rejects.toMatchObject({
    code: "CANCELLED",
  });
  expect(confirm).toHaveBeenCalledWith(
    {
      profileName: "Isolado",
      environment: "production",
      httpsUrl: "https://localhost",
      vhost: "/",
      name: request.name,
      queueType: "classic",
    },
    expect.any(AbortSignal),
  );
  expect(f.purge).not.toHaveBeenCalled();
  confirm.mockResolvedValue(true);
  f.purge.mockImplementation(
    async (_profile, vhost, name, _signal, sent, authorize) => {
      expect({ vhost, name }).toEqual({ vhost: "/", name: request.name });
      await authorize();
      sent();
    },
  );
  await expect(
    f.service.purgeQueue(1, request, () => true, confirm),
  ).resolves.toMatchObject({
    ...request,
    vhost: "/",
    status: "accepted",
  });
  expect(f.purge).toHaveBeenCalledTimes(1);
  f.service.dispose();
});

it("keeps the shared slot while an aborted purge confirmation closes", async () => {
  const f = fixture();
  const request = purgeInput();
  let close!: (confirmed: boolean) => void;
  const confirm = vi.fn<Parameters<ManagementService["purgeQueue"]>[3]>(
    async () =>
      new Promise<boolean>(resolve => {
        close = resolve;
      }),
  );
  const operation = f.service.purgeQueue(1, request, () => true, confirm);
  const check = expect(operation).rejects.toMatchObject({ code: "CANCELLED" });
  await vi.waitFor(() => expect(confirm).toHaveBeenCalledOnce());
  const modalSignal = confirm.mock.calls[0][1];
  f.service.cancel(2, request, "purge");
  f.service.cancel(1, request, "declaration");
  expect(modalSignal.aborted).toBe(false);
  f.service.cancel(1, request, "purge");
  expect(modalSignal.aborted).toBe(true);
  await expect(f.service.execute(1, input(), "broker")).rejects.toMatchObject({
    code: "BUSY",
  });
  close(true);
  await check;
  expect(f.purge).not.toHaveBeenCalled();
  await expect(f.service.execute(1, input(), "broker")).resolves.toMatchObject({
    kind: "broker",
  });
  f.service.dispose();
});

it("revalidates the foreground after native confirmation and just before transmission", async () => {
  const f = fixture();
  const request = purgeInput();
  let foreground = true;
  await expect(
    f.service.purgeQueue(
      1,
      request,
      () => foreground,
      async () => {
        foreground = false;
        return true;
      },
    ),
  ).rejects.toMatchObject({ code: "FORBIDDEN" });
  expect(f.purge).not.toHaveBeenCalled();
  foreground = true;
  const sent = vi.fn();
  f.purge.mockImplementation(
    async (_profile, _vhost, _name, _signal, notifySent, authorize) => {
      f.profiles.assertRevision.mockRejectedValueOnce(
        new ProfileFailure("CONFLICT"),
      );
      await authorize();
      sent();
      notifySent();
    },
  );
  await expect(
    f.service.purgeQueue(
      1,
      request,
      () => foreground,
      async () => true,
    ),
  ).rejects.toMatchObject({
    code: "CONFLICT",
  });
  expect(sent).not.toHaveBeenCalled();
  f.service.dispose();
});

it("expires native confirmation and classifies post-send loss as uncertain", async () => {
  vi.useFakeTimers();
  const f = fixture();
  const request = purgeInput();
  const timeout = f.service.purgeQueue(
    1,
    request,
    () => true,
    async (_target, signal) =>
      new Promise(resolve =>
        signal.addEventListener("abort", () => resolve(true), { once: true }),
      ),
  );
  const check = expect(timeout).rejects.toMatchObject({ code: "TIMEOUT" });
  await vi.advanceTimersByTimeAsync(60_000);
  await check;
  expect(f.purge).not.toHaveBeenCalled();
  f.purge.mockImplementationOnce(
    async (_profile, _vhost, _name, _signal, sent, authorize) => {
      await authorize();
      sent();
      throw new ManagementFailure("NETWORK");
    },
  );
  await expect(
    f.service.purgeQueue(
      1,
      request,
      () => true,
      async () => true,
    ),
  ).resolves.toMatchObject({
    status: "uncertain",
    reason: "NETWORK",
  });
  expect(f.purge).toHaveBeenCalledTimes(1);
  f.service.dispose();
});

it("scopes an exchange query to the current vhost and shares cancellation with other readers", async () => {
  const f = fixture();
  const request = input();
  const query = {
    kind: "exchangeBindings",
    name: "src",
    direction: "outgoing",
  } as const;
  f.session.managementContext.mockReturnValue({
    profileId: "synthetic",
    revision: "revision",
    vhost: "detailed",
  });
  f.read.mockImplementationOnce(() => new Promise(() => undefined));
  const pending = f.service.execute(1, request, query);
  const cancelled = expect(pending).rejects.toMatchObject({
    code: "CANCELLED",
  });
  await Promise.resolve();
  expect(f.read.mock.calls[0][1]).toEqual({ ...query, vhost: "detailed" });
  await expect(
    f.service.execute(1, input(), { kind: "queuePage", page: 1 }),
  ).rejects.toMatchObject({ code: "BUSY" });
  f.service.cancel(2, request);
  f.service.cancel(1, { ...request, operationId: randomUUID() });
  expect(f.read.mock.calls[0][2].aborted).toBe(false);
  f.service.cancel(1, request);
  await cancelled;
  f.service.dispose();
});

it("rejects unsafe exchange segments and default binding reads before loading credentials", async () => {
  const f = fixture();
  await expect(
    f.service.execute(1, input(), {
      kind: "exchangeDetail",
      name: "amq.default",
    }),
  ).rejects.toMatchObject({ code: "EXCHANGE_SEGMENT" });
  await expect(
    f.service.execute(1, input(), {
      kind: "exchangeBindings",
      name: "",
      direction: "outgoing",
    }),
  ).rejects.toMatchObject({ code: "EXCHANGE_DEFAULT_BINDINGS" });
  expect(f.profiles.connectionSnapshot).not.toHaveBeenCalled();
  expect(f.read).not.toHaveBeenCalled();
  f.service.dispose();
});

describe("exchange declaration authority", () => {
  const declaration = {
    name: "tópico/a",
    type: "topic" as const,
    durable: true,
    autoDelete: false,
  };
  it("validates resource and vhost before retrieving credentials", async () => {
    const f = fixture();
    for (const name of [
      "",
      "amq.default",
      "amq.topic",
      ".",
      "..",
      "x".repeat(256),
    ]) {
      await expect(
        f.service.declareExchange(
          1,
          { ...input(), declaration: { ...declaration, name } },
          () => true,
        ),
      ).rejects.toMatchObject({ code: "VALIDATION" });
    }
    f.session.managementContext.mockReturnValue({
      profileId: "p",
      revision: "r",
      vhost: "..",
    });
    await expect(
      f.service.declareExchange(1, { ...input(), declaration }, () => true),
    ).rejects.toMatchObject({ code: "EXCHANGE_SEGMENT" });
    expect(f.profiles.connectionSnapshot).not.toHaveBeenCalled();
    expect(f.exchangeDeclare).not.toHaveBeenCalled();
  });
  it.each(["unsent", "sent", "accepted"] as const)(
    "cancels only its own pending %s declaration and shares the administrative slot",
    async phase => {
      const f = fixture(),
        ref = input(),
        req = { ...ref, declaration };
      f.exchangeDeclare.mockImplementation(
        async (_profile, _vhost, _fields, _signal, progress, authorize) => {
          await authorize();
          progress(phase);
          return new Promise(() => undefined);
        },
      );
      const result = f.service.declareExchange(1, req, () => true);
      await vi.waitFor(() =>
        expect(f.profiles.assertRevision).toHaveBeenCalled(),
      );
      await expect(
        f.service.declareExchange(1, req, () => true),
      ).rejects.toMatchObject({ code: "BUSY" });
      f.service.cancel(2, ref, "exchangeDeclaration");
      f.service.cancel(1, ref, "declaration");
      f.service.cancel(1, { ...ref, generation: 2 }, "exchangeDeclaration");
      expect(f.exchangeDeclare.mock.calls[0][3].aborted).toBe(false);
      f.service.cancel(1, ref, "exchangeDeclaration");
      if (phase === "unsent")
        await expect(result).rejects.toMatchObject({ code: "CANCELLED" });
      else
        await expect(result).resolves.toMatchObject({
          kind: "exchangeDeclaration",
          status: phase === "sent" ? "uncertain" : "unverified",
          reason: "CANCELLED",
        });
      expect(f.exchangeDeclare).toHaveBeenCalledOnce();
    },
  );
});

it("keeps one binding write in flight and ignores cancellation from another owner", async () => {
  const f = fixture(),
    ref = input();
  const request = {
    ...ref,
    binding: {
      source: "origem",
      destination: "destino",
      destinationType: "queue" as const,
      routingKey: ".",
      arguments: {},
    },
  };
  f.bindingCreate.mockImplementation(
    async (_profile, _target, _body, _signal, assertContext, progress) => {
      await assertContext();
      progress("sent");
      return new Promise(() => undefined);
    },
  );
  const result = f.service.createBinding(1, request, () => true);
  await vi.waitFor(() => expect(f.bindingCreate).toHaveBeenCalledOnce());
  await expect(
    f.service.createBinding(1, request, () => true),
  ).rejects.toMatchObject({ code: "BUSY" });
  f.service.cancel(2, ref, "bindingCreation");
  f.service.cancel(1, ref, "exchangeDeclaration");
  f.service.cancel(1, { ...ref, generation: 2 }, "bindingCreation");
  expect(f.bindingCreate.mock.calls[0][3].aborted).toBe(false);
  f.service.cancel(1, ref, "bindingCreation");
  await expect(result).resolves.toMatchObject({
    kind: "bindingCreation",
    status: "uncertain",
    reason: "CANCELLED",
  });
  expect(f.bindingCreate).toHaveBeenCalledOnce();
  f.service.dispose();
});

it("rejects an old binding session before reading credentials", async () => {
  const f = fixture();
  f.session.managementContext.mockImplementation(() => {
    throw new ProfileFailure("CONFLICT");
  });
  await expect(
    f.service.createBinding(
      1,
      {
        ...input(),
        binding: {
          source: "origem",
          destination: "destino",
          destinationType: "exchange",
          routingKey: "",
          arguments: {},
        },
      },
      () => true,
    ),
  ).rejects.toMatchObject({ code: "CONFLICT" });
  expect(f.profiles.connectionSnapshot).not.toHaveBeenCalled();
  expect(f.bindingCreate).not.toHaveBeenCalled();
  f.service.dispose();
});
