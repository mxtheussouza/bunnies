import React from "react";
import {
  isQueueDeclaration,
  managementErrors,
  type ManagementError,
  type ManagementInput,
  type QueueDeclarationSnapshot,
} from "../../shared/management";
import { environmentLabels } from "../../shared/profiles";
import type { QueueDeclaration } from "../../shared/queues";
import type { SessionRef, SessionSnapshot } from "../../shared/session";
import Button from "../components/Button";
import StatusMessage from "../components/StatusMessage";

type Props = {
  session: SessionRef;
  profile: NonNullable<SessionSnapshot["profile"]>;
  available: boolean;
  onClose(): void;
  onPossibleWrite(): void;
  onVerify(name: string): void;
};
type Outcome = {
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
    detail: "Consulte as propriedades da fila antes de uma nova declaração.",
  },
  uncertain: {
    title: "Resultado incerto",
    detail:
      "A fila pode ter sido declarada. Verifique no broker antes de reenviar.",
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

export default function QueueDeclarationForm({
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
  const [name, setName] = React.useState("");
  const [type, setType] = React.useState<QueueDeclaration["type"]>("classic");
  const [ttl, setTtl] = React.useState("");
  const [maxLength, setMaxLength] = React.useState("");
  const [useDlx, setUseDlx] = React.useState(false);
  const [dlx, setDlx] = React.useState("");
  const [useRoutingKey, setUseRoutingKey] = React.useState(false);
  const [routingKey, setRoutingKey] = React.useState("");
  const [attempted, setAttempted] = React.useState(false);
  const [pending, setPending] = React.useState(false);
  const [outcome, setOutcome] = React.useState<Outcome>();

  const cancel = React.useCallback(() => {
    if (active.current)
      void window.bunnies
        .cancelQueueDeclaration(active.current)
        .catch(() => undefined);
  }, []);

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

  const declaration: QueueDeclaration = {
    name,
    type,
    arguments: {
      ...(ttl === "" ? {} : { "x-message-ttl": Number(ttl) }),
      ...(maxLength === "" ? {} : { "x-max-length": Number(maxLength) }),
      ...(useDlx ? { "x-dead-letter-exchange": dlx } : {}),
      ...(useDlx && useRoutingKey
        ? { "x-dead-letter-routing-key": routingKey }
        : {}),
    },
  };
  const valid =
    /^\d*$/.test(ttl) &&
    /^\d*$/.test(maxLength) &&
    isQueueDeclaration(declaration);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAttempted(true);
    if (!available || active.current || !valid) return;
    const input = { ...session, operationId: crypto.randomUUID() };
    active.current = input;
    setPending(true);
    setOutcome(undefined);
    let result: Outcome;
    try {
      const response = await window.bunnies.declareSessionQueue({
        ...input,
        declaration,
      });
      if (response.ok && response.value.vhost === profile.vhost) {
        result = {
          name,
          status: response.value.status,
          requestId: response.requestId,
        };
        if ("reason" in response.value) result.reason = response.value.reason;
      } else if (
        !response.ok &&
        response.error.code !== "QUEUE_DECLARATION_UNCERTAIN"
      ) {
        result = {
          name,
          status: [
            "DENIED",
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
      <h2 id={id + "-title"}>Nova fila</h2>
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
        {" · HTTPS Management"}
      </p>
      <p>Fila durável, não exclusiva e sem exclusão automática.</p>
      <form onSubmit={submit} noValidate>
        <fieldset disabled={pending || !available}>
          <label>
            Nome da fila
            <input
              ref={nameField}
              maxLength={255}
              value={name}
              onChange={event => setName(event.target.value)}
            />
          </label>
          <label>
            Tipo da fila
            <select
              value={type}
              onChange={event =>
                setType(event.target.value === "quorum" ? "quorum" : "classic")
              }
            >
              <option value="classic">classic</option>
              <option value="quorum">quorum</option>
            </select>
          </label>
          <label>
            TTL de mensagens (ms)
            <input
              inputMode="numeric"
              maxLength={10}
              value={ttl}
              onChange={event => setTtl(event.target.value)}
            />
          </label>
          <label>
            Limite de mensagens
            <input
              inputMode="numeric"
              maxLength={10}
              value={maxLength}
              onChange={event => setMaxLength(event.target.value)}
            />
          </label>
          <p>
            Campos vazios omitem o argumento. Zero é um limite explícito e pode
            fazer mensagens expirarem ou serem descartadas. Policies do broker
            podem afetar os valores efetivos.
          </p>
          <label className="queue-checkbox">
            <input
              type="checkbox"
              checked={useDlx}
              onChange={event => setUseDlx(event.target.checked)}
            />
            Configurar dead-letter exchange (DLX)
          </label>
          {useDlx && (
            <>
              <label>
                Nome da DLX (vazio para a exchange padrão)
                <input
                  maxLength={255}
                  value={dlx}
                  onChange={event => setDlx(event.target.value)}
                />
              </label>
              <label className="queue-checkbox">
                <input
                  type="checkbox"
                  checked={useRoutingKey}
                  onChange={event => setUseRoutingKey(event.target.checked)}
                />
                Definir routing key
              </label>
              {useRoutingKey && (
                <label>
                  Routing key da DLX
                  <input
                    maxLength={255}
                    value={routingKey}
                    onChange={event => setRoutingKey(event.target.value)}
                  />
                </label>
              )}
              <p>
                A DLX exige leitura na fila e escrita na exchange do mesmo
                vhost.
              </p>
            </>
          )}
        </fieldset>
        {attempted && !valid && (
          <StatusMessage title="Dados inválidos" tone="warning">
            Informe um nome de fila válido (até 255 bytes UTF-8, sem prefixo
            amq. ou segmentos . e ..). Use números inteiros de 0 a 2.147.483.647
            e textos DLX de até 255 bytes UTF-8.
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
              (declarationError[outcome.reason] ??
                managementErrors[outcome.reason])}{" "}
            Diagnóstico {outcome.requestId}.
          </StatusMessage>
        )}
        <div className="queue-controls">
          <Button
            variant="primary"
            type="submit"
            disabled={pending || !available}
          >
            Declarar fila
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
                Verificar fila
              </Button>
            )}
        </div>
      </form>
    </dialog>
  );
}
