# ADR-0009 — Leitura de vhosts nas versões de referência

ID: ADR-0009. Data: 2026-10-30. Status: **Accepted — alternativa A**.

## Contexto

A 4B.1 foi autorizada com gate inicial obrigatório de paginação/projeção/permissões
reais. O gate reprovou em RabbitMQ 4.4.0 e 4.3.6 oficiais arm64, por digest, em
nós únicos isolados. Não foi iniciada integração de produto, UI ou novo IPC.
[Evidências e reprodução](../../07-testing/management-4b1.md).

Fatos observados nas duas versões:

- `GET /api/overview?columns=rabbitmq_version,management_version` funciona para
  management; retorna as duas versões sem campos adicionais no cenário testado.
- `/api/vhosts` com `page=1/2&page_size=100&pagination=true` retorna HTTP 500;
  retirar `columns` e/ou `disable_stats` não resolve. Logs do broker mostram
  `function_clause` em `rabbit_queue_type:inject_dqt`, recebendo a entrada
  `filtered_count` do envelope paginado. A interpretação do fluxo de código é
  consistente com os logs; não é uma prova sobre todas as versões/configurações.
- Sem paginação, `disable_stats=true&columns=name` retorna HTTP 200 e lista
  completa: 116 vhosts para management e 117 para monitoring/administrator.
  A projeção é ignorada nessa lista: também chegam metadados. Respostas medidas
  foram 28994/29242 bytes. Isso não mede custo com conjuntos maiores.
- `GET /api/vhosts/{name}` retorna 401 `Not administrator user` para management
  e monitoring, inclusive com autenticação válida. Administrator recebe o objeto
  projetado para `/`, nomes com barra, escape literal e Unicode testados.
- `.` e `..`, crus ou percent-encoded, não preservam o destino individual nesse
  caminho: respectivamente lista HTTP 200 e redirect 301. Não seguir o redirect
  ou aceitar a lista como confirmação do nome individual.

