# Estado atual do projeto

Atualizado em: 2026-10-28.

| Campo | Estado |
| --- | --- |
| Etapa atual | 2B — Fronteira segura e ciclo desktop |
| Status | Concluída e aprovada por “Aprovado”; commit de entrega autorizado |
| Última etapa concluída | 2B — Fronteira segura e ciclo desktop |
| Último commit | Entrega 2B: `fix(desktop): secure Electron process boundaries`; obter SHA com `git log -1 --format='%h %s' -- AGENTS.md docs`. Base anterior: `27e4f95` |
| Decisões aprovadas | Diretrizes; auditoria 0; conclusão/commit da 1A; sete ADRs Accepted; Electron incremental e matriz candidata; MVP; requisitos/limites/metas e estratégias de testes/segurança; conclusão e commit da 1B; execução da 2A, incluindo instalações e artefatos locais; conclusão e commit da 2A; execução e organização desktop da 2B; conclusão e commit da 2B |
| Decisões pendentes | Contrato/autorização da 3A; incorporação das alterações locais de assets; estrutura dos módulos futuros; design detalhado; infraestrutura de release e autenticações adicionais; alternativas caso gates de implementação falhem |
| Tarefas concluídas | Ponte mínima/IPC validado; sandbox/CSP/protocolo local; ciclo desktop; CSS extraído; erros sanitizados; 65 testes; instalação limpa, desenvolvimento e package/smoke local; revisão e documentação |
| Tarefas pendentes | Conferir commit aprovado da 2B; contrato/autorização da 3A; preservar assets locais; CI remota, demais alvos, UX nativa e gates de release |
| Problemas conhecidos | Sem integração RabbitMQ; controles dos módulos/gates de release pendentes; seis entradas low/moderate no tooling; makers e demais alvos não homologados; CI remota não executada; provider Linux e metas não medidos |
| Próxima ação autorizada | Registrar/conferir commit aprovado da 2B e apresentar contrato da 3A; não executar 3A sem autorização |

## Autorização e limites

O proprietário respondeu **“Aprovo”** à entrega da Etapa 0 e à autorização solicitada
para a Etapa 1A, mantendo as escolhas técnicas e o MVP como propostas. Essa aprovação
não selecionou Electron nem Tauri e não autorizou implementação ou atualização de
dependências.

Após a apresentação da entrega documental, o proprietário respondeu **“Aprovado”**
à solicitação de aprovação de conclusão da Etapa 1A e do commit
`docs(audit): document legacy audit and modernization proposals`, registrado em
`c292b35`. Posteriormente, a resposta **“Autorizado”** aprovou o contrato documental
da 1B. Na revisão seguinte, **“Aprovado”** aceitou explicitamente os ADRs 0001–0007,
MVP, requisitos/limites, conclusão e commit `docs(architecture): define desktop
architecture and requirements`. A resposta posterior **“Autorizado”** aprovou especificamente o contrato da 2A,
incluindo instalação de dependências e verificações com artefatos locais. Após a
apresentação dos resultados, **“Sim”** aprovou a conclusão da 2A e autorizou o commit
`chore(setup): modernize desktop development foundation`, sem autorizar a 2B.

O proprietário informou **“Nada definido”** quanto a ambientes/CPU/autenticação.
Windows 11 x64, Ubuntu 24.04 LTS x64, macOS 14 arm64/x64 e RabbitMQ 4.4.0/4.3.6 são
alvos de referência aprovados para testes, sem homologação. TLS e usuário/senha
compõem o recorte aceito; requisitos corporativos não foram presumidos.

Branch utilizada: `chore/modernization-app`. O working tree estava limpo antes da
escrita da 1B, com HEAD `c292b35`. O [contrato](roadmap.md) lista 12 novos documentos e
sete atualizados na apresentação. A aprovação sincronizou também a visão do produto,
totalizando oito atualizados naquela entrega.
Na conclusão da 1B não havia implementação ou instalação. Na 2A, a fundação e os
ajustes mínimos foram implementados conforme contrato. Na apresentação da 2B, assets e licença permaneciam intactos; os achados históricos
foram preservados. Posteriormente surgiram alterações locais de assets descritas abaixo.
Na 2B, os links de código da auditoria passaram a apontar para o commit auditado,
para continuar consultáveis após a remoção da ponte legada. O commit da 2A foi autorizado após sua revisão;
nenhum broker, container ou push foi executado.

## Retomada

1. Ler [AGENTS.md](../../AGENTS.md), a
   [avaliação tecnológica](../03-architecture/technology-evaluation.md), o
   [roadmap](roadmap.md) e o [progresso](progress.md).
2. Verificar branch, HEAD, diff e arquivos não rastreados, preservando alterações.
3. Conferir eventuais aprovações posteriores à atualização deste estado.
4. Conferir o commit aprovado da 2B pela mensagem acima; se ainda não existir,
   concluir apenas esse registro autorizado, excluindo os assets locais posteriores.
5. Preservar as alterações de assets e apresentar o contrato da 3A; aguardar
   autorização específica antes de executar a etapa.

Resultados de verificação e limitações estão no [registro de progresso](progress.md).

Resultados: [evidências da 2A](../07-testing/foundation-2a.md). O teste local usa
macOS 27.0.1 arm64, sem comprovar o mínimo macOS 14 ou os outros alvos aprovados.

A resposta posterior **“Autorizado”** aprovou executar a 2B conforme contrato no
roadmap. O Git estava limpo em `27e4f95`. A resposta posterior **“Aprovado”**
aprovou sua conclusão e autorizou o commit `fix(desktop): secure Electron process
boundaries`, sem autorizar executar a 3A.

A entrega da 2B foi aprovada; ver [evidências](../07-testing/desktop-boundary-2b.md).
O commit foi autorizado; não houve push, conexão RabbitMQ ou publicação.

## Alterações locais posteriores à apresentação

Preservadas e excluídas do commit aprovado da 2B:

- Modificados: `assets/icons/bunnies.png`, `assets/images/logo.png`,
  `assets/images/appIcon.ico`.
- Novos: `assets/logotipos/bunnies-logo.png` e
  `assets/logotipos/bunnies-logo-extensive.png`.

Não foram gerados por esta execução e não integraram o pacote/ASAR testado da 2B.
A aprovação da 2B não deve incorporá-los silenciosamente; sua avaliação visual
poderá ocorrer na 3A, mediante autorização. Não reverter ou sobrescrever esses arquivos.
