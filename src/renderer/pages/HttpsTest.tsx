import React from "react";
import type { HttpsTestOutcome } from "../../shared/connections";
import { profileErrorMessages } from "../../shared/profiles";
import Button from "../components/Button";
import StatusMessage from "../components/StatusMessage";
export default function HttpsTest({
  profileId,
  revision,
  hasPassword,
}: {
  profileId: string;
  revision: string;
  hasPassword: boolean;
}) {
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
        void window.bunnies.cancelProfileHttpsTest(id).catch(() => undefined);
    };
  }, []);
  async function start() {
    if (active.current) return;
    const id = crypto.randomUUID();
    active.current = id;
    setRunning(true);
    setCancelling(false);
    setOutcome(null);
    setError("");
    try {
      const result = await window.bunnies.testProfileHttps({
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
        setCancelling(false);
      }
    }
  }
  async function cancel() {
    const id = active.current;
    if (!id || cancelling) return;
    setCancelling(true);
    try {
      const result = await window.bunnies.cancelProfileHttpsTest(id);
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
    <section className="https-test" aria-label="Teste de autenticação HTTPS">
      <div className="profile-actions">
        <Button
          disabled={!hasPassword}
          loading={running}
          onClick={() => {
            void start();
          }}
        >
          Testar HTTPS
        </Button>
        {running && (
          <Button
            disabled={cancelling}
            onClick={() => {
              void cancel();
            }}
          >
            {cancelling ? "Cancelando teste…" : "Cancelar teste HTTPS"}
          </Button>
        )}
      </div>
      {!hasPassword && (
        <p className="profile-hint">
          Informe a senha nesta execução em Editar perfil para testar HTTPS.
        </p>
      )}
      <p className="profile-hint">
        Testa a autenticação HTTPS do perfil salvo. O resultado não verifica
        AMQPS, permissões de filas ou disponibilidade contínua e não ativa
        sessão.
      </p>
      {running && (
        <p role="status">
          Verificando autenticação HTTPS… Prazo total de até 10 segundos.
        </p>
      )}
      {error && <StatusMessage tone="danger" title={error} />}
      {outcome && (
        <StatusMessage title="Autenticação HTTPS verificada">
          Último teste:{" "}
          <time dateTime={outcome.checkedAt}>
            {new Intl.DateTimeFormat("pt-BR", {
              dateStyle: "short",
              timeStyle: "medium",
            }).format(new Date(outcome.checkedAt))}
          </time>{" "}
          · {outcome.durationMs} ms. Nenhuma sessão foi ativada.
        </StatusMessage>
      )}
    </section>
  );
}
