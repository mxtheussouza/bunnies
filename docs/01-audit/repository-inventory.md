# Inventário do repositório legado

Data da auditoria: 2026-10-28. Base:
`52077522486403a3d0351341c952ebb69e00b954`. Status: evidências da Etapa 0 aprovada,
registradas na Etapa 1A; recomendações não equivalem a decisões de implementação.

## Escopo e Git

Foram examinados arquivos versionados, configurações, assets, lockfile e os quatro
commits disponíveis. Dependências instaladas, caches e artefatos foram excluídos;
`node_modules` estava ausente. Nenhuma execução funcional foi homologada.

| Item | Resultado na base auditada |
| --- | --- |
| Repositório | `https://github.com/mxtheussouza/bunnies` |
| Remote local | `git@github.com:mxtheussouza/bunnies.git` |
| Branch de trabalho | `chore/modernization-app` |
| HEAD, `main` e referência local `origin/main` | `5207752` |
| Working tree antes da documentação | Limpo |
| Tags locais | Nenhuma |
| Arquivos versionados | 53 |
| Código em `src`, `misc` e `tools` | 37 arquivos, aproximadamente 1.856 linhas |

Não foi executado `fetch`; a referência local remota não comprova sincronização
com o servidor. A página pública consultada na Etapa 0 mostrava quatro commits.
[Repositório](https://github.com/mxtheussouza/bunnies).

| Commit | Data do histórico | Conteúdo observado |
| --- | --- | --- |
| `0c26e30` | 2023-04-14 | Base inicial Electron/React e configurações |
| `c1478f9` | 2023-05-03 | Simplificação dos aliases |
| `87ec41c` | 2023-05-09 | Componentização, provider de tema e hooks |
| `5207752` | 2023-05-10 | Reorganização do componente Titlebar |

## Arquivos da base auditada

Os caminhos abaixo correspondem aos 53 arquivos anteriores à Etapa 1A. Esta lista
é um retrato do legado; não inclui a documentação criada posteriormente.

| Caminho | Responsabilidade |
| --- | --- |
| `.editorconfig` | Convenções básicas do editor |
| `.eslintignore` | Exclusões do lint |
| `.eslintrc` | Regras e resolução de imports |
| `.gitattributes` | Classificação de estilos no GitHub |
| `.gitignore` | Exclusões de caches, dependências e artefatos |
| `.nvmrc` | Node `18.16.0` |
| `.prettierignore` | Exclusões de formatação |
| `.prettierrc` | Configuração de formatação sem Prettier declarado |
| `LICENSE` | Licença MIT, copyright 2023 |
| `README.md` | Descrição e comandos básicos |
| `package-lock.json` | Lockfile npm v3 |
| `package.json` | Scripts, produto e dependências |
| `tsconfig.json` | Configuração TypeScript e aliases |
| `assets/icons/bunnies.png` | Símbolo utilizado na interface |
| `assets/images/logo.png` | Mesmo símbolo usado na janela |
| `assets/images/appIcon.ico` | Ícone Windows |
| `misc/window/components/ControlButton.tsx` | Controle customizado de janela |
| `misc/window/components/Titlebar/index.tsx` | Menus e título |
| `misc/window/components/Titlebar/styles.less` | Estilos da barra e controles |
| `misc/window/components/WindowControls.tsx` | Botões minimizar/maximizar/fechar |
| `misc/window/components/WindowFrame.tsx` | Moldura React e contexto da plataforma |
| `misc/window/titlebarContext.ts` | Chamadas do preload ao IPC |
| `misc/window/titlebarContextApi.ts` | Acesso do renderer à ponte |
| `misc/window/titlebarIPC.ts` | Handlers privilegiados no main |
| `misc/window/titlebarMenus.ts` | Definição dos menus e rótulos de atalhos |
| `misc/window/windowPreload.ts` | Exposição por `contextBridge` |
| `src/common/helpers.ts` | Detecção de ambiente de desenvolvimento |
| `src/common/hooks/index.ts` | Exportação dos hooks |
| `src/common/hooks/useThemeContext.ts` | Consumo do contexto de tema |
| `src/common/hooks/useVersions.tsx` | Leitura de versão via atributo DOM |
| `src/common/icons.ts` | Mapeamento de ícone |
| `src/main/app.ts` | Entrada e ciclo de vida Electron |
| `src/main/appWindow.ts` | Criação da janela e registro IPC |
| `src/providers/ThemeMode.tsx` | Estado e persistência do tema |
| `src/providers/index.tsx` | Composição dos providers |
| `src/renderer/App.scss` | Estilos da demonstração e overrides |
| `src/renderer/App.tsx` | Tela demonstrativa |
| `src/renderer/components/Button/index.tsx` | Wrapper de botão HTML |
| `src/renderer/components/Button/styles.scss` | Estilos globais de botão |
| `src/renderer/components/Card/index.tsx` | Card demonstrativo |
| `src/renderer/components/Card/styles.scss` | Estilos do card |
| `src/renderer/index.html` | Contêiner React |
| `src/renderer/preload.tsx` | Entrada preload e metadados da versão |
| `src/renderer/renderer.tsx` | Montagem React |
| `src/renderer/styles/Theme.scss` | Variáveis e overrides dos temas |
| `src/typings/index.d.ts` | Declarações de imports de imagens/CSS |
| `tools/forge/forge.config.js` | Makers e plugin Webpack |
| `tools/webpack/webpack.aliases.js` | Aliases de módulos |
| `tools/webpack/webpack.helpers.js` | Utilitários da configuração |
| `tools/webpack/webpack.main.js` | Bundle do main |
| `tools/webpack/webpack.plugins.js` | Type checker, HMR e React Refresh |
| `tools/webpack/webpack.renderer.js` | Bundle do renderer |
| `tools/webpack/webpack.rules.js` | Loaders e Asset Modules |

Contagens por área: raiz 13, assets 3, misc 10, src 20 e tools 7.
Não existiam `AGENTS.md`, `docs/`, testes ou workflows versionados nessa base.

## Tecnologias e configurações

Electron, React, TypeScript, Forge e Webpack; estilos SCSS e Less; ESLint e
configuração Prettier. Linguagens auxiliares: JavaScript, HTML, JSON e Markdown.
As [versões e recomendações](dependency-audit.md) distinguem manifesto, lockfile e
publicações consultadas. Não existem cliente RabbitMQ, biblioteca de UI ou gerenciador
de estado externo. O tema usa Context API, hooks e `localStorage`.

Os scripts estão em [package.json](../../package.json), linhas 10–16. O README
orienta npm, mas `lint:fix` invoca Yarn. Não há script de teste ou versão de package
manager fixada. Há aliases repetidos entre TypeScript, Webpack e ESLint.

## Identidade visual

| Arquivo | Formato e dimensões | Tamanho |
| --- | --- | --- |
| `assets/icons/bunnies.png` | PNG RGBA, 60 × 60 | 3.435 bytes |
| `assets/images/logo.png` | PNG RGBA, 60 × 60 | 3.435 bytes |
| `assets/images/appIcon.ico` | ICO, uma imagem 32 × 32, 32 bits | 4.286 bytes |

SHA-256 dos dois PNGs idênticos:
`ddfe59800087d066b50039c456f6c2eac8a436d5d0136c4efde8a75320f21387`.
SHA-256 do ICO:
`825ef88e493bf698ad68716c5ecbad03a17187ef07aea0c636a47ed5ab7334d3`.

O PNG inspecionado usa tons verdes e azuis. Os tokens em
[Theme.scss](../../src/renderer/styles/Theme.scss) incluem destaque `#32639f` no tema
escuro e `#2f77ca` no claro, com fundos `#202020` e `#f1f0f0`. Faltam fontes de maior
resolução e recursos específicos de distribuição macOS/Linux. Preservar os originais
e solicitar aprovação antes de alterar a identidade.

## Classificação dos componentes

| Componente | Classificação | Justificativa |
| --- | --- | --- |
| Nome, licença e PNGs originais | Reutilizável sem alterações | Preservar identidade e atribuição |
| ICO e recursos de distribuição | Reutilizável com modernização | Resolução e cobertura de plataformas limitadas |
| `src/main/app.ts` | Reutilizável com modernização | Ciclo básico aproveitável |
| `src/main/appWindow.ts` | Necessita refatoração | Sandbox, ciclo de vida e caminhos |
| Preload e ponte `electron_window` | Necessita refatoração | Contratos, retornos e erros incompletos |
| `titlebarIPC.ts` | Necessita refatoração | Sem validação de remetente/URL |
| WindowFrame, Titlebar e controles | Necessita refatoração | Ciclo de imports, acessibilidade e plataformas |
| Menus customizados | Necessita refatoração | Manipulação DOM e atalhos apenas rotulados |
| Providers e hooks de tema | Reutilizável com modernização | Base simples; melhorar persistência e estados |
| `Button` e mapeamento de ícones | Reutilizável com modernização | Adicionar estados/foco; preservar recursos |
| `Card` | Necessita refatoração | Tipagem e layout vinculados à demonstração |
| `App.tsx` demonstrativo | Necessita substituição | Não contém os fluxos de produto |
| `useVersions` e metadados preload | Necessita substituição | Dependência de DOM e ambiente npm |
| Temas e estilos | Reutilizável com modernização | Tokens úteis; redundância e valores ausentes |
| Helpers e typings | Reutilizável com modernização | Pequenos, revisar separação de ambientes e declarações |
| Forge/Webpack/TypeScript/lint | Reutilizável com modernização | Atualizar compatibilidade e reduzir configuração residual |
| `rhmr: react-hot-loader/patch` | Obsoleto ou residual a investigar | Pacote ausente; efeito da opção não homologado |
| Integração RabbitMQ | Não identificado | Nenhuma implementação encontrada |
| Testes, CI e documentação especializada | Incompleto | Ausentes na base auditada |

As classificações recomendam tratamento; não autorizam remoções ou substituições.
Consultar [análise funcional](legacy-analysis.md) e [dívida técnica](technical-debt.md).
