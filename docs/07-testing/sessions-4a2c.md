# Etapa 4A.2C — sessão AMQPS e ADR-0008 A

Data: 2026-10-30. Execução autorizada por “Autorizado” ao contrato/C-01–07.
Base ea116de, branch chore/modernization-app. Cinco documentos da preparação
preservados e hashes conferidos antes do início. Sem commit/push desta etapa.

**Resultado inicial (histórico): gate reprovado; dependentes interrompidos naquele bloco.**
O contrato exige parar e apresentar alternativa se APIs públicas não permitirem
comportamento seguro. A [decisão 0008](../03-architecture/adr/0008-amqp-lifecycle-safety.md)
era Proposed nesse bloco; a autorização e os resultados posteriores estão abaixo.

## Estado vigente após autorização de A

O proprietário autorizou aplicar/testar A da ADR-0008; Accepted. Aplicador com
hashes exatos/versão/hunk único, hooks de instalação/verificação/build e seis testes
Node passaram. Instalação limpa isolada prova recusa com scripts ignorados e
aplicação/verificação normal, lock idêntico e cleanup. Nenhum pacote novo.

Gate ampliado passou **30 cenários**, zero saídas anormais/canais/sockets e término
limitado por cenário; ambos modelos em Node e Electron Node. Original reprovado
permanece como evidência histórica abaixo. Os relatórios atuais substituem o JSON
de gate; log original preservado em out/4a2c-lifecycle-gate.log.

Pacote intermediário A/adapter de 18 métodos passou quatro smokes e 40 checks reais,
com artifact separado out/4a2c-a-artifact.json. Integração posterior de sessão/22
métodos/guia passou a verificação completa registrada ao final: 237 testes + seis
Node, cinco smokes e 54 checks reais. Sem aprovação de conclusão/commit/push.

## Registro histórico — gate original, anterior à aprovação de A

## Reprodução

tools/testing/amqps-lifecycle.cjs usa TLS real e o peer AMQP roteirizado existente,
ampliado com eventos precoces/tardios e heartbeat. Não é RabbitMQ real. Cada cliente
roda em processo filho descartável, com socket próprio e apenas connect/eventos/close
públicos; não captura uncaughtException nem importa ou altera internals da biblioteca.
Senha sintética nunca vai ao relatório; nenhum broker/perfil/credencial do usuário.

~~~bash
node tools/testing/amqps-lifecycle.cjs
~~~

Na versão original 2.2.0, o comando **retorna 1** porque o gate falha. JSON e log
locais em out: 4a2c-lifecycle-gate.json e 4a2c-lifecycle-gate.log.
Isso não é gate aprovado e é independente de npm run check, que não inclui
este experimento manual.

Runtime Node do tooling: **24.22.1**. Electron instalado: **45.1.0**, com Node
**24.22.1**, confirmado por execução. Os dois casos fatais também foram reproduzidos
no binário Electron em modo Node (ELECTRON_RUN_AS_NODE); não equivalem a um novo
smoke de GUI/pacote ou homologação de sessão. Host macOS arm64.

## Resultados efetivamente observados

Onze cenários, **seis processos com saída anormal (código 1)**:

| Cenário | API / runtime | Resultado |
| --- | --- | --- |
| Conexão mantida por 22 s com heartbeat | Callback / Node | Abriu, enviou/recebeu heartbeat, close confirmado e saída 0 |
| open-ok + blocked no mesmo registro TLS | Callback / Node | Evento blocked não chegou ao modelo; fechamento local não foi apresentado como confirmado |
| blocked/unblocked após entregar modelo | Callback / Node | Ambos eventos observados; close confirmado e saída 0 |
| open-ok + connection.close 403 | Callback / Node | Exceção antes do callback público, saída 1 |
| open-ok + connection.close 200 | Callback / Node | Socket fechou antes de promover abertura; saída 0, sem confirmação falsa |
| open-ok + frame connection.tune-ok inesperado | Callback / Node | Exceção antes do callback público, saída 1 |
| Sem heartbeat do servidor por 34 s | Callback / Node | Erro/fechamento observado; socket liberado, sem close confirmado |
| open-ok + connection.close 403 | Promise / Node | Exceção antes de disponibilizar modelo, saída 1 |
| open-ok + frame inesperado | Promise / Node | Exceção antes de disponibilizar modelo, saída 1 |
| open-ok + connection.close 403 | Callback / Electron Node | Exceção antes do callback público, saída 1 |
| open-ok + frame inesperado | Callback / Electron Node | Exceção antes do callback público, saída 1 |

