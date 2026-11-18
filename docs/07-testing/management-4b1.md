# Evidências — 4B.1: gate de contexto administrativo

Data: 2026-10-30. Status: **concluída/aprovada em 2026-10-31; entrega registrada neste commit**.
Contrato 4B.1 autorizado por “Autorizado”. O gate original reprovou e interrompeu
dependentes; esse histórico está preservado abaixo. A resposta posterior
“Autorizado” aceitou A da [ADR-0009](../03-architecture/adr/0009-management-vhost-read-contract.md)
e retomada condicional, aplicada somente após gate revisado passar.

## Ambiente e execução

macOS arm64; Node 24.22.1/npm 11.19.1; Docker Engine 29.8.0 aarch64. Dois brokers
reais de nó único, TLS verificado com CA sintética e portas publicadas só em loopback:

| RabbitMQ | Digest oficial arm64 utilizado |
| --- | --- |
| 4.4.0 | rabbitmq@sha256:af6f50d38098d8bd52fef7f3fa85015dd8b2bf6def58e995bf584ae9ba0f6407 |
| 4.3.6 | rabbitmq@sha256:54cb013d76cd1fd6c0a0708f34062ad61c452bb6f016b434c6c33f1a765d2b58 |

Comando: `node tools/testing/rabbitmq-real.cjs --management-gate`.
Esse modo reaproveita o provisionamento isolado existente e termina antes de
lançar Electron. Cria 117 vhosts e usuários management, monitoring, administrator
e sem tag. Senhas aleatórias só em memória, hashes nas definições temporárias;
nenhum broker arbitrário, usuário real ou serviço externo aceita operações.

Cada leitura diagnóstica tem limite de 256 KiB/16 KiB headers/10 s; não segue
redirect nem desabilita TLS. Somente dados sintéticos entram nos relatórios:
rota permitida, usuário de fixture, status, bytes e shape/chaves da resposta.
Metadados de autenticação/cabeçalhos/senhas não são registrados.

## Resultados do gate original (histórico)

| Verificação do contrato original | 4.4.0 | 4.3.6 |
| --- | --- | --- |
| Versão exata do broker e prontidão TLS | Passou | Passou |
| Overview com as duas versões projetadas | Passou | Passou |
| Páginas 1/2 e projeção de vhosts | Reprovou, HTTP 500 | Reprovou, HTTP 500 |
| União das páginas / ausência do vhost sem acesso | Não demonstrada, falha dependente | Não demonstrada, falha dependente |
| Monitoring com envelope paginado | Reprovou, HTTP 500 | Reprovou, HTTP 500 |
| Usuário sem tag administrativa recusado | Passou, 401 | Passou, 401 |
| Vhost individual para management | Reprovou hipótese de leitura, 401 | Reprovou hipótese de leitura, 401 |
| Nome individual `.` / `..` codificado | Lista 200 / redirect 301 | Lista 200 / redirect 301 |
| Recusa individual presumida como 403/404 | Divergiu: 401 por tag | Divergiu: 401 por tag |
| Zero canais/conexões/filas/consumidores | Passou | Passou |

O gate tem **15 cenários contabilizados por versão: quatro passaram e onze
falharam**, incluindo falhas dependentes, não onze causas distintas. Exit code 1.
A rodada final coletou **48 respostas diagnósticas por versão**, sem incluí-las como
checks aprovados. Rodadas anteriores confirmaram os mesmos quatro/onze; não somar
repetições como nova cobertura. Nenhum teste funcional de nova UI/IPC executado.

Diagnóstico adicional, nas duas versões:

- Variações de paginação sem columns e/ou disable_stats continuam em 500.
  Logs confirmam function_clause em rabbit_queue_type:inject_dqt ao processar
  `{filtered_count,116}`; logs incluem o handler de vhosts e o processo da requisição.
- Lista sem paginação, com columns=name/disable_stats, retorna 116 entradas para
  management (28994 bytes) e 117 para monitoring/administrator (29242 bytes),
  incluindo campos extras. Projeção solicitada não restringe essa resposta.
