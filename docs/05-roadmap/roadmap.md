# Roadmap e contratos de execução

Data: 2026-10-28. Status: Etapas 0, 1A, 1B, 2A e 2B concluídas e aprovadas; sete ADRs aceitos.
Conclusão/commit da 2B aprovados por “Aprovado”; execução da 3A não autorizada.

## Sequência proposta

| Etapa | Entrega verificável | Situação |
| --- | --- | --- |
| 0 | Auditoria técnica do legado, somente de leitura | Concluída e aprovada pelo proprietário |
| 1A | Registro documental da auditoria, governança e propostas | Concluída e aprovada; commit `c292b35` |
| 1B | Stack, matriz tecnológica, arquitetura, MVP e estratégia de testes | Concluída e aprovada; sete ADRs Accepted e commit autorizado |
| 2A | Ambiente reproduzível, dependências compatíveis, tipagem, lint e CI inicial | Concluída e aprovada; commit autorizado por “Sim” |
| 2B | Ciclo desktop, fronteira segura, erros e smoke de empacotamento | Concluída e aprovada; commit autorizado |
| 3A | Navegação, tokens e componentes para aprovação | Proposta |
| 3B | Interface base acessível, temas e estados | Proposta |
| 4A | Perfis, proteção de credenciais e testes de conectividade | Proposta |
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

## Contrato proposto — Etapa 3A: navegação e design system

Status: **Proposed; aguardar autorização explícita**.

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
