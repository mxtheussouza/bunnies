# Roadmap e contratos de execução

Data: 2026-10-28. Status: Etapas 0, 1A, 1B, 2A, 2B, 3A e 3B concluídas e aprovadas;
sete ADRs e D3A-01–08 aceitos. Conclusão/commit da 3B aprovados por “Aprovado”.
4A.1 concluída/aprovada e registrada em `fe4a252`. DOC.1 concluída/aprovada por
“Aprovado”; registrada em `66183f7`. Conclusão/commit 4A.2A aprovados por “Aprovado”.
4A.2A registrada em `966b4a2`; HEAD `9401448` inclui ajuste posterior do proprietário
na barra de título macOS. Contrato 4A.2B abaixo foi autorizado por “Autorizo” em 2026-10-29.

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
| 4A.2 | Testes HTTPS/AMQPS, CA customizada e ciclo de sessão | 4A.2A/B concluídas/aprovadas; contrato 4A.2C a preparar |
| 4B | Management API, capacidades e consultas de leitura | Proposta |
| 5 | Filas e proteção das operações destrutivas | Proposta |
| 6 | Exchanges e bindings | Proposta |
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
