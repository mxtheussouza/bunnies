# Roadmap e contratos de execução

Atualizado em: 2026-11-20. Etapas 0–3B, 4A.1, DOC.1, 4A.2A/B/C e 4B.1/4B.2
concluídas e aprovadas. Nove ADRs e D3A-01–08 aceitos. O gate 4B.2 inicial
falhou nas duas versões e o gate revisto passou após o aceite do fechamento
confirmado. “Aprovado” aceitou a conclusão e o commit da 4B.2.
A revisão da 5A foi aceita por “Aprovo”. O gate revisado, os smokes e a
matriz do pacote passaram, e o proprietário aprovou a conclusão e o
registro local da 5A. “Aprovado” aceitou a conclusão e o registro local da 5B.
A 5C.1 foi concluída e aprovada após o gate, os smokes e a matriz do pacote.
“Aprovo” aceitou a conclusão da 6A de leitura de exchanges e bindings e o commit local.

## Sequência proposta

| Etapa | Entrega verificável | Situação |
| --- | --- | --- |
| 0 | Auditoria técnica do legado, somente de leitura | Concluída e aprovada pelo proprietário |
| 1A | Registro documental da auditoria, governança e propostas | Concluída e aprovada; commit `c292b35` |
| 1B | Stack, matriz tecnológica, arquitetura, MVP e estratégia de testes | Concluída e aprovada; sete ADRs Accepted e commit autorizado |
| 2A | Ambiente reproduzível, dependências compatíveis, tipagem, lint e CI inicial | Concluída e aprovada; commit autorizado por “Sim” |
| 2B | Ciclo desktop, fronteira segura, erros e smoke de empacotamento | Concluída e aprovada; commit autorizado |
| 3A | Navegação, tokens e componentes para aprovação | Concluída e aprovada; D3A-01–08 Accepted e commit autorizado |
| 3B | Interface base acessível, temas e estados | Concluída e aprovada; commit autorizado por “Aprovado” |
| 4A.1 | Perfis locais e proteção condicionada de credenciais | Concluída e aprovada; commit autorizado |
| DOC.1 | Histórico vivo, guia e Ajuda offline | Concluída e aprovada; commit 66183f7 |
| 4A.2 | Testes HTTPS/AMQPS, CA customizada e ciclo de sessão | A/B/C concluídas/aprovadas; última entrega aba792d |
| 4B.1 | Contexto administrativo: versão, vhosts visíveis e leitura do vhost atual | Concluída/aprovada; commit `4a35424` |
| 4B.2 | Seleção de vhost e transição de contexto | Concluída e aprovada em 2026-11-18 |
| 5 | Filas e proteção das operações destrutivas | 5A, 5B e 5C.1 concluídas, aprovadas e registradas. Exclusão condicional aguarda solução no broker |
| 6 | Exchanges e bindings | 6A concluída e aprovada após validação em macOS arm64. Escritas dependem de contratos próprios |
| 7 | Publicação AMQP, confirmações e falhas de rede | Proposta |
| 8 | Dashboard e monitoramento básico | Proposta |
| 9 | Homologação integrada, segurança e compatibilidade do MVP | Proposta |
| 10 | Instaladores, estratégia de assinatura e validação por SO | Proposta |
| 11 | Release aprovada; publicação com autorização específica | Proposta |
| Pós-MVP | Administração avançada, inspeção e produtividade | Sem autorização; dividir em contratos próprios |

Segurança, documentação, testes e smoke de distribuição acompanham a fundação e
cada incremento; a Etapa 9 não adia esses requisitos. Um contrato poderá dividir uma
etapa complexa, mas não ampliar seu escopo sem aprovação.

## Contrato aprovado — Etapa 1A

| Campo | Conteúdo autorizado |
| --- | --- |
| Identificador e nome | 1A — Registro documental da auditoria e governança |
| Objetivo | Materializar evidências, recomendações e fluxo operacional para revisão |
| Justificativa | Estabelecer continuidade e rastreabilidade antes de modificar a aplicação |
| Escopo | Documentação da auditoria; visão, avaliação tecnológica, MVP e roadmap propostos; instruções dos agentes |
| Tarefas | Conferir Git e evidências; escrever documentos; revisar links, consistência e diff; apresentar resultados |
| Módulos afetados | Documentação transversal dos oito módulos, sem implementação |
| Arquivos previstos | Os 12 arquivos listados abaixo |
| Dependências | Auditoria apresentada e aprovação explícita do proprietário |
| Branch | Utilizar a branch existente `chore/modernization-app` |
| Riscos | Confundir proposta com decisão; registrar versões temporais como metas definitivas; referências inconsistentes |
| Critérios de aceitação | Evidências rastreáveis, links locais válidos, limitações registradas e nenhuma decisão pendente apresentada como aprovada |
| Verificação | Revisão documental; conferência contra código/lockfile; validação de referências e whitespace; inspeção do diff e Git |
| Resultado esperado | Pacote documental pronto para revisão do proprietário |
| Impacto documental | Referência operacional, propostas e estado retomável |

Arquivos desta entrega:

1. [AGENTS.md](../../AGENTS.md).
2. [product-vision.md](../00-overview/product-vision.md).
3. [repository-inventory.md](../01-audit/repository-inventory.md).
4. [legacy-analysis.md](../01-audit/legacy-analysis.md).
5. [dependency-audit.md](../01-audit/dependency-audit.md).
6. [technical-debt.md](../01-audit/technical-debt.md).
7. [technology-evaluation.md](../03-architecture/technology-evaluation.md).
8. [mvp-scope.md](../02-requirements/mvp-scope.md).
9. [module-index.md](../04-modules/module-index.md).
10. Este `roadmap.md`.
11. [current-stage.md](current-stage.md).
12. [progress.md](progress.md).

A autorização do proprietário foi a resposta **“Aprovo”** à entrega da Etapa 0 e ao
contrato acima. Ela aprova a auditoria e a escrita documental, mantendo stack,
arquitetura e MVP como propostas. Não autoriza commit da Etapa 1A ou execução da 1B.

A aprovação posterior **“Aprovado”**, após a revisão da entrega, autorizou a
conclusão da Etapa 1A e o commit
`docs(audit): document legacy audit and modernization proposals`. Essa aprovação
não autoriza executar a Etapa 1B nem aceita as decisões arquiteturais propostas.

## Regra para as próximas etapas

Antes de executar, apresentar identificador, nome, objetivo, justificativa, escopo,
tarefas, módulos, arquivos, dependências, riscos, critérios de aceitação, testes,
resultado e impacto documental. Aguardar aprovação explícita. Em seguida:

```text
Contrato e aprovação → implementação → verificações → revisão técnica
→ documentação → apresentação → aprovação de conclusão → commit
→ nova proposta de etapa e nova autorização
```

Silêncio não é aprovação. Descobrir uma decisão significativa não prevista exige
interromper o trabalho dependente e apresentar a decisão.

## Contrato aprovado — Etapa 1B

A resposta **“Autorizado”** aprovou executar o contrato apresentado após o commit da
1A. O proprietário respondeu **“Nada definido”** à consulta sobre ambientes, CPUs e
autenticação. A matriz de referência e os valores de qualidade são propostas do
planejamento, sem requisito externo presumido.

| Campo | Conteúdo autorizado |
| --- | --- |
| Identificador e nome | 1B — Planejamento e decisões arquiteturais |
| Objetivo e justificativa | Especificações verificáveis antes da implementação |
| Escopo e tarefas | Detalhar requisitos, MVP, alternativas/matriz, arquitetura, segurança e testes; preparar sete ADRs Proposed; revalidar fontes e revisar documentos |
| Módulos afetados | Os oito módulos, somente no planejamento e contratos |
| Arquivos previstos | Os 12 novos e sete atualizados listados abaixo |
| Dependências | Etapas 0/1A concluídas; commit `c292b35`; autorização específica da 1B |
| Riscos | Incompatibilidade de tooling, ambiente não definido, metas não medidas e confusão entre proposta e decisão |
| Critérios de aceitação | Requisitos rastreáveis; limites claros; alternativas fundamentadas; decisões e gates pendentes explícitos; código e auditoria histórica preservados |
| Verificações | Fontes oficiais/metadados; revisão técnica; links, tabelas, IDs, rastreabilidade, status ADR e diff; sem instalar/executar aplicação |
| Resultado esperado | Pacote de planejamento para aprovação das decisões e conclusão |
| Impacto documental | Arquitetura/requisitos/testes/segurança propostos e estado sincronizado |

Novos arquivos:

1. [functional-requirements.md](../02-requirements/functional-requirements.md).
2. [non-functional-requirements.md](../02-requirements/non-functional-requirements.md).
3. [architecture.md](../03-architecture/architecture.md), conceitual, inicialmente Proposed e posteriormente aceita.
4. [ADR-0001](../03-architecture/adr/0001-desktop-stack.md).
5. [ADR-0002](../03-architecture/adr/0002-rabbitmq-transports.md).
6. [ADR-0003](../03-architecture/adr/0003-desktop-security-boundary.md).
7. [ADR-0004](../03-architecture/adr/0004-local-settings-and-secrets.md).
8. [ADR-0005](../03-architecture/adr/0005-compatibility-matrix.md).
9. [ADR-0006](../03-architecture/adr/0006-message-inspection.md).
10. [ADR-0007](../03-architecture/adr/0007-desktop-distribution.md).
11. [test-strategy.md](../07-testing/test-strategy.md).
12. [security-model.md](../08-security/security-model.md).

Atualizados: `AGENTS.md`, `mvp-scope.md`, `technology-evaluation.md`, `module-index.md`,
`roadmap.md`, `current-stage.md` e `progress.md`. Os quatro documentos de auditoria
histórica e os 53 arquivos legados permanecem intactos.

Após a apresentação, o proprietário respondeu **“Aprovado”** ao pedido explícito de
aceite dos ADRs 0001–0007, MVP, requisitos/limites, conclusão e commit da 1B.
Os ADRs foram convertidos para Accepted e as referências de estado sincronizadas,
incluindo `product-vision.md`. O registro final inclui 12 novos arquivos e oito
atualizados, sem alterar código ou auditoria histórica. A 2A continua sem autorização.

## Próxima etapa proposta — 2A

Com as decisões da 1B aprovadas, apresentar contrato de fundação: resolver a matriz
sem peers forçados, atualizar ferramentas/lockfile, separar tipagem, estabelecer
lint/testes iniciais e CI. Com a stack aprovada, detalhar mudanças físicas de código
nos contratos correspondentes. Nenhuma dessas tarefas está autorizada pela 1B.

## Condições do planejamento

Elaborar e submeter decisões sobre Electron/Tauri, combinação suportada de versões,
contratos, persistência, segurança, testes, compatibilidade e MVP. Registrar ADRs
inicialmente Proposed e converter para Accepted somente após aprovação explícita.
Se a comparação precisar de protótipo executável ou benchmark, apresentar um
contrato específico antes de instalar ferramentas ou escrever o protótipo.

A estrutura definitiva de código depende da aprovação da stack. Não há autorização
para migrar framework, atualizar pacotes ou gerar infraestrutura nesta etapa.

## Evolução documental planejada

Os requisitos, a arquitetura, os ADRs, testes e segurança indicados para a 1B foram
materializados e aprovados nesta entrega. Demais documentos permanecem planejados;
criar quando necessário e autorizado:

| Momento proposto | Documento e finalidade |
| --- | --- |
| 1B | `docs/02-requirements/functional-requirements.md`: requisitos rastreáveis |
| 1B | `docs/02-requirements/non-functional-requirements.md`: metas e restrições verificáveis |
| 1B | `docs/03-architecture/architecture.md`: arquitetura conceitual aceita; estrutura física no contrato de implementação |
| 1B e decisões posteriores | `docs/03-architecture/adr/`: registros de decisão |
| Planejamento dos módulos | `docs/04-modules/01-connection-manager.md` a `08-productivity-tools.md`, conforme índice |
| Fundação | `docs/06-development/coding-standards.md`: padrões e comandos validados |
| 1B/fundação | `docs/07-testing/test-strategy.md`: testes, fixtures e matriz |
| 1B/fundação | `docs/08-security/security-model.md`: ameaças, fronteiras e controles |
| Planejamento de distribuição | `docs/09-releases/release-strategy.md`: artefatos, assinatura e aprovação |

Não criar diretórios vazios. Cada documento de módulo conterá objetivo,
responsabilidades, requisitos, dependências, interfaces, regras, critérios de
aceitação, testes, status e pendências.

## Contrato autorizado — Etapa 2A

- Objetivo: base reproduzível e verificação da matriz aprovada antes das funcionalidades.
- Escopo: Node/npm e dependências necessárias; TypeScript, ESLint e Prettier; testes
  iniciais; CI; compilação, empacotamento e smoke local.
- Arquivos: `.nvmrc`, manifesto/lock, configurações, `tools`, testes, workflow,
  ajustes mínimos de compatibilidade em `src`/`misc` e documentação.
- Organização: manter a estrutura existente; testes de componentes ao lado das
  unidades, configurações de teste na raiz e smoke em `tools/testing`.
- Dependências: ADRs e matriz aceitos na 1B. Não instalar bibliotecas futuras sem uso.
- Riscos: incompatibilidades de APIs/peers e validação limitada ao alvo local.
- Aceitação: instalação limpa sem peers forçados; typecheck, lint, testes, formatação
  e empacotamento/smoke local aprovados, com limitações registradas.
- Resultado: fundação verificável, comandos e evidências documentados.
- Aprovação: “Autorizado”, em resposta ao contrato apresentado após `97cd313`.
- Limites: sem 2B, funcionalidades RabbitMQ, redesign, publicação ou commit antes
  da aprovação de conclusão.

Evidências e limitações da execução: [fundação 2A](../07-testing/foundation-2a.md).
O contrato da 2B será apresentado após aprovação de conclusão/registro da 2A;
a preparação da CI não autoriza push nem comprova execução remota.

A resposta posterior **“Sim”** aprovou a conclusão da 2A e autorizou seu commit
`chore(setup): modernize desktop development foundation`. A proposta abaixo
não foi autorizada por esse aceite.

## Contrato autorizado — Etapa 2B: fronteira segura e ciclo desktop

Status: **Execução autorizada** pela resposta “Autorizado” após o commit `27e4f95`.
Conclusão e commit posteriormente aprovados por “Aprovado”, após apresentação
das evidências e limitações.

| Campo | Proposta para aprovação |
| --- | --- |
| Identificador e nome | 2B — Fronteira segura e ciclo desktop |
| Objetivo | Reduzir a superfície privilegiada do Electron antes de integrar brokers |
| Justificativa | A 2A validou a fundação local, mas sandbox, IPC, navegação, CSP e ciclo da janela ainda têm achados abertos |
| Escopo | Main/preload/renderer, contratos desktop, recursos locais e testes de segurança dessa fronteira; preservar identidade e tela legada |
| Tarefas | Ativar sandbox/context isolation; substituir a ponte legada por métodos tipados mínimos; validar remetente/frame/URL e argumentos; tratar rejeições e erros sem dados privilegiados; restringir navegação/popups/permissões; servir recursos por protocolo local restrito; extrair CSS e aplicar CSP de produção; corrigir ciclo e registro/remoção de IPC; obter plataforma/versão pelo contrato desktop |
| Módulos afetados | Fundação desktop e componentes comuns; nenhum módulo RabbitMQ implementado |
| Arquivos previstos | `src/main/app.ts`, `appWindow.ts` e pequenos módulos em `src/main/ipc` e `src/main/security`; `src/preload/index.ts`; `src/shared/desktop.ts`; consumidores em `src/renderer`, `src/common`, `src/typings` e `misc/window`; configurações em `tools`, testes e workflow se necessário; manifesto/lock apenas para dependências usadas da matriz aprovada |
| Organização física | Mover o entrypoint do preload para `src/preload`; manter a UI em seus diretórios atuais; extrair contratos compartilhados sem Node/React e políticas pequenas testáveis no main; retirar ponte/handlers legados substituídos e resolver o ciclo WindowFrame/Titlebar |
| Dependências | 2A concluída; ADRs 0001/0003/0007 e requisitos/segurança aceitos; validar ferramentas de schema/extração CSS da matriz antes de instalar somente as necessárias |
| Riscos | Diferenças do sandbox Electron 45, preload em desenvolvimento, paths/protocolo/ASAR, regressões em menus/atalhos e limitações da automação/OS |
| Critérios de aceitação | Pacote local renderiza com sandbox ativo, sem Node no renderer e com context isolation; IPC indevido rejeitado; bridge sem acesso genérico a Electron/IPC/URL; recursos fora da raiz/traversal rejeitados; CSP de produção sem inline/eval e sem rede no renderer; navegação/popups/permissões bloqueados; reabertura/encerramento não duplicam handlers; identidade preservada |
| Estratégia de testes | Unitários de políticas/validação/erros e ciclo; testes reais Electron com perfil isolado para fronteira, bridge, CSP e bloqueios; typecheck/lint/componentes; package e smoke local; registrar cobertura parcial de T-01/T-10/T-12 e limitações por alvo |
| Resultado esperado | Base desktop com fronteira verificada no alvo disponível, pronta para evoluir em etapas autorizadas |
| Impacto documental | Atualizar arquitetura/estrutura física, segurança, testes/evidências, comandos, AGENTS e estado/progresso; manter achados históricos preservados |

Links externos serão resolvidos no main por identificadores de destinos fixos, sem
aceitar URL arbitrária do renderer. Edição deve usar mecanismos nativos adequados,
sem expor primitivas genéricas; preservar apresentação, sem antecipar o redesign da 3A.
Não criar APIs de confirmação destrutiva sem casos de uso implementados.

Desenvolvimento permanece restrito ao loopback; exceções necessárias de HMR/CSP não
alcançam o pacote de produção. Distinguir perfil de automação e artefato distribuível;
não enfraquecer um release para viabilizar Playwright. Fuses definitivos, assinatura,
notarização, instaladores, atualização automática e publicação exigem os gates e
contratos de distribuição próprios, não fazem parte desta proposta.

Não inclui integração RabbitMQ, persistência de credenciais, novos módulos de produto,
redesign, push ou homologação dos quatro alvos. Novas decisões significativas que
alterem os ADRs aprovados serão submetidas ao proprietário antes do trabalho dependente.

Entrega da execução autorizada da 2B: [evidências e limitações](../07-testing/desktop-boundary-2b.md).
O proprietário respondeu “Aprovado” à conclusão e ao commit da 2B. Isso não autoriza
a execução da 3A. Alterações locais posteriores em assets foram preservadas fora
do commit da 2B, conforme estado atual.

## Contrato autorizado — Etapa 3A: navegação e design system

Status: **Execução autorizada** por “Autorizo”, após a conclusão da 2B.
Decisões D3A-01–08, conclusão e commit posteriormente aprovados por “Aprovado”.

| Campo | Proposta para aprovação |
| --- | --- |
| Identificador e nome | 3A — Proposta de navegação e design system desktop |
| Objetivo | Definir uma experiência visual e de navegação revisável antes de implementar a interface base |
| Justificativa | A fronteira desktop foi verificada localmente, mas a tela ainda é o boilerplate legado; telas complexas e identidade exigem aprovação antes de implementação |
| Escopo | Planejamento de UX, inventário visual atual, tokens e componentes propostos, navegação do MVP e mockups documentais; preservar nome e avaliar os assets existentes/novos |
| Tarefas | Inspecionar logos/ícones/paleta e alterações locais; propor shell e navegação por conexão/vhost/módulo; definir temas claro/escuro, tipografia, cores semânticas, espaçamento, foco/contraste e redimensionamento; especificar tabelas, pesquisa, filtros, formulários, confirmações, erros e estados; preparar mockups de shell, conexões e listagem de filas com dados sintéticos; apresentar alternativas e recomendar um recorte para a 3B |
| Módulos afetados | Shell/elementos comuns e planejamento visual dos módulos do MVP; sem implementar operações RabbitMQ |
| Arquivos previstos | Novos docs/03-architecture/navigation.md e design-system.md; mockups estáticos em docs/03-architecture/ui-proposals quando necessários; atualizar visão, índice de módulos, testes, roadmap/estado/progresso e AGENTS |
| Dependências | 2B concluída; MVP e requisitos aprovados; recursos visuais disponíveis no workspace; não presumir que alterações locais de assets já foram incluídas ou homologadas |
| Riscos | Descaracterizar a identidade, projetar fluxos incompatíveis com capacidades/permissões do broker, baixa legibilidade/densidade, diferenças entre SOs e confundir mockup com funcionalidade |
| Critérios de aceitação | Navegação e ações do MVP mapeadas; contexto de ambiente/conexão/vhost explícito; produção distinguível; temas e tokens coerentes com a identidade; regras de contraste/foco/teclado/redimensionamento definidas; estados e efeitos destrutivos compreensíveis; decisões pendentes separadas das recomendações |
| Estratégia de verificação | Revisão de fluxos contra requisitos, checagem de contraste dos tokens propostos, inspeção visual dos mockups e links/documentação; nenhuma promessa de acessibilidade/runtime funcional sem implementação |
| Resultado esperado | Proposta de navegação/design pronta para aprovação do proprietário e contrato menor da 3B |
| Impacto documental | Referência de UX/design, justificativa de reuso/alterações visuais recomendadas, decisões pendentes e estado retomável; sem registrar proposta como design aprovado |

Não altera src/misc/tools, dependências ou assets existentes; não incorpora os cinco
assets locais ao commit da 2B nem inicia telas funcionais. A inspeção e os mockups
podem usar os recursos como referência, sem substituir a identidade automaticamente.
Mockups são artefatos de proposta desktop, sem servidor, produto web ou nova stack.
A implementação da 3B e qualquer publicação exigem contratos/autorizações próprios.

A execução autorizada da 3A gerou [navegação](../03-architecture/navigation.md),
[design system](../03-architecture/design-system.md) e
[mockups estáticos](../03-architecture/ui-proposals/README.md). A resposta
**“Aprovado”**, após sua apresentação, aceitou D3A-01–08 e autorizou a conclusão e
o commit `docs(design): define desktop navigation and design system`.
O recorte recomendado da 3B não constitui autorização de implementação.

## Contrato autorizado — Etapa 3B: interface base desktop

Status: **Concluída e aprovada**. Execução autorizada por “Sim” após `c215004`;
conclusão e commit posteriormente aprovados por “Aprovado”. A autorização da 4A
continua separada.

