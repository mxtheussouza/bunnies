import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Button from "./Button";
import IconButton from "./IconButton";
import EmptyState from "./EmptyState";
import StatusMessage from "./StatusMessage";

afterEach(cleanup);
describe("shared UI behaviors", () => {
  it("blocks duplicate activation while loading and keeps its operation name", async () => {
    const action = vi.fn();
    const view = render(
      <Button loading onClick={action}>
        Atualizar
      </Button>,
    );
    const button = screen.getByRole("button", {
      name: "Atualizar",
    }) as HTMLButtonElement;
    expect(button.disabled).toBe(true);
    expect(button.getAttribute("aria-busy")).toBe("true");
    await userEvent.setup().click(button);
    expect(action).not.toHaveBeenCalled();
    view.rerender(<Button onClick={action}>Atualizar</Button>);
    await userEvent.setup().click(button);
    expect(action).toHaveBeenCalledOnce();
  });
  it("names icon-only actions and supports keyboard activation", async () => {
    const action = vi.fn();
    render(<IconButton icon="close" label="Fechar painel" onClick={action} />);
    const user = userEvent.setup();
    await user.tab();
    await user.keyboard("{Enter}");
    expect(action).toHaveBeenCalledOnce();
    expect(screen.getByRole("button", { name: "Fechar painel" })).toBeTruthy();
  });
  it("distinguishes empty, partial and blocking feedback without broker fixtures in the app", () => {
    render(
      <>
        <EmptyState title="Nenhum resultado">Reveja os filtros.</EmptyState>
        <StatusMessage tone="warning" title="Leitura parcial">
          Snapshot antigo.
        </StatusMessage>
        <StatusMessage tone="danger" title="Operação indisponível">
          Tente novamente.
        </StatusMessage>
      </>,
    );
    expect(
      screen.getByRole("heading", { name: "Nenhum resultado" }),
    ).toBeTruthy();
    expect(screen.getByRole("status").textContent).toContain("Snapshot antigo");
    expect(screen.getByRole("alert").textContent).toContain(
      "Operação indisponível",
    );
  });
});
