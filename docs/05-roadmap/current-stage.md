# Estado atual do projeto

Atualizado em: 2026-10-28. Ler também o histórico vivo
[PROJECTS_STATUS.md](../../PROJECTS_STATUS.md) antes de toda Task; atualizá-lo em
cada alteração/fase e registrar resultados reais.

| Campo | Estado |
| --- | --- |
| Etapa atual | DOC.1 — Histórico vivo, guia do usuário e Ajuda offline |
| Status | Concluída e aprovada por “Aprovado”; registro integra este commit |
| Última etapa concluída | DOC.1 — Histórico vivo, guia e Ajuda offline; aprovada |
| Último commit | Entrega DOC.1 que contém este estado; hash em git log -1; pai fe4a252 |
| Decisões aprovadas | ADRs/requisitos/MVP/D3A, 4A.1 e conclusão/commit DOC.1 por “Aprovado” |
| Decisões pendentes | Contrato e autorização próprios da próxima etapa; 4A.2 não autorizada |
| Tarefas concluídas | Histórico vivo/regras no AGENTS; guia por função/formulário; README; Ajuda offline com fonte única; checks/package/smokes e revisão visual |
| Tarefas pendentes | Contrato e autorização próprios da próxima fase; sem nova implementação autorizada |
| Problemas conhecidos | Providers reais e release sem homologação; senha persistente desligada; controles nativos/assistivas e outros SOs/CPUs pendentes; avisos de dependências anteriores mantidos |
| Próxima ação autorizada | Conferir Git ao retomar, manter PROJECTS atualizado e aguardar contrato/aceite de nova fase |

## Autorizações e execução

O proprietário respondeu “Aprovado!” à conclusão/commit da 4A.1 e solicitou
explicitamente histórico vivo, leitura/atualização no AGENTS, documentação no
README e Ajuda no aplicativo. A 4A.1 foi registrada em `fe4a252`; nenhum push.
A resposta posterior “Aprovado” aceitou conclusão DOC.1 e o commit apresentado;
este registro integra essa entrega, sem implementação adicional.
A 4A.2 não está autorizada.

Guia canônico: `docs/10-user-guide/guide.json`, incluído no bundle renderer e
convertido para [guia Markdown](../10-user-guide/README.md) por `docs:generate`.
`docs:check` integra `npm run check`. Ajuda usa texto/React, sem HTML arbitrário,
rede, novo IPC ou mudança da URL fixa. Sem alteração de dependências/lock/assets.

## Evidências e limites

DOC.1: check com 133 testes/18 arquivos, package e smokes de Ajuda/segurança e
perfis passaram em macOS 27.0.1 arm64. Teste negativo de Markdown divergente passou
em cópia temporária; capturas revisadas em dois temas e zoom 200%.
[Evidências DOC.1](../07-testing/help-doc1.md) e
[evidências 4A.1](../07-testing/profiles-4a1.md).

A Ajuda documenta funções atuais e indisponibilidades; não implementa rede/CA/TLS,
sessão de broker, operações RabbitMQ ou armazenamento persistente de senha.
Limitações nativas/de plataforma anteriores continuam abertas. M01/MVP não completos.

## Retomada

Ler AGENTS, PROJECTS, arquitetura, roadmap/estado/progresso e conferir Git.
Conferir o commit DOC.1 aprovado e aguardar contrato/aceite da próxima fase. Não inferir
que pendências/funções descritas no guia estejam autorizadas para implementação.
