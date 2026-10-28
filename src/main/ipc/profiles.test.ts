// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { BrowserWindow, IpcMainInvokeEvent } from "electron";
import type { ProfileService } from "../profiles/service";
import { APP_URL } from "../security/desktopPolicy";
import { PROFILES_CHANNEL } from "../../shared/profiles";
const electron = vi.hoisted(() => ({
  handler: undefined as
    | undefined
    | ((event: IpcMainInvokeEvent, input: unknown) => Promise<unknown>),
  handle: vi.fn(),
  removeHandler: vi.fn(),
  showMessageBox: vi.fn(),
}));
vi.mock("electron", () => ({
  ipcMain: {
    handle: (channel: string, handler: typeof electron.handler) => {
      electron.handle(channel);
      electron.handler = handler;
    },
    removeHandler: electron.removeHandler,
  },
  dialog: { showMessageBox: electron.showMessageBox },
}));
import { registerProfilesIpc } from "./profiles";
function fixture() {
  const frame = { url: APP_URL };
  const contents = { mainFrame: frame };
  const window = {
    isDestroyed: () => false,
    webContents: contents,
  } as unknown as BrowserWindow;
  const event = {
    sender: contents,
    senderFrame: frame,
  } as unknown as IpcMainInvokeEvent;
  const service = {
    list: vi.fn().mockResolvedValue({ revision: "absent", profiles: [] }),
    save: vi.fn().mockResolvedValue({}),
    remove: vi.fn(),
    protection: {
      status: vi
        .fn()
        .mockResolvedValue({ persistence: "disabled", reason: "unverified" }),
    },
  };
  const dispose = registerProfilesIpc(
    () => window,
    APP_URL,
    service as unknown as ProfileService,
  );
  return { window, event, service, dispose, frame };
}
beforeEach(() => vi.clearAllMocks());
describe("profile IPC authority", () => {
  it("denies foreign windows, frames, changed URLs, extra fields and huge input before any storage action", async () => {
    const { event, service, dispose, frame } = fixture();
    for (const other of [
      { ...event, sender: {} },
      { ...event, senderFrame: null },
      { ...event, senderFrame: { url: APP_URL } },
    ]) {
      expect(
        await electron.handler!(other as IpcMainInvokeEvent, {
          command: "listProfiles",
        }),
      ).toMatchObject({ ok: false, error: { code: "FORBIDDEN" } });
    }
    frame.url = APP_URL + "#changed";
    expect(
      await electron.handler!(event, { command: "listProfiles" }),
    ).toMatchObject({ ok: false, error: { code: "FORBIDDEN" } });
    frame.url = APP_URL;
    for (const request of [
      { command: "listProfiles", path: "/private" },
      { command: "saveProfile", input: "x".repeat(2 * 1024 * 1024 + 1) },
      { command: "removeProfile", input: { confirmed: true } },
      { command: "getSecret", id: "x" },
    ])
      expect(await electron.handler!(event, request)).toMatchObject({
        ok: false,
        error: { code: "VALIDATION" },
      });
    expect(service.list).not.toHaveBeenCalled();
    expect(service.save).not.toHaveBeenCalled();
    expect(service.remove).not.toHaveBeenCalled();
    dispose();
  });
  it("sanitizes raw failures and serves only summaries/status through the fixed channel", async () => {
    const { event, service, dispose } = fixture();
    expect(
      await electron.handler!(event, { command: "getSecretProtectionStatus" }),
    ).toMatchObject({ ok: true, value: { persistence: "disabled" } });
    service.list.mockRejectedValue(
      new Error("PASSWORD-SENTINEL /private stack"),
    );
    const result = await electron.handler!(event, { command: "listProfiles" });
    expect(result).toMatchObject({ ok: false, error: { code: "INTERNAL" } });
    expect(JSON.stringify(result)).not.toMatch(/SENTINEL|private|stack/);
    dispose();
    expect(electron.handle).toHaveBeenCalledWith(PROFILES_CHANNEL);
    expect(electron.removeHandler).toHaveBeenCalledWith(PROFILES_CHANNEL);
  });
  it("shows a main-owned contextual native confirmation with safe defaults and rechecks sender after it", async () => {
    const { event, window, service, dispose, frame } = fixture();
    const profile = {
      name: "Synthetic",
      environment: "production",
      httpsUrl: "https://localhost:15671",
      amqpsUrl: "amqps://localhost:5671",
    };
    service.remove.mockImplementation(async (_input, confirm) => ({
      confirmed: await confirm(profile),
    }));
    electron.showMessageBox.mockResolvedValue({ response: 0 });
    const request = {
      command: "removeProfile",
      input: { id: "01234567-89ab-4def-89ab-0123456789ab", revision: "absent" },
    };
    expect(await electron.handler!(event, request)).toMatchObject({
      ok: true,
      value: { confirmed: false },
    });
    expect(electron.showMessageBox).toHaveBeenCalledWith(
      window,
      expect.objectContaining({
        defaultId: 0,
        cancelId: 0,
        detail: expect.stringContaining("Nenhum recurso ou mensagem"),
      }),
    );
    electron.showMessageBox.mockImplementation(async () => {
      frame.url = APP_URL + "#changed";
      return { response: 1 };
    });
    expect(await electron.handler!(event, request)).toMatchObject({
      ok: false,
      error: { code: "FORBIDDEN" },
    });
    dispose();
  });
});
