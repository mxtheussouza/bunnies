// @vitest-environment node
import type { Session } from "electron";
import { describe, expect, it, vi } from "vitest";
import { restrictSession } from "./session";
import { APP_URL } from "./desktopPolicy";

function fixture() {
  return {
    setPermissionCheckHandler: vi.fn(),
    setPermissionRequestHandler: vi.fn(),
    setDevicePermissionHandler: vi.fn(),
    on: vi.fn(),
    webRequest: { onBeforeRequest: vi.fn() },
  };
}
describe("desktop session policy", () => {
  it("denies permission checks, requests, device access and downloads", () => {
    const session = fixture();
    restrictSession(session as unknown as Session, true, APP_URL);
    expect(session.setPermissionCheckHandler.mock.calls[0][0]()).toBe(false);
    expect(session.setDevicePermissionHandler.mock.calls[0][0]()).toBe(false);
    const permission = vi.fn();
    session.setPermissionRequestHandler.mock.calls[0][0](
      null,
      "camera",
      permission,
    );
    expect(permission).toHaveBeenCalledWith(false);
    const event = { preventDefault: vi.fn() };
    session.on.mock.calls[0][1](event);
    expect(event.preventDefault).toHaveBeenCalled();
  });
  it.each([true, false])(
    "restricts network/file requests (packaged=%s)",
    packaged => {
      const session = fixture();
      restrictSession(
        session as unknown as Session,
        packaged,
        "http://localhost:3000/app_window/index.html",
      );
      const handler = session.webRequest.onBeforeRequest.mock.calls[0][1];
      for (const url of [
        "https://external.test/",
        "file:///private/sentinel",
        "http://localhost:3001/",
        "ws://localhost.evil:3000/",
      ]) {
        const callback = vi.fn();
        handler({ url }, callback);
        expect(callback).toHaveBeenCalledWith({ cancel: true });
      }
      const callback = vi.fn();
      handler({ url: "ws://localhost:3000/ws" }, callback);
      expect(callback).toHaveBeenCalledWith({ cancel: packaged });
    },
  );
});
