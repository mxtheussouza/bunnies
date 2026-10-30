# Bunnies — histórico vivo do projeto

Atualizado em: 2026-10-30.

## Estado atual

- Branch: `chore/modernization-app`.
- Última entrega aprovada: **4A.2B — teste AMQPS/autenticação/vhost**, incluindo testes reais.
- Aprovação atual: “Aprove a 4A.2B, e siga para a próxima etapa”, em 2026-10-30,
  aceitou a conclusão/commit apresentados e pediu a preparação da 4A.2C.
- Último commit: entrega `feat(connections): add cancellable AMQPS connection tests`,
  com pai 9401448; consultar hash no Git após registro.
- Task atual: registrar/conferir somente o commit aprovado da 4A.2B.
- Próxima ação: preparar contrato detalhado 4A.2C para aprovação; não implementar
  sessão sem aceite do contrato próprio, nem fazer push.

## Tarefas concluídas

| Etapa | Entrega | Registro |
| --- | --- | --- |
| 0 | Auditoria somente de leitura | docs/01-audit |
| 1A | Registro da auditoria/governança | c292b35 |
| 1B | Arquitetura, sete ADRs, requisitos/MVP | 97cd313 |
| 2A | Fundação de desenvolvimento | 27e4f95 |
| 2B | Fronteira Electron segura | a550731 |
| 3A | Design/navegação aprovados | c215004 |
| 3B | Shell, temas e interface base | eb535d7 |
| 4A.1 | CRUD local, JSON limitado/atômico, IPC e senha em memória | Conclusão/commit aprovados; fe4a252 |
| DOC.1 | Histórico vivo, guia do usuário e Ajuda offline | Concluída/aprovada; 66183f7 |
| 4A.2A | CA por perfil, JSON v2/backup v1 e teste explícito HTTPS | Concluída/aprovada; 966b4a2 |
| 4A.2B | Teste AMQPS/vhost, cancelamento e verificação real 4.4.0/4.3.6 | Conclusão/commit aprovados; registro nesta entrega |

## Entrega DOC.1 aprovada

- Histórico vivo com tarefas, decisões, pendências e testes; regras de leitura e
  atualização obrigatórias no AGENTS central.
- Guia PT-BR com 11 tópicos e todos os oito campos atuais do formulário, ações,
  menus, exemplos e solução de problemas; link no README.
- Ajuda offline no aplicativo com a mesma fonte, índice acessível e foco/rolagem.
- Gerador/check de documentação, 133 testes aprovados, package/smokes e revisão visual.

## Pendências e decisões

- Conclusão/commit 4A.2A e 4A.2B aprovados; nenhuma sessão ativa;
  sessão (4A.2C) permanece dependente de contrato/autorização específicos.
- Mudança da barra de título macOS foi registrada pelo proprietário em 9401448;
  preservar e revalidar no próximo pacote. Não integra o pacote/testes da 4A.2A.
- Atualizar este arquivo a cada Task/fase/alteração, mantendo histórico de decisões,
  testes realmente executados e pendências. Não incluir credenciais ou dados pessoais.
- Preservar stack, identidade e isolamento; amqplib 2.2.0 instalado
  sob contrato aprovado; sem outro pacote novo, transitiva ou atualização alheia.
- Senha persistente segue desligada em todos os alvos: provider real e gates sem prova.
- Revisão manual dos diálogos/seletores nativos, leitores de tela e outros SOs/CPUs
  pendente. Testes reais HTTPS/AMQPS passaram em RabbitMQ 4.4.0/4.3.6 de nó único;
  cluster/HA, demais funcionalidades/plataformas e releases não homologados. Sem push autorizado.

## Testes executados

4A.1: `npm run check` passou com **130 testes em 17 arquivos**, typecheck, lint e
formatação. `npm run package`, `npm run smoke:package` e
`node tools/testing/profiles.cjs` passaram em macOS 27.0.1 arm64.
ASAR apresentado: `f5085b0648745ed5285bdc1eb4a6285a4b5818c04d108d0852d49b0c45fa9acb`.
DOC.1: `npm run check` passou com **133 testes em 18 arquivos**, typecheck, lint,
formatação e `docs:check`; package, smoke de Ajuda/segurança e smoke de perfis
passaram em macOS arm64. Checagem negativa de guia divergente passou em cópia temporária.

4A.2A: `npm run check` passou com **166 testes/24 arquivos**, typecheck/lint,
formatação e docs:check. Package e três smokes sequenciais (base/Ajuda/segurança,
perfis e HTTPS) passaram em macOS arm64. TLS real de fixture Node isolada, sem
RabbitMQ. Artefato/capturas revisados; guia/Ajuda agora têm 12 tópicos e 11 campos.
[Resultados, critérios e limitações](docs/07-testing/https-4a2a.md).

4A.2B: check passou com **216 testes/27 arquivos**, typecheck/lint/format/docs:check;
package e quatro smokes sequenciais passaram em macOS arm64. AMQPS Node TLS com
handshake roteirizado, DNS/IP, cancelamento/prazo/close/invalidação/reload/quit,
sem canal/sessão. Guia/Ajuda têm 13 tópicos e 12 campos.
[Evidências e limites 4A.2B](docs/07-testing/amqps-4a2b.md). Complemento autorizado
pelo pedido de teste real: 20 verificações em cada RabbitMQ 4.4.0/4.3.6 passaram
no mesmo executável, com TLS/HTTPS/AMQPS, recusas, cancelamento/deadline e cleanup.
As 40 verificações do harness são separadas dos 216 testes da suíte.

## Histórico de atividades

### 2026-10-28 — T-4A1-ACEITE

- Pedido: aprovar conclusão/commit da 4A.1 e acrescentar histórico vivo/guia/Ajuda.
- Concluído: retomada das instruções/Git, identificação da entrega apresentada,
  registro do aceite e criação deste histórico inicial.
- Em curso: conferir hashes da entrega antes do commit aprovado; nenhuma nova
  implementação misturada à entrega 4A.1.
- Decisão: manter a Task adicional em entrega separada; não avançar à 4A.2.
- Testes: os resultados acima são da execução anterior; nenhuma repetição funcional
  nesta sincronização documental.

## Referências

[Instruções](AGENTS.md), [estado resumido](docs/05-roadmap/current-stage.md),
[roadmap](docs/05-roadmap/roadmap.md), [progresso das etapas](docs/05-roadmap/progress.md),
[evidências 4A.1](docs/07-testing/profiles-4a1.md).

### 2026-10-28 — T-DOC1-PLANEJAMENTO

- Concluído: commit aprovado `fe4a252`, com 41 arquivos da 4A.1; nenhum push.
- Alterado: AGENTS agora exige ler este histórico antes de toda Task e atualizá-lo
  a cada Task/fase/alteração; contrato DOC.1 autorizado documentado no roadmap.
- Decisão: guia JSON local como fonte única, Markdown gerado para o README e React
  seguro para a Ajuda offline, sem nova dependência/IPC/rede ou mudança de URL.
- Em curso: conteúdo de cada função/formulário real, limitações e solução de problemas.
- Testes: hashes dos fontes/ferramentas apresentados conferidos; teste funcional
  não repetido para o aceite documental. Verificações DOC.1 ainda pendentes.

### 2026-10-28 — T-DOC1-CONTEUDO-UI

