# Arquitetura do Bunnies

Data: 2026-10-28. Status: **Accepted como direção arquitetural e especificação**.
Modernização incremental com Electron, React e TypeScript aprovada pelo proprietário
na conclusão da 1B, junto aos sete ADRs. A aceitação da 1B não implementou o desenho. Os contratos da 2A e da 2B foram
autorizados posteriormente; evidências e limites da implementação estão ao final.

Referências: [avaliação e matriz tecnológica](technology-evaluation.md),
[requisitos funcionais](../02-requirements/functional-requirements.md),
[não funcionais](../02-requirements/non-functional-requirements.md),
[segurança](../08-security/security-model.md) e
[testes](../07-testing/test-strategy.md).

## Decisões aprovadas

| ADR | Proposta |
| --- | --- |
| [ADR-0001](adr/0001-desktop-stack.md) | Electron incremental, Webpack preservado e matriz de ferramentas candidata |
| [ADR-0002](adr/0002-rabbitmq-transports.md) | HTTPS para administração; AMQPS 0-9-1 para publicação |
| [ADR-0003](adr/0003-desktop-security-boundary.md) | Renderer sem privilégio, preload mínimo e validação no núcleo |
| [ADR-0004](adr/0004-local-settings-and-secrets.md) | Configuração JSON versionada e segredos protegidos pelo SO ou apenas em memória |
| [ADR-0005](adr/0005-compatibility-matrix.md) | Matriz inicial de homologação de broker e SO/CPU |
| [ADR-0006](adr/0006-message-inspection.md) | Excluir inspeção/consumo do MVP e exigir semântica explícita depois |
| [ADR-0007](adr/0007-desktop-distribution.md) | Build por alvo, smoke cedo e release sem publicação automática |
| [ADR-0008](adr/0008-amqp-lifecycle-safety.md) | Alternativa A: patch mínimo verificável no agendamento inicial AMQP; aceita em 2026-10-30 |
| [ADR-0009](adr/0009-management-vhost-read-contract.md) | Alternativa A: lista completa limitada de vhosts e presença do contexto atual, aceita em 2026-10-30 |

## Processos e confiança

```mermaid
flowchart LR
    UI["Renderer React: apresentação"] --> BR["Preload: métodos nomeados"]
    BR --> IPC["Main: validação de origem e DTOs"]
    IPC --> APP["Casos de uso por funcionalidade"]
    APP --> H["HTTPS administrativo"]
    APP --> A["AMQPS: publicação confirmada"]
    APP --> CFG["Configuração e proteção de segredos"]
    APP --> CONF["Confirmação nativa contextual"]
    H --> RMQ["RabbitMQ do usuário"]
    A --> RMQ
```

O renderer apresenta dados e coleta entradas. O preload encaminha chamadas e eventos
sem expor Electron, Node, URLs de requisição genéricas ou filesystem. O main compõe
casos de uso, transportes, configuração, segredos e confirmações. Respostas do broker
são dados não confiáveis, mesmo que a conexão TLS seja válida.

As operações são locais ao desktop e usam I/O assíncrono. Limitar parsing e respostas
antes de considerar worker/processo auxiliar; adicioná-lo somente por medição. Não
criar serviços remotos ou processos por módulo.

## Organização conceitual aprovada

| Área candidata | Responsabilidade e regra de import |
| --- | --- |
| `src/main` | Composition root, ciclo desktop, IPC e casos de uso; pode importar contratos e adapters |
| `src/preload` | Ponte compilada para sandbox; importa apenas Electron permitido e contratos serializáveis |
| `src/renderer` | Shell, componentes e funcionalidades; não importa main, clientes RabbitMQ ou Node |
| `src/shared` | DTOs, schemas de fronteira e códigos de erro; sem Node, React ou transporte |
| Infraestrutura no main | HTTP, AMQP, persistência e proteção pelo SO; implementa portas pequenas dos casos de uso |
| Regras de negócio | Tipos/regras puros próximos da funcionalidade; extrair domain somente quando trouxer benefício |
| Testes | Próximos das unidades; integração/E2E separados quando criados por contrato |

