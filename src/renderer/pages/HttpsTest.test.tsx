import React from "react";
import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { render, cleanup, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import HttpsTest from "./HttpsTest";
const test = vi.fn(),
  cancel = vi.fn();
beforeEach(() => {
  vi.stubGlobal("bunnies", {
    testProfileHttps: test,
    cancelProfileHttpsTest: cancel,
  });
  cancel.mockResolvedValue({ ok: true });
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
describe("explicit HTTPS test UI", () => {
  it("never starts on mount and explains why a password is required", () => {
    render(
      <HttpsTest profileId="id" revision="revision" hasPassword={false} />,
    );
    expect(test).not.toHaveBeenCalled();
    expect(
      (
        screen.getByRole("button", {
          name: "Testar HTTPS",
        }) as HTMLButtonElement
      ).disabled,
    ).toBe(true);
    expect(screen.getByText(/Informe a senha nesta execução/)).toBeTruthy();
  });
  it("runs only after click, returns a dated result and does not claim an active session", async () => {
    test.mockImplementation(async input => ({
      ok: true,
      value: {
        ...input,
        outcome: "authenticated",
        checkedAt: "2026-10-28T12:00:00Z",
        durationMs: 7,
      },
    }));
    render(<HttpsTest profileId="id" revision="revision" hasPassword />);
    await userEvent
      .setup()
      .click(screen.getByRole("button", { name: "Testar HTTPS" }));
    await screen.findByText("Autenticação HTTPS verificada");
    expect(test).toHaveBeenCalledOnce();
    expect(test.mock.calls[0][0]).toMatchObject({
      profileId: "id",
      revision: "revision",
    });
    expect(document.body.textContent).toContain("Nenhuma sessão foi ativada");
    expect(document.querySelector("time")?.getAttribute("datetime")).toBe(
      "2026-10-28T12:00:00Z",
    );
  });
  it("supports cancellation by operation and discards pending work when leaving the page", async () => {
    let finish!: (value: unknown) => void;
    test.mockImplementation(
      () =>
        new Promise(resolve => {
          finish = resolve;
        }),
    );
    const view = render(
      <HttpsTest profileId="id" revision="revision" hasPassword />,
    );
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Testar HTTPS" }));
    await user.click(
      screen.getByRole("button", { name: "Cancelar teste HTTPS" }),
    );
    expect(cancel).toHaveBeenCalledWith(test.mock.calls[0][0].operationId);
    finish({
      ok: false,
      error: { code: "TEST_CANCELLED", message: "raw secret" },
    });
    await waitFor(() =>
      expect(screen.getByRole("alert").textContent).toContain(
        "Teste HTTPS cancelado",
      ),
    );
    expect(document.body.textContent).not.toContain("raw secret");
    await user.click(screen.getByRole("button", { name: "Testar HTTPS" }));
    view.unmount();
    expect(cancel).toHaveBeenLastCalledWith(test.mock.calls[1][0].operationId);
  });
});
