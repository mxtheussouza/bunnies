# Estado atual do projeto

Atualizado em: 2026-10-28.

| Campo | Estado |
| --- | --- |
| Etapa atual | 1A — Registro documental da auditoria e governança |
| Status | Concluída e aprovada pelo proprietário; entrega registrada neste commit documental |
| Última etapa concluída | 1A — Registro documental da auditoria e governança |
| Último commit | Entrega 1A: `docs(audit): document legacy audit and modernization proposals`; identificar o SHA com `git log -1 --format='%h %s' -- AGENTS.md docs`. Base anterior: `52077522486403a3d0351341c952ebb69e00b954` |
| Decisões aprovadas | Diretrizes desktop Windows/Linux/macOS; preservação de nome e identidade; fluxo de aprovação; auditoria da Etapa 0; execução, conclusão e commit da Etapa 1A na branch existente |
| Decisões pendentes | Stack e versões; arquitetura e diretórios; MVP definitivo; ADRs; design detalhado; armazenamento; testes; compatibilidade; distribuição |
| Tarefas concluídas | Inspeção do legado e histórico; análise funcional/dependências; registro em 12 documentos; revisão técnica e verificações documentais |
| Tarefas pendentes | Apresentar contrato da 1B e obter autorização específica para sua execução |
| Problemas conhecidos | Ausência de integração RabbitMQ; riscos de runtime/IPC/sandbox; execução e distribuição não homologadas; compatibilidade do tooling pendente |
| Próxima ação autorizada | Conferir o registro do commit aprovado da 1A e apresentar o contrato da 1B; aguardar autorização antes de executá-la |

## Autorização e limites

O proprietário respondeu **“Aprovo”** à entrega da Etapa 0 e à autorização solicitada
para a Etapa 1A, mantendo as escolhas técnicas e o MVP como propostas. Essa aprovação
não selecionou Electron nem Tauri e não autorizou implementação ou atualização de
dependências.

Após a apresentação da entrega documental, o proprietário respondeu **“Aprovado”**
à solicitação de aprovação de conclusão da Etapa 1A e do commit
`docs(audit): document legacy audit and modernization proposals`. A Etapa 1B
continua sem autorização; as decisões técnicas e o MVP permanecem propostos.

Branch utilizada: `chore/modernization-app`. O working tree estava limpo antes da
escrita documental. Os únicos arquivos adicionados pela entrega são `AGENTS.md` e
os 11 documentos listados no [contrato](roadmap.md).
O commit documental aprovado inclui a atualização deste estado; não houve push.

## Retomada

1. Ler [AGENTS.md](../../AGENTS.md), a
   [avaliação tecnológica](../03-architecture/technology-evaluation.md), o
   [roadmap](roadmap.md) e o [progresso](progress.md).
2. Verificar branch, HEAD, diff e arquivos não rastreados, preservando alterações.
3. Conferir eventuais aprovações posteriores à atualização deste estado.
4. Confirmar no histórico o commit documental da 1A pela mensagem acima; se ainda
   não existir, concluir somente seu registro já aprovado.
5. Apresentar o contrato da 1B e aguardar autorização específica. Não iniciá-la
   automaticamente nem interpretar o aceite da 1A como escolha de stack ou MVP.

Resultados de verificação e limitações estão no [registro de progresso](progress.md).