A estrutura física desktop foi detalhada no contrato aprovado da 2B e está ao final.
A base continua em `src`, `misc` e `tools`; novos módulos exigem contratos próprios
antes de reorganizações adicionais.
O [índice de módulos](../04-modules/module-index.md) conserva os oito limites do produto.

## Contratos IPC candidatos

| Família | Operações específicas | Regra de execução |
| --- | --- | --- |
| Perfis | Listar, salvar, remover, testar endpoints | Nunca retornar senha recuperada; DTO de edição indica apenas se há segredo salvo |
| Sessão | Ativar, selecionar vhost, encerrar, obter estado | ID/generation atribuídos no main; validar contexto em cada operação |
| Filas | Listar, detalhar, criar, excluir, purgar | Nome/vhost explícitos; main resolve endpoint do perfil ativo |
| Exchanges/bindings | Listar/detalhar/criar/excluir e administrar bindings | Preservar identidade da API e argumentos suportados |
| Mensagens | Validar e publicar | Uma publicação em voo, confirmações e resultado incerto |
| Métricas | Obter snapshot, iniciar/parar assinatura | Assinaturas vinculadas à janela/sessão; remoção de listener explícita |
| Desktop | Obter versão/plataforma e abrir links fixos do produto | Sem `openExternal(url)` arbitrário; preferir roles nativas para edição |

Cada request carrega requestId, sessionId/generation quando aplicáveis e DTO
validado. O main verifica a janela e o frame principais, origem exata e tamanho do
corpo; o registro dos handlers é único. Eventos entregam somente dados, não o evento
Electron. A função de assinatura devolve unsubscribe e o encerramento remove recursos.

Resultado conceitual: sucesso com valor ou erro com código, requestId e mensagem
sanitizada. Códigos candidatos: VALIDATION, UNAUTHENTICATED, FORBIDDEN, TLS_ERROR,
NETWORK, TIMEOUT, NOT_FOUND, CONFLICT, UNSUPPORTED, CANCELLED, OUTCOME_UNKNOWN e INTERNAL.
Não devolver stack, URL com credenciais, corpo HTTP bruto ou cabeçalhos de autenticação.
Schemas Zod são candidatos para a fronteira; domínio não depende dessa biblioteca.

### DTOs mínimos para detalhar na implementação

| Contrato | Campos/conteúdo propostos | Regra |
| --- | --- | --- |
| ProfileInput | ID opcional, nome, ambiente, URLs HTTP/AMQP, usuário, CA, modo memória/protegido e ação do segredo manter/substituir/remover | Senha só na substituição; URL sem userinfo; criação/edição validada no main |
| ProfileSummary | ID, nome, ambiente, endpoints sanitizados e indicador de segredo salvo | Nunca incluir senha, ciphertext ou conteúdo de CA |
| SessionContext | sessionId, generation e vhost | O main atribui/valida; não aceitar troca implícita pelo argumento da operação |
| ResourceRef | Contexto, tipo e nome exato do recurso | Preservar caracteres do nome; codificar caminho sem trim ou alteração silenciosa |
| QueueCreate | Nome, tipo classic/quorum, flags do recorte e argumentos catalogados | Chaves desconhecidas rejeitadas; não reconfigurar fila existente automaticamente |
| BindingRef | Contexto, origem/destino, tipo, routing key, argumentos e identidade retornada pela API | Validar identidade recebida e não fabricar chave para exclusão |
| PublishInput | Contexto, exchange, routing key, formato, texto e propriedades/headers permitidos | Headers primitivos tipados; rejeitar número não finito/inteiro sem precisão e dados fora do limite |
| PublishOutcome | confirmed, unroutable, rejected ou unknown, com requestId | Confirm não significa processamento; retorno sem rota não vira sucesso aparente |
| MetricsSnapshot | Contexto, escopo broker/vhost, instante e valores opcionais com estado de disponibilidade | Ausente não é zero; snapshot de memória não implica histórico |

Pedidos IPC rejeitam campos não previstos. Respostas de broker validam campos
necessários e toleram extensões desconhecidas para compatibilidade, sem executar
dados brutos. O contrato de cada etapa definirá schemas e mapeamentos completos;
esta tabela não constitui código implementado ou schema já testado.

