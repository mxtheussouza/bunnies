import React from "react";
import Card from "../components/Card";
import EmptyState from "../components/EmptyState";
import Icon from "../components/Icon";
import StatusMessage from "../components/StatusMessage";

export default function ConnectionsEmpty() {
  return (
    <>
      <Card className="connections-card">
        <div className="card-heading">
          <span>PERFIS NESTE DISPOSITIVO</span>
          <span className="neutral-badge">
            <Icon name="connection" />
            Sem conexão
          </span>
        </div>
        <EmptyState title="Nenhuma conexão configurada">
          <p>Seu próximo workspace começa por uma conexão.</p>
          <p>O cadastro de brokers estará disponível em uma próxima versão.</p>
        </EmptyState>
        <div className="connection-principles">
          <div>
            <Icon name="overview" />
            <strong>Contexto sempre visível</strong>
            <p>
              Conexão, ambiente e vhost identificam onde você está trabalhando.
            </p>
          </div>
          <div>
            <Icon name="lock" />
            <strong>Operações explícitas</strong>
            <p>
              Sem sessão ativa, os recursos do broker permanecem indisponíveis.
            </p>
          </div>
        </div>
      </Card>
      <StatusMessage title="Nenhuma conexão foi iniciada">
        HTTPS e AMQPS ainda não foram iniciados. Nenhum dado de broker é exibido
        nesta tela.
      </StatusMessage>
    </>
  );
}
