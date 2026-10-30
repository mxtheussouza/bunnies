# Bunnies — instruções operacionais

## Leitura obrigatória e histórico vivo

Ao ler este AGENTS, **ler também [PROJECTS_STATUS.md](PROJECTS_STATUS.md) antes de
iniciar qualquer Task, alteração ou fase**. Esse arquivo é o histórico vivo do
projeto: consultar estado atual, tarefas concluídas/pendentes, decisões, aprovações
e testes executados antes de agir.

**Atualizar PROJECTS_STATUS.md em toda Task/fase/alteração/atualização**: registrar
o início e o escopo autorizado; ao alterar a execução ou concluir um bloco de
trabalho, acrescentar o que mudou, decisões, testes realmente executados, limitações
e próxima ação. Preservar entradas históricas, mantendo o resumo atual sincronizado
com current-stage/progress. Não declarar teste aprovado sem execução nem registrar
segredos. Atualizar também ao preparar/registrar commits e ao retomar a sessão.

Guia do usuário e Ajuda devem acompanhar cada funcionalidade ou mudança de
formulário. Manter uma fonte única de conteúdo e verificar sincronização com o
Markdown linkado ao README; não documentar funcionalidade futura como disponível.

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
integração RabbitMQ. A resposta “Autorizado” aprovou executar o contrato da 2B,
incluindo as verificações locais e dependências necessárias. A conclusão da 2B e
seu commit foram posteriormente aprovados por “Aprovado”. A resposta “Autorizo”
aprovou executar a 3A documental/visual; não alterar código, dependências ou assets.
A resposta posterior “Aprovado” aceitou D3A-01–08, a conclusão da 3A e seu commit;
não autorizou executar a 3B.
A resposta seguinte “Sim” autorizou executar o contrato da 3B apresentado após
`c215004`, incluindo verificações e artefatos locais. Não autoriza conclusão/commit
da 3B nem a execução da 4A.
A resposta posterior “Aprovado” aceitou a conclusão da 3B e autorizou seu commit
`feat(desktop): implement application shell and themes`, mantendo as limitações
registradas. Não autoriza executar a 4A ou suas subetapas.
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
`chore(setup): modernize desktop development foundation`. Esse aceite não autorizou a 2B. A resposta posterior “Autorizado” aprovou o
contrato próprio da 2B. Após a apresentação dos resultados, “Aprovado” aceitou
sua conclusão e autorizou `fix(desktop): secure Electron process boundaries`,
sem autorizar a execução da 3A.

## Estado e retomada

- Etapa atual: **4A.2B concluída/aprovada; commit autorizado**.
- Última etapa concluída e aprovada: **4A.2B — teste AMQPS/vhost e matriz real**.
- Entrega aprovada: `feat(connections): add cancellable AMQPS connection tests`.
- Base desta entrega: `9401448`, alteração da barra macOS preservada.
- Próxima ação: registrar/conferir o commit aprovado e preparar contrato 4A.2C;
  implementação requer aceite específico do contrato.

Ao retomar, ler este arquivo, [PROJECTS_STATUS.md](PROJECTS_STATUS.md), a avaliação tecnológica, o
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
homologa os demais alvos. A fronteira implementada na 2B e seus limites estão nas
[evidências da 2B](docs/07-testing/desktop-boundary-2b.md).

Estrutura desktop atual: `src/main` (janela, IPC e políticas), `src/preload`
(ponte mínima), `src/shared` (contratos sem Node/React); UI preservada em renderer
e misc. Restrições de import estão no lint, não substituem as verificações no main.
Nunca restaurar acesso direto a clipboard, IPC genérico ou URLs arbitrárias na ponte.

Após a apresentação da 2B surgiram cinco alterações locais em assets (três arquivos
versionados e dois novos logotipos). Preservá-las fora do commit da 2B; não revertê-las
nem inferir que já integraram o pacote testado. Ver o estado atual para retomada.

Na retomada da 3A, o Git estava limpo em `39234fa` (commit posterior de logos); a
entrega da 2B está em `a550731`. Os cinco assets antes pendentes agora estão
versionados. A 3A pode inspecioná-los e referenciá-los em mockups, sem editá-los.

Design aprovado na 3A: [navegação](docs/03-architecture/navigation.md),
[design system](docs/03-architecture/design-system.md) e
[mockups/verificações](docs/03-architecture/ui-proposals/README.md). D3A-01–08 estão
Accepted; isso não implementa o design. Aplicar tokens/layouts exige o contrato e
a autorização próprios da 3B. Dados fictícios permanecem restritos a documentação/testes.

