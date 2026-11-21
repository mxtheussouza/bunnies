import React from "react";
import {
  isBindingCreation,
  managementErrors,
  type BindingCreationSnapshot,
  type ManagementInput,
  type ManagementError,
} from "../../shared/management";
import type { BindingCreation, ExchangeRow } from "../../shared/exchanges";
import type { SessionRef, SessionSnapshot } from "../../shared/session";
import { environmentLabels } from "../../shared/profiles";
import { useManagementEndpoint } from "./useManagementEndpoint";
import Button from "../components/Button";
import StatusMessage from "../components/StatusMessage";

type Field = {
  id: string;
  name: string;
  type: "text" | "boolean" | "integer";
  value: string;
};
type Outcome = {
  status: BindingCreationSnapshot["status"] | "notSent";
  reason?: ManagementError;
  identity?: string;
};
const titles: Record<Outcome["status"], string> = {
  confirmed: "Binding confirmado",
  divergent: "Propriedades divergentes",
  unverified: "Criação aceita, conferência indisponível",
  uncertain: "Resultado incerto",
  notSent: "Criação recusada ou interrompida",
};
const descriptions: Record<string, string> = {
  direct: "A routing key deve coincidir com a chave publicada.",
  topic:
    "A routing key pode usar * para uma palavra e # para zero ou mais palavras.",
  fanout:
    "O broker roteia para todos os destinos vinculados, independentemente da routing key.",
  headers:
    "Os argumentos são critérios de cabeçalho. A routing key não determina a correspondência.",
};

