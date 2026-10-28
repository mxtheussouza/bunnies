# Bunnies — histórico vivo do projeto

Atualizado em: 2026-10-28.

## Estado atual

- Branch: `chore/modernization-app`.
- Última entrega aprovada: **4A.2A — CA personalizada e teste HTTPS**.
- Aprovação atual: **“Aprovado”** aceitou a conclusão 4A.2A e o commit apresentado.
- Último commit: esta entrega, `feat(connections): add custom CA and HTTPS authentication tests`,
  com pai `66183f7`; consultar hash no Git (evitar hash autorreferente).
- Task atual: registrar/conferir o commit aprovado 4A.2A e a sincronização do aceite.
- Próxima ação: finalizar somente esse registro; 4A.2B/C exigem contratos/autorizações próprios.

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
| 4A.2A | CA por perfil, JSON v2/backup v1 e teste explícito HTTPS | Concluída/aprovada; commit desta entrega, pai 66183f7 |

## Entrega DOC.1 aprovada

- Histórico vivo com tarefas, decisões, pendências e testes; regras de leitura e
  atualização obrigatórias no AGENTS central.
- Guia PT-BR com 11 tópicos e todos os oito campos atuais do formulário, ações,
  menus, exemplos e solução de problemas; link no README.
- Ajuda offline no aplicativo com a mesma fonte, índice acessível e foco/rolagem.
- Gerador/check de documentação, 133 testes aprovados, package/smokes e revisão visual.

## Pendências e decisões

- Conclusão/commit 4A.2A aprovados; nenhuma sessão ativa. Contratos/execução AMQPS
  e sessão (4A.2B/C) continuam pendentes de autorização específica.
- Alteração posterior local em misc/window/components/Titlebar/index.tsx preservada
  fora do commit aprovado; não integra o pacote/testes apresentados.
- Atualizar este arquivo a cada Task/fase/alteração, mantendo histórico de decisões,
  testes realmente executados e pendências. Não incluir credenciais ou dados pessoais.
- Preservar stack, identidade e isolamento; nenhuma dependência nova prevista.
- Senha persistente segue desligada em todos os alvos: provider real e gates sem prova.
- Revisão manual dos diálogos/seletores nativos, leitores de tela e outros SOs/CPUs
  pendente. RabbitMQ real não executado (Docker sem daemon); sem homologação de
  compatibilidade/release ou push autorizado.

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
