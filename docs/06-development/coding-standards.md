# Desenvolvimento e convenções

Etapa 2A, 2026-10-28. Stack aprovada no [ADR-0001](../03-architecture/adr/0001-desktop-stack.md).

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
- Preservar `src`, `misc` e `tools` nesta etapa. Testes iniciais ficam próximos das
  unidades. Reorganizar processos/módulos somente no contrato correspondente.
- Não importar main/Node/transporte no renderer. O bridge legado ainda exige a
  revisão da 2B; a tipagem do bridge nesta etapa não implementa validação de IPC.
- Não instalar adapters de broker, schemas ou bibliotecas futuras antes de seu uso.
- Documentação em português e Conventional Commits em inglês; conclusão e commit
  exigem aprovação, conforme [AGENTS.md](../../AGENTS.md).

## Testes e smoke

Testes verificam resultados observáveis, sem snapshots de implementação. Fixtures
não contêm credenciais reais e não acessam brokers. jsdom não homologa Chromium,
acessibilidade, segurança do Electron nem armazenamento do sistema operacional.

O smoke abre o executável empacotado para o alvo local, cria um diretório temporário
de dados, confirma `app.isPackaged`, versão, renderização e tema após reload, encerra
o processo e remove apenas seu próprio diretório. Playwright usa automação Electron
experimental e argumentos de inspeção; esta é uma validação de desenvolvimento,
sem assinatura, fuses de release ou homologação completa. Não desabilitar sandbox
para contornar falhas do runner.

A CI proposta executa qualidade em Ubuntu e empacotamento em Ubuntu, Windows Server
e macOS. Windows Server não equivale à homologação Windows 11, e runner macOS não
substitui os dois alvos/CPUs aprovados. O workflow não envia artefatos, assina ou
publica. Sua execução remota permanece pendente até push autorizado.

Fontes: [Forge/Webpack](https://www.electronforge.io/config/plugins/webpack),
[ESLint flat config](https://eslint.org/docs/latest/use/configure/configuration-files),
[TypeScript 6](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-6-0.html),
[automação Electron](https://playwright.dev/docs/api/class-electron).

Política npm: [install-scripts](https://docs.npmjs.com/cli/v11/commands/npm-install-scripts/).
Download: [Electron](https://www.electronjs.org/docs/latest/tutorial/installation).