- Alterado: guia canônico JSON com 11 tópicos, cada campo real do formulário,
  ciclo de perfis/senhas, temas/menus, distribuição e solução de problemas.
- Implementado: gerador Markdown com check de sincronização, link no README e
  destino Ajuda offline no shell; índice por botões e foco, sem alterar URL/IPC.
- Ajustado: texto de disponibilidade na navegação/Sobre para refletir perfis locais
  e ausência de operações de broker. Novo ícone usa o padrão SVG já existente.
- Decisão: duas entradas npm para gerar/conferir o guia; check incorpora conferência.
  Manifesto só muda scripts, sem dependências/lock.
- Testes: ainda em preparação; não declarar aprovação até executar.

### 2026-10-28 — T-DOC1-TESTES-INICIO

- Concluído: guia Markdown gerado, typecheck inicial aprovado; interface inclui
  Ajuda e todos os tópicos sem renderizar HTML da documentação.
- Em curso: testes de conteúdo/campos, navegação/foco/URL e destino local; check
  completo, sincronização, package/smokes e revisão visual ainda pendentes.
- Decisão: testar também ausência de formulários/links remotos na Ajuda; preservar
  os smokes de segurança/perfis existentes e usar apenas userData temporário.

### 2026-10-28 — T-DOC1-SMOKE-PREPARACAO

- Implementado: smoke da Ajuda no executável, integrado ao smoke base; compara
  todo o conteúdo canônico, ativa modo offline, testa índice/foco/teclado/painel
  compacto e zoom 200%, preservando as negativas de segurança existentes.
- Testes: check inicial em execução; pacote e smoke ainda não executados para DOC.1.
- Pendências: conferir resultados, testar detecção de guia divergente e sincronizar
  documentos técnicos/estado; manter 4A.2 sem autorização.

### 2026-10-28 — T-DOC1-TESTES-AJUSTE

- Resultado: typecheck do primeiro check apontou opção exact indevida em duas
  consultas Testing Library novas (API diferente do Playwright).
- Corrigido: consultas de role usam comparação exata padrão da Testing Library.
- Em curso: repetir check antes de package/smokes; nenhuma limitação do produto
  foi contornada ou proteção alterada para o teste.

### 2026-10-28 — T-DOC1-RESULTADOS

- Executados/aprovados: check (133 testes/18 arquivos), docs:check, package,
  smoke:package com Ajuda offline e `node tools/testing/profiles.cjs`.
- Verificado no pacote: 11 tópicos completos, labels e exemplos do formulário,
  índice por teclado/foco, retorno ao índice, painel compacto, dois temas, zoom
  200%, URL fixa, zero nova API privilegiada e proteções de segurança preservadas.
- Regressão de perfis: CRUD, reinício completo, senha transitória descartada,
  corrupção preservada e confirmação simulada exclusivamente no main passaram.
- Teste negativo: cópia isolada do guia/gerador rejeitou Markdown divergente com
  exit 1; o guia real não foi alterado para essa verificação.
- Revisão visual: capturas locais do índice escuro, campos claros e zoom 200%
  inspecionadas; rolagem e retorno ao índice alcançáveis.
- Limites: macOS arm64 somente; confirmação nativa/tema por teclado, tecnologias
  assistivas e outros alvos permanecem pendentes; nenhuma validação de broker/provider.
- Em curso: sincronizar documentação técnica, estado e evidências; depois apresentar
  DOC.1 para aprovação de conclusão/commit. Sem novo commit ou push nesta Task.

### 2026-10-28 — T-DOC1-DOCUMENTACAO-REVISAO

- Sincronizados: arquitetura/navegação, produto/módulos, desenvolvimento/testes,
  roadmap/current-stage/progress e evidências DOC.1, além do guia/README/AGENTS.
- Inspeção: ASAR 793591 bytes, SHA-256
  `515d6f9d997a4121bb52bed6d8f56172449e0661358db2abb8f1c63b020df5da`; oito arquivos, IDs do guia no renderer,
  preload externo apenas electron, sem fixtures de senha ou documentos internos.
- Testes anteriores deste bloco: 133/18 e package/smokes aprovados; não repetidos
  por edição somente documental. Documentação/links e diff ainda em conferência final.
- Pendência: aprovação de conclusão DOC.1 e do commit
  `feat(help): add offline user guide and project status tracking`.

### 2026-10-28 — T-DOC1-ENTREGA-PARA-APROVACAO

- Concluído: revisão técnica/visual/documental, guia completo no README/app e
  regras permanentes de histórico no AGENTS. Estado/progresso/módulos sincronizados.
- Conferência: 37 arquivos Markdown, 279 links locais, 99 tabelas e
  11 âncoras do guia válidos; whitespace sem erros. 47 arquivos protegidos
  preservados byte a byte; package.json muda somente scripts, sem dependências.
- Testes efetivos: 133 testes/18 arquivos + check, package, Ajuda offline/segurança,
  perfis e caso negativo de documentação divergente aprovados em macOS arm64.
- Próxima ação: apresentar DOC.1 e aguardar aprovação de conclusão/commit
  `feat(help): add offline user guide and project status tracking`.
- Git: HEAD `fe4a252`, index vazio; alterações DOC.1 prontas para revisão, sem
  commit novo ou push. A 4A.2 continua não autorizada; limitações anteriores mantidas.

### 2026-10-28 — T-DOC1-ACEITE-COMMIT

- Autorização: “Aprovado” aceitou a conclusão DOC.1 e o commit apresentado.
- Conferido: os 27 arquivos apresentados mantinham exatamente seus hashes; ASAR
  `515d6f9d997a4121bb52bed6d8f56172449e0661358db2abb8f1c63b020df5da`
  preservado e index inicialmente vazio. Sem alterações posteriores do usuário.
- Alterado: aceite/estado sincronizados em PROJECTS, AGENTS, evidências, roadmap,
  current-stage/progress, arquitetura, produto e módulos. Código/guia/ferramentas
  permanecem os apresentados; nenhuma implementação adicional.
- Testes: 133/18, check, package/smokes e caso negativo são os resultados já
  executados/apresentados; não repetidos por ajustes exclusivamente documentais.
  Conferência de links, tabelas, whitespace e sincronização do guia neste aceite.
- Registro: este histórico integra o commit aprovado
  `feat(help): add offline user guide and project status tracking`; consultar o
  hash no Git e conferir working tree após gravar. Não registrar hash autorreferente.
- Limites/pendências: mantidos os gates de provider/release, nativos/assistivas e
  outros SOs/CPUs. Nenhum push ou execução 4A.2 autorizado por este aceite.

Conferência do aceite DOC.1: docs:check passou; 37 Markdown, 280 links locais,
99 tabelas e 11 âncoras válidos. Whitespace conferido; código, guia e
ferramentas apresentados preservados. Registro da conclusão integra este commit;
nenhuma nova fase ou push nesta Task. Resultados funcionais anteriores mantidos.

### 2026-10-28 — T-4A2-PLANEJAMENTO-INICIO

- Pedido: “Pode seguir para a próxima etapa”, após a conclusão DOC.1.
- Retomado: AGENTS/PROJECTS, estado/roadmap, arquitetura, ADRs de transportes e
  compatibilidade, requisitos e código de perfis. Git limpo em `66183f7`.
- Em curso: preparar o contrato detalhado da próxima implementação, ainda não
  apresentado/aprovado; não tratar o aceite DOC.1 como autorização de rede.
