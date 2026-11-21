# Evidências 6E — remoção de bindings

Em 2026-11-21, o gate autorizado partiu de `8ca3aa6` em `main`.
`node tools/testing/rabbitmq-real.cjs --binding-delete-gate` usou macOS
arm64, Docker Engine 29.8.0 e as imagens de nó único RabbitMQ 4.4.0 e
4.3.6 fixadas por digest. Cada execução usou TLS, conta limitada para
a mutação, observador separado e inventário completo de exchanges,
filas e bindings das fixtures.

| Cenário | Resultado nas duas versões |
| --- | --- |
| Vínculo exato de exchange para fila ou exchange | HTTP 204, com remoção apenas do vínculo selecionado. Os inventários preservaram os homônimos, as outras chaves e o vínculo de mesma routing key com argumentos distintos. |
| Nomes e chaves especiais | Passaram nos vhosts `/`, `detailed` e `literal%2F`, com identificador vazio representado por `~` e nomes com Unicode, barra, percentual literal e sinal de mais. |
| Routing keys literais `null` e `undefined` | A coleção apresentou os vínculos. O GET de item retornou 404 para ambos. O candidato bloqueou o DELETE e preservou o inventário. |
| Identidades `.` e `..`, duplicidade e recursos reservados | A guarda do harness não emitiu DELETE. A duplicidade foi simulada na projeção, e os identificadores pontuais vieram do broker. |
| Vínculo ausente | A releitura do par recusou o alvo e o GET individual retornou 404. Zero DELETEs. |
| Permissões | A falta de leitura na origem ou de escrita no destino resultou em HTTP 401 `not_authorised` sem alteração de inventário. |
| Auto-delete após remoção concorrente | O GET viu o vínculo selecionado com outro vínculo de saída. A fixture removeu o penúltimo com HTTP 204 e preservou as exchanges. O DELETE preparado recebeu HTTP 204 ao remover o último vínculo. O broker também removeu duas exchanges em cadeia e o vínculo de entrada, preservando a exchange de destino e as filas. |
| Recriação equivalente | A recriação restaurou o inventário e a mesma identidade após a leitura. O DELETE preparado removeu o vínculo recriado com HTTP 204. |
| TLS inválido | A conexão foi recusada na validação TLS e o inventário permaneceu igual. |
| Resposta perdida | O proxy de loopback encaminhou um único DELETE e fechou a conexão antes de responder ao cliente. O broker devolveu 204 ao proxy e o observador encontrou o vínculo ausente. |

As primeiras rodadas reconstituíram a corrida de auto-delete, mas a
recriação por HTTP ficou sem o corpo planejado devido à chamada ao helper
do harness. Esse HTTP 201 não demonstrou a recriação. A execução seguinte
confirmou o cenário por AMQPS. A versão final testa a recriação por AMQPS
e por HTTP com o corpo correto, em vínculos separados.

## Decisão de produto proposta

A releitura do par e do item valida o vínculo observado e identifica
casos que devem bloquear a escrita. Depois dessa leitura, o broker pode
aplicar a remoção a um vínculo equivalente recriado ou transformar
a remoção do penúltimo vínculo na remoção do último. Essa segunda corrida
reativa a consequência que motivou a decisão da 6C, pois outras exchanges
podem desaparecer pela cadeia de auto-delete.

A recomendação é manter a remoção indisponível enquanto não se puder
garantir a preservação das exchanges e a identidade da instância
confirmada. Qualquer política que aceite remover um vínculo equivalente
ou acionar auto-delete exige uma decisão explícita de produto. Uma
eventual confirmação nativa deveria mostrar perfil, ambiente de produção,
endpoint, vhost, par, routing key, argumentos e risco de auto-delete.
Uma resposta perdida depois do envio continuaria sendo resultado incerto.

A matriz foi executada no harness. O escopo mantém a remoção fora da UI
e do Guia/Ajuda. As conclusões se limitam às versões e topologias testadas.

## Execução final

Passaram 18 verificações em cada versão. A regressão do gate de criação
da 6D passou outras 18 por versão. `npm run check` passou 320 testes em
40 arquivos, seis testes Node do patch, typecheck, lint, formatação e
sincronização do Guia/Ajuda. Após o ajuste final do harness, lint e
formatação desse arquivo também passaram.

Os relatórios em `out/binding-delete-gate-6e-results.json` registram os
resultados e a limpeza. Depois da última matriz e da regressão, a inspeção
encontrou zero contêineres e redes com a label do harness. O cenário de
recriação AMQPS fechou o canal e a conexão da fixture, e o gate verificou
ausência de conexões ou canais retidos.

## Decisão aprovada

Em 2026-11-21, “Aprovo” aceitou manter a remoção indisponível até ser
possível preservar as exchanges e garantir que o vínculo confirmado
seja o removido. O aceite autorizou o commit do gate e do relatório.
