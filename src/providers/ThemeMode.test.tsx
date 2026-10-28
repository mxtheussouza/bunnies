import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ThemeModeProvider, { ThemeModeContext } from "./ThemeMode";
import Button from "../renderer/components/Button";

function ThemeControl() {
  const { darkTheme, toggleTheme } = React.useContext(ThemeModeContext);
  return (
    <Button onClick={toggleTheme} aria-pressed={darkTheme}>
      Toggle theme
    </Button>
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
  document.body.className = "";
});
afterEach(cleanup);

describe("theme preference", () => {
  it("defaults to dark and applies it to the desktop document", () => {
    renderTheme();
    expect(document.body.classList.contains("dark-mode")).toBe(true);
    expect(screen.getByRole("button").getAttribute("aria-pressed")).toBe(
      "true",
    );
  });

  it("restores light without overwriting the preference during StrictMode mount", () => {
    localStorage.setItem("dark-mode", "0");
    renderTheme();
    expect(document.body.classList.contains("dark-mode")).toBe(false);
    expect(localStorage.getItem("dark-mode")).toBe("0");
  });

  it("toggles with the keyboard and restores the new choice after remount", async () => {
    const user = userEvent.setup();
    const view = renderTheme();
    await user.tab();
    await user.keyboard("{Enter}");
    expect(document.body.classList.contains("dark-mode")).toBe(false);
    expect(localStorage.getItem("dark-mode")).toBe("0");
    view.unmount();
    renderTheme();
    expect(screen.getByRole("button").getAttribute("aria-pressed")).toBe(
      "false",
    );
  });

  it("keeps the theme usable when local storage is unavailable", async () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new DOMException("Unavailable", "SecurityError");
    });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("Unavailable", "SecurityError");
    });
    renderTheme();
    await userEvent.setup().click(screen.getByRole("button"));
    expect(document.body.classList.contains("dark-mode")).toBe(false);
  });
});
