# Bunnies — instruções operacionais

## Projeto e escopo

Bunnies é uma aplicação exclusivamente desktop para administração e observabilidade
do RabbitMQ em Windows, Linux e macOS. Preservar nome, identidade visual, licença e
histórico. Aplicação web, SaaS e backend hospedado próprio estão fora do escopo.
Consultar a [visão do produto](docs/00-overview/product-vision.md).

## Stack, arquitetura e estrutura

- **Stack aprovada para modernização: pendente.** Electron/React/TypeScript são a
  stack legada, não uma decisão de modernização aceita.
- Arquitetura e cenários estão na
  [avaliação tecnológica](docs/03-architecture/technology-evaluation.md).
- Aprovar a stack antes de definir a estrutura definitiva de código. O
  [inventário](docs/01-audit/repository-inventory.md) descreve a estrutura existente.
- Organizar por responsabilidades e funcionalidades; evitar dependências
  circulares, camadas artificiais e abstrações sem benefício concreto.
- ADRs futuros usarão Proposed, Accepted, Superseded ou Rejected. Somente Accepted
  registra decisão arquitetural aprovada explicitamente pelo proprietário.

## Convenções e segurança

- Seguir as convenções existentes: dois espaços em JS/TS/JSON, nomes claros,
  interfaces explícitas, composição e tratamento de erros. Novas regras de tooling
  dependem do planejamento aprovado.
- Documentação em português; identificadores e mensagens de commit em inglês.
- Nunca persistir senhas/tokens em texto puro nem registrar segredos em logs.
- Não desabilitar validação TLS; validar entradas e fronteiras IPC.
- Exigir confirmação clara de operações destrutivas e identificar produção.
- Não prometer inspeção de mensagens sem efeitos colaterais. Consultar o
  [MVP proposto](docs/02-requirements/mvp-scope.md).
- Os [riscos identificados](docs/01-audit/technical-debt.md) continuam abertos até
  implementação e verificação; documentação não os resolve.

## Testes e definição de pronto

Executar verificações pertinentes ao escopo autorizado e registrar resultados
reais e limitações. Testes destrutivos somente em brokers isolados. Na Etapa 1A,
verificar conteúdo, links locais, consistência e diff; não instalar dependências
ou executar build da aplicação. A estratégia de testes da aplicação será definida
na Etapa 1B e nos contratos de implementação.

Uma entrega pronta para revisão exige escopo implementado, verificações aplicáveis,
revisão técnica, documentação sincronizada, critérios de aceitação atendidos e
problemas conhecidos registrados. A conclusão depende da aprovação do proprietário.

## Aprovação e Git

1. Verificar branch e working tree; preservar alterações existentes.
2. Apresentar o contrato da etapa e aguardar aprovação explícita antes de escrever.
3. Implementar apenas o escopo autorizado. Decisões significativas não previstas
   exigem nova aprovação antes do trabalho dependente.
4. Apresentar resultados, verificações e documentação para aprovação de conclusão.
5. Somente após essa aprovação, registrar commit coeso com Conventional Commits.
6. Não avançar à etapa seguinte sem autorização específica. Silêncio não é aprovação.

Não criar branches sem autorização, reescrever histórico, executar force push ou
fazer push automaticamente. A Etapa 1A foi autorizada na branch existente
`chore/modernization-app`; sua conclusão e seu commit foram aprovados pelo
proprietário na resposta “Aprovado”. Essa autorização não se estende à Etapa 1B.

## Estado e retomada

- Etapa atual: **1A — documentação, concluída e aprovada**.
- Última etapa concluída e aprovada: **1A — registro documental da auditoria**.
- Próxima etapa proposta: **1B — planejamento e decisões**, ainda não autorizada.
- Próxima ação autorizada: conferir o registro da entrega aprovada da Etapa 1A e
  apresentar o contrato da Etapa 1B; aguardar autorização específica antes de executá-la.

Ao retomar, ler este arquivo, a avaliação tecnológica, o
[roadmap](docs/05-roadmap/roadmap.md), o [estado atual](docs/05-roadmap/current-stage.md)
e o [progresso](docs/05-roadmap/progress.md). Verificar Git, identificar a última
aprovação e continuar apenas o trabalho autorizado. Não reiniciar o planejamento
nem inferir autorização de uma lista de pendências.

Referências adicionais: [análise do legado](docs/01-audit/legacy-analysis.md),
[dependências](docs/01-audit/dependency-audit.md) e
[índice dos módulos](docs/04-modules/module-index.md).
