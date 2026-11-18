import React from "react";
import Icon from "../components/Icon";
import { useSession, endpointLabels } from "./SessionProvider";
import { environmentLabels, profileErrorMessages } from "../../shared/profiles";

export default function SessionContextBar() {
  const { state } = useSession();
  if (state.desired || state.stopping)
    return (
      <header
        className="session-context"
        aria-label="Contexto da conexão"
        aria-live="polite"
      >
        <div>
          <strong>
            {state.stopping
              ? "Encerrando sessão…"
              : state.profile?.name || "Conectando…"}
          </strong>
          <p
            className={
              state.profile?.environment === "production"
                ? "production-label"
                : undefined
            }
          >
            {state.profile?.environment === "production" ? "⚠ " : ""}
            {state.profile && environmentLabels[state.profile.environment]} ·
            Vhost: {state.profile?.vhost || "Verificando…"}
            {state.amqps.phase !== "available" &&
              state.amqps.phase !== "blocked" &&
              " (não verificado)"}
          </p>
        </div>
        <div className="endpoint-states" aria-label="Estado dos endpoints">
          <span>
            HTTPS: {endpointLabels[state.https.phase]}
            {state.https.checkedAt &&
              " · " +
                new Date(state.https.checkedAt).toLocaleTimeString("pt-BR")}
            {state.paused && " · verificação pausada"}
            {state.https.error &&
              " · " + profileErrorMessages[state.https.error]}
            {state.https.failedAt &&
              " · falha às " +
                new Date(state.https.failedAt).toLocaleTimeString("pt-BR")}
          </span>
          <span>
            AMQPS:{" "}
            {state.amqps.phase === "available"
              ? "Estabelecido"
              : endpointLabels[state.amqps.phase]}{" "}
            · Fluxo{" "}
            {state.flow === "unknown"
              ? "não verificado"
              : state.flow === "blocked"
                ? "bloqueado"
                : "liberado"}
            {state.amqps.nextRetryAt &&
              " · Tentativa " + (state.amqps.retries + 1) + " de 5"}
            {state.amqps.error &&
              " · " + profileErrorMessages[state.amqps.error]}
          </span>
        </div>
      </header>
    );
  return (
    <header className="session-context" aria-label="Contexto da conexão">
      <div>
        <strong>Sem sessão ativa</strong>
        <p>Nenhum broker ou vhost ativo.</p>
      </div>
      <div className="endpoint-states" aria-label="Estado dos endpoints">
        <span>
          <Icon name="connection" />
          HTTPS sem sessão
        </span>
        <span>
          <Icon name="connection" />
          AMQPS sem sessão
        </span>
      </div>
    </header>
  );
}
