# Progresso e decisões

## 2026-10-28 — Etapa 0

**Situação:** concluída e aprovada pelo proprietário na resposta “Aprovo”.

A auditoria examinou os 53 arquivos versionados e os quatro commits disponíveis na
base `52077522486403a3d0351341c952ebb69e00b954`. Foram reconstruídos inicialização,
janela, preload, IPC, React, persistência e build; não foi identificada integração
RabbitMQ. Fontes oficiais e metadados npm subsidiaram as propostas e a consulta de
avisos de segurança. A resposta integral da consulta não foi persistida.

Nenhum arquivo foi alterado na Etapa 0. Não houve instalação, execução da aplicação,
build, teste funcional, criação de branch, commit ou push. Não há commit de entrega
da auditoria porque seu contrato exigia somente leitura.

Resultado aprovado: a auditoria e a execução da Etapa 1A. Stack, arquitetura,
matriz tecnológica e MVP permaneceram explicitamente pendentes de decisão.

## 2026-10-28 — Etapa 1A

**Situação:** concluída e aprovada pelo proprietário; commit de entrega autorizado.

Autorização: resposta “Aprovo” ao contrato apresentado ao final da Etapa 0.
Branch existente utilizada: `chore/modernization-app`. HEAD inicial: `5207752`.
Working tree inicialmente limpo.

### Entrega

Foram criados `AGENTS.md` e 11 documentos de visão, auditoria, avaliação tecnológica,
MVP, módulos e continuidade. O [roadmap](roadmap.md) contém a lista completa e o
contrato autorizado. Nenhum arquivo preexistente foi alterado.

As recomendações são identificadas como propostas; a documentação registra riscos
abertos e limitações, sem declarar correções ou homologações inexistentes. Os
documentos individuais de módulos e ADRs estão planejados para etapas autorizadas
posteriores, sem criação de arquivos vazios.

### Verificações da entrega

| Verificação | Resultado |
| --- | --- |
| Git, branch e HEAD antes da escrita | Branch esperada, HEAD `5207752`, working tree limpo |
| Manifesto e lockfile | 38 linhas de dependências conferidas contra o manifesto/lockfile; 910 entradas e 750 nomes de pacotes |
| Inventário e identidade | 53 linhas de inventário conferidas; contagens, tamanhos e hashes dos assets verificados |
| Links locais Markdown | 78 referências verificadas por diagnóstico de leitura com Python, sem links locais quebrados |
| Escopo documental e integridade do legado | Exatamente os 12 arquivos previstos adicionados; os 53 arquivos legados comparados byte a byte com HEAD, sem alteração |
| Whitespace e estrutura dos documentos | Newline, whitespace, tabelas Markdown e delimitadores de blocos verificados, sem erros |
| Critérios do MVP | 15 identificadores registrados; referências verificadas |
| Diagramas Mermaid | Dois blocos com delimitadores verificados; renderização não executada |
| Revisão técnica | Consistência de aprovações, propostas, riscos e limites revisada |
| Aplicação, lint, build e testes funcionais | Não executados: entrega documental, dependências ausentes e execução fora do contrato |
| Commit e push na revisão anterior | Não executados naquela apresentação; commit posteriormente aprovado, sem autorização de push |

Os validadores executam leitura de arquivos e verificações em memória; não houve
instalação de ferramentas nem criação de scripts ou artefatos de teste no projeto.
As referências externas foram registradas com a data da consulta da Etapa 0; a
verificação local de links não garante disponibilidade futura dos sites.

### Aprovação de conclusão e registro

O proprietário respondeu **“Aprovado”** à pergunta de aprovação de conclusão da
Etapa 1A e de registro do commit. A autorização foi aplicada à entrega documental,
incluindo a atualização dos estados e a conferência final do Git. Mensagem aprovada:
`docs(audit): document legacy audit and modernization proposals`.

Registro concluído no commit `c292b35b4b75c53695fbef6beab7d573b688d8c0`. A base anterior é
`52077522486403a3d0351341c952ebb69e00b954`. Não houve push ou alteração da aplicação.

### Próxima ação

Na conclusão da 1A, a próxima ação era apresentar o contrato da 1B e aguardar
autorização específica; a autorização posterior está registrada abaixo.

## 2026-10-28 — Etapa 1B

**Situação:** planejamento concluído e aprovado; sete ADRs Accepted, MVP e requisitos
aceitos; commit de entrega autorizado pelo proprietário.

O proprietário respondeu **“Autorizado”** ao contrato apresentado após o commit da
1A. A pergunta opcional de ambientes recebeu **“Nada definido”**. Assim, versões,
SO/CPU, autenticação e metas foram elaborados como propostas de referência e depois
aceitos explicitamente na aprovação de conclusão registrada abaixo.
Branch: `chore/modernization-app`; HEAD inicial `c292b35`; working tree inicialmente limpo.

### Entrega

Doze novos documentos e sete atualizados, conforme [contrato](roadmap.md): requisitos,
arquitetura conceitual, sete ADRs Proposed, testes e segurança, além de alinhamento
do MVP e das referências operacionais. Inventário e quatro documentos históricos
de auditoria preservados; nenhuma alteração de implementação.

O plano contém 38 FRs (30 MVP e oito posteriores), 30 NFRs, 15 critérios de MVP,
12 cenários de teste e 12 controles de segurança. Esses números medem documentação,
não funcionalidades ou testes executados. A estrutura de código não foi definida
como definitiva antes da aprovação da stack.

### Evidências e decisões propostas

Consultados registry npm, Node, Electron, RabbitMQ e documentação das ferramentas,
sem instalar pacotes. O plano candidato usa TS 6.0.3 com parser compatível; propõe
ESLint 10 e retirada dos dois plugins legados sem suporte declarado, com trade-off
explícito. Electron 45.1.0 exige revisão do preload e de APIs de proteção de segredo.
Os metadados de release confirmaram assets dos quatro alvos, sem baixar os binários.

A árvore completa ainda não foi resolvida. APIs do amqplib, provider Linux,
automação Electron experimental, compatibilidade real e metas são gates futuros,
não verificações concluídas. As fontes e versões estão na
[avaliação tecnológica](../03-architecture/technology-evaluation.md).

### Verificações da apresentação da Etapa 1B

| Verificação | Resultado efetivamente obtido |
| --- | --- |
| Git e escopo | HEAD `c292b35` preservado; 12 arquivos novos e sete modificados, todos no contrato; sem staging/commit |
| Integridade | Outros 58 arquivos versionados comparados byte a byte com HEAD, sem alteração; incluem 53 arquivos legados, quatro documentos de auditoria e visão do produto |
| Links e estrutura | 24 documentos, 152 links locais válidos e 57 tabelas com colunas consistentes; whitespace e delimitadores verificados |
| IDs e rastreabilidade | 38 FRs, 30 NFRs, 15 MVPs, 12 cenários T e 12 controles SEC; referências válidas; os 30 FRs de MVP e os 30 NFRs vinculados a cenários |
| ADRs | Sete registros com campos obrigatórios e status Proposed; nenhum Accepted |
| Diagramas | Três blocos Mermaid com delimitadores verificados; renderização não executada |
| Revisão técnica | Fronteiras, efeitos de escrita, limites, matriz, segredos e distinção entre proposta/evidência revisados |
| Aplicação | Instalação, typecheck, lint, testes funcionais, brokers/containers, benchmarks e builds não executados |

