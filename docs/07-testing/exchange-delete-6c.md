# Evidências 6C — exclusão condicional de exchanges

O gate da 6C usou o comando
`node tools/testing/rabbitmq-real.cjs --exchange-delete-gate` na base
`2138fd6`, em macOS 27.0.1 arm64, com Docker Engine 29.8.0. As imagens
oficiais de RabbitMQ 4.4.0 e 4.3.6 foram fixadas por digest. Cada versão
usou broker de nó único, TLS, prefixo de Management, conta limitada,
observador separado e inventário de exchanges, bindings e filas.

| Cenário | Observação nas duas versões |
| --- | --- |
| Exchange sem bindings | HTTP 204 nos quatro tipos. Só o alvo foi removido. Vhosts `/`, `detailed` e `literal%2F` e nome com Unicode, barra e percentual literal foram exercitados. O homônimo no outro vhost foi preservado. |
| Alvo como origem para fila ou exchange | HTTP 400 com categoria `bad_request`. O inventário permaneceu igual. |
| Binding de saída inserido depois do GET | HTTP 400. O alvo e o novo binding permaneceram. |
| Alvo somente como destino | HTTP 204. O alvo e o binding de entrada foram removidos. Isso também ocorreu quando o binding foi criado entre o GET e o DELETE. |
| Origem auto-delete | HTTP 204. A exclusão removeu a exchange alvo, duas exchanges de origem em cadeia e os dois bindings da cadeia. As filas permaneceram. |
| Recriação por nome | O GET inicial observou uma exchange direct. A fixture a substituiu por uma topic no mesmo vhost e nome. O DELETE condicional retornou HTTP 204 e removeu a topic. |
| Alvo ausente | HTTP 404. A categoria JSON foi `not_found` em 4.4.0 e `Object Not Found` em 4.3.6. |
| Conta sem configure | HTTP 401 com categoria `not_authorised`. O alvo foi preservado. |
| TLS inválido e salvaguardas locais | A tentativa com CA não confiável falhou na validação do certificado. Exchange padrão, nomes reservados, interna e segmentos inválidos foram barrados antes de solicitar DELETE no harness. |
| Resposta perdida | Um proxy TLS de loopback encaminhou um único DELETE ao broker e encerrou a conexão antes de responder ao cliente. O observador confirmou o alvo ausente e o proxy registrou HTTP 204. |

## Implicações para o produto

A condição `if-unused=true` é aplicada no broker aos bindings de saída.
As duas versões demonstraram que um binding de entrada pode desaparecer
junto com o alvo e que isso pode remover outras exchanges com auto-delete.
Uma revalidação local após um diálogo reduziria a janela de concorrência.
Entre o último GET e o DELETE ainda seria possível inserir um binding de
entrada ou recriar o nome. O inventário apresentado no diálogo seria uma
observação daquele instante.

A recomendação do gate é manter a operação indisponível se o requisito de
produto for preservar todos os bindings de entrada e a instância
confirmada. Para liberar uma exclusão estritamente por nome com proteção
apenas de saída, é necessária uma decisão explícita de produto sobre
esses efeitos. Nesse recorte, confirmação contextual no main, indicação
textual de produção, revalidação, um único DELETE e resultado incerto
após perda de resposta fariam parte de um contrato próprio.

As verificações cobrem as versões de nó único e as fixtures descritas.
A execução não representa validação de cluster, plugins, interface ou
empacotamento por plataforma.

## Execução e limpeza

O gate final passou 18 verificações por versão, 36 ao todo. A segunda
rodada substituiu o descarte da resposta no cliente por uma interrupção
no proxy antes que o cliente recebesse HTTP. A regressão do gate de
leitura da 6A passou 11 verificações por versão. `npm run check` passou
314 testes em 40 arquivos, seis testes Node, typecheck, lint, formatação
e sincronização do Guia/Ajuda.

`out/exchange-delete-gate-6c-results.json` contém status, efeitos, contagem
de tentativas e resultados de limpeza. Os quatro brokers das rodadas
finais foram removidos. A conferência encontrou zero contêineres e redes
com a label do harness.

## Decisão aprovada

Em 2026-11-20, “Aprovo” aceitou manter a exclusão de exchanges indisponível
até haver proteção para os bindings de entrada e a instância confirmada.
O aceite autorizou registrar o gate e o relatório em commit local.
