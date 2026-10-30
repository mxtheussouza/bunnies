# Auditoria de dependências

Consulta externa: 2026-10-28, durante a Etapa 0. Base local:
`52077522486403a3d0351341c952ebb69e00b954`. Status: evidências registradas;
recomendações e versões de destino pendentes de aprovação.

## Método e limites

Foram lidos [package.json](https://github.com/mxtheussouza/bunnies/blob/52077522486403a3d0351341c952ebb69e00b954/package.json),
[package-lock.json](https://github.com/mxtheussouza/bunnies/blob/52077522486403a3d0351341c952ebb69e00b954/package-lock.json) e [.nvmrc](../../.nvmrc). O lockfile v3
contém 910 entradas de pacotes e 750 nomes distintos, além da entrada raiz. Há três
dependências de execução e 35 de desenvolvimento; os mapas da raiz do lockfile
correspondem ao manifesto. `node_modules` está ausente: as versões resolvidas não
devem ser descritas como instaladas.

Os metadados públicos foram consultados por HTTPS no registry npm, com validação
TLS, usando `GET https://registry.npmjs.org/<nome>/latest`. A coluna atual registra
a publicação observada naquela data, sem selecionar uma versão para implementação.
Publicação recente e ausência de depreciação não garantem manutenção ou compatibilidade.

Para avisos, a consulta de leitura utilizou `POST` no endpoint público
`https://registry.npmjs.org/-/npm/v1/security/advisories/bulk`, com o mapa de nomes e
versões do lockfile. O POST consulta o catálogo; não modifica o projeto ou pacotes.
A saída foi analisada em memória e não persistida integralmente. Estes resultados
são um retrato registrado, não um relatório reproduzível sem nova consulta ao catálogo.
Não foram executados `npm install`, `npm audit`, atualização ou remoção de pacotes.

## Dependências diretas

Legenda: **A** atualizar; **M** manter com atualização; **I** investigar;
**R** remover se confirmada ausência de uso; **S** substituir gradualmente se aprovado.
As três primeiras linhas estão em `dependencies`; as restantes em `devDependencies`.

| Pacote | Declarada | Lockfile | Atual consultada | Ação |
| --- | --- | --- | --- | --- |
| `electron-squirrel-startup` | `^1.0.0` | `1.0.0` | `1.0.1` | M se Squirrel permanecer |
| `react` | `^18.2.0` | `18.2.0` | `19.3.1` | M |
| `react-dom` | `^18.2.0` | `18.2.0` | `19.3.1` | M junto com React |
| `@electron-forge/cli` | `6.0.5` | `6.0.5` | `8.0.1` | A em conjunto |
| `@electron-forge/maker-deb` | `6.0.5` | `6.0.5` | `8.0.1` | A em conjunto |
| `@electron-forge/maker-rpm` | `6.0.5` | `6.0.5` | `8.0.1` | A em conjunto |
| `@electron-forge/maker-squirrel` | `6.0.5` | `6.0.5` | `8.0.1` | A em conjunto |
| `@electron-forge/maker-zip` | `6.0.5` | `6.0.5` | `8.0.1` | A em conjunto |
| `@electron-forge/plugin-webpack` | `6.0.5` | `6.0.5` | `8.0.1` | A se Webpack permanecer |
| `@marshallofsound/webpack-asset-relocator-loader` | `^0.5.0` | `0.5.0` | `0.5.0` | R |
| `@pmmmwh/react-refresh-webpack-plugin` | `^0.5.10` | `0.5.10` | `0.6.3` | A e homologar refresh |
| `@types/node` | `^18.15.10` | `18.15.11` | `26.6.5` | I conforme runtime e tooling |
| `@types/react` | `^18.0.29` | `18.0.35` | `19.3.0` | A com React |
| `@types/react-dom` | `^18.0.11` | `18.0.11` | `19.3.0` | A com React DOM |
| `@types/webpack-env` | `^1.18.0` | `1.18.0` | `1.18.8` | A se necessário |
| `@typescript-eslint/eslint-plugin` | `^5.56.0` | `5.58.0` | `8.72.1` | A conforme peers |
| `@typescript-eslint/parser` | `^5.56.0` | `5.58.0` | `8.72.1` | A conforme peers |
| `@vercel/webpack-asset-relocator-loader` | `^1.7.3` | `1.7.3` | `1.11.0` | I; A se necessário |
| `classnames` | `^2.3.2` | `2.3.2` | `2.5.1` | M |
| `cross-env` | `^7.0.3` | `7.0.3` | `10.1.0` | A após escolher Node |
| `css-loader` | `^6.7.3` | `6.7.3` | `7.1.5` | A com Webpack |
| `electron` | `^23.2.0` | `23.2.3` | `45.1.0` | A se mantido |
| `eslint` | `^8.36.0` | `8.38.0` | `10.13.0` | A conforme plugins |
| `eslint-import-resolver-alias` | `^1.1.2` | `1.1.2` | `1.1.2` | I alternativa alinhada ao tooling |
| `eslint-plugin-import` | `^2.27.5` | `2.27.5` | `2.32.0` | A conforme peers |
| `eslint-plugin-react` | `^7.32.2` | `7.32.2` | `7.37.5` | A conforme peers |
| `file-loader` | `^6.2.0` | `6.2.0` | `6.2.0` | R |
| `fork-ts-checker-webpack-plugin` | `^8.0.0` | `8.0.0` | `9.1.0` | I compatibilidade TS |
| `less` | `^4.1.3` | `4.1.3` | `4.9.1` | S se estilos forem unificados |
| `less-loader` | `11.1.0` | `11.1.0` | `13.1.0` | S junto com Less |
| `node-loader` | `^2.0.0` | `2.0.0` | `2.1.0` | I módulos nativos |
| `react-refresh` | `^0.14.0` | `0.14.0` | `0.19.0` | A com plugin |
| `sass` | `^1.60.0` | `1.62.0` | `1.106.1` | M |
| `sass-loader` | `^13.2.1` | `13.2.2` | `17.1.0` | A com Sass/Webpack |
| `style-loader` | `^3.3.2` | `3.3.2` | `4.0.0` | A com Webpack |
| `ts-loader` | `9.4.2` | `9.4.2` | `9.6.2` | I compatibilidade TS |
| `typescript` | `^5.0.2` | `5.0.4` | `7.0.2` | A com matriz validada |
| `webpack` | `^5.76.3` | `5.79.0` | `5.112.2` | M |

Fontes de metadados principais: [Electron](https://registry.npmjs.org/electron/45.1.0),
[Forge](https://registry.npmjs.org/@electron-forge/cli/8.0.1),
[React](https://registry.npmjs.org/react/19.3.1),
[TypeScript](https://registry.npmjs.org/typescript/7.0.2),
[Webpack](https://registry.npmjs.org/webpack/5.112.2),
[ESLint](https://registry.npmjs.org/eslint/10.13.0),
[Sass](https://registry.npmjs.org/sass/1.106.1) e
[Less](https://registry.npmjs.org/less/4.9.1). URLs versionadas identificam as
publicações registradas; revalidar disponibilidade e suporte antes da implementação.

## Compatibilidade, manutenção e impacto

| Área | Estado observado e recomendação |
| --- | --- |
| Electron | Linha 23 fora da política de três linhas estáveis suportadas. Upgrade relevante de Chromium, Node e APIs; revisar breaking changes e testar por SO |
| Forge | Família atual publicada como 8.0.1; requer Node `>=22.13.0`. Atualizar CLI, makers e plugin de forma compatível |
| React | Família atual 19.3.1; alinhar React DOM e tipos, incluindo migração de typings JSX e verificação dos componentes |
| TypeScript | Publicação 7.0.2 não implica compatibilidade com plugins. Avaliar compilador, API utilizada por loaders e configuração antiga |
| ESLint | Linha 8 em EOL; migrar configuração e alinhar plugins sem ignorar peers |
| Webpack | Linha 5 continua publicada; manter inicialmente reduz mudanças simultâneas. Alternativa de bundler somente mediante justificativa |
| Sass/Less | Duas cadeias ativas no projeto; sugerida convergência gradual em Sass ou CSS após aprovação, preservando apresentação |
| Relocators/loaders | Confirmar necessidade real de módulos nativos. Apenas `@vercel` está configurado; `file-loader` não é necessário para os Asset Modules já usados |
| Tipos Node | Distinguir Node do tooling e Node embarcado no Electron; tipos mais novos podem declarar APIs indisponíveis no runtime |
| Estado e UI | Não há biblioteca externa a migrar. Context/hooks e componentes simples podem continuar até necessidade demonstrada |

Fontes de ciclo de vida: [Electron](https://www.electronjs.org/docs/latest/tutorial/electron-timelines),
[Node](https://nodejs.org/en/about/previous-releases),
[ESLint](https://eslint.org/version-support/) e
[Asset Modules](https://webpack.js.org/guides/asset-modules/).

As consultas mostraram incompatibilidades declaradas que impedem recomendar
simplesmente todas as versões `latest`:

- `@typescript-eslint` 8.72.1 aceita TypeScript `>=4.8.4 <6.1.0`, não 7.0.2.
- `eslint-plugin-react` 7.37.5 e `eslint-plugin-import` 2.32.0 não incluem ESLint 10
  nos intervalos de peers publicados.
- Electron 45.1.0 declara Node de tooling `>=22.12.0`; Forge 8.0.1 exige ao menos
  `22.13.0`. Essa informação não substitui a identificação do Node embarcado.

Fontes: [typescript-eslint](https://registry.npmjs.org/@typescript-eslint/eslint-plugin/8.72.1),
[plugin React](https://registry.npmjs.org/eslint-plugin-react/7.37.5) e
[plugin import](https://registry.npmjs.org/eslint-plugin-import/2.32.0).
Não usar instalação forçada como substituto da matriz de compatibilidade.

Prettier tem configuração, mas não está declarado: publicação consultada `3.9.10`;
avaliar inclusão autorizada. Não há cliente de comunicação. Como candidatos, foram
consultados `amqplib` `2.2.0` e CLI Tauri `2.12.4`, sem instalação ou validação.
Node `18.16.0` em `.nvmrc` deve ser substituído por LTS suportado compatível com a matriz.

## Avisos diretos e transitivos

| Resultado da consulta | Quantidade |
| --- | --- |
| Nomes associados a avisos | 50 |
| Registros retornados, incluindo ocorrências por faixa | 196 |
| URLs distintas de aviso | 178 |
| Críticos, após deduplicação por URL | 4 |
| Altos, após deduplicação por URL | 77 |
| Moderados, após deduplicação por URL | 74 |
| Baixos, após deduplicação por URL | 23 |

Essas correspondências não equivalem a falhas exploradas nem substituem análise de
alcance. Não cobrem integralmente os binários Chromium/Node embarcados. O catálogo
pode receber correções retroativas e mudar os totais em nova consulta.

| Pacote / cadeia identificada | Evidência do catálogo | Tratamento proposto |
| --- | --- | --- |
| Electron `23.2.3` | Heap buffer overflow em NativeImage e outros avisos | Atualizar runtime; verificar pré-condições de cada aviso |
| `webpack-dev-server 4.13.2` → `webpack-dev-middleware 5.3.3` | Path traversal e exposição no servidor de desenvolvimento | Atualizar dependências superiores e restringir ambiente de desenvolvimento |
| `@electron/rebuild 3.2.12` → `tar 6.1.13` | Avisos de extração/processamento | Atualizar cadeia de build |
| `semver 5.7.1 / 6.3.0 / 7.4.0` | ReDoS em diferentes faixas | Corrigir múltiplas ocorrências via dependências superiores |
| `selfsigned 2.1.1` → `node-forge 1.3.1` | Recursão ASN.1 | Atualizar cadeia de certificados de desenvolvimento |
| `http-proxy 1.18.1` → `follow-redirects 1.15.2` | Tratamento de URLs | Atualizar cadeia do proxy |
| `css-loader 6.7.3` → `postcss 8.4.21` | Erro de parsing e outros avisos | Atualizar cadeia de estilos |

Fontes primárias: [Electron/NativeImage](https://github.com/electron/electron/security/advisories/GHSA-6r2x-8pq8-9489)
e [Webpack middleware](https://github.com/webpack/webpack-dev-middleware/security/advisories/GHSA-wr3j-pwj9-hqq6).
Registros adicionais: [semver](https://github.com/advisories/GHSA-c2qf-rxjj-qqgw),
[node-forge](https://github.com/advisories/GHSA-554w-wpv2-vw27),
[follow-redirects](https://github.com/advisories/GHSA-jchw-25xp-jwwc) e
[PostCSS](https://github.com/advisories/GHSA-7fh5-64p2-3v2j).

Os quatro avisos críticos retornados foram:

| Pacote resolvido | Aviso |
| --- | --- |
| `proxy-addr 2.0.7` | [Spoofing de IP por subnet IPv4-mapped IPv6](https://github.com/advisories/GHSA-jqcg-44mw-7w3h) |
| `shell-quote 1.8.1` | [Escape de newline em valores `.op`](https://github.com/advisories/GHSA-w7jw-789q-3m8p) |
| `tar 6.1.13` | [DoS por entrada ilimitada](https://github.com/advisories/GHSA-23hp-3jrh-7fpw) |
| `websocket-driver 0.7.4` | [Corrupção de mensagens por cabeçalhos de tamanho](https://github.com/advisories/GHSA-xv26-6w52-cph6) |

Os quatro são transitivos marcados `dev: true`. Isso não comprova exposição no
aplicativo distribuído; ainda há risco para build/desenvolvimento. Electron também
está em `devDependencies`, mas seu runtime compõe o aplicativo distribuído. A posição
de `classnames` em desenvolvimento não comprova erro de empacotamento, pois é importado
e pode ser incluído no bundle pelo Webpack.

Nomes associados a avisos na consulta:

```text
@tootallnate/once, ajv, body-parser, brace-expansion, braces, browserslist,
compression, cookie, cross-spawn, deepmerge, electron, express, extract-zip,
flatted, follow-redirects, http-cache-semantics, http-proxy-middleware, immutable,
ip, js-yaml, launch-editor, lodash, lodash.template, micromatch, minimatch,
nanoid, node-forge, on-headers, path-to-regexp, picomatch, postcss,
postcss-selector-parser, proxy-addr, qs, semver, send, serialize-javascript,
serve-static, shell-quote, source-map-js, tar, tmp, uuid, webpack,
webpack-dev-middleware, webpack-dev-server, websocket-driver, word-wrap, ws, yaml
```

## Próxima verificação autorizável

Na fundação, após aprovação de matriz e instalação, repetir a análise com árvore
efetiva, revisar alcance no build e pacote, executar checks e registrar o relatório.
Priorizar atualização de dependências superiores; overrides transitivos ou troca de
ferramentas precisam de justificativa. Nenhuma correção foi executada nesta etapa.

## Navegação do registro histórico

Os links de código acima apontam para o commit auditado, preservando o conteúdo dos
achados mesmo após remoções/movimentações do legado. O status de remediação atual
está nas [evidências da 2B](../07-testing/desktop-boundary-2b.md); o texto desta
auditoria não é uma reavaliação do código atual.

## Registro posterior à auditoria — cliente 4A.2B

Em 2026-10-29, sob o contrato autorizado 4A.2B, instalado **amqplib 2.2.0** exato
com tipos incluídos e sem dependências de produção transitivas. Manifesto/lock só
adicionaram esse pacote; sem @types/amqplib, atualizações alheias ou auto-fix.
Cliente restrito ao main, API callback pública sem recovery. A alteração não
reescreve o diagnóstico histórico do legado acima nem homologa o runtime/broker.

npm audit executado: 6 avisos conhecidos de tooling (2 baixos/4 moderados), sem
alerta para amqplib na consulta. Dependências reportadas: plugin-webpack,
fork-ts-checker-webpack-plugin, webpack-dev-server, deepmerge, sockjs e uuid.
Ausência de alerta não comprova ausência de vulnerabilidade. Sem high/critical no
relatório consultado. [Evidências da implementação](../07-testing/amqps-4a2b.md).

## Exceção aceita em 2026-10-30 — amqplib 2.2.0

ADR-0008 A autoriza alterar somente o agendamento inicial de acceptLoop, antes do
callback público. Gate original encontrou seis crashes/11 cenários; não é CVE
consultado. tools/patches registra diff e verifica versão/hashes. Postinstall aplica,
check/start/package/build recusam fonte inesperada. Lock preserva versão/integridade
upstream e muda apenas hasInstallScript da raiz; distribuição contém código local
modificado. Gate corrigido tem 30 cenários sem saída anormal, instalação limpa
isolada e regressões do probe/adapter aprovadas. Evidências em sessions-4a2c.md.

Manter proveniência/licença MIT da biblioteca. Remover patch somente após versão
upstream corrigida aprovada e gates/regressões equivalentes; ainda não há essa
atualização validada. Sem outro cliente/transitiva nova.