Os diagnósticos usaram Python em memória e comandos Git de leitura, sem scripts ou
artefatos adicionais no projeto. Metadados foram consultados via HTTPS validado;
intervalos de engines/peers e disponibilidade de assets não comprovam resolução
transitiva ou homologação. A validação de links locais não garante disponibilidade
futura de fontes externas. Na apresentação, nenhum commit da 1B ou push havia sido realizado.

### Aprovação de conclusão e decisões

O proprietário respondeu **“Aprovado”** ao pedido explícito de aceite dos ADRs
0001–0007, MVP, requisitos/limites e conclusão da 1B, autorizando o commit
`docs(architecture): define desktop architecture and requirements`.
Os sete ADRs passaram de Proposed para Accepted; requisitos, matriz candidata,
MVP e estratégias foram marcados como aprovados, sem declarar implementação ou
homologação. A sincronização inclui também `product-vision.md`, totalizando 12
arquivos novos e oito modificados em relação a `c292b35`.

O registro integra o próprio commit de entrega; identificar seu SHA com
`git log -1 --format='%h %s' -- AGENTS.md docs`. Nenhuma instalação, alteração de
código, execução da aplicação ou publicação foi realizada nesta conclusão.

Conferência após registrar a aprovação: 24 documentos, 152 links locais válidos,
57 tabelas e sete ADRs Accepted, com campos e referências verificados. Os 57 arquivos
versionados fora da entrega foram comparados byte a byte com HEAD, incluindo os 53
arquivos legados e os quatro documentos de auditoria; todos permanecem intactos.
A rastreabilidade dos 30 FRs de MVP e 30 NFRs a cenários foi preservada. O aceite e
essa conferência não equivalem à execução dos testes planejados.

### Próxima ação

Conferir o registro do commit aprovado e apresentar o contrato da 2A, aguardando
autorização específica. As decisões aceitas não autorizam implementação automática.

## Etapa 2A — Fundação técnica

Data: 2026-10-28. Base `97cd313`, branch `chore/modernization-app`, limpa antes da
execução. O proprietário respondeu **“Autorizado”** ao contrato apresentado depois
do commit da 1B, incluindo instalação de dependências e diagnósticos que geram
artefatos. Na apresentação, a entrega estava pronta para revisão, sem aprovação de
conclusão/commit; o aceite posterior está registrado abaixo.

### Entrega implementada

Node 24.22.1/npm 11.19.1, Electron 45.1.0, Forge 8.0.1, React 19.3.1, TS 6.0.3,
ESLint 10.13.0 e tooling necessário fixados; lockfile regenerado e reproduzido sem
peers forçados. Scripts explícitos de qualidade, ESLint flat, TypeScript estrito,
Prettier, Vitest/Testing Library e workflow inicial. Nenhuma biblioteca de integração
RabbitMQ ou infraestrutura remota foi implementada.

Ajustes mínimos de tipos/nulabilidade/hooks, restauração de tema em StrictMode e
metadados de versão resilientes; versão do app incluída no bundle. Sass usa `@use`
no import existente. Mantidos estrutura, aparência e assets. Removidos loaders e
configurações residuais sem uso, plugins de lint sem peers compatíveis e RPM adiado.
O packager usa main `.webpack/main/index.cjs`, exigido pelo Forge 8.

### Verificações efetivamente executadas

| Verificação | Resultado |
| --- | --- |
| Instalação limpa | `npm ci` status 0, sem peers forçados; scripts transitivos revisados/negados quando desnecessários; nenhum pendente na árvore local |
| Tipagem/lint/formatação | `npm run check` status 0; TypeScript estrito, ESLint sem warnings e código formatado |
| Testes | 11 testes em dois arquivos passaram: tema/teclado/StrictMode/storage indisponível e metadados de versão inválidos/ausentes |
| Desenvolvimento | Preload e renderer iniciaram com perfil temporário; servidor localhost; processos criados pelo diagnóstico encerrados |
| Pacote e smoke | `npm run package` e `npm run smoke:package` status 0 em macOS 27.0.1 arm64/Electron 45.1.0; versão 1.0.0, renderização, tema após reload e perfil isolado |
| Revisão de artefato | Captura aberta e conferida; ASAR com 11 entradas, main presente, versão correta e sem arquivos de teste |
| Audit | Seis entradas no tooling: duas low/quatro moderate; zero high/critical. `--omit=dev` retornou zero; não comprova ausência de risco de runtime |
| CI | Workflow com sintaxe YAML lida por js-yaml, SHA das actions conferido em releases oficiais e permissões de leitura; execução remota não realizada |
| Documentação | 27 documentos incluindo README/AGENTS, 173 links locais e 61 tabelas conferidos; sem erros de links, delimitadores ou whitespace |
| Preservação | Assets, licença e quatro arquivos de auditoria histórica comparados byte a byte com HEAD, intactos; sem commit/push |

Falhas intermediárias corrigidas: ERESOLVE ao reconciliar o lock legado, main do
Forge agora explícito, comparação de aliases `/var`/`/private/var` no smoke e warning
Sass. Um diagnóstico de desenvolvimento atingiu o timeout durante preparação do
binário; a repetição com cache observou preload/renderer. Não se tratou de gate
aprovado antes dessa confirmação.

### Limitações e revisão técnica

O host macOS 27.0.1 não homologa macOS 14, x64, Windows 11 ou Ubuntu. Nenhum maker,
instalador, assinatura/notarização, broker, container ou teste de credencial/TLS foi
executado. A CI ainda depende de envio autorizado e runners disponíveis. O pacote
é de desenvolvimento, não release para distribuição. Playwright Electron continua
experimental; não foram implementados fuses de release.

A revisão conferiu fronteiras do escopo, manifesto/lock, comandos e erros, testes
comportamentais, cleanup do próprio perfil temporário, ASAR e preservação da
identidade/histórico. A 2B ainda precisa resolver sandbox, IPC, navegação, CSP e ciclo
desktop; não alegar que atualizar dependências fecha esses riscos. Advisories de
deepmerge/uuid e warnings dos makers estão registrados, sem downgrade automático
ou override que burle a árvore.

Detalhes reproduzíveis: [evidências da 2A](../07-testing/foundation-2a.md) e
[comandos/convenções](../06-development/coding-standards.md).

### Próxima ação

O proprietário respondeu **“Sim”** à pergunta explícita sobre aprovar a conclusão
da 2A e autorizar `chore(setup): modernize desktop development foundation`.
O aceite inclui a entrega apresentada e suas limitações registradas; não homologa
os outros alvos nem resolve os controles pendentes da 2B. A sincronização da
aprovação modifica somente documentação, preservando o código já verificado.

