# Evidências da interface base — Etapa 3B

Data: 2026-10-28. Base `c215004`, branch `chore/modernization-app`, limpa no início.
Execução autorizada por **“Sim”** após apresentação do contrato da 3B.
Status: **concluída e aprovada** por “Aprovado”, após apresentação dos resultados
e limitações, autorizando `feat(desktop): implement application shell and themes`.

## Ambiente e escopo efetivo

Host macOS 27.0.1 (26A434), arm64, MacBookAir10,1/Apple M1, 8 GiB. Node 24.22.1,
npm 11.19.1, Electron 45.1.0 e Forge 8.0.1, já instalados. Nenhuma instalação,
alteração de manifesto/lock ou edição de assets. Não homologa macOS 14, x64,
Windows ou Linux; não há resultado de CI remota nesta entrega.

O boilerplate foi substituído por shell com navegação/contexto fixos, Conexões
vazia, Sobre, temas e pequenas primitivas. A aplicação continua **sem integração
RabbitMQ**, cofre, cadastro de perfis ou operação de broker. Os quatro destinos
dependentes explicam seu bloqueio e não exibem fixtures como uma sessão real.

## Critérios do contrato e resultados

| Critério 3B | Implementação e verificação efetiva |
| --- | --- |
| 1 — Inicialização honesta | Conexões sem perfis, sem broker/vhost ou contadores fictícios; HTTPS/AMQPS não iniciados; renderização e recarga no pacote |
| 2 — Navegação/contexto | Cinco destinos; quatro aria-disabled com razão; Sobre/Conexões locais; URL bunnies://app/app_window/index.html invariável nos fluxos testados |
| 3 — Preferência de tema | Sistema acompanha prefers-color-scheme emulado; Claro/Escuro persistem em reload; migração 0/1 real em perfil temporário; inválidos/storage indisponível e cleanup de listeners verificados em jsdom |
| 4 — Tokens/foco | CSS externo com tokens D3A; botões semânticos, controle de pular conteúdo sem hash, nomes acessíveis e foco de heading na navegação; anel visível nos previews |
| 5 — Geometria/zoom | Sidebar 224 px na vista ampla e 64 px nas vistas 1024 × 700 e 800 × 600; sem overflow horizontal do documento; zoom Chromium 2 e rolagem para ações |
| 6 — Estados | EmptyState, StatusMessage e feedback sanitizado da falha desktop; fixtures de loading/erro/parcial somente nos testes; loading impede ação duplicada |
| 7 — Desktop/teclado | Menus PT-BR com Tab/Enter/Escape e retorno ao gatilho; controles de minimizar/maximizar reais; regiões drag/no-drag; edição nativa; Cmd/Ctrl+5 fora de edição, sem atalhos destrutivos |
| 8 — Qualidade/fronteira | Check, package e smoke locais aprovados; asserções 2B mantidas, incluindo janela estrangeira, sandbox/CSP/IPC/rede e duas recriações |
| 9 — Revisão/documentação | Capturas reais abertas e revisadas; contraste medido; arquitetura, instruções e estado sincronizados; conclusão aprovada pelo proprietário |

`aria-disabled` permite foco para explicar a indisponibilidade; o handler não navega
ou executa operação. O painel compacto usa dialog modal nativo do HTML/Chromium,
com Escape, contenção de foco e retorno ao controle que o abriu. Isso não é uma
confirmação privilegiada de broker; essas confirmações continuam reservadas ao main.

## Comandos e resultados

```bash
npm run check
npm run package
npm run smoke:package
```

| Verificação | Resultado obtido |
| --- | --- |
| Typecheck | Status 0, TypeScript estrito |
| Lint | Status 0, sem warnings |
| Vitest | 82 testes em 11 arquivos, todos aprovados; sem erros não tratados |
| Formatação | Status 0, código/configuração/estilos/HTML pelo Prettier |
| Package | Status 0, pacote macOS arm64 com CSS extraído e preload separado |
| Smoke final | Status 0, executável empacotado com perfil temporário, removido ao terminar |
| Contraste em runtime | 60 pares aprovados: 48 pares de tokens lidos do CSS computado e 12 estados default/disabled de botões primary/secondary/quiet em fixtures do harness |
| Contexto/teclado | Sobre/Conexões sem mudar URL; heading recebe foco; painel conserva foco e Escape retorna ao gatilho; atalho disponível testado no pacote |
| Layout | Documento com 1024/800 px de largura nos dois tamanhos menores; sidebar 64 px; zoom de 200% sem overflow horizontal do documento e ação de Sobre alcançável por rolagem |
| Segurança 2B | Sandbox/context isolation, ausência de Node, oito métodos da ponte, CSP/inline/eval, recursos privados/traversal, rede/permissões/popups/navegação, janela estrangeira e duas recriações verificados |

