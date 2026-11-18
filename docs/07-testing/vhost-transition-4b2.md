# 4B.2 — Evidências do gate de transição de vhost

Data local 2026-11-17 (America/Bahia). O gate inicial reprovou B2-01, B2-04
e o limite de B2-D07. O gate revisado passou após o aceite do fechamento
confirmado como condição para abrir o vhost substituto.

## Ambiente e execução

Executado em macOS arm64, Node 24.22.1, Docker Engine 29.8.0 e amqplib 2.2.0
com o patch verificado da ADR-0008. O modo `--vhost-gate` de
`tools/testing/rabbitmq-real.cjs` compilou os adapters existentes em diretórios
temporários e provisionou RabbitMQ 4.4.0 e 4.3.6 oficiais arm64, por digest,
com TLS e portas loopback. Usou o parser AMQPS atual com o nome codificado na
URL sintética. O override estruturado, o catálogo e o serviço de transição
propostos ainda não fazem parte do produto.

O harness partiu de uma conexão em `/`, interrompeu o tráfego nos dois
sentidos por um relay TCP e manteve o socket do lado do broker. O adaptador
atingiu o limite de fechamento e destruiu o socket local. O harness confirmou
que o relay mantinha só o socket remoto antes de abrir `equipe/pedidos` no
mesmo destino. A nova conexão recebeu `open-ok`.

A primeira rodada consultou a Management API. Após 2.803 ms (4.4.0) e 2.809 ms
(4.3.6), o snapshot ainda listava apenas `/`. Isso confirmou que a conexão
antiga sobrevivia ao encerramento local, mas não mediu a sobreposição. A segunda
rodada consultou o registro de conexões via `rabbitmqctl list_connections`
dentro do container identificado pelo harness. Essa leitura é exclusiva do
teste.

| RabbitMQ    | Depois do encerramento local | Depois do novo open-ok             | Canais | Resultado                   |
| ----------- | ---------------------------- | ---------------------------------- | ------ | --------------------------- |
| 4.4.0 arm64 | `/`                          | `/` e `equipe/pedidos` em 1.989 ms | 0      | 4 grupos passaram, 1 falhou |
| 4.3.6 arm64 | `/`                          | `/` e `equipe/pedidos` em 2.400 ms | 0      | 4 grupos passaram, 1 falhou |

Os tempos são observações a partir do pedido de fechamento, incluindo abrir
o novo vhost e consultar o registro. Em ambas as versões passaram TLS e versão
fixada, fechamento confirmado com preservação exata de `/`, barra interna,
espaço/Unicode, escape literal, `.` e `..`, e recusa AMQP de um vhost
visível ao usuário monitoring. A limpeza removeu os recursos próprios e
confirmou zero conexões, canais, filas e consumidores. Containers e redes
do harness foram removidos. Resultado local por versão e agregado em
`out/vhost-gate-4b2*-results.json`. A matriz terminou com código 1.

Na regressão, `npm run check` passou com 266 testes em 36 arquivos, seis testes
Node do patch e guia/Ajuda sincronizados. O harness compartilhado também passou
o gate A da 4B.1 novamente, com 12 verificações por versão. Não houve package
ou smoke da 4B.2.

## Decisão revisada

Destruir o socket local após um fechamento sem confirmação não comprova que
o broker retirou a conexão anterior. A sequência autorizada abre a substituta
em até 15 s após até 1 s de fechamento e exige que o broker nunca tenha duas
conexões da transição. A observação reproduzida contraria esse requisito.

Alternativa apresentada para aceite. Quando existir conexão anterior, abrir
o vhost novo apenas após confirmação do fechamento. Se o estado remoto for
incerto, interromper a troca, informar o motivo e bloquear abertura automática
pela transição. O gate revisto também deve cobrir uma tentativa anterior cujo
resultado de abertura seja desconhecido. HTTPS continua sujeito às regras de
sessão já aprovadas. Isso troca a disponibilidade imediata pela exigência de
não sobrepor conexões durante a troca.