- Proposta: dividir 4A.2 em incrementos revisáveis; primeiro CA personalizada e
  teste HTTPS, depois teste AMQPS e ciclo de sessão, com contratos próprios.
- Justificativa: não há cliente de broker instalado ou transporte implementado;
  validar TLS/credenciais/IPC antes de incluir AMQP e sessão reduz o recorte.
- Testes: nenhuma execução funcional nova; consultas de código/documentação somente.
- Limites: sem instalação, conexão a brokers, mudança de código, commit ou push.

### 2026-10-28 — T-4A2-CONTRATO-PROPOSTO

- Preparado no roadmap contrato 4A.2A com todos os campos, nove critérios,
  escopo/arquivos/testes/exclusões e proposta de dividir 4A.2 em A/B/C.
- Escolhas Proposed: CA pública PEM com limites/seleção nativa; migração explícita
  v1/v2 com preservação; probe GET whoami, credencial só no main, TLS obrigatório,
  cancelamento/deadline e resultados datados sem sessão. Nenhuma decisão registrada
  como Accepted ou implementada.
- Fontes oficiais consultadas: RabbitMQ API 4.4, Electron dialog, Node HTTPS/TLS e
  X509; tipos Node locais conferidos. URLs HTTPS/TLS v24 e RabbitMQ 4.3 indisponíveis
  no acesso web, limitação registrada. Docker/OpenSSL apenas localizados.
- Atualizados: AGENTS, roadmap/current-stage/progress e este histórico. Guia e
  código do produto preservados, pois a funcionalidade continua indisponível.
- Testes: nenhum novo teste funcional/broker/TLS; conferência documental em curso.
- Próxima ação: apresentar contrato e obter aceite específico; sem instalação,
  migração, conexão, novo commit ou push nesta preparação.

### 2026-10-28 — T-4A2-PLANEJAMENTO-ENTREGA

- Concluído: contrato 4A.2A Proposed com 13 campos/nove critérios e divisão A/B/C
  para apreciação; nenhum código ou guia de função disponível foi alterado.
- Verificações: docs:check aprovado, 37 Markdown, 281 links locais e 101 tabelas
  consistentes; campos do contrato e whitespace conferidos. Apenas cinco arquivos
  de governança/documentação alterados; index vazio, nenhum arquivo novo.
- Testes funcionais: não executados nesta preparação; resultados DOC.1 anteriores
  mantidos como histórico, sem alegar teste HTTPS/TLS ou broker aprovado.
- Próxima ação: apresentar contrato e obter aceite específico antes de implementar
  4A.2A. Sem instalação, migração, acesso a cofre/broker, commit ou push.

### 2026-10-28 — T-4A2A-AUTORIZACAO

- Autorização: “Autorizo” aprovou executar o contrato detalhado 4A.2A.
- Retomada: branch chore/modernization-app, HEAD 66183f7; cinco alterações
  documentais da proposta preservadas, index vazio. Baseline registrado em out.
- Escopo: CA PEM limitada/diálogo nativo, schema v2 com backup v1, probe HTTPS
  explícito/cancelável, credenciais no main, UI/guia/IPC e testes isolados.
- Em curso: implementação do núcleo; nenhum teste novo ainda executado.
- Exclusões mantidas: AMQP/sessão/persistência de senha, novas dependências,
  commit antecipado ou push.

### 2026-10-28 — T-4A2A-NUCLEO

- Implementados para validação: leitura limitada de arquivos/CA, seleção opaca por
  janela/expiração, schema v2/backup v1 e consumo após gravação; sem senha em disco.
- Probe usa whoami, agente dedicado, TLS obrigatório, sub-limites e cancelamento;
  serviço invalida por revision/mudanças, sem sessão ou AMQP. IPC nomeado em canal
  próprio reutiliza autoridade de janela/frame/URL; ponte ampliada para 16 métodos.
- Em curso: fixtures TLS, testes e interface; nenhum novo teste aprovado ainda.
- Ambiente: LibreSSL 3.3.6 disponível; consulta Docker em curso, sem broker iniciado.

### 2026-10-28 — T-4A2A-FIXTURES-TESTES-INICIO

- Geradas/limpas fixtures efêmeras com CA/leaf/chave sintéticas e certificados
  expirado/hostname errado usando LibreSSL; nenhum material real do usuário.
- Docker: consulta info falhou porque o socket do daemon não existe. Não iniciar
  serviço do host; testes de RabbitMQ real ficam limitados pela indisponibilidade.
- Criados testes de CA, migração/backup, probe TLS real e ciclo de cancelamento.
- Typecheck identificou fixtures antigas sem trust/novo argumento da ponte e tipo
  de ambiente alargado no novo teste; ajustes de fixtures em curso.
- Nenhum novo teste funcional aprovado ainda; implementação da UI em andamento.

### 2026-10-28 — T-4A2A-INTERFACE

- Implementados para teste: Confiança TLS/seleção PEM/fingerprints no formulário e
  resumo; Testar HTTPS explícito/cancelar/resultado datado no perfil salvo.
- Contexto distingue ausência de sessão de teste HTTPS temporário. Formulário
  descarta seleção opaca ao fechar e mantém CA/segredo como ações independentes.
- Arquivos v2 alertam sobre leitura em versões antigas; AMQPS continua indisponível.
- Em curso: check do núcleo e atualização de guia/testes; ainda sem resultados finais.

### 2026-10-28 — T-4A2A-TESTES-PARCIAIS-REVISAO

- Aprovados nesta execução: 163 testes/24 arquivos, typecheck e lint. Cobrem TLS
  real/CA/hostname/expiração, arquivo/migração, cancelamento e IPC/UI.
- Revisão identificou necessidade de rejeitar bytes extras após DER e tornar o
  erro de formato Basic explícito; ajustes/testes adicionais em curso.
- Em curso: guia completo atualizado e smoke real do pacote; não declarar matriz
  RabbitMQ homologada (daemon Docker indisponível). Sem dependências novas.

### 2026-10-28 — T-4A2A-GUIA

- Atualizado guide.json: campos de confiança/seleção/fingerprints, tópico completo
  CA/teste HTTPS, migração/compatibilidade, senha enviada apenas sob ação explícita,
  cancelamento/erros/limitações e distinção de sessão. README acompanha estado real.
- Guia será regenerado e conferido; Ajuda usa a mesma fonte. Nenhuma promessa de
  AMQPS, sessão, provider real, release ou homologação de RabbitMQ adicionada.
- Revisão de núcleo: DER extra é rejeitado, formato Basic ganha diagnóstico próprio,
  e o teste de IDs duplicados exercita schema v2 válido antes da duplicidade.

### 2026-10-28 — T-4A2A-CHECK-AJUSTES

- Check após revisão: 164 testes passaram e um teste manteve expectativa antiga
  VALIDATION após criar TEST_CREDENTIAL_FORMAT; corrigida a expectativa específica.
- Melhorado diagnóstico de limite de CA, distinguindo arquivo grande de tipo
  inválido; proteções/limites preservados. Nova regressão cobre DER com bytes extras.
- Preparado smoke HTTPS do pacote com v1/migração, picker simulado só no main,
  autenticação/status/timeout/cancelamento, sockets e zoom; ainda não executado.

### 2026-10-28 — T-4A2A-PACOTE-PARCIAL-REVISAO