| Campo | Proposta para autorização |
| --- | --- |
| Identificador e nome | 3B — Interface base desktop, temas e estados sem sessão |
| Objetivo | Substituir o boilerplate pela base visual aprovada, utilizável por teclado e sem simular conexão RabbitMQ |
| Justificativa | A 3A definiu o design; o renderer ainda apresenta a tela legada, tema binário e menus em inglês |
| Escopo | Shell React, navegação local, contexto sem sessão, Conexões vazia, Sobre, temas, pequenas primitivas e adaptação visual da barra da janela |
| Tarefas | Aplicar tokens em Sass/CSS externo; implementar sidebar completa/compacta, painel acessível e contexto fixo; iniciar em Conexões; explicar destinos indisponíveis; implementar Sistema/Claro/Escuro e preservar escolha anterior; modernizar Button/Card e criar IconButton/StatusMessage/EmptyState; manter edição/controles nativos; atualizar testes e smoke |
| Módulos afetados | Fundação visual transversal; apresentação vazia de M01 e preferências/teclado de M08; sem casos de uso de broker |
| Arquivos previstos | Entrypoints/estilos/testes em src/renderer; componentes existentes Button/Card e novas primitivas em src/renderer/components; src/renderer/shell e src/renderer/pages; ThemeMode/provider/hooks e testes relacionados em src/providers e src/common; misc/window para rótulos/semântica/estilos; src/main/appWindow.ts somente dimensões iniciais; tools/testing/smoke.cjs e seletores em security.cjs; documentação descrita abaixo |
| Dependências | 3A concluída e commitada; D3A-01–08, ADRs e requisitos aceitos; ferramentas já instaladas da 2A/2B; nenhuma dependência ou biblioteca UI nova prevista |
| Riscos | Perder preferência de tema, conflitos de atalhos/edição, barra de janela sem área de arraste, foco perdido no modo compacto, overflow com zoom, relaxar segurança para estilização ou dar aparência operacional a recursos ausentes |
| Critérios de aceitação | Os nove critérios abaixo atendidos; interface sem sessão honesta; sem regressão da fronteira 2B; código/documentação prontos para revisão |
| Estratégia de testes | Unitários de preferência/migração e eventos do SO; componentes por comportamento acessível/teclado/estados; npm run check; package e smoke Electron local com perfil temporário e suíte de segurança preservada; inspeção visual/zoom e registro dos alvos realmente executados |
| Resultado esperado | Interface base com identidade aprovada, temas persistentes e controles desktop funcionais, pronta para receber M01 na 4A |
| Impacto documental | Atualizar arquitetura física, design/navegação quanto ao que foi implementado, desenvolvimento, estratégia/evidências de teste, AGENTS e roadmap/estado/progresso; registrar limitações sem declarar módulos prontos |

### Organização e limites físicos

- Manter `src/main`, `src/preload` e `src/shared` como fronteira aprovada. A única
  alteração prevista no main é abrir a janela em 1200 × 800, em vez dos atuais
  800 × 600; não alterar webPreferences, protocolo, CSP ou a API privilegiada.
- Criar `src/renderer/shell` apenas para shell/sidebar/contexto e seus estilos e
  testes; `src/renderer/pages` para Conexões vazia e Sobre. Os nomes exatos dos
  arquivos podem seguir a composição mais simples dentro desses limites.
- Reutilizar `src/providers/ThemeMode.tsx` e os componentes existentes; separar
  helpers puros de preferência quando isso facilitar a verificação. Não mover a
  aplicação inteira ou criar camadas de domínio sem regras concretas.
- Persistir somente o enum de tema em chave própria do renderer; migrar `dark-mode`
  `0`/`1` da mesma origem para Claro/Escuro quando não houver preferência nova válida.
  Sem preferência válida, usar Sistema e observar `prefers-color-scheme`; escolha
  manual não é sobrescrita por mudança do SO. Se storage falhar, manter uso em memória.
  A mudança histórica de origem file para bunnies não pode ser recuperada por isso.
- Sidebar: Visão geral, Filas, Exchanges, Publicar e Conexões; Conexões é inicial.
  Sem sessão, os quatro destinos de broker explicam sua indisponibilidade e não
  abrem telas com dados sintéticos. Tema e Sobre continuam disponíveis. Navegação
  local não altera a URL fixa, nem usa router/servidor/deep links.
- Primitivas deste incremento: Button, IconButton, Card, StatusMessage e EmptyState.
  Tabelas de dados, formulários de broker, drawers complexos e confirmações
  destrutivas reais ficam nas etapas dos casos de uso; não fabricar CTAs funcionais.
- Preservar logos e seus bytes. Usar imports dos assets existentes, fontes locais
  e CSS externo compatível com a CSP; nenhum estilo inline/eval para contornar bloqueios.
- Traduzir rótulos próprios do shell/menus para PT-BR sem alterar roles/atalhos
  nativos. Sobre mostra versão real e o destino fixo do autor já permitido na ponte.
  Não criar acesso direto a clipboard, arquivo, rede ou nova ação IPC.
- Adaptar os seletores do smoke/security à nova UI sem retirar nenhuma asserção
  da segurança 2B. Fixtures de estados existem apenas nos testes, sem sessão falsa
  na aplicação. Não instalar pacotes nem editar manifesto/lock neste contrato.

### Critérios verificáveis da 3B

1. Abertura e recarga chegam a Conexões sem sessão; nenhuma tentativa de acessar
   broker e nenhum contador/perfil fictício; contexto distingue HTTPS/AMQPS não iniciados.
2. Cinco destinos identificáveis, contexto persistente e razão acessível de
   indisponibilidade. Sobre/tema operam por teclado sem perder o contexto.
3. Sistema/Claro/Escuro funcionam; escolha persistida, migração `0`/`1`, dados
   inválidos e storage indisponível são exercitados; listeners do SO são removidos.
4. Tokens aprovados aplicados a estados reais; nomes acessíveis, foco visível,
   ordem de Tab, link para conteúdo e Escape/retorno de foco no painel compacto.
5. Sidebar de 224/64 px no breakpoint aprovado; revisar 1440 × 900, 1024 × 700,
   janela menor e zoom 200%, com acesso às ações por reflow/rolagem. Não reduzir
   tipografia para caber ou alegar acessibilidade integral por screenshots.
6. Falha desktop recebe feedback sanitizado e acessível; estados vazios e
   indisponíveis não parecem carregamento infinito. Estados loading/erro/parcial
   das primitivas são exercitados por fixtures de teste, sem conexão simulada no app.
7. Arraste/controles/edição/zoom nativos preservados, sem roubar digitação; testar
   atalhos apenas quando o destino estiver disponível. Nenhum atalho destrutivo.
8. `npm run check`, package e smoke local passam, incluindo as proteções 2B,
   recarga/reabertura e URL invariável. Registrar SO/CPU efetivos, falhas corrigidas
   e pendências dos demais alvos; não enfraquecer o pacote para automação.
9. Revisão visual dos temas e registro de contraste/teclado/zoom efetivamente
   executados; código e documentação sincronizados para aprovação de conclusão.

### Exclusões e resultado de autorização

Perfis reais, cofre, autenticação/TLS, HTTP/AMQP e testes de conectividade pertencem
à 4A/4B e seus contratos. Não inclui CRUD RabbitMQ, leitura/consumo de mensagens,
histórico, gráficos, assinatura/notarização, atualização automática, instaladores,
publicação ou push. Não exige nova stack, dependência ou ADR.

Uma decisão significativa fora desse recorte deverá ser apresentada antes do
trabalho dependente. A aprovação da 3A só autoriza registrar sua entrega e
apresentar este contrato. A resposta posterior **“Sim”** autorizou a execução da
3B. A resposta posterior **“Aprovado”**, após a apresentação dos resultados e
limitações, aprovou sua conclusão e autorizou o commit
`feat(desktop): implement application shell and themes`. Não autoriza executar a 4A.

Entrega autorizada da 3B: [evidências, capturas locais e limitações](../07-testing/interface-3b.md).
Check com 82 testes e package/smoke locais passaram; revisar também a pendência
de interação do menu nativo de tema por teclado, mantida após o aceite da conclusão.

## Contrato autorizado — Etapa 4A.1: perfis locais e proteção de credenciais

Status: **4A.1 concluída e aprovada; execução autorizada por “Autorizo”, após eb535d7**. Dividir a 4A para
revisar persistência/segredos antes de acrescentar rede. 4A.1 entrega os perfis
locais; 4A.2 tratará testes separados HTTPS/AMQPS, CA customizada e ciclo de sessão
em contrato próprio. Nenhum aceite da 3B autoriza essas subetapas.

| Campo | Proposta para autorização |
| --- | --- |
| Identificador e nome | 4A.1 — Perfis locais e proteção de credenciais |
| Objetivo | Cadastrar, editar, listar e remover perfis reais, com armazenamento local limitado e segredo em memória ou protegido pelo SO quando comprovado |
| Justificativa | A interface base está pronta, mas não existem perfis, persistência no main ou proteção de senha; separar rede permite revisar essa fronteira com uma entrega menor |
| Escopo | M01 local: formulário/lista/resumo de perfil, nome/ambiente/endpoints HTTPS e AMQPS/usuário/modo de segredo, JSON versionado e proteção condicionada; sem conexão a brokers |
| Tarefas | Documentar M01 e DTOs/schema; validar entradas no main; implementar leitura/escrita atômica limitada; separar metadados/ciphertext/segredo em memória; integrar API assíncrona candidata do SO com gate de provider; ampliar IPC por operações nomeadas; substituir o estado vazio por CRUD local e revisar estados/foco/erros; testar e registrar evidências |
| Módulos afetados | M01 Connection Manager, configuração/segredos/IPC no núcleo e apresentação Conexões; shell/temas preservados |
| Arquivos previstos | Novos módulos pequenos em src/main/profiles e adapter em src/main/security; handler em src/main/ipc; src/main/app.ts para composição/cleanup; contratos em src/shared/profiles.ts; extensão explícita de src/preload/desktopApi.ts e src/shared/desktop.ts; páginas/formulário/primitivas necessárias em src/renderer; testes próximos das unidades e tools/testing; documentos descritos abaixo |
| Dependências | 3B concluída e commitada; ADRs 0001/0003/0004 e requisitos/MVP aceitos; Electron/Node já instalados; nenhuma lib de broker, schema, banco ou UI nova prevista |
| Riscos | Provider fraco/indisponível, prompts do SO e assinatura macOS; vazamento por DTO/log/erro; arquivo corrompido, falha de escrita ou conflito; senha antiga repovoada no formulário; confundir perfil salvo com sessão ativa |
| Critérios de aceitação | Os oito critérios abaixo atendidos, limites respeitados e limitações por SO registradas; persistência de senha nunca habilitada apenas para completar a entrega |
| Estratégia de testes | Unitários de validação/segredos/erros; integração de arquivo em diretório temporário e fakes de provider; componentes por comportamento/teclado; testes IPC e negativas de segurança; npm run check, package/smoke local com perfil isolado; provider real somente do aplicativo com segredo sintético e quando o ambiente permitir |
| Resultado esperado | Gerenciador de perfis locais funcional, sem rede; proteção de senha habilitada somente nos alvos comprovados, com alternativa em memória e diagnóstico claro |
| Impacto documental | Criar docs/04-modules/01-connection-manager.md e evidências da 4A.1; atualizar arquitetura/DTOs, segurança, testes, desenvolvimento, produto/módulos, AGENTS e roadmap/estado/progresso; não declarar M01/MVP completos |

### Organização e limites

- Núcleo mantém perfis, segredo e acesso a disco. Renderer recebe somente resumos
  sanitizados e informação de existência/disponibilidade do segredo; nunca senha
  recuperada, ciphertext, erro bruto do SO ou acesso genérico a arquivos.
- Operações candidatas da ponte: listar/salvar/remover perfil e consultar estado da
  proteção. Novos DTOs/handlers nomeados ficam sujeitos à validação da janela,
  frame, URL fixa, shape e tamanho; métodos desktop existentes são preservados.
  Atualizar a allowlist finita e os testes de superfície ao adicionar os métodos,
  sem invoke/send genéricos ou relaxamento de CSP/sandbox.
- Perfil tem ID atribuído pelo main, nome, ambiente, endpoints independentes e
  usuário. Validar protocolos https/amqps e proibir credenciais embutidas nas URLs;
  nome/identidade do perfil não autoriza selecionar implicitamente uma sessão.
  Selecionar ou salvar perfil não gera rede nem muda contexto para “conectado”.
- JSON com schemaVersion em diretório de dados do aplicativo; limites NFR-020
  (50 perfis e 2 MiB) e NFR-016 para IPC. Escritas serializadas e atômicas, com
  erro explícito em conflito/falha; versão desconhecida ou corrupção preservadas,
  sem reset, migração destrutiva ou sobrescrita silenciosa. Testes usam apenas
  diretórios temporários, sem editar configuração real do usuário.
- Senha nova pode passar pelo formulário/IPC para substituir; manter/remover são
  ações explícitas. Descartar campos transitórios após envio/fechamento, sem
  prometer zeroização de strings JavaScript. Não armazenar em localStorage,
  URLs, argumentos de processo, logs ou arquivo em texto puro.
- Modo em memória sempre disponível; reter apenas no main durante a execução,
  descartando ao substituir/remover/encerrar o aplicativo. UI distingue senha
  disponível nesta execução e senha protegida salva, sem recuperar seu conteúdo.
- Usar safeStorage assíncrono como candidato do ADR-0004. Disponibilidade isolada
  não comprova provider seguro; informação do backend síncrono não prova o
  assíncrono. Fallback fraco, estado desconhecido, erro ou proteção não validada
  mantêm persistência desligada, com modo em memória. Nenhuma criptografia própria,
  opção de texto puro ou integração alternativa sem proposta específica.
- Antes de habilitar persistência por alvo, registrar evidência de provider,
  reabertura, indisponibilidade e rotação; tratar falha sem apagar ciphertext.
  Gate macOS assinado e demais SOs permanecem, mesmo que o round-trip local passe.
  Teste local não acessa entradas de terceiros do cofre ou altera preferências do SO.
- Formulário segue D3A, com labels/erros associados, foco, cancelamento/descarte de
  alterações e produção textual/simbólica. Remover perfil exige confirmação
  contextual no main e esclarece que não remove recursos do broker.
- CA customizada e seleção nativa do certificado ficam na 4A.2, junto da validação
  TLS real. A 4A.1 não promete teste de confiança, autenticação ou disponibilidade
  dos endpoints. Testar/Ativar não ficam operacionais antes de seus casos de uso.

### Critérios verificáveis da 4A.1

1. CRUD local de perfis reais, limites/IDs/validação verificados e lista preservada
   após reiniciar; nenhum request ao broker ao abrir, selecionar ou salvar.
2. Falhas de leitura/escrita, versão desconhecida/corrupção e conflitos não causam
   perda silenciosa de arquivo ou sucesso aparente; operações locais continuam assíncronas.
3. Fakes cobrem provider seguro/inseguro/ausente, falha temporária, decriptação e
   rotação. Memória funciona quando persistência não é comprovada; segredo salvo
   nunca retorna ao renderer. Gate real e resultados por alvo documentados.
4. Inspeção de disco/DTOs/erros com sentinelas sintéticas não encontra senha em
   texto puro, logs, respostas da ponte ou storage do renderer. Nenhuma credencial real em fixture.
5. Manter/substituir/remover segredo, cancelamento de edição e exclusão de perfil
   têm resultados coerentes, sem apagar a configuração após erro do provider.
6. UI distingue perfil salvo, selecionado e ausência de sessão; keyboard/foco,
   campos password, estados e confirmação local revisados nos dois temas e zoom.
   Pendência manual do seletor nativo herdada da 3B continua rastreada.
7. IPC novo rejeita origem/DTO/tamanho indevidos; asserções de segurança 2B/3B
   permanecem com allowlist explícita ampliada, sem APIs genéricas ou rede no renderer.
8. Check/package/smoke locais e revisão técnica/documental concluídos, com alvos
   efetivamente executados e gates pendentes registrados para aprovação de conclusão.

### Fontes verificadas e autorização