Todas as onze tentativas deixaram **zero sockets da fixture e zero canais**;
processos filhos encerrados. Certificados temporários removidos no finally.
Nenhuma sessão de produto implementada, broker real iniciado ou package/smoke novo.

closeConfirmed da fixture significa que o peer enviou CloseOk. Somente o resultado
do cliente prova que ele o aguardou: no atalho blocked, o callback pode ser síncrono
antes da confirmação. Não confundir esses registros.

## Diagnóstico e alcance

Em lib/connection.js, succeed chama acceptLoop **antes** de openCallback. O loop
pode processar frames já recebidos enquanto o chamador ainda não tem o modelo
público para instalar listeners. Erro sem listener nesse intervalo pode lançar
exceção. Mudar para Promise não resolveu; ambos compartilham o caminho. Listener
no TCP próprio também não interceptou a exceção do parser.

Isso demonstra uma falha de lifecycle nas condições acima, não um advisory/CVE
consultado nem prova de exploração real. Potencial impacto no main/probe 4A.2B é
**inferência**: usa o mesmo cliente/caminho. Os testes normais/reais aprovados da
4A.2B continuam evidências de seu recorte; não incluíam os frames combinados do gate.

Registry por curl/HTTPS validado em 2026-10-30 retornou latest 2.2.0; navegador
falhou ao consultar esse endpoint. Código remoto main ainda tem a ordem relevante;
changelog não comprovou correção publicada. Nenhuma versão alternativa instalada.

## Ocorrências do harness

Lint recusou __filename não declarado; usado caminho a partir de __dirname, sem
flexibilizar lint. A primeira coleta confirmou exceções, mas tentou importar
package.json não exportado e não gravou JSON. Corrigida somente leitura de
metadados do manifesto instalado pelo filesystem. Caso sem heartbeat passou a
aguardar 34 s, pois 22 s não provavam dois intervalos sem tráfego no cliente fixado.
Nenhum timer interno da biblioteca alterado. A rodada final é a tabela acima.

## Próxima decisão e limites

ADR-0008 propõe patch local verificável por hashes para adiar o loop inicial até
o chamador instalar listeners. Diff e hashes candidatos preparados **somente como
proposta**, sem gravar/executar biblioteca modificada. Eficácia ainda não testada.
Até aceite, preservar produto/ponte de 18 métodos, guia/Ajuda, manifesto/lock e
biblioteca instalada. Não capturar erro global para continuar nem avançar UI.

