import React from "react";
import Icon from "../components/Icon";

export default function SessionContextBar() {
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
          AMQPS não iniciado
        </span>
      </div>
    </header>
  );
}