Em 2026-10-28, a documentação oficial e os tipos do Electron 45.1.0 instalado
confirmam a API assíncrona candidata; a documentação distingue os providers e o
fallback Linux. Essa consulta não verifica o provider do host e não acessa o cofre.
[Referência safeStorage](https://www.electronjs.org/docs/latest/api/safe-storage).

Não instalar dependências, integrar AMQP/HTTP, abrir brokers, consumir/publicar
mensagens ou habilitar TLS inseguro nesta subetapa. CA, sessões/reconexão, consultas
administrativas e métricas continuam nas etapas próprias. Não inclui assinatura,
instalador, publicação, push ou aprovação de conclusão/commit por antecipação.

**Executar somente a 4A.1 autorizada; conclusão/commit dependem de novo aceite.** Se o
provider não puder ser comprovado com a API disponível, entregar memória e a
limitação prevista no ADR; qualquer alternativa arquitetural exige decisão própria.

### Entrega da 4A.1 aprovada

[M01 local](../04-modules/01-connection-manager.md) implementado, com
[evidências](../07-testing/profiles-4a1.md). Proteção persistente permanece desligada
em todos os alvos, conforme alternativa aprovada; não houve acesso ao cofre real.
Conclusão e commit aprovados por “Aprovado!”. A 4A.2 continua dependente de contrato e
autorização próprios, sem execução automática após o aceite desta entrega.

## Contrato autorizado — DOC.1: histórico vivo, guia e Ajuda offline

Status: **concluída e aprovada por “Aprovado”; commit autorizado**.
Execução autorizada diretamente pela mensagem “Aprovado! Quero também…” após a
4A.1. Conclusão e commit posteriormente aceitos por “Aprovado”; limitações
apresentadas mantidas. O aceite não autoriza a 4A.2.

| Campo | Escopo autorizado |
| --- | --- |
| Identificador/nome | DOC.1 — Histórico vivo, guia do usuário e Ajuda offline |
| Objetivo | Registrar toda Task e oferecer instruções de uso no README e no app instalado |
| Justificativa | Pedido explícito do proprietário; perfis locais e formulários precisam de orientação acessível sem repositório/rede |
| Escopo | PROJECTS_STATUS.md central, leitura/atualização obrigatórias no AGENTS, guia PT-BR por funcionalidade/formulário e destino Ajuda na navegação existente |
| Tarefas | Inventariar uso real; escrever fonte única estruturada; gerar Markdown e checar sincronismo; exibir conteúdo sem HTML arbitrário; índice local e foco/teclado; documentar/validar/registrar resultados |
| Módulos | Governança, M01/documentação, M08/navegação local; sem novos casos de uso de broker |
| Arquivos previstos | PROJECTS_STATUS.md, AGENTS.md, README.md, docs/10-user-guide, tools/docs, src/renderer/pages/Help.tsx e estilos; shell/sidebar/ícone; testes e tools/testing; docs de arquitetura/navegação/desenvolvimento/testes/estado/progresso |
| Dependências | Stack instalada; JSON/React e APIs Node já disponíveis; nenhuma nova dependência ou acesso remoto |
| Riscos | Documentar recurso inexistente, divergência entre guia/app, link por hash quebrar URL fixa, perda de acessibilidade/scroll; mitigar por fonte única/checagens/UI local |
| Aceitação | Histórico atualizado e exigido no AGENTS; README aponta guia completo; Ajuda inclui o mesmo conteúdo offline e campos atuais; navegação/foco/temas/reflow funcionam sem mudar URL ou IPC; testes/check/package/smokes pertinentes passam com limitações registradas |
| Testes | Checar conteúdo/sincronização e links; componente por navegação/teclado; check; package/smoke Ajuda offline e regressões base/perfis; inspeção visual local |
| Resultado | Guia utilizável de funções reais e Ajuda empacotada; histórico vivo com tarefas/decisões/pendências/testes |
| Documentação | Atualizar PROJECTS a cada bloco/Task; sincronizar demais referências; não avançar 4A.2 ou commit desta Task sem aceite |

Escolha de implementação: conteúdo JSON local estruturado como fonte única,
Markdown gerado sem parser HTML e React sem dangerouslySetInnerHTML. Índice da
Ajuda usa botões/foco, preservando a URL canônica; não abre páginas remotas. O guia
informa limites e recursos indisponíveis. Sem alteração da stack, identidade ou
fronteira privilegiada.

Aprovação DOC.1: “Aprovado” aceitou a conclusão e o commit
`feat(help): add offline user guide and project status tracking`.
[Estado e histórico vivo](../../PROJECTS_STATUS.md) sincronizados; sem nova
implementação, push ou avanço de etapa neste aceite.

## Proposta de subdivisão — 4A.2

Após DOC.1 (`66183f7`), o proprietário pediu “Pode seguir para a próxima etapa”.
Foi preparado o contrato abaixo para apreciação antes de implementar. O roadmap
anterior trazia apenas o título da 4A.2, sem contrato detalhado. Esta preparação
não registra as novas escolhas como aprovadas nem habilita operações no produto.

| Incremento proposto | Entrega | Gate |
| --- | --- | --- |
| 4A.2A | CA personalizada e teste explícito HTTPS | Execução autorizada por Autorizo; conclusão/commit aprovados por Aprovado |
| 4A.2B | Teste AMQPS/autenticação/vhost e cliente AMQP | Conclusão/commit aprovados em 2026-10-30, incluindo testes reais |
| 4A.2C | Ativar/encerrar sessão e ciclo de recuperação | Contrato próprio; usar resultados/capacidades dos dois transportes |

A divisão mantém o escopo da 4A.2 e produz entregas menores. Não autoriza executar
os três incrementos em sequência. A matriz de referência aceita permanece sem
homologação; patches e imagens serão revalidados antes de testes reais de broker.

## Contrato autorizado — 4A.2A: CA personalizada e teste HTTPS

Status: **Execução autorizada por “Autorizo”; conclusão/commit aprovados por “Aprovado”**.
A preparação original alterou somente documentação. A implementação autorizada
segue o contrato abaixo; ADRs aceitos preservados. [Evidências](../07-testing/https-4a2a.md).

| Campo | Proposta para aprovação |
| --- | --- |
| Identificador/nome | 4A.2A — CA personalizada e teste HTTPS |
| Objetivo | Configurar confiança TLS por perfil e testar autenticação na Management API mediante ação explícita |
| Justificativa | Perfis locais e Ajuda estão prontos; ainda não há transporte, leitura de credenciais para rede ou configuração de CA. Validar primeiro essa fronteira limita o incremento |
| Escopo | Importar/manter/remover CA pública PEM pelo main; persistência versionada compatível com perfis v1; teste HTTPS de perfil salvo com usuário/senha em memória; resultado datado, cancelamento e erros sanitizados; sem sessão ativa |
| Tarefas | Detalhar DTOs/schema; importar certificados por diálogo nativo limitado; preservar/migrar v1 em gravação explícita; obter snapshot de perfil/credencial só no main; implementar probe HTTPS limitado/cancelável; integrar UI; atualizar guia/Ajuda/histórico; executar testes e revisão |
| Módulos afetados | M01 Connection Manager, configuração, TLS/credenciais, IPC e UI Conexões; documentação/M08 Ajuda; sem funcionalidades de filas/exchanges/mensagens |
| Arquivos previstos | Novos módulos pequenos src/main/connections/httpsProbe.ts e serviço correspondente; src/main/security/profileCa.ts; ajustes em profiles/repository/service/validation, ipc/profiles e app; contratos src/shared/connections.ts e profiles; extensão explícita do preload/desktop; páginas Conexões/ProfileForm e testes próximos; tools/testing; guia e documentos listados abaixo |
| Dependências | DOC.1 em 66183f7; ADRs 0002/0003/0004/0005 e NFRs aceitos; APIs instaladas Node/Electron. Nenhuma biblioteca nova, instalação de AMQP, troca de stack ou mudança de dependências prevista |
| Riscos | CA indevida/chave privada, leitura arbitrária de arquivo, migração que perca configuração, vazamento de Authorization/senha, deadline incompleto, redirecionamento, resultado obsoleto ou interpretado como sessão ativa; mitigações abaixo |
| Critérios de aceitação | Os nove critérios verificáveis abaixo, guia sincronizado e resultados/limitações efetivos apresentados para aprovação de conclusão |
| Estratégia de testes | Unitários de CA/DTO/credenciais/cancelamento; integração de arquivo e servidor HTTPS efêmero com certificados sintéticos; IPC negativas; componentes; check/package/smokes de segurança/perfis/Ajuda; broker isolado quando viável, sem usar endpoints de usuário/produção |
| Resultado esperado | Usuário salva configuração TLS e executa/cancela teste HTTPS, recebe diagnóstico fiel e datado; nenhum teste ao abrir/salvar/selecionar perfil e nenhuma sessão RabbitMQ ativada |
| Impacto documental | Atualizar M01, arquitetura/segurança/NFRs para sub-limites aprovados, requisitos/estado de implementação, roadmap/current-stage/progress, testes/evidências, AGENTS e PROJECTS; atualizar guide.json, gerar Markdown e conferir Ajuda/README após implementar |

### Confiança TLS e configuração local propostas

1. Modo padrão utiliza a confiança padrão do runtime Node no main, sem prometer
   que seja idêntica ao armazenamento de certificados do SO. Modo personalizado
   usa exclusivamente o bundle escolhido; sem alteração de trust store, variáveis
   globais TLS, bypass de certificado ou downgrade para HTTP.
2. Diálogo assíncrono de arquivo no main, vinculado à janela autorizada. Ler somente
   o arquivo escolhido pelo SO, com limite de **256 KiB**, no máximo **16 certificados
   CA PEM**; rejeitar dados extras, chave privada, PFX/PKCS#12 e certificados que
   não sejam CA. A extensão não comprova validade. Esses sub-limites foram aprovados
   pelo aceite do contrato e estão registrados em NFR-031–033.
3. Renderer recebe identificador opaco temporário, quantidade/fingerprints e estado
   de seleção; nunca caminho completo, bytes de certificado ou chave. Uma seleção
   pendente por janela, expiração de dez minutos; substituir/descartar/fechar janela
   libera a seleção. Salvar consome a seleção apenas depois de gravar com sucesso.
4. No arquivo, guardar o conteúdo público validado como snapshot por perfil,
   sem depender do caminho original. Os limites de 50 perfis/2 MiB continuam
   obrigatórios, incluindo certificados/ciphertext. Bundle grande pode atingir o
   limite total antes dos 50 perfis; explicar a falha e preservar o original.
5. Propor schema v2. Ler v1 sem regravar ao iniciar, usando confiança padrão em
   memória; migrar somente na próxima gravação explícita e sob o lock/revision.
   Preservar um backup v1 privado antes da primeira conversão; backup existente
   só é reutilizado se corresponder aos bytes de origem, caso contrário informar
   conflito. Falha de backup/gravação mantém o arquivo anterior. Schema desconhecido
   ou inválido nunca é resetado. Versão anterior do app não terá garantia de ler v2.
6. Keep/remove/replace de senha e confiança são ações distintas. Falha de importação,
   migração, provider ou escrita não apaga senha/CA anterior. O gate de persistência
   de senha continua fechado; nenhum acesso ao cofre real está incluído.

### Probe HTTPS e IPC propostos

- Uma ação **Testar HTTPS**, somente para perfil salvo, resolve ID/revision no main;
  não aceita URL, cabeçalhos, usuário/senha ou caminho de arquivo como argumentos
  do teste. Se não houver senha nesta execução, falhar antes de rede, sem guest
  automático. Validar a representação do usuário para Basic; caracteres incompatíveis
  geram erro explícito, sem alterar silenciosamente a identidade cadastrada.
- Fazer apenas **GET /api/whoami**, anexado ao prefixo de caminho administrativo
  configurado e preservando o mesmo destino. Basic segue em header somente ao host
  TLS validado. Corpo JSON deve identificar o usuário esperado; não devolver corpo
  bruto, tags arbitrárias ou cabeçalhos ao renderer. A resposta não prova versão,
  permissões de recursos/vhosts, saúde do cluster ou disponibilidade AMQP.
- Agente dedicado e descartável, sem herdar proxy/agent global. Exigir cadeia,
  validade e identidade do servidor; TLS mínimo proposto 1.2. Não substituir a
  checagem de hostname por uma função permissiva. Não prometer CRL/OCSP automáticos.
- Deadline total de **10 s** inclui resolução, handshake e leitura (NFR-013),
  sem retry automático; rejeitar todo 3xx sem seguir Location. Uma operação em voo
  por janela, abaixo do teto geral de quatro leituras por sessão. Solicitar
  resposta sem compressão e rejeitar codificação inesperada neste probe inicial.
- Sublimites propostos: **64 KiB de corpo** e **16 KiB de headers**; JSON UTF-8 com
  profundidade até 16. São limites específicos do probe, sem ampliar os 10 MiB
  gerais do futuro adapter administrativo. Corpo/tipos/conteúdo inválidos produzem
  erro de protocolo, sem alegar conectividade aprovada.
- Operações candidatas adicionais da ponte: selecionar CA, descartar seleção de CA,
  testar HTTPS e cancelar teste. Métodos específicos e DTOs fechados; atualizar a
  allowlist finita, sem invoke/send ou API de arquivo/transporte genéricos.
- ID de correlação do teste é validado e vinculado no main à janela/perfil/revision;
  conhecer/enviar um ID não concede autoridade. Cancelar só alcança a operação
  dessa janela. Revalidar origem após diálogo e snapshot ao concluir; edição/remoção
  do perfil, mudança de configuração ou fechamento da janela cancela/invalida o teste.
- Fechar sockets/timers/seleções no cancelamento/encerramento. Resultado atrasado não
  substitui estado novo. Informar separadamente cancelamento, timeout, rede, TLS,
  401, 403 e resposta incompatível, sempre com mensagem fixa e requestId.

### Interface, guia e limites de escopo

Conexões terá resumo da confiança, seleção/remoção de CA no formulário e teste
HTTPS com estado em andamento/cancelar/resultado datado no perfil salvo. Salvar,
selecionar ou abrir o app não gera rede. Alterações de formulário precisam ser
salvas antes do teste. A UI mantém **Sem sessão ativa**, sem dar sucesso AMQPS ou
liberar páginas de broker por um teste HTTPS bem-sucedido.

Não inclui AMQP/amqplib, sessão ativa, vhost/polling/reconexão, dashboard, filas,
exchanges, mensagens, autenticação OAuth/mTLS, proxy corporativo configurável,
assinatura, instaladores, publicação ou push. A 4A.2B/C e a 4B exigirão contratos
próprios; não são autorizadas por aceitar somente a 4A.2A.

### Critérios verificáveis da 4A.2A

1. UI cadastra/edita/remove CA sem expor caminho/bytes; cancelamento do seletor
   não altera o perfil. Chave privada/PEM inválido/não-CA e limites são rejeitados.
2. Perfis v1 continuam legíveis sem mutação automática; migração explícita v2 e
   backup funcionam sob conflito/falha, mantendo segredo/arquivo anterior nos erros.
3. Sem senha, teste falha sem request; senha disponível só é obtida/consumida no
   main. Disco/DTO/log/storage/pacote não contêm sentinela de senha em claro.
4. TLS real rejeita CA desconhecida, cadeia/certificado inválido/expirado e hostname
   divergente; CA correta permite o handshake. Nenhum bypass ou trust global alterado.
5. Request usa somente o destino/prefixo de perfil salvo; verifica identidade, trata
   401/403/404/3xx/JSON inválido/oversize/deadline/cancelamento sem redirecionar ou repetir.
6. Alteração/remoção de perfil, janela fechada e resultado atrasado não mantêm sockets,
   timers ou indicação válida de teste antigo. Conexões/perfis/Ajuda continuam acessíveis.
7. Novos IPCs negam janela/frame/URL/DTO/tamanho indevidos; allowlist explícita e
   controles 2B/3B/4A.1/DOC.1 preservados no pacote.
8. Dois temas, teclado/foco/erros, layout mínimo e zoom 200% revisados; guia/Ajuda
   explicam todos os novos campos/efeitos sem prometer sessão ou suporte homologado.
9. Check (inclui docs:check), package, smokes/regressões e cenários TLS isolados
   executados e registrados. Distinguir fixture Node de RabbitMQ real e SO efetivo;
   impossibilidade de executar parte da matriz é limitação explícita, nunca teste aprovado.

### Evidências de preparação e fontes

Em 2026-10-28, o repositório está em `66183f7`, sem transporte de broker. Tipos
Node instalados declaram opções CA/verificação TLS, limite de headers e X509Certificate.
Executáveis Docker e OpenSSL foram localizados; daemon, imagens e geração de
certificados não foram executados ou validados nesta preparação. Nenhum broker,
cofre ou arquivo de certificado do usuário foi acessado.

A API oficial documenta /api/whoami como consulta do usuário autenticado;
[Management HTTP API](https://www.rabbitmq.com/docs/http-api-reference#get-apiwhoami).
[Electron dialog](https://www.electronjs.org/docs/latest/api/dialog) oferece o
seletor assíncrono no main. Referências de
[HTTPS](https://nodejs.org/api/https.html), [TLS](https://nodejs.org/api/tls.html) e
[X509 Node 24](https://nodejs.org/docs/latest-v24.x/api/crypto.html#class-x509certificate)
embasam o desenho; as páginas HTTPS/TLS acessíveis reportaram Node 26.13.0, não
homologam o runtime Electron. Os links específicos HTTPS/TLS v24 e API RabbitMQ 4.3
não ficaram acessíveis pela ferramenta; validar o runtime/duas versões em testes
continua gate da implementação. A página da API consultada é a de RabbitMQ 4.4.

Não foi instalada dependência, gerado certificado, executado teste TLS ou homologada
compatibilidade. O proprietário autorizou a execução por “Autorizo”; apresentar evidências e
solicitar aprovação de conclusão antes de commit.

## Contrato autorizado — 4A.2B: teste AMQPS e acesso ao vhost

Preparação: 2026-10-28. Execução autorizada em 2026-10-29 por **“Autorizo”**.
Status: **concluída/aprovada em 2026-10-30; commit autorizado**.
O pedido “Continue as etapas” iniciou esta preparação após a entrega 966b4a2.
Base observada: 9401448, Git limpo; ajuste posterior da barra macOS preservado.
A preparação original não instalou cliente nem implementou o transporte; o aceite
posterior autorizou somente o recorte descrito abaixo.

| Campo | Proposta para aprovação |
| --- | --- |
| Identificador/nome | 4A.2B — Teste AMQPS de autenticação e abertura do vhost |
| Objetivo | Verificar TLS e abertura AMQP 0-9-1 no vhost do endpoint salvo, encerrando a conexão antes de concluir |
| Justificativa | HTTPS já tem teste explícito; seu sucesso não comprova AMQP. Validar esse transporte separadamente antecede o ciclo de sessão da 4A.2C |
| Escopo | Cliente AMQP no main, interpretação estrita do endpoint/vhost, senha/CA do perfil salvo, teste cancelável e datado, erros sanitizados, IPC específico, UI/guia e testes isolados |
| Tarefas | Instalar/fixar cliente aprovado e revisar lock/audit; validar endpoint/vhost; implementar adapter e recursos canceláveis; coordenar testes HTTPS/AMQPS; ampliar DTOs/preload/IPC; integrar UI; atualizar documentação; executar check/package/smokes/revisão |
| Módulos afetados | M01, transporte AMQP/TLS, credenciais/configuração, IPC, Conexões e Ajuda; sem operação de topologia/mensagem |
| Arquivos previstos | package.json/package-lock.json; novos src/main/connections/amqpsEndpoint.ts e amqpsProbe.ts; coordenação em httpsTestService.ts ou substituto local connectionTestService.ts; profiles/service, ipc/connections e app; shared/connections/profiles, preload; Conexões/HttpsTest e controle AMQPS; testes próximos, tools/testing e guia/documentos listados abaixo |
| Dependências | ADR-0002/0003/0004/0005 e NFRs aceitos; CA/schema v2 da 4A.2A; instalar somente amqplib 2.2.0 exato em dependencies, incluindo resolução do lock. Tipos já incluídos; sem @types/amqplib ou cliente alternativo |
| Riscos | Vazamento de SASL, vhost decodificado incorretamente, conexão tardia órfã, retry implícito, parser de broker não confiável, resultado confundido com sessão/permissão de publicar e regressão dos smokes após 9401448 |
| Critérios de aceitação | Dez critérios verificáveis abaixo; resultados efetivos, documentação e limitações apresentados para aprovação de conclusão |
| Estratégia de testes | Parse/DTO/serviço/componentes; TLS e handshake AMQP isolados; broker RabbitMQ nas duas versões quando viável; IPC e regressões HTTPS/perfis/Ajuda/segurança; package e smokes sequenciais; distinguir fixture de broker real |
| Resultado esperado | Testar/cancelar AMQPS no perfil salvo, identificar vhost e resultado datado, encerrar recursos e manter Sem sessão ativa; nenhum envio/consumo ou conexão automática |
| Impacto documental | Atualizar M01, arquitetura/segurança/NFRs, dependências, requisitos/MVP conforme cobertura real, roadmap/current-stage/progress, evidências, AGENTS/PROJECTS; após implementar, revisar guide.json e gerar Markdown/Ajuda/README |

### Dependência e limites de autorização

- Candidato revalidado: **amqplib 2.2.0**, com tipos incluídos, Node >=18 e sem
  dependências de produção declaradas. Isso não comprova segurança/compatibilidade
  no Electron nem ausência de vulnerabilidades. Instalação dirigida, auditoria sem
  auto-fix, diff de manifesto/lock e testes serão parte da implementação aprovada.
- Usar API pública de conexão comum, sem recovery/reconexão/retry. Não importar
  arquivos internos da biblioteca, fazer monkey patch global ou expor cliente ao renderer.
  Não acrescentar outros pacotes/atualizações alheios para fazer testes passarem.
- Se a versão não estiver disponível ou a validação revelar bloqueio que exija
  troca de cliente/versão, bypass ou alteração arquitetural, apresentar a decisão
  antes do trabalho dependente. Não substituir silenciosamente a versão aprovada.
- Manter branch/histórico, assets, providers desligados e identidade. Sem CI remoto,
  assinatura/publicação/push ou commit antes da aprovação de conclusão.

### Endpoint e vhost — proposta sem schema novo

1. Resolver somente o endpoint AMQPS do **perfil salvo**, nunca URL/senha fornecida
   como parâmetro de teste. Porta padrão 5671; rejeitar porta zero e formas inválidas.
   Proibir amqp, userinfo, query, fragment e opções arbitrárias de TLS/transporte.
2. Usar o único segmento de caminho como vhost percent-encoded; decodificar UTF-8
   estritamente uma vez. Não aparar espaços, perder caracteres, normalizar segmentos
   ponto/ponto-ponto ou decodificar de novo no adapter. Barras no nome exigem %2F;
   rejeitar múltiplos segmentos literais, percent inválido e UTF-8 inválido.
3. Propor vhost não vazio de até **255 bytes UTF-8**, sem NUL/controles C0/DEL.
   Vhost ausente significa padrão `/`; `/%2F` identifica explicitamente `/`.
   Uma barra final isolada significa vhost vazio na especificação: este recorte
   rejeita `amqps://host/`, orientando usar ausência de caminho ou `/%2F`.
   Exemplos: `/pedidos` → pedidos; `/equipe%2Fpedidos` → equipe/pedidos;
   `/literal%252F` → literal%2F, sem segunda conversão para barra.
4. Montar opções de conexão estruturadas no main, sem concatenar segredo à URI.
   A biblioteca também decodifica seu campo vhost: fornecer representação compatível
   para que o nome entregue ao broker preserve exatamente o resultado do parse.
   Testar Unicode, espaços, %, barras, segmentos ponto e IPv4/IPv6/hostname.
5. Não alterar schema v2 nem regravar perfis ao abrir/testar. Perfis antigos com
   endpoint fora desse recorte continuam legíveis/editáveis; falham antes de rede,
   sem migração/reset silencioso. Não endurecer a leitura do repositório de modo
   a tornar toda configuração anterior ilegível por um endpoint antes aceito.
   Mostrar no formulário/resumo o vhost interpretado e instruções do campo AMQPS.

### TLS, protocolo e recursos — parâmetros propostos

- TLS >=1.2, cadeia/validade/identidade obrigatórias. Reusar default/custom do perfil
  com a semântica 4A.2A; bundle escolhido exclusivo, sem trust global, bypass,
  downgrade, certificado de cliente ou proxy/túnel. SNI somente para hostname DNS;
  IP também exige validação de identidade. Não abrir HTTPS para testar AMQPS.
- Sem senha nesta execução, recusar antes de DNS/TCP. Usar SASL PLAIN apenas dentro
  de TLS validado, com credenciais no main e sem fallback guest. Rejeitar NUL/UTF-8
  malformado; não importar a restrição de dois-pontos de HTTP Basic para AMQP.
- Testar somente abertura de conexão no vhost (até connection.open-ok) e fechamento.
  **Não criar canais**, declarar/consultar topologia, publicar, consumir ou confirmar
  mensagens. Propor heartbeat **10 s**, frameMax **128 KiB** e channelMax **1**;
  respeitar negociação válida e falhar se os limites forem violados. O teste não
  mede liveness contínuo nem homologa desempenho/limites globais do parser.
- Uma operação de teste por janela **compartilhada entre HTTPS e AMQPS**; a UI
  bloqueia iniciar a outra modalidade e o main rejeita concorrência indevida.
  Generalizar somente a coordenação necessária do serviço existente, mantendo dois
  comandos específicos e os limites HTTPS já aprovados, sem framework de transporte.
- Deadline total AMQPS **15 s** (NFR-013), incluindo fila/snapshot, DNS/TCP/TLS,
  negociação, revalidação e fechamento. Timeout de inatividade do socket não basta.
  Encerrar normalmente após abrir; conceder até **1 s** ao close, dentro do prazo
  restante, e destruir recursos ao exceder. Sem confirmação de fechamento no prazo,
  retornar diagnóstico específico, sem apresentar sucesso pleno ou manter conexão.
- O main deve possuir um socket TCP por tentativa, fornecido à negociação TLS por
  APIs públicas, para poder destruir recursos também antes de connect resolver.
  Cancelar/deadline/erro/reload/crash/fechamento/quit invalida a operação e destrói
  sockets, timers e listeners; eventual resolução atrasada é descartada/encerrada.
  Não usar somente Promise.race deixando a conexão abrir depois, nem acessar streams
  privados de amqplib. A composição socket/TLS deve ser provada no runtime do pacote.
- ID/revision/operationId vinculados à janela no main; mudanças próprias/externas de
  perfil invalidam testes. Revalidar antes de concluir, sem senha/CA/corpo/stack no
  resultado. DNS/I/O já entregue ao SO não tem garantia de interrupção física imediata.
- Distinguir cancelamento, prazo, TLS, rede, protocolo/negociação, recusa do broker
  e fechamento sem confirmação. Não inferir senha incorreta, vhost inexistente ou
  falta de permissão por texto bruto/queda genérica; a recusa pode ser ambígua.
  Mensagens fixas e requestId; detalhes de broker não voltam ao renderer/log.

### IPC, interface e documentação do usuário

Propor somente `testProfileAmqps({ profileId, revision, operationId })` e
`cancelProfileAmqpsTest(operationId)` no canal bunnies:connections: **18 métodos**
específicos ao todo. Manter autoridade integral da 2B, validação estrita de shape,
tamanho e origem, revalidação após await e limpeza por janela. Nenhuma API genérica.

Em Conexões, adicionar **Testar AMQPS**, cancelar, vhost interpretado e resultado
com data/duração. Sucesso significa abertura autenticada aceita naquele vhost e
conexão encerrada; não comprova acesso a filas, publicação, saúde de cluster ou que
HTTPS/AMQPS pertençam ao mesmo broker. Preservar **Sem sessão ativa**, resultados
separados e páginas de broker bloqueadas. Não conectar ao abrir/salvar/selecionar.

O guia/Ajuda explicará vhost, exemplos de URL, CA usada nos dois endpoints,
credenciais, erros e efeitos: o teste cria uma conexão transitória real e tentativa
de login, podendo gerar logs/métricas no broker mesmo quando cancelado. Sem operação
de mensagens/topologia; nenhum efeito de rede é desfeito por cancelar.

Preservar o ajuste macOS versionado em **9401448**. Adequar smokes/expectativas e
instruções de menu aos controles disponíveis por plataforma, sem restaurar a barra
alterada pelo proprietário. Usar roles/menu nativo no teste quando aplicável; revisão
manual nativa permanece explicitamente separada da automação privilegiada.

### Critérios verificáveis da 4A.2B

1. Dependência exata/tipos/lock revisados, audit registrado sem auto-fix; cliente
   fica no main, ausente do preload/renderer, sem pacote adicional não aprovado.
2. Parse preserva vhost/Unicode/escapes e rejeita entradas fora do recorte antes
   da rede; perfis v1/v2 continuam legíveis e não sofrem gravação ao testar.
3. Sem senha não há tentativa; SASL só ao destino TLS validado. Senha/chave/CA/caminho
   e respostas brutas não vazam em DTO/storage/log/pacote; segredo não vai à URI.
4. TLS real cobre CA correta/desconhecida, expiração e SAN divergente, DNS/IP,
   compartilhamento de CA com HTTPS e ausência de trust global/bypass.
5. Sucesso requer open-ok no vhost correto e fechamento confirmado. Nenhum canal,
   declaração, leitura/consumo/ack/publicação ou reconexão é executado pelo probe.
6. Erros/negociação/protocolo inválido/recusa e close sem resposta são sanitizados;
   sucesso AMQP não é apresentado como permissão de recurso/sessão/saúde do broker.
7. Deadline total, cancelamento em DNS/TCP/TLS/handshake/close, retorno atrasado,
   mudança de perfil e fechamento/reload/quit não deixam conexão/sockets/timers
   órfãos. HTTPS e AMQPS não executam em paralelo na mesma janela.
8. IPC nega janela/frame/URL/shape/tamanho indevidos; ponte finita e proteções
   CSP/sandbox/protocolo/rede do renderer e regressões anteriores preservadas.
9. UI em dois temas, foco/teclado/erros/layout/zoom 200% e guia/Ajuda sincronizados;
   macOS usa comportamento atual de 9401448, com limitações nativas documentadas.
10. Check/package e smokes base/perfis/HTTPS/AMQPS executados em sequência e
    registrados; distinguir TLS/AMQP de fixture Node de RabbitMQ real. Revalidar
    Docker e tentar matriz isolada 4.4.0/4.3.6 quando viável, com portas loopback,
    certificados/usuários/vhosts sintéticos, readiness e cleanup. Daemon indisponível
    ou outro alvo não executado permanece limitação, nunca compatibilidade homologada.

### Exclusões e fontes da preparação

4A.2C (sessão/vhost ativo/reconexão/polling), canais confirm/publicação, filas,
exchanges, mensagens, administração e nova infraestrutura de release continuam
fora deste contrato. Seu aceite não autoriza executar a próxima etapa ou registrar
commit sem aprovação de conclusão. Não ligar provider real de senha.

Fontes consultadas em 2026-10-28:

- [Manifesto oficial v2.2.0](https://github.com/amqp-node/amqplib/blob/v2.2.0/package.json)
  e [registry npm](https://registry.npmjs.org/amqplib/latest): versão/tipos/engines/dependências
  verificados, sem instalação. [Changelog](https://github.com/amqp-node/amqplib/blob/v2.2.0/CHANGELOG.md)
  registra heartbeat/recovery; usar connect comum, sem recovery.
- [API do cliente](https://amqp-node.github.io/amqplib/channel_api.html) e
  [connect v2.2.0](https://github.com/amqp-node/amqplib/blob/v2.2.0/lib/connect.js):
  timeout/socket options, vhost e negociação; leitura de código não substitui prova
  de cancelamento/fechamento no runtime Node 24 do Electron.
- [URI RabbitMQ](https://www.rabbitmq.com/docs/uri-spec),
  [controle de acesso](https://www.rabbitmq.com/docs/access-control) e
  [heartbeats](https://www.rabbitmq.com/docs/heartbeats): semântica de vhost,
  autenticação/permissões distintas e heartbeat negociado.
- [Releases RabbitMQ](https://www.rabbitmq.com/release-information): 4.4.0/4.3.6
  continuam referências aceitas, sem homologação executada. Na 4A.2A, Docker estava
  sem daemon; verificar novamente durante a implementação, sem iniciar serviço do host.
- [TLS Node](https://nodejs.org/api/tls.html): suporte a socket fornecido/validação.
  Página genérica disponível indica Node 26; página v24 não ficou acessível via
  navegador. Tipos Node 24 instalados declaram socket; provar composição e limites
  no pacote, sem supor equivalência de runtimes.

Na preparação original não houve instalação, teste funcional/TLS/broker ou alteração
de código/guia. Em 2026-10-29, “Autorizo” aprovou executar este contrato. A implementação
e seus resultados estão nas [evidências 4A.2B](../07-testing/amqps-4a2b.md).
Conclusão/commit ainda dependem de revisão e aceite, sem push ou etapa 4A.2C.

### Complemento executado — broker real

O proprietário pediu testes reais com Docker já ativo e confirmou continuidade.
Em 2026-10-29, harness `tools/testing/rabbitmq-real.cjs` passou com 20 verificações
em cada 4.4.0/4.3.6, imagens oficiais arm64 por digest, nó único e portas loopback.
HTTPS/AMQPS, TLS/CA/vhosts/recusas, cancelamento/prazo/cleanup no mesmo pacote.
[Evidências](../07-testing/amqps-4a2b.md) delimitam a compatibilidade observada.
Sem mudança do contrato de produto ou início de sessão; conclusão/commit pendentes.

### Aceite de conclusão 4A.2B

Em 2026-10-30, “Aprove a 4A.2B, e siga para a próxima etapa” aprovou a entrega
apresentada e seu commit, incluindo testes reais/limitações. Registrar
`feat(connections): add cancellable AMQPS connection tests` sem nova implementação,
com pai 9401448. O avanço seguinte é a preparação do contrato 4A.2C, sujeito a
aprovação específica antes de implementar. Sem push.

## Contrato autorizado — 4A.2C: sessão ativa e recuperação

Data: 2026-10-30. Status: **Execução autorizada por “Autorizado”; gate inicial em execução**.
Base: `ea116de`, entrega 4A.2B concluída/aprovada e registrada. O pedido “Aprove a
4A.2B, e siga para a próxima etapa” autorizou preparar este contrato; os parâmetros
abaixo foram posteriormente aceitos por “Autorizado”. Começar pelo gate; não há
sessão de produto implementada nesta autorização.

| Campo | Proposta para aprovação |
| --- | --- |
| Identificador/nome | 4A.2C — Sessão única, estados dos transportes e recuperação limitada |
| Objetivo | Conectar/desconectar explicitamente um perfil salvo, manter AMQPS aberto sem canais e acompanhar HTTPS de forma datada, com recuperação controlada |
| Justificativa | Os probes 4A.2A/B terminam suas conexões; não constituem contexto ativo para as próximas consultas. FR-004/005/025/027/029/030 exigem identidade, geração e descarte de trabalho antigo |
| Escopo | Coordenador de sessão no main; AMQPS persistente; whoami periódico limitado; recuperação por endpoint; lifecycle/IPC; contexto global de UI, comandos conectar/desconectar, erros e guia; sem operações de recursos |
| Tarefas | Provar adapter persistente e eventos precoces; implementar estados/generation/ownership; integrar recuperação/polling/lifecycle; ampliar ponte específica; atualizar UI/guia; testar unidades/fixtures/pacote/RabbitMQ real; revisar artefato/documentação |
| Módulos afetados | M01, contexto transversal do shell, transporte/segredos/IPC e M08/Ajuda; demais módulos não habilitados |
| Arquivos previstos | Novos src/shared/session.ts e src/main/sessions/sessionService.ts, validation.ts e errors.ts; adapter pequeno em src/main/connections/amqpsConnection.ts ou equivalente; ajustes em amqpsProbe, connectionTestService, profiles/service, app e ipc/session.ts; preload/index/desktopApi e typings; SessionProvider local ao shell, SessionContextBar, ApplicationShell, Connections/ProfileTests e estilos; testes próximos e tools/testing/sessions.cjs/fixtures/rabbitmq-real; documentos abaixo |
| Dependências | ADRs 0001–0005, FR/NFR aceitos, CA/schema v2, cliente amqplib 2.2.0 já instalado e evidências 4A.2B; somente APIs já instaladas, sem nova dependência, migração, schema ou provider |
| Riscos | Conexão/timer órfão, reconexão após desconectar, sessão duplicada, evento precoce perdido, dado antigo substituir novo, falso estado de saúde, credencial obsoleta e polling/retry sem limite |
| Critérios de aceitação | Doze critérios abaixo, executados com resultados reais e limites explícitos antes de pedir conclusão |
| Estratégia de testes | Relógio/RNG controlados, concorrência/estados/IPC/componentes; TLS/AMQP roteirizado com heartbeat/close/blocked; check/package/smokes sequenciais; instâncias RabbitMQ próprias 4.4.0/4.3.6 por digest, cortes/restauração de rede e cleanup |
| Resultado esperado | Usuário identifica perfil/ambiente/vhost e estados separados, mantém uma conexão AMQPS sem canais, cancela/encerra e recupera falhas transitórias dentro do limite; sem conectar automaticamente ao iniciar |
| Impacto documental | Atualizar PROJECTS em cada Task, AGENTS/estado/progresso/roadmap, arquitetura/M01/segurança/requisitos/NFR/testes/evidências; após implementar, guide.json/Markdown/Ajuda/README; não publicar sessão futura como disponível nesta proposta |

### Decisões propostas e limites de contexto

As escolhas C-01–07 foram propostas e depois **aceitas por “Autorizado”** ao contrato,
detalhando a direção arquitetural aceita. Isso não homologa sua implementação nem
altera automaticamente os ADRs.

1. **C-01 — Uma sessão lógica por aplicativo, pertencente à janela principal.**
   Ativar somente por Conectar no perfil salvo, sem senha/URL/vhost arbitrário no
   request. Main atribui sessionId/generation e resolve revision, segredo e CA.
   Perfil sem senha ou endpoint/vhost inválido falha antes da rede; abrir, salvar
   ou selecionar perfil, obter estado e assinar eventos nunca conectam.
2. **C-02 — Contexto inicial é o vhost já interpretado na URL AMQPS.** Sem schema
   novo nem seletor/listagem de vhosts nesta etapa. Alterar esse contexto exige
   desconectar, editar o endpoint e conectar explicitamente. A 4B tratará listagem,
   permissões e seleção de vhosts; FR-019 permanece parcial. HTTPS autenticado não
   comprova acesso administrativo ao vhost nem que ambos endpoints são o mesmo broker.
3. **C-03 — Estados independentes dos transportes.** AMQPS mantém conexão após
   open-ok, com heartbeat 10 s/frameMax 128 KiB/channelMax 1 e zero canais. HTTPS
   continua GET whoami, sem socket persistente como sinal de saúde; mostrar instante,
   resultado e suspensão da última verificação. Ambos podem funcionar parcialmente.
4. **C-04 — Recuperação é controlada pelo Bunnies.** connect comum da API pública,
   sem recovery da biblioteca, import privado, monkey patch, replay ou topologia.
   Cotas e pausas estão abaixo; falhas permanentes exigem intervenção.
5. **C-05 — Coordenação com testes existentes.** Uma sessão connecting/ready/degraded/
   reconnecting impede probes manuais HTTPS/AMQPS; probe em curso impede ativar sessão.
   Main rejeita concorrência, UI explica Desconectar/Cancelar primeiro. Sem cancelar
   silenciosamente outra operação ou criar segunda conexão de diagnóstico.
6. **C-06 — Lifecycle invalida antes de fechar.** Desconectar ou encerrar a janela
   cancela trabalho/retries, avança generation e libera sockets/timers/listeners.
   Reabrir/recarregar a janela não reativa sessão. Senha transitória continua segundo
   as regras existentes (macOS: fechar janela não equivale a sair do processo).
7. **C-07 — Quatro métodos nomeados adicionais, total de 22.** Canal próprio
   bunnies:session e evento específico de estado, com DTO fechado e mesma autoridade
   2B; nunca expor modelo/socket, credencial recuperada, transporte ou IPC genérico.

### Máquina de estados e significado do resultado

| Estado agregado | Significado proposto |
| --- | --- |
| idle | Nenhuma ativação nesta janela; nenhum timer ou recurso de broker |
| connecting | Ativação explícita em curso; transportes com estados próprios e cancelamento disponível |
| ready | HTTPS autenticado na última verificação e AMQPS estabelecido; não comprova saúde de cluster, permissão de recurso ou publicação |
| degraded | Um transporte está disponível ou AMQPS sinalizou blocked; mostrar exatamente a limitação, sem desconectar o outro automaticamente |
| reconnecting | Nenhum transporte disponível e existe tentativa transitória autorizada/agendada; se outro está disponível, o agregado permanece degraded |
| closed | Encerramento explícito ou ambos endpoints indisponíveis sem tentativa elegível; nenhum recurso/timer restante; diagnóstico final sanitizado |

Cada transporte tem fase, checkedAt/connectedAt quando aplicável, código de erro,
tentativa/nextRetryAt e indicação de verificação suspensa. ready não é promessa de
disponibilidade contínua. Fluxo AMQP começa **desconhecido**: ausência de blocked
não prova aptidão para publicar. Eventos públicos blocked/unblocked atualizam a
indicação; blocked não deve causar ciclo de reconexão nem retransmissão.

Inicialização tenta HTTPS e AMQPS independentemente, com respectivos prazos de
10/15 s incluindo snapshot/DNS/TLS; aggregate inicial não espera além desses limites.
HTTPS inválido para Basic (por exemplo, usuário com dois-pontos) não impede AMQP
válido. Se ao menos um transporte funcionar, preservar o contexto parcial e sua
limitação; se só HTTPS funcionar, o vhost AMQP aparece **não verificado**.

Manter no main um contador sequence crescente para ordenar snapshots/eventos e
generation para invalidar tentativas/contextos. Callbacks/resultados antigos nunca
restauram o estado novo. Recriação de recurso após falha invalida a generation antes
de aceitar novos resultados; estado HTTP saudável pode ser preservado por endpoint.
Regras/modelo ficam próximos de sessões, sem framework genérico de workflows.

### Recuperação, polling e encerramento propostos

- Reusar NFR-013/018/019. Após falha transitória de rede/timeout, até **cinco retries
  por endpoint por ativação**, após 1, 2, 4, 8 e 16 s, com jitter uniforme de até
  ±20%; uma tentativa inicial mais no máximo cinco retries. Sucesso de recuperação
  não repõe a cota automaticamente: evita ciclos ilimitados de flapping.
- Recuperar somente endpoint falho; não recriar o saudável. Sem tentativa
  sobreposta. Erros TLS, 401/403, credencial/endpoint inválido, recusa AMQP, redirect,
  resposta/protocolo incompatível e causa não classificável interrompem recuperação
  desse endpoint. Não inferir causa por replyText arbitrário. Falha conhecida de
  rede ou queda de uma conexão antes estabelecida pode ser transitória; código
  estruturado de protocolo/permissão continua terminal. Matriz deve ser testada.
- Esgotamento ou erro terminal exigem ação manual: desconectar e conectar novamente
  com perfil válido (se closed, basta Conectar). Nenhuma escrita existe neste
  incremento e nenhuma política pode repeti-la automaticamente no futuro.
- HTTPS saudável usa **whoami 5 s após concluir** a consulta anterior, sem
  sobreposição. Este polling verifica só autenticação/alcance, sem overview,
  métricas, versão, capacidades ou recursos. Erro transitório usa backoff no lugar
  do polling normal; erro terminal não fica repetindo login a cada cinco segundos.
- Main determina background por janela sem foco, oculta ou minimizada: pausar
  novas consultas HTTPS e retries; abortar consulta/handshake em curso sem contar
  como falha permanente. Retry já iniciado consome cota mesmo se interrompido;
  voltar ao foco não a repõe. AMQP já estabelecido mantém heartbeat; não prometer rede
  zero em background. Foco/visibilidade retomados geram no máximo uma verificação,
  sem rajada para compensar intervalos perdidos nem reset da cota de retries.
- Em suspensão do SO, invalidar trabalho pendente e fechar recursos AMQP, pausando
  timers; ao retomar, recuperar apenas sessão que continua desejada e com janela
  válida, sem recriar sessão explicitamente encerrada ou renovar cotas. Eventos
  powerMonitor não implicam garantia de execução enquanto o SO está suspenso.
- Revisão de perfil antes de cada tentativa/poll e após await; alteração própria
  de qualquer perfil encerra conservadoramente a sessão, seguindo notifyChanged
  atual. Mudança externa encerra ao ser detectada na leitura; não prometer
  detecção instantânea de editor externo ou observação física contínua em background.
- Desconectar cancela intenção e avança generation **antes** do fechamento. Close
  AMQP tem até **1 s**, depois destrói socket próprio. Sem CloseOk, inclusive atalho
  blocked da biblioteca, indicar encerramento local sem confirmação remota, jamais
  manter conexão ou apresentar confirmação falsa. Main/quit não espera indefinidamente.
  before-quit pode conceder uma única espera limitada a 1 s; will-quit faz descarte
  final idempotente. Reload/crash/close também descartam recursos e listeners.

Os refinamentos de cota por ativação, jitter e background/suspend são escolhas
propostas para aprovação. Se aceitas, registrar como sublimites específicos na
fonte NFR durante implementação; não mudar valores já aceitos silenciosamente.

### Fronteira IPC e interface propostas

| Método novo | Argumento e comportamento |
| --- | --- |
| getSessionState() | Snapshot local sanitizado, sem conectar ou consultar broker |
| connectSession({ profileId, revision, operationId }) | Valida DTO/origem, reserva sessão e devolve estado de ativação; progresso por evento; recusa se sessão/probe já está em curso |
| disconnectSession({ sessionId, generation }) | Cancela somente o contexto atual dessa janela; id/generation antigo não encerra sessão nova; idempotente para o mesmo encerramento |
| onSessionState(listener) | Listener recebe somente snapshot validado/sanitizado e devolve unsubscribe local; nunca encaminha evento Electron ou registro de canal genérico |

Adicionar validação/erros específicos de sessão, com requestId e mensagens fixas.
Antes de cada comando/resultado e publicação de evento, verificar janela principal,
main frame e URL canônica. Main envia apenas ao frame principal atual autorizado;
preload instala/remove listener específico e descarta evento Electron. Assinar
primeiro, obter snapshot depois e usar sequence para resolver a corrida; cleanup
React/StrictMode/reload não duplica listeners nem mantém assinatura de frame antigo.
Snapshot contém só IDs/contexto público, ambiente/vhost, estados/tempos/erros/cota;
nenhum password/CA/path/header/replyText/socket vai ao renderer/storage/log.

UI mantém seleção de perfil separada de sessão ativa. Conectar/Desconectar e
cancelamento de ativação ficam claros em Conexões; barra global e footer mostram
perfil, ambiente (produção também com símbolo/texto), vhost e estados separados.
Selecionar outro perfil não troca a sessão; para ativá-lo, desconectar primeiro.
Navegar entre Conexões/Ajuda/Sobre preserva sessão; sair/recarregar janela a encerra.
O formulário e probes continuam utilizáveis após desconectar; salvar alteração
invalida a sessão conforme regra acima, com aviso claro. Não habilitar destinos de
broker antes de seus módulos existirem. Sem perfil de teste instalado como produto.

Reusar tokens/componentes/design aceitos, com foco/teclado/status acessíveis e zoom
200%. Guia único explicará cada ação/estado, diferença teste/sessão, heartbeat,
periodicidade/login/logs, pausa/retries, desconexão, vhost ainda não verificado e
recursos indisponíveis. Não expor detalhes internos sem utilidade ao usuário.

### Sequência de execução proposta e gates

1. Provar adapter persistente com APIs públicas antes de integrar UI: open,
   heartbeats, close/erro/blocked/unblocked, eventos precoces e descarte. Extrair
   somente reutilização concreta do probe; regressão de 4A.2B obrigatória.
2. Implementar coordenador/estado/generation, prazos/cotas/clock/RNG e exclusão de
   probes; integrar mudanças de perfil e lifecycle no main.
3. Integrar IPC/preload/estado do shell e ações, atualizar guia/documentos.
4. Executar check, package e smokes sequenciais, incluindo base/perfis/HTTPS/AMQPS,
   sessão e matriz real; revisar artefato/capturas/cleanup e apresentar conclusão.

Gate específico: código fixado inicia seu loop de recebimento antes de devolver
o modelo público; eventos precoces podem anteceder nossos listeners. Testar
open-ok combinado com blocked, close e frame inválido, exigindo ausência de crash,
vazamento e sucesso indevido. Não consultar connection.blocked/stream internos
para contornar. Se APIs públicas não permitirem comportamento seguro, parar o
trabalho dependente e apresentar alternativa/decisão (inclusive eventual mudança
de cliente/versão), sem instalar ou aplicar patch fora deste contrato. O fluxo
inicial desconhecido não autoriza ignorar erro/fechamento ou alegar proteção total.

### Critérios de aceitação da 4A.2C

1. Inicialização e CRUD/seleção/getState/assinatura sem rede; Conectar explícito
   usa somente perfil/revision/CA/credencial válidos do main, recusando segredo
   ausente antes de DNS/TCP. Sem persistir sessão/senha ou alterar schema v2.
2. No máximo uma sessão; probes e sessão mutuamente exclusivos no main/UI.
   Repetição concorrente, janela/frame estrangeiro ou generation antiga não muda
   contexto atual. Troca nunca mantém sessão antiga funcionando ocultamente.
3. AMQPS permanece aberto por mais de dois intervalos de heartbeat no pacote e
   no RabbitMQ real, com heartbeat efetivo e **zero canais**. Close confirmado ou
   encerramento forçado corretamente diferenciados, sem APIs privadas.
4. HTTPS/AMQPS disponíveis/parciais/negados/inacessíveis representados separadamente;
   HTTPS sempre datado, sem promover whoami a saúde/vhost/permissão/publicação.
   UI fiel a ready/degraded/reconnecting/closed e fluxo inicial desconhecido.
5. Falha/restauração individual e simultânea prova backoff/jitter/cotas/deadline,
   sem sobreposição/reset infinito; TLS/401/403/recusa/protocolo terminal sem retry.
   Esgotamento permite intervenção manual, sem sessão antiga ressurgir.
6. Polling whoami no mínimo 5 s após conclusão, no máximo uma leitura; pause/
   retomada em foco/visibilidade/suspend sem rajadas. Heartbeat não é polling.
   Não afirmar SLA de detecção enquanto o SO estiver suspenso.
7. Desconectar durante fila/DNS/TCP/TLS/handshake/ready/retry, mudança de perfil,
   resposta atrasada, reload/crash/close/quit liberam recursos e invalidam contexto.
   Reabrir não conecta; no macOS, sair do processo descarta senha em memória.
8. Eventos precoces/blocked/unblocked e erro/close não derrubam processo nem geram
   estado/confirmação falso; gate de APIs públicas satisfeito ou impedimento
   explicitamente apresentado antes da implementação dependente.
9. Ponte com exatamente 22 métodos específicos e listener removível; origem/DTO/
   frame/tamanho/pós-await/evento validados, mensagens fixas e ausência de segredo
   em DTO/storage/log/pacote. CSP/sandbox/URL/navegação/9401448 preservados.
10. Componentes/teclado/foco/ambiente/temas/1024×700/zoom 200% verificados; guia
    Markdown/Ajuda/README sincronizados com comportamento real, sem liberar páginas
    ou funções futuras. Nativos/assistivas manuais e outros alvos explicitados.
11. Check/package e smokes sequenciais passam; matriz RabbitMQ real 4.4.0/4.3.6
    por digests já registrados cobre sessão, heartbeat, falhas/recuperação e cleanup
    com recursos próprios e portas loopback. Fixture não substitui broker real;
    indisponibilidade de ambiente é limitação, não teste aprovado.
12. Revisão técnica/ASAR/capturas, resultados/limitações e PROJECTS/estado/progresso
    atualizados; entrega pronta para aprovação de conclusão/commit, sem push ou 4B.

### Exclusões e referências da preparação

Sem listagem/seleção administrativa de vhosts, detecção de versão/capacidades,
overview/métricas, filas/exchanges/bindings, canais/confirm/publicação/consumo,
administração, providers de senha reais, OAuth/mTLS/proxy configurável, novos
pacotes, CI remoto, assinatura/release/updater. Sem renovar identidade ou reabrir
decisões aceitas; 4B e etapas seguintes precisam de contratos próprios.

Consultas em 2026-10-30: [heartbeats](https://www.rabbitmq.com/docs/heartbeats) e
[conexões RabbitMQ](https://www.rabbitmq.com/docs/connections) fundamentam distinção
de conexão persistente/vida do transporte. Código fixado de
[callback model](https://github.com/amqp-node/amqplib/blob/v2.2.0/lib/callback_model.js)
e [connection](https://github.com/amqp-node/amqplib/blob/v2.2.0/lib/connection.js)
conferido com o instalado; tipos locais callback_api.d.ts declaram os eventos
públicos. Página remota desses tipos indisponível; não foi tratada como prova.
[webContents](https://www.electronjs.org/docs/latest/api/web-contents),
[BrowserWindow](https://www.electronjs.org/docs/latest/api/browser-window) e
[powerMonitor](https://www.electronjs.org/docs/latest/api/power-monitor) são APIs
candidatas de lifecycle, sujeitas à verificação no Electron instalado.
[Releases RabbitMQ](https://www.rabbitmq.com/release-information) reconsultadas;
manter referências/digests aceitos 4.4.0/4.3.6, sem declarar versões adicionais.

Na preparação original não houve instalação, código/guia ou teste funcional novo.
Em 2026-10-30, “Autorizado” aceitou este contrato/C-01–07/limites. Executar primeiro
o gate de eventos precoces, sem ampliar escopo para contornar impedimentos.
Conclusão/commit terão aceite posterior próprio; 4B continua fora desta autorização.

### Resultado do gate inicial — 4A.2C

Em 2026-10-30, o gate **reprovou**: seis processos filhos encerrados por exceção
antes do modelo público em onze cenários; Callback/Promise Node e Callback no
runtime Node do Electron. [Evidências](../07-testing/sessions-4a2c.md).
Normal/heartbeat/close e cleanup observados, sem sessão de produto/UI.
Check passou com 216 testes/27 arquivos; gate manual permanece reprovado.

Conforme cláusula acima, interrompido trabalho dependente.
[ADR-0008](../03-architecture/adr/0008-amqp-lifecycle-safety.md) é Proposed: recomenda
patch local de uma linha, hashes/aplicação/build verificáveis e gates posteriores.
Não aplicado ou testado como correção. Solicitar aceite específico antes de
modificar dependência ou implementar sessão/UI. Sem commit/push.

### Continuidade autorizada após ADR-0008 A — 2026-10-30

A resposta “Autorizo aplicar e testar a alternativa A da ADR-0008” aceita a exceção
delimitada. Patch/hashes/instalação limpa e gate ampliado de 30 cenários passaram;
conforme item 6 da ADR Accepted e contrato 4A.2C já aprovado, implementação dependente
retomada. Versão 2.2.0 preservada, um único hunk, sem import privado/handler global.
Serviço/IPC/UI/guia de sessão implementados, verificação/revisão final em curso.
Não autoriza conclusão/commit/push ou 4B; evidências registram alcance real.

### Resultado para revisão — 4A.2C

Implementação/verificação encerradas: 237 testes/31 arquivos + seis Node, gate de
30 e instalação limpa aprovados. Package/cinco smokes e 54 checks reais passaram
(27 por versão), com cortes individuais/simultâneos/cleanup e sem canais. Guia e
registros sincronizados, ASAR/capturas revisados. Conclusão/commit pendentes;
ver evidências. Não iniciar 4B sem proposta/aceite próprios.

### Conclusão aceita — 4A.2C

Em 2026-10-30, “Aprovado” aceitou a conclusão e autorizou o commit
feat(connections): maintain broker session and bounded recovery. Entrega e
limitações apresentadas preservadas; aceite/documentação no mesmo commit.
Não autoriza push ou a etapa seguinte, que precisa de contrato e aceite próprios.

## Contrato autorizado — 4B.1: contexto administrativo de leitura

Data: 2026-10-30. Status: **Autorizado por “Autorizado” após apresentação**.
O proprietário aceitou este contrato/B1-D01–08/B1-01–10, inclusive gate real e
verificações previstas. Não inclui conclusão/commit, push ou próxima etapa.
A redação abaixo preserva os parâmetros apresentados e agora aceitos.

A 4B será dividida em 4B.1 (versão, visibilidade e consultas limitadas) e 4B.2
(seleção de vhost e transição do contexto), seguida das consultas necessárias às
filas. Essa divisão permite validar respostas/permissões reais antes de mudar o
vhost da conexão AMQPS. FR-019/020 continuam parciais após este primeiro incremento.

| Campo | Proposta para aprovação |
| --- | --- |
| Identificador/nome | 4B.1 — Contexto administrativo de leitura |
| Objetivo | Consultar a versão informada pelo endpoint HTTPS, listar vhosts visíveis e verificar a leitura do vhost atual, com origem, data e limites explícitos |
| Justificativa | whoami prova autenticação, mas não versão, visibilidade ou autorização de consultar recursos; estabelecer essa fronteira antes de filas e troca de contexto |
| Escopo | Adapter HTTPS restrito no main, três consultas GET específicas, cancelamento, DTOs/IPC, painel em Conexões, guia/Ajuda e testes isolados |
| Tarefas | Provar contratos reais/paginação primeiro; implementar transporte limitado e casos de uso vinculados à sessão; integrar IPC/preload/UI; cobrir falhas/lifecycle; atualizar documentação e executar verificações |
| Módulos afetados | M01 e M06 parciais; shell/contexto, segurança, guia/Ajuda e testes transversais |
| Arquivos previstos | Lista abaixo; sem reorganização geral da base |
| Dependências | 4A.2C aprovada em aba792d, ADRs 0002/0003/0005/0008, APIs Node e tooling já instalados; nenhum pacote novo ou atualização de lock |
| Riscos | Lista visível confundida com autorização AMQP, dados de outra sessão, paginação ignorada, resposta excessiva, inferência de capacidades por versão/tag, confusão entre endpoints de brokers diferentes |
| Critérios de aceitação | B1-01–10 abaixo, gate real inicial aprovado, regressões e documentação sincronizadas, sem prometer suporte não verificado |
| Estratégia de testes | Unidade/contrato/IPC/componentes, fixtures HTTPS adversariais, package e smokes sequenciais, integração com RabbitMQ 4.4.0/4.3.6 isolados |
| Resultado esperado | Usuário consulta informações administrativas reais e datadas sem alterar broker, perfil ou vhost da sessão |
| Impacto documental | PROJECTS/AGENTS/estado/progresso/roadmap, NFR e requisitos afetados, M01/M06/índice, arquitetura/segurança, guia canônico/Markdown/README e evidências da 4B.1 |

### Escolhas e limites propostos

1. **B1-D01 — Consultas explícitas, vinculadas à sessão atual.** Painel
   “Informações administrativas” em Conexões, disponível para sessão desejada,
   HTTPS disponível e janela em foreground. Ações Consultar informações,
   Listar vhosts e Verificar vhost atual; atualizar/repetir por ação manual.
   Entrar na tela, ler estado, abrir Ajuda ou restaurar a janela não faz consulta
   administrativa automática. O whoami da sessão mantém seu contrato existente.
   AMQPS indisponível não impede leitura HTTPS; blocked não prova falha HTTP.
2. **B1-D02 — Allowlist GET no núcleo.** Somente `/api/overview`, `/api/vhosts`
   paginado e `/api/vhosts/{vhost-atual}`. Base HTTPS, usuário, senha transitória e
   CA vêm do perfil/revisão da sessão no main. Preservar prefixo da URL salva;
   nomes são segmentos codificados uma única vez, sem normalização de `.`, `..`,
   barras ou escapes literais. Renderer nunca fornece URL, caminho, headers, CA,
   credenciais, nome de vhost consultado ou método HTTP arbitrários.
3. **B1-D03 — Informação mínima e capacidades observadas.** Overview retorna
   somente versão RabbitMQ e versão Management quando presentes, até 128 bytes
   UTF-8 por campo, mais origem lógica HTTPS, sessionId/generation e checkedAt.
   Campo ausente significa desconhecido; formato inesperado gera erro sanitizado,
   sem corpo bruto. Versão reconhecida 4.3/4.4 indica apenas série da matriz de
   referência, não homologação integral. Outras versões/prereleases aparecem como
   fora da matriz validada ou desconhecidas; não habilitar escrita ou recursos por
   comparação de versão. Sucesso/403/404/formato incompatível são observações
   daquela consulta, não catálogo de privilégios. Não consultar usuários,
   permissões, feature flags, definições, plugins ou nós para inferir direitos.
4. **B1-D04 — Vhosts visíveis, sem seleção.** Pedir páginas de 100 nomes,
   `page`, `page_size=100`, `pagination=true`, ordenação por nome,
   `disable_stats=true` e projeção `columns=name`, conforme contrato real provado.
   Somente uma página na memória da UI; anterior/próxima sem varredura/preload de
   todas as páginas. Página é inteiro seguro positivo, page_size fixo; validar
   envelope/items/contagens e rejeitar mais de 100 itens, nomes duplicados na
   mesma página ou resposta sem paginação. Não usar fallback de download completo.
   Nome preservado exatamente, até 255 bytes UTF-8, sem controles, conforme recorte
   atual do produto; fora desse recorte produz erro explícito, sem truncar nome.
   Mudanças concorrentes no broker podem alterar páginas; não prometer snapshot
   consistente ou interpretar ausência em uma página como vhost inexistente.
5. **B1-D05 — Acesso ao vhost atual é outra observação.** GET específico do
   vhost derivado da sessão, com estatísticas desabilitadas e projeção mínima;
   devolver apenas nome validado e data. 403 é negado; 404 é não encontrado ou
   não visível; não diagnosticar exclusão com certeza nem fechar AMQPS funcional.
   Monitoring/administrator podem visualizar vhosts sem autorização AMQP; nenhum
   item da lista recebe rótulo “acessível por AMQP”. HTTPS e AMQPS continuam
   independentes; nem nomes/versionamento iguais provam que apontam ao mesmo broker.
6. **B1-D06 — Recursos limitados.** Prazo total 10 s por consulta desde aceitação,
   incluindo resolução DNS/TLS/leitura; headers até 16 KiB, corpo até **256 KiB**
   por resposta e profundidade JSON até 16. Sublimite inferior aos 10 MiB NFR-015,
   próprio para estas projeções. Validar UTF-8, JSON e shape; tolerar campos novos
   sem repassá-los. Aceitar só application/json e codificação identity, sem
   descompressão/fallback. Sem redirect, downgrade, proxy de ambiente ou bypass TLS.
   Uma consulta administrativa em voo por janela, rejeitando nova enquanto ocupada;
   junto do whoami, no máximo duas leituras HTTPS simultâneas, abaixo de NFR-017.
   Sem fila ilimitada, retry automático administrativo, polling novo ou cache em
   disco. Rate limit/5xx/rede/TLS/auth/permissão/formato/limite/timeout/cancelamento
   recebem códigos distintos quando identificáveis, sem ecoar resposta do broker.
7. **B1-D07 — Autoridade e invalidação.** Conferir janela/frame/URL, UUID de
   operação, sessão/generation e revisão antes e após I/O. Trocar/salvar/remover
   perfil, desconectar, recarregar, crash, fechar, quit, background ou suspend
   aborta consulta e invalida resultado tardio. Mudança externa de arquivo segue
   detecção nas leituras/revisões existentes, sem promessa de watcher instantâneo.
   Navegar para fora do painel cancela operação própria e limpa conteúdo; voltar
   exige nova ação. Falha de consulta não altera cota de recuperação ou estado do
   whoami/AMQPS. Dentro do painel, uma falha pode preservar último sucesso datado
   da mesma operação/contexto, marcado desatualizado com failedAt separado; ao mudar
   página, nunca exibir nomes da página anterior como se fossem a nova.
8. **B1-D08 — IPC específico e UX.** Quatro métodos adicionais propostos:
   `getBrokerInfo`, `listSessionVhosts`, `getCurrentVhostInfo`,
   `cancelManagementRead` (22 → **26** no total), em canal administrativo próprio.
   Inputs fechados com sessionId/generation/operationId e página só na listagem;
   main resolve perfil/revisão/vhost. Cancelamento somente do UUID em voo do mesmo
   dono/contexto, idempotente, sem cancelar whoami ou sessão. Respostas validadas
   também no preload, nenhum objeto Electron entregue, sem novo evento genérico.
   Loading/cancelar/vazio/erro/limite/indisponibilidade/atualidade explícitos;
   foco visível/restaurado, teclado e temas, produção com texto/símbolo. Sem novo
   formulário de conexão nem nova rota de dashboard/administração completa.

### Gate inicial obrigatório

Antes de integrar UI, estender o harness real exclusivamente em recursos próprios
para provar nas duas versões: overview/campos, listagem com **mais de 100 vhosts**,
projeção/paginação e consulta de nomes codificados, perfis management/monitoring e
usuário sem tag administrativa. Verificar visibilidade diferente e recusa real,
sem elevar tags/permissões de usuário externo. A criação de vhosts/usuários ocorre
só no provisionamento isolado do harness, nunca por ação do produto.

Se alguma versão ignorar paginação/projeção, o formato ou permissões divergirem
sem solução dentro deste contrato, interromper o trabalho dependente e apresentar
opção concreta. Não simular paginação no cliente, baixar tudo nem expandir allowlist
ou trocar versão/dependência silenciosamente. Docker indisponível impede aprovar
esse gate; registrar limitação em vez de substituí-lo por fixture roteirizada.

### Arquivos previstos para implementação após aprovação

- Novos `src/main/management/{httpsRead,service,validation}.ts` e testes próximos;
  `src/main/ipc/management.ts`/teste; `src/shared/management.ts`/teste.
- Integrações pontuais em `src/main/sessions/sessionService.ts`, composição main,
  registro/disposal de IPC, preload/API compartilhada e respectivos testes.
- `src/renderer/pages/ManagementInfo.tsx` e testes/estilos locais, integração em
  Connections, sem refatorar shell/UI legada ou alterar assets/barra nativa.
- Harness `tools/testing/management.cjs` e extensão restrita de
  `tools/testing/rabbitmq-real.cjs`/fixtures isoladas; atualizar allowlist da ponte
  nos smokes existentes e repetir verificações conforme impacto.
- Documentos citados no contrato e novo `docs/07-testing/management-4b1.md` com
  resultados reais; guia JSON/Markdown gerado e Help seguem fonte única existente.

Reaproveitar validações/segurança HTTPS existentes quando adequado; qualquer
extração deve preservar integralmente sublimits/semântica do probe whoami e patch
ADR-0008. Sem nova dependência, migração de JSON, provider de senha ou troca do
cliente AMQP. Ajustes internos nesses caminhos não autorizam ampliar funcionalidades.

### Critérios de aceitação verificáveis

1. **B1-01:** gate real nas duas versões comprova formato, mais de uma página,
   projeção e visibilidade por permissões antes de integrar dependentes.
2. **B1-02:** produto emite exclusivamente os três GETs permitidos, com perfil/CA
   no main e encoding preservado, incluindo `/`, Unicode, espaços, `%`, `.`/`..`.
3. **B1-03:** nenhuma consulta ocorre sem ação manual/sessão elegível; uma operação
   em voo e limites de bytes/headers/deadline/profundidade efetivamente aplicados.
4. **B1-04:** versão ausente/fora da matriz, 401/403/404/429/5xx, corpo inválido,
   certificado inválido, redirect, timeout e cancelamento têm saída explícita e
   sanitizada; ausência/erro nunca vira lista vazia, zero ou suporte aprovado.
5. **B1-05:** páginas de 100 preservam nomes/metadados coerentes; resposta completa
   inesperada é recusada e não é paginada visualmente; dados antigos não cruzam páginas.
6. **B1-06:** lifecycle, navegação, revisão e geração antigas descartam resultados
   e liberam sockets/listeners; cancelar operação antiga não afeta nova sessão.
7. **B1-07:** ponte com 26 métodos fechados passa testes de origem/frame/shape e
   resposta; renderer não tem rede externa, URL genérica, segredo ou API Node.
8. **B1-08:** UI mostra perfil/ambiente/vhost atual, datas e caráter apenas visível
   dos vhosts; teclado/foco/temas/zoom e estados vazios/erros revisados no pacote.
9. **B1-09:** check/package, cinco smokes existentes e novo smoke administrativo
   sequenciais passam; integração real nas duas versões confirma leituras e
   cancelamento sem canais/publicação/consumo, com cleanup de recursos próprios.
10. **B1-10:** guia/README/Ajuda, PROJECTS/estado e evidências sincronizados;
    limitações dos outros alvos/cluster/nativos/providers permanecem explícitas.
    Revisão e aceite de conclusão próprios antes de commit, sem push automático.

### Fora deste contrato

Selecionar/trocar vhost, conectar em nome da seleção, editar perfil automaticamente,
CRUD de recursos/usuários/permissões/policies, filas/exchanges/bindings/mensagens,
catálogo completo de capacidades, dashboard/métricas/gráficos/histórico, persistir
segredos, novas dependências, alterar ADR-0008, CI remoto/assinatura/releases/push.
4B.2 e demais etapas exigem propostas e autorizações independentes.

### Fontes e limites da preparação

Consulta em 2026-10-30: [referência HTTP oficial](https://www.rabbitmq.com/docs/http-api-reference)
(overview, vhosts, projeção/disable_stats e paginação) e
[tags e permissões Management](https://www.rabbitmq.com/docs/management#access-and-permissions).
O [handler 4.3.6](https://github.com/rabbitmq/rabbitmq-server/blob/v4.3.6/deps/rabbitmq_management/src/rabbit_mgmt_wm_vhosts.erl)
usa list_visible_vhosts e augment_resources; essa leitura não comprova os contratos
em execução. Documentação corrente identificada como 4.4; URLs específicas 4.3 e
raw 4.4 não ficaram acessíveis pelo navegador nesta preparação. Não afirmar
homologação do incremento sem gate real. Nenhum broker/teste funcional executado
para esta proposta; resultados da 4A.2C não homologam consultas novas.

### Resultado do gate autorizado 4B.1 — decisão antes de dependentes

“Autorizado” aprovou o contrato acima. A execução real em 4.4.0/4.3.6 reprovou
paginação/permissões/rotas nos cenários descritos nas [evidências](../07-testing/management-4b1.md).
Aplicou-se a interrupção prevista no próprio contrato. Não implementar dependentes,
baixar tudo como fallback ou simular paginação sem nova decisão.

[ADR-0009 Proposed](../03-architecture/adr/0009-management-vhost-read-contract.md)
recomenda um recorte explícito A: lista completa limitada 200/256 KiB, sem paginação
ou GET individual; presença do vhost atual na lista e três métodos adicionais
(25 total). A ainda não foi aprovada/aplicada e seu novo gate será obrigatório.
B/C registradas; nenhum patch de broker/versão novo presumido. Check existente
passou 237 testes + seis Node, mas gate permanece reprovado. Sem pacote/smokes
novos, conclusão/commit/push ou 4B.2. Próxima ação: apresentar evidências e decisão.

### Revisão aceita — ADR-0009 alternativa A

“Autorizado” aceitou A e retomada após gate, substituindo B1-D04/05/08 e critérios
afetados: dois GETs fixos (overview e vhosts com disable_stats/columns/sort), lista
completa até 200/256 KiB, sem paginação/GET individual, presença exata do vhost
atual no snapshot; três métodos adicionais, ponte 25 total. Não há seleção de vhost.
Demais limites/segurança/lifecycle/testes do contrato original preservados.

Gate revisado com mesmo adapter passou 12 verificações por versão real (24 total),
liberando retomada serviço/IPC/UI/guia. B1-01 prova esse recorte, B1-02 não emite
rota individual, B1-05 exige lista completa validada e recusa 201/limites, B1-07
exige 25 métodos e B1-08 lista sem seletor; demais critérios continuam aplicáveis.
Nove ADRs Accepted; falha original permanece registrada. Implementação em
verificação, sem conclusão/commit/push ou 4B.2 aprovados.

### Resultado final 4B.1 — pronto para revisão

Contrato revisado por A implementado e verificado: 266 testes/36 arquivos + seis
Node, package/seis smokes e 60 checks reais (30 por versão), com cleanup completo.
Guia/Ajuda 15 tópicos/12 campos e documentação sincronizados. [Evidências](../07-testing/management-4b1.md).
B1-01–10 revisados atendidos no recorte local; outros alvos/cluster/nativos/providers
mantêm limitações. M01/M06 e requisitos amplos permanecem parciais.

Próxima ação: apresentar e solicitar aprovação de conclusão e do commit
feat(management): add bounded broker information and vhost reads. Nada autoriza
commit/push ou 4B.2 antes do aceite próprio.

### Conclusão 4B.1 aprovada — 2026-10-31

“Autorizado” aceitou a conclusão e autorizou o commit
feat(management): add bounded broker information and vhost reads. Conferidos os 46
arquivos/ASAR apresentados; este registro acompanha a entrega. Resultados e
limitações preservados, sem código/guia alterados no aceite e sem nova execução
funcional. Não autoriza push ou preparar/implementar a próxima fase automaticamente.

## Contrato autorizado — 4B.2: seleção de vhost e transição de contexto

Data: 2026-11-17. Status: **autorizado; revisão confirmada por “Sim” e gate revisto aprovado**.
Base observada: `4a35424`, branch `chore/modernization-app`, Git limpo e entrega
4B.1 aprovada. O pedido “Continue de onde parou” iniciou a preparação da
proposta. O aceite posterior autoriza B2-D01–08/B2-01–10.

| Campo                  | Proposta para aprovação                                                                                                                                                                                                   |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Identificador/nome     | 4B.2 — Seleção de vhost e transição de contexto                                                                                                                                                                           |
| Objetivo               | Permitir escolher explicitamente um nome retornado pela lista limitada da 4B.1 e transicionar a conexão AMQPS da sessão para esse vhost, sem editar o perfil                                                              |
| Justificativa          | A sessão hoje usa apenas o vhost salvo na URL; filas e demais recursos precisam de um contexto selecionado, mas visibilidade HTTPS não comprova permissão AMQP                                                            |
| Escopo                 | Catálogo efêmero no main, comando específico de seleção, transição fail-closed da sessão/AMQPS, estado/UX/guia e testes isolados/reais                                                                                    |
| Tarefas                | Provar gate de lifecycle nas duas versões; implementar catálogo/autoridade e override estruturado de vhost; transicionar sessão; integrar IPC/preload/UI; atualizar guia/documentos; executar check/package/smokes/matriz |
| Módulos afetados       | M01 e M06; sessão, conexão AMQPS, ManagementInfo/Conexões, IPC, segurança, Ajuda e testes transversais                                                                                                                    |
| Arquivos previstos     | Lista abaixo; sem reorganização geral, schema de perfil ou nova rota de produto                                                                                                                                           |
| Dependências           | 4A.2C/ADR-0008 A e 4B.1/ADR-0009 A aprovadas; amqplib 2.2.0/patch vigente; nenhuma dependência ou alteração de lock nova                                                                                                  |
| Riscos                 | Nome arbitrário vindo do renderer, snapshot antigo, duas conexões simultâneas, contexto antigo reaparecer, confundir visibilidade com acesso, editar perfil sem consentimento ou reaproveitar resposta de outra geração   |
| Critérios de aceitação | B2-01–10 abaixo, gate real inicial aprovado, regressões/documentação sincronizadas e limitações apresentadas para aceite de conclusão                                                                                     |
| Estratégia de testes   | Unidade/contrato/IPC/componentes, fixture AMQP adversarial, package e sete smokes sequenciais, matriz isolada RabbitMQ 4.4.0/4.3.6                                                                                        |
| Resultado esperado     | Sessão permanece única e passa a usar, somente em memória, o vhost escolhido e efetivamente aceito pelo AMQP; falha deixa estado explícito sem rollback silencioso                                                        |
| Impacto documental     | PROJECTS/AGENTS/roadmap/estado/progresso, requisitos/NFR, arquitetura/segurança, M01/M06/índice, guia canônico/Markdown/README e novas evidências 4B.2                                                                    |

### Escolhas e limites propostos

1. **B2-D01 — Origem autorizada da seleção.** Uma listagem 4B.1 aprovada
   passa a devolver `selectionId` opaco, criado no main. O main mantém no máximo
   um catálogo completo de até 200 nomes por sessão/janela, somente em memória,
   vinculado a owner, sessionId, generation, revision e instante. Seleção recebe
   `selectionId` e nome exato; o main exige pertinência ao catálogo. Renderer não
   fornece URL, endpoint, credencial, CA ou opção de transporte. Catálogo expira
   em **cinco minutos**, é substituído pela próxima lista e invalidado por nova
   generation, mudança de perfil/revisão, background/suspend, reload/close/quit,
   desconexão ou descarte do serviço. Não persistir nomes/token em disco.
2. **B2-D02 — Ação explícita e sem persistência.** A UI oferece “Usar este
   vhost” somente após listagem manual e em linha distinta do vhost atual. Abrir a
   tela, listar, focar, restaurar ou reconectar não seleciona nada automaticamente.
   A troca não altera `amqpsUrl`, JSON, revision, senha, CA ou perfil; ao encerrar e
   ativar novamente, vale o vhost salvo na URL. Não adicionar preferência de
   “último vhost”. Produção continua identificada por texto/símbolo; a ação
   informa que fecha a conexão AMQPS atual e pode gerar login/logs no broker.
3. **B2-D03 — Transição fail-closed.** Ao aceitar a seleção, o main incrementa
   generation e publica o novo contexto desejado **antes** de I/O; cancela retry/
   abertura AMQPS antiga, fecha a conexão antiga por até 1 s e a destrói antes de
   abrir a nova. Nunca manter duas conexões AMQPS de trabalho simultâneas nem
   continuar no vhost anterior enquanto a UI mostra o novo. Abertura usa o mesmo
   destino, TLS, usuário, senha e CA do perfil/revisão, mudando somente o campo
   estruturado de vhost no main; sem remontar URL com segredo ou aceitar override
   genérico. Vhost atual selecionado deve ficar visível durante connecting/falha.
4. **B2-D04 — Falha sem rollback implícito.** Visibilidade HTTPS não é rotulada
   como permissão AMQP. Se o broker recusar o vhost/usuário, TLS/protocolo falhar
   ou o prazo terminar, a sessão fica degradada no novo contexto desejado, HTTPS
   pode continuar disponível e o vhost antigo não é reaberto automaticamente.
   Erros terminais não recebem retry; somente rede/timeout seguem a cota restante
   de até cinco tentativas da ativação, reiniciada para essa ação explícita e
   sem reset por sucesso. Usuário pode escolher outro catálogo vigente, listar de
   novo ou desconectar. Não diagnosticar vhost inexistente versus sem permissão a
   partir da recusa AMQP sanitizada.
5. **B2-D05 — HTTPS e dados antigos.** A troca não reinicia whoami nem muda o
   endpoint HTTPS. Incrementar generation invalida consulta administrativa em voo,
   catálogo anterior e resultados de recursos futuros; o polling HTTPS da mesma
   sessão pode continuar conforme 4A.2C, sem sobrepor chamadas. Após a transição,
   a próxima listagem deriva `currentVisible` do vhost selecionado. Endpoints HTTPS
   e AMQPS ainda podem apontar a brokers diferentes; sucesso em ambos não prova
   identidade comum. Nenhuma consulta nova à API Management é adicionada na 4B.2.
6. **B2-D06 — Lifecycle e concorrência.** Uma transição por vez; seleção
   repetida/concorrente, nome atual ou token antigo é recusado antes de rede. Não
   há fila de trocas. Desconectar, editar/remover perfil, mudança externa, reload,
   crash, close, quit ou suspend aborta/destroi o trabalho; background aborta a
   abertura e conserva o contexto desejado pausado, sem rajada ao voltar. Resultado
   tardio nunca restaura generation/vhost/handle antigo. Seleção não interfere em
   probes de teste, que permanecem mutuamente exclusivos com sessão ativa.
7. **B2-D07 — Prazo e conexão.** Fechamento antigo usa o limite vigente de 1 s;
   a nova abertura AMQPS usa deadline total de 15 s e heartbeat/frame/channelMax
   vigentes. O fechamento acontece antes da abertura; por isso o tempo percebido
   pode chegar a 16 s, sem esconder as duas fases. Nenhum canal, mensagem, fila,
   exchange, binding ou consulta de topologia é criado. O gate deve provar conexões
   zero/uma e cleanup, não apenas observar estado da UI.
8. **B2-D08 — IPC e interface.** Um método específico adicional,
   `selectSessionVhost({ sessionId, generation, operationId, selectionId, vhost })`,
   no canal de sessão: ponte **25 → 26 métodos**. Retorna snapshot inicial e
   progresso/final chegam pelo evento tipado existente; sem invoke/send/evento
   genérico. Inputs/respostas fechados, UUIDs e nome limitado a 255 bytes UTF-8
   sem C0/DEL. `SessionSnapshot` indica transição de vhost de forma limitada
   (origem, destino e início, sem endpoint/segredo). Loading, conectado, degradado,
   recusado, prazo e contexto salvo versus temporário ficam explícitos; foco volta
   à linha/aviso adequado e teclado/temas/zoom seguem os contratos existentes.

### Gate inicial obrigatório

Antes de integrar UI/guia como funcionalidade disponível, estender somente o
harness isolado para provar nas imagens fixadas 4.4.0/4.3.6:

- conexão inicial no vhost salvo e transição para `/`, Unicode, espaços, `%`,
  barra no nome, `.` e `..`, preservando exatamente o nome no AMQP;
- usuário monitoring que enxerga um nome mas não possui acesso AMQP, com recusa
  sanitizada e sem reabrir o vhost anterior;
- ordem fechar/destruir antes de abrir, no máximo uma conexão, zero canais e cleanup;
- catálogo/membership, expiração, generation/revision antigas, seleção repetida,
  timeout, corte durante close/open, disconnect e evento tardio;
- nenhuma gravação no perfil e nova ativação usando novamente o vhost da URL salva.

O harness cria apenas usuários/vhosts/permissões/container/rede/certificados
próprios, em loopback, e remove tudo no `finally`. Divergência que exija outro
patch amqplib, nova dependência, duas conexões simultâneas, API privada ou mudança
de semântica interrompe o trabalho dependente e volta para decisão. Fixture local
não substitui esse gate; Docker indisponível é limitação/reprovação do gate.

### Arquivos previstos para implementação após aprovação

- Novo catálogo pequeno em `src/main/management/vhostCatalog.ts` (ou nome local
  equivalente) e testes; integração pontual no `ManagementService` para emitir e
  invalidar `selectionId`, sem mudar os dois GETs da ADR-0009 A.
- `src/main/sessions/sessionService.ts`, validação/IPC da sessão, contratos em
  `src/shared/session.ts`/`management.ts`, composição main e respectivos testes.
- `src/main/connections/amqpsConnection.ts` aceita override estruturado somente
  interno; parser/limites existentes e patch ADR-0008 preservados. Nenhum novo
  método público de transporte ou exposição ao preload.
- Preload/API compartilhada e testes de fronteira; `ManagementInfo.tsx`/estilos e
  integração de estado em Conexões, sem nova rota, asset ou refatoração do shell.
- Estender `tools/testing/sessions.cjs`, `management.cjs` e
  `rabbitmq-real.cjs`; repetir smokes base/perfis/HTTPS/AMQPS/sessão/management e
  acrescentar smoke 4B.2 sequencial, sem sobrepor harnesses GUI.
- Documentos citados no contrato e novo `docs/07-testing/vhost-transition-4b2.md`;
  guia JSON/Markdown/Ajuda somente depois de o gate liberar a implementação.

### Critérios de aceitação verificáveis

1. **B2-01:** gate real nas duas versões prova nomes especiais, recusa por
   permissão e ordem/cleanup da transição antes de integrar UI.
2. **B2-02:** apenas nome pertencente ao catálogo main vigente pode ser escolhido;
   token/nome/owner/sessão/generation/revision expirados ou divergentes não abrem rede.
3. **B2-03:** perfil/JSON/revision/URL/segredo/CA permanecem byte a byte sem escrita;
   reativar sessão volta ao vhost salvo, sem preferência oculta.
4. **B2-04:** generation muda antes do I/O, dados antigos são descartados e a
   conexão antiga é fechada/destruída antes da nova; nunca há duas conexões.
5. **B2-05:** sucesso exige open-ok no nome exato. Recusa/TLS/protocolo/timeout/
   rede/cancelamento ficam sanitizados; nenhuma falha reabre silenciosamente o antigo.
6. **B2-06:** lifecycle, background/suspend, mudança de perfil, desconexão e
   resultados atrasados liberam sockets/timers/listeners e não cruzam contexto.
7. **B2-07:** ponte com 26 métodos passa origem/frame/shape/resposta; renderer não
   recebe URL, credencial, CA, socket, cliente, invoke/send ou opção AMQP genérica.
8. **B2-08:** UI distingue visível/conectado/salvo/temporário/transição/falha,
   ambiente de produção, datas e efeitos; teclado/foco/temas/zoom 200% revisados.
9. **B2-09:** check/package e sete smokes sequenciais passam no mesmo ASAR; matriz
   real confirma transição sem canais/escritas e cleanup nas duas versões.
10. **B2-10:** guia/README/Ajuda e documentos técnicos/estado/evidências ficam
    sincronizados, sem declarar filas/próxima etapa; resultados/limitações são
    apresentados para aceite de conclusão antes de commit, sem push automático.

### Fora deste contrato

Persistir a seleção, editar automaticamente o perfil, seleção livre fora da
lista 4B.1, sessões/conexões simultâneas, elevação de permissões, canais, filas,
exchanges, bindings, mensagens, CRUD administrativo, métricas/dashboard, nova
consulta HTTP, dependência/patch/ADR, provider de senha, CI remoto, assinatura,
release, commit ou push. A Etapa 5 terá contrato próprio para listar/detalhar filas
no contexto selecionado; esta proposta apenas estabelece sua pré-condição.

### Evidência da preparação

O código em `4a35424` mantém uma sessão, generation no main, conexão AMQPS sem
canais e lista limitada a 200 nomes. Hoje `openAmqpsConnection` deriva o vhost
somente da URL salva; `SessionService` invalida consultas por generation e
`ManagementService` não armazena catálogo. A proposta adiciona apenas as fronteiras
necessárias, preservando ADR-0008/0009 e os limites NFR-012–19 vigentes.

Nenhum broker, teste funcional, build, package ou smoke foi executado nesta
preparação; nenhum comportamento 4B.2 está disponível. Fontes oficiais já
registradas para URI, acesso, heartbeats e Management continuam sendo referência,
mas os contratos decisivos serão provados na matriz fixa antes de UI. Próxima
ação: revisar esta proposta e obter autorização explícita B2-D01–08/B2-01–10.

### Resultado do gate 4B.2

O gate passou quatro grupos e reprovou um em cada RabbitMQ 4.4.0 e 4.3.6.
Sob interrupção de rede durante o fechamento, a nova conexão recebeu open-ok
enquanto a anterior ainda constava do registro interno do broker. Isso impede
atender ao contrato atual ao prosseguir após fechamento sem confirmação.
A recomendação é interromper a troca nesse estado e exigir confirmação remota
para abrir a substituta. A revisão e o gate correspondente dependem de aceite
específico. [Evidências e alternativas](../07-testing/vhost-transition-4b2.md).

### Revisão aprovada em 2026-11-17

“Sim” aprovou o fechamento confirmado como condição para iniciar a nova
conexão. Esta revisão complementa B2-D03/D04/D06/D07 e B2-01/B2-04/B2-06.
O limite de até 1 s para fechar continua válido. Sem confirmação ou quando
uma abertura anterior puder ter sido aceita pelo broker, interromper a troca
com diagnóstico explícito e bloquear novas aberturas automáticas de AMQPS
por essa transição. Destruir os recursos locais. O usuário pode encerrar a
sessão e fazer uma nova ativação explícita. Essa ativação segue o contrato
4A.2C, sem inferir que o broker já removeu conexões antigas.

O gate revisto deve demonstrar fechamento confirmado, recusa segura durante
partição e abertura anterior de resultado incerto, além dos demais checks
de seleção e lifecycle. Manter os resultados do gate original como histórico.

### Resultado final 4B.2 para revisão

Gate revisado de 12 checks, check 274 + seis Node, package/sete smokes e
matriz de 64 checks reais no ASAR final passaram. A seleção altera somente o
contexto da sessão e bloqueia a substituta quando a conexão anterior pode
permanecer no broker. Guia e Ajuda mostram a ação e seus efeitos. A entrega
aguarda aceite da conclusão e do commit
`feat(connections): switch vhosts after confirmed close`.
[Evidências](../07-testing/vhost-transition-4b2.md).

### Conclusão 4B.2 aprovada em 2026-11-18

“Aprovado” aceitou a entrega, suas evidências e o commit
`feat(connections): switch vhosts after confirmed close`. A Etapa 5 segue
sujeita a solicitação e contrato próprios.

## Contrato proposto — 5A: listagem e detalhe de filas

Data: 2026-11-18. Status: **execução aprovada por “Aprovo”**, incluindo a
validação isolada e os demais itens do contrato. O pedido “Continue” iniciou a
preparação. Base observada: `main` em `2f1f6cc`, com a mesma árvore da
entrega 4B.2 em `43113eb`.

| Campo | Proposta para aprovação |
| --- | --- |
| Identificador e nome | 5A — Listagem e detalhe de filas |
| Objetivo | Abrir Filas para consultar, pesquisar e inspecionar metadados de filas no vhost ativo |
| Justificativa | Verificar rotas, paginação e permissões nas versões de referência antes de introduzir escritas |
| Escopo | Lista paginada, busca literal por nome no vhost, filtro de tipo na página, detalhe com propriedades, argumentos básicos, contagens e consumidores, por dois GETs da Management API |
| Tarefas | Provar o contrato do adapter na matriz real; integrar autorização, IPC e UI; atualizar guia e documentos; verificar o executável |
| Módulos afetados | M03, com reuso de sessão M01 e transporte M06; navegação, Ajuda e testes transversais |
| Arquivos previstos | Ver a seção de estrutura e verificação abaixo |
| Dependências | Entrega 4B.2 integrada, ADR-0008 e ADR-0009 vigentes, perfis e CA existentes, imagens fixadas no harness. Usar versões e dependências instaladas |
| Branch | Base atual na branch existente `main`; criar outra branch depende de autorização específica |
| Riscos | Paginação/projeção divergentes por versão, normalização de segmentos, contagens ausentes, enumeração cara no broker, nomes iguais em vhosts diferentes, permissões HTTPS e AMQPS distintas e respostas tardias |
| Critérios de aceitação | 5A-01–10 abaixo; FR-007/008, MVP-Q01, FR-025–030 e limites NFR-012–018 aplicáveis |
| Verificação | Gate real do adapter, unidade/IPC/componentes, check, package, regressões de smoke e matriz real no mesmo pacote |
| Resultado esperado | Tela Filas utilizável em leitura, com escopo, origem, horário, paginação real e diagnóstico explícito |
| Impacto documental | Histórico e estado atualizados; requisitos/limites, arquitetura, segurança, M03 e evidências alinhados ao resultado; guia canônico, Markdown e Ajuda sincronizados após implementação |

### Sequência proposta da Etapa 5

| Subetapa | Entrega |
| --- | --- |
| 5A | Leitura de filas conforme este contrato, cobrindo FR-007/008 e MVP-Q01 no recorte validado |
| 5B | Declaração classic/quorum e validação de argumentos/conflitos, com contrato para FR-009 e MVP-Q02 |
| 5C | Purge com confirmação nativa proposto para 5C.1 (FR-011). Exclusão condicional (FR-010) depende da decisão registrada no contrato 5C. MVP-Q03 cobre ambos |

### Decisões propostas

1. **5A-D01 — Contexto da consulta.** Derivar o vhost exato da sessão no main,
   inclusive quando temporário. Exigir janela em foreground, sessão desejada,
   HTTPS disponível e AMQPS estabelecido para esse contexto. Fluxo AMQPS
   bloqueado pelo broker continua elegível enquanto a conexão estiver aberta.
   Durante ativação, troca, recuperação do AMQPS ou fechamento, a tela explica
   por que a leitura está indisponível. O AMQPS fixa o contexto de uso. A
   resposta HTTPS do próprio endpoint decide se ele permite a leitura e qual
   recurso está visível. Perfis com endpoints distintos continuam suportados
   sem afirmar que representam o mesmo broker.
2. **5A-D02 — Paginação e busca.** Fazer `GET /api/queues/{vhost}` com
   `pagination=true`, `page_size=100`, `sort=name`, página positiva inteira
   de até 2.147.483.647 e `use_regex=false`. Com busca, usar `name` como
   trecho literal de até 255 bytes UTF-8 enviado ao broker, sem regex.
   Aplicar a busca explicitamente e voltar à página 1. Validar `items`, página,
   tamanho e contagens do envelope, com itens únicos e do vhost exato.
   Usar as contagens do broker, inclusive zero páginas para resultado vazio.
   Se uma página ficar fora de faixa após mudanças, mostrar o estado e
   permitir voltar à primeira página por ação explícita. Filtro por tipo
   classic, quorum, stream ou outros/indisponíveis atua só sobre a página
   carregada, com rótulo “Nesta página”. Sem autoavanço nem fallback global
   ou não paginado.
3. **5A-D03 — Nome e rotas.** O detalhe usa
   `GET /api/queues/{vhost}/{name}` para a linha aberta. O main codifica
   cada segmento uma vez, preservando `/`, percentuais literais e Unicode
   sem normalização ou trim. Nome e vhost são não vazios, até 255 bytes
   UTF-8, sem C0/DEL ou Unicode inválido. Recusar antes do I/O segmentos
   exatamente `.` ou `..`, com motivo explícito. Uma fila com esse nome pode
   aparecer na tabela de um vhost suportado, com detalhe indisponível.
   Validar o vhost de cada item e o par nome/vhost no detalhe. Usar o
   prefixo HTTPS do perfil e as duas rotas fixas com parâmetros permitidos.
4. **5A-D04 — Dados apresentados.** Lista com nome, tipo e campos opcionais
   `messages_ready`, `messages_unacknowledged`, `messages` e `consumers`.
   Detalhe acrescenta flags de durabilidade, exclusividade e auto-delete,
   estado quando disponível e argumentos básicos de leitura
   (`x-queue-type`, `x-message-ttl`, `x-max-length`,
   `x-dead-letter-exchange`, `x-dead-letter-routing-key`). Exibir até 100
   consumidores de `consumer_details` no detalhe, com tag e flags suportadas
   de atividade e confirmação. Indicar explicitamente quando a exibição for
   parcial por esse recorte. Exibir campos ausentes/indisponíveis como tais,
   distinguindo zero e lista vazia. Validar tipos, inteiros não negativos
   seguros e comprimento dos textos. Pedir `columns` com `name`, `vhost`,
   `type` e as quatro contagens da lista. No detalhe, acrescentar
   `durable`, `exclusive`, `auto_delete`, `state`, `arguments` e campos
   `consumer_details.consumer_tag`, `consumer_details.active` e
   `consumer_details.ack_required`. Projetar DTOs fechados no main e
   descartar os campos restantes, incluindo cabeçalhos, dados de
   canal/conexão e argumentos fora do catálogo.
5. **5A-D05 — Fronteira e limites.** Adicionar os métodos específicos
   `listSessionQueues` e `getSessionQueue` no canal `bunnies:management`
   (26 → 28) e reutilizar `cancelManagementRead`. Entradas levam sessão,
   geração e operação; lista acrescenta página e busca opcional; detalhe,
   o nome exato. Vhost, URL, credenciais, método e parâmetros restantes são
   definidos no main. Validar origem, frame, owner e DTOs, inclusive no
   retorno. Compartilhar a vaga de uma leitura administrativa em voo com
   as operações 4B.1 (até duas HTTPS com whoami). Reusar TLS e os limites
   vigentes de 10 s totais, 16 KiB de headers, 256 KiB de corpo antes de
   parsing, profundidade JSON 16 e encoding identity. Resposta acima do
   limite gera erro explícito. O limite local de bytes não limita o custo
   de preparação da resposta no broker. Sem redirecionamento ou proxy
   herdado.
6. **5A-D06 — Ciclo de vida e interface.** Leituras por ação manual, como
   carregar, pesquisar, paginar ou abrir detalhe. Cancelar ao navegar,
   fechar detalhe, perder elegibilidade, trocar geração/vhost/perfil,
   suspender, recarregar ou encerrar. Revalidar contexto e revisão antes
   do envio e do retorno. Descartar resultados tardios e limpar dados ao
   trocar contexto. No mesmo contexto, snapshot mantido após falha ou
   pausa recebe indicação de desatualizado. Mostrar origem HTTPS, data,
   ambiente, conexão e vhost, inclusive indicador de produção e rótulo
   de vhost temporário. Distinguir carregamento, vazio, filtro sem
   correspondência na página, dados parciais, cancelamento, permissão
   negada e demais erros sanitizados com ID de diagnóstico. Garantir
   teclado, foco de abertura e retorno do detalhe, ambos os temas e
   zoom 200%. Sem polling de filas, repetição automática ou cache em disco.
7. **5A-D07 — Gate anterior à UI.** Verificar o mesmo adapter previsto para
   o produto em RabbitMQ 4.4.0 e 4.3.6 fixados por digest no harness.
   Demonstrar paginação real com mais de 100 filas e página final,
   pesquisa literal com resultado e sem resultado, redução entre páginas,
   metadados e detalhe com consumidor sintético, informações opcionais,
   nomes e vhosts especiais, permissões e rota sob prefixo HTTPS.
   Cobrir filas classic, quorum e stream na leitura. Usar permissões
   distintas e alvos homônimos em vhosts distintos. Provar rejeição dos
   segmentos reservados sem requisição, isolamento entre vhosts e limites
   de corpo/cancelamento com fixture controlada. Se a combinação de
   parâmetros, permissões ou shape divergir do contrato, registrar a
   evidência e submeter uma revisão antes de integrar os dependentes.
   O histórico da paginação de vhosts da ADR-0009 motiva este gate. A
   listagem paginada de filas precisa de evidência própria.

### Critérios de aceitação

1. **5A-01.** Gate demonstra o contrato nas duas versões fixadas, com relatórios
   e limpeza dos recursos próprios.
2. **5A-02.** Lista usa somente o vhost da sessão, inclusive temporário, e
   mantém página, total e pesquisa coerentes. Filtro local anuncia seu escopo.
3. **5A-03.** Detalhe confirma a identidade exata e usa o formato restrito.
   Ausência, zero, lista vazia e dados parciais são distinguíveis.
4. **5A-04.** Nomes suportados sobrevivem à codificação; segmentos reservados,
   resposta de outro vhost, duplicatas e envelopes inválidos falham de modo
   explícito. Homônimos em outro contexto não contaminam o snapshot.
5. **5A-05.** Permissões são exercitadas com usuários isolados. Nenhuma leitura
   eleva privilégios ou cria canal, consumidor ou topologia pelo aplicativo.
6. **5A-06.** Navegação, mudança de sessão ou perda de foreground cancela
   a leitura pendente, preservando os limites de tempo, tamanho e
   concorrência. IPC e logs contêm somente o recorte de dados permitido
   e os diagnósticos sanitizados.
7. **5A-07.** Lista e detalhe funcionam por teclado, com foco visível e
   indicação de contexto e atualidade em ambos os temas a 200%.
8. **5A-08.** A 4B.2 conserva a troca de vhost com fechamento confirmado e a
   aplicação conserva as consultas 4B.1 e as proteções existentes.
9. **5A-09.** Check, package e oito smokes sequenciais, incluindo Filas,
   passam. A matriz no mesmo pacote confirma lista/detalhe, troca e
   invalidação do vhost, negativa de acesso e ausência de escritas do
   produto, com cleanup completo.
10. **5A-10.** Guia/Ajuda, evidências e estado refletem o recorte exercitado.
    A entrega passa por revisão técnica e aceite de conclusão antes de
    eventual commit.

### Estrutura e verificação

- Ampliar `src/shared/management.ts` e DTOs de fila em `src/shared/`;
  reusar o transporte/serviço em `src/main/management/`, com projeção/validação
  de filas no mesmo diretório. Ajustar a autorização específica em
  `src/main/sessions/sessionService.ts` e ligar comandos nomeados em
  `src/main/ipc/management.ts` e `src/preload/`. Preservar a autoridade
  das operações de vhost e versão.
- Integrar o destino Filas em `src/renderer/shell/` e a tela em
  `src/renderer/pages/Queues.tsx`, reaproveitando contexto, componentes e tokens.
  Usar a fonte canônica em `docs/10-user-guide/guide.json` para Guia/Ajuda e
  gerar seu Markdown. Criar documentação M03 e evidências 5A em
  `docs/04-modules/` e `docs/07-testing/`.
- Estender `tools/testing/rabbitmq-real.cjs` com gate específico, fixture e
  matriz no pacote. Somente o harness pode provisionar filas, dados e
  consumidores efêmeros em seus brokers isolados. Verificar o código de
  produção com teste de transporte/TLS e lifecycle, fronteira IPC/preload
  e componentes. Executar check, package e os smokes base, perfis, HTTPS,
  AMQPS, sessão, Management, transição de vhost
  (`node tools/testing/management.cjs --vhost-transition`) e Filas.
  Conferir ASAR, acessibilidade visual/foco e documentação. Registrar
  plataforma real, limitações e resultados por execução.

### Fronteira da proposta

O produto desta subetapa faz apenas leituras. Criação, exclusão e purge ficam
para 5B/5C. Bindings ficam na Etapa 6. Inspeção ou consumo de mensagens,
polling de métricas, outras operações administrativas, alterações de
dependência, patch, ADR, schema, release, commit e push ficam fora deste
aceite. A preparação desta proposta é documental.

A consulta de referência descreve paginação de filas e filtro literal,
detalhe por nome e permissões por vhost. A leitura dos handlers upstream
orienta as hipóteses de envelope e projeção. O comportamento do adapter
com as duas imagens e os limites propostos ainda precisa ser medido.
[Referência HTTP de filas](https://www.rabbitmq.com/docs/http-api-reference#get-apiqueuesvhost),
[paginação](https://www.rabbitmq.com/docs/http-api-reference#pagination-parameters),
[permissões](https://www.rabbitmq.com/docs/management#access-and-permissions),
[handler da listagem em 4.4.0](https://github.com/rabbitmq/rabbitmq-server/blob/v4.4.0/deps/rabbitmq_management/src/rabbit_mgmt_wm_queues.erl),
[handler do detalhe em 4.3.6](https://github.com/rabbitmq/rabbitmq-server/blob/v4.3.6/deps/rabbitmq_management/src/rabbit_mgmt_wm_queue.erl).

### Gate 5A reprovado e revisão proposta

Em ambas as versões, 12 verificações passaram e uma falhou. A listagem
para o vhost chamado exatamente `detailed` resolve para a rota global
de filas do RabbitMQ, inclusive com uma letra percent-encoded. O adapter
rejeitou as linhas de outros vhosts. [Evidências](../07-testing/queues-5a.md).

**Revisão aprovada por “Aprovo” em 2026-11-19.** Acrescentar a 5A-D02/D03
e 5A-04 a indisponibilidade da listagem para o vhost de nome exato
`detailed`. Recusar no main antes da requisição e explicar o motivo na
tela Filas. A sessão e a seleção do vhost seguem o contrato 4B.2.
Manter detalhe por linha no fluxo da listagem e o escopo de um vhost
por consulta. O gate revisado deve provar zero requisições para essa
listagem e repetir os demais casos nas duas versões. Após aprovação
da revisão, retomar a integração somente com o gate revisado aprovado.

O gate revisado passou 14 verificações em cada versão. A integração de
IPC/UI e Guia/Ajuda foi empacotada em macOS arm64. Check, oito smokes e
70 verificações reais no pacote passaram. As capturas nos dois temas
a 200% foram revisadas. Ver [evidências](../07-testing/queues-5a.md).

Em 2026-11-19, “Aprovo a conclusao da 5A” aceitou a entrega verificada.
A resposta “Autorizado, pode prosseguir” aprovou em seguida o commit
`feat(queues): add scoped queue reads`.

## Contrato proposto — 5B: declaração de filas classic e quorum

Proposto em 2026-11-19. Status: **execução aprovada por “Autorizo” em
2026-11-20**, condicionando a integração ao gate.
“Continue” iniciou a preparação. Base: `main` em `cd1c2bf`, entrega 5A.

| Campo | Proposta para aprovação |
| --- | --- |
| Objetivo | Criar filas classic/quorum no vhost ativo e explicar aceites, recusas, divergências e resultados incertos |
| Escopo | Formulário em Filas, um PUT pontual via HTTPS Management e uma leitura pontual para conferir propriedades após o aceite HTTP |
| Dependências | 5A, contexto de sessão 4B.2, transporte aprovado na ADR-0002, TLS e credenciais do perfil ativo; versões e dependências já instaladas |
| Módulos | M03, com autorização de sessão M01 e transporte administrativo M06 |
| Riscos | Permissão por recurso, parâmetros imutáveis, equivalência de tipo relaxada, policies, efeito após perda da resposta e troca de contexto |
| Verificação | Gate pré-UI em RabbitMQ 4.4.0 e 4.3.6 fixados por digest, testes de ciclo de vida e fronteira, package, smokes e matriz no pacote |
| Aceitação | 5B-01–09 abaixo, FR-009, FR-025–030, MVP-Q02 e NFR-006–009/012–017 aplicáveis |
| Branch | `main` existente em `cd1c2bf` na retomada |
| Resultado | Declaração explícita com destino visível, confirmação verificável e ação de consulta em caso de incerteza |
| Documentação | M03, arquitetura, segurança, NFRs, evidências, guia canônico, Ajuda e estado atual acompanham o comportamento entregue |

### Decisões propostas

1. **5B-D01 — Autoridade e destino.** Usar o contexto da 5A: janela em
   foreground, sessão desejada, HTTPS disponível e AMQPS estabelecido no vhost
   atual, inclusive com fluxo bloqueado enquanto conectado. O main resolve
   owner, sessão, geração, perfil, revisão, vhost exato, credenciais e prefixo
   HTTPS. Troca de vhost, recuperação AMQPS e encerramento tornam a operação
   indisponível. A escrita acontece no endpoint HTTPS do perfil. A sessão
   AMQPS fixa o contexto e os dois endpoints podem apontar para brokers
   diferentes. A resposta do endpoint decide a autorização da operação.
   Lista de vhosts, tag e versão declarada, por si sós, não comprovam
   permissão ou capacidade de recurso. A matriz de referência é 4.4.0/4.3.6.
2. **5B-D02 — Rota e formato fechados.** Fazer um
   `PUT /api/queues/{vhost}/{name}` com `application/json`. Codificar os dois
   segmentos uma vez. Nome e vhost não vazios, até 255 bytes UTF-8, sem C0/DEL
   ou Unicode inválido. Preservar barra, espaços, caixa, Unicode e percentuais
   literais. Recusar segmentos exatos `.` e `..`, e nomes de fila iniciados
   por `amq.`. O main monta `durable: true`, `exclusive: false`,
   `auto_delete: false` e `arguments` com o tipo explícito e o catálogo abaixo.
   A entrada IPC admite referência de sessão, operação, nome, tipo e esses
   argumentos tipados. Flags, destino, método, cabeçalhos, parâmetros livres e
   seleção de nó ficam fora da entrada. A rota de item em `detailed` entra no
   gate próprio. A guarda da listagem 5A continua ativa nesse vhost.
3. **5B-D03 — Catálogo candidato, sujeito ao gate real.** Aceitar `classic`
   ou `quorum`. Os campos opcionais `x-message-ttl` em ms e `x-max-length`
   em mensagens aceitam inteiros de 0 a 2.147.483.647 como limite da UI e
   do main, com ausência distinta de zero. A UI aceita somente dígitos
   decimais nos campos numéricos e mostra unidade e efeito. Para
   `x-dead-letter-exchange` e `x-dead-letter-routing-key`, aceitar texto
   exato de até 255 bytes UTF-8, com as validações de caracteres da 5B-D02,
   sem aplicar as restrições de segmento a textos do corpo. A UI distingue
   argumento ausente de texto vazio explícito. Exchange vazia representa a
   exchange padrão. Routing key explícita exige DLX explícita nesta
   declaração. Quando DLX estiver presente, explicar a exigência de leitura
   na fila e escrita na exchange, além da permissão de configuração na fila.
   A operação referencia a exchange no mesmo vhost. Policies podem influir
   nos limites efetivos, e o formulário mostra o que será declarado.
4. **5B-D04 — Equivalência e confirmação.** Executar diretamente o PUT,
   com a equivalência aferida pelo broker. Após uma resposta de aceite
   comprovada pelo gate, fazer no máximo um GET de item no mesmo endpoint,
   com projeção de nome, vhost, tipo, flags e argumentos. Validar identidade,
   tipo real, flags e igualdade dos argumentos do catálogo, inclusive presença
   ou ausência. Se `x-queue-type` estiver presente nos argumentos, deve
   coincidir com o campo de tipo. Argumentos externos ao catálogo não são
   enviados ao renderer. Confirmar somente a declaração e os metadados
   observados naquele horário. Uma fila equivalente preexistente pode
   receber o mesmo aceite. Se o broker aceitar a escrita e o GET mostrar
   propriedades divergentes, apresentar a divergência. Se o GET falhar,
   mostrar “Declaração aceita, conferência indisponível”. O produto não
   resolve conflitos com sobreposição, exclusão, alteração de policy ou
   nova declaração automática. O mesmo GET de item serve à verificação
   mesmo quando a listagem estiver indisponível.
5. **5B-D05 — Erros, cancelamento e concorrência.** Distinguir falha ou
   cancelamento com envio comprovadamente ausente, negativa explícita do
   broker, conflito de propriedades, aceite conferido, aceite com
   conferência incompleta e resultado incerto após possível envio.
   Reconhecer status/envelopes de recusa somente conforme evidência das
   duas versões. Erros ambíguos, incluindo perda de resposta, prazo e
   cancelamento após possível envio e antes de aceite válido, ficam como
   resultado incerto. Cancelar interrompe a espera e libera recursos
   locais. Exibir diagnóstico sanitizado e permitir verificação manual
   de leitura antes de uma nova ação explícita de escrita. Uma operação
   administrativa em voo, compartilhada com as leituras 4B.1/5A, com
   `whoami` independente. A vaga permanece ocupada até concluir o
   cancelamento local. Prazo total de 30 s, incluindo validações
   assíncronas e verificação. A leitura pós-aceite tem, além disso, limite
   de 10 s dentro do saldo total. Limites propostos de 2 KiB no corpo da
   declaração, 256 KiB na resposta, 16 KiB nos headers e profundidade JSON
   16 para respostas, com encoding identity. Reusar TLS, CA, verificação do
   hostname e bloqueio de redirect/proxy herdado.
6. **5B-D06 — IPC, ciclo de vida e interface.** Propor
   `declareSessionQueue` e `cancelQueueDeclaration` em
   `bunnies:management` (28 → 30 métodos). Validar origem, frame, owner,
   entradas e respostas. Cancelamento verifica sessão, geração e ID da
   operação e afeta somente a declaração correspondente. Revalidar
   autoridade, contexto e revisão antes do PUT, antes do GET e antes de
   publicar o resultado. Perda de elegibilidade, suspensão, reload e
   encerramento interrompem o fluxo local. Resultados do contexto antigo
   não atualizam o novo. Em Filas, abrir **Nova fila**, preencher nome,
   tipo e opções e confirmar **Declarar fila** com perfil, ambiente,
   vhost, operação e argumentos visíveis. Identificar produção com texto
   e símbolo. Bloquear submissões concorrentes e mostrar progresso.
   Quando houver envio possível, avisar que parar de aguardar não desfaz
   a escrita. Oferecer **Verificar fila** por consulta existente de item
   quando o alvo ainda estiver no contexto. Marcar a lista desatualizada
   após possível escrita e atualizar por ação explícita. Validar teclado,
   retorno de foco, temas claro/escuro e zoom de 200%. Rascunho e resultado
   transitórios, sem persistência.
7. **5B-D07 — Gate inicial e verificação multiplataforma.** Provar o
   mesmo adapter de produto nas imagens fixadas nas versões 4.4.0/4.3.6,
   com TLS, prefixo, vhosts sintéticos, usuários mínimos e observador do
   harness. O observador confere os objetos antes/depois. Fixtures HTTPS
   permitem medir requisições, atrasos e cortes antes/depois do envio.
   Integrar IPC/UI e documentar a função como disponível após passar o
   gate. Divergência que exija mudar semântica/escopo exige decisão antes
   dos dependentes. Executar check, package, oito smokes existentes em
   sequência, incluindo Filas, e smoke de declaração no pacote. Repetir
   matriz real no mesmo executável. Registrar plataforma, arquitetura e
   hash por execução. A CI atual configura jobs de package em Ubuntu,
   Windows Server e macOS, com smoke base automatizado em macOS. Testes
   nativos em Windows 11 x64, Ubuntu 24.04 x64 e demais alvos da ADR-0005
   exigem executores disponíveis e evidência por alvo. Um build por si só
   não verifica uso do aplicativo.

### Critérios de aceitação

1. **5B-01.** O gate cria classic e quorum com as flags fixas nas duas versões,
   confirma tipo e argumentos projetados e cobre ausência, zero, limites
   aprovados, DLX nomeada/padrão, routing key vazia e vínculo DLX–routing key.
   Resultados e limpeza registrados por versão.
2. **5B-02.** O destino usa somente o vhost vigente, inclusive temporário.
   Casos com `/`, espaços, Unicode, percentuais e vhost `detailed` demonstram
   a rota exata. Nomes reservados, controles, tamanho inválido e DTO com
   campos extras não geram chamada. Homônimos em outro vhost são preservados.
3. **5B-03.** O broker deixa intacta uma fila equivalente e rejeita
   incompatibilidades de flags/tipo/argumentos com equivalência estrita.
   A conferência detecta tipo divergente se houver aceite com equivalência
   relaxada. A interface não afirma que criou um recurso preexistente.
4. **5B-04.** Gate usa conta Management sem configuração do recurso, conta
   mínima apta a declarar e negativas específicas de DLX. Testes demonstram
   que o produto não eleva privilégios, não cria canais AMQP do cliente e
   não altera filas alheias, exchanges, bindings ou mensagens.
5. **5B-05.** Fixture com contagem de PUTs prova zero envio para cancelamento
   anterior à transmissão, um envio para queda posterior, nenhum replay
   após reconectar e nenhuma atualização de um contexto antigo. Cobrir
   aceite seguido de queda na conferência, orçamento de tempo, TLS, corpo
   excedido, redirect e concorrência com leitura.
6. **5B-06.** IPC/preload rejeitam frame, operação ou geração divergentes e
   projetam somente valores do contrato e diagnóstico local. Segredos,
   detalhes brutos do broker e argumentos extras não cruzam a ponte.
7. **5B-07.** Formulário e resultado funcionam por teclado com foco visível,
   contexto de produção identificado e ambos os temas a 200%. Após
   resultado incerto, verificar abre só leitura do alvo autorizado.
8. **5B-08.** Check, package, smokes aplicáveis e matriz real no pacote passam,
   com regressão de listagem, detalhes e troca de vhost confirmada. Os
   testes em broker usam somente recursos isolados do harness. Evidências
   distinguem validação de macOS, builds em CI e smokes nativos por SO.
9. **5B-09.** Guia e Ajuda continuam com a mesma fonte. M03, requisitos,
   segurança, arquitetura, evidências e histórico registram o recorte
   verificado. Conclusão e commit passam por aceite próprio.

### Estrutura e referências

- Contratos fechados em `src/shared/management.ts` e `src/shared/queues.ts`.
  Guardas de sessão em `src/main/sessions/sessionService.ts`, coordenação e
  transporte em `src/main/management/`, com o adapter de declaração no
  mesmo diretório. Reusar o transporte TLS limitado, com rotas definidas no
  main. Ligar operações específicas em `src/main/ipc/management.ts` e
  `src/preload/desktopApi.ts`.
- Acrescentar o formulário em `src/renderer/pages/Queues.tsx` e componente
  de formulário no mesmo diretório. Atualizar `docs/10-user-guide/guide.json`
  e gerar o Markdown. Registrar evidências em `docs/07-testing/queues-5b.md`
  durante a execução. Acrescentar cenários ao harness
  `tools/testing/rabbitmq-real.cjs` e aos smokes locais.
- O HTTP de declaração encaminha a operação à lógica de declaração do
  broker nas versões de referência. Status HTTP, conflito, permissões e
  equivalência permanecem hipóteses de comportamento até o gate. A
  criação de exchange, edição de policy, declaração stream, exclusão e
  purge não compõem a 5B. Manter dependências, patch, ADRs e schema local.

[PUT na Management API](https://www.rabbitmq.com/docs/http-api-reference#put-apiqueuesvhostname),
[propriedades e equivalência](https://www.rabbitmq.com/docs/queues#declaration-and-property-equivalence),
[comparação classic/quorum](https://www.rabbitmq.com/docs/quorum-queues#feature-matrix),
[TTL](https://www.rabbitmq.com/docs/ttl#per-queue-message-ttl-in-queues),
[limites de comprimento](https://www.rabbitmq.com/docs/maxlength),
[DLX e permissões](https://www.rabbitmq.com/docs/dlx#how-dead-lettering-is-configured),
[handler 4.4.0](https://github.com/rabbitmq/rabbitmq-server/blob/v4.4.0/deps/rabbitmq_management/src/rabbit_mgmt_wm_queue.erl#L61-L71)
e [handler 4.3.6](https://github.com/rabbitmq/rabbitmq-server/blob/v4.3.6/deps/rabbitmq_management/src/rabbit_mgmt_wm_queue.erl#L61-L71).

O gate final passou dez verificações por versão. Check, package, nove
smokes e 76 verificações no executável passaram em macOS arm64. As
capturas nos dois temas a 200% foram revisadas.
Ver [evidências da 5B](../07-testing/queues-5b.md).

“Aprovado” aceitou a conclusão da 5B e autorizou o commit local
`feat(queues): add verified queue declarations`. O pedido posterior
“Continue” iniciou a preparação da 5C.

## Contrato proposto — 5C.1: purge com confirmação nativa

Proposto em 2026-11-20. Execução aprovada por “Aprovo” em 2026-11-20,
com integração condicionada ao gate.
Base da preparação em `main`, commit `dd52421`.

| Campo | Proposta para aprovação |
| --- | --- |
| Objetivo | Limpar mensagens de uma fila classic ou quorum no vhost da sessão, com efeito e destino explícitos |
| Escopo | Consulta pontual, confirmação nativa no main e uma única solicitação de purge via Management HTTPS |
| Aceitação | 5C.1-01–08 abaixo, FR-011/025 e NFR-009/010. MVP-Q03 fica parcial até a entrega de FR-010 |
| Dependências | Sessão 4B.2, leitura exata 5A, transporte HTTPS 5B e imagens oficiais já fixadas por digest |
| Verificação | Gate antes da integração em RabbitMQ 4.4.0 e 4.3.6, seguido de check, package, smokes e matriz no executável |

### Exclusão condicional pendente

A API de item encaminha `if-empty` e `if-unused` ao broker.
Nas duas versões fixadas, quorum rejeita ambas as condições e stream
as ignora. A implementação classic separa mensagens prontas de
entregas pendentes de confirmação. Uma leitura do tipo seguida de DELETE
pode alcançar outro objeto recriado com o mesmo nome. Ela também pode
observar estado diferente daquele no momento da exclusão.
[HTTP DELETE de fila](https://www.rabbitmq.com/docs/http-api-reference#delete-apiqueuesvhostname),
[quorum 4.4.0](https://github.com/rabbitmq/rabbitmq-server/blob/v4.4.0/deps/rabbit/src/rabbit_quorum_queue.erl#L1049-L1057),
[quorum 4.3.6](https://github.com/rabbitmq/rabbitmq-server/blob/v4.3.6/deps/rabbit/src/rabbit_quorum_queue.erl#L1027-L1035),
[stream 4.4.0](https://github.com/rabbitmq/rabbitmq-server/blob/v4.4.0/deps/rabbit/src/rabbit_stream_queue.erl#L253-L271),
[stream 4.3.6](https://github.com/rabbitmq/rabbitmq-server/blob/v4.3.6/deps/rabbit/src/rabbit_stream_queue.erl#L229-L247),
[condições classic](https://github.com/rabbitmq/rabbitmq-server/blob/v4.4.0/deps/rabbit/src/rabbit_amqqueue_process.erl#L1395-L1405),
[contagem classic](https://github.com/rabbitmq/rabbitmq-server/blob/v4.4.0/deps/rabbit/src/rabbit_variable_queue.erl#L620-L626).

FR-010 e o restante de MVP-Q03 dependem de um contrato próprio com garantia
verificável no broker de que o alvo vigente respeita as condições pedidas.
Excluir sem condições ou simular condições com métricas precedendo o
DELETE fica fora desta proposta. A constatação acima vem de documentação
e código publicado. A preparação ainda não executou o gate real.

### Decisões propostas

1. **5C.1-D01 — Alvo.** A ação começa no detalhe exato de Filas da 5A,
   incluindo o vhost temporário e o vhost `detailed` mesmo com a listagem
   indisponível. O main deriva perfil, ambiente, endpoint HTTPS, revisão,
   owner, sessão, geração e vhost. Exigir janela ativa, HTTPS disponível
   e AMQPS estabelecido no vhost atual, conforme 5A/5B. O endpoint HTTPS
   é o destino real do purge. A sessão AMQPS fornece contexto.
   Um GET de item limitado valida identidade e tipo classic/quorum antes
   do diálogo. Ausência, falha ou outro tipo impedem a ação.
2. **5C.1-D02 — Confirmação.** Usar `dialog.showMessageBox` assíncrono
   associado à janela, com `AbortSignal`, prazo de 60 s, **Cancelar**
   como padrão e Esc, e **Limpar mensagens** como aceite explícito.
   O main monta o texto com perfil, ambiente, origem e prefixo HTTPS
   sem segredo, vhost, nome completo da fila e efeito irreversível.
   Identificar produção por texto e símbolo. Exibir nomes exatos de
   forma legível, tornando caracteres de formatação invisíveis visíveis.
   O diálogo explicita que a operação encontra a fila pelo nome na hora
   da execução. A Management API não oferece condição de identidade
   da instância e o nome pode ter sido recriado externamente.
3. **5C.1-D03 — Efeito real.** Remover mensagens prontas e preservar
   entregas a consumidores ainda sem ack. Nas duas versões de referência,
   em quorum o purge pode remover também mensagens em nova tentativa
   adiada e pendentes de dead-lettering. O diálogo e a Ajuda explicitam o
   efeito em quorum mesmo quando a consulta observou classic, pois o
   tipo pode mudar após a leitura. A fila permanece. Novas publicações
   e reentregas podem ocorrer em paralelo. O resultado mostra o aceite
   do broker, sem atribuir um total removido ou garantir fila vazia.
   [Purge na API](https://www.rabbitmq.com/docs/http-api-reference#delete-apiqueuesvhostnamecontents),
   [purge quorum 4.4.0](https://github.com/rabbitmq/rabbitmq-server/blob/v4.4.0/deps/rabbit/src/rabbit_fifo.erl#L502-L532),
   [purge quorum 4.3.6](https://github.com/rabbitmq/rabbitmq-server/blob/v4.3.6/deps/rabbit/src/rabbit_fifo.erl#L480-L498).
4. **5C.1-D04 — Envio e ciclo de vida.** Reservar a vaga administrativa
   única desde o GET até o fim do fluxo, compartilhada com leituras e
   declaração. Manter `whoami` independente. Vincular a confirmação ao
   pedido em memória, sem aprovação reutilizável. Revalidar origem,
   frame, janela ativa, contexto de sessão e revisão após o diálogo,
   imediatamente antes do envio sobre TLS validado, e ao entregar o
   resultado. Suspensão, mudança de contexto, reload, perda do renderer
   ou encerramento invalidam a ação. A mudança de foco própria do
   modal exige verificação com janela nativa. Sem comprovar retorno ao
   foreground, encerrar o pedido local antes de enviar.
5. **5C.1-D05 — Transporte e resultado.** Usar apenas
   `DELETE /api/queues/{vhost}/{name}/contents` sem corpo ou query,
   codificando os segmentos uma vez com as mesmas guardas da 5A.
   Reusar TLS, CA, prefixo e bloqueio de redirects/proxy da 5B. Limitar a
   leitura inicial a 10 s e o envio/resposta a 30 s, com 256 KiB de
   resposta, 16 KiB de headers, encoding identity e profundidade JSON
   16 caso seja preciso interpretar uma negativa. Aceitar somente
   respostas comprovadas pelo gate. Distinguir desistência antes do
   envio, recusa explícita (incluindo falta de permissão ou alvo que
   deixou de existir), aceite HTTP e resultado incerto após possível
   envio. Timeout, queda, 5xx ambíguo e cancelamento nessa última
   situação preservam a incerteza, sem repetição automática. Após
   possível envio, **Verificar fila** faz a leitura atual da 5A. Essa
   leitura não confirma retrospectivamente o purge.
6. **5C.1-D06 — IPC e interface.** Acrescentar `purgeSessionQueue` e
   `cancelQueuePurge` a `bunnies:management` (30 → 32 métodos).
   O pedido leva referência de sessão, geração, ID da operação e nome.
   O cancelamento só alcança a operação correspondente. Método e rota
   são definidos no main. Em Filas, mostrar progresso, restaurar foco
   após o diálogo e marcar lista/detalhe desatualizados após possível
   envio. Depois do envio, o rótulo **Parar de aguardar** explica que
   a ação local não desfaz o que o broker fez. Um resultado do contexto
   anterior não modifica a nova tela. Entradas e respostas têm projeção
   fechada, sem persistência de dados do fluxo.
7. **5C.1-D07 — Sequência de verificação.** Provar o adapter de produto
   nas duas imagens de referência. Usar somente brokers criados pelo
   harness, com vhosts, filas e contas descartáveis. O observador do
   harness prepara publicações, entregas sem ack, novas tentativas
   adiadas e dead-lettering pendente e verifica os estados antes/depois.
   Fixtures HTTPS exercitam atrasos e cortes. Divergência de semântica
   exige decisão antes da integração dependente. Após o gate, integrar
   IPC/UI/Guia e Ajuda, executar check, package, os nove smokes existentes
   em sequência, smoke nativo de purge e matriz no mesmo ASAR. Registrar
   a plataforma e a arquitetura por execução.

### Critérios de aceitação

1. **5C.1-01.** Em classic/quorum nas duas versões, Ready é removido e
   entregas sem ack são preservadas. A fila e seus vínculos permanecem.
   Verificar fila vazia e os efeitos de nova tentativa adiada e dead-lettering
   pendente em quorum. O diálogo deve descrever o efeito verificado.
2. **5C.1-02.** Provar o destino exato com vhosts temporário e `detailed`,
   barra, Unicode, espaços e percentual literal, preservando homônimos
   em outro vhost. Stream e tipo desconhecido falham antes do envio
   quando observados no GET. A matriz verifica a resposta a um stream
   que substitui o alvo durante o fluxo.
3. **5C.1-03.** Conta Management sem permissão de leitura no recurso recebe
   recusa. Conta mínima autorizada executa o purge. Também cobrir fila
   removida durante o diálogo, rejeição TLS e redirect. Diferenciar
   negativa e resultado incerto com códigos sanitizados.
4. **5C.1-04.** Cancelar, pressionar Esc, esgotar o prazo do modal ou
   invalidar sessão, perfil ou janela antes do envio produz zero
   DELETEs. O aceite explícito permite no máximo um DELETE, com
   bloqueio de diálogo e operação concorrentes. Verificar a perda de
   foco e o retorno à janela proprietária.
5. **5C.1-05.** Queda ou cancelamento após possível envio sem resposta
   conclusiva mostra incerteza. Reconectar, recarregar ou trocar vhost
   não repete purge. Verificar usa somente o GET de item existente.
6. **5C.1-06.** Origem, frame, owner, geração e ID inválidos são recusados.
   O main verifica o contexto real mesmo diante de argumentos IPC
   adulterados. Segredos, payloads, resposta bruta e acesso genérico
   ao transporte ficam fora da ponte.
7. **5C.1-07.** Revisar diálogo, teclado, foco e identificação de Produção,
   com Filas em ambos os temas e a 200%. Package e smokes locais registram
   o alvo executado. Registrar testes nativos de Windows e Linux quando
   houver executores adequados. Os jobs de package da CI não comprovam os
   diálogos nativos.
8. **5C.1-08.** Atualizar M03, FR-011, segurança, evidências, histórico
   e Guia/Ajuda a partir do comportamento verificado; FR-010 segue
   pendente. Conclusão e commit passam por aprovação própria.

### Estrutura e fontes

- Contratos e guardas em `src/shared`, adapter e coordenação em
  `src/main/management`, handler e confirmação em
  `src/main/ipc/management.ts`, métodos explícitos em
  `src/preload/desktopApi.ts` e ação no detalhe em Filas.
- Reusar `tools/testing/rabbitmq-real.cjs` e o smoke de Management.
  Registrar resultados em `docs/07-testing/queues-5c1.md` durante a
  execução. Atualizar `docs/10-user-guide/guide.json` e gerar o Markdown
  após o gate e a integração.
- Fora do escopo: exclusão de fila, operações em lote, inspeção,
  publicação ou consumo pelo produto, novas dependências, mudanças
  de versão do broker de referência, patch, ADR, schema, commit ou
  push antes dos aceites correspondentes.
- [Requisitos funcionais](../02-requirements/functional-requirements.md),
  [MVP](../02-requirements/mvp-scope.md),
  [NFRs](../02-requirements/non-functional-requirements.md),
  [segurança](../08-security/security-model.md),
  [estratégia de testes](../07-testing/test-strategy.md) e
  [diálogo no Electron 45.1.0](https://github.com/electron/electron/blob/v45.1.0/docs/api/dialog.md#dialogshowmessageboxwindow-options).

### Conclusão da 5C.1 aprovada

“Aprovado” reiterou o aceite do fluxo apresentado. Check 299 + seis
Node, dez smokes, gate de 20 e matriz de 72 verificações em 4.4.0
e 4.3.6 passaram. Capturas a 200% e do diálogo nativo conferidas.
Registro local `feat(queues): add confirmed message purge`.
FR-010 e homologação nativa nos demais alvos continuam pendentes.
[Evidências](../07-testing/queues-5c1.md)

## Contrato proposto — 6A: leitura de exchanges e bindings

Proposto em 2026-11-20. Execução aprovada por “Aprovo” em 2026-11-20.
Base observada em `main`, commit `013c899`, com a 5C.1 concluída.
A integração fica condicionada ao gate.

| Campo | Proposta para aprovação |
| --- | --- |
| Identificador e nome | 6A — Leitura de exchanges e bindings |
| Objetivo | Consultar exchanges no vhost ativo, identificar a exchange padrão e recursos reservados e inspecionar bindings de entrada e saída |
| Justificativa | Entregar a leitura do M04 e verificar escopo, permissões e identidade dos bindings nas versões fixadas antes de propor operações de escrita |
| Escopo | Lista paginada e busca literal, detalhe de propriedades e consulta por direção no detalhe. Somente GET via Management HTTPS |
| Tarefas | Implementar o adapter e provar o contrato na matriz real. Depois integrar IPC, interface e Guia/Ajuda e verificar o executável |
| Módulos afetados | M04, com reuso da sessão M01, do transporte administrativo e da Ajuda M08 |
| Arquivos previstos | Estrutura, testes e documentação listados abaixo |
| Dependências | 4B.2 e 5C.1 registradas, contexto de sessão e TLS existentes, harness e imagens oficiais 4.4.0/4.3.6 fixadas por digest |
| Branch | `main` existente, com base `013c899` |
| Riscos | Escopo incorreto ao codificar nomes, confusão entre nome vazio e alias HTTP, divergências de paginação e permissão, listas de bindings grandes, resposta tardia e alteração externa entre consultas |
| Critérios de aceitação | 6A-01–08, FR-012 e parte de leitura de FR-014/MVP-E01, com NFR-012–018 aplicáveis |
| Verificação | Gate real do adapter antes da integração, testes direcionados, check, package, smokes em sequência e matriz real no mesmo pacote |
| Resultado esperado | Tela Exchanges compartilhada pelos três SOs, com leitura sob demanda, origem e horário por consulta e diagnóstico preciso de resultados vazios, indisponíveis e limitados |
| Impacto documental | Registrar evidências por SO e atualizar M04, requisitos e Guia/Ajuda conforme o comportamento verificado |

O restante de MVP-E01 fica para contratos próprios de declaração e exclusão de
exchanges (FR-013), criação e remoção de bindings (FR-014). A etapa de publicação
continua no roadmap. A exclusão condicional de filas (FR-010) conserva sua
pendência de garantia no broker e segue independente da leitura da 6A.

### Decisões propostas

1. **6A-D01 — Autoridade e ciclo de vida.** Derivar perfil, endpoint, CA,
   revisão e vhost exato no main, incluindo o vhost temporário. Exigir sessão
   desejada, janela em foreground, HTTPS disponível e AMQPS estabelecido no
   contexto ativo. Bloqueio de fluxo AMQPS com conexão aberta segue elegível.
   O HTTPS decide visibilidade e permissão no endpoint configurado. Compartilhar
   a vaga administrativa existente com versão, vhosts e filas. `whoami`
   continua independente. Até 10 s desde a aceitação. Cancelar e descartar
   respostas obsoletas por janela, sessão, geração, operação, revisão ou ciclo
   de vida. Atualização manual, sem polling próprio, retry automático, canais
   AMQP, persistência ou ampliação de permissões.
2. **6A-D02 — Listagem.** Usar `GET /api/exchanges/{vhost}` com
   `disable_stats=true`, `pagination=true`, `page_size=100`, `sort=name`,
   `use_regex=false` e colunas `vhost,name,type,durable,auto_delete,internal`.
   Solicitar página positiva de até 2.147.483.647 e, se informado, trecho
   literal `name` de até 255 bytes UTF-8. Aplicar busca explicitamente e
   voltar à página 1. Validar envelope e contagens, unicidade de nomes e
   vhost de cada item. Usar as contagens do broker, com retorno à primeira
   página por ação explícita se a página ficar fora da faixa. Divergência
   de contrato gera diagnóstico, sem fallback global ou sem paginação.
3. **6A-D03 — Detalhe e nomes especiais.** Usar
   `GET /api/exchanges/{vhost}/{name}` com `disable_stats=true` e
   acrescentar apenas a coluna `arguments` ao conjunto de D02. Validar
   nome e vhost do retorno. O nome canônico vazio identifica a exchange
   padrão. Usar `amq.default` somente como alias HTTP para essa identidade,
   conferir retorno com nome vazio e recusar um nome literal `amq.default`
   em consulta exata, por ambiguidade. Identificar recursos `amq.*`
   como reservados e indicar o flag `internal` separadamente. Mostrar
   tipos informados pelo broker, inclusive tipos de plugins, sem inferir
   capacidade de escrita. Codificar cada segmento uma vez e recusar
   segmentos exatos `.` e `..` antes do I/O. A colisão `detailed` da
   rota de filas não se aplica ao dispatcher de exchanges das versões
   fixadas. Comprovar o escopo também nesse vhost no gate.
4. **6A-D04 — Bindings por direção.** Após abrir o detalhe, consultar
   por ação explícita `GET /api/exchanges/{vhost}/{name}/bindings/source`
   para saída ou `GET /api/exchanges/{vhost}/{name}/bindings/destination`
   para entrada. Cada ação usa uma request, com projeção de
   `vhost,source,destination,destination_type,routing_key,arguments,properties_key`.
   Aceitar lista da direção pedida com até 200 itens, respeitado o limite
   de corpo. Acima do limite, sinalizar indisponibilidade sem truncar nem
   simular paginação. Conferir vhost, lado da exchange consultada e tipo
   de destino (`queue` ou `exchange`). Aceitar routing key vazia ou de
   até 255 bytes UTF-8. Preservar `properties_key` como identidade opaca
   de até 1 KiB, combinada com origem, tipo e destino para identificar a
   linha. Nunca derivar identidade de routing key ou argumentos. Identidade
   composta duplicada gera erro explícito. Exibir o resultado como
   bindings retornados na consulta, sem inferir existência atual da
   exchange a partir de uma lista vazia. Na exchange padrão, explicar no
   detalhe os vínculos implícitos de cada fila com seu próprio nome
   como routing key. Recusar a consulta de bindings da exchange padrão
   antes do I/O para evitar enumerar filas por essa rota.
5. **6A-D05 — Limites e apresentação dos dados.** Reutilizar HTTPS do
   main com TLS, autenticação e prefixo do perfil, até 16 KiB de headers,
   256 KiB de resposta `identity` e profundidade JSON 16. Recusar
   redirects e respostas com estrutura, tipos ou identidades inválidos.
   Enviar somente DTOs projetados pela ponte. Manter credenciais do perfil
   e respostas brutas no main e excluir seus valores e os argumentos de
   topologia dos logs. Mostrar os argumentos informados como JSON de
   leitura, em texto escapado, sem atribuir
   tipos AMQP ao JSON. Quando um valor numérico não for finito ou um
   inteiro exceder a precisão segura, indicar os argumentos do item
   como indisponíveis, sem exibir números arredondados. Preservar a
   distinção entre argumento ausente, objeto vazio e valor indisponível.
6. **6A-D06 — Ponte e tela.** Passar de 32 para 35 métodos explícitos com
   `listSessionExchanges`, `getSessionExchange` e `listSessionExchangeBindings`
   no canal administrativo existente. Reutilizar `cancelManagementRead`.
   O renderer envia IDs de contexto/operação e, conforme a ação, página,
   busca, nome ou direção de enum fechado. Sem URL, método, colunas,
   headers ou vhost arbitrário na ponte. Habilitar Exchanges no shell
   com estados de sessão, lista, detalhe e direção. Mostrar vhost, origem
   Management HTTPS, horário e identificação de Produção pelo padrão do
   shell. Preservar foco ao voltar, ignorar respostas de outra seleção e
   distinguir carregamento, vazio, erro, limite e dados indisponíveis.
   Usar o mesmo fluxo em Windows, Linux e macOS.
7. **6A-D07 — Sequência de verificação.** Provar primeiro o adapter de
   produto em RabbitMQ oficial 4.4.0/4.3.6 com TLS e fixtures efêmeras.
   Se houver divergência que mude escopo ou semântica, apresentar o
   resultado para decisão antes de integrar IPC/UI. Depois executar
   testes direcionados, `npm run check`, `npm run package`, smokes
   sequenciais e matriz das duas versões com o mesmo pacote. Em cada
   SO/CPU com sessão gráfica e runner disponíveis, registrar package e
   smoke do fluxo, com teclado, foco e zoom. Distinguir empacotamento de
   execução nativa. Windows e Linux seguem pendentes até execução
   comprovada. Sem mudança de dependência, patch, ADR, schema ou CI
   neste recorte. Conclusão, commit e push têm aceites próprios.

### Critérios de aceitação

1. **6A-01.** Nas duas versões, uma conta Management de vhost, sem tag
   administrator, lista mais de uma página, busca um trecho literal com
   caracteres de regex, vê vazios e recupera página fora da faixa. A
   listagem valida contagens e recusa resposta global, nomes duplicados
   ou itens de outro vhost.
2. **6A-02.** Detalhe exato inclui tipo, flags e argumentos conforme a
   resposta. A exchange padrão aparece com identidade vazia e abre
   usando o alias da rota. Reservados, internos e tipo desconhecido
   são apresentados como tais. Exchange ausente tem diagnóstico
   próprio. Literal `amq.default`, `.` e `..` seguem as
   restrições de D03.
3. **6A-03.** Nos vhosts `/`, `detailed` e temporário com caracteres
   especiais, validar nomes que incluem barra, percentual literal,
   espaço e Unicode. Homônimos permanecem isolados e nenhuma request
   consulta outra rota. A troca temporária não edita o perfil.
4. **6A-04.** Exibir saída para fila e para exchange e entrada de
   exchange, com routing key vazia e bindings de mesma chave e
   argumentos diferentes identificados separadamente por
   `properties_key`. Verificar lista vazia, limite de 200 e excesso
   na matriz. Na exchange padrão, conferir texto dos vínculos implícitos
   e zero requests de listagem de bindings.
5. **6A-05.** Reproduzir falta de acesso ao vhost, TLS inválido,
   cancelamento e perda de contexto sem reutilizar dados antigos.
   Testar redirect, resposta malformada, limite de corpo e profundidade,
   argumentos com perda de precisão e erros de IPC. Nenhum caso escreve
   no broker, cria canais no produto ou eleva privilégios.
6. **6A-06.** Exercitar origem, frame e IDs inválidos, cancelamento cruzado
   e concorrência com operações de filas/vhosts. Verificar descarte após
   navegação, background, suspensão, disconnect e troca de contexto, e
   preservar `whoami` e cotas de recuperação existentes.
7. **6A-07.** Revisar navegação por teclado, foco ao abrir e voltar,
   rótulos, estados de lista/detalhe/bindings, temas claro e escuro e
   zoom 200%. Conferir artefato, regressões e matriz no executável,
   registrando resultados por SO/CPU e ambientes indisponíveis.
8. **6A-08.** Sincronizar o estado e as evidências com M04, Guia/Ajuda e
   Markdown vinculado ao README. Rastrear o que foi verificado em
   FR-012 e na leitura de FR-014, mantendo as demais partes de MVP-E01
   e FR-010 pendentes.

### Estrutura e evidências previstas

- Projetar DTOs em `src/shared/exchanges.ts` e integrar o protocolo existente
  de `src/shared/management.ts`. Implementar rotas/projeção em
  `src/main/management/exchangeRead.ts` e integrar o transporte, serviço e
  validação em `src/main/management`, o handler em `src/main/ipc/management.ts`
  e a ponte em `src/preload/desktopApi.ts`.
- Integrar `src/renderer/pages/Exchanges.tsx` à navegação existente em
  `src/renderer/shell`, reutilizando os padrões de Filas e os componentes do
  shell onde couber. Exercitar contratos do adapter, fronteiras IPC, serviço,
  preload e componentes com testes dirigidos aos cenários desta etapa.
- Estender `tools/testing/management.cjs` e `tools/testing/rabbitmq-real.cjs`
  para os smokes e a matriz, preservando brokers, rede, portas, credenciais
  e dados temporários isolados e limpeza verificada. Fixtures podem semear
  topologia apenas nos próprios brokers. Verificar inventário antes/depois
  e ausência de chamadas de escrita no fluxo do produto.
- Registrar a execução em `docs/07-testing/exchanges-6a.md`, detalhar M04 em
  `docs/04-modules/04-exchange-management.md` e sincronizar a fonte canônica
  `docs/10-user-guide/guide.json`, o Markdown gerado e a Ajuda após integração.

As rotas, a paginação de exchanges, as listas de bindings por direção e o
alias da exchange padrão foram revisados nas fontes oficiais. O comportamento
efetivo com TLS, permissões, nomes especiais e formatos de resposta será
verificado no gate.

[Referência HTTP](https://www.rabbitmq.com/docs/http-api-reference),
[exchange padrão e predefinidas](https://www.rabbitmq.com/docs/exchanges#default-exchange),
[rotas 4.4.0](https://github.com/rabbitmq/rabbitmq-server/blob/v4.4.0/deps/rabbitmq_management/src/rabbit_mgmt_dispatcher.erl#L136-L141),
[rotas 4.3.6](https://github.com/rabbitmq/rabbitmq-server/blob/v4.3.6/deps/rabbitmq_management/src/rabbit_mgmt_dispatcher.erl#L136-L141),
[listagem de exchanges 4.4.0](https://github.com/rabbitmq/rabbitmq-server/blob/v4.4.0/deps/rabbitmq_management/src/rabbit_mgmt_wm_exchanges.erl#L33-L46),
[listagem de exchanges 4.3.6](https://github.com/rabbitmq/rabbitmq-server/blob/v4.3.6/deps/rabbitmq_management/src/rabbit_mgmt_wm_exchanges.erl#L33-L46),
[listagem de bindings 4.4.0](https://github.com/rabbitmq/rabbitmq-server/blob/v4.4.0/deps/rabbitmq_management/src/rabbit_mgmt_wm_bindings.erl#L55-L61),
[listagem de bindings 4.3.6](https://github.com/rabbitmq/rabbitmq-server/blob/v4.3.6/deps/rabbitmq_management/src/rabbit_mgmt_wm_bindings.erl#L55-L61),
[alias 4.4.0](https://github.com/rabbitmq/rabbitmq-server/blob/v4.4.0/deps/rabbitmq_web_dispatch/src/rabbit_web_dispatch_access_control.erl#L336-L344)
e [alias 4.3.6](https://github.com/rabbitmq/rabbitmq-server/blob/v4.3.6/deps/rabbitmq_web_dispatch/src/rabbit_web_dispatch_access_control.erl#L337-L345).

O gate final passou 11 verificações por versão. O check, package, 11
smokes e 70 verificações no executável passaram em macOS arm64. Guia e
Ajuda acompanham a leitura de exchanges e bindings. O proprietário aprovou a conclusão e o
commit local em 2026-11-20. [Evidências](../07-testing/exchanges-6a.md).