## Sessão e recuperação

Uma sessão lógica contém perfil, vhost selecionado, generation e estados separados
dos transportes HTTP/AMQP. Estado agregado: idle, connecting, ready, degraded,
reconnecting ou closed. HTTP disponível e AMQP indisponível permite consultas, mas
não publicação. Não derivar um único status de um socket.

Ao trocar perfil/vhost: cancelar leituras/assinaturas, invalidar generation, fechar
recursos antigos e descartar respostas atrasadas. Confirmar operações críticas antes
da troca ou explicar resultado incerto de escrita já enviada. Não reconectar perfil
antigo após encerramento explícito. Backoff/timeouts seguem NFR-013/019.

Uma leitura pode ser repetida pela política limitada; erros de credencial, permissão
ou certificado não geram tempestade de reconexão. Nenhuma escrita é repetida
automaticamente. Polling é centralizado, limitado e cancelável, sem múltiplos timers
por componente ou requisições sobrepostas da mesma consulta.

## Adapter administrativo

Proposta: HTTPS do Node no main, com CA por conexão, limitação de bytes descomprimidos,
timeout e cancelamento; sem biblioteca HTTP adicional inicialmente. Não seguir
redirecionamentos automaticamente nem herdar proxy corporativo silenciosamente.
Proxy configurável está fora do MVP; isso precisa estar explícito na conexão.

| Caso de uso | Endpoint candidato da Management API |
| --- | --- |
| Versão/resumo | `GET /api/overview` |
| Vhosts | `GET /api/vhosts` |
| Filas | `GET /api/queues/{vhost}` e `GET /api/queues/{vhost}/{name}` |
| Consumidores da fila | Dados do detalhe ou consulta de consumidores filtrada conforme versão |
| Criar/excluir fila | `PUT` / `DELETE /api/queues/{vhost}/{name}` |
| Purge | `DELETE /api/queues/{vhost}/{name}/contents` |
| Exchanges | `GET /api/exchanges/{vhost}` e operações específicas por nome |
| Bindings | Endpoints de bindings queue/exchange conforme direção e identidade retornada |

