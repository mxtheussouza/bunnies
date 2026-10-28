# Dívida técnica, segurança e limitações

Data: 2026-10-28. Base: `52077522486403a3d0351341c952ebb69e00b954`.
Status: achados abertos. A documentação não implementa correções.

## Como interpretar

- **Fato:** observado no código, histórico, manifesto ou lockfile.
- **Risco:** consequência possível; exploração ou falha funcional não foi executada.
- **Proposta:** tratamento a submeter no contrato de implementação.
- **Decisão aprovada:** somente a registrada no [estado atual](../05-roadmap/current-stage.md).

P0 indica bloqueador proposto de uma distribuição utilizável; P1, correção
prioritária da fundação; P2, manutenção e qualidade. Não é uma classificação CVSS
dos achados da aplicação. Todos os itens continuam abertos.

## Registro de achados

| ID | Prioridade | Fato e localização | Risco / tratamento proposto |
| --- | --- | --- | --- |
| TD-01 | P0 | Electron `23.2.3` e dependências de 2023 no lockfile | Runtime fora de suporte; atualizar após matriz aprovada e revisar avisos |
| TD-02 | P0 | `titlebarIPC.ts:80–81` envia URL recebida a `shell.openExternal` | Abertura indevida de protocolos por renderer comprometido; validar entradas e destinos |
| TD-03 | P0 | Handlers em `titlebarIPC.ts` sem validação do remetente | Operação privilegiada sem origem verificada; restringir remetente e janela/frame |
| TD-04 | P0 | `appWindow.ts:31`, `sandbox: false` | Defesa reduzida; adaptar preload e habilitar sandbox |
| TD-05 | P1 | Sem handlers explícitos de navegação/novas janelas | Conteúdo inesperado com acesso à ponte; restringir navegação e popups |
| TD-06 | P1 | Forge define CSP de desenvolvimento com `unsafe-inline`; HTML sem CSP explícita de produção | Definir política por ambiente e verificar o bundle; não inferir política efetiva sem artefato |
| TD-07 | P1 | Métodos de `titlebarContext.ts` descartam Promise; `loadURL` sem tratamento | Falhas sem feedback; retornar resultados e padronizar erros |
| TD-08 | P1 | Ausência de testes e workflows | Sem proteção automatizada contra regressão; introduzir na fundação |
| TD-09 | P1 | `appWindow.ts:45–47` chama `app.quit()` no fechamento | Contradição com ciclo pretendido em macOS; corrigir e testar por SO |
| TD-10 | P1 | `renderer.tsx:10`, plataforma fixa como Windows | Controles e convenções inadequados nos demais sistemas; detectar plataforma |
| TD-11 | P1 | Ícone por `resolve("assets/images/appIcon.ico")` em main e Forge | Caminho depende de CWD; validar recursos em pacote e múltiplas resoluções |
| TD-12 | P2 | `titlebarContextApi.ts` usa `any`; TS sem `strict`, com ambientes misturados | Contratos frágeis; separar ambientes e introduzir verificações gradualmente |
| TD-13 | P2 | Ciclo WindowFrame → Titlebar → WindowFrame | Acoplamento de contexto e visual; extrair contexto ou reorganizar composição |
| TD-14 | P2 | Titlebar manipula classes DOM; refs recriadas no render | Estado menos previsível; usar estado/composição verificáveis |
| TD-15 | P2 | ControlButton usa `div`; botão define `outline: none` sem substituto | Teclado/foco insuficientes; semântica e foco acessível |
| TD-16 | P2 | Cadeias SCSS e Less em interface pequena | Manutenção duplicada; propor unificação preservando aparência |
| TD-17 | P2 | Relocator `@marshallofsound` e `file-loader` sem uso configurado identificado | Superfície de tooling; confirmar ausência de uso antes de remover |
| TD-18 | P2 | Forge `rhmr` aponta pacote não declarado; React Refresh não homologado | Configuração residual ou ineficaz; verificar HMR real |
| TD-19 | P2 | `useVersions` lê JSON do DOM e preload depende de variável npm | Metadados ausentes/malformados; obter versão pelo núcleo com contrato |
| TD-20 | P2 | README básico, Prettier ausente e `lint:fix` usa Yarn | Ambiente inconsistente; definir package manager, scripts e onboarding |
| TD-21 | P2 | Tokens CSS incompletos, cores fixas e PNG duplicado | Estados/temas inconsistentes; revisar tokens sem substituir identidade |
| TD-22 | P2 | Sem política de registro único/remoção dos handlers IPC | Recriação de janela pode duplicar handlers; vincular registro ao ciclo de vida |

Referências: [janela](../../src/main/appWindow.ts),
[IPC](../../misc/window/titlebarIPC.ts),
[ponte](../../misc/window/titlebarContext.ts),
[Titlebar](../../misc/window/components/Titlebar/index.tsx),
[ControlButton](../../misc/window/components/ControlButton.tsx),
[botão](../../src/renderer/components/Button/styles.scss),
[Webpack](../../tools/webpack/webpack.rules.js) e
[Forge](../../tools/forge/forge.config.js). As linhas indicadas referem-se à base auditada.

O guia oficial recomenda runtime atual, validação de remetente IPC, restrição de
navegação e abertura segura de links. [Segurança Electron](https://www.electronjs.org/docs/latest/tutorial/security).
Os avisos e limites do catálogo constam na [auditoria de dependências](dependency-audit.md).

## Controles ainda necessários para o produto

Não há credenciais de broker armazenadas pelo legado; isso é ausência de integração,
não uma implementação segura de armazenamento. A fundação proposta precisa prever
proteção pelo SO, TLS validado, privilégio mínimo, limpeza de segredos em logs,
validação de payloads e confirmação de ações destrutivas. Não foram encontradas
credenciais reais na inspeção, mas não foi executado scanner especializado.

Operações de rede devem ter timeout, cancelamento e recuperação sem bloquear a
interface. Repetir automaticamente publicação ou ação destrutiva pode duplicar
efeitos. Falhas após envio precisam admitir resultado incerto.

## Informações e homologações pendentes

| Lacuna | Como resolver em etapa autorizada |
| --- | --- |
| Aplicação compila/inicializa? | Instalar ambiente aprovado e executar verificações reais |
| Compatibilidade de TS/ESLint/plugins | Escolher matriz suportada; não instalar com peers ignorados |
| Brokers, autenticação e rede reais dos usuários | Levantar versões, proxies, plugins, CA, mTLS e permissões |
| Sistemas e CPUs suportados | Definir mínimos, matriz de runners e testes em cada SO |
| Memória, startup, volume de filas e payloads | Definir metas e benchmark representativo |
| Exploração dos avisos e presença em pacotes | Analisar alcance, árvore e artefatos gerados |
| Distribuição e atualizações | Definir formatos, certificados, contas e política de releases |
| Inspeção de mensagens | Definir semântica e restrições; não prometer observação passiva |
| Histórico de métricas | Definir fonte, retenção e privacidade antes de prometer persistência |

Nenhuma medição ou homologação dessas lacunas foi realizada. Um único ambiente não
comprova funcionamento dos três sistemas operacionais. Versões e avisos externos
são temporais e deverão ser revalidados antes da implementação.
