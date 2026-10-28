# Roadmap e contratos de execução

Data: 2026-10-28. Status: Etapas 0, 1A, 1B, 2A, 2B, 3A e 3B concluídas e aprovadas;
sete ADRs e D3A-01–08 aceitos. Conclusão/commit da 3B aprovados por “Aprovado”.
4A.1 concluída/aprovada e registrada em `fe4a252`. DOC.1 concluída/aprovada por
“Aprovado”; commit autorizado. 4A.2 sem autorização.

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
| DOC.1 | Histórico vivo, guia e Ajuda offline | Concluída e aprovada por “Aprovado”; commit autorizado |
| 4A.2 | Testes HTTPS/AMQPS, CA customizada e ciclo de sessão | Proposta; contrato e autorização próprios pendentes |
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
