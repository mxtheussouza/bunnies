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
