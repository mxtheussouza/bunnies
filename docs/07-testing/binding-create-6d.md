# Evidências 6D — gate inicial de criação de bindings

A execução autorizada partiu de `d42b7da` em `main`, macOS 27.0.1 arm64 e
Docker Engine 29.8.0. O comando
`node tools/testing/rabbitmq-real.cjs --binding-create-gate`
usou RabbitMQ 4.4.0 e 4.3.6 em containers próprios, fixados por digest,
com TLS, prefixo Management e uma conta limitada a nomes de teste.
O observador conferiu identidade, propriedades e inventário.

## Resultados nas duas versões

A primeira rodada reconheceu os POSTs com HTTP 201. O parser candidato
recusou os formatos relativos de Location. Passaram quatro grupos e
falharam treze por versão. O ajuste confinou a leitura aos formatos
relativos observados, conferiu os componentes de origem e destino
presentes e construiu o GET por meio da rota local. Na segunda rodada,
passaram 15 grupos e falharam dois por versão.

| Cenário | Resultado |
| --- | --- |
| Exchange→fila e exchange→exchange | HTTP 201, seguido de GET individual 200. Identidade e argumentos conferidos nos vhosts `/`, `detailed` e `literal%2F` |
| Nome e routing key com espaços, Unicode, barra e percentual | Preservados. Location codificou nomes com `+` para espaços. A identidade incluída no último segmento veio codificada para uso como segmento |
| Chave vazia e percentual literal | HTTP 201 e GET de item 200. A chave vazia sem argumentos obteve identidade `~` |
| Argumentos tipados | Texto vazio, booleanos, zero e extremos do inteiro de 32 bits conferiram. Mesma chave com valores distintos originou duas identidades. A repetição idêntica preservou identidade e cardinalidade |
| Headers | `all` e `any` passaram com argumentos tipados e identidades distintas |
| Permissões separadas | Falta de leitura na origem ou de escrita no destino retornou HTTP 401 `not_authorised` |
| Location incompatível | Fixtures com URL externa, formato desconhecido, alvo diferente, query, fragmento e identidade longa foram recusadas |
| Chaves literais `.` e `..` sem argumentos | O POST retornou 201 para ambas. A lista do par mostrou os vínculos com `properties_key` igual à routing key. Para `.`, a tentativa de GET individual retornou a coleção do par. Para `..`, retornou HTTP 400. O escape `%2E` não alterou os efeitos |
| Isolamento | Filas e exchanges permaneceram iguais, sem conexões ou canais AMQP retidos. Os relatórios indicaram limpeza dos quatro ambientes das rodadas |

A repetição final confirmou os mesmos 15 grupos e duas falhas por versão,
com limpeza completa. `npm run check` passou 314 testes em 40 arquivos e
seis testes Node, além de typecheck, lint, formatação e Guia/Ajuda. As
fixtures de TLS inválido, perda de resposta e cancelamento da 6D seguem
pendentes no adapter.

O caso de `.` mostra por que HTTP 200 por si só é insuficiente. A rota de
item esperada retornou também os outros bindings do mesmo par. O candidato
recusou as identidades pontuais para a leitura individual.

Relatórios locais em `out/binding-create-gate-6d-initial-results.json` e
`out/binding-create-gate-6d-results.json`. A fronteira IPC, o formulário,
o pacote e a matriz final dependem da decisão de contrato.

## Revisão proposta para 6D-D04

Para preservar as duas routing keys, usar um GET limitado da coleção do
mesmo par apenas quando a identidade retornada e validada for exatamente
`.` ou `..`. A rota do GET vem dos alvos já validados no main. Exigir
resposta completa de até 200 bindings, 256 KiB de corpo e 16 KiB de
cabeçalhos, no máximo 10 s dentro do prazo total. Confirmar somente uma
correspondência de identidade, vhost, origem, tipo de destino, destino,
routing key e argumentos tipados. Excesso de limite, ausência ou
ambiguidade deixam a conferência indisponível após o aceite. Para as
demais identidades, permanece o GET exato. Location externa ou inválida
continua bloqueada.

O gate revisado precisa provar limites, correspondência única e ausência
de requisição baseada em Location inválida antes da integração. A opção
alternativa é bloquear as duas routing keys antes do POST, reduzindo o
conjunto de chaves suportado. A revisão depende da escolha do proprietário.

## Revisão aprovada e integração

“Aprovo e continue a proxima etapa” aceitou a conferência pela coleção
limitada para as duas identidades. O relatório
`out/binding-create-gate-6d-point-failure-results.json` conserva os dois
cenários originais. A implementação do parser e da conferência foi
compilada para o gate revisado, que passou **18 verificações por versão**.
A fixture de 200 vínculos confirmou uma correspondência, e listas com
201 vínculos, duplicidade ou ausência foram recusadas. A comparação
distinguiu argumentos divergentes.

A ponte tem 39 métodos explícitos. O formulário usa a sessão vigente,
mostra o endpoint HTTPS e o vhost e oferece consulta manual dos bindings.
As verificações de TLS e cancelamento antes do envio passaram com servidor
local. O smoke confirmou criação, Location externa recusada após aceite,
perda de resposta e cancelamento após envio sem repetição. O primeiro
ensaio da matriz empacotada chegou à leitura de regressão com o detalhe
aberto. O harness passou a voltar à lista antes dessa leitura.

O pacote macOS arm64 tem ASAR de 1.106.289 bytes com SHA-256
`1c4c04d9e1d46bcdebab077d8204874c4aa95e0400ce0e8de9836ce552230008`.

## Matriz real no executável

`node tools/testing/rabbitmq-real.cjs --binding-create-matrix` passou
38 verificações em cada RabbitMQ. A matriz criou 12 vínculos de teste por
broker. A criação ocorreu no formulário e pela ponte do pacote nos vhosts
`/`, `detailed` e `literal%2F`, com destino fila e exchange, as duas
identidades pontuais, argumentos tipados e chave com Unicode e percentual.
Também houve reenvio idêntico explícito e recusa por alvo ausente ou falta
de permissão de leitura/escrita. O inventário, descontados os vínculos
esperados, permaneceu igual. O contador de canais criados ficou em zero.
Os relatórios confirmaram limpeza completa.

| RabbitMQ | Gate revisado | Verificações no executável |
| --- | ---: | ---: |
| 4.4.0 | 18 | 38 |
| 4.3.6 | 18 | 38 |

Matriz em `out/rabbitmq-real-6d-results.json`, com macOS 27.0.1 arm64,
Electron 45.1.0 e Node 24.22.1. A verificação do pacote abrange o aplicativo
desktop compartilhado, com validação nativa pendente em Windows, Linux e
macOS x64. Cluster, leitores de tela e release permanecem pendentes.

## Encerramento técnico

O check passou **320 testes em 40 arquivos**, seis testes Node do patch,
typecheck, lint, formatação e sincronização documental. Passaram 12
smokes de regressão e o smoke de criação, em sequência e no mesmo ASAR.
O smoke de criação passou novamente após o harness aguardar o repaint
da janela para capturar os temas a 200%. Capturas locais em
`out/binding-create-6d-{light,dark}-zoom.png`. A Ajuda empacotada tem
21 tópicos e inclui os campos de criação. Os 39 métodos passaram na
verificação de segurança da ponte. Conferidos os relatórios e a ausência
de contêineres e redes de teste. O proprietário aprovou a conclusão e o commit local em 2026-11-21. Os hashes dos 37 caminhos e do pacote conferiram com a revisão apresentada.
