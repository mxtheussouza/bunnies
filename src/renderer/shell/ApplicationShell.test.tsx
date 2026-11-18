import { emptySession } from "../../shared/session";
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Providers from "@src/providers";
import App from "../App";

const getInfo = vi.fn();
beforeEach(() => {
  localStorage.clear();
  getInfo.mockResolvedValue({ ok: true, value: { version: "1.2.3" } });
  vi.stubGlobal("bunnies", {
    getSessionState: async () => ({ ok: true, value: emptySession() }),
    onSessionState: () => () => undefined,
    getInfo,
    listProfiles: vi.fn().mockResolvedValue({
      ok: true,
      value: { revision: "absent", profiles: [] },
    }),
    getSecretProtectionStatus: vi.fn().mockResolvedValue({
      ok: true,
      value: { persistence: "disabled", reason: "unverified" },
    }),
    openLink: vi.fn().mockResolvedValue({ ok: true }),
  });
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
function renderApp() {
  return render(
    <Providers>
      <App />
    </Providers>,
  );
}

describe("offline application shell", () => {
  it.each(["{Control>}5{/Control}", "{Meta>}5{/Meta}"])(
    "handles the available destination shortcut %s outside editing",
    async shortcut => {
      renderApp();
      const user = userEvent.setup();
      const url = location.href;
      await user.click(screen.getByRole("button", { name: "Sobre o Bunnies" }));
      const select = screen.getByRole("combobox", { name: "Tema" });
      select.focus();
      await user.keyboard(shortcut);
      expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(
        "Sobre o Bunnies",
      );
      screen.getByRole("heading", { level: 1 }).focus();
      await user.keyboard(shortcut);
      expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(
        "Conexões",
      );
      expect(location.href).toBe(url);
    },
  );
  it("starts honestly without profiles or broker data, with only local profile IPC", async () => {
    renderApp();
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(
      "Conexões",
    );
    expect(
      await screen.findByRole("heading", {
        name: "Nenhuma conexão configurada",
      }),
    ).toBeTruthy();
    expect(screen.getByText("HTTPS sem sessão")).toBeTruthy();
    expect(screen.getByText("AMQPS sem sessão")).toBeTruthy();
    for (const name of ["Visão geral", "Filas", "Exchanges", "Publicar"])
      expect(
        screen.getByRole("button", { name }).getAttribute("aria-disabled"),
      ).toBe("true");
    expect(getInfo).not.toHaveBeenCalled();
    expect(screen.queryByRole("table")).toBeNull();
    expect(screen.queryByRole("button", { name: "Testar conexão" })).toBeNull();
  });
  it("keeps unavailable destinations in context without changing the URL", async () => {
    renderApp();
    const url = location.href;
    const user = userEvent.setup();
    const queues = screen.getByRole("button", { name: "Filas" });
    queues.focus();
    await user.keyboard("{Enter}");
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(
      "Conexões",
    );
    expect(queues.getAttribute("aria-describedby")).toBe("sidebar-unavailable");
    expect(
      document.getElementById("sidebar-unavailable")?.textContent,
    ).toContain(
      "Gerenciamento de filas, exchanges e mensagens ainda indisponível.",
    );
    expect(location.href).toBe(url);
  });
  it("navigates locally to About, presents real metadata and returns focus to the heading", async () => {
    renderApp();
    const user = userEvent.setup();
    const url = location.href;
    await user.click(screen.getByRole("button", { name: "Sobre o Bunnies" }));
    expect((await screen.findByTestId("app-version")).textContent).toBe(
      "1.2.3",
    );
    expect(document.activeElement).toBe(
      screen.getByRole("heading", { level: 1 }),
    );
    await user.click(screen.getByRole("button", { name: "Conhecer o autor" }));
    expect(window.bunnies.openLink).toHaveBeenCalledWith("author");
    await user.click(screen.getByRole("button", { name: "Conexões" }));
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(
      "Conexões",
    );
    expect(location.href).toBe(url);
  });
  it("skips navigation by keyboard without changing the trusted URL", async () => {
    renderApp();
    const url = location.href;
    const user = userEvent.setup();
    await user.tab();
    await user.keyboard("{Enter}");
    expect(document.activeElement).toBe(screen.getByRole("main"));
    expect(location.href).toBe(url);
  });
  it("opens Help as a local destination, focuses its heading and keeps broker pages unavailable", async () => {
    renderApp();
    const user = userEvent.setup();
    const url = location.href;
    const help = screen.getByRole("button", { name: "Ajuda" });
    help.focus();
    await user.keyboard("{Enter}");
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("Ajuda");
    expect(document.activeElement).toBe(
      screen.getByRole("heading", { level: 1 }),
    );
    expect(help.getAttribute("aria-current")).toBe("page");
    expect(
      screen.getByRole("article", { name: "Guia do usuário — Bunnies" }),
    ).toBeTruthy();
    expect(
      screen
        .getByRole("button", { name: "Filas" })
        .getAttribute("aria-disabled"),
    ).toBe("true");
    expect(getInfo).not.toHaveBeenCalled();
    await user.keyboard("{Control>}5{/Control}");
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(
      "Conexões",
    );
    expect(location.href).toBe(url);
  });
});
