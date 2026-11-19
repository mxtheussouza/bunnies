import React from "react";
import { act, cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { emptySession } from "../../shared/session";
import Queues from "./Queues";

const mock = vi.hoisted(() => ({
  state: {} as ReturnType<typeof emptySession>,
}));
vi.mock("../shell/SessionProvider", () => ({ useSession: () => mock }));
const list = vi.fn(),
  detail = vi.fn(),
  cancel = vi.fn();

const result = (vhost = "/") => ({
  ok: true,
  value: {
    vhost,
    checkedAt: "2026-11-19T12:00:00.000Z",
    page: 1,
    pageCount: 1,
    totalCount: 2,
    filteredCount: 2,
    items: [
      { name: "<script>", type: "classic", ready: 0 },
      { name: ".", type: "classic" },
    ],
  },
});

beforeEach(() => {
  mock.state = {
    ...emptySession(),
    sessionId: "00000000-0000-4000-8000-000000000001",
    generation: 1,
    desired: true,
    profile: {
      id: "fixture",
      name: "Isolado",
      environment: "production",
      vhost: "/",
    },
    https: { phase: "available", checking: false, retries: 0 },
    amqps: { phase: "blocked", checking: false, retries: 0 },
  };
  list.mockResolvedValue(result());
  cancel.mockResolvedValue({ ok: true });
  vi.stubGlobal("bunnies", {
    listSessionQueues: list,
    getSessionQueue: detail,
    cancelManagementRead: cancel,
  });
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.resetAllMocks();
});

it("uses a literal explicit search and filters only the current page", async () => {
  const user = userEvent.setup();
  render(<Queues />);
  expect(list).not.toHaveBeenCalled();
  const input = screen.getByRole("textbox", { name: "Buscar trecho do nome" });
  await user.click(input);
  await user.paste(" [x] %2F ");
  expect(list).not.toHaveBeenCalled();
  await user.keyboard("{Enter}");
  const row = await screen.findByRole("button", {
    name: "Ver detalhes da fila <script>",
  });
  expect(row.textContent).toBe("<script>");
  expect(document.querySelector("script")).toBeNull();
  expect(list).toHaveBeenCalledWith(
    expect.objectContaining({ page: 1, search: " [x] %2F " }),
  );
  expect(screen.getByText("Detalhe indisponível para este nome.")).toBeTruthy();
  await user.selectOptions(
    screen.getByRole("combobox", { name: "Tipo (Nesta página)" }),
    "stream",
  );
  expect(
    screen.getByText("Nenhuma fila corresponde ao filtro nesta página."),
  ).toBeTruthy();
  expect(list).toHaveBeenCalledTimes(1);
});

it("cancels ineligible work, keeps same-context data stale, and discards on vhost change", async () => {
  const user = userEvent.setup();
  const { rerender } = render(<Queues />);
  const load = () => screen.getByRole("button", { name: "Carregar filas" });
  await user.click(load());
  await screen.findByRole("table");
  let finish!: (value: ReturnType<typeof result>) => void;
  list.mockImplementationOnce(
    () =>
      new Promise(resolve => {
        finish = resolve;
      }),
  );
  await user.click(load());
  const { page, ...operation } = list.mock.lastCall![0];
  expect(page).toBe(1);
  mock.state = { ...mock.state, paused: true };
  rerender(<Queues />);
  expect(cancel).toHaveBeenCalledWith(operation);
  expect(screen.getByText(/Desatualizado/)).toBeTruthy();
  await act(async () => finish(result()));
  expect(screen.getByText(/Desatualizado/)).toBeTruthy();
  mock.state = {
    ...mock.state,
    paused: false,
    generation: 2,
    profile: { ...mock.state.profile!, vhost: "detailed", savedVhost: "/" },
  };
  rerender(<Queues />);
  expect(screen.queryByRole("table")).toBeNull();
  expect(screen.queryByRole("button", { name: "Carregar filas" })).toBeNull();
  expect(screen.getByText(/reserva esse caminho/)).toBeTruthy();
  expect(list).toHaveBeenCalledTimes(2);
  expect(detail).not.toHaveBeenCalled();
});

it("focuses the detail title, projects counts, and cancels a pending detail on close", async () => {
  const user = userEvent.setup();
  const { container } = render(<Queues />);
  const modal = container.querySelector("dialog")!;
  // jsdom does not implement native dialog modality.
  modal.showModal = () => {
    modal.open = true;
  };
  modal.close = () => {
    modal.open = false;
  };
  await user.click(screen.getByRole("button", { name: "Carregar filas" }));
  const trigger = await screen.findByRole("button", {
    name: "Ver detalhes da fila <script>",
  });
  detail.mockResolvedValueOnce({
    ok: true,
    value: {
      vhost: "/",
      checkedAt: "2026-11-19T12:00:00.000Z",
      queue: {
        name: "<script>",
        total: 0,
        consumerDetails: { items: [], partial: false },
      },
    },
  });
  trigger.focus();
  await user.keyboard("{Enter}");
  const heading = screen.getByRole("heading", { name: "<script>" });
  expect(document.activeElement).toBe(heading);
  expect(screen.getByText("Nenhum consumidor retornado.")).toBeTruthy();
  expect(modal.textContent).toContain("Total0");
  expect(modal.textContent).toContain("Indisponível");
  await user.click(screen.getByRole("button", { name: "Fechar detalhe" }));
  expect(document.activeElement).toBe(trigger);
  detail.mockImplementationOnce(() => new Promise(() => undefined));
  await user.keyboard("{Enter}");
  expect(screen.getByText("Carregando detalhe…")).toBeTruthy();
  const { name, ...ref } = detail.mock.lastCall![0];
  expect(name).toBe("<script>");
  await user.click(screen.getByRole("button", { name: "Fechar detalhe" }));
  expect(cancel).toHaveBeenCalledWith(ref);
  expect(modal.open).toBe(false);
});

it("offers an explicit return to the first page after a broker range error", async () => {
  const user = userEvent.setup();
  list
    .mockResolvedValueOnce({
      ...result(),
      value: { ...result().value, pageCount: 2 },
    })
    .mockResolvedValueOnce({
      ok: false,
      error: { code: "QUEUE_PAGE" },
      requestId: "fixture-diagnostic",
    });
  render(<Queues />);
  await user.click(screen.getByRole("button", { name: "Carregar filas" }));
  await user.click(
    await screen.findByRole("button", { name: "Próxima página" }),
  );
  await screen.findByText(/Diagnóstico fixture-diagnostic/);
  expect(screen.getByText(/Desatualizado/)).toBeTruthy();
  await user.click(
    screen.getByRole("button", { name: "Voltar à primeira página" }),
  );
  expect(list.mock.calls.map(([input]) => input.page)).toEqual([1, 2, 1]);
  expect(screen.queryByText(/Desatualizado/)).toBeNull();
});
