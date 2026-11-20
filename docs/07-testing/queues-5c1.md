# Etapa 5C.1 — evidências de purge

Atualizado em 2026-11-20. **Concluída, aprovada e registrada**.
“Aprovo” autorizou executar o
[contrato da 5C.1](../05-roadmap/roadmap.md#contrato-proposto--5c1-purge-com-confirmação-nativa).
Base da execução em `main`, commit `dd52421`.

## Gate do adapter

`node tools/testing/rabbitmq-real.cjs --purge-gate` compila o adapter
de produto e provisiona as imagens oficiais 4.4.0 e 4.3.6 fixadas por
digest. Os testes usam TLS e prefixo Management HTTPS em loopback no
macOS arm64. Um observador separado do produto prepara as mensagens
e confere identidade, vínculos e estados do broker. Os containers,
redes, certificados e perfis são descartados pelo harness.

| Rodada | RabbitMQ 4.4.0 | RabbitMQ 4.3.6 | Limpeza |
| --- | --- | --- | --- |
| Inicial | Três verificações passaram, seis falharam | Três passaram, seis falharam | Completa |
| Negociação ajustada | Dez verificações passaram | Nove passaram, uma falhou | Completa |
| Diagnóstico de fila ausente | Dez passaram | Nove passaram, uma falhou | Completa |
| Gate final | Dez passaram | Dez passaram | Completa |

O DELETE de purge recebeu HTTP 406 com `Accept: application/json`
nas duas versões. A repetição confirmou esse status e passou a
aceitar a negociação do próprio endpoint no cabeçalho do DELETE.
Requisição sem corpo, TLS, limites e interpretação estrita da resposta
foram preservados. Em 4.3.6 a resposta a uma fila removida durante
o fluxo ainda foi classificada como RESPONSE. O diagnóstico distinguiu
o envelope HTTP 404 `Object Not Found` de 4.3.6 do `not_found` de 4.4.0.
A classificação trata as duas formas observadas. Os relatórios de cada
rodada estão em `out/queues-purge-gate-5c1-first-results.json` e
`out/queues-purge-gate-5c1-negotiation-results.json`, com o diagnóstico
em `out/queues-purge-gate-5c1-missing-diagnostic-results.json`.

Na repetição, classic e quorum perderam mensagens Ready, mantiveram
as entregas sem ack, a fila e seus vínculos. Na quorum com retry
adiado e dead-lettering pendente, os respectivos contadores foram
de 1 a 0 nas duas versões. Também passaram os casos de vhost exato,
homônimo em outro vhost, tipo stream e troca externa para stream
entre consulta e envio. A fixture TLS contou os DELETEs, incluindo
cancelamento antes/depois do envio, limite e redirect sem seguimento.

O check anterior à integração passou 291 testes em 39 arquivos e seis
testes Node, mais typecheck, lint, formatação e docs:check. A última
rodada do gate passou 20 verificações, dez por versão, permitindo
retomar a integração. Resultado em `out/queues-purge-gate-5c1-results.json`.

## Integração e verificações do pacote

`npm run check` passou 299 testes em 39 arquivos e seis testes Node.
Typecheck, lint, formatação e sincronização do guia passaram. O guia e
a Ajuda têm 18 tópicos e preservam os 12 campos de perfil.

`npm run package` passou em macOS 27.0.1 arm64. O ASAR contém 15
entradas e 1.059.415 bytes, com SHA-256
`2eae2c5b940d65a64ffcb9977cb5fbad93becbe03c70a913c0ff914a10a6d20e`.
Os novos métodos, a Ajuda empacotada e as licenças foram conferidos.
Fixtures e chaves estão fora do ASAR. Smokes de Perfis, HTTPS e
AMQPS passaram nesse pacote.

Após a integração, repetiram-se as 20 verificações do gate 5C.1
e as 20 do gate de declaração 5B nas versões 4.4.0 e 4.3.6,
com limpeza completa. Esta regressão executou os adapters e
tem evidência própria, separada da matriz do executável.

A sessão gráfica bloqueada deixou pendentes os smokes com foco
de janela, a visualização do diálogo nativo, as capturas dos dois
temas e a matriz real no executável. Validação nativa em Windows e
Linux e cluster/HA também seguem pendentes.

## Retomada com a sessão gráfica disponível

O proprietário informou “Validado e aprovado, pode continuar”. A
validação apresentada pelo proprietário acompanha o histórico do
projeto. As verificações abaixo usam o mesmo ASAR conferido.

Passaram os nove smokes de regressão. Na retomada com foco, passaram
base/Ajuda/segurança, Sessão, Management, troca de vhost, Filas e
declaração. Perfis, HTTPS e AMQPS já haviam passado no mesmo pacote.

O smoke de purge abriu a confirmação nativa e capturou
`out/queue-purge-5c1-native.png`. A imagem mostra perfil, Produção,
endpoint, vhost, fila, tipo e efeito irreversível. O cancelamento no
diálogo nativo por sinal deixou zero DELETEs. A mesma rodada percorreu
os cenários roteirizados de cancelamento, aceite, recusa e resposta
incerta, mas parou ao reabrir o detalhe depois de alterar tema e zoom.
A captura dos dois temas e a matriz no executável ainda dependem da
conclusão das repetições. Em duas tentativas subsequentes, a janela
de aviso do macOS permaneceu em primeiro plano e bloqueou o foco
antes de conectar. A captura nativa existente foi preservada.

## Smoke de purge completo

Com o foco disponível novamente, o primeiro smoke chegou às
capturas dos dois temas. A etapa de encerramento procurou o perfil
em Filas. O harness passou a retornar para Conexões antes da
desconexão compartilhada. A repetição passou seis grupos no mesmo
ASAR. O diálogo real abriu e o cancelamento por sinal emitiu zero
DELETEs. Respostas roteirizadas no processo de teste cobriram aceite,
recusa e cancelamento após envio. O smoke confirmou um único DELETE
no aceite, verificação por GET, foco no resultado e ausência de
replay, escrita do perfil ou rede do renderer.

Foram conferidas as capturas `out/queue-purge-5c1-light-zoom.png` e
`out/queue-purge-5c1-dark-zoom.png` a 200% com foco visível. O smoke
preservou a captura nativa anterior, do mesmo ASAR. Resultado em
`out/queue-purge-5c1-smoke-results.json`.

## Matriz no executável e registro

A primeira execução passou 13 verificações em 4.4.0 e limpou os
recursos. A conta de teste que deveria estar sem acesso ao vhost
tinha recebido permissões do fixture de purge. A repetição separou
essa negativa AMQPS da negativa de leitura na fila e preservou o
ASAR. Relatório inicial em
`out/rabbitmq-real-5c1-4.4.0-first-results.json`.

| RabbitMQ oficial arm64 | Verificações no executável | Limpeza |
| --- | --- | --- |
| 4.4.0 | 36 aprovadas | Completa |
| 4.3.6 | 36 aprovadas | Completa |

A matriz confirmou purge classic no vhost temporário `literal%2F`,
quorum em `detailed` pela consulta exata, recusa sem leitura na fila
e preservação do homônimo em outro vhost. O inventário de filas
permaneceu igual. Os três canais por execução pertenceram ao
observador que preparou as mensagens. A matriz usou respostas
roteirizadas no processo empacotado para controlar o aceite e
cancelamento. O smoke exercitou o diálogo do macOS com cancelamento
por sinal. A confirmação pelo teclado nativo, em particular o
comportamento do Esc, segue como verificação manual específica.

Relatório final em `out/rabbitmq-real-5c1-results.json`. O gate do
adapter repetiu dez verificações por versão após o ajuste do fixture.
`npm run check` repetiu 299 testes e seis Node. Hash do ASAR
conferido antes do registro. Em 2026-11-20, “Aprovado” reiterou o
aceite da 5C.1. Commit local `feat(queues): add confirmed message purge`,
com pai `dd52421`. Validação nativa em Windows/Linux, cluster/HA e
exclusão condicional seguem pendentes.
