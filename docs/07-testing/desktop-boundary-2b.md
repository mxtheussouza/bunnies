# Evidências da fronteira desktop — Etapa 2B

Data: 2026-10-28. Base: `27e4f95`, branch `chore/modernization-app`, limpa no início.
Execução aprovada por **“Autorizado”** após apresentação do contrato da 2B.
Status: **concluída e aprovada** por “Aprovado”, autorizando o commit
`fix(desktop): secure Electron process boundaries`. A 3A não foi autorizada.

## Ambiente e escopo

Host macOS 27.0.1 arm64, Node 24.22.1/npm 11.19.1, Electron 45.1.0 e Forge 8.0.1.
Não homologa macOS 14, x64, Windows ou Linux. A dependência adicionada foi
`mini-css-extract-plugin` 2.10.2, com cinco transitivas, fixada no lock. A interface
continua sendo a base legada; não houve integração RabbitMQ, cofre ou redesign.

## Controles implementados e evidências

| Área | Implementação | Evidência local |
| --- | --- | --- |
| Renderer/preload | Sandbox global e por janela; sem Node em renderer/workers/subframes; context isolation; preload recusa expor API se os flags de isolamento não estiverem ativos | Preferências efetivas, ausência de `--no-sandbox`, bridge presente após guarda de runtime; require/process/Buffer ausentes no mundo principal; process/Buffer ausentes como globais no mundo isolado |
| Ponte | Oito métodos nomeados, sem invoke/send genéricos, objetos Electron, eventos, filesystem, seletor nativo ou URL arbitrária | Testes do factory e inspeção da API no Electron real; ponte antiga retirada |
| IPC | Handler único por aplicação; verifica identidade de webContents/frame principal e URL completa; DTO plano com campos exatos e strings/ações limitadas | Testes de origem/frame/shape/tamanho; uma segunda janela real com o mesmo preload/origem recebeu FORBIDDEN |
| Clipboard/edição | Renderer só pode abrir menu nativo; escolhas de editar/copiar/colar são roles nativas e atalhos, sem comandos diretos de clipboard na ponte | Testes rejeitam comando edit/paste e verificam menu; atalho nativo de seleção em textarea sintética; popup nativo ainda exige avaliação manual por SO |
| Links externos | Identificador fixo author resolvido no main para o destino preexistente; nenhum shell/openExternal genérico na UI | URL arbitrária rejeitada no artefato; destino/catch de shell verificados com fake, sem abrir navegador no teste |
| Recursos | Protocolo bunnies://app com origem fixa; somente HTML/JS/CSS da tela e assets com nomes hash; MIME/nosniff; realpath dentro da raiz | Arquivos privados, preload, maps, hosts/URLs incorretos e traversal fora da allowlist negados; symlink fora da raiz testado em fixture temporária |
| CSP/rede | CSP de produção nos headers; CSS extraído; sem inline/eval; connect-src none; sessão cancela HTTP(S)/WS(S)/file | Injeção de script/style bloqueada, eval gera EvalError com bypass CDP desativado, CSS/logo carregados; fetch da UI e da sessão não alcançaram servidor HTTP de teste isolado |
| Navegação/permissões | Popups/webviews/frames/redirects e navegação fora da página prevista bloqueados; check/request/device permissions negados; downloads cancelados | Navegação e popup reais bloqueados; Notification negada; demais permissões/downloads cobertos por testes de política, sem homologação de todos os diálogos do SO |
| Ciclo | Uma janela principal reutilizável, referência liberada no closed; macOS conserva aplicação ao fechar; IPC usa janela atual e é removido ao sair | Duas recriações reais e activate repetido sem duplicar a principal; teste unitário de registro/remoção e troca de janela |
| Erros | Resultados com código/requestId e mensagens fixas; rejeições do transporte contidas; bootstrap/loadURL com falha sanitizada | Testes de sentinelas, ausência de stack/path no resultado e aviso visual dismissível |
| Plataforma | Versão/plataforma/modo vêm do main; estilos existentes de controles seguem o SO; DevTools indisponível e oculto no pacote | Smoke em arm64; captura conferida; detecção não equivale a homologação dos demais SOs |
| Desenvolvimento | Dev server/HMR somente localhost; CSP distinta para injeção de estilo; preload compilado sem cliente/HMR e sem shims Node | Preload/bridge/renderização/tema verificados em desenvolvimento por CDP com perfil temporário |

O schema desktop aceita apenas comandos pequenos com campos conhecidos; não foi
necessário adicionar Zod a esse contrato. Não há contrato genérico para futuros
payloads de broker. Validar depois da desserialização não impede a alocação interna
do clone IPC; isto não é proteção completa contra DoS de um renderer comprometido.

## Resultados executados

| Comando/verificação | Resultado |
| --- | --- |
| `npm ci --no-fund` | Status 0; 799 pacotes instalados; sem force/legacy-peer-deps |
| `npm install-scripts ls` | Status 0; nenhum script transitivo pendente na árvore local |
| `npm run check` | Status 0: TypeScript estrito, lint sem warnings, 65 testes em oito arquivos e formatação |
| `npm run package` | Status 0; pacote macOS arm64 com CSS extraído e preload separado |
| `npm run smoke:package` | Status 0; versão/tema, isolamento, CSP, IPC, rede, recursos, navegação e duas recriações |
| Desenvolvimento | Diagnóstico com `npm start -- -- --remote-debugging-port=<porta local> --user-data-dir=<temporário>`; bridge/renderer/tema passaram; processos e perfil próprios encerrados |
| `npm audit --json` | Status 1; permanecem seis entradas: duas low e quatro moderate, zero high/critical; mesmas cadeias deepmerge/uuid registradas na 2A |
| Conteúdo do pacote | ASAR com 12 entradas, CSS separado, sem arquivos de teste; preload com guardas de runtime e somente require externo de electron |
| CI | Job macOS configurado para o smoke após package; execução remota não realizada; sem push/publicação |