- Administrator lê corretamente os nomes `/`, `equipe/pedidos`, `literal%2F` e
  `área pedidos` pelo GET individual projetado. Management e monitoring recebem
  401 com motivo conhecido Not administrator user, apesar de senha válida.
  Portanto 401 não significa necessariamente senha incorreta.
- Para os três tipos de usuário, `.` cru/encoded termina na lista e `..` cru/encoded
  em redirect, sem seguir. Não há prova de leitura individual desses nomes por HTTP.

Essas observações fundamentam a proposta de uma lista completa limitada, mas não
homologam seu futuro adapter, limites de 200/201, UI, IPC ou execução no executável.
Não corrigir o broker do usuário ou elevar privilégios para fazer o gate passar.

## Regressões e revisão do harness

`npm run check` passou: **237 testes em 31 arquivos + seis testes Node do patch**,
typecheck, lint, formatação e docs:check. Os testes são da base existente; não
comprovam o gate novo. Uma execução anterior de check parou no lint: o bloco
adicional de diagnóstico foi inserido no escopo de startup, onde read não existia.
Movido ao escopo do gate, lint/suíte repetidos com sucesso; diagnóstico real também
repetido. Nenhuma modificação de comportamento do produto para contornar falhas.

O gate registra HTTP sem exigir JSON em respostas 500 vazias, preservando status
original; inicialmente elas apareciam apenas como JSON inválido. Mensagens de
asserção no relatório foram reduzidas à primeira linha para não duplicar arrays
inteiros de fixture. As asserções originais não foram relaxadas para aprovar o gate.

## Cleanup e artefatos

Ambas as versões: cleanup confirmado de container/rede/CA/keys/definições/userData
próprios no finally; sem Electron lançado. Imagens oficiais permanecem em cache.
Nenhum recurso alheio foi removido, e nenhum canal/publicação/consumo foi executado.

Relatórios locais ignorados, não incluídos no pacote ou Git:

- out/management-gate-4b1-results.json e relatórios por versão: resultado reprovado,
  respostas diagnósticas, identidade/digest e cleanup.
- out/management-gate-4b1-{versão}-broker.log: evidências dos processos de requisição;
  senhas redigidas antes de gravação.
- out/4b1-management-gate-final.log e out/4b1-gate-check.log: execução final e check.
- out/4b1-start-baseline.json: hashes de arquivos versionados antes deste incremento.

Produto, guia/Ajuda, manifesto/lock, assets, patch e pacote anterior preservados.
Não houve package/smokes/release novos ou instalação de dependências nesta etapa.
Outros SOs/CPUs, clusters/HA, UI/assistivas/nativos/providers/releases continuam sem
homologação adicional. Não atribuir CVE ou disponibilidade de correção upstream.

## Decisão apresentada após o gate original (histórico)

Aceitar ou ajustar a alternativa A da ADR-0009 antes de retomar dependentes.
A exige abandonar paginação neste recorte, limite completo 200 itens/256 KiB,
visibilidade do vhost atual derivada da lista e três novos métodos específicos
(25 total). Alternativas B/C estão documentadas. Nenhuma decisão proposta é Accepted.

## Gate A aprovado — recorte revisado

Comando: `node tools/testing/rabbitmq-real.cjs --management-gate-a`.
Compila o adapter real src/main/management/httpsRead.ts com Webpack/ts-loader já
instalados em diretório temporário, removido após ambas as versões; sem UI/Electron.
Provisão possui 201 vhosts: management pode visualizar 200, monitor vê 201 e tem
resposta recusada integralmente. Depois o harness remove somente seu page-193;
monitor recebe 200 e vê negado, sem permissão AMQP nesse vhost.

**12 verificações por versão (24 total), aprovadas**, com os dois mesmos digests
oficiais: readiness/versionamento exato, overview, nomes completos/especiais/200,
201 recusados, nome não listado, sem tag negado, monitor/200, prefixo/allowlist,
limite de corpo em streaming, compressão recusada, cancelamento e zero recursos
AMQP/filas/consumidores. Limites/compressão/cancelamento usam fixture Node TLS
adversarial no mesmo adapter, separados das respostas RabbitMQ reais.