- Aprovados: check com 165 testes/24 arquivos, package e smokes base/Ajuda, perfis
  e HTTPS no executável. Runtime Electron 45.1.0/Node 24.22.1; deadline observado
  10.450 ms até feedback do runner, com timer de 10 s e sockets liberados.
- Capturas de CA/resultados em claro/escuro e zoom 200% inspecionadas.
- Ajustes de revisão: redação explícita de que teste não verifica AMQPS; erro de CA
  associado ao seletor. Smoke passa a exercitar proxy herdado no ambiente apenas
  do processo isolado, com trap loopback; nenhuma preferência global do SO alterada.
- Pacote/check/smokes serão repetidos por esses últimos ajustes. Broker RabbitMQ
  real continua não testado; Docker sem daemon. Sem commit ou push.

Ajuste de redação do bloco HTTPS aplicado após conferir a quebra de linha real do
JSX; validar no próximo pacote. Fontes oficiais de whoami consultadas como apoio
ao contrato de resposta; isso não substitui teste com RabbitMQ real.

### 2026-10-28 — T-4A2A-DOCUMENTACAO-TECNICA

- Atualizados M01/arquitetura/navegação/segurança/NFRs/desenvolvimento/testes e visão
  do produto/módulos. NFR-031–033 registram sub-limites aprovados no contrato.
- Detalhados schema v2/backup v1, tokens/16 métodos, ciclo de recursos e limite de
  cancelamento físico de DNS/I/O no SO. Guia/Ajuda já regenerados e conferidos.
- Revalidação oficial: release-information mantém 4.4.0 e 4.3.6 nas séries de
  referência; fontes dessas tags confirmam campo name no usuário de whoami.
  Consulta de código não substitui testes de broker: Docker continua indisponível.
- Smoke com proxy herdado isolado passou, sem requisições na trap; nenhuma alteração
  persistente de proxy/TLS do host. Falta pacote final após ajuste textual de UI.

### 2026-10-28 — T-4A2A-REVISAO-FINAL-NUCLEO

- Revisão diferencia erro de framing HTTP (HPE_*) de indisponibilidade de rede,
  retornando TEST_RESPONSE sanitizado; cenário TLS real com framing inválido adicionado.
- Redação do teste foi conferida no JSX; esclarece ausência de AMQPS/sessão.
- Check/package/três smokes serão a conferência final após esses ajustes; não
  ampliar testes após aprovação sem mudança/falha ou preocupação concreta.

### 2026-10-28 — T-4A2A-FIXTURE-FRAMING

- Check final: 165 testes aprovados; novo cenário de framing malformado expirou
  em 5 s no harness TLS cru. A fixture passou a consumir a requisição antes de
  responder e destruir explicitamente seu peer no finally, com sinal de proteção
  de 1,5 s no teste. Nenhum timeout/política do produto foi relaxado.
- Reexecutar cenário alvo antes de check/package/smokes finais; sem novo resultado
  funcional declarado até essa execução.

### 2026-10-28 — T-4A2A-ESTADO-EVIDENCIAS

- Sincronizados estado/AGENTS/roadmap e status parcial dos requisitos/MVP.
  Criadas evidências 4A.2A, ainda com campo de resultados finais a conferir.
- A implementação mantém limites contratuais; CA e credenciais estão no main,
  16 métodos específicos e migração só após salvar. Nenhuma etapa B/C iniciada.
- Próxima ação: concluir pipeline final e inspeção do artefato, validar links e
  registrar resultado preciso para revisão/aprovação. Sem novo commit ou push.

### 2026-10-28 — T-4A2A-VERIFICACAO-PACOTE-FINAL

- Cenário de framing corrigido passou (11 testes alvo); check completo passou
  com 166 testes/24 arquivos, typecheck/lint/format/docs:check; package passou.
- Smoke base final expirou no primeiro resize 1440x900, antes do fluxo funcional.
  Rodadas anteriores haviam passado. Acrescentado diagnóstico de dimensões/zoom/
  estado do próprio BrowserWindow e display ao erro; nenhuma asserção removida.
- Repetir somente lint/harness/smokes sobre o mesmo pacote já gerado, para resolver
  a falha de ambiente sem alterar produto ou controles de segurança.

### 2026-10-28 — T-4A2A-DIAGNOSTICO-DISPLAY

- Diagnóstico confirmou limite do host: tela 1440x900, área útil 1440x870; macOS
  limitava a janela normal a 1440x870. Zoom e estado da janela estavam normais.
- Harness passa a usar tela cheia exclusivamente na sua janela quando a dimensão
  exata exigida excede a área útil, mantendo as asserções 1440x900. Volta ao modo
  normal antes de dimensões menores e dos controles minimizar/maximizar.
- Nenhuma alteração de resolução/preferência global, produto, CSP ou segurança.
  Reexecutar lint/smokes no pacote existente; resultado ainda pendente.

### 2026-10-28 — T-4A2A-RESULTADOS-FINAIS

- Check final passou: 166 testes/24 arquivos, typecheck/lint/format/docs:check.
  Package passou; lint e três smokes sequenciais passaram após ajuste de harness.
- Base confirma dimensões exatas, temas/foco/controles, Ajuda completa de 12 tópicos
  offline e fronteiras de segurança. Perfis confirma CRUD/reinício/descarte de senha.
  HTTPS confirma CA/migração/Basic, erros/cancelamento/prazo/proxy/invalidação/cleanup.
- Prazo medido clique-feedback: 10.421 ms; deadline do serviço 10.000 ms coberto por
  teste controlado. Zero requests Chromium externos/trap de proxy e sockets limpos.
- ASAR conferido: 819.822 bytes, SHA-256
  ece1644c4ba1a6e5c3fc6e19249a8a075bbf956512aeda05239ed2aa0008f146.
  Oito arquivos de produto; preload só requer electron. Sem fixtures/chaves privadas/
  certificados sintéticos/sentinela de senha; 12 tópicos no bundle.
- Capturas finais dos temas/zoom inspecionadas. Documentos/evidências/estado
  sincronizados para revisão. RabbitMQ real não testado; Docker sem daemon.
  Nativos manuais/assistivas/outros SOs/CPUs/providers/releases continuam pendentes.
- Nenhuma dependência/lock/asset/configuração de janela ou política de segurança
  alterada; index vazio em 66183f7. Sem commit/push ou execução 4A.2B/C.

### 2026-10-28 — T-4A2A-REVISAO-ENTREGA

- Conferência documental concluída: 38 Markdown, 288 links locais, 105 tabelas e
  12 âncoras do guia válidos; docs:check, format:check e git diff --check aprovados.
- Conferidos 36 arquivos protegidos contra o snapshot inicial, todos preservados:
  dependências/lock, assets, configurações, janela/políticas e ferramentas do guia.
- Entrega pronta para revisão/aprovação de conclusão; registrar snapshot local com
  hashes dos arquivos apresentados e do artefato para conferir o aceite posterior.
- Conclusão/commit ainda não aprovados; HEAD 66183f7/index vazio. Próxima ação é
  apresentar somente esta entrega, sem iniciar AMQPS/sessão nem fazer push.

### 2026-10-28 — T-4A2A-ACEITE-COMMIT

- Autorização: “Aprovado” aceitou a conclusão 4A.2A e o commit apresentado
  feat(connections): add custom CA and HTTPS authentication tests.
