# Estado atual do projeto

Atualizado em: 2026-10-30. Ler [PROJECTS_STATUS.md](../../PROJECTS_STATUS.md) antes
de cada Task; atualizá-lo em cada bloco/fase/alteração.

| Campo | Estado |
| --- | --- |
| Etapa atual | 4A.2C — sessão ativa e recuperação |
| Status | Concluída/aprovada por “Aprovado”; entrega registrada neste commit |
| Última etapa concluída | 4A.2C — sessão ativa e recuperação, incluindo ADR-0008 A |
| Último commit | feat(connections): maintain broker session and bounded recovery — commit deste registro, pai ea116de; identificador em git log -1 |
| Decisões aprovadas | ADRs 0001–0008 (0008 alternativa A), MVP/requisitos/design, contrato C-01–07 e limites 4A.2C |
| Decisões pendentes | Contrato/autorização da próxima etapa; nenhuma implementação adicional aprovada |
| Tarefas concluídas | Patch/verificador/instalação limpa/gate de 30; sessão/IPC/UI/guia; 237 testes + seis Node, package/cinco smokes e 54 checks reais |
| Tarefas pendentes | Próximas fases e homologações fora do recorte, sujeitas a contrato/aceite próprios |
| Problemas conhecidos | Cliente requer patch local controlado; demais alvos/providers/cluster/releases e testes nativos manuais não homologados |
| Próxima ação autorizada | Aguardar instrução para preparar a próxima etapa; sem push/4B autorizados |

“Autorizado” aceitou o [contrato 4A.2C](roadmap.md). O gate inicial reprovou e
interrompeu trabalho dependente; o proprietário então autorizou explicitamente
aplicar/testar a alternativa A da [ADR-0008](../03-architecture/adr/0008-amqp-lifecycle-safety.md).
Após 30 cenários sem crash e instalação limpa verificada, a implementação foi
retomada conforme item 6 da decisão aceita. A falha inicial permanece documentada
nas [evidências](../07-testing/sessions-4a2c.md), sem confundi-la com o estado atual.

Ponte fonte com 22 métodos específicos e eventos sanitizados; sessão única no main,
sem canais/mensagens/topologia e sem persistência de senha. Guia/Ajuda canônicos
acompanham a implementação. Sem troca de versão/cliente ou outro hunk.

Resultado final: **237 testes/31 arquivos + seis testes Node**, package e cinco
smokes sequenciais passaram. **54 verificações reais** (27 em cada RabbitMQ
4.4.0/4.3.6) passaram, incluindo cortes individuais/simultâneos e recuperação sem
reset de cota; recursos próprios removidos, zero canais/filas/consumidores.
Guia/Ajuda 14 tópicos/12 campos sincronizados. Capturas/ASAR/links/Git revisados.

ASAR: 03ac0e8c251a088ec4ff794db9f15e285d3689214c36d9caeb1f01616f44db25 (975117 bytes).
Artefatos intermediários têm hashes/recortes próprios; não os confundir com este.
O proprietário respondeu “Aprovado” à conclusão e ao commit apresentado. Registro
coeso nesta entrega: feat(connections): maintain broker session and bounded recovery.
Conferidos os 61 arquivos e o ASAR antes da sincronização documental do aceite;
nenhum código funcional ou guia mudou nessa sincronização. Sem push/próxima etapa.
