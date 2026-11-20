# Etapa 5B — evidências da declaração de filas

Atualizado em 2026-11-20. Status: **5B concluída, aprovada e registrada**.
O proprietário autorizou o [contrato 5B](../05-roadmap/roadmap.md#contrato-proposto--5b-declaração-de-filas-classic-e-quorum)
por “Autorizo”. Base de trabalho em `main`, HEAD `cd1c2bf`.

## Gate pré-UI

`node tools/testing/rabbitmq-real.cjs --declaration-gate` compilou o adapter
de produto e executou RabbitMQ 4.4.0 e 4.3.6 em macOS arm64, com imagens
oficiais fixadas por digest, TLS e prefixo Management HTTPS.

| Versão | Primeira execução | Repetição | Limpeza |
| --- | --- | --- | --- |
| 4.4.0 | Oito grupos aprovados, um reprovado | Nove aprovados | Completa |
| 4.3.6 | Oito grupos aprovados, um reprovado | Nove aprovados | Completa |

A primeira execução exigia zero em uma métrica de churn que o broker
omitiu. A repetição conferiu zero canais atuais e nenhum evento de
criação, junto com a preservação de filas, exchanges e bindings de
fixture. O relatório da primeira execução foi preservado em
`out/queues-declaration-gate-5b-first-results.json`.

Nas duas versões, passaram classic/quorum, flags fixas, argumentos
ausentes/zero/limite, DLX padrão/nomeada, routing key vazia, negativos
de permissões, homônimos, nomes exatos e vhost `detailed`. Redeclaração
equivalente preservou a fila. A equivalência estrita recusou conflitos,
e a conferência viu quorum quando o broker aceitou classic com a
equivalência relaxada. O ajuste de equivalência foi temporário nos
brokers próprios do harness.

A fixture HTTPS confirmou zero PUTs antes do envio abortado, um PUT
quando a resposta se perdeu, nenhum seguimento de redirect, interrupção
após envio e limite de corpo na conferência. Relatório final em
`out/queues-declaration-gate-5b-results.json`.

## Implementação e verificação parcial do pacote

`npm run check` passou com 291 testes em 39 arquivos e seis testes Node,
incluindo autorização, concorrência, cancelamento nas três fases, prazo,
DTOs sanitizados e fluxo de formulário. Typecheck, lint, formatação e
sincronização da fonte do guia com Markdown/Ajuda passaram. São 17
tópicos e 12 campos de perfil. Após a integração, o gate real repetiu as
18 verificações em 4.4.0 e 4.3.6. Zero containers ou redes do harness
restaram.

`npm run package` passou em macOS arm64. ASAR com 1.048.797 bytes e SHA-256
`d7d7dd7d3cd9f3c1dd0aed2daa6abe7046d80a80aa98eda79ab423f1bfefc25d`.
A revisão conferiu 15 entradas, licenças, os comandos de declaração e
cancelamento, a Ajuda empacotada, os limites da ponte e a ausência de
fixtures e chaves. Smokes de Perfis, HTTPS e AMQPS passaram neste ASAR.

A sessão gráfica estava bloqueada. Ficaram pendentes nessa rodada
o smoke base/Ajuda, Sessão, Management, troca de vhost, Filas, declaração
(`node tools/testing/management.cjs --declare-queue`) e matriz
(`node tools/testing/rabbitmq-real.cjs --declaration-matrix`), além da
revisão das capturas em ambos os temas a 200%. Builds e smokes nativos em
Windows e Linux, cluster/HA, assistivas e releases seguem pendentes.
As verificações foram retomadas no mesmo ASAR após desbloquear a sessão.

## Retomada, regressões e matriz no pacote final

Com foco nativo disponível, passaram os nove smokes sequenciais no
mesmo ASAR: base/Ajuda e segurança, Perfis, HTTPS, AMQPS, Sessão,
Management, transição de vhost, Filas e declaração. O caso de
declaração passou cinco grupos. Confirmou os metadados depois do PUT,
a verificação manual, permissão negada sanitizada e cancelamento
após envio com resultado incerto e um único PUT. Foram revisadas
as capturas `out/queue-declaration-5b-{light,dark}-zoom.png` a 200%,
com foco visível e contexto de produção.

A primeira matriz em 4.4.0 chegou a 19 grupos e atingiu o prazo ao
esperar a recusa explícita de uma redeclaração com nome Unicode e
percentual. Limpou os recursos próprios. O gate diagnóstico nas
duas versões observou 5xx neste cenário. A leitura independente
confirmou que o TTL armazenado permanecia o original. A variante
com nome ASCII recebeu recusa explícita por propriedades
incompatíveis. A classificação conservadora de 5xx já prevista no
contrato foi mantida. O harness passou a testar os dois resultados;
o gate repetido com o cenário adicional passou **20 verificações**,
dez por versão, com limpeza. Artefatos históricos:
`out/rabbitmq-real-5b-4.4.0-first-results.json` e
`out/queues-declaration-gate-5b-unicode-first-results.json`.

A matriz repetida no executável confirmou classic/quorum em vhost
temporário e `detailed`, redeclaração equivalente, conflitos,
recusa sem permissão de configuração, versão, sessão e a regressão
5A da listagem/detalhe. A consulta manual no caso incerto encontrou
o TTL anterior. O inventário final continha as filas preexistentes
intactas e apenas as novas filas previstas. Zero canais, consumidores
e conexões retidas. O observador do gate conferiu também as exchanges
e os bindings preexistentes.

| RabbitMQ oficial arm64 | Verificações no executável | Limpeza |
| --- | --- | --- |
| 4.4.0 | 38 aprovadas | Completa |
| 4.3.6 | 38 aprovadas | Completa |

O resultado está em `out/rabbitmq-real-5b-results.json`. Docker
confirmou zero recursos restantes por label. Check, ASAR e guia foram
conferidos após os ajustes do harness. Em 2026-11-20, “Aprovado”
aceitou a conclusão e autorizou o registro local
`feat(queues): add verified queue declarations`, com pai `cd1c2bf`.
Validação nativa em Windows e Linux e cluster/HA seguem pendentes.
