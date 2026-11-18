// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { BrowserWindow, IpcMainInvokeEvent } from "electron";
import { APP_URL } from "../security/desktopPolicy";
import { DESKTOP_CHANNEL } from "../../shared/desktop";

const electron = vi.hoisted(() => ({
  handler: undefined as
    | ((event: IpcMainInvokeEvent, input: unknown) => Promise<unknown>)
    | undefined,
  handle: vi.fn(),
  removeHandler: vi.fn(),
  app: { getVersion: () => "1.0.0", isPackaged: true, quit: vi.fn() },
  shell: { openExternal: vi.fn().mockResolvedValue(undefined) },
  Menu: { buildFromTemplate: vi.fn(), popup: vi.fn() },
}));
vi.mock("electron", () => ({
  app: electron.app,
  shell: electron.shell,
  Menu: electron.Menu,
  ipcMain: {
    handle: (channel: string, handler: typeof electron.handler) => {
      electron.handle(channel);
      electron.handler = handler;
    },
    removeHandler: electron.removeHandler,
  },
}));
import { isTrustedSender, registerDesktopIpc } from "./desktop";

function fixture() {
  const frame = { url: APP_URL };
  const contents = { mainFrame: frame, focus: vi.fn() };
  const window = {
    isDestroyed: () => false,
    webContents: contents,
    close: vi.fn(),
    minimize: vi.fn(),
  };
  const event = { sender: contents, senderFrame: frame };
  return {
    window: window as unknown as BrowserWindow,
    event: event as unknown as IpcMainInvokeEvent,
  };
}
let dispose: () => void;
beforeEach(() => {
  vi.clearAllMocks();
  electron.Menu.buildFromTemplate.mockReturnValue({
    popup: electron.Menu.popup,
  });
});
afterEach(() => {
  dispose?.();
});

describe("privileged desktop boundary", () => {
  it("only accepts the active window's main frame at the exact page", () => {
    const { window, event } = fixture();
    expect(isTrustedSender(event, window, APP_URL)).toBe(true);
    expect(isTrustedSender(event, null, APP_URL)).toBe(false);
    expect(
      isTrustedSender({ ...event, senderFrame: null }, window, APP_URL),
    ).toBe(false);
    expect(
      isTrustedSender(
        { ...event, sender: {} } as IpcMainInvokeEvent,
        window,
        APP_URL,
      ),
    ).toBe(false);
    expect(
      isTrustedSender(
        { ...event, senderFrame: { url: APP_URL } } as IpcMainInvokeEvent,
        window,
        APP_URL,
      ),
    ).toBe(false);
    expect(isTrustedSender(event, window, APP_URL + "?other")).toBe(false);
  });
  it("rejects foreign senders before performing an action", async () => {
    const active = fixture();
    const foreign = fixture();
    dispose = registerDesktopIpc(() => active.window, APP_URL);
    const result = await electron.handler!(foreign.event, { command: "close" });
    expect(result).toMatchObject({ ok: false, error: { code: "FORBIDDEN" } });
    expect(active.window.close).not.toHaveBeenCalled();
  });
  it("rejects arbitrary URLs/actions and exposes only a fixed external destination", async () => {
    const { window, event } = fixture();
    dispose = registerDesktopIpc(() => window, APP_URL);
    expect(
      await electron.handler!(event, {
        command: "openLink",
        id: "https://evil.test",
      }),
    ).toMatchObject({ ok: false, error: { code: "VALIDATION" } });
    expect(electron.shell.openExternal).not.toHaveBeenCalled();
    expect(
      await electron.handler!(event, { command: "openLink", id: "author" }),
    ).toMatchObject({ ok: true });
    expect(electron.shell.openExternal).toHaveBeenCalledWith(
      "https://github.com/mxtheussouza",
    );
  });
  it("does not echo privileged errors, arguments or stacks", async () => {
    const { window, event } = fixture();
    electron.shell.openExternal.mockRejectedValueOnce(
      new Error("secret sentinel /private/path"),
    );
    dispose = registerDesktopIpc(() => window, APP_URL);
    const result = await electron.handler!(event, {
      command: "openLink",
      id: "author",
    });
    expect(result).toMatchObject({ ok: false, error: { code: "INTERNAL" } });
    expect(JSON.stringify(result)).not.toMatch(/secret|sentinel|private|stack/);
  });
  it("opens a native edit menu but rejects renderer-selected clipboard operations", async () => {
    const { window, event } = fixture();
    dispose = registerDesktopIpc(() => window, APP_URL);
    expect(
      await electron.handler!(event, { command: "edit", action: "paste" }),
    ).toMatchObject({ ok: false, error: { code: "VALIDATION" } });
    expect(electron.Menu.popup).not.toHaveBeenCalled();
    expect(
      await electron.handler!(event, { command: "showEditMenu" }),
    ).toMatchObject({ ok: true });
    expect(electron.Menu.popup).toHaveBeenCalledWith({ window });
    expect(electron.Menu.buildFromTemplate).toHaveBeenCalledWith(
      expect.arrayContaining([{ role: "paste" }, { role: "copy" }]),
    );
  });
  it("denies developer tools in packaged builds", async () => {
    const { window, event } = fixture();
    dispose = registerDesktopIpc(() => window, APP_URL);
    expect(
      await electron.handler!(event, {
        command: "view",
        action: "toggleDevTools",
      }),
    ).toMatchObject({ ok: false, error: { code: "UNAVAILABLE" } });
  });
  it("follows the current window after recreation without registering again, and disposes", async () => {
    let current: BrowserWindow | null = fixture().window;
    dispose = registerDesktopIpc(() => current, APP_URL);
    current = null;
    expect(
      await electron.handler!(fixture().event, { command: "info" }),
    ).toMatchObject({ ok: false, error: { code: "FORBIDDEN" } });
    const replacement = fixture();
    current = replacement.window;
    expect(
      await electron.handler!(replacement.event, { command: "info" }),
    ).toMatchObject({
      ok: true,
      value: { version: "1.0.0", development: false },
    });
    expect(electron.handle).toHaveBeenCalledExactlyOnceWith(DESKTOP_CHANNEL);
    dispose();
    expect(electron.removeHandler).toHaveBeenCalledWith(DESKTOP_CHANNEL);
  });
});
