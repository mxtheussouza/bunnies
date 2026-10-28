# Roadmap e contratos de execução

Data: 2026-10-28. Status: Etapas 0, 1A e 1B concluídas e aprovadas; sete ADRs aceitos.
Etapas de implementação não autorizadas.

## Sequência proposta

| Etapa | Entrega verificável | Situação |
| --- | --- | --- |
| 0 | Auditoria técnica do legado, somente de leitura | Concluída e aprovada pelo proprietário |
| 1A | Registro documental da auditoria, governança e propostas | Concluída e aprovada; commit `c292b35` |
| 1B | Stack, matriz tecnológica, arquitetura, MVP e estratégia de testes | Concluída e aprovada; sete ADRs Accepted e commit autorizado |
| 2A | Ambiente reproduzível, dependências compatíveis, tipagem, lint e CI inicial | Proposta |
| 2B | Ciclo desktop, fronteira segura, erros e smoke de empacotamento | Proposta |
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