Os unitários antigos de JSON de versão no DOM foram substituídos por testes do
contrato desktop, porque esse mecanismo foi removido. A cobertura total inclui
tema, metadados pelo bridge, políticas/recursos/sessão, IPC, preload e feedback de erro.
Isso é cobertura parcial dos cenários T-01/T-10/T-12, não conclusão do MVP.

## Limites da automação e falhas intermediárias

O primeiro teste tentou ler process como global do mundo isolado. No Electron 45,
o process reduzido fica no wrapper lexical do preload. A API agora é exposta apenas
após validar seus flags nesse wrapper; a inspeção confirma que process/Buffer não
ficam disponíveis como globais. Nenhuma API de diagnóstico foi adicionada à ponte.

Outros ajustes no harness: comparar o outline anterior ao teste em vez de assumir
0px do estilo do navegador; obter o preload pelo caminho conhecido no ASAR, pois
getLastWebPreferences não o devolveu; recarregar a página após navegações
intencionalmente canceladas para sincronizar o Playwright. A remoção do comando edit
exigiu atualizar a expectativa antiga de copy; a suite passou após essa correção.
Os controles não foram desativados para fazer os testes passarem.

O teste de eval usa Runtime.evaluate com allowUnsafeEvalBlockedByCSP false, pois o
CDP permite ignorar essa política por padrão. A inspeção usa o perfil de automação
atual; não comprova um artefato com fuses de release ou distribuição assinada.

Capturas/logs locais ignorados: `out/smoke-package.png`, `out/smoke-security.png`,
`out/dev-boundary.png`, `out/dev-boundary.log`, `out/dependency-audit-2b.json`.
O servidor HTTP é fixture temporária do teste, escuta só no loopback e é encerrado;
não é backend do produto. Não foram acessados brokers nem endpoints de produção.

## Achados históricos e pendências

- TD-02/03/04/05/06/07/09/10/13/19/22 receberam tratamentos nesta fronteira, com as
  evidências e limites acima. TD-09/10 ainda exigem validação nos outros alvos.
- TD-12 recebeu contratos e restrições de import por lint; o tsconfig global ainda
  inclui tipos DOM/Node. Lint e sandbox não tornam tipos uma barreira de segurança.
- TD-14/15/16/21 continuam com pendências de estado da UI, acessibilidade, estilos
  e design; não antecipar a aprovação do design system da 3A.
- Ícones de distribuição, resolução maior, assinatura/notarização, fuses e formatos
  de instaladores continuam nos contratos próprios. Não há release homologada.
- TLS, credenciais, limites de rede, confirmação destrutiva, proteção de sessões
  RabbitMQ e sanitização de dados do broker ainda serão implementados nas etapas
  desses módulos; não estão comprovados pela base desktop.
- Não houve pentest, testes de broker/cluster, benchmark, homologação do mínimo
  macOS 14 ou execução remota da CI. Menus/atalhos e UX nativa pedem revisão manual
  adicional por plataforma; testes de teclado não simulam escolhas de um popup do SO.

Os 24 links de código da auditoria apontam agora para o commit original, pois parte
da ponte foi removida. Texto dos achados preservado; somente links e uma nota de
contexto foram alterados nos quatro documentos históricos.

A auditoria descreve a base histórica. Seu estado de remediação deve ser consultado
neste relatório e no progresso; não reinterpretar o registro original como análise
do código atual nem marcar todos os achados como resolvidos.

Fontes: [Electron sandbox](https://www.electronjs.org/docs/latest/tutorial/sandbox),
[segurança](https://www.electronjs.org/docs/latest/tutorial/security),
[protocol](https://www.electronjs.org/docs/latest/api/protocol),
[roles de menu](https://www.electronjs.org/docs/latest/api/menu-item),
[CDP Runtime](https://chromedevtools.github.io/devtools-protocol/tot/Runtime/).

Referências: [arquitetura](../03-architecture/architecture.md),
[modelo de segurança](../08-security/security-model.md),
[estratégia de testes](test-strategy.md),
[estado](../05-roadmap/current-stage.md).

## Identificação do artefato local revisado

Artefato: `out/Bunnies-darwin-arm64/Bunnies.app/Contents/Resources/app.asar`.
SHA-256: `9de90872096b2720ed0ff65e8c50ff79f111e50a72f8445ea5226ee57d55ca04`.
Gerado sobre a base `27e4f95` com as alterações da 2B ainda sem commit. O checksum
identifica esse ASAR, não é assinatura e não afirma build bit a bit reproduzível.

## Aprovação e escopo do registro

Após a apresentação das evidências e limitações acima, o proprietário respondeu
**“Aprovado”** à solicitação explícita de concluir a 2B e registrar seu commit.
A sincronização desse aceite altera somente documentação; os testes registrados
não foram repetidos nem estendidos. Não houve push.

Na conferência do Git após a apresentação, os três assets versionados estavam
modificados e havia dois novos PNGs em assets/logotipos. Essas alterações locais
posteriores foram preservadas fora do commit da 2B e não integraram o artefato
identificado pelo checksum acima. Ver detalhes no estado atual.
