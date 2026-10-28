# Desenvolvimento e convenções

Atualizado na Etapa 3B, 2026-10-28. Stack aprovada no [ADR-0001](../03-architecture/adr/0001-desktop-stack.md).

## Ambiente e comandos

Usar Node 24.22.1 e npm 11.19.1, fixados em `.nvmrc`, `engines`, `packageManager` e
`.npmrc`. Com nvm: `nvm install`, `nvm use`; confirmar `node --version` e
`npm --version`. O npm vem com a distribuição selecionada; instalar a versão fixada
se necessário. O Electron 45 baixa o binário sob demanda ao iniciar ou empacotar;
o download usa cache local. Não usar `--force` nem `--legacy-peer-deps` para resolver a árvore.

| Comando | Finalidade |
| --- | --- |
| `npm ci` | Reproduzir o lockfile e respeitar a política explícita de scripts |
| `npm start` | Desenvolvimento desktop com Forge/Webpack em localhost |
| `npm run typecheck` | Tipagem estrita, sem emitir arquivos |
| `npm run lint` | ESLint flat config, sem warnings permitidos |
| `npm test` | Testes de comportamento em Vitest/jsdom |
| `npm run format:check` | Formatação de código, configurações, estilos e HTML |
| `npm run check` | Tipagem, lint, testes e formatação |
| `npm run package` | Compilar e empacotar para o SO/CPU local |
| `npm run smoke:package` | Abrir o pacote local com Playwright e dados temporários |
| `npm run make` | Gerar instalador/arquivo por maker disponível; não publica |

`npm run lint:fix` e `npm run format` modificam arquivos. A formatação automatizada
exclui Markdown para preservar a auditoria histórica e permitir revisão editorial
dos documentos. Os scripts transitivos de `electron-winstaller`, `@parcel/watcher` e `fsevents` estão negados
em `allowScripts`: seleção de binários de instalador Windows e compilação nativa
não são necessárias ao pacote local. Rever antes de homologar makers/compilação
from-source; não aprovar todos os scripts indiscriminadamente.
Não há script de publicação automática. Artefatos ficam em `out/`
e `.webpack/`, ignorados pelo Git.

## Código e fronteiras

- Dois espaços, ponto e vírgula, aspas duplas e formatação pelo Prettier.
- TypeScript com `strict`, resolução `bundler` para os bundles Webpack e JSX moderno.
- Sem `any` explícito; estreitar `unknown` nas entradas. Não silenciar erros com casts
  amplos ou desativação global de regras para aprovar o check.
- ESLint 10 usa JS recomendado, TypeScript recomendado e regras de hooks/dependências.
  Plugins React/import legados foram retirados conforme ADR; as regras perdidas não
  são equivalentes a tipagem/testes. `skipLibCheck` limita a checagem das declarações
  de terceiros, sem dispensar os smokes de compatibilidade.
- Organização desktop implementada: main, preload e shared separados conforme
  contrato da 2B; interface base em renderer/shell, pages e components, com chrome
  em misc/window. Testes próximos das unidades, incluindo o chrome no renderer.
- Não importar main/Node/transporte no renderer ou Node/main no preload. Lint
  restringe esses imports. Contratos shared não importam Node/Electron/React.
- A validação obrigatória de IPC ocorre no main (janela/frame/URL/DTO), além de tipos.
  Expor apenas métodos nomeados; não recuperar a ponte legada ou acesso a clipboard.
- Não instalar adapters de broker, schemas ou bibliotecas futuras antes de seu uso.
- Documentação em português e Conventional Commits em inglês; conclusão e commit
  exigem aprovação, conforme [AGENTS.md](../../AGENTS.md).

## Testes e smoke

Testes verificam resultados observáveis, sem snapshots de implementação. Fixtures
não contêm credenciais reais e não acessam brokers. jsdom não homologa Chromium,
acessibilidade, segurança do Electron nem armazenamento do sistema operacional.

O smoke abre o executável empacotado para o alvo local, cria um diretório temporário
de dados, confirma `app.isPackaged`, versão, renderização e tema após reload, encerra
o processo e remove apenas seu próprio diretório. Na 2B também verifica sandbox,
CSP, rede/nav/permissões, recursos, janela estrangeira e recriação. O servidor HTTP
local é fixture de teste temporária, nunca backend do produto. Playwright usa automação Electron
experimental e argumentos de inspeção; esta é uma validação de desenvolvimento,
sem assinatura, fuses de release ou homologação completa. Não desabilitar sandbox
para contornar falhas do runner.

