import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Titlebar from "@misc/window/components/Titlebar";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
describe("desktop chrome keyboard access", () => {
  it("opens a menu with Enter and returns focus with Escape", async () => {
    render(
      <Titlebar
        title="Bunnies"
        platform="linux"
        development={false}
        mode="centered-title"
      />,
    );
    const user = userEvent.setup();
    const trigger = screen.getByRole("button", { name: "Visualizar" });
    trigger.focus();
    await user.keyboard("{Enter}");
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    await user.tab();
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: /Recarregar/ }),
    );
    await user.keyboard("{Escape}");
    expect(document.activeElement).toBe(trigger);
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(screen.queryByText("Ferramentas de desenvolvimento")).toBeNull();
  });
  it("activates a native control with Space through the existing bridge", async () => {
    const minimize = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("bunnies", { minimize });
    render(
      <Titlebar
        title="Bunnies"
        platform="win32"
        development={false}
        mode="centered-title"
      />,
    );
    screen.getByRole("button", { name: "Minimizar" }).focus();
    await userEvent.setup().keyboard(" ");
    expect(minimize).toHaveBeenCalledOnce();
  });
});