Registrar/conferir o commit aprovado e apresentar o contrato proposto da 2B, que
permanece sem autorização. O registro integra o próprio commit da 2A; obter seu SHA
com `git log -1 --format='%h %s' -- AGENTS.md docs`. Nenhum push foi realizado.

Conferência da aprovação: 27 documentos, 173 links locais e 62 tabelas consistentes
(inclui o contrato proposto da 2B); whitespace, lock/manifesto e preservação de assets,
licença e auditoria histórica verificados. Nenhuma alteração adicional de código
foi feita ao registrar o aceite; os testes da apresentação não foram repetidos.

## Etapa 2B — Fronteira segura e ciclo desktop

Data: 2026-10-28. Base `27e4f95`; branch `chore/modernization-app`, inicialmente limpa.
O proprietário respondeu **“Autorizado”** ao contrato da 2B apresentado após concluir
a 2A. Na apresentação da entrega, conclusão e commit ainda aguardavam aprovação;
o aceite posterior está registrado abaixo.

### Resultado implementado

Preload movido para src/preload com ponte mínima window.bunnies; contratos em
src/shared sem Node/React; autenticação de janela/frame/página e DTO estrito no main.
Ponte/IPC legados retirados. Recursos por protocolo local com allowlist, realpath,
MIME/nosniff e CSP de produção; CSS extraído por mini-css-extract-plugin 2.10.2, única
dependência direta adicionada. Sandbox/context isolation ativos, navegação, popups,
webviews, permissões, rede Chromium/file e downloads restritos.

A revisão reduziu a edição a um menu nativo: a UI não pode solicitar copiar/colar
diretamente por IPC. Links externos usam apenas identificador fixo do destino
preexistente. Erros têm mensagens fixas e tratamento na UI; versão/plataforma vêm
do main, com controles existentes apropriados ao SO. Ciclo e registro de handlers
permitiram reabrir a principal sem duplicação. O ciclo WindowFrame/Titlebar acabou
com passagem explícita de propriedades. Nenhuma integração RabbitMQ foi antecipada.

### Verificações efetivas

| Verificação | Resultado |
| --- | --- |
| Instalação limpa | npm ci status 0, 799 pacotes, sem peers forçados; nenhum script transitivo pendente |
| Qualidade | Typecheck/lint/formatação status 0; 65 testes em oito arquivos passaram |
| Artefato local | package/smoke status 0 em macOS 27.0.1 arm64/Electron 45.1.0 |
| Isolamento e IPC reais | Sem Node no renderer; flags de sandbox/context isolation e guarda do preload; janela estrangeira real rejeitada; argumentos arbitrários/grandes rejeitados; DevTools negado no pacote |
| CSP/recursos/rede | CSS/logo presentes; script/style inline e eval bloqueados; preload/map/config não servidos; fixture de rede local não recebeu requisições da UI ou sessão |
| Navegação e ciclo | Popup/navegação bloqueados; Notification negada; duas recriações da principal e activate repetido sem duplicação |
| Desenvolvimento | Ponte, renderização e tema passaram em perfil temporário; HMR no renderer e sem shims/cliente HMR no preload |
| Revisão visual | Captura do pacote aberta e conferida; identidade/assets e estilos existentes preservados; controles seguem a plataforma |
| Dependências | Audit permanece com seis entradas low/moderate, sem high/critical; nenhuma correção automática forçada |
| CI | Smoke adicional preparado no job macOS após package; execução remota não realizada |

Os testes de políticas cobrem também frames/origens inválidos, schemas, permissões,
downloads, erros sanitizados e escape por symlink. Não confundir fakes com todos os
fluxos nativos reais: edição por teclado passou, mas popup e UX nativa por SO ainda
pedem revisão manual. São evidências parciais de T-01/T-10/T-12, não de todo o MVP.

### Revisão e documentação

Arquitetura, segurança, comandos, testes, AGENTS e estado sincronizados. Os 24 links
de código nos quatro documentos de auditoria agora apontam ao commit original
5207752, com nota de contexto histórico. Texto dos achados preservado e comparação
normalizada executada; assets/licença não foram alterados. Isso mantém as evidências
consultáveis após a remoção dos cinco arquivos da ponte antiga.

A revisão conferiu importações entre processos, exposição da ponte, fronteiras
IPC, política de recursos/CSP, rejeições assíncronas, edição nativa e cleanup das
fixtures. Os ajustes intermediários do harness e suas razões estão nas
[evidências da 2B](../07-testing/desktop-boundary-2b.md); nenhum controle foi desligado
para obter sucesso. Logs/capturas são artefatos locais ignorados, não dados de broker.

Permanecem sem execução: demais SOs/CPUs, mínimo macOS 14, CI remota, brokers,
credenciais, TLS, pentest, benchmark, acessibilidade completa, instaladores e
assinatura/notarização/fuses de release. Não houve commit, push ou publicação na 2B.

### Próxima ação autorizada

O proprietário respondeu **“Aprovado”** à pergunta explícita sobre aprovar a
conclusão da 2B e autorizar `fix(desktop): secure Electron process boundaries`.
O aceite inclui as limitações apresentadas; não autoriza executar a 3A.

Registrar/conferir o commit aprovado e apresentar o contrato proposto da 3A.
Este registro integra o próprio commit da 2B; obter seu SHA com
`git log -1 --format='%h %s' -- AGENTS.md docs`. Nenhum push foi realizado.

Conferência final documental: 28 documentos incluindo README/AGENTS, 167 links
locais válidos e 65 tabelas consistentes; manifesto/lock sincronizados. Captura
final conferida; ASAR com 12 entradas, CSS separado, sem testes e preload com
require externo somente de electron. Checksum registrado nas evidências.

### Conferência após a aprovação

Foram encontradas cinco alterações locais posteriores à apresentação: os três
assets existentes modificados e dois novos PNGs em assets/logotipos. Elas não foram
produzidas por esta execução, não integraram o pacote testado e foram preservadas
fora do commit autorizado da 2B. A working tree não ficará limpa por causa desses
assets; não reverter nem incluí-los sem um recorte de entrega apropriado.

A sincronização da aprovação altera apenas documentação; implementação e resultados
da apresentação mantidos. A proposta da 3A prevê avaliar os recursos visuais atuais,
sem adotá-los ou editar o código antes de autorização própria.

Conferência da aprovação: 28 documentos, 167 links locais válidos e 66 tabelas
consistentes, incluindo o contrato proposto da 3A. Achados históricos preservados
(com links de código no commit auditado), manifesto/lock e whitespace conferidos.
Os 56 arquivos da entrega foram separados explicitamente dos cinco assets locais;
nenhuma implementação adicional ou repetição de testes nesta sincronização.

## Etapa 3A — Navegação e design system

Data: 2026-10-28. Execução autorizada por **“Autorizo”** após a apresentação do
contrato da 3A. Git inicialmente limpo em `39234fa`, commit posterior que registrou
os cinco assets antes pendentes; a entrega da 2B está em `a550731`. Preservado esse
histórico, sem pull/rebase, criação de branch ou push pelo agente.