A CI preparada executa qualidade em Ubuntu e empacotamento em Ubuntu, Windows Server
e macOS, com smoke desktop adicional no job macOS. Windows Server não equivale à homologação Windows 11, e runner macOS não
substitui os dois alvos/CPUs aprovados. O workflow não envia artefatos, assina ou
publica. Sua execução remota permanece pendente até push autorizado.

Fontes: [Forge/Webpack](https://www.electronforge.io/config/plugins/webpack),
[ESLint flat config](https://eslint.org/docs/latest/use/configure/configuration-files),
[TypeScript 6](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-6-0.html),
[automação Electron](https://playwright.dev/docs/api/class-electron).

Política npm: [install-scripts](https://docs.npmjs.com/cli/v11/commands/npm-install-scripts/).
Download: [Electron](https://www.electronjs.org/docs/latest/tutorial/installation).

O preload tem config Webpack própria com devServer false, para não injetar cliente
HMR ou shims Node no sandbox Electron 45. O renderer conserva o HMR em localhost.
Após alterar o preload, recarregar a janela/reiniciar o app quando necessário; não
introduzir polyfills Node para contornar isolamento. CSS de produção é extraído
por mini-css-extract-plugin 2.10.2; exceções inline de estilo só no desenvolvimento.

Evidências e limites: [fronteira 2B](../07-testing/desktop-boundary-2b.md).

Na 3B, o smoke verifica temas Sistema/Claro/Escuro, migração de preferência em perfil
isolado, destinos indisponíveis, URL invariável, painel/foco/atalho, controles reais,
layout menor e zoom 200%. Lê os tokens computados e usa fixtures temporárias de
estilo para medir contraste; essas fixtures não são telas de demonstração do produto.
Não acrescentar APIs para permitir inspeção de teste no renderer.

Após package, `npm run smoke:package` produz `out/ui-3b-results.json` e capturas
locais ignoradas; medições e versões devem ser registradas como efetivamente
executadas. A captura a 200% usa o harness privilegiado, sem novo comando da ponte.
Para alterar cores, sincronizar tokens aceitos e CSS mediante o fluxo de aprovação;
não usar style inline ou enfraquecer a CSP. Semântica/teclado de controles nativos
continuam sujeitos à validação por SO. Ver [interface 3B](../07-testing/interface-3b.md).

Na 4A.1, perfis ficam no main (`profiles`), DTOs em shared e a ponte recebe somente
quatro operações específicas adicionais. Não alterar políticas de isolamento para
testar. `profiles.json` é versionado e limitado; não editar configurações reais do
usuário em testes. Senhas nunca retornam do main. O gate de persistência está fechado
em todos os alvos; nenhuma preferência, argumento CLI ou DTO pode habilitá-lo.

Após package, executar também `node tools/testing/profiles.cjs`. O harness cria
userData temporário, encerra/reabre o executável e limpa apenas seus dados. Produz
`out/profiles-4a1-results.json` e capturas ignoradas. Respostas da confirmação
nativa são simuladas exclusivamente no main pelo harness, sem API de teste no
produto; isso não homologa o diálogo visual do SO. Não rodar os dois smokes em
paralelo, pois foco de janelas pode interferir nas verificações.
Ver [M01](../04-modules/01-connection-manager.md) e [4A.1](../07-testing/profiles-4a1.md).

## Histórico vivo e guia do usuário

Antes de qualquer Task, ler [PROJECTS_STATUS.md](../../PROJECTS_STATUS.md) junto do
AGENTS. Registrar cada Task/fase/alteração: escopo/autorizações, mudanças, decisões,
resultados realmente executados, pendências e próxima ação. Preservar histórico e
sincronizar o resumo com current-stage/progress; não incluir segredos.

Ao mudar uma funcionalidade/formulário, atualizar
`docs/10-user-guide/guide.json`, fonte única usada pela Ajuda React offline. Executar
`npm run docs:generate` e revisar o [Markdown gerado](../10-user-guide/README.md).
Não editar o Markdown diretamente. `npm run docs:check` confere sincronismo e faz
parte de `npm run check`, inclusive na CI já existente, sem modificar o workflow.

A Ajuda não carrega páginas/HTML remoto nem usa hashes. Não instalar um parser ou
expor filesystem/IPC para exibi-la. `tools/testing/help.cjs`, integrado ao smoke
base, confere todo o conteúdo no executável em modo offline e navegação/foco/zoom.
Resultados locais/capturas: `out/help-doc1-results.json` e `out/help-doc1-*.png`.
[Evidências DOC.1](../07-testing/help-doc1.md).