A 3B foi autorizada por “Sim”. Interface base em `src/renderer/shell`, `pages` e
`components`; tema em `src/providers/ThemeMode.tsx` e CSS externo --bn-. Só o enum
de preferência vai ao storage do renderer; nunca perfis, credenciais ou payloads.
Na 3B, preservaram-se URL fixa e ponte de oito métodos; a ampliação 4A.1 está
descrita abaixo. Shell inicial sem sessão; não
instalar fixtures de broker como dados de produto. [Resultados e limites da 3B](docs/07-testing/interface-3b.md).
82 testes e package/smoke locais passaram; não homologa outros SOs/CPUs ou WCAG.
Teclado do menu nativo de tema ainda exige revisão manual; o aceite da conclusão
não homologa essa interação. No encerramento da 3B, seu commit foi autorizado por
“Aprovado”, sem implementação 4A naquele aceite. A autorização posterior da 4A.1
e seu recorte vigente estão descritos abaixo.

## Autorização vigente — 4A.1

Após a proposta registrada em `eb535d7`, o proprietário respondeu **“Autorizo”**.
Está autorizada a execução do contrato 4A.1 no roadmap: perfis locais, JSON,
segredo em memória/proteção condicionada e IPC nomeado, com testes isolados.
A ponte de oito métodos pode receber as operações explícitas previstas nesse
contrato, mantendo as proteções 2B. Não conectar a brokers, instalar dependências,
avançar à 4A.2 ou realizar commit sem aprovação de conclusão.

Implementação 4A.1: `src/main/profiles` mantém JSON/revisões/fila e senha transitória;
`src/shared/profiles.ts` define DTOs; `bunnies:profiles` tem handler próprio com a
mesma autoridade 2B. A ponte agora tem **12 métodos explícitos**, quatro de perfis
mais oito desktop. A instrução histórica de preservar oito métodos na 3B foi
ampliada pelo contrato autorizado da 4A.1; nunca expor invoke/send genéricos.
`Connections.tsx`/`ProfileForm.tsx` substituem o estado vazio; selecionar não ativa
sessão. Gate de safeStorage permanece fechado em todos os alvos. Não habilitar por
UI/CLI nem inferir proteção assíncrona de backend síncrono. [M01](docs/04-modules/01-connection-manager.md)
e [evidências 4A.1](docs/07-testing/profiles-4a1.md). Após package, executar o smoke
base e `node tools/testing/profiles.cjs` sequencialmente, usando somente dados temporários.

O proprietário respondeu **“Aprovado!”** após a apresentação da 4A.1, aprovando
sua conclusão e o commit `feat(connections): implement local profiles and transient credentials`.
Mantêm-se os gates/limitações apresentados; não autoriza a 4A.2. A solicitação
adicional de histórico vivo e documentação/Ajuda terá entrega própria.

## Conclusão DOC.1 aprovada

O proprietário respondeu **“Aprovado”** à solicitação de conclusão DOC.1 e do commit
`feat(help): add offline user guide and project status tracking`. Aceite registrado
no PROJECTS/estado/evidências; limitações mantidas. Registrar somente a entrega
apresentada e a sincronização documental do aceite. Não repetir implementação,
fazer push ou iniciar 4A.2 sem autorização própria. Guia e histórico permanecem
obrigações de toda Task posterior.

## Preparação da próxima etapa

Após DOC.1 em `66183f7`, o pedido “Pode seguir para a próxima etapa” iniciou a
preparação do contrato 4A.2A (CA personalizada/teste HTTPS). O contrato detalhado
foi inicialmente Proposed no roadmap; o aceite posterior abaixo autorizou A e
seus sub-limites. B/C continuam dependentes de contratos próprios. Registrar toda
Task no PROJECTS; guia acompanha apenas o comportamento implementado.

## Autorização vigente — 4A.2A

Após apresentar o contrato detalhado no roadmap, o proprietário respondeu
**“Autorizo”**. Estão aprovados para implementação os limites/CA/schema/teste HTTPS
desse contrato, usando APIs instaladas e testes isolados. Atualizar PROJECTS e guia.
Permite ampliar IPC com operações específicas; preservar autoridade/CSP/sandbox.
Não inclui AMQP/sessão ativa, persistência de senha, novas dependências ou push.
Não registrar commit antes de aprovação de conclusão.

Implementação 4A.2A: a ponte agora tem **16 métodos específicos**, incluindo
selectProfileCa/discardProfileCa/testProfileHttps/cancelProfileHttpsTest em canal
bunnies:connections. A regra histórica de 12 métodos foi ampliada por esse contrato.
Nunca expor URL/path/header/senha recuperada. JSON v2 preserva leitura v1 e backup
exato em gravação explícita; tokens CA expiram por janela e não voltam como PEM.
Node probe só faz whoami no perfil salvo, TLS validado, sem sessão/AMQP; policy
Chromium/CSP preservada. Rodar check, package e smokes base/perfis/https em sequência.
[Evidências 4A.2A](docs/07-testing/https-4a2a.md); Docker sem daemon limita RabbitMQ
real. Guia e PROJECTS devem acompanhar este e todos os incrementos.