- Retomada: AGENTS/PROJECTS/arquitetura/roadmap/estado e Git conferidos. Os 58
  arquivos apresentados e o ASAR mantinham exatamente os hashes registrados;
  HEAD 66183f7, branch chore/modernization-app, index inicialmente vazio.
- Identificada alteração adicional posterior em misc/window/components/Titlebar/index.tsx.
  Preservar byte a byte e fora do commit; não integra o pacote/testes apresentados.
- Sincronizados aceite/estado em PROJECTS, AGENTS, evidências, roadmap/progresso,
  arquitetura/requisitos/produto/M01; sem nova implementação, mudança de guia,
  ferramentas ou dependências. Conferência documental em curso antes do registro.
- Testes: 166 testes/24 arquivos, check/package/três smokes são resultados anteriores
  apresentados e aprovados; não repetidos por sincronização apenas documental.
- Este registro integra o commit autorizado, com pai 66183f7. Consultar seu hash
  no Git, evitando autorreferência. Conferir working tree e preservação da mudança
  local após gravar. Sem push, AMQP/sessão ou execução de 4A.2B/C.

Conferência do aceite 4A.2A: docs:check e git diff --check aprovados; 38 Markdown,
288 links locais, 105 tabelas e 12 âncoras válidos. Os resultados funcionais e o
artefato apresentados foram preservados. Selecionar somente os 58 arquivos da
entrega autorizada para o commit; manter a alteração posterior de Titlebar fora
do index, sem reverter ou publicar. Conferência pós-commit no Git encerra esta Task.

### 2026-10-28 — T-4A2B-PLANEJAMENTO-INICIO

- Pedido: “Continue as etapas”, após conclusão/commit aprovados da 4A.2A.
- Retomada: instruções/estado/arquitetura/ADRs de transportes e compatibilidade,
  requisitos, contrato anterior e código; Git limpo na branch chore/modernization-app.
- HEAD 9401448 (fix: hide actions in titlebar for mac), posterior ao commit aprovado
  966b4a2 da 4A.2A. Mudança da barra de título agora versionada pelo proprietário;
  preservá-la e revalidar seu efeito nos próximos testes, sem revertê-la.
- Escopo atual: preparar contrato específico 4A.2B (teste AMQPS/autenticação/vhost),
  revalidar cliente/documentação oficial e apresentar para aprovação de execução.
- Sem instalação, alteração de código/guia, conexão a broker, novo teste funcional,
  commit ou push. A 4A.2C permanece dependente de contrato próprio.

### 2026-10-28 — T-4A2B-PESQUISA-CONTRATO

- Confirmados em fontes oficiais e registry npm: amqplib 2.2.0 é a versão latest
  observada, Node >=18, tipos incluídos e nenhuma dependência de produção declarada.
  Não instalado; vulnerabilidades/compatibilidade ainda exigem validação real.
- Changelog registra mudança de heartbeat 0 na série 2 e APIs de recovery opcionais;
  proposta usará connect comum, heartbeat positivo e nenhuma reconexão automática.
- Especificação RabbitMQ diferencia vhost ausente/vazio e exige percent-encoding
  de barras. Contrato definirá parse estrito sem dupla decodificação, preservando v1/v2.
- API/implementação oficial encaminha socketOptions ao TLS; timeout de inatividade
  não substitui deadline total/cancelamento. Proposta exige socket próprio no main,
  encerramento limitado e prova de cleanup antes de devolver sucesso.
- Consulta registry via Python falhou na cadeia CA local; curl com validação TLS
  padrão e fontes web oficiais funcionaram. Nenhuma verificação TLS foi desabilitada.
- RabbitMQ 4.4.0/4.3.6 revalidados como referências; sem broker/teste funcional nesta
  preparação. Página Node v24 TLS indisponível no navegador; genérica indica v26,
  portanto runtime Electron/Node 24 permanece gate explícito dos testes futuros.

### 2026-10-28 — T-4A2B-CONTRATO-PROPOSTO

- Preparado no roadmap contrato Proposed com 13 campos/dez critérios verificáveis,
  arquivos/módulos, riscos, testes, dependência exata, resultados e exclusões.
- Propostos: parse estrito de vhost na URL salva (sem schema novo), CA compartilhada,
  SASL só em TLS, prazo total 15 s/close até 1 s dentro desse prazo, heartbeat 10 s,
  frameMax 128 KiB/channelMax 1 e uma operação HTTPS ou AMQPS por janela.
- Duas operações específicas propostas levam a ponte a 18 métodos; não criar canais,
  topologia, mensagens, sessão ativa, reconexão ou acesso a provider real.
- Adequar somente guia/smokes às ações por plataforma existentes em 9401448, sem
  restaurar a barra de título. Preservar resultados antigos como evidência histórica.
- Atualizados AGENTS/estado/roadmap/progresso/PROJECTS. Guia do recurso futuro e
  código/dependências preservados. Conferência documental em curso; sem novo
  teste funcional, instalação, conexão a broker, commit ou push.

### 2026-10-28 — T-4A2B-PLANEJAMENTO-ENTREGA

- Conferências aprovadas: docs:check, git diff --check; 38 Markdown/288 links locais/
  106 tabelas válidos, 13 campos do contrato presentes. Somente cinco documentos
  de instruções/governança modificados, index vazio, HEAD 9401448.
- Contrato Proposed pronto para apreciação. Código/guia/dependências preservados;
  nenhum novo teste funcional/TLS/AMQP/broker ou homologação declarado.
- Próxima ação: obter aceite explícito do contrato 4A.2B, incluindo amqplib 2.2.0,
  parâmetros de vhost/recursos e testes/artefatos locais previstos, antes de instalar
  ou implementar. Conclusão/commit e 4A.2C exigirão aprovações posteriores próprias.

### 2026-10-29 — T-4A2B-AUTORIZACAO

- Pedido: “Autorizo” aprovou executar o contrato 4A.2B apresentado, incluindo
  amqplib 2.2.0, parâmetros de vhost/recursos e testes/artefatos locais previstos.
- Retomada: branch chore/modernization-app, HEAD 9401448; cinco documentos da
  proposta preservados, index vazio. Mudança macOS versionada permanece intacta.
- Em curso: instalação dirigida/audit e implementação de parse/probe/coordenação.
- Não inclui sessão 4A.2C, canais/mensagens/topologia, provider real, commit ou push.

### 2026-10-29 — T-4A2B-NUCLEO-INICIO

- Instalado somente amqplib 2.2.0, com tipos próprios e sem dependências transitivas
  de produção. Audit: seis avisos preexistentes (2 baixos/4 moderados) de tooling;
  nenhum alerta para amqplib, sem auto-fix ou atualização fora do escopo.
- Implementação em curso: parser puro compartilhado para main/preview de vhost,
  transporte AMQPS com socket próprio, coordenação HTTPS/AMQPS e IPC de 18 métodos.
- Serviço HTTPS foi renomeado para ConnectionTestService para coordenar os dois
  comandos; nada de transporte genérico no renderer. Schema v2 permanece igual.
- Ainda sem teste novo aprovado; próximo bloco provará handshake/close/cleanup
  com TLS e peer AMQP sintético, antes de integrar a interface.

### 2026-10-29 — T-4A2B-PROVA-TLS-AJUSTES

