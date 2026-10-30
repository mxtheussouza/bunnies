import React from "react";
import { render, screen, act, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import SessionProvider, { useSession } from "./SessionProvider";
import { emptySession, type SessionSnapshot } from "../../shared/session";
function Consumer() {
  const session = useSession();
  return (
    <button
      onClick={() => {
        void session.connect({
          profileId: "id",
          revision: "revision",
          operationId: "op",
        });
      }}
    >
      {session.state.sequence}
    </button>
  );
}
describe("session subscription", () => {
  it("subscribes before reading and rejects a stale reply, then unsubscribes", async () => {
    let notify!: (s: SessionSnapshot) => void;
    let finish!: (v: unknown) => void;
    const release = vi.fn();
    const onSessionState = vi.fn((fn: typeof notify) => {
      notify = fn;
      return release;
    });
    window.bunnies = {
      onSessionState,
      getSessionState: () =>
        new Promise(resolve => {
          finish = resolve;
        }),
    } as unknown as typeof window.bunnies;
    const view = render(
      <SessionProvider>
        <Consumer />
      </SessionProvider>,
    );
    act(() => notify({ ...emptySession(), sequence: 5 }));
    await act(async () => finish({ ok: true, value: emptySession() }));
    expect(screen.getByRole("button").textContent).toBe("5");
    view.unmount();
    expect(release).toHaveBeenCalledTimes(1);
    act(() => notify({ ...emptySession(), sequence: 6 }));
  });
  it("serializes commands even in one event batch and sanitizes rejections", async () => {
    let reject!: (v: Error) => void;
    const connectSession = vi.fn(
      () =>
        new Promise((_resolve, fail) => {
          reject = fail;
        }),
    );
    window.bunnies = {
      onSessionState: () => () => undefined,
      getSessionState: async () => ({ ok: true, value: emptySession() }),
      connectSession,
    } as unknown as typeof window.bunnies;
    const view = render(
      <SessionProvider>
        <Consumer />
      </SessionProvider>,
    );
    await waitFor(() => expect(screen.getByRole("button")).toBeTruthy());
    act(() => {
      screen.getByRole("button").click();
      screen.getByRole("button").click();
    });
    expect(connectSession).toHaveBeenCalledTimes(1);
    await act(async () => reject(new Error("private-path-sentinel")));
    expect(view.container.textContent).not.toContain("sentinel");
    view.unmount();
  });
});