Primeira rodada de A usou por engano a contagem antiga de 117; corrigida para 201.
Outra rodada chegou ao cleanup do servidor TLS antes de todos os eventos close;
passou a aguardar close de cada socket e repetiu o gate com sucesso. Nenhuma
asserção removida. Gate original com paginação continua reprovado, não substituído
por aprovação fictícia. Relatórios A em out/management-gate-A-4b1-results.json.

Após esse resultado, retomada de serviço/IPC/UI autorizada pelo item 8 da ADR.
Ponte 25 métodos, dois GETs fixos; guide/Ajuda 15 tópicos, sem campo novo de formulário.
Check integrado inicial passou 265 testes/36 arquivos + seis Node; produto em
validação no executável. Sem nova dependência ou alteração do patch ADR-0008.

## Revisão inicial do executável

Primeiro smoke administrativo revelou foco restaurado antes do botão reabilitar;
layout effect após commit React corrigiu o comportamento. Check/package repetidos
e oito grupos do smoke passaram. As primeiras capturas chamadas dark/zoom foram
insuficientes: tema não selecionado e layout de zoom ainda não estabilizado.
Harness passou a selecionar tema explicitamente, esperar viewport e capturar
zoom nativamente. Navegação também recebeu texto específico para os recursos
indisponíveis; a nova consulta não pode coexistir com a alegação de nenhum recurso
do broker disponível. Registros anteriores não são evidências do pacote final.

Smoke base inicial parou na espera de resize com tamanho nativo correto. Foi
acrescentado foco nativo e diagnóstico de viewport, mantendo asserções exatas;
verificações finais em andamento. Não declarar pacote/smokes/matriz final antes
que terminem. Nenhuma alteração de segurança ou bypass para fazer teste passar.

## Pacote final — resultados definitivos

O pacote final inclui recusa de enums não string sem coerção, no parser main e na
guarda de resposta. Teste negativo cobre valores boxed/coercíveis e ausência de
execução de toString. **npm run check passou 266 testes/36 arquivos + seis Node**,
com typecheck/lint/formatação/docs:check. Teste de guarda refinado para isolar o
campo matrix sem propriedades extras foi repetido: três testes do alvo passaram.

`npm run package` passou em macOS arm64. ASAR final:
**cdaecf532c9e14e01c3ca894aa9cd705f6784d7a04201837096c9592e3b29862**,
**999017 bytes**, 15 entradas. Inspeção confirmou guard de enum no main minificado,
três operações administrativas/25 métodos, preload require somente electron,
patch ADR-0008 e licença MIT/proveniência. Sem fixtures/testes/tools/PEM/keys no pacote.
O ASAR anterior 5cac9e.../998978 bytes tem resultados intermediários próprios.

Os **seis smokes sequenciais do pacote final passaram**:

| Comando | Resultado |
| --- | --- |
| node tools/testing/management.cjs | Oito grupos: versões/lista/foco, negação/stale, 201, cancelar, background, navegação/Ajuda e ausência de escrita/exposição/rede renderer |
| npm run smoke:package | Base/UI/segurança, 25 métodos, Help offline com 15 tópicos, temas/contraste, foco/atalhos, native IPC, compact/zoom, URL fixa e duas reaberturas |
| node tools/testing/profiles.cjs | CRUD/revisão/memória/backup e proteção fechada; sem senha em disco/DTO |
| node tools/testing/https.cjs | TLS/CA/recusas/redirect/cancelamento/deadline e invalidação/cleanup |
| node tools/testing/amqps.cjs | Abertura/vhost/fechamento, cancelamento/prazo, reload/quit e memória, sem canal ou sessão do probe |
| node tools/testing/sessions.cjs | Dez grupos: sessão/heartbeat/HTTPS, recuperação, background/suspend, frames precoces/blocked, invalidação/foco/reload/quit e cleanup |

