# Bunnies — instruções operacionais

## Projeto e escopo

Bunnies é uma aplicação exclusivamente desktop para administração e observabilidade
do RabbitMQ em Windows, Linux e macOS. Preservar nome, identidade visual, licença e
histórico. Aplicação web, SaaS e backend hospedado próprio estão fora do escopo.
Consultar a [visão do produto](docs/00-overview/product-vision.md).

## Stack, arquitetura e estrutura

- **Stack aprovada:** Electron, React e TypeScript, com Forge/Webpack e modernização
  incremental. As versões da matriz estão aceitas para validação, ainda não homologadas.
- Arquitetura e cenários estão na
  [avaliação tecnológica](docs/03-architecture/technology-evaluation.md) e na
  [arquitetura](docs/03-architecture/architecture.md).
- Detalhar a estrutura física de código no contrato de implementação. O
  [inventário](docs/01-audit/repository-inventory.md) descreve a estrutura existente.
- Organizar por responsabilidades e funcionalidades; evitar dependências
  circulares, camadas artificiais e abstrações sem benefício concreto.
- Os sete [ADRs](docs/03-architecture/architecture.md) estão Accepted. Os status são
  Proposed, Accepted, Superseded ou Rejected. Somente Accepted
  registra decisão arquitetural aprovada explicitamente pelo proprietário.

## Convenções e segurança

- Seguir as convenções existentes: dois espaços em JS/TS/JSON, nomes claros,
  interfaces explícitas, composição e tratamento de erros. Novas regras de tooling
  devem seguir o planejamento aprovado e a autorização da etapa de implementação.
- Documentação em português; identificadores e mensagens de commit em inglês.
- Nunca persistir senhas/tokens em texto puro nem registrar segredos em logs.
- Não desabilitar validação TLS; validar entradas e fronteiras IPC.
- Exigir confirmação clara de operações destrutivas e identificar produção.
- Não prometer inspeção de mensagens sem efeitos colaterais. Consultar o
  [MVP aprovado](docs/02-requirements/mvp-scope.md).
- Os [riscos identificados](docs/01-audit/technical-debt.md) continuam abertos até
  implementação e verificação; documentação não os resolve.

## Testes e definição de pronto

Executar verificações pertinentes ao escopo autorizado e registrar resultados
reais e limitações. Testes destrutivos somente em brokers isolados provisionados
pelo harness. A Etapa 2A foi implementada, verificada e aprovada. Não iniciar
integração RabbitMQ nem a 2B antes de autorização específica.
A [estratégia de testes](docs/07-testing/test-strategy.md) e o
[modelo de segurança](docs/08-security/security-model.md) estão aprovados como planos,
sem homologação. Limites e metas aprovados têm fonte única nos
[requisitos não funcionais](docs/02-requirements/non-functional-requirements.md).

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
proprietário na resposta “Aprovado”, registrados em `c292b35`.
A resposta posterior “Autorizado” permitiu a Etapa 1B documental. Após a apresentação,
“Aprovado” aceitou explicitamente ADRs 0001–0007, MVP, requisitos/limites e conclusão,
autorizando o commit da 1B. A resposta posterior “Autorizado” aprovou o contrato da 2A, incluindo instalação
e verificações que geram artefatos locais. Após a apresentação dos resultados,
“Sim” aprovou a conclusão da 2A e autorizou o commit
`chore(setup): modernize desktop development foundation`. Isso não autoriza a 2B.

## Estado e retomada

- Etapa atual: **2A — fundação técnica, concluída e aprovada**.
- Última etapa concluída e aprovada: **2A — fundação técnica**.
- Próxima etapa proposta: **2B — fronteira desktop**, ainda não autorizada.
- Próxima ação autorizada: registrar/conferir o commit aprovado da 2A e apresentar
  o contrato proposto da 2B; aguardar autorização própria antes de executá-la.

Ao retomar, ler este arquivo, a avaliação tecnológica, o
[roadmap](docs/05-roadmap/roadmap.md), o [estado atual](docs/05-roadmap/current-stage.md)
e o [progresso](docs/05-roadmap/progress.md). Verificar Git, identificar a última
aprovação e continuar apenas o trabalho autorizado. Não reiniciar o planejamento
nem inferir autorização de uma lista de pendências.

Referências adicionais: [análise do legado](docs/01-audit/legacy-analysis.md),
[dependências](docs/01-audit/dependency-audit.md) e
[índice dos módulos](docs/04-modules/module-index.md).

Comandos e regras de tooling: [desenvolvimento](docs/06-development/coding-standards.md).
Resultados reais e limitações: [evidências da 2A](docs/07-testing/foundation-2a.md).
Instalação/check/package/smoke local foram verificados em macOS arm64; isso não
homologa os demais alvos nem fecha os riscos de segurança previstos para a 2B.
