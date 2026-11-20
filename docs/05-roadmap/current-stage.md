# Estado atual do projeto

Atualizado em: 2026-11-20. Ler [PROJECTS_STATUS.md](../../PROJECTS_STATUS.md) antes
de cada Task; atualizá-lo em cada bloco/fase/alteração.

| Campo | Estado |
| --- | --- |
| Etapa atual | 5C.1 — purge com confirmação nativa |
| Status | Concluída, aprovada e registrada |
| Última etapa concluída | 5C.1 — purge com confirmação nativa |
| Última entrega registrada | `feat(queues): add confirmed message purge` em `main`, com pai `dd52421` |
| Decisões aprovadas | ADRs 0001–0009, MVP/requisitos/design e conclusão da 5C.1 |
| Decisões pendentes | Garantia no broker para exclusão condicional |
| Tarefas concluídas | Gate 5C.1 com 20 verificações, check 299 + seis Node, package, dez smokes, capturas a 200% e matriz do executável com 72 verificações |
| Tarefas pendentes | Exclusão condicional e validação nativa em Windows e Linux |
| Problemas conhecidos | Quorum rejeita condições de exclusão e stream as ignora no código das versões de referência. Vhost `detailed` colide com a rota global de listagem de filas. Paginação HTTP de vhosts retorna 500 na matriz e GET individual exige admin |
| Próxima ação | Aguardar solicitação própria para preparar o próximo contrato |

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

## 2026-11-17 — Preparação 4B.2

“Continue de onde parou” iniciou apenas a preparação/apresentação do
[contrato 4B.2 Proposed](roadmap.md). Base `4a35424`, branch correta, Git
inicialmente limpo e entrega 4B.1 preservada.

Proposta: seleção explícita a partir de catálogo efêmero emitido no main pela
lista limitada da 4B.1; um novo método (26 total); troca AMQPS fail-closed,
somente em memória, com generation nova e sem editar o perfil. O contexto antigo
é fechado/destruído antes do novo; recusa não produz rollback silencioso.
Visibilidade HTTPS continua distinta de permissão AMQP.

B2-D01–08/B2-01–10, gate real pré-UI nas versões fixadas, arquivos, limites e
exclusões estão no roadmap. Nenhum código, guia de funcionalidade, broker,
dependência, build, teste funcional, commit ou push foi autorizado/executado.
Próxima ação: apresentar e aguardar aceite específico.

## 2026-11-17 — Gate inicial 4B.2 reprovado

Após o aceite “Autoriz”, o gate isolado confirmou quatro grupos e reprovou um
em cada RabbitMQ 4.4.0/4.3.6 arm64. Com o fechamento sem confirmação, o registro
do broker mostrou `/` e `equipe/pedidos` simultaneamente mesmo após o cliente
destruir seu socket antigo. Limpeza completa. A integração aguarda revisão
do contrato. [Evidências e alternativas](../07-testing/vhost-transition-4b2.md).

## 2026-11-17 — Revisão 4B.2 aceita e gate aprovado

“Sim” aceitou exigir confirmação do fechamento. Seis checks por versão
passaram no gate revisado. A integração inclui catálogo em memória, novo
método específico, estado e seleção temporária. O check passou com 272
testes e seis testes Node do patch. Verificações do pacote em execução.

## 2026-11-17 — 4B.2 pronta para revisão

Check final 274 + seis Node, package/sete smokes e 64 checks reais passaram
depois de ajustar a restauração de foco do harness no mesmo ASAR. Guia/Ajuda,
visual e artefato conferidos.
[Evidências](../07-testing/vhost-transition-4b2.md). Aguardar aceite da
conclusão e do commit `feat(connections): switch vhosts after confirmed close`.

## 2026-11-18 — Conclusão 4B.2 aprovada

“Aprovado” aceitou a conclusão e o commit apresentado. As evidências e as
limitações da etapa acompanham este registro. O próximo contrato depende de
solicitação própria. [Evidências](../07-testing/vhost-transition-4b2.md).

## 2026-11-18 — Proposta da 5A

“Continue” iniciou a preparação da próxima entrega em `main`, HEAD `2f1f6cc`,
com a 4B.2 integrada e a árvore inicialmente limpa. O contrato propõe
listar, pesquisar e detalhar filas por HTTPS no vhost da sessão, com dois
métodos específicos e gate real antes da integração. Criação e ações
destrutivas terão contratos próprios. A execução da 5A aguarda aceite.

## 2026-11-18 — Gate 5A reprovado

A execução autorizada encontrou a colisão de `detailed` nas duas versões.
Passaram 12 verificações e falhou uma por versão, com limpeza integral.
A integração depende do aceite da revisão e da repetição do gate.
[Evidências](../07-testing/queues-5a.md).
