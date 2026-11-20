# Evidências 6A — leitura de exchanges e bindings

Data: 2026-11-20. Base `013c899`, branch `main`, com as mudanças autorizadas
da 6A na árvore de trabalho. macOS 27.0.1 arm64 e Docker Engine 29.8.0 arm64.
FR-012, leitura de FR-014 e parte de MVP-E01. O escopo usa HTTPS Management
e fixtures próprias.

## Gate do adapter

`node tools/testing/rabbitmq-real.cjs --exchanges-gate` passou 11 verificações
em cada RabbitMQ 4.4.0 e 4.3.6. O harness compilou o adapter de produção para
diretório temporário e subiu um broker isolado por vez. As imagens oficiais
foram verificadas pelo digest fixado no harness.

Foram exercitados paginação real e contagens, busca literal e vazio, página
fora da faixa, vhosts e nomes especiais, a exchange padrão, reservados,
internos, bindings nas duas direções, a identidade que distingue routing
keys iguais, o limite de 200 vínculos e a recusa da lista de 201. O gate
verificou acesso negado, TLS inválido, cancelamento, inventário inalterado e
zero conexões ou canais de produto. Os dois relatórios registraram limpeza
integral de contêiner, rede, certificados e dados locais.

## Integração em andamento

O package macOS arm64 passou. O primeiro smoke da 6A passou quatro grupos
no executável. A primeira captura do Playwright registrou somente a parte
superior da janela em zoom 200%. O harness passou a usar captura do
BrowserWindow com rolagem até a ação com foco.

Na primeira matriz, as leituras de exchanges e o descarte de geração antiga
passaram em 4.4.0. A regressão de seleção de vhost procurou o catálogo depois
de o fluxo novo já ter consumido a seleção. O harness foi ajustado para
recarregar o catálogo nesse ponto. O broker da rodada parcial foi removido.
Outra rodada encontrou instabilidade de foco ao selecionar um vhost. O
harness passou a enviar a ação diretamente ao botão de destino e a informar
o vhost vigente no diagnóstico. Os resultados parciais registraram limpeza.
Na revisão visual, o resultado ganhou um título visível com a direção dos
bindings. A confirmação final usa o pacote com esse ajuste.

No pacote revisado, o smoke de Exchanges passou quatro grupos. Na
primeira rodada da matriz desse pacote, a busca após a troca de vhost
não chegou ao resultado esperado. O harness passou a confirmar janela
ativa e contexto do renderer antes da busca. Os smokes base, HTTPS e
AMQPS tinham um teste que esperava a entrada Exchanges desabilitada.
A cobertura foi atualizada para o estado disponível. Os testes de sessão
e purge também tiveram retomada de foco ajustada no harness.

## Verificações do pacote final

`npm run check` passou 308 testes em 40 arquivos e seis testes Node do
patch, além de typecheck, lint, formatação e sincronização Guia/Ajuda.
`npm run package` passou para macOS 27.0.1 arm64, Electron 45.1.0 e
Node embarcado 24.22.1. O ASAR tem 1.081.631 bytes e SHA-256
`92bc68c328ced16e3b75508e15e1b26d44a88aaf801bd19a0af16ca46c3a22b6`.

Passaram 11 smokes sequenciais no mesmo ASAR. Base com segurança e Ajuda,
perfis, HTTPS, AMQPS, sessão, administração, troca de vhost, filas,
declaração de fila, purge e Exchanges. O smoke de Exchanges confirmou
carregamento explícito, detalhe padrão com zero consultas de bindings,
dados textuais escapados, retorno de foco, cancelamento e descarte da
leitura pendente ao sair da tela. Os temas claro e escuro foram revisados
com zoom 200% e foco visível. A Ajuda empacotada apresentou 19 tópicos.

Capturas locais em `out/exchanges-6a-light-zoom.png` e
`out/exchanges-6a-dark-zoom.png`.

## Matriz RabbitMQ do pacote final

`node tools/testing/rabbitmq-real.cjs --exchanges-matrix` passou 35
verificações em cada versão. Os cenários da 6A comprovaram busca literal,
detalhe, argumentos, entrada e saída, homônimos isolados no vhost `/` e nas
seleções temporárias `detailed` e `literal%2F`, resposta descartada após a
troca de geração e perfil salvo preservado. O inventário de filas, exchanges
e bindings permaneceu igual. O contador de canais criados pelo broker ficou
em zero, e o renderer permaneceu na origem local. Os relatórios confirmaram a
limpeza de ambos os ambientes.

| RabbitMQ | Gate do adapter | Verificações no executável | Limpeza |
| --- | ---: | ---: | --- |
| 4.4.0 | 11 | 35 | Completa |
| 4.3.6 | 11 | 35 | Completa |

Relatórios locais em `out/exchanges-gate-6a-results.json`,
`out/exchanges-6a-smoke-results.json` e `out/rabbitmq-real-6a-results.json`.

## Limites

Verificações nativas realizadas em macOS arm64. Windows, Linux, macOS x64,
tecnologias assistivas e releases permanecem pendentes. Os brokers eram de
nó único. FR-013, escrita de FR-014, FR-010 e homologação de cluster/HA
continuam pendentes.

## Aceite da entrega

Em 2026-11-20, “Aprovo” aceitou a conclusão da 6A e o registro local.
Os hashes dos 45 arquivos e do ASAR conferiram com a revisão apresentada.
Os resultados funcionais acima correspondem ao pacote aprovado.
