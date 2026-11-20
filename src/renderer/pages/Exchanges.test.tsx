import React from "react";
import { act, cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, expect, it, vi } from "vitest";
import { emptySession } from "../../shared/session";
import type { ManagementInput } from "../../shared/management";
import Exchanges from "./Exchanges";

const fixture = vi.hoisted(() => ({
  state: {} as ReturnType<typeof emptySession>,
}));
vi.mock("../shell/SessionProvider", async importOriginal => ({
  ...(await importOriginal<typeof import("../shell/SessionProvider")>()),
  useSession: () => fixture,
}));
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

it("drops the old vhost response and cancels its request on context change", async () => {
  const user = userEvent.setup();
  const sessionId = "00000000-0000-4000-8000-000000000001";
  fixture.state = {
    ...emptySession(),
    sessionId,
    generation: 1,
    desired: true,
    profile: {
      id: "p",
      name: "Isolado",
      environment: "development",
      vhost: "/",
    },
    https: { phase: "available", checking: false, retries: 0 },
    amqps: { phase: "available", checking: false, retries: 0 },
  };
  let release!: (value: unknown) => void;
  const list = vi.fn<(input: ManagementInput) => Promise<unknown>>(
    () =>
      new Promise(resolve => {
        release = resolve;
      }),
  );
  const cancel = vi.fn(async () => ({}));
  vi.stubGlobal("bunnies", {
    listSessionExchanges: list,
    cancelManagementRead: cancel,
  });
  const { rerender } = render(<Exchanges />);
  expect(list).not.toHaveBeenCalled();
  await user.type(
    screen.getByRole("textbox", { name: "Buscar trecho do nome" }),
    "literal",
  );
  await user.click(screen.getByRole("button", { name: "Buscar exchanges" }));
  const input = list.mock.calls[0][0];
  expect(input).toMatchObject({ page: 1, search: "literal" });
  fixture.state = {
    ...fixture.state,
    generation: 2,
    profile: { ...fixture.state.profile!, vhost: "detailed" },
  };
  rerender(<Exchanges />);
  expect(cancel).toHaveBeenCalledWith({
    sessionId,
    generation: 1,
    operationId: input.operationId,
  });
  await act(async () =>
    release({
      ok: true,
      requestId: input.operationId,
      value: {
        ...input,
        vhost: "/",
        kind: "exchangePage",
        page: 1,
        totalCount: 1,
        filteredCount: 1,
        pageCount: 1,
        checkedAt: new Date().toISOString(),
        items: [{ name: "old-vhost-secret" }],
      },
    }),
  );
  expect(screen.queryByText("old-vhost-secret")).toBeNull();
  expect(
    screen.getByRole("button", { name: "Carregar exchanges" }),
  ).toBeTruthy();
});
