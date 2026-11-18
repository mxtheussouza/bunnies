// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import { EventEmitter } from "node:events";
import { randomUUID } from "node:crypto";
import type { BrowserWindow, IpcMainInvokeEvent } from "electron";
import type { ProfileService } from "../profiles/service";
import type { ConnectionTestService } from "../connections/connectionTestService";
import { CONNECTIONS_CHANNEL } from "../../shared/connections";
import { APP_URL } from "../security/desktopPolicy";
const electron = vi.hoisted(() => ({
  handler: undefined as
    | undefined
    | ((event: IpcMainInvokeEvent, input: unknown) => Promise<unknown>),
  handle: vi.fn(),
  removeHandler: vi.fn(),
  showOpenDialog: vi.fn(),
}));
vi.mock("electron", () => ({
  ipcMain: {
    handle: (channel: string, handler: typeof electron.handler) => {
      electron.handle(channel);
      electron.handler = handler;
    },
    removeHandler: electron.removeHandler,
  },
  dialog: { showOpenDialog: electron.showOpenDialog },
}));
import { registerConnectionsIpc } from "./connections";
function fixture() {
  const frame = { url: APP_URL };
  const contents = Object.assign(new EventEmitter(), {
    id: 42,
    mainFrame: frame,
  });
  const window = Object.assign(new EventEmitter(), {
    webContents: contents,
    isDestroyed: () => false,
  });
  const event = {
    sender: contents,
    senderFrame: frame,
  } as unknown as IpcMainInvokeEvent;
  const ca = {
    select: vi.fn().mockResolvedValue(null),
    discard: vi.fn(),
    disposeOwner: vi.fn(),
  };
  const tests = {
    testAmqps: vi
      .fn()
      .mockResolvedValue({ outcome: "authenticated", vhost: "/" }),
    test: vi.fn().mockResolvedValue({ outcome: "authenticated" }),
    cancel: vi.fn(),
    cancelOwner: vi.fn(),
  };
  const dispose = registerConnectionsIpc(
    () => window as unknown as BrowserWindow,
    APP_URL,
    { caSelections: ca } as unknown as ProfileService,
    tests as unknown as ConnectionTestService,
  );
  return { frame, contents, window, event, ca, tests, dispose };
}
beforeEach(() => vi.clearAllMocks());
describe("HTTPS/CA IPC boundary", () => {
  it("rejects unknown fields, arbitrary paths/URLs, wrong types and foreign frame/window before side effects", async () => {
    const f = fixture();
    try {
      for (const event of [
        { ...f.event, sender: {} },
        { ...f.event, senderFrame: null },
        { ...f.event, senderFrame: { url: APP_URL } },
      ])
        expect(
          await electron.handler!(event as IpcMainInvokeEvent, {
            command: "selectProfileCa",
          }),
        ).toMatchObject({ ok: false, error: { code: "FORBIDDEN" } });
      for (const input of [
        { command: "selectProfileCa", path: "/private" },
        {
          command: "testProfileHttps",
          input: {
            profileId: randomUUID(),
            revision: "absent",
            operationId: randomUUID(),
            url: "https://evil.invalid",
          },
        },
        { command: "testProfileHttps", input: "x".repeat(2 * 1024 * 1024 + 1) },
        { command: "discardProfileCa", selectionId: "../../private" },
        { command: "cancelProfileHttpsTest", operationId: [] },
      ])
        expect(await electron.handler!(f.event, input)).toMatchObject({
          ok: false,
          error: { code: "VALIDATION" },
        });
      expect(f.ca.select).not.toHaveBeenCalled();
      expect(f.tests.test).not.toHaveBeenCalled();
      expect(electron.showOpenDialog).not.toHaveBeenCalled();
    } finally {
      f.dispose();
    }
  });
  it("opens only a native file dialog, returns cancellation without paths, and rechecks the window after it", async () => {
    const f = fixture();
    try {
      f.ca.select.mockImplementation(async (_owner, choose) => {
        await choose();
        return null;
      });
      electron.showOpenDialog.mockResolvedValue({
        canceled: true,
        filePaths: [],
      });
      expect(
        await electron.handler!(f.event, { command: "selectProfileCa" }),
      ).toMatchObject({ ok: true, value: null });
      expect(electron.showOpenDialog).toHaveBeenCalledWith(
        f.window,
        expect.objectContaining({ properties: ["openFile"] }),
      );
      electron.showOpenDialog.mockImplementation(async () => {
        f.frame.url = APP_URL + "#changed";
        return { canceled: false, filePaths: ["/private/path"] };
      });
      const result = await electron.handler!(f.event, {
        command: "selectProfileCa",
      });
      expect(result).toMatchObject({ ok: false, error: { code: "FORBIDDEN" } });
      expect(JSON.stringify(result)).not.toContain("private");
    } finally {
      f.dispose();
    }
  });
  it("binds tests/cancellation to the trusted owner and clears resources on reload, crash and window close", async () => {
    const f = fixture();
    const operationId = randomUUID();
    try {
      const input = {
        profileId: randomUUID(),
        revision: "absent",
        operationId,
      };
      expect(
        await electron.handler!(f.event, {
          command: "testProfileHttps",
          input,
        }),
      ).toMatchObject({ ok: true });
      expect(f.tests.test).toHaveBeenCalledWith(42, input);
      await electron.handler!(f.event, {
        command: "cancelProfileHttpsTest",
        operationId,
      });
      expect(f.tests.cancel).toHaveBeenCalledWith(42, operationId);
      for (const event of ["did-start-loading", "render-process-gone"])
        f.contents.emit(event);
      f.window.emit("closed");
      expect(f.ca.disposeOwner).toHaveBeenCalledWith(42);
      expect(f.tests.cancelOwner).toHaveBeenCalledWith(42);
      expect(f.contents.listenerCount("did-start-loading")).toBe(0);
    } finally {
      f.dispose();
    }
    expect(electron.removeHandler).toHaveBeenCalledWith(CONNECTIONS_CHANNEL);
  });
  it("never returns provider/transport stack, password, certificate or raw response", async () => {
    const f = fixture();
    try {
      f.tests.test.mockRejectedValue(
        new Error(
          "Authorization PRIVATE-SENTINEL /private/path CERTIFICATE stack",
        ),
      );
      const result = await electron.handler!(f.event, {
        command: "testProfileHttps",
        input: {
          profileId: randomUUID(),
          revision: "absent",
          operationId: randomUUID(),
        },
      });
      expect(result).toMatchObject({ ok: false, error: { code: "INTERNAL" } });
      expect(JSON.stringify(result)).not.toMatch(
        /PRIVATE|private|CERTIFICATE|stack|Authorization/,
      );
    } finally {
      f.dispose();
    }
  });
  it("validates and routes AMQPS only for the trusted owner, with transport-scoped cancel", async () => {
    const f = fixture();
    const input = {
      profileId: randomUUID(),
      revision: "absent",
      operationId: randomUUID(),
    };
    try {
      for (const invalid of [
        { ...input, url: "amqps://arbitrary" },
        { ...input, operationId: "bad" },
      ])
        expect(
          await electron.handler!(f.event, {
            command: "testProfileAmqps",
            input: invalid,
          }),
        ).toMatchObject({ ok: false, error: { code: "VALIDATION" } });
      expect(
        await electron.handler!(
          { ...f.event, senderFrame: null } as unknown as IpcMainInvokeEvent,
          { command: "testProfileAmqps", input },
        ),
      ).toMatchObject({ ok: false, error: { code: "FORBIDDEN" } });
      expect(f.tests.testAmqps).not.toHaveBeenCalled();
      expect(
        await electron.handler!(f.event, {
          command: "testProfileAmqps",
          input,
        }),
      ).toMatchObject({ ok: true });
      expect(f.tests.testAmqps).toHaveBeenCalledWith(42, input);
      await electron.handler!(f.event, {
        command: "cancelProfileAmqpsTest",
        operationId: input.operationId,
      });
      expect(f.tests.cancel).toHaveBeenCalledWith(
        42,
        input.operationId,
        "amqps",
      );
      f.tests.testAmqps.mockRejectedValue(
        new Error("PRIVATE-SECRET-CERTIFICATE"),
      );
      const result = await electron.handler!(f.event, {
        command: "testProfileAmqps",
        input,
      });
      expect(result).toMatchObject({ ok: false, error: { code: "INTERNAL" } });
      expect(JSON.stringify(result)).not.toContain("PRIVATE");
    } finally {
      f.dispose();
    }
  });
});