Status final: **concluída e aprovada**. Após a apresentação abaixo, a resposta
“Aprovado” aceitou D3A-01–08 e autorizou conclusão/commit; a 3B não está autorizada.

### Proposta entregue

Dois documentos especializados: navegação com fluxos/estados/rastreabilidade dos
30 FRs do MVP e design system com inventário, alternativas, tokens, componentes,
interação, temas e regras de reflow/foco. Direção recomendada Proposed: neutros
com acentos laranja, cinco destinos e contexto fixo de ambiente/conexão/vhost;
Sistema/Claro/Escuro e rótulos PT-BR com termos e identificadores RabbitMQ intactos.

Cinco SVGs autocontidos e cinco previews PNG: Conexões sem sessão, Visão geral
parcial, Filas em produção, conteúdo de confirmação nativa em 1024 × 700 e folha
visual do design system. Dados sintéticos; nenhum botão executa operações. Não
houve substituição/recoloração de logo ou mudança em fontes/config/assets do app.

A comparação favorece sidebar curta com contexto fixo sobre árvore de brokers;
favorece acento laranja ligado à marca atual sobre manter azul como acento principal.
Azul continua como informação/link/foco no tema claro. Isso não constitui aprovação
do novo design nem seleção de biblioteca UI; nenhuma dependência foi instalada.

### Verificações efetivamente executadas

| Verificação | Resultado |
| --- | --- |
| Inventário visual | Cinco assets inventariados; PNGs inspecionados visualmente e dimensões/formatos/alpha/hashes lidos dos arquivos; PNGs pequenos idênticos |
| Contraste | 48 pares aprovados em luminância sRGB, sem arredondar para decidir; branco sobre #FF6600 medido em 2,94:1 e rejeitado para texto de botão |
| Rastreabilidade | Os 30 FRs de MVP mapeados a destinos/padrões; FR-031–038 não ganham funcionalidades antecipadas |
| Renderização | Cinco SVGs renderizados em PNG por Electron 45.1.0/Playwright já instalados; captura/inspeção com perfil temporário e rede externa bloqueada |
| Layout | Nenhum texto/shape fora das cinco pranchas na inspeção geométrica; previews abertos e conferidos visualmente |
| Coerência | Conexões sem status verde fictício; HTTPS/AMQPS separados; produção textual/simbólica; métricas com escopo/instante; Cancelar padrão na confirmação; sem inspeção/consumo implícitos |
| Escopo | Sete documentos existentes alterados e 16 arquivos documentais/visuais novos; hashes dos outros 91 arquivos versionados preservados, incluindo fontes, ferramentas, manifesto/lock e assets |

A revisão acrescentou bloqueio explícito da navegação dependente sem sessão,
esclareceu o resumo de perfil como somente leitura, alinhou números das filas e
incluiu o contraste do texto dos botões destrutivos. O cálculo inicial tinha
46 pares; a versão final tem 48, todos com limiar atendido.

O auxiliar de render inicial não navegava a janela e a captura oculta atingiu
timeout. Foram corrigidos apenas auxiliares temporários em out: carregar documento
inicial, usar janela de render e capturar o viewport em escala CSS. As cinco
exportações finais passaram. Isso não é falha/teste da aplicação Bunnies, que não
foi iniciada nesta etapa; nenhum controle de segurança do produto foi relaxado.
Metadados foram obtidos com sips/leitura PNG pela biblioteca padrão, sem instalar Pillow.

Conferência final: 31 documentos Markdown, 207 links locais válidos e 82 tabelas
consistentes; os três JSONs passaram no Prettier instalado. Os 48 contrastes foram
recalculados a partir dos tokens. XML, dimensões SVG/PNG e bytes incorporados da
marca foram conferidos; os cinco previews finais foram abertos para revisão visual.
HEAD permanece em `39234fa`, index vazio e nenhuma alteração fora do recorte documental.
O primeiro filtro de rastreabilidade também capturou a menção de exclusão FR-031;
restringido às linhas da tabela, confirmou os 30 requisitos do MVP sem mudar o produto.

### Limites e continuidade

Pares de cor e imagens estáticas não homologam acessibilidade da aplicação, zoom
real, reflow, navegação, foco, diálogo nativo, persistência de tema ou SOs/CPUs. A
barra de janela é esquemática e o diálogo só ilustra conteúdo; sua execução futura
permanece no main com revalidação contextual. A 3B deverá selecionar testes T-10
apropriados; módulos de broker mantêm seus contratos/gates.

Não foram executados suíte funcional da aplicação, build/package, brokers, TLS,
cofre, benchmark ou CI. Os resultados da 2B não foram reinterpretados como novos
resultados sobre os logos de 39234fa. Sem consumo/ack/requeue, histórico persistente,
SaaS, servidor próprio ou versão web. Nada foi staged/commitado/publicado nesta entrega.

Referências: [navegação](../03-architecture/navigation.md),
[design system](../03-architecture/design-system.md),
[mockups e verificações](../03-architecture/ui-proposals/README.md).

### Solicitação apresentada ao proprietário

Apresentar as decisões D3A-01–08 e os mockups para aprovação da direção/design,
conclusão da 3A e commit sugerido
`docs(design): define desktop navigation and design system`. Somente após o aceite
registrar esse commit e apresentar o contrato da 3B; não implementar a interface
automaticamente com base nos mockups.

### Aprovação e contrato seguinte

O proprietário respondeu **“Aprovado”** à pergunta explícita sobre D3A-01–08,
conclusão da 3A e o commit `docs(design): define desktop navigation and design system`.
Navegação, design system, tokens e referências operacionais passam a Accepted;
mockups/PNGs e valores medidos permanecem como apresentados. Não se trata de
implementação ou homologação do design.

Preparado no [roadmap](roadmap.md) o contrato **Proposed** da 3B: shell e contexto
sem sessão, temas e migração de preferência, pequenas primitivas, teclado/reflow,
adaptação da barra da janela e verificações locais com ferramentas existentes.
Sem nova dependência, IPC, módulo RabbitMQ ou alteração da marca. Não executar
a 3B antes de autorização própria; o aceite do recorte D3A-08 não a substitui.

A sincronização do aceite altera somente os documentos/estados da entrega 3A e
três campos status em JSON; sem recalcular imagens ou repetir testes da aplicação.
O commit de entrega contém este registro e o contrato seguinte; consultar seu
hash em `git log -1`. Nenhum push foi solicitado ou executado.

Conferência do aceite: 31 documentos, 210 links locais válidos e 83 tabelas
consistentes; oito decisões D3A Accepted, contrato 3B com todos os campos e status
Proposed, 48 contrastes e cinco pares SVG/PNG conferidos. Os três JSONs passaram
no Prettier; whitespace validado. O recorte permanece sete documentos existentes
e 16 artefatos novos, com hashes dos outros 91 arquivos versionados preservados.

