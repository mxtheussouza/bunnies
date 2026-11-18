# Evidências da fundação — Etapa 2A

Data: 2026-10-28. Base: `97cd313`, branch `chore/modernization-app`.
Execução autorizada pelo proprietário com **“Autorizado”**, após o contrato da 2A.
Conclusão aprovada pelo proprietário com **“Sim”**, autorizando o commit
`chore(setup): modernize desktop development foundation`. A aprovação não autoriza a 2B.

## Ambiente

Host local: macOS 27.0.1, build 26A434, arm64. Esse host não é o alvo mínimo macOS 14;
não declarar homologação retroativa ou dos demais SOs/CPUs. Node 24.22.1 foi instalado
via nvm, com checksum conferido pelo instalador, e npm 11.19.1. Isso adicionou uma
versão local do Node, preservando a instalação anterior 24.18.0.

Versões principais instaladas e verificadas: Electron 45.1.0, Forge 8.0.1,
React/ReactDOM 19.3.1, TypeScript 6.0.3, ESLint 10.13.0, typescript-eslint 8.72.1,
Webpack 5.112.2, Vitest 5.0.5 e Prettier 3.9.10.
Versões diretas efetivas são fixadas no manifesto/lockfile. Candidatos de integração
RabbitMQ e segurança ainda sem uso não foram instalados. A atualização do lockfile
precisou de regeneração: a tentativa de reconciliar a árvore de 2023 falhou com
ERESOLVE entre entradas antigas do ESLint 8 e novas do 10. Não foram usados force,
legacy-peer-deps, audit fix ou overrides para ignorar incompatibilidade.

## Alterações e limites

- Configuração flat do ESLint, TypeScript estrito e Prettier instalado explicitamente.
- Remoção de plugins React/import incompatíveis, loaders nativos/relocators/file-loader
  sem uso e configuração residual de React Hot Loader/Refresh sem transformação.
  Desenvolvimento mantém recarga via Forge/Webpack; não promete React Fast Refresh.
- RPM retirado dos makers conforme ADR-0007; DEB, Squirrel e ZIP permanecem candidatos.
  Ícone ICO é aplicado pelo packager somente no Windows; PNGs e identidade preservados.
  Um ícone próprio de bundle macOS ainda exige asset adequado em etapa de distribuição.
- Ajustes mínimos de React 19 e nulabilidade. Refs/closures do menu estabilizadas
  para satisfazer regras de hooks, sem redesign ou homologação de teclado do menu.
- Tema passa a restaurar a preferência na inicialização e funciona sem storage.
  `dark-mode` é preferência visual, não credencial. Metadados inválidos de versão
  não impedem renderização; a versão vem do manifesto em tempo de bundle.
- Testes comportamentais iniciais e smoke do pacote com perfil temporário próprio.
- Workflow de qualidade/empacotamento com actions fixadas por SHA e permissões de leitura;
  nenhuma execução remota ou publicação efetuada.

## Segurança das dependências

`npm audit --json` retornou status 1: seis entradas afetadas, duas low e quatro
moderate, sem high/critical. Isso não significa seis falhas independentes: o relatório
propaga dois advisories para dependentes.

