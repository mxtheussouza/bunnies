import React from "react";
import { useSession } from "../shell/SessionProvider";
import { profileErrorMessages } from "../../shared/profiles";
import Button from "../components/Button";
import StatusMessage from "../components/StatusMessage";
export default function SessionControls({
  profileId,
  revision,
  disabled,
}: {
  profileId: string;
  revision: string;
  disabled: boolean;
}) {
  const { state, error, busy, connect, disconnect } = useSession();
  const active = state.desired || state.stopping;
  const connectButton = React.useRef<HTMLButtonElement>(null);
  const disconnectButton = React.useRef<HTMLButtonElement>(null);
  const moveFocus = React.useRef(false);
  React.useLayoutEffect(() => {
    if (!moveFocus.current || busy || state.stopping) return;
    (active ? disconnectButton : connectButton).current?.focus();
    moveFocus.current = false;
  }, [active, busy, state.stopping]);
  return (
    <section aria-label="Sessão do broker">
      <div className="profile-actions">
        <Button
          ref={connectButton}
          disabled={disabled || active || busy}
          onClick={() => {
            moveFocus.current = true;
            void connect({
              profileId,
              revision,
              operationId: crypto.randomUUID(),
            });
          }}
        >
          Conectar
        </Button>
        {active && (
          <Button
            ref={disconnectButton}
            disabled={state.stopping || busy}
            onClick={() => {
              moveFocus.current = true;
              void disconnect();
            }}
          >
            {state.stopping
              ? "Encerrando…"
              : state.state === "connecting"
                ? "Cancelar conexão"
                : "Desconectar"}
          </Button>
        )}
      </div>
      <p className="profile-hint">
        Conectar mantém AMQPS aberto e verifica HTTPS periodicamente. Não cria
        canais, publica ou consome mensagens. Para trocar perfil ou vhost,
        desconecte primeiro.
      </p>
      {error && <StatusMessage tone="danger" title={error} />}
      {state.reason && (
        <StatusMessage
          tone="danger"
          title={profileErrorMessages[state.reason]}
        />
      )}
      {state.closeConfirmed === false && !active && (
        <StatusMessage title="Recursos locais encerrados. O broker não confirmou o fechamento." />
      )}
    </section>
  );
}