## Etapa 3B — Interface base desktop

Data: 2026-10-28. Contrato autorizado por **“Sim”**, após o commit `c215004` e
apresentação da proposta. Git inicialmente limpo, branch `chore/modernization-app`.
Status inicial: execução em andamento; conclusão/commit e etapa 4A não autorizados.
Escopo: shell, temas, pequenas primitivas, estados sem sessão e verificações locais.
Sem nova dependência, integração RabbitMQ, mudança de marca ou nova API privilegiada.

### Entrega da execução autorizada

Status final: **concluída e aprovada** por “Aprovado”, após a apresentação abaixo.
Shell com cinco
destinos, contexto fixo sem sessão e estados HTTPS/AMQPS não iniciados; Conexões
vazia e Sobre com versão real/link fixo do autor. Quatro destinos de broker
aria-disabled com razão, sem perfis/contadores sintéticos na execução normal.

Tokens D3A em CSS externo; temas Sistema/Claro/Escuro e migração da chave dark-mode
0/1 na mesma origem para bunnies.theme-preference. Valor novo válido prevalece;
sem preferência válida, Sistema. Falha de storage mantém uso em memória; listener
do SO removido ao mudar modo/desmontar. Não há persistência de perfil/segredo/payload.

Button/Card modernizados, IconButton/StatusMessage/EmptyState e ícones geométricos
pequenos; sem biblioteca UI nova ou edição dos logos. Menus/controles de janela
semânticos em PT-BR. Sidebar compacta e dialog HTML com foco contido/Escape/retorno,
controle de pular conteúdo e Cmd/Ctrl+5 fora de edição, preservando a URL fixa.
O dialog do shell não substitui confirmação privilegiada do main.

### Verificações executadas

| Verificação | Resultado |
| --- | --- |
| npm run check | Status 0: TypeScript estrito, lint sem warnings, 82 testes em 11 arquivos e Prettier |
| npm run package | Status 0, macOS arm64; CSS extraído, preload separado |
| npm run smoke:package | Status 0 final, executável empacotado com perfil temporário próprio e cleanup |
| Preferência | Sinal de tema do SO emulado; Claro/Escuro persistem em reload; migração real 0/1 no perfil temporário; inválidos/storage indisponível e listeners no jsdom |
| Navegação/teclado | Sobre/Conexões e Cmd/Ctrl+5, URL invariável, heading com foco; Tab/Shift+Tab/Escape no painel, retorno ao gatilho e menus acessíveis |
| Geometria | Capturas revistas em 1440 × 900, 1024 × 700 e 800 × 600; sidebar 224/64 px; zoom Chromium 2 e acesso por rolagem sem overflow horizontal do documento |
| Desktop | Botões reais de minimizar/maximizar; close/reabrir duas vezes; regiões drag/no-drag e edição/zoom preservados |
| Contraste | 60 pares: 48 tokens do CSS computado e 12 estados default/disabled de botões; todos atendem seus limiares sem arredondamento |
| Segurança 2B | Asserções preservadas e executadas, incluindo sandbox/context isolation, oito métodos, CSP, recursos, rede/nav/permissões e janela estrangeira |
| Escopo | Assets, manifesto/lock, preload/shared e políticas preservados; main/appWindow só muda dimensões iniciais; sem nova API ou integração RabbitMQ |

Host macOS 27.0.1/arm64 (Apple M1, 8 GiB), Node 24.22.1/npm 11.19.1,
Electron 45.1.0/Forge 8.0.1. ASAR 752078 bytes, SHA-256
c79eebc775e29e92dbc365153f214f0f66a4337fae69ee072637597e885731be.
Resultados/capturas em out, ignorados; detalhes no documento de evidências.

### Revisão técnica, falhas e limites

Corrigidos imports/opções de queries dos novos testes e globals do harness no lint.
Smoke passou a consultar select por papel/nome acessível e normalizar caixa de hex;
nenhuma regra/limiar de segurança foi relaxada. Os testes de atalhos apontaram close
em dialog já fechado; o handler agora verifica open. Revisão corrigiu traços do
ícone de tema e hover do destino ativo. Disabled/primary usa superfície neutra legível.

Captura CDP no zoom recortava a superfície física; harness usa captura nativa e
aguarda fechamento/dois frames. Tentativas de selecionar no menu nativo com
setas/Enter não efetivaram mudança e atingiram timeout; foco/rolagem e seleção do
valor foram verificados por selectOption. A interação de teclado desse menu fica
explicitamente pendente de revisão manual por SO. Processos/perfis dos testes foram
encerrados/limpos; nenhuma configuração real do host ou broker foi alterada.

Sem homologação dos outros SOs/CPUs, leitor de tela/WCAG, p95, CI remota, makers,
assinatura/notarização ou atualização automática. A matriz e avisos de dependências
anteriores não foram reavaliados. Sem perfis/cofre, clientes HTTP/AMQP, operações
RabbitMQ ou fixtures instaladas como sessão real. Demais padrões da 3A continuam
planejados para os casos de uso, sem tabelas/formulários complexos antecipados.

Evidências: [interface 3B](../07-testing/interface-3b.md). Documentação de arquitetura,
design/navegação, produto/módulos, desenvolvimento/testes e AGENTS sincronizada.

Conferência final: 32 documentos Markdown, 221 links locais válidos e 86 tabelas
consistentes. Diff com 32 arquivos existentes alterados e 14 novos dentro do
contrato; 30 arquivos protegidos mantêm seus hashes. Mockups/dados da 3A preservados
(somente README ganhou o vínculo às evidências). ASAR com oito arquivos, sem
testes/documentação, preload requer apenas electron. HEAD c215004 e index vazio.

### Solicitação de aprovação apresentada

Apresentar resultados e a limitação do menu nativo de tema por teclado para aprovação
de conclusão da 3B e do commit sugerido
`feat(desktop): implement application shell and themes`.
Somente após esse aceite registrar o commit e apresentar contrato próprio da 4A;
não executar perfis/conectividade automaticamente. Nenhum commit ou push nesta entrega.

### Aprovação e proposta seguinte

O proprietário respondeu **“Aprovado”** à pergunta explícita sobre conclusão da
3B e o commit `feat(desktop): implement application shell and themes`, após a
apresentação dos resultados e da limitação manual do seletor de tema. Aprovação
registrada em evidências, arquitetura/design, produto, instruções e estado. A
pendência do seletor e a homologação dos demais SOs permanecem; não foram resolvidas
por documentação ou por esse aceite.

Preparado no [roadmap](roadmap.md) o contrato **Proposed** da **4A.1 — Perfis locais
e proteção de credenciais**, propondo dividir a 4A para revisar CRUD/JSON/segredos
sem rede antes dos testes de conectividade/sessão da 4A.2. O contrato da 4A.1 cobre
gates de provider, alternativa em memória, novos DTOs/IPC nomeados e testes isolados;
CA customizada e broker ficam fora desse primeiro incremento.

