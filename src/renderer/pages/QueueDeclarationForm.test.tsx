import React from "react";
import { act, cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import QueueDeclarationForm from "./QueueDeclarationForm";

const declare = vi.fn();
const cancel = vi.fn();
const props = {
  session: { sessionId: "s", generation: 3 },
  profile: {
    id: "id",
    name: "Fixture",
    environment: "production" as const,
    vhost: "detailed",
  },
  available: true,
  onClose: vi.fn(),
  onPossibleWrite: vi.fn(),
  onVerify: vi.fn(),
};

beforeEach(() => {
  vi.stubGlobal("bunnies", {
    declareSessionQueue: declare,
    cancelQueueDeclaration: cancel,
  });
  // jsdom does not yet provide dialog operations.
  Object.defineProperties(HTMLDialogElement.prototype, {
    showModal: {
      configurable: true,
      value(this: HTMLDialogElement) {
        this.open = true;
      },
    },
    close: {
      configurable: true,
      value(this: HTMLDialogElement) {
        this.open = false;
      },
    },
  });
  cancel.mockResolvedValue({ ok: true });
});
afterEach(() => {
  cleanup();
  Reflect.deleteProperty(HTMLDialogElement.prototype, "showModal");
  Reflect.deleteProperty(HTMLDialogElement.prototype, "close");
  vi.unstubAllGlobals();
  vi.resetAllMocks();
});

it("requires explicit submission and preserves zero, empty routing values, and exact names", async () => {
  const user = userEvent.setup();
  declare.mockResolvedValue({
    ok: true,
    requestId: "test",
    value: { status: "confirmed", vhost: "detailed" },
  });
  render(<QueueDeclarationForm {...props} />);
  const submit = screen.getByRole("button", { name: "Declarar fila" });
  await user.click(submit);
  await screen.findByText("Dados inválidos");
  expect(declare).not.toHaveBeenCalled();
  await user.type(screen.getByLabelText("Nome da fila"), " Fila/á%2F ");
  await user.selectOptions(screen.getByLabelText("Tipo da fila"), "quorum");
  await user.type(screen.getByLabelText("TTL de mensagens (ms)"), "0");
  await user.click(
    screen.getByLabelText("Configurar dead-letter exchange (DLX)"),
  );
  await user.click(screen.getByLabelText("Definir routing key"));
  await user.click(submit);
  expect(declare).toHaveBeenCalledWith(
    expect.objectContaining({
      ...props.session,
      declaration: {
        name: " Fila/á%2F ",
        type: "quorum",
        arguments: {
          "x-message-ttl": 0,
          "x-dead-letter-exchange": "",
          "x-dead-letter-routing-key": "",
        },
      },
    }),
  );
  await screen.findByText("Declaração confirmada");
  expect(props.onPossibleWrite).toHaveBeenCalledOnce();
  await user.click(screen.getByRole("button", { name: "Verificar fila" }));
  expect(props.onVerify).toHaveBeenCalledWith(" Fila/á%2F ");
});

it("waits for the cancellation outcome and leaves an uncertain attempt visible", async () => {
  const user = userEvent.setup();
  let finish!: (value: unknown) => void;
  declare.mockImplementation(
    () =>
      new Promise(resolve => {
        finish = resolve;
      }),
  );
  render(<QueueDeclarationForm {...props} />);
  await user.type(screen.getByLabelText("Nome da fila"), "fila");
  await user.click(screen.getByRole("button", { name: "Declarar fila" }));
  {
    const { operationId } = declare.mock.lastCall![0];
    await user.click(screen.getByRole("button", { name: "Parar de aguardar" }));
    expect(cancel).toHaveBeenCalledWith({ ...props.session, operationId });
  }
  expect(screen.getByText("Aguardando declaração")).toBeTruthy();
  await act(async () =>
    finish({
      ok: true,
      requestId: "test",
      value: { status: "uncertain", vhost: "detailed", reason: "CANCELLED" },
    }),
  );
  expect(screen.getByText("Resultado incerto")).toBeTruthy();
  expect(declare).toHaveBeenCalledOnce();
  expect(props.onClose).not.toHaveBeenCalled();
  expect(props.onPossibleWrite).toHaveBeenCalledOnce();
});
