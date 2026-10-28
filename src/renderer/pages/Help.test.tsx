import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Help from "./Help";
const scroll = vi.fn();
const originalScroll = Object.getOwnPropertyDescriptor(
  Element.prototype,
  "scrollIntoView",
);
beforeEach(() =>
  Object.defineProperty(Element.prototype, "scrollIntoView", {
    configurable: true,
    value: scroll,
  }),
);
afterEach(() => {
  cleanup();
  if (originalScroll)
    Object.defineProperty(Element.prototype, "scrollIntoView", originalScroll);
  else Reflect.deleteProperty(Element.prototype, "scrollIntoView");
});
describe("offline user help", () => {
  it("explains every current profile field, password lifecycle and unavailable broker operations", () => {
    render(<Help />);
    const creation = screen.getByRole("region", {
      name: "Criar um perfil local",
    });
    for (const field of [
      "Nome do perfil",
      "Ambiente",
      "Endpoint HTTPS",
      "Endpoint AMQPS",
      "Usuário",
      "Senha",
      "Armazenamento da senha",
      "Nova senha",
    ])
      expect(
        within(creation).getByText(field, { selector: "dt", exact: true }),
      ).toBeTruthy();
    expect(creation.textContent).toContain("https://broker.exemplo:15671");
    expect(creation.textContent).toContain("amqps://broker.exemplo:5671");
    expect(creation.textContent).toContain("50 perfis e 2 MiB");
    expect(
      screen.getByRole("region", { name: "Senhas, privacidade e encerramento" })
        .textContent,
    ).toContain("fechar a janela pode manter o aplicativo em execução");
    expect(
      screen.getByRole("region", {
        name: "Funções de broker ainda indisponíveis",
      }).textContent,
    ).toContain("não instruções de uso de funções já entregues");
    expect(
      screen.getByRole("region", { name: "Resolver problemas" }).textContent,
    ).toContain("não apague arquivos de bloqueio por tentativa");
    expect(screen.queryByRole("textbox")).toBeNull();
    expect(document.querySelectorAll("a, iframe, script, form")).toHaveLength(
      0,
    );
  });
  it("supports keyboard index navigation and returns focus without changing the trusted document URL", async () => {
    render(<Help />);
    const user = userEvent.setup();
    const url = location.href;
    const index = screen.getByRole("navigation", { name: "Tópicos da ajuda" });
    const topic = within(index).getByRole("button", {
      name: "Editar um perfil e descartar alterações",
    });
    topic.focus();
    await user.keyboard("{Enter}");
    const heading = screen.getByRole("heading", {
      name: "Editar um perfil e descartar alterações",
    });
    expect(document.activeElement).toBe(heading);
    expect(scroll).toHaveBeenCalled();
    const region = screen.getByRole("region", {
      name: "Editar um perfil e descartar alterações",
    });
    const back = within(region).getByRole("button", {
      name: "Voltar ao índice",
    });
    back.focus();
    await user.keyboard("{Enter}");
    expect(document.activeElement).toBe(
      within(index).getAllByRole("button")[0],
    );
    expect(location.href).toBe(url);
  });
});