Consulta somente de leitura à documentação oficial de safeStorage e aos tipos do
Electron 45.1.0 instalado confirmou as APIs candidatas. Nenhum cofre, provider,
credencial, configuração do SO ou broker foi acessado para preparar o contrato.
Não foi criada implementação, DTO ou dependência da 4A.1.

A sincronização do aceite altera somente documentação; fontes e ferramentas da
entrega apresentada foram registradas antes desses ajustes para conferir seus
hashes. Testes da aplicação não foram repetidos por mudança documental; resultados
e checksum continuam os efetivamente obtidos na apresentação. O commit de entrega
inclui este registro e o contrato seguinte; consultar o hash em `git log -1`.
Nenhum push solicitado ou executado.

Conferência do aceite da 3B: os 46 arquivos continuam no recorte apresentado;
hashes dos 33 arquivos de código/ferramentas da entrega preservados, assim como
30 arquivos protegidos da base e o ASAR testado. 32 documentos Markdown, 222 links
locais válidos e 87 tabelas consistentes; whitespace conferido. Contrato da 4A.1
com todos os campos, status Proposed e execução não autorizada. Nenhuma nova
implementação ou repetição de teste funcional na sincronização deste aceite.

## 4A.1 — execução autorizada

O proprietário respondeu **“Autorizo”** após a proposta apresentada em `eb535d7`.
Git limpo na branch `chore/modernization-app`; sem criar branch ou fazer push.
Autorizados CRUD de perfis locais, JSON versionado/limitado/atômico, proteção
condicionada com alternativa em memória, IPC específico, interface e testes.
Não autorizados rede/brokers, novas dependências, 4A.2 ou commit sem aceite final.

### 4A.1 — entrega implementada para revisão

CRUD local real de perfis no main, JSON v1 com limites 50/2 MiB, revisões/lock e
escrita atômica; senha transitória em memória, keep/replace/remove explícitos e
preservação após falha. Adapter safeStorage assíncrono condicionado a provas; nenhum
alvo habilitado para persistência e nenhum acesso ao cofre real. Ciphertext existente
é preservado, sem devolução ao renderer. Sem nova dependência, cliente ou rede RabbitMQ.

Ponte ampliada de oito para 12 métodos nomeados, com canal de perfis e autoridade
janela/frame/URL/DTO. Confirmação nativa de remoção local com Cancelar padrão e
revalidação. UI lista/resumo/formulário substitui o estado vazio; produção explícita,
sem sessão automática, labels/foco, descarte e temas/zoom preservados.

Check passou: 130 testes em 17 arquivos, typecheck, lint e formatação. Package,
smoke base e smoke de perfis passaram em macOS 27.0.1 arm64. Reinício completo
preservou metadados e descartou senha. Sentinelas ausentes em disco/DTO/storage/pacote;
arquivo inválido preservado. 60 contrastes base mantidos; capturas revisadas em
claro/escuro e zoom 200%. ASAR 774315 bytes, SHA-256
`f5085b0648745ed5285bdc1eb4a6285a4b5818c04d108d0852d49b0c45fa9acb`.

Limitações mantidas: provider real/rotação/reopen/release sem prova; memória é a
alternativa autorizada. Diálogo nativo visual só simulado no main, revisão manual
pendente; seletor nativo de tema, leitores de tela e demais SOs/CPUs não homologados.
Stale lock não é apagado automaticamente; lock cooperativo não é CAS para editor
externo arbitrário; sem garantia contra perda de energia/zeroização de strings.

[M01](../04-modules/01-connection-manager.md), [evidências](../07-testing/profiles-4a1.md),
arquitetura/segurança/testes/desenvolvimento/produto/módulos e estado sincronizados.
Pronto para solicitar aprovação de conclusão da 4A.1 e do commit
`feat(connections): implement local profiles and transient credentials`.
Nenhum commit/push executado; 4A.2 não iniciada e depende de contrato/autorização próprios.

Conferência final: 33 documentos Markdown, 233 links locais válidos e 92 tabelas consistentes; whitespace verificado. Recorte de 41 arquivos (22 existentes/19 novos); 26 arquivos protegidos conferidos byte a byte com HEAD. Index vazio, HEAD `eb535d7`; sem commit ou push.

### 4A.1 — conclusão aprovada

O proprietário respondeu **“Aprovado!”**, autorizando conclusão e commit
`feat(connections): implement local profiles and transient credentials`.
Conferidos os hashes dos 41 arquivos apresentados antes da sincronização do aceite;
sem implementação adicional na 4A.1. Resultados/checksum apresentados mantidos,
sem repetir testes funcionais por mudança documental. A mesma mensagem autoriza
uma Task separada de histórico vivo/guia/Ajuda; não autoriza 4A.2 ou push.

## DOC.1 — histórico vivo, guia do usuário e Ajuda offline

Após “Aprovado!” para conclusão/commit da 4A.1, o proprietário solicitou explicitamente
PROJECTS_STATUS vivo, leitura/atualização no AGENTS e guia no README/no aplicativo.
A 4A.1 foi registrada em `fe4a252`; sua implementação apresentada foi preservada.
DOC.1 é entrega separada, executada por essa autorização direta, sem iniciar 4A.2.

Criados histórico vivo e regras obrigatórias, guia JSON com 11 tópicos, gerador
Markdown e docs:check integrado ao check. Ajuda React usa a mesma fonte offline,
sem HTML arbitrário/URL nova/rede/IPC/dependências. Navegação/ícone/estado de
indisponibilidade e Sobre acompanham os componentes aprovados.

Check passou com 133 testes em 18 arquivos; package, smoke base com Ajuda offline
completa/foco/teclado/painel/zoom e smoke de perfis passaram em macOS arm64.
Checagem negativa de Markdown divergente passou em cópia temporária. Capturas dos
dois temas/zoom revisadas. [Evidências DOC.1](../07-testing/help-doc1.md).
Limites de provider/nativos/assistivas/outros alvos e gates de release mantidos.
Conclusão/commit DOC.1 pendentes; nenhum push. Detalhes de cada bloco passam a ser
registrados em [PROJECTS_STATUS.md](../../PROJECTS_STATUS.md), sem apagar este histórico.

Conferência DOC.1: 37 Markdown, 279 links locais, 99 tabelas e 11 âncoras válidos; 47 arquivos protegidos preservados. Index vazio, HEAD `fe4a252`; sem commit DOC.1/push. Registro detalhado no PROJECTS_STATUS.

### DOC.1 — conclusão e commit aprovados

O proprietário respondeu **“Aprovado”** ao pedido explícito de conclusão DOC.1 e do
commit `feat(help): add offline user guide and project status tracking`.
Conferidos os 27 arquivos apresentados e o checksum do ASAR, preservados antes da
sincronização documental do aceite. Código/guia/ferramentas não alterados; resultados
de 133 testes/18 arquivos, check/package/smokes e caso negativo mantidos, sem nova
execução funcional por mudança apenas documental.

