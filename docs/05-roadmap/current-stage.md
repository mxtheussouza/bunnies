# Estado atual do projeto

Atualizado em: 2026-10-28. Ler [PROJECTS_STATUS.md](../../PROJECTS_STATUS.md) antes
de toda Task e atualizá-lo a cada bloco/fase/alteração.

| Campo | Estado |
| --- | --- |
| Etapa atual | 4A.2A — CA personalizada e teste HTTPS |
| Status | Concluída/aprovada por Aprovado; commit autorizado |
| Última etapa concluída | 4A.2A — CA personalizada e teste HTTPS |
| Último commit | Entrega feat(connections): add custom CA and HTTPS authentication tests; pai 66183f7; consultar hash no Git |
| Decisões aprovadas | ADRs/requisitos/MVP/D3A e entregas anteriores; execução/limites/schema e conclusão/commit 4A.2A |
| Decisões pendentes | Contratos/autorização próprios 4A.2B/C |
| Tarefas concluídas | CA/persistência v2/backup v1, probe HTTPS/IPC/UI, guia/Ajuda e documentação; check de 166 testes, package/três smokes e revisão do artefato |
| Tarefas pendentes | Conferência do commit autorizado; alteração local posterior da barra de título; homologações registradas nas evidências |
| Problemas conhecidos | Docker sem daemon impede RabbitMQ real; seletor nativo visual/tema por teclado, assistivas/outros SOs/CPUs e gates de provider/release mantidos |
| Próxima ação autorizada | Registrar/conferir somente o commit aprovado; preservar Titlebar fora da entrega; sem 4A.2B/C ou push |

## Autorização e implementação

Após o contrato detalhado, “Autorizo” aprovou CA/schema/sublimites/probe/testes.
Base 66183f7 preservada, incluindo cinco mudanças documentais da preparação.
Nenhuma dependência/stack/lock/assets alterados; sem branch nova ou push.
Após apresentação dos resultados, “Aprovado” aceitou a conclusão e o commit
`feat(connections): add custom CA and HTTPS authentication tests`.
Os 58 arquivos apresentados e o ASAR foram conferidos antes da sincronização do
aceite. Alteração local posterior em misc/window/components/Titlebar/index.tsx
permanece fora do commit e não foi incluída no pacote/testes apresentados.

[M01](../04-modules/01-connection-manager.md) explica schema v2, backup v1,
seleção pública de CA e probe específico. V1 é lido sem regravar; salvar pode migrar
com backup. Senha persistente continua desligada; senha transitória só no main,
enviada por TLS apenas ao endpoint salvo após clique explícito.

Guia/Ajuda foram atualizados e regenerados. “Autenticação HTTPS verificada” é
resultado datado, não sessão, AMQPS, versão/cluster/permissões homologados. Nove
critérios e exclusões estão no [roadmap](roadmap.md).

## Evidências e limites

[Evidências 4A.2A](../07-testing/https-4a2a.md): check aprovado com **166 testes/24
arquivos**, package e smokes base/Ajuda/segurança, perfis e HTTPS aprovados. Artefato
inspecionado; capturas dos temas/zoom revisadas. Ajuste de harness para o limite de
área útil macOS preservou a dimensão exata exigida, sem alterar produto/host.

Fixture TLS Node não substitui RabbitMQ real. docker info falhou por socket ausente;
nenhum daemon/contêiner do host foi iniciado. Seletor nativo é simulado só no main
pelo harness; revisão visual/teclado do SO permanece pendente. Outros alvos/assistivas,
provider real/assinatura/fuses/releases não homologados.

## Retomada

Ler AGENTS/PROJECTS/arquitetura/roadmap/estado e conferir Git. Continuar apenas
4A.2A autorizada ou seu aceite posterior explícito. Não instalar cliente AMQP,
ativar sessão ou executar etapa futura a partir de uma pendência do roadmap.
