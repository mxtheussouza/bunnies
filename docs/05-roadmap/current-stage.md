# Estado atual do projeto

Atualizado em: 2026-10-31. Ler [PROJECTS_STATUS.md](../../PROJECTS_STATUS.md) antes
de cada Task; atualizá-lo em cada bloco/fase/alteração.

| Campo | Estado |
| --- | --- |
| Etapa atual | 4B.1 — contexto administrativo de leitura / ADR-0009 A |
| Status | Concluída/aprovada por “Autorizado”; entrega registrada neste commit |
| Última etapa concluída | 4B.1 — contexto administrativo de leitura, incluindo ADR-0009 A |
| Último commit | feat(management): add bounded broker information and vhost reads — commit deste registro, pai aba792d; identificador em git log -1 |
| Decisões aprovadas | ADRs 0001–0009 (0008/0009 alternativas A), MVP/requisitos/design, contratos C-01–07/4B.1 e respectivos limites |
| Decisões pendentes | Próxima etapa depende de contrato/autorização próprios; nenhuma implementação adicional aprovada |
| Tarefas concluídas | 4B.1 implementada, gate A 24, check 266 + seis Node, package/seis smokes e matriz final 60 checks reais passaram |
| Tarefas pendentes | Próximas fases e homologações fora do recorte, sujeitas a contratos/aceites próprios |
| Problemas conhecidos | Paginação HTTP de vhosts retorna 500 na matriz; GET individual exige admin e normaliza dot-segments; limitações anteriores mantidas |
| Próxima ação autorizada | Aguardar instrução para preparar a etapa seguinte; sem push ou 4B.2 automáticos |

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

## 2026-10-30 — Preparação 4B.1

4A.2C registrada/conferida em aba792d, working tree inicialmente limpo na retomada.
“Continuar para a próxima etapa” inicia preparação do contrato seguinte.
[4B.1 Proposed](roadmap.md): versão informada, páginas de vhosts visíveis e leitura
específica do vhost atual, sem troca de contexto. Gate real antes de UI, quatro
métodos específicos propostos (26 total) e sublimits/regras de ciclo de vida
explicitados. FR-019/020 continuam parciais; seleção depende da futura 4B.2.

Somente cinco documentos de planejamento/estado alterados. Produto/guia/lock/assets
preservados. Sem novas execuções funcionais, brokers, package/smokes ou commit/push.
Próxima ação: apresentar proposta e aguardar aprovação antes da implementação.

## 2026-10-30 — 4B.1 autorizada; gate real reprovado

“Autorizado” aceitou 4B.1/B1-D01–08/B1-01–10. Gate inicial em brokers oficiais
4.4.0/4.3.6 arm64 confirmou quatro cenários aprovados/onze falhas por versão;
48 respostas diagnósticas por versão, cleanup completo. Paginação devolve 500
com function_clause inject_dqt; GET individual exige admin (401 por tag), e
rotas de `.`/`..` não preservam o alvo. A UI/IPC/produto dependentes não começaram.

[ADR-0009 Proposed](../03-architecture/adr/0009-management-vhost-read-contract.md)
recomenda A: lista completa limitada 200/256 KiB, sem paginação/GET individual;
três métodos (25 total), visibilidade do vhost atual derivada do snapshot.
Não aplicada; exige aceite e novo gate antes de dependentes. B/C documentadas.
[Evidências](../07-testing/management-4b1.md). Check passou com 237 testes + seis
Node existentes, sem package/smokes novos. Guias/patch/dependências preservados.
Sem conclusão/commit/push ou 4B.2. Próxima ação: apresentar decisão para aprovação.

## 2026-10-30 — ADR-0009 A aceita, gate aprovado e 4B.1 retomada

“Autorizado” aceitou aplicar/testar A e retomar 4B.1 após seu gate. Gate com o
mesmo adapter passou 12 verificações por versão, 24 total, em 4.4.0/4.3.6 isolados.
200 nomes aceitos/201 recusados, tipos de usuário e nomes especiais provados;
limites/cancelamento e cleanup confirmados. O histórico inicial continua válido
como reprodução reprovada, sem confusão com esse recorte revisado.

Adapter/serviço/IPC/UI/guia implementados em validação. Ponte com 25 métodos,
dois GETs fixos, nenhum GET individual, paginação ou seletor de vhost. Check
passou 265 testes/36 arquivos + seis Node; package local passou. Smokes/matriz e
revisão final em andamento, não aprovados antecipadamente. Guia/Ajuda 15 tópicos.
Sem nova dependência, commit/push ou 4B.2.

## 2026-10-30 — 4B.1 verificada, pronta para revisão

Recorte A completo: check **266 testes/36 arquivos + seis Node**, package/seis
smokes sequenciais e matriz final **60 verificações**, 30 por versão real, passaram.
Gate A 24 checks permanece evidência separada da matriz no executável. Cleanup
completo, nenhum recurso alheio tocado. Guia/Ajuda 15 tópicos/12 campos.
ASAR final cdaecf532c9e14e01c3ca894aa9cd705f6784d7a04201837096c9592e3b29862,
999017 bytes; patch/licença/25 métodos/guardas conferidos, sem fixtures/keys.
Capturas/teclado/foco/limites/origem revisados; [evidências](../07-testing/management-4b1.md).

Só macOS arm64/nó único testados; demais alvos/HA/nativos/assistivas/providers/
releases não homologados. M01/M06/FR-019/020 continuam parciais, sem seleção de
vhost ou administração avançada. Próxima ação autorizada: apresentar entrega e
solicitar conclusão/commit feat(management): add bounded broker information and vhost reads.
Sem commit/push ou próxima fase antecipados.

## 2026-10-31 — Conclusão/commit 4B.1 aprovados

“Autorizado” aceitou a entrega apresentada e autorizou o commit
feat(management): add bounded broker information and vhost reads. Os 46 arquivos e
ASAR conferem com a revisão apresentada; sincronização do aceite documental sem
alteração de código/guia ou repetição funcional. Limitações/resultados mantidos.
Este registro integra o commit de entrega (pai aba792d; hash em git log -1).
Sem push, nova implementação ou preparação automática da 4B.2.
