# ADR-0002 — Transportes RabbitMQ

ID: ADR-0002. Data: 2026-10-28. Status: **Accepted**.

## Contexto

Administração, métricas e publicação têm necessidades distintas. O legado não tem
transporte implementado. A aplicação opera localmente, sem backend hospedado próprio.

## Alternativas

| Alternativa | Trade-off |
| --- | --- |
| Somente Management API | Administração adequada, publicação ineficiente e limites de mensageria |
| Somente AMQP | Mensageria adequada, sem substituir endpoints de usuários/permissões/métricas |
| HTTPS administrativo e AMQPS para publicar | Dois transportes, responsabilidades explícitas |

## Decisão

Adotar Management API via HTTPS para recursos e métricas, com adapter do Node no
main; AMQP 0-9-1 via TLS com cliente amqplib para publicação confirmada. Endpoints e
estados separados por perfil. Recorte usuário/senha e CA configurável; mTLS, OAuth
e proxy corporativo configurável não pertencem ao MVP aprovado.

## Justificativa

Usar o mecanismo apropriado sem abstrair todas as operações em um cliente genérico.
Manter conexões e credenciais sob o núcleo; não conectar a partir do renderer.
O desenho detalhado está na [arquitetura](../architecture.md).

## Consequências

Plugin management e permissões são pré-condições administrativas. HTTP disponível
não prova disponibilidade AMQP, nem o inverso. Sem retries de escrita; confirmar
publicação não prova consumo. Timeout depois de envio pode ser resultado incerto.
Testar cada transporte e TLS nas versões candidatas antes de declarar suporte.
TLS obrigatório exclui brokers oferecidos somente sem TLS neste recorte.

## Aprovação

O proprietário respondeu **“Aprovado”** ao pedido explícito de aceite dos ADRs
0001–0007, MVP, requisitos/limites e conclusão/commit da Etapa 1B, em 2026-10-28.
Separação e restrições aceitas; clientes permanecem sujeitos aos testes previstos.
Nenhuma conexão ou dependência foi criada nesta etapa.

Referências: [Management](https://www.rabbitmq.com/docs/management),
[cliente AMQP](https://amqp-node.github.io/amqplib/channel_api.html),
[confirmações](https://www.rabbitmq.com/docs/confirms).