Fontes: [connection v2.2.0](https://github.com/amqp-node/amqplib/blob/v2.2.0/lib/connection.js),
[Callback](https://github.com/amqp-node/amqplib/blob/v2.2.0/callback_api.js),
[Promise](https://github.com/amqp-node/amqplib/blob/v2.2.0/channel_api.js),
[API pública](https://amqp-node.github.io/amqplib/channel_api.html),
[registry](https://registry.npmjs.org/amqplib/latest).

## Regressões e preservação

npm run check passou após ampliar a fixture/harness: typecheck/lint, **216 testes
em 27 arquivos**, format:check e docs:check. O gate de onze cenários não integra essa
contagem e continua reprovado. Guia/Ajuda sem mudança de conteúdo: nenhuma nova
funcionalidade/formulário foi disponibilizada.

Código do produto, bridge de 18 métodos, manifesto/lock e amqplib instalado não
foram modificados. O ASAR anterior é preservado; não foi gerado artefato de sessão.
A decisão proposta não foi aplicada/testada para converter o gate em aprovado.

## Implementação verificada após A — composição e regressões

Ferramentas/produto: Node 24.22.1, npm 11.19.1, Electron 45.1.0/Node 24.22.1,
macOS arm64. Versões fixadas preservadas. Patch original/final SHA-256:

- Original: 0966aae8e582c2ec6e137cb8773deb28b962a287d28890c61504b83cee1d803b.
- Aplicado: e429dd17f333dcedf925c692c862bc3aa8a85cbed971396456d9df61d2a98de6.

Somente acceptLoop inicial passa a setImmediate. Sem handler global/import privado.
Aplicador idempotente exige versão/hash/hunk exatos, grava atomicamente e recusa
symlinks/conteúdo inesperado. Root postinstall aplica; precheck/prestart/prepackage
e build main verificam. Lock só acrescenta hasInstallScript da raiz, preservando
todos os pacotes/resoluções. Aviso/copyright/MIT original são incluídos no bundle
main via BannerPlugin e index.cjs.LICENSE.txt, com identificação da alteração.

### Instalação e gate corrigido

Seis testes Node do aplicador passaram (original/patch/idempotência, versão/hash/
artefato desconhecidos e symlink). tools/testing/patch-install.cjs passou em árvore
própria: npm ci --ignore-scripts mantém hash original e verify/build recusam; npm ci
normal aplica, verify/build/seis testes passam, lock permanece idêntico, cleanup
remove a árvore. Repetido após incorporar o aviso MIT. Nenhuma reinstalação do
workspace ou nova dependência. Relatório: out/4a2c-patch-install-results.json.

Gate ampliado passou 30 cenários em processos descartáveis, APIs Callback/Promise
em Node e Electron Node. Inclui frames precoces, blocked/unblocked, close dentro
do callback, abort antes de TLS/no callback/após loop, close sem ack, heartbeat
por 22 s e perda por 34 s. Nenhuma saída anormal; recursos/filhos limpos e prazos
por cenário verificados. Relatórios/logs em out/4a2c-lifecycle-gate.json e
4a2c-patched-lifecycle-final.log. O log original de seis crashes é preservado.

### Núcleo e fronteira

Suíte integrada: 237 testes/31 arquivos, mais seis testes Node do patch, typecheck,
lint, formatação e docs:check passaram. Relatório textual final em
out/4a2c-check-final.log. Testes próximos exercitam: ownership e lease de probes,
zero rede automática, orçamento de cinco retries, sucesso sem reset, TLS terminal,
pausa/suspend, perfil alterado, snapshot pendente, close durante revisão, blocked,
corte real do adapter e geração antiga/conexão entregue após disconnect.
IPC nega origem/frame/DTO, revalida pós-await e restringe eventos; preload valida
snapshot e provider assina antes de ler, rejeita sequence antiga e remove listener.

Smokes do executável (fixture TLS/AMQP roteirizada, não RabbitMQ) comprovaram:
22 s com heartbeats e polling, exclusão de probes, background com AMQP mantido,
suspend/resume, blocked e ausência de ack sem falso sucesso, frames precoces sem
crash, endpoints parciais, gravação/reload/close/quit e perda de senha ao sair.
Teclado/cancelamento e navegação sem perder contexto acrescentados à rodada final.
Host pode retirar foco nativo: harness restaura foco nos trechos de foreground,
registrando isso; o teste de background minimiza de verdade e não restaura até
a medição terminar. Isso não é homologação manual de teclado nativo/assistivas.

### Ocorrências corrigidas durante validação

- Tipo Promise do teste e referências globais/format: corrigidos sem relaxar regras.
- Seleção de tema encontrava controle do painel oculto; harness usa combobox visível.
- Capturas encontraram rótulos legados de ausência de sessão; corrigidos e repetidos.
- Primeira versão de cleanup verificava Set de sockets antes dos eventos close e
  interrompia a limpeza do segundo relay. Container/rede/temp já limpos; processo
  próprio restante identificado/encerrado. Cleanup usa allSettled e espera limitada
  de todos os relays antes de verificar; nenhuma interferência em recursos alheios.
- Management API registra conexão recuperada de forma assíncrona. Harness espera
  contagem exata em prazo limitado, mantendo prova de uma conexão/zero canais.
- Revisão final removeu texto residual de sessão futura, resetou flow desconhecido
  após queda/suspend e separou hora da falha HTTPS do último sucesso. Pacote final
  e suas regressões são distintos dos artefatos intermediários.

## Resultado final do pacote completo — pronto para revisão

Check final: **237 testes em 31 arquivos**, **seis testes Node** do patch,
typecheck/lint/formatação/docs:check aprovados. Package darwin-arm64 passou.
Cinco smokes sequenciais passaram no mesmo executável: base/Ajuda/segurança,
perfis, HTTPS, AMQPS e sessão. Guia/Ajuda: **14 tópicos e 12 campos do formulário**,
fonte única sincronizada, funções futuras continuam desabilitadas.

Matriz real final: **27 verificações por versão, 54 no total**, RabbitMQ 4.4.0 e
4.3.6 oficiais por digest já registrado no harness; ambos arm64/nó único. Inclui
as regressões de autenticação/vhosts/TLS/cancelamento/prazo e sessão mantida por
22 s, heartbeat negociado de 10 s, HTTP periódico, exclusão de probes, pausa de
8 s sem perder AMQP, cortes/restauração individuais e simultâneos, geração nova,
cota preservada, close confirmado e TLS terminal sem retry. Management API e logs
do broker confirmaram ausência de canais, filas, consumidores e conexões restantes.

Cada relatório final tem passed=true/cleanup=true. Container/rede/temporários
próprios removidos, relays encerrados e nenhum processo do harness restante;
conferido Docker por label. Images oficiais permanecem no cache local.
Electron executado: 45.1.0, Node 24.22.1, aplicativo 1.0.0. Não há publicação.

Relatórios locais:

- out/4a2c-check-final.log e 4a2c-session-package.log.
- out/sessions-4a2c-results.json: dez grupos, incluindo cancelamento por teclado,
  foco devolvido e navegação Ajuda/Conexões com sessão preservada.
- out/4a2c-final-base.log, -profiles.log, -https.log, -amqps.log e -rabbitmq.log.
- out/rabbitmq-real-4a2c-results.json e relatórios por versão; 27 checks cada.
- out/4a2c-final-artifact.json e capturas sessions-4a2c-dark/light/partial/zoom200.png.

### Artefato e revisão

ASAR: **03ac0e8c251a088ec4ff794db9f15e285d3689214c36d9caeb1f01616f44db25**, **975117 bytes**.
Inspeção confirmou o acceptLoop adiado no main, aviso MIT/copyright/proveniência,
failedAt no main/preload, preload com somente require electron e ausência de
fixtures/testes/PEM/chaves/ferramentas. A allowlist do smoke confirma 22 métodos.
Capturas de temas, estado parcial datado e zoom 200% revisadas; sem overflow global,
ambiente de produção identificado e foco visível. Esses resultados não são uma
homologação completa de acessibilidade.

### Rastreabilidade dos doze critérios

| Critério do contrato | Evidência executada |
| --- | --- |
| 1 — Ativação explícita, segredo e schema | Núcleo/IPC e smokes de perfil/sessão/real; sem conexão automática ou senha persistida |
| 2 — Sessão única/exclusão/geração | Lease, testes de ownership/geração antiga, API e UI no pacote; probes recusados no broker real |
| 3 — Heartbeat/zero canais/close | Gate 22 s/34 s, smoke 22 s, ambas versões reais, ack positivo e negativo sem confirmação falsa |
| 4 — Endpoints/tempo/fluxo | Estados independentes, data do sucesso/falha, partial/blocked e flow unknown após perda; capturas |
| 5 — Falha e recuperação | Relógio/RNG/cota e recuperação sem reset, cortes individuais/simultâneos reais, erros terminais |
| 6 — Polling/pausa/retomada | Cinco segundos após conclusão, background real, powerMonitor suspend/resume e testes de timers |
| 7 — Cancelamento/invalidação | Abort no gate/transporte, snapshot e handle tardios, cancelamento de handshake por teclado, perfil/reload/close/quit |
| 8 — Eventos precoces | 30 cenários sem filho anormal e earlyClose/earlyInvalid no executável com A |
| 9 — Fronteira/artefato | Autoridade/DTO/pós-await/evento, allowlist 22, CSP/sandbox, origem fixa/zero rede externa e inspeção ASAR |
| 10 — UI/guia | Teclado/foco/produção/temas/zoom 200%, guia/Ajuda 14 tópicos sincronizados e smokes anteriores |
| 11 — Matriz real | 54 checks, digests fixos/loopback, zero canais/recursos remanescentes e cleanup |
| 12 — Revisão/registro | Artefato/capturas/links/Git revisados; PROJECTS/AGENTS/estado/progresso atualizados, sem commit/push/4B |

## Limitações mantidas e próxima ação

Validação local em macOS arm64 e RabbitMQ isolado de nó único. Não homologa
Windows/Linux/outros CPUs, cluster/HA, suspensão física do hardware, interação
manual de menus/seletores nativos/leitores de tela, providers reais de senhas,
assinatura/notarização/CI remoto/release/updater. Suspend/resume foi simulado pelo
powerMonitor do executável, sem alegar execução durante suspensão real do SO.
Gate usa peer roteirizado e dois runtimes; não cobre todo comportamento possível
de um servidor ou esgotamento de memória por parser. Manter patch até correção
upstream aprovada e validada, sem ampliar diff unilateralmente.

Sessão não abre canais nem habilita mensagens/topologia/administração; listagem de
vhosts/versões/capacidades continua para contrato posterior. Entrega **pronta para
revisão**, conclusão/commit dependem de aprovação. Sugestão:
feat(connections): maintain broker session and bounded recovery. Sem push/4B.

## Aceite da entrega

Em 2026-10-30, o proprietário respondeu “Aprovado” à conclusão e ao commit
feat(connections): maintain broker session and bounded recovery. Conferidos os
61 arquivos da revisão e o ASAR antes da sincronização documental do aceite.
Nenhuma alteração funcional ou de guia nesta Task; resultados e limitações acima
permanecem os efetivamente executados. Somente docs:check/links/whitespace e
conferência de Git/hashes pertinentes ao registro; sem repetição de broker/smoke.
O aceite é registrado no mesmo commit coeso da entrega. Sem push ou 4B autorizados.
