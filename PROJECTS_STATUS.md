# Bunnies — histórico vivo do projeto

Atualizado em: 2026-10-28.

## Estado atual

- Branch: `chore/modernization-app`.
- Última entrega aprovada: **DOC.1 — Histórico vivo, guia do usuário e Ajuda offline**.
- Aprovação atual: o proprietário respondeu **“Aprovado”** à solicitação explícita
  de conclusão DOC.1 e do commit
  `feat(help): add offline user guide and project status tracking`.
- Registro Git: este estado integra o commit aprovado da DOC.1; consultar seu hash
  em `git log -1`. Último commit anterior: `fe4a252` (4A.1).
- DOC.1 concluída; histórico, regras no AGENTS, guia e Ajuda offline aprovados.
- Próxima ação: conferir o registro no Git ao retomar e aguardar contrato/aceite
  da próxima fase. Não há nova implementação autorizada; a 4A.2 continua não autorizada.

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
| DOC.1 | Histórico vivo, guia do usuário e Ajuda offline | Concluída/aprovada; commit que contém este registro |

## Entrega DOC.1 aprovada

- Histórico vivo com tarefas, decisões, pendências e testes; regras de leitura e
  atualização obrigatórias no AGENTS central.
- Guia PT-BR com 11 tópicos e todos os oito campos atuais do formulário, ações,
  menus, exemplos e solução de problemas; link no README.
- Ajuda offline no aplicativo com a mesma fonte, índice acessível e foco/rolagem.
- Gerador/check de documentação, 133 testes aprovados, package/smokes e revisão visual.

## Pendências e decisões

- DOC.1 concluída e aprovada; conferir o registro Git ao retomar. Nenhuma função
  futura está autorizada. Próxima etapa depende de contrato e aceite próprios.
- Atualizar este arquivo a cada Task/fase/alteração, mantendo histórico de decisões,
  testes realmente executados e pendências. Não incluir credenciais ou dados pessoais.
- Preservar stack, identidade e isolamento; nenhuma dependência nova prevista.
- Senha persistente segue desligada em todos os alvos: provider real e gates sem prova.
- Revisão manual dos diálogos/seletores nativos, leitores de tela e outros SOs/CPUs
  pendente. Sem integração RabbitMQ, homologação de release ou push autorizado.

## Testes executados

4A.1: `npm run check` passou com **130 testes em 17 arquivos**, typecheck, lint e
formatação. `npm run package`, `npm run smoke:package` e
`node tools/testing/profiles.cjs` passaram em macOS 27.0.1 arm64.
ASAR apresentado: `f5085b0648745ed5285bdc1eb4a6285a4b5818c04d108d0852d49b0c45fa9acb`.
DOC.1: `npm run check` passou com **133 testes em 18 arquivos**, typecheck, lint,
formatação e `docs:check`; package, smoke de Ajuda/segurança e smoke de perfis
passaram em macOS arm64. Checagem negativa de guia divergente passou em cópia temporária.

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
