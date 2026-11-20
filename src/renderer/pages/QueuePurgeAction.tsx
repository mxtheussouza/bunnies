import React from "react";
import {
  managementErrors,
  type ManagementError,
  type ManagementInput,
} from "../../shared/management";
import type { SessionRef } from "../../shared/session";
import Button from "../components/Button";
import StatusMessage from "../components/StatusMessage";

type Props = {
  session: SessionRef;
  name: string;
  vhost: string;
  disabled: boolean;
  onPending: (pending: boolean) => void;
  onPossibleWrite: () => void;
  onVerify: () => void;
};
type Outcome =
  | { status: "accepted" }
  | { status: "uncertain" | "error"; code: ManagementError; requestId: string };

const errors: Partial<Record<ManagementError, string>> = {
  CANCELLED: "A solicitação foi cancelada antes do envio.",
  TIMEOUT: "O prazo para consultar ou confirmar expirou antes do envio.",
  DENIED:
    "O RabbitMQ recusou a limpeza. Confira a permissão de leitura na fila.",
  NOT_FOUND: "A fila deixou de estar disponível neste vhost.",
  BUSY: "Aguarde a operação administrativa em andamento.",
  FORBIDDEN:
    "Volte à janela ativa e confira o contexto antes de solicitar a limpeza.",
};

export default function QueuePurgeAction({
  session,
  name,
  vhost,
  disabled,
  onPending,
  onPossibleWrite,
  onVerify,
}: Props) {
  const [pending, setPending] = React.useState(false);
  const [outcome, setOutcome] = React.useState<Outcome>();
  const active = React.useRef<ManagementInput | null>(null);
  const result = React.useRef<HTMLDivElement>(null);
  const cancel = React.useCallback(() => {
    if (active.current)
      void window.bunnies
        .cancelQueuePurge(active.current)
        .catch(() => undefined);
  }, []);

  React.useLayoutEffect(
    () => () => {
      cancel();
      active.current = null;
    },
    [cancel],
  );
  React.useLayoutEffect(() => {
    if (outcome) result.current?.focus();
  }, [outcome]);

  async function submit() {
    if (disabled || active.current) return;
    const input = { ...session, operationId: crypto.randomUUID() };
    active.current = input;
    setPending(true);
    onPending(true);
    setOutcome(undefined);

    const uncertain = (code: ManagementError, requestId: string) => {
      onPossibleWrite();
      setOutcome({ status: "uncertain", code, requestId });
    };
    try {
      const response = await window.bunnies.purgeSessionQueue({
        ...input,
        name,
      });
      if (active.current !== input) return;
      if (!response.ok) {
        if (response.error.code === "QUEUE_PURGE_UNCERTAIN")
          uncertain(response.error.code, response.requestId);
        else
          setOutcome({
            status: "error",
            code: response.error.code,
            requestId: response.requestId,
          });
      } else if (response.value.vhost !== vhost) {
        uncertain("RESPONSE", response.requestId);
      } else if (response.value.status === "uncertain") {
        uncertain(response.value.reason, response.requestId);
      } else {
        onPossibleWrite();
        setOutcome({ status: "accepted" });
      }
    } catch {
      if (active.current === input)
        uncertain("QUEUE_PURGE_UNCERTAIN", "transport");
    } finally {
      if (active.current === input) {
        active.current = null;
        setPending(false);
        onPending(false);
      }
    }
  }

  return (
    <>
      <Button
        aria-haspopup="dialog"
        aria-disabled={pending || disabled}
        onClick={() => void submit()}
      >
        Limpar mensagens
      </Button>
      {pending && (
        <StatusMessage
          title="Aguardando confirmação ou resposta do broker…"
          action={<Button onClick={cancel}>Parar de aguardar</Button>}
        >
          Se o pedido já foi enviado, parar de aguardar não desfaz a limpeza.
        </StatusMessage>
      )}
      {outcome && (
        <div ref={result} tabIndex={-1}>
          {outcome.status === "error" ? (
            <StatusMessage tone="warning" title="Limpeza não concluída">
              {errors[outcome.code] ?? managementErrors[outcome.code]}{" "}
              Diagnóstico {outcome.requestId}.
            </StatusMessage>
          ) : (
            <StatusMessage
              tone={outcome.status === "uncertain" ? "warning" : "info"}
              title={
                outcome.status === "accepted"
                  ? "Limpeza aceita pelo broker"
                  : "Resultado incerto"
              }
              action={
                <Button disabled={disabled} onClick={onVerify}>
                  Verificar fila
                </Button>
              }
            >
              {outcome.status === "accepted"
                ? "Novas publicações e reentregas podem alterar a contagem."
                : `Consulte o estado atual da fila. A consulta não comprova que a limpeza ocorreu. Diagnóstico ${outcome.requestId}.`}
            </StatusMessage>
          )}
        </div>
      )}
    </>
  );
}