- Primeiro cenário real confirmou SASL/vhost/close sem canais; parser rejeita
  Unicode malformado após regressão detectar surrogate substituído silenciosamente.
- Rodada ampla teve SIGSEGV do worker ao iniciar hostname localhost. Isolamento
  mostrou IPv4 direto aprovado e queda na conexão DNS com socket ainda conectando.
  Adapter agora aguarda connect TCP antes de fornecer o socket ao TLS; mantém
  propriedade/cancelamento no main, sem monkey patch ou API interna.
- Caso blocked adicionado: close de amqplib pode resolver sem confirmação nesse
  estado; rejeitar como AMQP_CLOSE, nunca sucesso pleno. Verificação em curso.
- Docker reconsultado: daemon/socket continua indisponível; sem broker/container
  real. Não iniciar serviço do host ou usar broker do usuário.
- Nenhuma suíte final aprovada ainda; repetir núcleo antes da interface.

### 2026-10-29 — T-4A2B-HANDSHAKE-REVISAO

- Após aguardar TCP, cenários DNS/TLS/CA/cancelamento passaram sem a queda anterior.
- API callback pública de amqplib escolhida para identificar close síncrono sem
  confirmação no atalho blocked; não depende de estado/stream privado da biblioteca.
- Fixture ajustada para enviar open-ok + blocked no mesmo registro TLS e exercitar
  exatamente o caso de evento anterior à criação do modelo. Um blocked recebido
  após iniciar close não impede sucesso se houve close-ok real.
- Fixture oversize passa a entregar o frame completo: só o tamanho anunciado fazia
  o parser esperar corpo e o teste cair em prazo. Nenhum limite do produto relaxado.
- Validação do núcleo ainda em curso; UI será integrada preservando resultados
  separados e exclusão mútua entre HTTPS/AMQPS.

### 2026-10-29 — T-4A2B-INTERFACE-TESTES

- Núcleo aprovado: 37 testes de parser/TLS/AMQP com CA/hostname/expiração/vhost,
  refusals, close confirmado/bloqueado, prazo de close e cancelamento/cleanup.
- UI implementada para validação: testes separados com resultado datado, exclusão
  mútua, cancelamento ao sair e preview de vhost no formulário/resumo; sem sessão.
  Componente comum ConnectionTest evita duplicar ciclo de operações nos dois botões.
- Acrescentados testes de coordenação (15 s, concorrência/cancelamento por transporte,
  senha, revision e respostas atrasadas), componentes e allowlist de 18 métodos.
- Typecheck inicial passou; lint exigiu remover escape desnecessário no parser.
  Revisão corrigiu dois identificadores renomeados indevidamente ao extrair componente.
  Suíte ampla em execução, sem aprovação final/package ainda.

### 2026-10-29 — T-4A2B-SUITE-INTERFACE

- Typecheck/lint e suíte passaram com 215 testes/27 arquivos após ajustes dos mocks
  e da expectativa de menu: teclado da barra customizada é exercitado em Linux,
  pois macOS agora usa o menu do SO conforme 9401448.
- Smoke base adaptado por plataforma: no macOS confere ausência de botões da barra,
  roles nativas e controles IPC reais, preservando testes de estado/zoom/segurança;
  demais plataformas mantêm clique/teclado dos controles customizados.
- Sem declaração de homologação manual do menu do SO. Preparando smoke AMQPS do
  executável, atualização do guia e package; esses resultados ainda pendentes.

### 2026-10-29 — T-4A2B-GUIA-SMOKE-PREPARACAO

- Guia/Ajuda atualizados com tópico AMQPS, prévia de vhost/campo, CA nos dois
  endpoints, erros/limites/efeitos e menus corretos por plataforma; Markdown gerado.
- Preparado smoke isolado AMQPS do pacote: nenhuma conexão automática, sem senha,
  TLS/SASL/vhost/close sem canais, erros/blocked, concorrência/prazo/cancelamento,
  revisão/reload/fechamento e zoom. Nenhum broker real nessa fixture.
- Check inicial parou no lint por globais de callbacks Playwright (crypto/storage);
  referências qualificadas com window. Próxima rodada inclui nova regressão de
  cancelamento antes de TCP/DNS concluir; pacote/smokes ainda pendentes.

### 2026-10-29 — T-4A2B-DOCUMENTACAO-TECNICA

- Sincronizados AGENTS/estado/roadmap/PROJECTS para execução autorizada; criadas
  evidências parciais e detalhes de arquitetura/segurança/NFR-034–036 do contrato.
- Registrados socket próprio/TCP antes de TLS, API callback pública/close bloqueado,
  parser compartilhado sem schema novo e limites de teste versus sessão/parser global.
- Typecheck/lint e 216 testes/27 arquivos passaram. Check parou apenas na formatação
  de linha da tela Sobre; corrigir formatação antes do pipeline de pacote/smokes.
- Guia/Ajuda têm 13 tópicos e prévia de vhost como novo campo de leitura. Restam
  resultados do executável, revisão do artefato/capturas e sincronização final.

### 2026-10-29 — T-4A2B-PACOTE-REVISAO

- Check passou com 216 testes/27 arquivos, typecheck/lint/format/docs:check;
  package darwin-arm64 gerado. Smoke base parou na asserção de estado da janela.
- Harness macOS chamava o próximo IPC antes de completar a restauração anterior;
  acrescentada espera/asserção de restauração e identificação do estado no erro,
  mantendo os critérios de minimizar/maximizar sem alterar produto/host.
- Revisão do adapter remove listeners próprios de erro/blocked quando o modelo
  fecha; nenhuma API privada usada. Revalidar check/package/smokes após esse ajuste.
- Nenhum broker RabbitMQ real, commit, push ou avanço à 4A.2C.

### 2026-10-29 — T-4A2B-SMOKES-RESULTADOS-REVISAO

- Check completo com 216 testes/27 arquivos e pacote passaram; quatro smokes
  sequenciais também passaram: base/Ajuda/segurança, perfis, HTTPS e AMQPS.
- AMQPS no Electron 45.1.0/Node 24.22.1: prazo clique-feedback 15.477 ms,
  cancelamento/revision/reload/close com sockets liberados e nenhuma sessão/canal.
  HTTPS regressão: 10.417 ms; zero requests externos pelo Chromium nos harnesses.
- Inspeção visual mostrou capturas nativas antes de o compositor pintar tema/scroll;
  helper passa a esperar dois frames, sem mudar produto. Repetir somente smoke
  AMQPS/capturas com prova adicional de DNS e IP no próprio runtime empacotado.
- Nenhuma versão de broker ou plataforma adicional homologada; Docker sem daemon.

### 2026-10-29 — T-4A2B-ARTEFATO-REVISAO-FINAL

- ASAR inspecionado: 947.976 bytes, SHA-256
  a9ebb984b6e2b1a7827339a921324400862ded77f68f8352f9332d0d332d8147.
  Nove arquivos incluindo licenças; preload só requer electron, AMQP só no main;
  13 tópicos presentes e nenhuma fixture/chave/sentinela de senha no pacote.
- Capturas finais com pintura aguardada revisadas (temas/zoom). DNS e IP no
  runtime empacotado passaram; última rodada AMQPS mediu 15.535 ms clique-feedback.
- 43 arquivos protegidos preservados contra baseline, incluindo 9401448/políticas.
  Lock só adiciona raiz/amqplib 2.2.0; sem transitiva ou alteração alheia.
