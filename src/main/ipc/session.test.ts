// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import { EventEmitter } from "node:events";
import { randomUUID } from "node:crypto";
import type { BrowserWindow, IpcMainInvokeEvent } from "electron";
import type { SessionService } from "../sessions/sessionService";
import { APP_URL } from "../security/desktopPolicy";
import { emptySession } from "../../shared/session";
const mock = vi.hoisted(() => ({
  handler: undefined as
    | undefined
    | ((event: IpcMainInvokeEvent, value: unknown) => Promise<unknown>),
  on: vi.fn(),
  remove: vi.fn(),
  removeHandler: vi.fn(),
}));
vi.mock("electron", () => ({
  ipcMain: {
    handle: (_channel: string, handler: typeof mock.handler) => {
      mock.handler = handler;
    },
    removeHandler: mock.removeHandler,
  },
  powerMonitor: { on: mock.on, removeListener: mock.remove },
}));
import { registerSessionIpc } from "./session";
function fixture() {
  const frame = { url: APP_URL, send: vi.fn() };
  const contents = Object.assign(new EventEmitter(), {
    id: 42,
    mainFrame: frame,
  });
  const window = Object.assign(new EventEmitter(), {
    webContents: contents,
    isDestroyed: () => false,
    isVisible: () => true,
    isFocused: () => true,
    isMinimized: () => false,
  });
  let publish = () => undefined;
  const unsubscribe = vi.fn();
  const service = {
    onChange: (fn: () => undefined) => {
      publish = fn;
      return unsubscribe;
    },
    getState: vi.fn(() => emptySession()),
    connect: vi.fn(() => emptySession()),
    disconnect: vi.fn(async () => emptySession()),
    stopOwner: vi.fn(async () => undefined),
    setVisible: vi.fn(),
    setSuspended: vi.fn(),
  };
  const dispose = registerSessionIpc(
    () => window as unknown as BrowserWindow,
    APP_URL,
    service as unknown as SessionService,
  );
  const event = {
    sender: contents,
    senderFrame: frame,
  } as unknown as IpcMainInvokeEvent;
  const call = (input: unknown, e = event) =>
    mock.handler!(e, input) as Promise<{
      ok: boolean;
      error?: { code: string };
    }>;
  return {
    service,
    frame,
    window,
    contents,
    event,
    call,
    dispose,
    publish: () => publish(),
    unsubscribe,
  };
}
beforeEach(() => vi.clearAllMocks());
describe("session IPC authority, shape and events", () => {
  it("denies foreign windows/frames and fields before side effects", async () => {
    const f = fixture();
    for (const event of [
      { ...f.event, sender: {} },
      { ...f.event, senderFrame: null },
      { ...f.event, senderFrame: { url: APP_URL } },
    ])
      expect(
        (
          await f.call(
            { command: "getSessionState" },
            event as IpcMainInvokeEvent,
          )
        ).error?.code,
      ).toBe("FORBIDDEN");
    for (const input of [
      { command: "getSessionState", url: "https://external.invalid" },
      { command: "invoke" },
      {
        command: "connectSession",
        input: {
          profileId: randomUUID(),
          revision: "absent",
          operationId: randomUUID(),
          password: "sentinel",
        },
      },
      {
        command: "disconnectSession",
        input: { sessionId: randomUUID(), generation: -1 },
      },
    ])
      expect((await f.call(input)).error?.code).toBe("VALIDATION");
    expect(f.service.connect).not.toHaveBeenCalled();
    expect(f.service.getState).not.toHaveBeenCalled();
    f.dispose();
  });
  it("routes only the owner's finite commands and stops on lifecycle changes", async () => {
    const f = fixture(),
      input = {
        profileId: randomUUID(),
        revision: "absent",
        operationId: randomUUID(),
      };
    expect((await f.call({ command: "connectSession", input })).ok).toBe(true);
    expect(f.service.connect).toHaveBeenCalledWith(42, input);
    f.publish();
    expect(f.frame.send).toHaveBeenCalledTimes(1);
    f.frame.url = "https://external.invalid";
    f.publish();
    expect(f.frame.send).toHaveBeenCalledTimes(1);
    f.contents.emit("did-start-loading");
    expect(f.service.stopOwner).toHaveBeenCalledWith(42);
    f.dispose();
    expect(f.unsubscribe).toHaveBeenCalledTimes(1);
    expect(mock.remove).toHaveBeenCalledTimes(2);
  });
  it("revalidates authority after asynchronous disconnect", async () => {
    const f = fixture();
    let finish!: (state: ReturnType<typeof emptySession>) => void;
    f.service.disconnect.mockImplementation(
      () =>
        new Promise(resolve => {
          finish = resolve;
        }),
    );
    const pending = f.call({
      command: "disconnectSession",
      input: { sessionId: randomUUID(), generation: 1 },
    });
    f.frame.url = "https://external.invalid";
    finish(emptySession());
    expect((await pending).error?.code).toBe("FORBIDDEN");
    f.dispose();
  });
});