| Origem | Caminho confirmado com npm explain | Situação |
| --- | --- | --- |
| [deepmerge](https://github.com/advisories/GHSA-gcqx-w48m-w2h4) 4.3.1 | fork-ts-checker-webpack-plugin 9.1.0 → deepmerge | Low; merge de configuração no tooling; investigar correção upstream |
| [uuid](https://github.com/advisories/GHSA-w5hq-g745-h8pq) 8.3.2 | Forge plugin-webpack 8.0.1 → webpack-dev-server 5.2.7 → sockjs 0.3.24 → uuid | Moderate; tooling de desenvolvimento; evitar exposição do dev server e acompanhar correção |

As outras entradas são os dependentes acima. A sugestão automática de downgrade
para Forge plugin 0.0.2/checker 4.1.6 não foi aplicada: invalidaria a modernização.
Nenhum override transitive ou audit fix foi executado. Não foi comprovada exploração
no Bunnies. `npm audit --omit=dev --json` retornou zero ocorrências, status 0; isso não
analisa automaticamente cada bundle nem substitui auditoria de segurança de runtime.

Warnings de inflight/glob/rimraf vêm dos makers Squirrel/DEB e de suas dependências
antigas; sua atualização requer upstream/validação dos instaladores, ainda não
homologados. A política npm nega os scripts transitivos de electron-winstaller,
@parcel/watcher e fsevents, não necessários a este pacote. O fsevents já distribui
seu binding pré-compilado; nenhum build nativo foi exigido no host. Electron 45 não usa postinstall:
seu binário é baixado sob demanda pelo fluxo normal da ferramenta.

## Resultados

| Comando/verificação | Resultado efetivamente obtido |
| --- | --- |
| `npm ci --no-fund` | Status 0; 794 pacotes instalados no host local a partir do lock; sem peers forçados |
| `npm install-scripts ls` | Status 0; nenhum script pendente de revisão na árvore instalada |
| `npm ls --depth=0` | Status 0; versões diretas resolvidas sem dependências inválidas |
| `npm run check` | Status 0: tipagem estrita, lint com zero warnings, 11 testes em dois arquivos e formatação |
| `npm start -- -- --user-data-dir=<temporário>` | Preload e renderer iniciaram; dev server restrito a localhost; diagnóstico encerrou somente os processos que criou |
| `npm run package` | Status 0; compilação e pacote `out/Bunnies-darwin-arm64/Bunnies.app` |
| `npm run smoke:package` | Status 0; Electron 45.1.0, app empacotado, versão 1.0.0, janela renderizada, tema após reload, perfil temporário isolado e encerrado |
| Conteúdo ASAR | 11 entradas, main presente, versão 1.0.0 e nenhum arquivo `.test.` |
| Inspeção visual | Captura `out/smoke-package.png` aberta e conferida; interface/PNG originais preservados |
| `npm audit --json` | Status 1; seis entradas afetadas descritas acima; relatório local ignorado em `out/dependency-audit.json` |
| `npm audit --omit=dev --json` | Status 0; nenhuma ocorrência no recorte de produção do audit |
| Histórico e escopo | Assets, licença e quatro documentos históricos de auditoria preservados; sem commit/push |

O primeiro diagnóstico de desenvolvimento atingiu seu limite de 50 s no download
inicial do binário, sem observar o renderer. Com o cache preparado, o segundo
diagnóstico observou preload/renderer e encerrou a sessão. O warning Sass observado
nesse diagnóstico foi resolvido com `@use`, recompilando sem o aviso. O log local
ignorado fica em `out/dev-start.log`.

A primeira tentativa de pacote falhou porque Forge 8 exige o main explícito
`.webpack/main/index.cjs`; o manifesto foi corrigido e o pacote passou. O primeiro
smoke encontrou apenas comparação textual entre `/var` e `/private/var`; a
comparação agora usa `realpath`, mantendo a exigência de isolamento. Os testes foram
reexecutados após as correções/política final. A medição de duração dos unitários
(~1 s no host) não é benchmark nem meta de desempenho da aplicação.

A captura e o relatório são artefatos locais regeneráveis, não arquivos da entrega.
Não foram executados instaladores, assinatura/notarização, brokers, containers,
testes de rede/TLS, credenciais, desempenho, acessibilidade completa ou gates da 2B.
A CI foi preparada, inspecionada e teve a sintaxe YAML lida com js-yaml, mas não
foi executada remotamente. Isso não valida o schema/execução no GitHub Actions.

## Gates posteriores

Sandbox do renderer, IPC validado, CSP, navegação, ciclo desktop e fuses continuam no
contrato da 2B e nos gates de release. Não conectar esta base ainda incompleta a um
broker ou alegar segurança por atualizar o runtime. A automação Playwright é
experimental; pacote de desenvolvimento com inspeção habilitada não é release
homologada. Assinatura, notarização e instaladores não são verificados nesta etapa.

Fontes consultadas: [ESLint](https://eslint.org/docs/latest/use/configure/configuration-files),
[TypeScript](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-6-0.html),
[Forge](https://www.electronforge.io/config/plugins/webpack),
[Playwright](https://playwright.dev/docs/api/class-electron),
[checkout v7.0.1](https://github.com/actions/checkout/releases/tag/v7.0.1),
[setup-node v7.1.0](https://github.com/actions/setup-node/releases/tag/v7.1.0).

Referências: [estratégia de testes](test-strategy.md),
[convenções/comandos](../06-development/coding-standards.md),
[estado](../05-roadmap/current-stage.md).

## Aprovação de conclusão

Após a apresentação da entrega e das limitações acima, o proprietário respondeu
**“Sim”** à pergunta explícita sobre concluir a 2A e registrar o commit de entrega.
A sincronização desta aprovação altera somente documentação; os resultados de
execução registrados acima não foram ampliados. Não houve push.