A [referência HTTP](https://www.rabbitmq.com/docs/http-api-reference)
anuncia paginação para vhosts, mas a execução da matriz fixada é a evidência para
este recorte. O handler de
[vhost individual 4.3.6](https://github.com/rabbitmq/rabbitmq-server/blob/v4.3.6/deps/rabbitmq_management/src/rabbit_mgmt_wm_vhost.erl)
chama is_authorized_admin. A
[política Management](https://www.rabbitmq.com/docs/management#access-and-permissions)
distingue visibilidade por tags de permissões de mensageria. Nenhum usuário externo
teve tags ou permissões alteradas; todos os cenários usaram usuários de fixture.

## Alternativas

| Alternativa | Benefícios | Consequências |
| --- | --- | --- |
| A — Recorte explícito de lista completa limitada | Mantém a matriz, usuário com menor privilégio e nomes exatos; entrega contexto útil | Substitui paginação por leitura completa sujeita a limites; custo do servidor não é limitado pelo limite local; conjunto grande é recusado |
| B — Investigar outro patch de RabbitMQ | Pode permitir manter paginação se existir correção comprovada | Requer consultar disponibilidade/suporte, revisão da matriz e novo gate; nenhuma versão alternativa está selecionada ou homologada |
| C — Entregar somente versão/overview | Menor recorte e sem consulta de vhosts afetada | Listagem/visibilidade ficam adiadas; exige aceitar redução de escopo; não satisfaz FR-019 |

Não propor patch no broker do usuário, credencial administrativa obrigatória,
backend próprio, elevação de privilégios, troca silenciosa de versão ou paginação
visual apresentada como solução de custo de rede.

## Decisão — alternativa A aceita

**Alternativa A aceita** por “Autorizado” após apresentação. Substitui explicitamente
B1-D04/05/08 e critérios afetados do contrato original; não é fallback silencioso.

1. Manter consultas manuais sob sessão HTTPS elegível, TLS/origem/revisão,
   deadline 10 s, headers 16 KiB, profundidade 16, uma operação administrativa em
   voo, cancelamento/lifecycle e demais proteções aceitas na 4B.1.
2. Permitir no produto somente dois GETs: overview projetado e
   `/api/vhosts?disable_stats=true&columns=name&sort=name`, sem parâmetros de
   paginação. `columns=name` é solicitado, mas a validação admite os metadados
   extras recebidos e descarta-os no main, retornando somente nomes e contexto/data.
   Esta exata combinação com sort ainda exigirá gate; não alegar prova antecipada.
3. Aplicar **256 KiB** durante leitura, antes do parsing; aceitar lista completa
   de **no máximo 200 nomes**, com limites/UTF-8/profundidade/duplicatas existentes.
   Acima dos limites, rejeitar integralmente com mensagem explícita, sem truncar,
   mostrar subconjunto como completo, seguir páginas ou armazenar resposta em disco.
4. Exibir uma lista completa limitada e seu total, sem controles de paginação.
   Não implementar filtro/pesquisa adicional neste recorte. Explicar que o servidor
   pode construir uma lista maior antes do cliente interromper a leitura; esse
   mecanismo não garante baixo custo para ambientes com muitos vhosts.
5. Derivar apenas **presença do nome exato do vhost atual** nessa lista validada.
   Presente = visível no snapshot HTTPS, sem comprovar permissão AMQP; ausente =
   não listado, sem afirmar inexistência ou desconectar sessão. Não executar GET
   individual, evitando privilégio administrativo e normalização de `.`/`..`.
6. Ponte proposta de **25 métodos**, com três novos: getBrokerInfo,
   listSessionVhosts e cancelManagementRead. Remover page e getCurrentVhostInfo da
   proposta original. UUID de operação, sessionId/generation e resultado sanitizado
   permanecem; nenhum nome/URL arbitrários vindos do renderer.
7. Após aceite, provar A nas duas versões antes de integrar UI: nomes completos,
   caracteres especiais, visibilidade management/monitoring e sem tag, resposta
   de 200 aceita e 201 recusada, limite de bytes/compressão, cancelamento e cleanup.
   Atualizar contrato, NFR, testes e guia conforme recurso realmente implementado.
   Os testes do produto/smokes reais da etapa ainda serão necessários.
8. Se esse gate passar, retomar apenas o trabalho 4B.1 originalmente autorizado,
   sob esse recorte revisado. Conclusão/commit e 4B.2 continuam exigindo novos
   aceites. Se A falhar fora dessas regras, voltar a apresentar a decisão.

## Justificativa

A trata honestamente um endpoint sem paginação funcional na matriz observada,
com limites explícitos de produto conforme NFR-014/015, mantendo a separação de
transportes/permissões da ADR-0002. Elimina o GET individual desnecessariamente
privilegiado e distingue visibilidade de acesso AMQP. Não supõe uma correção do
broker que ainda não foi selecionada ou testada.

## Consequências

O contrato original não pode ser declarado atendido; sua substituição foi aceita
explicitamente e exige sincronização documental/testes conforme o recorte acima. Ambientes acima dos limites não
terão listagem nessa primeira entrega e precisam de orientação clara, sem aumento
automático de limites. Esse recorte não é solução de escala universal.

Mantidos gates de senha desligados, cliente/patch ADR-0008, JSON e allowlist HTTP
restritos. Sem nova dependência, commit, push, release, mensagem, recurso escrito ou
mudança de vhost. Não houve issue/PR ou mensagem enviada ao projeto RabbitMQ.

## Aprovação

Em 2026-10-30, “Autorizado” respondeu à solicitação explícita de aplicar/testar A
e retomar 4B.1 após seu gate passar. Decisão aceita; não equivale a implementação
ou homologação. O item 8 delimita retomada, mantendo conclusão/commit e 4B.2
sujeitos a aceites próprios. Preservar os resultados históricos acima.

## Execução do gate aceito

Gate A usando o adapter real passou 12 verificações em cada 4.4.0/4.3.6, incluindo
a combinação com sort, 200/201 nomes, visibilidade por tags, nomes especiais,
limites/compressão/cancelamento e cleanup. Conforme item 8, 4B.1 foi retomada.
Serviço/IPC/UI/guia em verificação; essa aprovação não conclui a etapa ou homologa
plataformas/HA. Resultados finais e limitações nas evidências.