Validar esses contratos nas duas versões-alvo antes de homologar. Codificar cada
segmento, inclusive `/` do vhost; não construir URL por concatenação de entradas.
Usar paginação/campos reduzidos onde suportados. Vhosts e outros endpoints sem
paginação documentada mantêm limite de resposta e erro explícito, sem paginação fictícia.
Tags de management não comprovam permissões AMQP ou todas as permissões de recurso.
Erros 401/403 são interpretados por operação, sem elevar privilégios.
[Referência administrativa](https://www.rabbitmq.com/docs/http-api-reference).

Catálogo inicial de criação de filas: `x-queue-type` classic/quorum; opções
`x-message-ttl`, `x-max-length`, `x-dead-letter-exchange` e `x-dead-letter-routing-key`
apenas quando validadas pela matriz. Inteiros finitos e dentro da faixa do contrato;
nomes válidos e nenhuma chave extra arbitrária. Quorum usa durabilidade e restrições
compatíveis; o broker pode rejeitar argumentos/policies e seu erro deve ser explicado.
Não modificar silenciosamente fila existente para resolver conflito de declaração.
[Propriedades de filas](https://www.rabbitmq.com/docs/queues).

## Adapter de publicação

Candidato: amqplib no main. Abrir conexão apenas após ativação/teste explícito e
canal confirm para publicação; configurar heartbeat e limites segundo broker e
contrato de integração. Não assumir reconexão automática da biblioteca.

Uma publicação de cada vez simplifica a associação de retorno/confirm ao envio.
Usar `mandatory`, tratar retorno sem rota, nack, fechamento e deadline. O booleano
de `publish` indica backpressure, não confirmação do broker; aguardar drain quando
necessário e o callback/confirm correspondente. Confirm não significa processamento
pelo consumidor. Se o resultado ficar ambíguo, apresentar OUTCOME_UNKNOWN e não reenviar.
[API do cliente](https://amqp-node.github.io/amqplib/channel_api.html) e
[confirmações](https://www.rabbitmq.com/docs/confirms).

## Confirmações destrutivas e concorrência

O caso de uso valida alvo e sessão, solicita confirmação nativa ao usuário por uma
porta injetável e revalida generation/alvo depois do diálogo. Não aceitar apenas
`confirmed: true` fornecido pelo renderer. O diálogo identifica ambiente, endpoint
sem segredo, vhost, nome, operação e efeito. Cancelar não envia a escrita.

Usar condições do broker para exclusão quando disponíveis; confirmação não elimina
corridas com consumidores/produtores externos. Purge não é snapshot, rollback ou
remoção garantida de mensagens já entregues. Testes automatizados da política usam
fake de confirmação; diálogos reais recebem teste manual por SO.

## Configuração e segredos

Arquivo JSON local em diretório de dados do usuário, schemaVersion e limite de
tamanho; perfis guardam ID, metadados, endpoints sem userinfo, usuário, referência
de CA e ciphertext opcional. Senha só em memória ou criptografada, nunca em settings
do renderer/localStorage. Escrever de forma atômica e preservar arquivo inválido.

Proteção candidata: API assíncrona safeStorage da versão escolhida. Linux exige
evidência de provider seguro; a existência de API/retorno booleano isoladamente não
prova isso. Se fallback fraco ou provider incerto, manter somente memória até
verificação. Não prometer proteção contra outro processo comprometido do mesmo usuário.
[Detalhes de segurança](../08-security/security-model.md).

## Critérios de arquitetura e evolução

- Renderer e shared não importam main/Node/adapters; preload permanece mínimo.
- Composition root liga casos de uso a adapters; funções puras recebem dados, não Electron.
- Identidade e tokens existentes preservados; navegação e telas detalhadas na Etapa 3A.
- Logs limitados e sanitizados; limites e tempos têm uma fonte em NFR-013–021.
- Estratégia de testes separa fakes, brokers isolados e smoke real do pacote.
- Os sete ADRs estão aceitos; os contratos de implementação continuam exigindo
  aprovação antes de criar diretórios, migrar ferramentas ou integrar ambientes reais.

A resolução e a fronteira foram verificadas no recorte local das etapas 2A/2B.
Ainda não comprovados: providers de credenciais, CA, demais SOs/CPUs, confirmação
destrutiva real e formatos/assinatura de distribuição. Automação Electron continua
experimental. A
[estratégia de testes](../07-testing/test-strategy.md) define os gates futuros.

## Estado da fundação após a execução autorizada da 2A

A estrutura existente foi preservada. Foram adicionados testes próximos das unidades,
configurações na raiz, workflow e smoke em `tools/testing`, conforme contrato.
Instalação, tipagem/lint, testes e pacote/smoke local foram executados; os demais
gates desta arquitetura permanecem pendentes. A conclusão da 2A e seu commit foram aprovados com “Sim”.
Ver [evidências e limitações](../07-testing/foundation-2a.md).

## Organização desktop implementada na Etapa 2B

O contrato físico da 2B foi autorizado após `27e4f95`. Estrutura atual:

```text
src/
  main/
    app.ts                 # composição, sessão, protocolo e ciclo da aplicação
    appWindow.ts           # janela única e política de navegação
    ipc/desktop.ts         # registro único, autenticação e execução limitada
    security/
      desktopPolicy.ts     # URL, DTO e allowlist de recursos
      resources.ts         # recursos locais/MIME/CSP e confinamento por realpath
      session.ts           # permissões, rede Chromium e downloads
  preload/
    index.ts               # entrypoint sandboxed e contextBridge
    desktopApi.ts          # métodos nomeados e contenção de falhas de transporte
  shared/desktop.ts        # DTOs/resultados, sem Node/Electron/React
  renderer/                # interface legada e feedback de erro
misc/window/               # componentes preservados; sem ponte ou handlers legados
tools/testing/              # automação privilegiada, fora da API da aplicação
```

Testes ficam junto das unidades. Tipos compartilhados não importam camadas
privilegiadas; lint restringe imports de Node/Electron/main no renderer e de
Node/main no preload. Isso auxilia manutenção, sem constituir isolamento de runtime.

A ponte `window.bunnies` expõe getInfo, close, quit, minimize, toggleMaximize,
showEditMenu, view com enum limitado e openLink com identificador fixo. Todos
encaminham ao handler estático bunnies:desktop, que valida a janela/frame/página e
o DTO antes de executar. Não há invoke/send genéricos, eventos Electron ou URL
arbitrária. Edição/clipboard usam roles de menu nativo; a UI só solicita abrir esse
menu. Versão/plataforma vêm do main, substituindo metadados mutáveis no DOM.

Resultados de erro têm código, requestId e mensagem fixa, sem stack/path/argumentos.
O fechamento remove a referência à janela, não encerra forçadamente o app macOS;
activate reutiliza/cria a principal e os handlers permanecem registrados uma vez,
com remoção ao sair. Funcionalidades RabbitMQ não foram antecipadas.

Produção usa bunnies://app/app_window/index.html e recursos explícitos, sem servir
preload/maps/package.json. CSP em headers, CSS extraído e sessão sem rede no renderer.
Desenvolvimento usa somente localhost com estilos/HMR permitidos nesse perfil; o
preload tem configuração própria, sem cliente HMR ou shims Node. A mudança de origem
file para bunnies não migra a preferência de tema antiga; o usuário pode escolhê-la
novamente. Ainda não existiam perfis ou credenciais a migrar.

A conclusão da 2B e seu commit foram aprovados por “Aprovado”; [resultados reais](../07-testing/desktop-boundary-2b.md).
Não confundir estes controles locais com homologação dos quatro alvos, integração
segura de broker ou proteção de artefato de release com fuses/assinatura.

## Interface base implementada na Etapa 3B

O contrato da 3B foi autorizado por “Sim” após `c215004`. Conclusão e commit
posteriormente aprovados por “Aprovado”. Estrutura física incremental:

```text
src/renderer/
  App.tsx                         # feedback sanitizado e composição do shell
  shell/
    ApplicationShell.tsx          # navegação local, foco, painel compacto
    NavigationSidebar.tsx         # destinos, bloqueios e preferência de tema
    SessionContextBar.tsx         # estado sem sessão, HTTPS/AMQPS separados
    shell.scss                    # layout/reflow e estilo dos dois destinos locais
  pages/
    ConnectionsEmpty.tsx          # ausência real de perfis e recursos indisponíveis
    About.tsx                     # metadados reais e link fixo do autor
  components/                     # Button, IconButton, Card, StatusMessage, EmptyState, Icon
  styles/Theme.scss               # tokens D3A em CSS externo
src/providers/ThemeMode.tsx        # preferência enum, migração e sinal do SO
misc/window/                      # barra/controles/menus semânticos PT-BR
```

Testes continuam junto das unidades; testes do chrome desktop ficam no renderer
para integração com o include existente do Vitest. Não houve troca de bundler,
roteador, biblioteca visual ou nova camada de domínio. A UI usa estado em memória
e não altera a URL do documento, incluindo ao pular para o conteúdo.

Preferência não sensível `bunnies.theme-preference`: system/light/dark em storage
do renderer. Na ausência de valor novo válido, ler dark-mode 0/1 da mesma origem;
caso contrário, Sistema. Falha de storage mantém uso em memória. Somente Sistema
acompanha prefers-color-scheme, com cleanup do listener. Não há segredo, payload,
perfil ou configuração de broker nesse storage. A limitação de origem file da 2B
permanece; não se criou uma migração de dados do usuário entre origens.

O dialog HTML do painel compacto fornece contenção de foco dentro do Chromium.
Não é uma confirmação administrativa nem nova API da ponte. Operações reais de
broker e confirmação nativa contextual continuam futuras. Main mudou somente as
dimensões iniciais para 1200 × 800; preload/shared/políticas, protocolo e CSP mantidos.

Evidências locais, check/package/smoke, revisão visual e limites estão em
[interface 3B](../07-testing/interface-3b.md). Layout/teclado do alvo local não
homologam os demais SOs, tecnologias assistivas ou os módulos de produto.

## Perfis locais implementados na 4A.1

Execução autorizada por “Autorizo” após `eb535d7`; conclusão/commit aprovados posteriormente por “Aprovado!”. A página `Connections.tsx` substitui
`ConnectionsEmpty.tsx`; `ProfileForm.tsx` usa dialog HTML, labels explícitos e
confirmação de descarte. Navegação continua em memória e sem sessão de broker.

```mermaid
flowchart LR
    UI[Conexões: lista/resumo/formulário] --> P[Preload: quatro métodos de perfis]
    P --> I[Main: janela/frame/URL/DTO]
    I --> S[ProfileService: fila limitada e revisão]
    S --> R[ProfileRepository: JSON atômico]
    S --> M[Senha transitória em memória]
    S --> G[SecretProtection: gate fechado no produto]
```

Código por responsabilidade, sem novas camadas/bibliotecas:

- `src/shared/profiles.ts`: DTOs/códigos/limites e quatro métodos nomeados;
  DesktopApi estende ProfilesApi, preservando as oito operações desktop.
- `src/main/ipc/profiles.ts`: handler estático `bunnies:profiles`, usando a mesma
  verificação de origem da 2B e diálogo nativo de remoção local.
- `src/main/profiles`: validação, erro tipado, arquivo e serviço serializado.
- `src/main/security/secretProtection.ts`: porta assíncrona safeStorage condicionada
  a evidências internas; nenhuma plataforma habilitada no composition root.
- `src/main/app.ts`: compõe o serviço, registra/remover handlers uma vez e descarta
  referências de senha ao encerrar; nenhum transporte de broker.
- `src/renderer/pages/Connections.tsx`, `ProfileForm.tsx` e `profiles.scss`: UI real
  de perfis; testes junto das unidades. O shell bloqueia atalhos de navegação enquanto
  o formulário modal está aberto e mantém contexto de sessão vazio.

O schema v1, conflitos/locks, flags de segredo e limites estão no
[contrato implementado do M01](../04-modules/01-connection-manager.md).
A restauração/rotação do adapter foi testada com fakes; não foi habilitada no produto
nem ligada a transportes inexistentes. Não há provider real comprovado, senha
persistida em texto puro, API genérica ou alteração das políticas CSP/protocolo/sandbox.
Resultados: [4A.1](../07-testing/profiles-4a1.md).

## Ajuda local e documentação — DOC.1

Solicitada diretamente pelo proprietário após aprovar a 4A.1 (`fe4a252`). A entrega
DOC.1 implementa um terceiro destino local, Ajuda, sem novas APIs privilegiadas.
`src/renderer/pages/Help.tsx` importa somente o JSON versionado
`docs/10-user-guide/guide.json`. Renderiza texto, listas e definições com React;
nenhum parser HTML/Markdown ou conteúdo remoto no renderer.

O gerador `tools/docs/user-guide.cjs` produz `docs/10-user-guide/README.md`, linkado
no README principal. `docs:check`, incluído em `check`, falha se houver divergência.
Uma fonte mantém conteúdo equivalente no repositório e no executável offline.
Alterar funções/formulários exige revisar o guia e regenerá-lo. O índice do app
usa botões, foco e scroll; a URL não recebe hash ou caminho novo.

Navegação/ícone seguem tokens/componentes existentes. Informações sobre recursos
indisponíveis foram ajustadas no sidebar/Sobre para refletir o estado real.
Sem mudança de main/preload/shared/IPC, CSP, protocolo, sandbox ou dependências.
O JSON é incluído no bundle; não é servido por um endpoint nem copiado todo o
acervo de engenharia para o pacote. Histórico vivo fica na raiz como
[PROJECTS_STATUS.md](../../PROJECTS_STATUS.md), leitura/atualização exigida no AGENTS.
[Evidências](../07-testing/help-doc1.md).

Conclusão/commit DOC.1 aceitos posteriormente por “Aprovado”, mantendo os limites
registrados. Esse aceite não autoriza integração RabbitMQ ou outra fase.

## CA e probe HTTPS implementados — 4A.2A

Execução autorizada por “Autorizo” ao contrato detalhado; conclusão/commit aprovados
posteriormente por “Aprovado”. Os limites apresentados permanecem registrados.
Doze métodos anteriores preservados; quatro específicos de conexão/CA levam a
`bunnies:connections`, com a mesma autoridade de janela/frame/URL integral.

```mermaid
flowchart LR
    UI[Conexões e formulário] --> P[Preload: métodos nomeados]
    P --> I[Main: IPC autorizado e DTO estrito]
    I --> CA[ProfileCaSelections: diálogo/arquivo/PEM/token]
    I --> T[HttpsTestService: operação por janela/deadline]
    T --> S[ProfileService: snapshot e senha no main]
    S --> R[JSON v1/v2: lock/revision/backup]
    T --> H[httpsProbe: agente TLS dedicado e limitado]
    H --> E[Endpoint salvo: GET whoami]
```

- `security/boundedFile.ts` e `profileCa.ts`: tipo/tamanho, X509/CA/DER estritos,
  seleção opaca por janela, expiração e fingerprints sem caminho/bytes no renderer.
- `profiles/repository.ts`: lê v1/v2, grava v2 explicitamente com backup v1 exato;
  mantém limites/lock/revision. `ProfileService` resolve confiança/token e senha;
  notifica mudanças para invalidar operações, sem event bus genérico.
- `connections/httpsProbe.ts`: somente GET no prefixo do perfil, Basic, validação
  TLS e limites de corpo/headers/JSON; sem sessão, redirect/retry ou proxy herdado.
- `connections/httpsTestService.ts`: reserva de uma operação por janela, deadline,
  AbortController, snapshot/revision e resultado datado. Credencial nunca é DTO de retorno.
- `ipc/connections.ts`: seletor nativo no main, revalidação após await, limpeza em
  reload/crash/fechamento/quit e descarte dos handlers/listeners. Não recebe filepath.
- UI `HttpsTest.tsx` e campos em ProfileForm/Connections; URL fixa e tema/CSP
  preservados. Ajuda usa guia atualizado, sem interpretar corpo de resposta do broker.

CA armazenada é pública; default/custom têm semântica explícita. Não há amqplib,
cliente AMQP, sessão ativa, vhost, polling/reconexão ou mudança do gate de senhas.
Detalhamento: [M01](../04-modules/01-connection-manager.md) e
[evidências/limites](../07-testing/https-4a2a.md).

## Testes HTTPS/AMQPS coordenados — 4A.2B

Contrato 4A.2B autorizado por “Autorizo” em 2026-10-29; conclusão/commit aprovados
em 2026-10-30, incluindo testes reais 4.4.0/4.3.6 e limitações registradas.
Não altera ADRs/stack nem adiciona sessão de trabalho. O antigo HttpsTestService
foi substituído por `connections/connectionTestService.ts`: uma operação por janela,
com modalidade fixa HTTPS/AMQPS, prazos distintos, revision/credencial e invalidação.

`shared/amqpsEndpoint.ts` é parser puro usado pelo main e pela prévia de UI, sem
Node/Electron. Preserva caminho bruto/percent-encoding; não altera schema v2 nem
endurece leitura de perfis antigos. `connections/amqpsProbe.ts` usa apenas
amqplib/callback_api no main, socket próprio, TLS validado, SASL/abertura/close e
nenhum canal. TCP conclui antes de envolver o socket em TLS. Callback de close
permite rejeitar o atalho síncrono de blocked sem confirmação da biblioteca fixada.

Ponte com 18 métodos: acrescenta testProfileAmqps/cancelProfileAmqpsTest, sem URL,
senha ou transporte genérico em argumentos. `ipc/connections` mantém autoridade,
DTO estrito e cleanup. Componente local ConnectionTest com ProfileTests apresenta
resultados separados e exclusão mútua. UI permanece sem sessão e sem recursos de broker.

Especificação/limites em [M01](../04-modules/01-connection-manager.md);
[evidências e limitações](../07-testing/amqps-4a2b.md). Nenhum adapter vai ao renderer.

## Registro histórico — decisão inicial do gate 4A.2C

Contrato 4A.2C/C-01–07 autorizado por “Autorizado” em 2026-10-30, mas seu gate
reproduziu exceções antes de disponibilizar modelo público. Sessão/UI dependentes
não implementadas. Sete ADRs anteriores continuam Accepted;
[ADR-0008](adr/0008-amqp-lifecycle-safety.md) está **Proposed**, recomendando exceção
delimitada para patch local verificável do cliente. Nenhuma dependência/arquitetura
alterada ou correção testada por esse documento.
[Evidências](../07-testing/sessions-4a2c.md).

## Implementação autorizada — 4A.2C/ADR-0008 A

O histórico anterior do gate foi superado pela aprovação explícita da alternativa A
em 2026-10-30. Patch de uma linha verificável por hashes e instalação limpa passou
gate de 30 cenários. Oito ADRs Accepted; sem troca de stack/versão/cliente.

SessionService no main é o dono do contexto e de seus timers/abort/handles. Adapter
amqpsConnection só expõe vhost/flow/close/destroy, nunca modelo/canais. Probes reusam
adapter e ConnectionActivity impede concorrência com sessão. Bootstrap explícito
valida perfil/revision/senha/vhost. Endpoints têm estados, prazos e orçamento próprios;
HTTPS usa whoami a cada cinco segundos após conclusão; AMQP mantém heartbeat.

IPC bunnies:session e evento bunnies:session-state preservam autoridade integral e
DTO estrito; 22 métodos específicos, unsubscribe próprio, nenhum Electron event,
URL/segredo/PEM/modelo entregue. Provider ignora sequence anterior e serializa ações.
Background pausa consultas/negociações/retries, mantendo AMQP já estabelecido;
suspend destrói/invalida. Reload/crash/close/quit e qualquer gravação de perfis
encerram. Stop invalida antes de close≤1s; sem ack reporta liberação local.

Guia/Ajuda descrevem a sessão implementada. Quatro páginas de recursos continuam
desabilitadas. Ver contrato no roadmap e evidências 4A.2C para testes efetivos.

## Decisão apresentada após gate 4B.1 (histórico antes do aceite)

A [ADR-0009](adr/0009-management-vhost-read-contract.md) está **Proposed**, não
Accepted: gate real mostrou paginação de vhosts em HTTP 500 e limites de
permissões/rotas individuais nas duas versões fixadas. Dependentes suspensos
conforme contrato. A proposta de lista completa limitada e presença do vhost
atual derivada desse snapshot exige aprovação; não altera transporte/IPC do
produto atual. Ver [evidências](../07-testing/management-4b1.md). Oito ADRs aceitos
permanecem; não confundir escrita da proposta com decisão aprovada.

## Implementação autorizada — 4B.1 / ADR-0009 A

“Autorizado” aceitou aplicar/testar A e retomar 4B.1 após gate. Gate revisado passou
12 verificações por versão real e liberou serviço/IPC/UI. Nove ADRs Accepted;
registros anteriores Proposed/falha são históricos. Adapter main management/httpsRead
emite somente GET overview projetado e lista vhosts com disable_stats/columns/sort;
body 256 KiB, headers 16 KiB, profundidade 16 e 200 nomes, sem paginação ou GET de
nome individual. Metadata desconhecida é descartada, não retornada ao renderer.

ManagementService obtém perfil/revisão/vhost da SessionService no main, revalida
antes/depois de I/O e vincula operação/owner/generation. Uma leitura administrativa
manual por janela, total 10 s desde aceitação, sem retry/polling administrativo.
Ciclo de sessão/background invalida operações; serviço não altera o estado dos
transportes. Ponte 25 métodos nomeados; canal bunnies:management e respostas
validadas no preload. Painel em Conexões e guia único. Conclusão/commit aprovados
por “Autorizado” em 2026-10-31; resultados/limitações nas evidências. Esse aceite
não homologa demais alvos/HA nem autoriza push ou próxima etapa.
