import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { emptySession } from "../../shared/session";
import ManagementInfo from "./ManagementInfo";
const mock = vi.hoisted(() => ({
  state: {} as ReturnType<typeof emptySession>,
}));
vi.mock("../shell/SessionProvider", () => ({ useSession: () => mock }));
const broker = vi.fn(),
  vhosts = vi.fn(),
  cancel = vi.fn();
beforeEach(() => {
  mock.state = {
    ...emptySession(),
    sessionId: "00000000-0000-4000-8000-000000000001",
    generation: 1,
    desired: true,
    profile: {
      id: "id",
      name: "Produção isolada",
      environment: "production",
      vhost: "/",
    },
    https: { phase: "available", checking: false, retries: 0 },
  };
  cancel.mockResolvedValue({ ok: true });
  vi.stubGlobal("bunnies", {
    getBrokerInfo: broker,
    listSessionVhosts: vhosts,
    cancelManagementRead: cancel,
  });
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});
describe("explicit administrative UI", () => {
  it("never reads on mount; only renders projected safe text and dates after action", async () => {
    broker.mockImplementation(async input => ({
      ok: true,
      value: {
        ...input,
        source: "https-management",
        kind: "broker",
        matrix: "reference",
        rabbitmqVersion: "4.4.0",
        checkedAt: "2026-10-30T12:00:00.000Z",
      },
    }));
    render(<ManagementInfo />);
    expect(broker).not.toHaveBeenCalled();
    expect(vhosts).not.toHaveBeenCalled();
    const button = screen.getByRole("button", {
      name: "Consultar informações",
    });
    await userEvent.setup().click(button);
    await screen.findByText("4.4.0");
    expect(document.querySelector("time")?.dateTime).toBe(
      "2026-10-30T12:00:00.000Z",
    );
    await waitFor(() => expect(document.activeElement).toBe(button));
  });
  it("shows complete-list visibility without AMQP authorization or a selector", async () => {
    vhosts.mockImplementation(async input => ({
      ok: true,
      value: {
        ...input,
        kind: "vhosts",
        names: ["<script>", ".."],
        currentVhost: "/",
        currentVisible: false,
        checkedAt: "2026-10-30T12:00:00.000Z",
      },
    }));
    render(<ManagementInfo />);
    await userEvent
      .setup()
      .click(screen.getByRole("button", { name: "Listar vhosts" }));
    await screen.findByText("<script>");
    expect(document.querySelector("script, select")).toBeNull();
    expect(document.body.textContent).toContain(
      "não listado no snapshot HTTPS",
    );
    expect(document.body.textContent).toContain("Não há paginação");
  });
  it("marks last success stale after sanitized failure with a separate failure date", async () => {
    broker
      .mockImplementationOnce(async input => ({
        ok: true,
        value: {
          ...input,
          kind: "broker",
          matrix: "unknown",
          checkedAt: "2026-10-30T12:00:00.000Z",
        },
      }))
      .mockResolvedValueOnce({
        ok: false,
        error: { code: "DENIED", message: "PRIVATE-SENTINEL" },
      });
    render(<ManagementInfo />);
    const user = userEvent.setup(),
      button = screen.getByRole("button", { name: "Consultar informações" });
    await user.click(button);
    await screen.findByText(/Versão desconhecida/);
    await user.click(button);
    await screen.findByText(/consulta foi negada/);
    expect(document.body.textContent).toContain("Desatualizado");
    expect(document.body.textContent).not.toContain("PRIVATE-SENTINEL");
    expect(document.querySelector("time")?.dateTime).toBe(
      "2026-10-30T12:00:00.000Z",
    );
  });
  it("cancels on navigation/background and discards late result", async () => {
    let finish!: (v: unknown) => void;
    broker.mockImplementation(
      () =>
        new Promise(resolve => {
          finish = resolve;
        }),
    );
    const view = render(<ManagementInfo />);
    await userEvent
      .setup()
      .click(screen.getByRole("button", { name: "Consultar informações" }));
    expect(
      (
        screen.getByRole("button", {
          name: "Listar vhosts",
        }) as HTMLButtonElement
      ).disabled,
    ).toBe(true);
    mock.state = { ...mock.state, paused: true };
    view.rerender(<ManagementInfo />);
    expect(cancel).toHaveBeenCalledOnce();
    finish({ ok: false, error: { code: "INTERNAL" } });
    await screen.findByText("Consulta administrativa indisponível");
    view.unmount();
  });
});
