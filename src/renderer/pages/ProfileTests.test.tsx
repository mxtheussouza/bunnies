import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ProfileTests from "./ProfileTests";
const https = vi.fn(),
  amqp = vi.fn(),
  cancel = vi.fn();
beforeEach(() => {
  vi.stubGlobal("bunnies", {
    testProfileHttps: https,
    testProfileAmqps: amqp,
    cancelProfileHttpsTest: cancel,
    cancelProfileAmqpsTest: cancel,
  });
  cancel.mockResolvedValue({ ok: true });
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});
describe("explicit AMQPS UI and shared concurrency", () => {
  it("does not connect on mount and disables both probes without a password", () => {
    render(
      <ProfileTests profileId="id" revision="revision" hasPassword={false} />,
    );
    expect(amqp).not.toHaveBeenCalled();
    expect(https).not.toHaveBeenCalled();
    for (const name of ["Testar HTTPS", "Testar AMQPS"])
      expect(
        (screen.getByRole("button", { name }) as HTMLButtonElement).disabled,
      ).toBe(true);
  });
  it("dates the AMQPS result and never activates a session", async () => {
    amqp.mockImplementation(async input => ({
      ok: true,
      value: {
        ...input,
        vhost: "/",
        checkedAt: "2026-10-29T12:00:00Z",
        durationMs: 8,
        outcome: "authenticated",
      },
    }));
    render(<ProfileTests profileId="id" revision="revision" hasPassword />);
    await userEvent
      .setup()
      .click(screen.getByRole("button", { name: "Testar AMQPS" }));
    await screen.findByText("Autenticação AMQPS e vhost verificados");
    expect(amqp).toHaveBeenCalledOnce();
    expect(https).not.toHaveBeenCalled();
    expect(document.body.textContent).toContain("Conexão encerrada");
    expect(document.body.textContent).toContain("Nenhuma sessão foi ativada");
    expect(document.querySelector("time")?.getAttribute("datetime")).toBe(
      "2026-10-29T12:00:00Z",
    );
  });
  it("blocks HTTPS while AMQPS runs, cancels and sanitizes broker text", async () => {
    let finish!: (value: unknown) => void;
    amqp.mockImplementation(
      () =>
        new Promise(resolve => {
          finish = resolve;
        }),
    );
    render(<ProfileTests profileId="id" revision="revision" hasPassword />);
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Testar AMQPS" }));
    expect(
      (
        screen.getByRole("button", {
          name: "Testar HTTPS",
        }) as HTMLButtonElement
      ).disabled,
    ).toBe(true);
    await user.click(
      screen.getByRole("button", { name: "Cancelar teste AMQPS" }),
    );
    expect(cancel).toHaveBeenCalledWith(amqp.mock.calls[0][0].operationId);
    finish({
      ok: false,
      error: { code: "AMQP_REFUSED", message: "BROKER-PRIVATE-DETAIL" },
    });
    await waitFor(() =>
      expect(screen.getByRole("alert").textContent).toContain(
        "O broker recusou",
      ),
    );
    expect(document.body.textContent).not.toContain("BROKER-PRIVATE-DETAIL");
    expect(
      (
        screen.getByRole("button", {
          name: "Testar HTTPS",
        }) as HTMLButtonElement
      ).disabled,
    ).toBe(false);
  });
  it("cancels AMQPS on navigation and ignores delayed success", async () => {
    let finish!: (value: unknown) => void;
    amqp.mockImplementation(
      () =>
        new Promise(resolve => {
          finish = resolve;
        }),
    );
    const view = render(
      <ProfileTests profileId="id" revision="revision" hasPassword />,
    );
    await userEvent
      .setup()
      .click(screen.getByRole("button", { name: "Testar AMQPS" }));
    view.unmount();
    expect(cancel).toHaveBeenCalledWith(amqp.mock.calls[0][0].operationId);
    finish({ ok: true, value: { checkedAt: "2026-10-29T12:00:00Z" } });
    expect(document.querySelector("time")).toBeNull();
  });
});
