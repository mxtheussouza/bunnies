# M06 — Administration

## Objetivo e status

Fornecer contexto administrativo de RabbitMQ respeitando permissões e capacidades.
Recorte 4B.1/ADR-0009 A concluído/aprovado em 2026-10-31; registro nesta entrega.
Administração avançada e seleção de vhost ainda não estão disponíveis.

## Responsabilidades e requisitos

Nesta entrega: consultar versões informadas pelo endpoint HTTPS e listar vhosts
visíveis, indicando presença exata do vhost da sessão nesse snapshot. FR-019/020
permanecem parciais: não há seleção de vhost, catálogo completo de capacidades,
CRUD de vhosts/usuários/permissões/policies/parâmetros ou mudança de privilégios.
Consultar [MVP](../02-requirements/mvp-scope.md) e
[contrato/limites](../05-roadmap/roadmap.md).

## Dependências e interfaces

- SessionService/ProfileService no main resolvem contexto/revisão/segredo transitório
  e CA, sem aceitar URL ou vhost arbitrário no IPC.
- ManagementService controla autoridade, uma operação, prazo total e invalidação;
  httpsRead usa APIs Node já instaladas e somente dois GETs fixos.
- ManagementApi compartilhada: getBrokerInfo, listSessionVhosts, cancelManagementRead;
  três novos métodos (25 na ponte desktop). DTOs fechados no main e preload.
- Painel ManagementInfo em Conexões; guia JSON compartilhado com Markdown/Ajuda.

## Regras de negócio e segurança

Operação manual exige sessão HTTPS disponível/foreground; AMQPS é independente.
Listagem completa tem limite 200 nomes/256 KiB, headers 16 KiB, profundidade 16,
prazo total 10 s e nenhum retry/polling próprio. Não paginar/truncar nem retornar
metadata extra do broker. Custo de montar a lista no servidor não é limitado pelo
limite local. Versão/capacidade ausente é desconhecida, não zero ou aprovação.

Presença no snapshot prova apenas visibilidade por HTTPS, sem permissão AMQP ou
identidade comum dos endpoints. Ausência não prova inexistência e não desconecta.
Nomes especiais/dot-segments são comparados como texto exato; não há GET individual.
Cancelar, navegar, perder foco/suspender, trocar contexto/perfil ou encerrar invalida
leituras e respostas antigas. Último sucesso e falha têm datas distintas; nada é
persistido em disco. Senhas/CA/URLs arbitrárias nunca aparecem nas respostas.

## Critérios de aceitação e testes

B1-01–10 do contrato revisados pela ADR-0009 A: gate real, allowlist/limites,
permissões, DTOs/IPC, lifecycle, teclado/foco/temas e guia sincronizado, além de
package/smokes e matriz real no executável. Nenhum teste destrutivo usa broker
externo; fixture cria/remove somente seus próprios vhosts/usuários/conexões.

Gate A passou 12 verificações por versão real (24), incluindo 200/201 e permissões.
Check final passou 266 testes/36 arquivos + seis Node; package/seis smokes e
matriz final de 60 verificações reais passaram, com cleanup. Resultados definitivos e limitações nas
[evidências](../07-testing/management-4b1.md); isso não homologa outros SOs/CPUs/HA.

## Pendências

Conclusão e commit da 4B.1 aprovados por “Autorizado”. Seleção/troca de vhost
exige contrato 4B.2 próprio; CRUD administrativo pós-MVP, providers e releases
continuam fora do recorte. A falha paginada original permanece reproduzida na
ADR-0009; o app não modifica brokers para contorná-la.

Aceite de 2026-10-31: conclusão e commit feat(management): add bounded broker
information and vhost reads aprovados, mantendo escopo/limitações apresentados.
M06 permanece parcial; este registro integra o commit da entrega. Sem push/4B.2.
