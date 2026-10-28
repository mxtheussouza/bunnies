import React from "react";
import wordmark from "@assets/logotipos/bunnies-logo-extensive.png";
import { useVersions } from "@src/common/hooks";
import { runDesktop } from "@src/common/desktop";
import Button from "../components/Button";
import Card from "../components/Card";
import Icon from "../components/Icon";

export default function About() {
  const { versions } = useVersions();
  return (
    <Card className="about-card">
      <img src={wordmark} alt="Bunnies" className="about-wordmark" />
      <p className="about-introduction">
        Mais clareza para trabalhar com RabbitMQ.
      </p>
      <p>
        Aplicativo desktop para administração e observabilidade de brokers. Você
        pode organizar perfis locais, testar autenticação HTTPS e consultar a
        Ajuda. Sessão AMQP e operações de broker ainda não estão disponíveis
        nesta versão.
      </p>
      <dl className="about-details">
        <div>
          <dt>Versão do aplicativo</dt>
          <dd data-testid="app-version">
            {versions.bunnies ?? "Indisponível"}
          </dd>
        </div>
        <div>
          <dt>Licença</dt>
          <dd>MIT</dd>
        </div>
        <div>
          <dt>Autor</dt>
          <dd>Matheus Souza</dd>
        </div>
      </dl>
      <Button
        onClick={() => runDesktop(() => window.bunnies.openLink("author"))}
      >
        Conhecer o autor <Icon name="arrow" />
      </Button>
    </Card>
  );
}
