import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ThemeModeProvider, {
  THEME_KEY,
  ThemeModeContext,
  type ThemePreference,
} from "./ThemeMode";

let dark = false;
const listeners = new Set<() => void>();
function changeSystem(value: boolean) {
  dark = value;
  act(() => {
    listeners.forEach(listener => listener());
  });
}
function ThemeControl() {
  const { preference, resolvedTheme, setPreference } =
    React.useContext(ThemeModeContext);
  return (
    <>
      <label htmlFor="theme-test">Tema</label>
      <select
        id="theme-test"
        value={preference}
        onChange={event => setPreference(event.target.value as ThemePreference)}
      >
        <option value="system">Sistema</option>
        <option value="light">Claro</option>
        <option value="dark">Escuro</option>
      </select>
      <output>{resolvedTheme}</output>
    </>
  );
}
function renderTheme() {
  return render(
    <React.StrictMode>
      <ThemeModeProvider>
        <ThemeControl />
      </ThemeModeProvider>
    </React.StrictMode>,
  );
}
beforeEach(() => {
  localStorage.clear();
  listeners.clear();
  dark = false;
  document.documentElement.removeAttribute("data-theme");
  vi.stubGlobal(
    "matchMedia",
    vi.fn(() => ({
      get matches() {
        return dark;
      },
      addEventListener: (_name: string, listener: () => void) =>
        listeners.add(listener),
      removeEventListener: (_name: string, listener: () => void) =>
        listeners.delete(listener),
    })),
  );
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("theme preference", () => {
  it("defaults to System and reacts to the OS without changing the preference", () => {
    renderTheme();
    expect((screen.getByRole("combobox") as HTMLSelectElement).value).toBe(
      "system",
    );
    expect(document.documentElement.dataset.theme).toBe("light");
    changeSystem(true);
    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(localStorage.getItem(THEME_KEY)).toBe("system");
  });
  it("resolves the initial dark system theme", () => {
    dark = true;
    renderTheme();
    expect(document.documentElement.dataset.theme).toBe("dark");
  });
  it.each([
    ["0", "light"],
    ["1", "dark"],
  ])(
    "migrates legacy %s without losing the explicit choice",
    (legacy, expected) => {
      localStorage.setItem("dark-mode", legacy);
      renderTheme();
      expect(document.documentElement.dataset.theme).toBe(expected);
      expect(localStorage.getItem(THEME_KEY)).toBe(expected);
      expect(listeners.size).toBe(0);
    },
  );
  it("gives a valid new preference priority over the legacy value", () => {
    localStorage.setItem(THEME_KEY, "system");
    localStorage.setItem("dark-mode", "1");
    renderTheme();
    expect(document.documentElement.dataset.theme).toBe("light");
    expect(localStorage.getItem(THEME_KEY)).toBe("system");
  });
  it("falls back through invalid values without accepting arbitrary data", () => {
    localStorage.setItem(THEME_KEY, "<script>sentinel</script>");
    localStorage.setItem("dark-mode", "bad");
    renderTheme();
    expect(localStorage.getItem(THEME_KEY)).toBe("system");
    expect(document.documentElement.dataset.theme).toBe("light");
  });
  it("uses a valid legacy preference if the new value is invalid", () => {
    localStorage.setItem(THEME_KEY, "unknown");
    localStorage.setItem("dark-mode", "0");
    renderTheme();
    expect(localStorage.getItem(THEME_KEY)).toBe("light");
  });
  it("persists a manual choice across remount and ignores OS changes in manual mode", async () => {
    const user = userEvent.setup();
    const view = renderTheme();
    await user.tab();
    await user.selectOptions(screen.getByRole("combobox"), "dark");
    changeSystem(false);
    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(listeners.size).toBe(0);
    view.unmount();
    renderTheme();
    expect((screen.getByRole("combobox") as HTMLSelectElement).value).toBe(
      "dark",
    );
    await user.selectOptions(screen.getByRole("combobox"), "system");
    expect(document.documentElement.dataset.theme).toBe("light");
    expect(listeners.size).toBe(1);
  });
  it("removes OS listeners on unmount, including StrictMode remounts", () => {
    const view = renderTheme();
    expect(listeners.size).toBe(1);
    view.unmount();
    expect(listeners.size).toBe(0);
  });
  it("keeps manual themes usable in memory when storage is unavailable", async () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new DOMException("Unavailable", "SecurityError");
    });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("Unavailable", "SecurityError");
    });
    renderTheme();
    await userEvent.setup().selectOptions(screen.getByRole("combobox"), "dark");
    expect(document.documentElement.dataset.theme).toBe("dark");
  });
});
