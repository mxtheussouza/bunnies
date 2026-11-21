import React from "react";
import {
  type ManagementResult,
  type ExchangeDeclarationSnapshot,
  managementErrors,
  type ManagementError,
  type ManagementInput,
  type QueueDeclarationSnapshot,
} from "../../shared/management";
import { environmentLabels } from "../../shared/profiles";
import type { SessionRef, SessionSnapshot } from "../../shared/session";
import Button from "../components/Button";
import StatusMessage from "../components/StatusMessage";

export type DeclarationFormProps = {
  session: SessionRef;
  profile: NonNullable<SessionSnapshot["profile"]>;
  available: boolean;
  onClose(): void;
  onPossibleWrite(): void;
  onVerify(name: string): void;
};
type Props = DeclarationFormProps & {
  resource: "fila" | "exchange";
  name: string;
  setName(name: string): void;
  valid: boolean;
  submitDeclaration(
    input: ManagementInput,
  ): Promise<
    ManagementResult<QueueDeclarationSnapshot | ExchangeDeclarationSnapshot>
  >;
  cancelDeclaration(
    input: ManagementInput,
  ): Promise<ManagementResult<undefined>>;
  endpoint?: string;
  destinationReady?: boolean;
  description: string;
  validationMessage: string;
  children: React.ReactNode;
};
type Outcome = {
  checkedAt?: string;
  name: string;
  status: QueueDeclarationSnapshot["status"] | "refused" | "notSent";
  requestId: string;
  reason?: ManagementError;
};

const outcomes: Record<Outcome["status"], { title: string; detail: string }> = {
  confirmed: {
    title: "Declaração confirmada",
    detail:
      "O broker aceitou a declaração e as propriedades conferem com o pedido.",
  },
  divergent: {
    title: "Propriedades divergentes",
    detail:
      "O broker aceitou a declaração e a leitura encontrou propriedades diferentes.",
  },
  unverified: {
    title: "Declaração aceita, conferência indisponível",
    detail: "Consulte as propriedades do recurso antes de uma nova declaração.",
  },
  uncertain: {
    title: "Resultado incerto",
    detail:
      "O pedido pode ter sido aplicado. Consulte o recurso antes de reenviar.",
  },
  notSent: {
    title: "Declaração não enviada",
    detail: "",
  },
  refused: {
    title: "Declaração recusada",
    detail: "",
  },
};

const declarationError: Partial<Record<ManagementError, string>> = {
  TIMEOUT: "A operação excedeu o prazo de declaração ou de conferência.",
  CANCELLED: "A espera local foi interrompida.",
  DENIED:
    "O acesso foi recusado. Confira a permissão de configuração da fila e as permissões de DLX aplicáveis.",
  LIMIT: "O pedido ou a resposta excedeu os limites administrativos.",
};

