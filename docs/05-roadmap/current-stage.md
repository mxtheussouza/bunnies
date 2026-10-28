# Estado atual do projeto

Atualizado em: 2026-10-28.

| Campo | Estado |
| --- | --- |
| Etapa atual | 1B — Planejamento e decisões arquiteturais |
| Status | Concluída e aprovada; decisões registradas nos sete ADRs Accepted e nesta entrega documental |
| Última etapa concluída | 1B — Planejamento e decisões arquiteturais |
| Último commit | Entrega 1B: `docs(architecture): define desktop architecture and requirements`; identificar o SHA com `git log -1 --format='%h %s' -- AGENTS.md docs`. Base anterior: `c292b35b4b75c53695fbef6beab7d573b688d8c0` |
| Decisões aprovadas | Diretrizes; auditoria 0; conclusão/commit da 1A; sete ADRs Accepted; Electron incremental e matriz candidata; MVP; requisitos/limites/metas e estratégias de testes/segurança; conclusão e commit da 1B |
| Decisões pendentes | Contrato/autorização da 2A; estrutura física final; design detalhado; infraestrutura de release e autenticações adicionais; alternativas caso gates de implementação falhem |
| Tarefas concluídas | Reconsulta oficial; 38 requisitos funcionais, 30 não funcionais, 15 critérios de MVP, arquitetura, sete ADRs, 12 cenários de teste e modelo de segurança; revisão e verificações documentais aprovadas |
| Tarefas pendentes | Apresentar contrato da 2A e obter autorização específica; implementar e verificar os gates nas etapas correspondentes |
| Problemas conhecidos | Código legado ainda sem integração e com riscos abertos; matriz não instalada/testada; provider Linux e automação experimental exigem gates; metas não medidas |
| Próxima ação autorizada | Conferir o registro do commit aprovado da 1B e apresentar contrato da 2A; aguardar autorização específica antes de instalar ou alterar código |

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
architecture and requirements`. Isso não autoriza executar a 2A.

O proprietário informou **“Nada definido”** quanto a ambientes/CPU/autenticação.
Windows 11 x64, Ubuntu 24.04 LTS x64, macOS 14 arm64/x64 e RabbitMQ 4.4.0/4.3.6 são
alvos de referência aprovados para testes, sem homologação. TLS e usuário/senha
compõem o recorte aceito; requisitos corporativos não foram presumidos.

Branch utilizada: `chore/modernization-app`. O working tree estava limpo antes da
escrita da 1B, com HEAD `c292b35`. O [contrato](roadmap.md) lista 12 novos documentos e
sete atualizados na apresentação. A aprovação sincronizou também a visão do produto,
totalizando oito atualizados; este estado integra o commit aprovado da 1B.
Nenhuma implementação, instalação, container ou push foi executado. Os arquivos de
auditoria histórica e o código legado permanecem intactos.

## Retomada

1. Ler [AGENTS.md](../../AGENTS.md), a
   [avaliação tecnológica](../03-architecture/technology-evaluation.md), o
   [roadmap](roadmap.md) e o [progresso](progress.md).
2. Verificar branch, HEAD, diff e arquivos não rastreados, preservando alterações.
3. Conferir eventuais aprovações posteriores à atualização deste estado.
4. Confirmar o commit documental da 1B pela mensagem acima; se ainda não existir,
   concluir somente seu registro já aprovado.
5. Apresentar contrato da 2A e aguardar autorização específica. A decisão aceita de
   stack não autoriza instalação ou implementação automaticamente.

Resultados de verificação e limitações estão no [registro de progresso](progress.md).
