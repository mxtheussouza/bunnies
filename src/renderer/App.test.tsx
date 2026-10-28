import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";
import Providers from "../providers";
import { runDesktop } from "../common/desktop";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
describe("desktop error feedback", () => {
  it("displays a dismissible generic message when a desktop action fails", async () => {
    vi.stubGlobal("bunnies", {
      listProfiles: async () => ({
        ok: true,
        value: { revision: "absent", profiles: [] },
      }),
      getSecretProtectionStatus: async () => ({
        ok: true,
        value: { persistence: "disabled", reason: "unverified" },
      }),
      getInfo: async () => ({ ok: true, value: { version: "1.0.0" } }),
    });
    render(
      <Providers>
        <App />
      </Providers>,
    );
    runDesktop(async () => ({
      ok: false,
      requestId: "id",
      error: { code: "INTERNAL", message: "private sentinel" },
    }));
    const alert = await screen.findByRole("alert");
    expect(alert.textContent).toContain("Não foi possível concluir");
    expect(alert.textContent).not.toContain("sentinel");
    await userEvent
      .setup()
      .click(screen.getByRole("button", { name: "Fechar aviso" }));
    expect(screen.queryByRole("alert")).toBeNull();
  });
});