Sinal do SO foi emulado por Playwright; não foram alteradas as preferências reais
do host. O zoom exato de 200% foi definido pelo harness privilegiado via Electron,
sem ampliar a API do produto. Os comandos existentes de zoom também foram exercitados;
seus limites da 2B permanecem. Tab/Shift+Tab e Escape foram usados no dialog real.
Minimizar/maximizar usaram os botões da UI e o estado real da janela, com restauração
pelo harness. Arraste foi conferido por regiões CSS, sem ensaio manual de movimento.

Medição de cor usa luminância sRGB e compara sem arredondamento, com limiares 4,5:1
de texto e 3:1 de controles/foco. Não mede todos os pixels, estados, seletores nativos
ou tecnologias assistivas e não certifica WCAG. Os botões disabled usam superfície
neutra e texto legível; a revisão corrigiu a combinação disabled/primary antes do pacote.

## Capturas e artefato identificável

Artefatos locais ignorados, regenerados pelo smoke:

- `out/ui-3b-light.png` e `out/ui-3b-dark.png`: Conexões vazia em 1440 × 900.
- `out/ui-3b-about.png`: Sobre com versão real.
- `out/ui-3b-1024.png` e `out/ui-3b-800.png`: modo compacto.
- `out/ui-3b-zoom200.png` e `out/ui-3b-panel-zoom200.png`: captura nativa a 200%,
  com rolagem do conteúdo/painel, sem reduzir tipografia.
- `out/ui-3b-results.json`: resultado e 60 medições de contraste.
- `out/smoke-package.png`, `out/smoke-security.png`: capturas dos gates locais.

Esses caminhos não existem em um checkout novo até executar os comandos; por isso
não são links documentais obrigatórios. Não foram convertidos em assets do produto.
As imagens da 3A continuam sendo mockups; estas capturas são da aplicação real.

Pacote: `out/Bunnies-darwin-arm64/Bunnies.app`. ASAR com 752078 bytes; SHA-256:

```text
c79eebc775e29e92dbc365153f214f0f66a4337fae69ee072637597e885731be
```

Inspeção do ASAR: oito arquivos, sem fontes de teste ou documentação; preload com
require externo somente de electron. Whitespace e escopo conferidos; 30 arquivos
protegidos (assets/dependências/fronteira/configuração) mantêm os hashes da base.

## Falhas intermediárias e correções

- A primeira checagem de tipos apontou import de act e opção de query de testes;
  ajustados para Testing Library. O lint apontou globals de funções serializadas;
  referências passaram a window.localStorage, sem relaxar regras.
- O smoke inicialmente incluía o select do painel fechado. Query por papel e nome
  acessíveis evita a ambiguidade; a comparação de hex normaliza caixa, sem alterar cores.
- Os novos testes de Ctrl/Meta+5 expuseram chamada de close no dialog já fechado
  (API ausente em jsdom). O handler só fecha se open; comportamento real também testado.
- A revisão visual corrigiu dois segmentos do ícone de tema e manteve o fundo ativo
  da navegação ao passar o ponteiro. Nenhuma edição dos logos.
- Screenshot CDP a 200% recortava a superfície física. O harness usa capturePage,
  aguarda o fechamento do dialog e dois frames antes da captura nativa. Não foi
  necessário alterar CSP, preload, sandbox ou código de segurança.
- Tentativas de selecionar tema com ArrowDown/Enter pelo runner não efetivaram
  a mudança e atingiram timeout. O teste final foca/rola até o select e usa
  selectOption; a interação de teclado do menu nativo requer revisão manual no SO.

## Limites e pendências

Sem VoiceOver/NVDA, homologação de acessibilidade por SO, benchmark de inicialização
ou p95, release assinado, instalador, notarização ou atualização automática.
Confirmar contraste de estados adicionais e controles nativos nas etapas pertinentes.
Zoom e janela pequena exigem rolagem; não prometem que todo conteúdo caiba de uma vez.
O teclado do menu nativo de tema não foi homologado: foco, valor selecionado e
mudança de tema foram testados, mas o runner não confirmou a seleção por setas/Enter.

Armazenamento indisponível foi simulado em teste de componente; não é teste de cofre
ou proteção do SO. A origem antiga file não é migrada para bunnies; somente a chave
dark-mode acessível na mesma origem é preservada. Não há migração de perfis/segredos.

Os achados de dependências e gates de release registrados na 2B não foram resolvidos
ou reavaliados por esta etapa. Manifesto/lock, assets, main/preload/shared e políticas
foram preservados; a exceção aprovada é a dimensão inicial 1200 × 800 em appWindow.
Não houve nova API IPC, lib UI, transporte HTTP/AMQP, servidor de produto ou push.

Conclusão e commit aprovados por “Aprovado”. A pendência manual do seletor nativo
permanece; o aceite não a converte em homologação. As subetapas propostas da 4A
requerem contrato e autorização próprios, conforme o roadmap.
