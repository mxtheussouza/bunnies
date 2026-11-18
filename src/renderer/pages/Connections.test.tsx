import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  cleanup,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ProfileSummary, SaveProfileInput } from "../../shared/profiles";
import Connections from "./Connections";
const profile: ProfileSummary = {
  id: "01234567-89ab-4def-89ab-0123456789ab",
  name: "Broker isolado",
  environment: "production",
  httpsUrl: "https://localhost:15671",
  amqpsUrl: "amqps://localhost:5671",
  username: "tester",
  secret: { saved: false, availableThisRun: true },
  trust: { mode: "default" },
};
const api = {
  listProfiles: vi.fn(),
  saveProfile: vi.fn(),
  removeProfile: vi.fn(),
  getSecretProtectionStatus: vi.fn(),
  selectProfileCa: vi.fn(),
  discardProfileCa: vi.fn().mockResolvedValue({ ok: true }),
};
const ok = (profiles: ProfileSummary[]) => ({
  ok: true,
  requestId: "test",
  value: { revision: "a".repeat(64), profiles },
});
beforeEach(() => {
  api.listProfiles.mockResolvedValue(ok([]));
  api.getSecretProtectionStatus.mockResolvedValue({
    ok: true,
    value: { persistence: "disabled", reason: "unverified" },
  });
  vi.stubGlobal("bunnies", api);
  Object.defineProperty(HTMLDialogElement.prototype, "showModal", {
    configurable: true,
    value: function (this: HTMLDialogElement) {
      this.open = true;
      this.querySelector<HTMLElement>("input")?.focus();
    },
  });
  Object.defineProperty(HTMLDialogElement.prototype, "close", {
    configurable: true,
    value: function (this: HTMLDialogElement) {
      this.open = false;
    },
  });
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  Reflect.deleteProperty(HTMLDialogElement.prototype, "showModal");
  Reflect.deleteProperty(HTMLDialogElement.prototype, "close");
});
async function fill(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText("Nome do perfil"), "Isolado");
  await user.type(
    screen.getByLabelText("Endpoint HTTPS"),
    "https://localhost:15671",
  );
  await user.type(
    screen.getByLabelText("Endpoint AMQPS"),
    "amqps://localhost:5671",
  );
  await user.type(screen.getByLabelText("Usuário"), "tester");
  await user.type(
    screen.getByLabelText("Nova senha"),
    "TRANSIENT-PASSWORD-SENTINEL",
  );
}
describe("local connection manager", () => {
  it("submits a transient password once, drops the field immediately, and never changes the session", async () => {
    let resolve!: (value: ReturnType<typeof ok>) => void;
    api.saveProfile.mockImplementation(
      () =>
        new Promise(done => {
          resolve = done;
        }),
    );
    render(<Connections />);
    const user = userEvent.setup();
    await user.click(
      await screen.findByRole("button", { name: "Novo perfil" }),
    );
    const dialog = screen.getByRole("dialog", { name: "Novo perfil" });
    expect(
      (within(dialog).getByLabelText("Nova senha") as HTMLInputElement).type,
    ).toBe("password");
    const option = within(dialog).getByRole("option", {
      name: "Protegida pelo sistema operacional",
    }) as HTMLOptionElement;
    expect(option.disabled).toBe(true);
    await fill(user);
    await user.click(screen.getByRole("button", { name: "Salvar perfil" }));
    expect(api.saveProfile).toHaveBeenCalledOnce();
    const submitted = api.saveProfile.mock.calls[0][0] as SaveProfileInput;
    expect(submitted.secret).toEqual({
      action: "replace",
      mode: "memory",
      password: "TRANSIENT-PASSWORD-SENTINEL",
    });
    expect(
      (screen.getByLabelText("Nova senha") as HTMLInputElement).value,
    ).toBe("");
    expect(
      (
        screen.getByRole("button", {
          name: "Salvar perfil",
        }) as HTMLButtonElement
      ).disabled,
    ).toBe(true);
    resolve(ok([profile]));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(
      screen.getByText(
        "Perfil salvo neste dispositivo. Nenhuma conexão iniciada.",
      ),
    ).toBeTruthy();
    expect(document.body.textContent).not.toContain(
      "TRANSIENT-PASSWORD-SENTINEL",
    );
    expect(api.removeProfile).not.toHaveBeenCalled();
  });
  it("keeps stored secrets out of editing and uses explicit keep/remove actions", async () => {
    api.listProfiles.mockResolvedValue(ok([profile]));
    api.saveProfile.mockResolvedValue(
      ok([{ ...profile, secret: { saved: false, availableThisRun: false } }]),
    );
    render(<Connections />);
    const user = userEvent.setup();
    await user.click(
      await screen.findByRole("button", { name: /Broker isolado/ }),
    );
    expect(document.activeElement).toBe(
      screen.getByRole("heading", { name: "Broker isolado" }),
    );
    await user.click(screen.getByRole("button", { name: "Editar perfil" }));
    expect(screen.queryByLabelText("Nova senha")).toBeNull();
    await user.click(screen.getByRole("button", { name: "Salvar perfil" }));
    await waitFor(() => expect(api.saveProfile).toHaveBeenCalled());
    expect(api.saveProfile.mock.calls[0][0].secret).toEqual({ action: "keep" });
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    await user.click(screen.getByRole("button", { name: "Editar perfil" }));
    await user.selectOptions(screen.getByLabelText("Senha"), "remove");
    await user.click(screen.getByRole("button", { name: "Salvar perfil" }));
    await waitFor(() =>
      expect(api.saveProfile.mock.calls[1][0].secret).toEqual({
        action: "remove",
      }),
    );
  });
  it("asks to discard edits and clears the typed secret even when continuing", async () => {
    render(<Connections />);
    const user = userEvent.setup();
    const trigger = await screen.findByRole("button", { name: "Novo perfil" });
    await user.click(trigger);
    await fill(user);
    await user.click(screen.getByRole("button", { name: "Cancelar" }));
    const continueButton = screen.getByRole("button", {
      name: "Continuar editando",
    });
    expect(document.activeElement).toBe(continueButton);
    await user.keyboard("{Enter}");
    expect(
      (screen.getByLabelText("Nova senha") as HTMLInputElement).value,
    ).toBe("");
    expect(
      (screen.getByLabelText("Nome do perfil") as HTMLInputElement).value,
    ).toBe("Isolado");
    await user.click(screen.getByRole("button", { name: "Cancelar" }));
    await user.click(
      screen.getByRole("button", { name: "Descartar alterações" }),
    );
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(document.activeElement).toBe(trigger);
    expect(api.saveProfile).not.toHaveBeenCalled();
  });
  it("delegates local removal to main and preserves the profile on native cancellation", async () => {
    api.listProfiles.mockResolvedValue(ok([profile]));
    api.removeProfile.mockResolvedValue({
      ok: false,
      error: { code: "CANCELLED", message: "raw sentinel" },
    });
    render(<Connections />);
    const user = userEvent.setup();
    await user.click(
      await screen.findByRole("button", { name: /Broker isolado/ }),
    );
    await user.click(screen.getByRole("button", { name: "Remover perfil" }));
    expect(api.removeProfile).toHaveBeenCalledWith({
      id: profile.id,
      revision: "a".repeat(64),
    });
    await screen.findByText("Remoção cancelada. O perfil foi mantido.");
    expect(screen.getByRole("button", { name: /Broker isolado/ })).toBeTruthy();
    expect(document.body.textContent).not.toContain("raw sentinel");
  });
  it("blocks editing on a corrupt file and offers an explicit reload without reset", async () => {
    api.listProfiles.mockResolvedValue({
      ok: false,
      error: { code: "CORRUPT", message: "raw sentinel" },
    });
    render(<Connections />);
    expect((await screen.findByRole("alert")).textContent).toContain(
      "O original foi preservado",
    );
    expect(
      (screen.getByRole("button", { name: "Novo perfil" }) as HTMLButtonElement)
        .disabled,
    ).toBe(true);
    expect(
      screen.queryByRole("button", { name: /reset|apagar arquivo/i }),
    ).toBeNull();
  });
  it("submits an opaque CA selection, discards it on close and keeps certificate bytes outside the form", async () => {
    api.selectProfileCa.mockResolvedValue({
      ok: true,
      value: {
        selectionId: "01234567-89ab-4def-89ab-0123456789ab",
        fingerprints: ["AA:BB:CC"],
      },
    });
    api.saveProfile.mockResolvedValue(ok([profile]));
    render(<Connections />);
    const user = userEvent.setup();
    await user.click(
      await screen.findByRole("button", { name: "Novo perfil" }),
    );
    await fill(user);
    await user.selectOptions(screen.getByLabelText("Confiança TLS"), "replace");
    expect(
      (
        screen.getByRole("button", {
          name: "Salvar perfil",
        }) as HTMLButtonElement
      ).disabled,
    ).toBe(true);
    await user.click(screen.getByRole("button", { name: "Selecionar CA PEM" }));
    await screen.findByText("SHA-256: AA:BB:CC");
    await user.click(screen.getByRole("button", { name: "Salvar perfil" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(api.saveProfile.mock.calls[0][0].trust).toEqual({
      action: "replace",
      selectionId: "01234567-89ab-4def-89ab-0123456789ab",
    });
    expect(api.discardProfileCa).toHaveBeenCalledWith(
      "01234567-89ab-4def-89ab-0123456789ab",
    );
    expect(document.body.textContent).not.toContain("CERTIFICATE");
  });
});