PROJECTS_STATUS, instruções e registros sincronizados. Este registro integra o
commit aprovado; seu hash pode ser consultado no Git, com pai `fe4a252`.
Limitações anteriores mantidas; sem push ou execução da 4A.2. Nova etapa exige
contrato/aceite próprios, sem repetir o aceite já concedido da DOC.1.

Conferência do aceite DOC.1: docs:check aprovado, 37 Markdown/280 links locais/99 tabelas/11 âncoras válidos e whitespace conferido. Código/guia/ferramentas apresentados preservados; nenhuma repetição funcional ou nova fase.

## Preparação 4A.2 após DOC.1

O proprietário pediu “Pode seguir para a próxima etapa”. Git limpo em `66183f7`,
com DOC.1 aprovada/registrada. Conforme o fluxo de contrato antes da implementação,
preparada proposta detalhada da **4A.2A — CA personalizada e teste HTTPS**, com
subdivisão Proposed em A (CA/HTTPS), B (AMQPS) e C (sessão), sem execuções automáticas.

Contrato no roadmap: 13 campos, limites e migração propostos, nove critérios de
aceitação, testes de TLS/IPC/credenciais/cancelamento e guia/Ajuda. Fontes oficiais
consultadas; limitações de acesso/versionamento registradas. Sem novos ADRs Accepted,
dependências, código, migração, conexão a broker ou teste funcional. Guia preservado.
AGENTS/PROJECTS/estado sincronizados para apreciação. Nenhum commit ou push.

Conferência da proposta 4A.2A: docs:check aprovado; 37 Markdown/281 links locais/101 tabelas válidos, 13 campos do contrato e whitespace conferidos. Apenas cinco arquivos documentais alterados; fonte/guia preservados, index vazio. Sem novo teste funcional, commit ou push.

## 4A.2A — execução autorizada

Após apresentação do contrato detalhado, “Autorizo” aprovou CA/teste HTTPS,
sublimites, schema/migração e verificações isoladas. Preparação documental
preservada em 66183f7 sem commit novo. Sem autorização de 4A.2B/C ou push.

## 4A.2A — implementação verificada, pronta para revisão

CA pública por perfil, tokens vinculados à janela/expiração, JSON v2 com leitura
v1 sem mutação/backup exato na gravação explícita, teste de autenticação HTTPS
whoami no main e UI com cancelamento/resultado datado. Ponte com 16 métodos
específicos; sem sessão ativa, AMQP ou persistência de senha habilitada.
Guia/README/Ajuda sincronizados (12 tópicos), NFR-031–033 e documentação atualizados.

Check final aprovado com 166 testes/24 arquivos; package darwin-arm64 e três
smokes sequenciais (base/Ajuda/segurança, perfis, HTTPS) aprovados. Revisão do ASAR
sem fixtures/segredos e capturas de temas/zoom concluída. Harness passou a usar sua
própria janela em tela cheia para 1440x900, pois o host oferece área útil 1440x870;
nenhuma alteração no produto ou resolução global. Dimensões exigidas preservadas.

[Evidências 4A.2A](../07-testing/https-4a2a.md) distinguem TLS Node real isolado de
RabbitMQ real não executado (Docker sem daemon). Nativos manuais, assistivas,
outros SOs/CPUs e gates de provider/release permanecem pendentes. Conclusão/commit
aguardam aprovação explícita; nenhum push ou trabalho 4A.2B/C.

Conferência final documental 4A.2A: 38 Markdown/288 links locais/105 tabelas/12
âncoras válidos; docs:check/format:check/whitespace aprovados. 36 arquivos protegidos
preservados contra o início; HEAD 66183f7 e index vazio. Detalhes no PROJECTS_STATUS.

## 4A.2A — conclusão e commit aprovados

O proprietário respondeu **“Aprovado”** à solicitação explícita de conclusão 4A.2A
e do commit `feat(connections): add custom CA and HTTPS authentication tests`.
Conferidos os 58 arquivos apresentados e o SHA-256 do ASAR antes de sincronizar
os documentos do aceite. Código/guia/ferramentas apresentados preservados;
resultados de 166 testes/24 arquivos, check/package/três smokes mantidos, sem
repetição funcional para alteração exclusivamente documental.

Alteração posterior em misc/window/components/Titlebar/index.tsx preservada fora
desse commit; não integra o pacote/testes aprovados. PROJECTS/AGENTS/estado e
referências sincronizados. Registro da conclusão integra o commit autorizado com
pai 66183f7; consultar hash no Git. Sem push ou início de 4A.2B/C. Limitações de
broker real, nativos, assistivas, outros alvos e providers/release mantidas.

## Preparação 4A.2B após 4A.2A

O pedido “Continue as etapas” iniciou o contrato da próxima entrega. A 4A.2A está
registrada/aprovada em 966b4a2; HEAD 9401448 contém mudança posterior da barra de
título macOS, feita pelo proprietário. Git limpo; preservar esse comportamento e
revalidar o próximo pacote, sem reutilizar evidências antigas como prova desse HEAD.

Contrato 4A.2B Proposed no roadmap: 13 campos/dez critérios; amqplib 2.2.0 com tipos
incluídos, teste explícito AMQPS/vhost sem sessão/canal, prazo total 15 s, fechamento
limitado/cancelamento, parse estrito e duas novas operações IPC. Guias/smokes devem
acompanhar a implementação futura e o comportamento real por plataforma.

Fontes oficiais/registry consultados; nenhum cliente instalado, código/guia alterado
ou teste funcional/broker executado. Novos parâmetros não foram registrados como
Accepted. AGENTS/PROJECTS/current-stage sincronizados; sem commit ou push. Aguardar
aceite do contrato antes de implementar; 4A.2C permanece para aprovação própria.

Conferência da proposta 4A.2B: docs:check/whitespace aprovados; 38 Markdown,
288 links locais e 106 tabelas válidos; 13 campos do contrato presentes. Cinco
documentos alterados, index vazio; código/guia/dependências preservados. Sem teste
funcional, instalação, broker, novo commit ou push nesta preparação.

## 4A.2B — implementação verificada, pronta para revisão

Em 2026-10-29, “Autorizo” aprovou executar o contrato AMQPS/cliente/limites.
Instalado apenas amqplib 2.2.0 (sem transitivas de produção), com audit sem auto-fix:
seis avisos preexistentes de tooling, nenhum alerta para o cliente na consulta.

Parser puro de vhost, socket TCP próprio antes de TLS, SASL/abertura/close sem canais,
coordenação HTTPS/AMQPS por janela, 18 métodos específicos e UI/resultados separados.
Preservados 9401448 e políticas; sem schema novo ou persistência de senha habilitada.
Guia/README/Ajuda de fonte única atualizados: 13 tópicos/12 campos.

Check com 216 testes/27 arquivos, package darwin-arm64 e quatro smokes sequenciais
passaram. DNS/IP no runtime Electron 45.1.0/Node 24.22.1, cancelamento/prazo/revision,
recarga/close/quit, redigitação de senha, temas/zoom/segurança/Ajuda exercitados.
Menu macOS usa roles nativas/IPC; espera de restauração corrigida no harness, sem
alterar controles do produto ou homologar teclado nativo manualmente.