Capturas dark/light/zoom 200% revistas; produção com símbolo/texto, nomes e estados
legíveis, sem overflow horizontal global. Zoom estabilizado e captura nativa,
com scroll do conteúdo para controles abaixo da dobra; isso não homologa leitores
de tela, navegação nativa manual ou WCAG integral.

A matriz real do pacote final passou **60 verificações: 30 em cada 4.4.0/4.3.6**,
com cleanup completo. Novos checks exercitam versões/listagem pelo painel do
executável e preservação de sessão/permissões, além das regressões TLS/AMQPS/vhosts,
heartbeats/cortes/recuperação/encerramento. Zero canais, filas, consumidores e
conexões restantes; container/rede/relay/temp próprios removidos. Nenhum broker
externo tocado. A matriz intermediária de 60 checks permanece separada.
Logs finais em out/4b1-final-*.log; out/4b1-artifact.json identifica o pacote e
out/rabbitmq-real-4b1-results.json contém os dois relatórios. Guias/Ajuda 15 tópicos/
12 campos/descritivos de perfil. Sem commit/push; conclusão depende de aprovação do proprietário.

## Critérios B1 revisados pela ADR-0009 A

| Critério | Evidência |
| --- | --- |
| B1-01 | Gate A passou 12 checks por versão real; falha paginada original preservada |
| B1-02 | Apenas overview e vhosts fixos; teste TLS e revisão de código/ASAR, sem GET individual ou nome fornecido pelo renderer |
| B1-03 | Serviço/transport tests, contador sem auto consulta no smoke, busy/cancel e deadline desde fila/revisão |
| B1-04 | Status/formatos/TLS/limites/UTF-8/depth/versionamento desconhecido e mensagens sanitizadas testados |
| B1-05 | Lista completa exata, 200 aceitos/201 recusados, metadados descartados, sem paginação ou truncamento |
| B1-06 | Owner/revisão/geração/lifecycle/stale nas unidades e smokes de navegação/background/reload/quit |
| B1-07 | Guardas main/preload, origem/frame testados, 25 métodos no smoke de segurança, sem invoke genérico |
| B1-08 | Painel datado, foco após botão habilitar, produção, dark/light/zoom; visibilidade distinta de autorização |
| B1-09 | Check/package/seis smokes e matriz final de 60 checks aprovados |
| B1-10 | Guia/README/Ajuda e documentos operacionais sincronizados; conclusão/commit aguardam proprietário |

Limitações mantidas: somente macOS arm64 e dois brokers de nó único; sem homologação
Windows/Linux/outros CPUs, cluster/HA, suspensão física (smoke powerMonitor é
simulado), tecnologias assistivas/nativos manuais, providers reais de segredo ou
release/assinatura/updater. Limite local não garante custo do broker; ambientes
acima de 200/256 KiB recebem recusa integral. Não há seleção de vhost, CRUD ou
publicação/consumo, nem permissão universal inferida de versão/tag.

## Revisão de encerramento

Fonte/ASAR/guia/fronteiras revisados, sem nova dependência/schema ou alteração do
patch ADR-0008, assets, licença ou barra nativa do proprietário. Operações atuais
limitadas a leitura, sem seleção de vhost; M01/M06 permanecem parciais. Esta entrega
não é release ou homologação dos demais alvos. Próxima ação: solicitar aprovação
de conclusão e do commit feat(management): add bounded broker information and vhost reads.

Conferência final: 44 Markdown/361 links relativos sem alvo ausente, whitespace e
docs:check aprovados. 46 arquivos revisados; 175 baseline fora do recorte sem drift.
Index vazio/HEAD aba792d, Docker sem recurso de teste por label e nenhum processo
do harness restante. Artefato mantém hash final conferido. Sem commit/push.

## Aceite de conclusão — 2026-10-31

“Autorizado” aprovou a conclusão apresentada e o commit
feat(management): add bounded broker information and vhost reads. Os 46 arquivos e
ASAR foram conferidos com a revisão final antes de sincronizar somente o aceite.
Testes/resultados/limitações anteriores mantidos, sem nova execução funcional,
produto/guia alterados, push ou etapa seguinte. Registro acompanha o commit de entrega.
