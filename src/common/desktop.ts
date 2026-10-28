import type { DesktopResult } from "../shared/desktop";

export const DESKTOP_ERROR_EVENT = "bunnies:desktop-error";
export function runDesktop(action: () => Promise<DesktopResult>) {
  void action()
    .then(result => {
      if (!result.ok) window.dispatchEvent(new Event(DESKTOP_ERROR_EVENT));
    })
    .catch(() => window.dispatchEvent(new Event(DESKTOP_ERROR_EVENT)));
}