- Revisão do critério de quit identificou prova adicional útil: smoke AMQPS agora
  encerra processo com handshake pendente, reabre e exige redigitação da senha.
  Reexecutar apenas esse harness/lint no mesmo ASAR; nenhum produto modificado.

### 2026-10-29 — T-4A2B-RESULTADOS-FINAIS

- Smoke AMQPS final aprovado no mesmo ASAR: DNS/IP, quit durante handshake pendente,
  zero sockets após sair e senha indisponível após reabrir. Prazo clique-feedback
  15.475 ms; deadline do serviço 15.000 ms, sem retry ou sessão/canal.
- Capturas de temas e zoom 200% revisadas; sem alteração de produto após o pacote.
  Check de 216 testes/27 arquivos, package e quatro smokes são os resultados finais.
- Revalidadas fontes oficiais: matriz 4.4.0/4.3.6 mantida, código callback/blocked
  do cliente fixado conferido; isso não substitui execução de RabbitMQ real.
- Evidências/estado/arquitetura/segurança/NFRs/M01/requisitos/MVP/dependências/progresso
  e guia/Ajuda sincronizados. Corrigida ambiguidade documental: arquivo não contém
  segredo em texto puro; a senha transitória de fato existe em memória no main.
- Próxima ação: conferência documental/whitespace/hashes e apresentação da 4A.2B
  para conclusão/commit. Sem novo commit, push, provider real ou etapa 4A.2C.

### 2026-10-29 — T-4A2B-CONFERENCIA-DOCUMENTAL-CLEANUP

- Conferência final aprovada: docs:check/format:check/whitespace, 39 Markdown,
  304 links locais, 109 tabelas e 13 âncoras; guia com 12 campos. Index vazio.
- Localizados dois diretórios temporários das execuções que terminaram em SIGSEGV,
  criados exatamente em 13:37:47Z e 13:39:16Z; correspondem aos dois testes registrados.
  Conferir marcador/configuração sintética e remover somente esses diretórios próprios.
  Nenhum certificado/configuração do usuário acessado ou removido.
- Preparar snapshot dos arquivos apresentados (incluindo três renomeações com
  caminhos antigos removidos) e hash do ASAR para conferir futuro aceite de conclusão.

Cleanup confirmado: os dois diretórios sintéticos das execuções interrompidas
foram removidos após conferir origem/marcadores; nenhuma fixture TLS própria
permanece no diretório temporário. Sem arquivo de usuário removido. Snapshot local
da entrega será usado para conferir alterações antes do eventual commit aprovado.

Entrega 4A.2B pronta para revisão: snapshot criado com 56 caminhos (três caminhos
antigos removidos por renomeação), hashes dos arquivos existentes e do ASAR.
HEAD 9401448/index vazio; código testado e guia preservados desde o pacote final.
Aguardar aprovação de conclusão e do commit feat(connections): add cancellable
AMQPS connection tests. Não executar 4A.2C ou push neste aceite pendente.

### 2026-10-29 — T-4A2B-RABBITMQ-REAL-INICIO

- Pedido: “Faça o teste com o rabbitmq real, o docker já está ativado.”
- Retomada: AGENTS/PROJECTS/arquitetura/roadmap/estado/progresso e Git consultados;
  branch chore/modernization-app, HEAD 9401448, entrega anterior preservada, sem staging.
- Docker respondeu com Engine 29.8.0; nenhum container em execução. Existem imagens
  de outros projetos, que serão preservadas.
- Escopo: provisionar exclusivamente containers temporários RabbitMQ da matriz
  aceita, TLS/usuários/vhosts sintéticos e portas loopback; exercitar o aplicativo
  empacotado e documentar resultados/cleanup. Sem broker do usuário, sessão 4A.2C,
  dependências novas, commit ou push. Testes reais ainda não executados.

### 2026-10-29 — T-4A2B-RABBITMQ-HARNESS

- Criado tools/testing/rabbitmq-real.cjs: imagens oficiais por digest, rede/container
  identificados por execução, somente portas host loopback, TLS efêmero e definições
  com hashes salteados de senhas geradas em memória. Nenhuma credencial no relatório.
- Testa executável existente por UI, HTTPS whoami, AMQPS/vhosts exatos, recusas,
  confiança padrão, cancelamento/prazo via relay TCP opaco e cleanup do broker.
- Confirmado snapshot: somente PROJECTS mudou entre a apresentação e esta Task;
  produto/artefato preservados. Pull 4.4.0 concluído; 4.3.6 ainda em curso.
- Lint/formatação e execução do novo harness em curso; nenhum resultado real
  declarado antes da confirmação. Sem commit/push ou próxima fase.

### 2026-10-29 — T-4A2B-RABBITMQ-CONFIG-AJUSTE

- Ambas as imagens oficiais arm64 baixadas. Primeira tentativa teve timeout de
  readiness; repetição com diagnóstico detectou management.tcp.port=none inválido
  (essa opção exige inteiro). Erro restrito à configuração do harness.
- Corrigido para manter eventual listener HTTP somente no loopback interno do
  container, sem publicação no host; o app/observador continuam exclusivamente TLS.
- Acrescentado diagnóstico de saída prematura do container com mensagens filtradas.
  Cleanup das duas tentativas confirmou remoção dos próprios containers/redes/dados.
- Reexecutar matriz; sem alteração do produto, relaxamento TLS, commit ou push.

### 2026-10-29 — T-4A2B-RABBITMQ-PRIMEIROS-RESULTADOS

- RabbitMQ 4.4.0 real iniciou com TLS. Passaram HTTPS/whoami, AMQPS abertura/close
  nos seis casos de vhost (padrão explícito/ausente, barra, % literal, Unicode e ponto),
  DNS/IP, senha incorreta, vhost ausente/sem permissão, usuário sem acesso, nova
  tentativa explícita e cancelamento durante TLS com exclusão mútua.
- Caso de deadline não atingiu a mensagem esperada: broker encerra seu handshake
  TLS antes do prazo do aplicativo. Ajustar exclusivamente timeouts do broker de
  teste para 30 s, permitindo observar o deadline 15 s do app sem fechamento remoto
  anterior. Não houve sucesso declarado para a matriz completa.
- Container/rede/certificados/dados temporários removidos pelo finally. Produto
  e ASAR intactos; nova execução do harness necessária.

### 2026-10-29 — T-4A2B-RABBITMQ-LOG-CHECK

- Com timeout do broker ajustado, cancelamento/prazo do app e rejeição da CA privada
  pela confiança padrão passaram nos endpoints reais 4.4.0; deadline clique-feedback
  medido em 15.463 ms. Restaram as conferências finais do observador/logs.
- Asserção do harness esperava ordem incorreta das palavras no log de vhost;
  fonte oficial rabbit_reader.erl v4.4.0 confirma “authenticated and granted access
  to vhost”. Corrigir a expectativa e guardar log local filtrado da fixture.
- Todos os recursos próprios removidos após a asserção; nenhuma mudança de produto.
  Reexecutar matriz para fechar os resultados completos, sem declarar sucesso final.

### 2026-10-29 — T-4A2B-RABBITMQ-440-APROVADO

- RabbitMQ 4.4.0 real: 20 verificações do executável passaram. API retornou versão
  exata; logs confirmaram os vhosts decodificados e encerramentos AMQP.