export default function DeclarationDialog({
  resource,
  name,
  setName,
  valid,
  submitDeclaration,
  cancelDeclaration,
  endpoint,
  destinationReady = true,
  description,
  validationMessage,
  children,
  session,
  profile,
  available,
  onClose,
  onPossibleWrite,
  onVerify,
}: Props) {
  const id = React.useId();
  const modal = React.useRef<HTMLDialogElement>(null);
  const active = React.useRef<ManagementInput | null>(null);
  const nameField = React.useRef<HTMLInputElement>(null);
  const [attempted, setAttempted] = React.useState(false);
  const [pending, setPending] = React.useState(false);
  const [outcome, setOutcome] = React.useState<Outcome>();

  const cancel = React.useCallback(() => {
    if (active.current)
      void cancelDeclaration(active.current).catch(() => undefined);
  }, [cancelDeclaration]);

  React.useLayoutEffect(() => {
    const dialog = modal.current;
    const opener = document.activeElement;
    dialog?.showModal();
    nameField.current?.focus();
    return () => {
      cancel();
      active.current = null;
      dialog?.close();
      if (opener instanceof HTMLElement && opener.isConnected) opener.focus();
    };
  }, [cancel]);

  React.useLayoutEffect(() => {
    if (!available) cancel();
  }, [available, cancel]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAttempted(true);
    if (!available || !destinationReady || active.current || !valid) return;
    const input = { ...session, operationId: crypto.randomUUID() };
    active.current = input;
    setPending(true);
    setOutcome(undefined);
    let result: Outcome;
    try {
      const response = await submitDeclaration(input);
      if (response.ok && response.value.vhost === profile.vhost) {
        result = {
          name,
          checkedAt: response.value.checkedAt,
          status: response.value.status,
          requestId: response.requestId,
        };
        if ("reason" in response.value) result.reason = response.value.reason;
      } else if (
        !response.ok &&
        response.error.code !== "QUEUE_DECLARATION_UNCERTAIN" &&
        response.error.code !== "EXCHANGE_DECLARATION_UNCERTAIN"
      ) {
        result = {
          name,
          status: [
            "DENIED",
            "EXCHANGE_DECLARATION_REFUSED",
            "EXCHANGE_DECLARATION_CONFLICT",
            "QUEUE_DECLARATION_REFUSED",
            "QUEUE_DECLARATION_CONFLICT",
          ].includes(response.error.code)
            ? "refused"
            : "notSent",
          reason: response.error.code,
          requestId: response.requestId,
        };
      } else {
        result = { name, status: "uncertain", requestId: response.requestId };
      }
    } catch {
      result = { name, status: "uncertain", requestId: "transport" };
    }
    if (active.current !== input) return;
    active.current = null;
    setPending(false);
    setOutcome(result);
    if (result.status !== "refused" && result.status !== "notSent")
      onPossibleWrite();
  }

  function dismiss() {
    if (active.current) cancel();
    else onClose();
  }

  return (
    <dialog
      ref={modal}
      className="queue-detail queue-declaration"
      aria-labelledby={id + "-title"}
      onCancel={event => {
        event.preventDefault();
        dismiss();
      }}
    >
      <h2 id={id + "-title"}>Nova {resource}</h2>
      <p
        className={
          profile.environment === "production"
            ? "queue-context queue-context--production"
            : "queue-context"
        }
      >
        {profile.environment === "production" && "⚠ "}
        {profile.name} · {environmentLabels[profile.environment]} · Vhost{" "}
        <b>{profile.vhost}</b>
        {profile.savedVhost !== undefined &&
          profile.vhost !== profile.savedVhost &&
          " (temporário)"}
        {" · HTTPS Management"} {endpoint && <bdi>{endpoint}</bdi>}
      </p>
      <p>{description}</p>
      <form onSubmit={submit} noValidate>
        <fieldset disabled={pending || !available}>
          <label>
            Nome da {resource}
            <input
              ref={nameField}
              maxLength={255}
              value={name}
              onChange={event => setName(event.target.value)}
            />
          </label>
          {children}
        </fieldset>
        {attempted && !valid && (
          <StatusMessage title="Dados inválidos" tone="warning">
            {validationMessage}
          </StatusMessage>
        )}
        {!available && (
          <StatusMessage title="Declaração indisponível">
            Mantenha a janela ativa com HTTPS disponível e AMQPS estabelecido.
          </StatusMessage>
        )}
        {pending && (
          <StatusMessage title="Aguardando declaração">
            Parar de aguardar pode deixar a declaração aplicada no broker.
          </StatusMessage>
        )}
        {outcome && (
          <StatusMessage
            title={outcomes[outcome.status].title}
            tone={outcome.status === "confirmed" ? "info" : "warning"}
          >
            {outcomes[outcome.status].detail}{" "}
            {outcome.reason &&
              (resource === "exchange" && outcome.reason === "DENIED"
                ? "Confira a permissão de configuração da exchange no vhost indicado."
                : (declarationError[outcome.reason] ??
                  managementErrors[outcome.reason]))}{" "}
            {outcome.checkedAt && (
              <time dateTime={outcome.checkedAt}>
                {new Date(outcome.checkedAt).toLocaleString("pt-BR")}.{" "}
              </time>
            )}
            Diagnóstico {outcome.requestId}.
          </StatusMessage>
        )}
        <div className="queue-controls">
          <Button
            variant="primary"
            type="submit"
            disabled={pending || !available || !destinationReady}
          >
            Declarar {resource}
          </Button>
          <Button onClick={dismiss}>
            {pending ? "Parar de aguardar" : "Fechar"}
          </Button>
          {outcome &&
            outcome.status !== "refused" &&
            outcome.status !== "notSent" && (
              <Button
                disabled={!available || pending}
                onClick={() => onVerify(outcome.name)}
              >
                Verificar {resource}
              </Button>
            )}
        </div>
      </form>
    </dialog>
  );
}