export default function BindingCreationForm({
  session,
  profile,
  source,
  onClose,
  onVerify,
}: {
  session: SessionRef;
  profile: NonNullable<SessionSnapshot["profile"]>;
  source: ExchangeRow;
  onClose(): void;
  onVerify(): void;
}) {
  const endpoint = useManagementEndpoint(profile.id);
  const id = React.useId();
  const dialog = React.useRef<HTMLDialogElement>(null);
  const name = React.useRef<HTMLInputElement>(null);
  const active = React.useRef<ManagementInput | null>(null);
  const [destinationType, setDestinationType] =
    React.useState<BindingCreation["destinationType"]>("queue");
  const [destination, setDestination] = React.useState("");
  const [routingKey, setRoutingKey] = React.useState("");
  const [match, setMatch] = React.useState("all");
  const [fields, setFields] = React.useState<Field[]>([]);
  const [error, setError] = React.useState(false);
  const [pending, setPending] = React.useState(false);
  const [outcome, setOutcome] = React.useState<Outcome>();
  const headers = source.type === "headers";
  const cancel = React.useCallback(() => {
    if (active.current)
      void window.bunnies
        .cancelBindingCreation(active.current)
        .catch(() => undefined);
  }, []);
  React.useLayoutEffect(() => {
    const opener = document.activeElement,
      element = dialog.current;
    element?.showModal();
    name.current?.focus();
    return () => {
      cancel();
      active.current = null;
      element?.close();
      if (opener instanceof HTMLElement && opener.isConnected) opener.focus();
    };
  }, [cancel]);
  function dismiss() {
    if (active.current) cancel();
    else onClose();
  }
  function change(field: Field, values: Partial<Field>) {
    setFields(items =>
      items.map(item => (item.id === field.id ? { ...item, ...values } : item)),
    );
  }
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!endpoint || active.current) return;
    const entries = fields.map(
      field =>
        [
          field.name,
          field.type === "boolean"
            ? field.value === "true"
            : field.type === "integer"
              ? Number(field.value)
              : field.value,
        ] as const,
    );
    const binding: BindingCreation = {
      source: source.name,
      destinationType,
      destination,
      routingKey,
      arguments: Object.fromEntries(
        headers ? [...entries, ["x-match", match]] : entries,
      ),
    };
    if (
      new Set(fields.map(field => field.name)).size !== fields.length ||
      fields.some(
        field => field.type === "integer" && !/^-?\d+$/.test(field.value),
      ) ||
      (headers &&
        (!fields.length ||
          fields.some(field => field.name.toLowerCase().startsWith("x-")))) ||
      !isBindingCreation(binding)
    ) {
      setError(true);
      return;
    }
    const input = { ...session, operationId: crypto.randomUUID() };
    active.current = input;
    setError(false);
    setPending(true);
    setOutcome(undefined);
    let result: Outcome;
    try {
      const reply = await window.bunnies.createSessionBinding({
        ...input,
        binding,
      });
      if (!reply.ok)
        result = {
          status:
            reply.error.code === "BINDING_UNCERTAIN" ? "uncertain" : "notSent",
          reason: reply.error.code,
        };
      else if (reply.value.vhost !== profile.vhost)
        result = { status: "uncertain", reason: "BINDING_UNCERTAIN" };
      else result = reply.value;
    } catch {
      result = { status: "uncertain", reason: "BINDING_UNCERTAIN" };
    }
    if (active.current !== input) return;
    active.current = null;
    setPending(false);
    setOutcome(result);
  }
  return (
    <dialog
      ref={dialog}
      className="queue-detail queue-declaration"
      aria-labelledby={id}
      onCancel={event => {
        event.preventDefault();
        dismiss();
      }}
    >
      <h2 id={id}>Novo binding</h2>
      <p
        className={
          profile.environment === "production"
            ? "queue-context queue-context--production"
            : "queue-context"
        }
      >
        {profile.environment === "production" && "⚠ "}
        {profile.name} · {environmentLabels[profile.environment]} · Vhost{" "}
        <bdi>{profile.vhost}</bdi> · HTTPS Management{" "}
        {endpoint && <bdi>{endpoint}</bdi>}
      </p>
      <p>
        Origem <bdi>{source.name}</bdi> · {source.type}
      </p>
      <p>{descriptions[source.type]}</p>
      {endpoint === "" && (
        <StatusMessage title="Destino HTTPS indisponível">
          Reabra o formulário para consultar o perfil.
        </StatusMessage>
      )}
      <form onSubmit={submit} noValidate>
        <fieldset disabled={pending}>
          <label>
            Tipo de destino
            <select
              value={destinationType}
              onChange={event =>
                setDestinationType(
                  event.target.value === "exchange" ? "exchange" : "queue",
                )
              }
            >
              <option value="queue">Fila</option>
              <option value="exchange">Exchange</option>
            </select>
          </label>
          <label>
            Nome exato do destino
            <input
              ref={name}
              maxLength={255}
              value={destination}
              onChange={event => setDestination(event.target.value)}
            />
          </label>
          <label>
            Routing key
            <input
              maxLength={255}
              value={routingKey}
              onChange={event => setRoutingKey(event.target.value)}
            />
          </label>
          {headers && (
            <label>
              Correspondência dos cabeçalhos
              <select
                value={match}
                onChange={event => setMatch(event.target.value)}
              >
                <option value="all">Todos (all)</option>
                <option value="any">Qualquer um (any)</option>
              </select>
            </label>
          )}
          {fields.map((field, index) => (
            <fieldset key={field.id}>
              <legend>Argumento {index + 1}</legend>
              <label>
                Chave
                <input
                  maxLength={64}
                  value={field.name}
                  onChange={event =>
                    change(field, { name: event.target.value })
                  }
                />
              </label>
              <label>
                Tipo de valor
                <select
                  value={field.type}
                  onChange={event => {
                    const type = event.target.value;
                    if (
                      type === "text" ||
                      type === "boolean" ||
                      type === "integer"
                    )
                      change(field, {
                        type,
                        value: type === "boolean" ? "false" : "",
                      });
                  }}
                >
                  <option value="text">Texto</option>
                  <option value="boolean">Booleano</option>
                  <option value="integer">Inteiro</option>
                </select>
              </label>
              <label>
                Valor
                {field.type === "boolean" ? (
                  <select
                    value={field.value}
                    onChange={event =>
                      change(field, { value: event.target.value })
                    }
                  >
                    <option value="false">Falso</option>
                    <option value="true">Verdadeiro</option>
                  </select>
                ) : (
                  <input
                    value={field.value}
                    maxLength={field.type === "integer" ? 11 : 255}
                    onChange={event =>
                      change(field, { value: event.target.value })
                    }
                  />
                )}
              </label>
              <Button
                onClick={() =>
                  setFields(items => items.filter(item => item.id !== field.id))
                }
              >
                Remover argumento
              </Button>
            </fieldset>
          ))}
          <Button
            disabled={fields.length >= (headers ? 15 : 16)}
            onClick={() =>
              setFields(items => [
                ...items,
                { id: crypto.randomUUID(), name: "", type: "text", value: "" },
              ])
            }
          >
            Adicionar argumento
          </Button>
        </fieldset>
        {error && (
          <StatusMessage tone="warning" title="Dados inválidos">
            Confira o nome exato do destino, a routing key e os argumentos. Use
            chaves únicas e valores inteiros de 32 bits quando selecionar
            Inteiro.
          </StatusMessage>
        )}
        {pending && (
          <StatusMessage title="Aguardando criação">
            Parar de aguardar pode deixar o binding aplicado no broker.
          </StatusMessage>
        )}
        {outcome && (
          <StatusMessage
            tone={outcome.status === "confirmed" ? "info" : "warning"}
            title={titles[outcome.status]}
          >
            {outcome.identity && (
              <>
                Identidade <bdi>{JSON.stringify(outcome.identity)}</bdi>.{" "}
              </>
            )}
            {outcome.reason && managementErrors[outcome.reason]}{" "}
            {outcome.status === "confirmed" &&
              "Um binding idêntico pode já existir."}
            {outcome.status === "uncertain" &&
              "Consulte os bindings de saída antes de reenviar."}
          </StatusMessage>
        )}
        <div className="queue-controls">
          <Button
            variant="primary"
            type="submit"
            disabled={pending || !endpoint}
          >
            Criar binding
          </Button>
          <Button onClick={dismiss}>
            {pending ? "Parar de aguardar" : "Fechar"}
          </Button>
          {outcome && outcome.status !== "notSent" && (
            <Button onClick={onVerify}>Consultar bindings de saída</Button>
          )}
        </div>
      </form>
    </dialog>
  );
}
