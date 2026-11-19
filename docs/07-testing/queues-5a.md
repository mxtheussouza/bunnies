# Etapa 5A — evidências da leitura de filas

Atualizado em 2026-11-19. Status: **5A concluída, aprovada e registrada**.

## Gate original de 2026-11-18
O proprietário aprovou a execução do
[contrato 5A](../05-roadmap/roadmap.md#contrato-proposto--5a-listagem-e-detalhe-de-filas)
por “Aprovo”. A preparação do adapter e os testes isolados começaram em
`main`, HEAD `2f1f6cc`.

## Execução

`node tools/testing/rabbitmq-real.cjs --queues-gate` compilou o adapter
de produção e rodou em macOS arm64 com as imagens oficiais de RabbitMQ
4.4.0 e 4.3.6 fixadas por digest no harness. Os brokers eram nós únicos
com TLS, prefixo HTTP e usuários e filas sintéticos. Ambas as rodadas
terminaram com saída 1. Relatórios locais em
`out/queues-gate-5a-first-results.json` e `out/queues-gate-5a-results.json`.

| Versão | Primeira rodada | Diagnóstico repetido | Limpeza |
| --- | --- | --- | --- |
| 4.4.0 | 11 passaram, 2 falharam | 12 passaram, 1 falhou | Completa |
| 4.3.6 | 11 passaram, 2 falharam | 12 passaram, 1 falhou | Completa |

Nos vhosts exercitados fora da colisão, passaram paginação real com 107
filas no vhost `/` (100 + 7), busca literal e vazia, página fora da faixa,
isolamento de homônimos, classic/quorum/stream, negativas de acesso e
projeção de consumidor sintético. O fixture HTTPS também verificou prefixo,
codificação, rejeição de `.` e `..` antes da rede, rejeição de resposta de
outro vhost, limite de corpo e cancelamento. Ao terminar, o broker registrou
os objetos de fixture esperados e zero conexões, canais e consumidores.
Os recursos próprios foram removidos. Docker por label confirmou zero
containers e redes restantes.

A primeira rodada também falhou em uma asserção de contagens sempre
presentes. O contrato já admite ausência. Na repetição, classic, quorum e
stream vazias retornaram `consumer_details: []` sem as quatro métricas
opcionais do detalhe. A fixture HTTPS demonstrou que o adapter distingue
campos ausentes, zero explícito e lista vazia. O teste real com consumidor
ativo confirmou tag, atividade e confirmação, dentro da projeção.

## Colisão do vhost `detailed`

As duas versões registram `/queues/detailed` como rota global antes da
rota parametrizada `/queues/:vhost`. No broker, tanto `detailed` literal
quanto `d%65tailed` deram HTTP 200, total 111 e cinco resultados distribuídos
em cinco vhosts após a busca por um nome compartilhado. O detalhe
individual retornou o nome e vhost exatos. A validação do adapter recusou
o envelope da lista global, pois as linhas cruzavam o vhost solicitado.
[Dispatcher 4.4.0](https://github.com/rabbitmq/rabbitmq-server/blob/v4.4.0/deps/rabbitmq_management/src/rabbit_mgmt_dispatcher.erl#L142-L145),
[dispatcher 4.3.6](https://github.com/rabbitmq/rabbitmq-server/blob/v4.3.6/deps/rabbitmq_management/src/rabbit_mgmt_dispatcher.erl#L142-L145)
e [referência da rota global](https://www.rabbitmq.com/docs/http-api-reference#get-apiqueuesdetailed).

A revisão proposta no roadmap é tratar o vhost de nome exato `detailed`
como indisponível para listagem em Filas e interromper essa leitura antes
do I/O, com diagnóstico específico. A sessão pode continuar usando esse
vhost. A consulta global não atende ao contrato de escopo, custo e paginação
do vhost. A implementação da revisão e a integração IPC/UI/guia dependem
do aceite e de um gate revisado aprovado.

Separadamente, `npm run check` passou com 274 testes em 37 arquivos e
seis testes Node do patch, além de tipagem, lint, formatação e sincronização
do guia. Na primeira execução do check, o lint detectou uma referência a
`URLSearchParams` sem import explícito no harness. A execução completa
passou após importar a API do Node. A 5A ainda aguarda teste de pacote.
Os brokers isolados verificam o recorte observado nas duas versões de
referência. Compatibilidade de cluster,
outros SOs/CPUs, escala de produção e disponibilidade de todas as métricas
seguem pendentes.

## Revisão aprovada e gate repetido em 2026-11-19

“Aprovo” aceitou recusar a listagem no vhost de nome exato `detailed`
antes da requisição. A primeira execução revisada teve 10 aprovações e
quatro falhas por versão. Uma edição havia alterado involuntariamente
a fórmula de tamanho esperado das páginas. Após restaurá-la, o gate
passou 14 verificações em cada versão. A rodada após integrar o adapter
ao produto repetiu o mesmo resultado.

| RabbitMQ oficial arm64 | Verificações revisadas | Limpeza |
| --- | --- | --- |
| 4.4.0 | 14 aprovadas | Completa |
| 4.3.6 | 14 aprovadas | Completa |

O fixture HTTPS contou zero requisições para `detailed` e uma para o nome
distinto `Detailed`. O acesso direto de fixture ao detalhe em `detailed`
validou o par de identidades. Na tela, o detalhe é aberto pela linha da lista.
O gate manteve a paginação/busca do broker, a projeção de tipos e
consumidores, a negativa de acesso, as negativas de escopo, o limite de
corpo e o cancelamento. `out/queues-gate-revised-5a-results.json` registra
a rodada final e a limpeza. Docker confirmou zero containers ou redes
com o label do harness.

## Implementação e verificação do pacote

Em macOS 27.0.1 arm64, `npm run check` passou com 283 testes em 38
arquivos e seis testes Node, incluindo TLS e envelopes de filas inválidos,
IPC, preload, sessão, busca, detalhe, foco em DOM e cancelamento. O check
incluiu verificação do patch, typecheck, lint, formatação e docs:check.
Guia e Ajuda têm 16 tópicos e 12 campos de perfil.

`npm run package` passou. ASAR com 1.031.108 bytes, 15 entradas e SHA-256
`af88164c209707411fe19276d9c37c9ba6c316b8571555a3456a4a4490d3bbbd`.
Foram conferidos os dois métodos de filas, a guarda de rota, a Ajuda
empacotada, as licenças dos bundles, o único import externo do preload
(`electron`) e a ausência de fixtures e chaves. Perfis, HTTPS e AMQPS
passaram no ASAR final. As duas primeiras execuções de HTTPS e AMQPS
chegaram a asserções antigas de navegação que esperavam Filas desabilitada.
Os testes foram alinhados ao destino entregue e repetidos.

A sessão gráfica do macOS estava bloqueada. O smoke base atingiu o
prazo na transição para tela cheia. A tentativa de smoke de Filas
atingiu o prazo ao ativar a sessão e uma repetição confirmou que a
janela não recebia foco nativo. Ficaram pendentes nessa rodada o smoke base,
Sessão, Management, transição de vhost, Filas, capturas dos dois temas a
200% e a matriz `--queues-matrix` com o pacote final. O foco em DOM e
o gate real do adapter cobrem recortes distintos dessas verificações.

Cluster/HA, carga de produção, outros SOs/CPUs, assistivas, revisão
manual dos diálogos nativos, providers e releases continuam pendentes.

## Retomada e matriz final no executável

Com a sessão gráfica ativa, o mesmo ASAR passou os oito smokes
sequenciais: base (incluindo Ajuda e segurança), Perfis, HTTPS, AMQPS,
Sessão (10 grupos), Management (oito), troca de vhost (seis) e Filas
(seis). Os três smokes já concluídos no ASAR final tinham sido executados
antes da retomada. O smoke de Filas comprovou navegação por teclado,
paginação, busca literal, filtro local, foco e retorno do detalhe,
projeção de dados parciais, permissão negada, indicação de desatualização
e encerramento da requisição ao fechar detalhe ou navegar. As quatro
capturas nativas `out/queues-5a-{detail-,}{dark,light}-zoom.png` foram
revisadas, incluindo foco visível, contexto e rolagem restrita à tabela.

O primeiro smoke de Filas após desbloqueio e a primeira matriz
empacotada atingiram o prazo ao voltar a Conexões. O cenário precisava
selecionar novamente o perfil antes de usar os controles. A primeira
matriz completou 18 verificações em 4.4.0 e limpou os recursos. A correção
ficou nos harnesses, e a repetição usou o mesmo ASAR. O smoke passou
e o check final repetiu 283 testes em 38 arquivos e seis testes Node.

`node tools/testing/rabbitmq-real.cjs --queues-matrix` passou no pacote
final macOS 27.0.1 arm64 com as imagens oficiais de nó único por digest.

| RabbitMQ | Verificações no executável | Limpeza |
| --- | --- | --- |
| 4.4.0 | 35 aprovadas | Completa |
| 4.3.6 | 35 aprovadas | Completa |

A matriz confirmou 107 filas em páginas de 100 e sete, busca literal,
detalhe exato, homônimos com argumentos distintos após seleção temporária,
rejeição da geração antiga, listagem bloqueada em `detailed` e acesso
indisponível para usuário sem tag do Management. A fixture do smoke
confirmou também a projeção do erro explícito de permissão no executável.
Os dados das filas provisionadas ficaram idênticos, com zero canais
criados, consumidores e conexões retidas. Os relatórios registram
`out/rabbitmq-real-5a-results.json` e os resultados por versão. Docker
confirmou zero containers ou redes do harness ao final.

Em 2026-11-19, “Aprovo a conclusao da 5A” aceitou a conclusão da entrega
apresentada. Os 42 arquivos revisados e o SHA-256 do ASAR foram conferidos
antes da sincronização documental. “Autorizado, pode prosseguir” aceitou
o registro local `feat(queues): add scoped queue reads`, com pai `2f1f6cc`.
Permanecem os limites de plataforma, topologia e homologação registrados
acima, incluindo builds e execução ainda pendentes no Windows e no Linux.
