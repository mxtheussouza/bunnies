import React from "react";
import type { HttpsTestOutcome } from "../../shared/connections";
import { profileErrorMessages } from "../../shared/profiles";
import Button from "../components/Button";
import StatusMessage from "../components/StatusMessage";
export default function ConnectionTest({
  profileId,
  revision,
  hasPassword,
  transport = "https",
  blocked = false,
  onRunningChange,
}: {
  profileId: string;
  revision: string;
  hasPassword: boolean;
  transport?: "https" | "amqps";
  blocked?: boolean;
  onRunningChange?: (running: boolean) => void;
}) {
  const amqps = transport === "amqps";
  const label = amqps ? "AMQPS" : "HTTPS";
  const [running, setRunning] = React.useState(false);
  const [cancelling, setCancelling] = React.useState(false);
  const [outcome, setOutcome] = React.useState<HttpsTestOutcome | null>(null);
  const [error, setError] = React.useState("");
  const active = React.useRef<string | null>(null);
  const mounted = React.useRef(false);
  React.useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      const id = active.current;
      active.current = null;
      if (id)
        void (
          amqps
            ? window.bunnies.cancelProfileAmqpsTest(id)
            : window.bunnies.cancelProfileHttpsTest(id)
        ).catch(() => undefined);
    };
  }, [amqps]);
  async function start() {
    if (active.current || blocked) return;
    const id = crypto.randomUUID();
    active.current = id;
    setRunning(true);
    onRunningChange?.(true);
    setCancelling(false);
    setOutcome(null);
    setError("");
    try {
      const result = await (
        amqps
          ? window.bunnies.testProfileAmqps
          : window.bunnies.testProfileHttps
      )({
        profileId,
        revision,
        operationId: id,
      });
      if (!mounted.current || active.current !== id) return;
      if (result.ok) setOutcome(result.value);
      else setError(profileErrorMessages[result.error.code]);
    } catch {
      if (mounted.current && active.current === id)
        setError(profileErrorMessages.UNAVAILABLE);
    } finally {
      if (mounted.current && active.current === id) {
        active.current = null;
        setRunning(false);
        onRunningChange?.(false);
        setCancelling(false);
      }
    }
  }
  async function cancel() {
    const id = active.current;
    if (!id || cancelling) return;
    setCancelling(true);
    try {
      const result = await (amqps
        ? window.bunnies.cancelProfileAmqpsTest(id)
        : window.bunnies.cancelProfileHttpsTest(id));
      if (mounted.current && !result.ok) {
        setError(profileErrorMessages[result.error.code]);
        setCancelling(false);
      }
    } catch {
      if (mounted.current) {
        setError(profileErrorMessages.UNAVAILABLE);
        setCancelling(false);
      }
    }
  }
  return (
    <section
      className="https-test"
      aria-label={"Teste de autenticação " + label}
    >
      <div className="profile-actions">
        <Button
          disabled={!hasPassword || blocked}
          loading={running}
          onClick={() => {
            void start();
          }}
        >
          Testar {label}
        </Button>
        {running && (
          <Button
            disabled={cancelling}
            onClick={() => {
              void cancel();
            }}
          >
            {cancelling ? "Cancelando teste…" : "Cancelar teste " + label}
          </Button>
        )}
      </div>
      {!hasPassword && (
        <p className="profile-hint">
          Informe a senha nesta execução em Editar perfil para testar {label}.
        </p>
      )}
      <p className="profile-hint">
        {amqps
          ? "Testa TLS, autenticação e abertura do vhost salvo, encerrando a conexão antes de concluir. Não cria canais, publica ou consome mensagens e não ativa sessão."
          : "Testa a autenticação HTTPS do perfil salvo. O resultado não verifica AMQPS, permissões de filas ou disponibilidade contínua e não ativa sessão."}
      </p>
      {running && (
        <p role="status">
          Verificando autenticação {label}… Prazo total de até {amqps ? 15 : 10}{" "}
          segundos.
        </p>
      )}
      {error && <StatusMessage tone="danger" title={error} />}
      {outcome && (
        <StatusMessage
          title={
            amqps
              ? "Autenticação AMQPS e vhost verificados"
              : "Autenticação HTTPS verificada"
          }
        >
          Último teste:{" "}
          <time dateTime={outcome.checkedAt}>
            {new Intl.DateTimeFormat("pt-BR", {
              dateStyle: "short",
              timeStyle: "medium",
            }).format(new Date(outcome.checkedAt))}
          </time>{" "}
          · {outcome.durationMs} ms. {amqps && "Conexão encerrada. "}Nenhuma
          sessão foi ativada.
        </StatusMessage>
      )}
    </section>
  );
}
