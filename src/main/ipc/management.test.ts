// @vitest-environment node
import { describe, expect, it, vi } from "vitest";
import { randomUUID } from "node:crypto";
import type { BrowserWindow, IpcMainInvokeEvent } from "electron";
import { APP_URL } from "../security/desktopPolicy";
import type { ManagementService } from "../management/service";
const mock = vi.hoisted(() => ({
  handler: undefined as
    | undefined
    | ((event: IpcMainInvokeEvent, input: unknown) => Promise<unknown>),
  remove: vi.fn(),
}));
vi.mock("electron", () => ({
  ipcMain: {
    handle: (_name: string, fn: typeof mock.handler) => {
      mock.handler = fn;
    },
    removeHandler: mock.remove,
  },
}));
import { registerManagementIpc } from "./management";
function fixture() {
  const frame = { url: APP_URL },
    contents = { id: 42, mainFrame: frame };
  const window = { webContents: contents, isDestroyed: () => false };
  const service = {
    execute: vi.fn(async () => undefined),
    cancel: vi.fn(() => undefined),
  };
  const dispose = registerManagementIpc(
    () => window as unknown as BrowserWindow,
    APP_URL,
    service as unknown as ManagementService,
  );
  const event = {
    sender: contents,
    senderFrame: frame,
  } as unknown as IpcMainInvokeEvent;
  const input = {
    sessionId: randomUUID(),
    generation: 1,
    operationId: randomUUID(),
  };
  const call = (value: unknown, e = event) =>
    mock.handler!(e, value) as Promise<{
      ok: boolean;
      error?: { code: string };
    }>;
  return { frame, service, call, event, input, dispose };
}
describe("management IPC exact frame authority", () => {
  it("denies foreign frames and unknown fields before effects", async () => {
    const f = fixture();
    for (const e of [
      { ...f.event, sender: {} },
      { ...f.event, senderFrame: { url: APP_URL } },
      { ...f.event, senderFrame: null },
    ])
      expect(
        (
          await f.call(
            { command: "getBrokerInfo", input: f.input },
            e as IpcMainInvokeEvent,
          )
        ).error?.code,
      ).toBe("FORBIDDEN");
    expect(
      (
        await f.call({
          command: "listSessionVhosts",
          input: { ...f.input, page: 1 },
        })
      ).error?.code,
    ).toBe("VALIDATION");
    expect(f.service.execute).not.toHaveBeenCalled();
    f.dispose();
  });
  it("routes named operations and revalidates authority after asynchronous work", async () => {
    const f = fixture();
    let finish!: () => void;
    f.service.execute.mockImplementationOnce(
      () =>
        new Promise(resolve => {
          finish = () => resolve(undefined);
        }),
    );
    const p = f.call({ command: "listSessionVhosts", input: f.input });
    f.frame.url = "https://outside.invalid";
    finish();
    expect((await p).error?.code).toBe("FORBIDDEN");
    expect(f.service.execute).toHaveBeenCalledWith(42, f.input, "vhosts");
    f.frame.url = APP_URL;
    expect(
      (await f.call({ command: "cancelManagementRead", input: f.input })).ok,
    ).toBe(true);
    expect(f.service.cancel).toHaveBeenCalledWith(42, f.input);
    f.dispose();
  });
});

it("validates queue bounds and rejects renderer-supplied vhost, URL and identity", async () => {
  const f = fixture();
  for (const extra of [
    { page: 0 },
    { page: 1.5 },
    { page: 2_147_483_648 },
    { page: 1, search: "á".repeat(128) },
    { page: 1, search: "\ud800" },
    { page: 1, search: "" },
    { page: 1, vhost: "/" },
    { page: 1, url: "https://invalid.example" },
  ]) {
    expect(
      (
        await f.call({
          command: "listSessionQueues",
          input: { ...f.input, ...extra },
        })
      ).error?.code,
    ).toBe("VALIDATION");
  }
  expect(f.service.execute).not.toHaveBeenCalled();
  const input = { ...f.input, page: 2, search: "[literal]" };
  expect(
    (await f.call({ command: "listSessionQueues", input })).error?.code,
  ).toBe("RESPONSE");
  expect(f.service.execute).toHaveBeenCalledWith(42, input, {
    kind: "queuePage",
    page: 2,
    search: "[literal]",
  });
  f.dispose();
});
