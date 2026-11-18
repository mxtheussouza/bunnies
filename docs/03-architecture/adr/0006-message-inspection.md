# ADR-0006 — Inspeção e consumo de mensagens

ID: ADR-0006. Data: 2026-10-28. Status: **Accepted**.

## Contexto

O produto pretende facilitar inspeção, mas obter mensagens pode consumi-las,
confirmá-las ou alterar redelivery/ordem/políticas. Requeue não equivale a leitura
passiva. O proprietário exige explicação e proteção contra consumo inadvertido.

## Alternativas

| Alternativa | Trade-off |
| --- | --- |
| Apresentar get/requeue como preview seguro | Simples, porém transmite garantia incorreta |
| Incluir consumo diagnóstico explícito no MVP | Aumenta escopo e risco operacional antes da fundação |
| Adiar inspeção e definir semântica própria depois | MVP menor; recurso desejado fica posterior |

## Decisão

Incluir somente publicação no MVP. Não oferecer get, consume, ack ou requeue como
inspeção sem efeitos. Qualquer etapa futura deve definir limites, modo de ack,
restrições de produção, confirmação e tratamento de perda de rede, além de critérios
que verifiquem os efeitos observados no broker.

## Justificativa

Evitar promessa tecnicamente incorreta e reduzir risco do primeiro recorte. Um
cliente AMQP não transforma consumo/requeue em observação passiva.

## Consequências

Templates, binários e inspeção são posteriores; usuários não conseguem visualizar
mensagens enfileiradas pelo MVP. Não há plano de coletar cópia/histórico de mensagens
sem definir topologia, fonte e autorização. Consumo removendo dados exigirá aprovação
de escopo e confirmação inequívoca.

## Aprovação

O proprietário respondeu **“Aprovado”** ao pedido explícito de aceite dos ADRs
0001–0007, MVP, requisitos/limites e conclusão/commit da Etapa 1B, em 2026-10-28.
A exclusão inicial foi aceita; um futuro diagnóstico exige etapa e testes próprios.

Referências: [operação HTTP](https://www.rabbitmq.com/docs/http-api-reference#post-apiqueuesvhostnameget),
[MVP](../../02-requirements/mvp-scope.md) e
[requisitos FR-033](../../02-requirements/functional-requirements.md).