Artefato e capturas revisados; 43 arquivos protegidos preservados. [Evidências e
limitações](../07-testing/amqps-4a2b.md): fixture não é RabbitMQ real; Docker sem
daemon e outros alvos/providers/releases continuam pendentes. Conclusão/commit
aguardam aprovação, sem push ou execução da 4A.2C.

## Complemento 4A.2B — RabbitMQ real

Em 2026-10-29, o pedido explícito de testes reais após ativar Docker e “Continue”
autorizaram complementar a revisão. `node tools/testing/rabbitmq-real.cjs` passou
com 20 verificações em cada 4.4.0/4.3.6 real, de nó único, imagens oficiais arm64
por digest e portas loopback. Mesmo executável anteriormente apresentado.

HTTPS/whoami, AMQPS/vhosts exatos/recusas, DNS/IP/CA, cancelamento/exclusão mútua e
prazo passaram. Broker confirmou zero canais criados e nenhum recurso residual
de mensageria. Dados/containers/redes próprios removidos, outros projetos preservados.
Falhas intermediárias eram do harness (configuração de porta management, timeout
TLS remoto e expectativa de texto de log), corrigidas/documentadas no PROJECTS.

[Evidências](../07-testing/amqps-4a2b.md) registram digests, resultados e limites.
Isso supera a limitação de daemon ausente para esse recorte de testes, sem homologar
cluster/HA, demais recursos/SOs/CPUs ou releases. Guia/Ajuda preservados, pois não
houve mudança de produto. Conclusão/commit ainda pendentes; sem push ou 4A.2C.

## 2026-10-30 — 4A.2B concluída/aprovada

“Aprove a 4A.2B, e siga para a próxima etapa” aceitou conclusão e registro do commit
`feat(connections): add cancellable AMQPS connection tests`, incluindo o complemento
real. Conferidos os 57 caminhos/ASAR do snapshot, HEAD 9401448 e index vazio, sem
edição adicional do proprietário. Somente documentos de aceite sincronizados.

Resultados aceitos: 216 testes/27 arquivos, check/package/quatro smokes e 40 checks
reais nas versões 4.4.0/4.3.6. Sem repetição funcional para alteração documental.
Limitações mantidas; código/guia/dependências/Titlebar preservados. Registro integra
o próprio commit com pai 9401448, cujo hash deve ser consultado no Git.

Após conferir commit, preparar contrato detalhado 4A.2C. Não implementar sessão
antes do aceite de seu contrato, nem fazer push. PROJECTS registra os blocos.

## 2026-10-30 — Commit 4A.2B e proposta 4A.2C

Commit aprovado registrado/conferido: ea116de8ec84f0f7246e1922fa4a60fb3dfb0634, pai
9401448, 57 caminhos exatos (56 no resumo com uma renomeação agrupada); working
tree limpo após o registro, sem push. Código/guia do aceite preservados.

Pedido de seguir aplicado à preparação de contrato próprio 4A.2C: 13 campos,
12 critérios e escolhas C-01–07 Proposed. Sessão única e AMQPS persistente sem
canais, whoami periódico/datado, estados independentes, recuperação/cotas por
endpoint, lifecycle, contexto de vhost salvo e ponte proposta de 22 métodos.

Riscos de eventos precoces/blocked/close do cliente fixado foram reexaminados e
viraram gate antes de UI, sem importar estado privado ou trocar dependência.
Tipos locais/código fixado e documentação oficial lidos; sem nova homologação.
Fontes e limites no contrato; seus novos parâmetros ainda exigem aprovação.

Somente documentos de governança/planejamento alterados; guia/Ajuda preservados.
Nenhuma instalação, código, teste funcional, sessão, broker, package, smoke ou
commit da proposta. Próximo passo: apresentar contrato e pedir aceite explícito.

## 2026-10-30 — 4A.2C autorizada, gate reprovado

“Autorizado” aceitou contrato/C-01–07/sublimites. Cinco documentos da proposta
preservados; HEAD ea116de/index vazio. Gate em filhos: onze cenários, seis saídas
anormais (Callback/Promise Node e Callback Electron Node), open-ok seguido de
Close 403/frame inesperado. Todos sockets/filhos/CA temporários encerrados.

Check passou com 216 testes/27 arquivos, typecheck/lint/formatação/guia; gate manual
reprovado. Sem pacote/smoke/broker real/sessão novos. Fixture/harness ampliados para
reproduzir falha/heartbeat, sem produto alterado.
[Evidências](../07-testing/sessions-4a2c.md) e
[ADR-0008 Proposed](../03-architecture/adr/0008-amqp-lifecycle-safety.md).

Exceção de patch local mínimo/verificável recomendada, ainda não aplicada/testada.
Biblioteca instalada/manifesto/lock/guia/assets preservados. Trabalho dependente
interrompido conforme contrato; aprovação adicional necessária. Sem commit/push.

## 2026-10-30 — ADR-0008 A aceita/aplicada; 4A.2C retomada

“Autorizo aplicar e testar a alternativa A da ADR-0008” aceitou patch mínimo,
aplicação/verificação por hashes, hooks/build e instalação limpa. Gate ampliado
aprovou 30 cenários (Callback/Promise Node/Electron), seis testes Node e instalação
limpa isolada passaram. Conforme item 6, trabalho 4A.2C dependente retomado.

Sessão/adapter/lease/IPC/UI/guia implementados sob contrato: 22 métodos, nenhum
canal/mensagem; endpoints separados e recuperação limitada. Testes integrados,
pacote/smokes e matriz real em revisão; conclusão/commit não aprovados. Preservar
registro histórico da falha, consultar evidências/PROJECTS para resultados finais.

## 2026-10-30 — 4A.2C implementada/verificada, pronta para revisão

A alternativa A passou instalação limpa e gate de 30 cenários; patch único/hash
fixo preservado. Sessão completa passou 237 testes/31 arquivos + seis Node,
package/cinco smokes sequenciais e 54 checks reais (27 em cada 4.4.0/4.3.6),
incluindo cortes individuais/simultâneos e recuperação sem reset de cotas.
Artefato/capturas/links/fronteiras/cleanup revisados. Guia/Ajuda 14 tópicos/12 campos.
[Evidências](../07-testing/sessions-4a2c.md). Validação macOS arm64/nó único, com
limitações mantidas. Conclusão/commit ainda dependem de aprovação; sem push/4B.

## 2026-10-30 — Conclusão/commit 4A.2C aprovados

“Aprovado” aceitou a entrega apresentada e autorizou o commit
feat(connections): maintain broker session and bounded recovery. Conferidos hashes
dos 61 arquivos/ASAR e Git antes de sincronizar somente o aceite documental.
Resultados/limitações mantidos; testes funcionais não repetidos nesta Task.
Este registro acompanha o commit de entrega (pai ea116de; hash em git log -1).
Sem push ou execução/preparação automática da 4B.