- Observador confirmou zero conexões/canais vivos, filas/consumidores e contador
  acumulado channel_created=0. Deadline clique-feedback 15.484 ms nesta rodada.
- Container/rede/certificados/userData próprios removidos, cleanup confirmado.
- Instância 4.3.6 real iniciou com TLS; mesma bateria em execução. ASAR preservado.

### 2026-10-29 — T-4A2B-RABBITMQ-MATRIZ-CONCLUIDA

- RabbitMQ 4.4.0 e 4.3.6 reais: 20 verificações por versão passaram no mesmo
  executável darwin-arm64/Electron 45.1.0/Node 24.22.1. Imagens oficiais arm64
  resolvidas e executadas pelos digests registrados nas evidências/relatórios.
- HTTPS/whoami, AMQPS/abertura/close, vhosts exatos, DNS/IP, senha incorreta,
  vhost inexistente/sem permissão, usuário sem acesso, nova tentativa explícita,
  CA padrão rejeitando a privada, cancelamento/exclusão mútua e prazo passaram.
- Deadline clique-feedback: 15.484 ms (4.4.0) e 15.574 ms (4.3.6); relay TCP opaco
  reteve resposta TLS do broker real. Serviço mantém prazo de 15.000 ms.
- Logs confirmaram vhosts e closes; API mostrou channel_created=0, nenhum canal/
  conexão vivo, fila ou consumidor. Nenhuma sessão ativa ou request externo Chromium.
- Cleanup confirmado: zero containers/redes próprios restantes, userData/keys/CA
  temporários removidos. Containers/redes/imagens de outros projetos preservados;
  imagens baixadas ficam no cache Docker. ASAR mantém SHA-256 anterior.
- Atualizar evidências/AGENTS/estado/progresso/roadmap/M01/estratégia de testes.
  Guia/Ajuda não mudam: nenhum comportamento/formulário foi alterado. Validar sua
  sincronização e checks do novo harness; conclusão/commit e 4A.2C seguem pendentes.

### 2026-10-29 — T-4A2B-RABBITMQ-REPRODUCAO

- Revisão fixou no harness os dois digests oficiais efetivamente executados, em
  vez de resolver novamente tags mutáveis nas próximas execuções. Relatório passa
  a registrar data/hora e exigir channel_created=0 sem cobertura condicional.
- Reexecutar matriz final após esse ajuste exclusivo do harness, nos mesmos
  digests/ASAR; nenhuma alteração funcional do app ou nova dependência.
- Evidências e instruções de reprodução em sincronização. Guia/Ajuda preservados.

### 2026-10-29 — T-4A2B-RABBITMQ-VALIDACAO-FINAL

- Rodada final com digests fixados/timestamp e contador de canais obrigatório:
  20 checks por versão passaram novamente em RabbitMQ 4.4.0/4.3.6. Prazo
  clique-feedback final: 15480 ms / 15492 ms, serviço 15.000 ms.
- npm run check repetido: typecheck/lint, 216 testes/27 arquivos, formatação e
  docs:check passaram. Os 40 checks reais não são somados à contagem Vitest.
- Evidências e documentação de continuidade sincronizadas; guia/Ajuda preservados
  e check de sincronização passou, pois não há alteração de comportamento/campos.
- Conferência final em curso: links/whitespace, hashes do produto/ASAR, recursos
  próprios removidos e atualização do snapshot para revisão. Conclusão/commit
  continuam pendentes; sem push ou início de 4A.2C.

### 2026-10-29 — T-4A2B-RABBITMQ-ENTREGA

- Conferência final aprovada: 39 Markdown, 322 links locais e 111 tabelas válidos;
  docs:check/format/lint/typecheck/216 testes e git diff --check aprovados.
- Matriz real final: 20 checks por versão, zero canais criados, cleanup confirmado.
  Nenhum container/rede próprio ou diretório bunnies-real-rabbitmq restante.
- Mesmo ASAR de 947.976 bytes, SHA-256
  a9ebb984b6e2b1a7827339a921324400862ded77f68f8352f9332d0d332d8147.
- Desde a apresentação anterior, somente documentos e o novo harness real foram
  alterados; produto/guia/assets/Titlebar/lock/ferramentas anteriores preservados.
  Snapshot da entrega atualizado para 57 caminhos, mantendo o snapshot anterior
  em out/4a2b-ready-review-before-real.json. HEAD 9401448/index vazio.
- Entregar resultados e aguardar aprovação de conclusão/commit 4A.2B. Pedido de
  teste real não foi interpretado como aceite de commit ou autorização 4A.2C.

### 2026-10-30 — T-CONSULTA-PROXIMA-FASE

- Pedido: “Qual a próxima fase?”; consulta ao AGENTS/PROJECTS/estado e roadmap,
  com branch chore/modernization-app, HEAD 9401448 e alterações existentes preservadas.
- Snapshot de revisão conferido: todos os 57 caminhos apresentados permaneciam
  idênticos antes desta atualização obrigatória do histórico.
- Próxima fase técnica prevista: 4A.2C, ativar/encerrar sessão e ciclo de recuperação.
  Exige contrato próprio e aprovação antes de implementação. Consulta não é aceite
  de conclusão/commit 4A.2B nem autorização da fase seguinte.
- Pendente imediato: aprovação de conclusão/commit 4A.2B, já verificada com 216
  testes e 40 checks reais em RabbitMQ 4.4.0/4.3.6 na execução de 29/10.
- Nenhum teste funcional repetido ou código alterado nesta consulta. Whitespace
  conferido; snapshot atualizado somente para esta entrada de histórico. Sem commit/push.

### 2026-10-30 — T-4A2B-ACEITE-COMMIT

- Pedido: “Aprove a 4A.2B, e siga para a próxima etapa” aceitou a conclusão da
  entrega apresentada e autorizou seu commit feat(connections): add cancellable
  AMQPS connection tests. Próximo trabalho: preparar contrato 4A.2C, sem antecipar
  implementação de escolhas ainda não apresentadas.
- Conferidos branch chore/modernization-app, HEAD 9401448, index vazio, os 57
  caminhos do snapshot e SHA-256 do ASAR: todos idênticos à revisão, sem mudanças
  adicionais do proprietário. Protegidos produto testado/guia/assets/Titlebar/lock.
- Sincronizando aceite em AGENTS/PROJECTS/estado/progresso/roadmap/evidências e
  referências correntes; sem mudança de código, comportamento, guia ou dependências.
- Resultados aceitos: check com 216 testes/27 arquivos, package/quatro smokes e
  40 checks em RabbitMQ real 4.4.0/4.3.6. Não repetidos para sincronização documental.
- Limitações aceitas: nó único/macOS arm64, demais alvos/cluster/HA/assistivas/
  nativos/providers/releases não homologados. Nenhuma sessão/operação de mensagem.
- Este registro integra o commit aprovado com pai 9401448; consultar seu hash no
  Git, evitando autorreferência. Conferir docs/links/whitespace antes do registro
  e os caminhos/parent/working tree depois. Sem push ou execução 4A.2C.

Conferência do aceite 4A.2B: docs:check e whitespace passaram; 39 Markdown,
322 links locais e 111 tabelas válidos. Código/guia/ferramentas apresentados
permanecem idênticos. Selecionar somente os 57 caminhos do snapshot e as mudanças
documentais de aceite nesses mesmos caminhos; conferir commit/parent após gravar.
