# ADR-0005 — Matriz inicial de homologação

ID: ADR-0005. Data: 2026-10-28. Status: **Accepted**.

## Contexto

O proprietário informou “Nada definido” sobre versões RabbitMQ, sistemas/CPUs e
autenticação. Compatibilidade universal não pode ser presumida. A matriz abaixo é
seleção de referência aprovada para testes, não suporte já homologado.

## Alternativas

| Alternativa | Trade-off |
| --- | --- |
| Todas as versões/distribuições | Promessa sem matriz de testes viável |
| Um alvo por tecnologia | Menor esforço, pouca cobertura de diferenças |
| Matriz limitada e explícita | Cobertura controlada, exclusões transparentes |

## Decisão

Adotar RabbitMQ 4.4.0 e 4.3.6 como patches iniciais de homologação, com management, HTTPS/AMQPS e
permissões reais por operação. Revalidar patches suportados ao implementar.
Para desktop: Windows 11 x64, Ubuntu 24.04 LTS x64 e macOS 14 arm64/x64.
Outras versões/CPUs e distribuições não recebem garantia inicial.

## Justificativa

Testar duas séries com suporte comunitário observado e os três SOs pedidos, sem
ampliar prematuramente para todos os ambientes. Distinguir piso proposto de produto,
mínimo do runtime e alvo efetivamente testado.

## Consequências

Precisar de quatro alvos de build/smoke. Classic/quorum e capacidades/permissões
devem ser testados nas duas versões; nó único não homologa cluster/HA. Campos
ausentes e recursos não suportados geram estados explícitos. Novas versões só
entram na garantia após evidência e atualização da matriz.

## Aprovação

O proprietário respondeu **“Aprovado”** ao pedido explícito de aceite dos ADRs
0001–0007, MVP, requisitos/limites e conclusão/commit da Etapa 1B, em 2026-10-28.
O recorte inicial foi aceito. A [matriz NFR](../../02-requirements/non-functional-requirements.md)
e a [estratégia de testes](../../07-testing/test-strategy.md) ainda não foram executadas.

Referências: [RabbitMQ releases](https://www.rabbitmq.com/release-information),
[mínimos Electron](https://www.electronjs.org/docs/latest/breaking-changes).
