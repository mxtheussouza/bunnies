# Estado atual do projeto

Atualizado em: 2026-10-28.

| Campo | Estado |
| --- | --- |
| Etapa atual | 2A — Fundação técnica |
| Status | Concluída e aprovada pelo proprietário com “Sim”; commit de entrega autorizado |
| Última etapa concluída | 2A — Fundação técnica |
| Último commit | Entrega 2A: `chore(setup): modernize desktop development foundation`; obter SHA com `git log -1 --format='%h %s' -- AGENTS.md docs`. Base anterior: `97cd313` |
| Decisões aprovadas | Diretrizes; auditoria 0; conclusão/commit da 1A; sete ADRs Accepted; Electron incremental e matriz candidata; MVP; requisitos/limites/metas e estratégias de testes/segurança; conclusão e commit da 1B; execução da 2A, incluindo instalações e artefatos locais; conclusão e commit da 2A |
| Decisões pendentes | Contrato/autorização da 2B; estrutura física final; design detalhado; infraestrutura de release e autenticações adicionais; alternativas caso gates de implementação falhem |
| Tarefas concluídas | Fundação atualizada; lock limpo; tipagem/lint/11 testes/formatação; CI preparada; início em desenvolvimento e pacote/smoke local; documentação e revisão técnica |
| Tarefas pendentes | Conferir registro do commit aprovado da 2A; contrato/autorização próprios para a 2B; validação remota e demais SOs/CPUs |
| Problemas conhecidos | Sem integração RabbitMQ; segurança da 2B pendente; seis entradas low/moderate no tooling; makers e demais alvos não homologados; CI remota não executada; provider Linux e metas não medidos |
| Próxima ação autorizada | Registrar/conferir commit aprovado da 2A e apresentar contrato proposto da 2B; aguardar autorização específica |

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
totalizando oito atualizados; este estado integra o commit aprovado da 1B.
Na conclusão da 1B não havia implementação ou instalação. Na 2A, a fundação e os
ajustes mínimos foram implementados conforme contrato. Assets, licença e auditoria
histórica permanecem intactos. O commit da 2A foi autorizado após sua revisão;
nenhum broker, container ou push foi executado.

## Retomada

1. Ler [AGENTS.md](../../AGENTS.md), a
   [avaliação tecnológica](../03-architecture/technology-evaluation.md), o
   [roadmap](roadmap.md) e o [progresso](progress.md).
2. Verificar branch, HEAD, diff e arquivos não rastreados, preservando alterações.
3. Conferir eventuais aprovações posteriores à atualização deste estado.
4. Conferir o commit aprovado da 2A pela mensagem acima; se ainda não existir,
   concluir somente esse registro já autorizado, preservando alterações alheias.
5. Apresentar o contrato proposto da 2B e aguardar autorização específica.

Resultados de verificação e limitações estão no [registro de progresso](progress.md).

Resultados: [evidências da 2A](../07-testing/foundation-2a.md). O teste local usa
macOS 27.0.1 arm64, sem comprovar o mínimo macOS 14 ou os outros alvos aprovados.