Outra alternativa é limitar a garantia a uma conexão local de trabalho e
assumir expressamente que o broker pode conservar a conexão anterior por algum
tempo. Isso permite prosseguir após a destruição local, mas altera B2-D03,
B2-D07 e B2-04. Ambas as alternativas exigem aceite e gate revisto.

Catálogo, IPC, sequência de sessão, lifecycle completo, perfil, interface,
guia e pacote da 4B.2 foram reservados para a etapa de verificação integrada.

“Sim” aceitou a alternativa recomendada. O modo `--vhost-gate-revised` passou
seis grupos por versão, 12 no total, usando o mesmo guard e argumento estruturado
do produto. Foram verificados nomes exatos, fechamento confirmado, recusa de
vhost visível, bloqueio com o socket do broker ainda aberto e suspensão da
troca diante de abertura anterior de resultado incerto. O último cenário
contém um broker que aceitou a conexão e um handle retido no harness para
simular o serviço ainda sem resultado. Ambos os brokers foram limpos.

O gate revisado habilitou a integração. Catálogo, IPC, sessão e UI receberam
verificação separada. `npm run check` passou com 274 testes em 37 arquivos e
seis testes Node do patch. A cobertura inclui expiração e autoridade do
catálogo, rejeição de nomes/URLs fora do contrato, recusa AMQP, lifecycle,
validação de revisão, teclado e foco.

## Pacote final

`npm run package` e sete smokes sequenciais passaram no mesmo pacote macOS
arm64, com Electron 45.1.0 e Node 24.22.1. A rodada incluiu base/Ajuda/segurança,
perfis, HTTPS, AMQPS, sessão, leitura administrativa e seleção de vhost
(`node tools/testing/management.cjs --vhost-transition`). O smoke novo passou
seis grupos, incluindo foco após seleção via Enter, aviso antes da ação, tema
escuro e tema claro a 200%, ausência de confirmação no peer de teste, perfil
byte a byte e retorno ao vhost salvo após reativação. Ajuda e Markdown têm
15 tópicos e 12 campos.

ASAR com 1.007.027 bytes, 15 entradas e SHA-256
`7b3600ede554e34851ef9b3ff6982542eabbb522281abcff9d3e1526d28b21e6`.
A revisão confirmou `selectSessionVhost`, rejeição de estado remoto incerto,
licenças, ausência de fixtures, chaves e testes e somente `electron` como
dependência externa do preload.

Na primeira matriz desse ASAR, 4.4.0 passou 32 checks. A 4.3.6 passou a troca
e 20 checks, mas atingiu o prazo ao aguardar novo polling HTTPS depois de
restaurar a janela. Uma repetição registrou a sessão pausada antes de abrir os
transportes. O harness então passou a restaurar/exibir a janela antes de
pedir foco ao aplicativo, à janela e ao seu conteúdo. Os recursos próprios
foram limpos nas duas tentativas.

A matriz completa repetida nesse ASAR passou **64 verificações reais**, 32
por versão, com limpeza. O executável abriu o nome literal `literal%2F`,
preservou o perfil byte a byte e retomou o vhost salvo em nova ativação. Sob
partição durante o fechamento, manteve HTTPS disponível e não fez nova
tentativa AMQPS. Ambas as versões terminaram sem conexões, canais, filas
ou consumidores. Relatórios locais em `out/rabbitmq-real-4b2-results.json` e
arquivos por versão. Testes com macOS arm64 e RabbitMQ de nó único. Demais
SO/CPU, HA, navegação assistiva/manual, provider e release seguem sem homologação.

## Aceite da conclusão

Em 2026-11-18, “Aprovado” aceitou os resultados apresentados e autorizou o
commit `feat(connections): switch vhosts after confirmed close`. O ASAR
conferiu com o hash da apresentação. Os resultados funcionais acima são da
execução de 2026-11-17 em America/Bahia. O registro do aceite teve verificação
documental.