## Conclusão 4A.2A aprovada

O proprietário respondeu **“Aprovado”** à solicitação explícita de conclusão e do
commit `feat(connections): add custom CA and HTTPS authentication tests`.
Conferidos os 58 arquivos apresentados e o ASAR antes da sincronização documental
do aceite. Resultados/limitações apresentados permanecem válidos; não ampliar a etapa.
Uma alteração posterior em `misc/window/components/Titlebar/index.tsx` é trabalho
local adicional: preservar fora desse commit, sem reverter ou presumir homologação.
Não fazer push nem iniciar 4A.2B/C sem seus contratos/autorizações próprios.

## Preparação vigente — 4A.2B

O pedido “Continue as etapas” após o commit 966b4a2 autoriza preparar/apresentar
o próximo contrato. [Roadmap](docs/05-roadmap/roadmap.md): teste AMQPS explícito
sem sessão, amqplib 2.2.0 proposto, TLS/vhost/deadline/cleanup, IPC e guia/testes.
Aguardar aceite desse contrato antes de instalar dependência ou modificar código.
Não confundir proposta com recurso disponível no guia/Ajuda.

O proprietário registrou a mudança da barra de título em 9401448; Git estava limpo
na retomada. Preservar esse comportamento e revalidar smokes por plataforma no
incremento autorizado; o pacote anterior não contém essa mudança. Atualizar
PROJECTS a cada Task. 4A.2C continua dependente de contrato/autorização próprios.

## Autorização vigente — 4A.2B

Em 2026-10-29, após o contrato detalhado, o proprietário respondeu **“Autorizo”**.
Está aprovada a implementação do teste AMQPS/vhost, amqplib 2.2.0 exato,
parâmetros/IPC/UI/guia e verificações locais/isoladas do contrato. A preparação
anterior Proposed foi aceita por essa resposta. Preservar 9401448 e proteções.
Atualizar PROJECTS em cada Task. Não inclui sessão/4A.2C ou commit/push antecipados.

Implementação 4A.2B: ConnectionTestService coordena HTTPS/AMQPS por janela;
amqplib/callback_api somente no main, ponte com 18 métodos específicos. Parser de
vhost puro compartilhado com UI; sem schema novo. Validar check/package e smokes
base/perfis/HTTPS/AMQPS sequenciais; preservar políticas e não criar sessão/canais.

[Evidências 4A.2B](docs/07-testing/amqps-4a2b.md): 216 testes/check, package e quatro
smokes passaram em macOS arm64; na apresentação inicial, Docker estava sem daemon. Guia/Ajuda
sincronizados; menu nativo manual/outros alvos/providers/releases não homologados.
Não registrar commit antes do aceite da conclusão apresentada.

## Complemento autorizado — RabbitMQ real na 4A.2B

Após a apresentação, o proprietário pediu “Faça o teste com o rabbitmq real, o
docker já está ativado”, seguido de “Continue”. Docker Engine 29.8.0 disponível;
`tools/testing/rabbitmq-real.cjs` passou com **20 verificações em cada 4.4.0/4.3.6**
real de nó único, imagens oficiais arm64 executadas por digest, HTTPS/AMQPS/TLS,
vhosts/recusas/cancelamento/prazo e cleanup. Mesmo ASAR apresentado, sem alteração
de produto. Ver [evidências](docs/07-testing/amqps-4a2b.md) antes de repetir.

Harness só provisiona recursos próprios (labels/namespace, portas loopback, senhas
geradas em memória e hashes nas definições), sem aceitar broker arbitrário. Remove
container/rede/certificados/userData no finally; imagens ficam em cache. Os 40 checks
são integração adicional, separados dos 216 testes. Não homologa cluster/HA, outros
SOs/CPUs, recursos futuros ou release. Conclusão/commit 4A.2B ainda exigem aceite;
não avançar à 4A.2C ou fazer push. PROJECTS registra também falhas/ajustes do harness.

## Conclusão 4A.2B aprovada

Em 2026-10-30, “Aprove a 4A.2B, e siga para a próxima etapa” aceitou conclusão e
commit `feat(connections): add cancellable AMQPS connection tests`, incluindo o
complemento real 4.4.0/4.3.6. Snapshot de 57 caminhos/ASAR conferido sem divergências.
Registrar somente essa entrega e a sincronização documental do aceite; manter
limitações apresentadas. O pedido seguinte autoriza preparar/apresentar contrato
4A.2C, que ainda não foi detalhado/aceito. Não implementar sessão, fazer push ou
interpretar hipóteses futuras como aprovadas. Consultar estado/PROJECTS na retomada.
