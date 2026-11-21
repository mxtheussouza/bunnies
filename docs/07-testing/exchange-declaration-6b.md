# Evidências 6B — declaração de exchanges

Em 2026-11-20, na branch `main` com base em `80ad6f2`, a verificação da
parte de criação de FR-013 usou brokers RabbitMQ de nó único, com imagens
oficiais fixadas por digest, TLS e contas de teste em recursos do harness.

## Adapter e resposta do broker

O comando `node tools/testing/rabbitmq-real.cjs --exchange-declaration-gate`
executou inicialmente 24 grupos por versão. A segunda rodada acrescentou o
cancelamento durante a autorização de envio no socket TLS e conferiu o
inventário exato. Passaram 25 grupos por versão nessa rodada. O observador
comparou as propriedades de cada recurso e o estado de filas e bindings. Os
dois relatórios indicam limpeza de contêiner, rede, certificados e dados locais.

| Cenário | Resultado nas duas versões |
| --- | --- |
| direct, topic, fanout e headers | As 16 combinações de tipo, durabilidade e auto-delete passaram. Um PUT 201 e um GET 200 em cada criação |
| Declaração equivalente | PUT 204 e GET 200 com propriedades conferidas |
| Tipo, durabilidade, auto-delete ou internal incompatíveis nos nomes ASCII de referência | PUT 400 com `bad_request`, recurso preexistente preservado |
| Exchange preexistente com argumento extra de teste | PUT 204, seguido de GET 200 com o argumento original. O adapter retornou divergência |
| Usuário sem configure para o nome | PUT 401 com `not_authorised`. Inventário confirmou ausência do recurso |
| Nome exato com Unicode, barra, percentual e símbolos | O adapter preservou o nome no prefixo Management e isolou os homônimos nos vhosts de teste |
| Nomes reservados e inválidos, TLS inválido e cancelamento antes do envio | Zero PUTs recebidos pelo proxy de teste |

O proxy do harness encaminhou requisições apenas ao broker de loopback
da própria execução. O relatório registra método, código HTTP e categoria
de erro. `out/exchange-declaration-gate-6b-results.json` contém as duas
versões, os grupos por cenário e o estado da limpeza.

## Verificações locais

O package passou em macOS arm64. O ASAR tem 1.089.785 bytes, 15 entradas e
SHA-256 `101b51e7441298b62775bbd6cbb9167fb99bb57697f8ce7986fb6b85f628323a`.
Os dois métodos nomeados foram conferidos no main, preload e renderer. A
Ajuda empacotada contém 20 tópicos, incluindo os campos do novo formulário.

A primeira execução do smoke de declaração chegou à consulta manual e o
encerramento procurou o perfil na tela Exchanges. O harness foi corrigido
para retornar a Conexões antes de desconectar. As capturas do formulário
em `out/exchange-declaration-6b-{claro,escuro}-zoom.png` mostram o contexto
de produção, o destino HTTPS, foco no nome, campos e ações a 200%.

O lint inicialmente apontou três referências a globais no harness. O teste
passou a importar a classe URL do Node e a usar a referência a crypto da
janela do renderer. A validação nativa em Windows, Linux e macOS x64, a
homologação com leitores de tela e cluster/HA permanecem pendentes.


## Conflito com nome especial

A primeira matriz do pacote declarou e verificou 16 combinações em 4.4.0.
A asserção de recusa explícita ao trocar o tipo de `bunnies-new-pacote /%2F •`
falhou. Uma repetição com diagnóstico confirmou que o aplicativo devolveu
`uncertain` com motivo `SERVER`. Os ambientes parciais foram removidos.

Reproduzido separadamente no gate, o conflito no nome de fixture
`bunnies-new-homônimo /%2F #?` recebeu HTTP 500 em 4.4.0 e 4.3.6.
O harness havia esperado HTTP 400, como nos recursos ASCII anteriores.
A regra 6B-D04 já distingue resposta ambígua de recusa explícita. A
verificação passou a exigir uma única tentativa, a resposta observada e
o tipo original preservado, além do conflito explícito em nome ASCII.

O gate final passou **26 grupos por versão**, incluindo a resposta HTTP 500
nesse conflito e a preservação da exchange original.

A regressão da sessão com CA não confiável também encontrou uma corrida no
harness. A primeira espera permitia ler a sessão anterior, já encerrada.
Depois do clique em Conectar, a nova espera exige um ID de sessão diferente
e a conclusão do ciclo antes de conferir os erros TLS.

O check passou **314 testes em 40 arquivos e seis testes Node do patch**,
typecheck, lint, formatação e sincronização do Guia/Ajuda. Os 11 smokes
de regressão passaram em sequência com o novo smoke de declaração no
mesmo ASAR. No smoke de declaração, um PUT sem resposta produziu estado
incerto, o GET indisponível após aceite preservou o aceite, e a consulta
manual leu o recurso sem reenviar a declaração.

O smoke ampliado passou cinco grupos. Uma recuperação AMQPS e um reload
com rascunhos abertos descartaram o formulário sem novos PUTs. A execução
também verificou retorno de foco por teclado e preservação do arquivo de
perfis. O relatório está em `out/exchange-declaration-6b-smoke-results.json`.

## Matriz final no executável

`node tools/testing/rabbitmq-real.cjs --exchange-declaration-matrix` passou
no pacote macOS 27.0.1 arm64, Electron 45.1.0 e Node embutido 24.22.1.
A matriz criou as 16 combinações, testou permissão e conflito e declarou
pelo formulário nos vhosts `/`, `detailed` e `literal%2F`. A configuração
salva foi preservada. A geração anterior foi recusada antes da escrita.
O inventário confirmou apenas os acréscimos esperados e bindings e filas
preservados. O broker registrou zero canais criados e o renderer permaneceu
na origem local.

| RabbitMQ | Gate do adapter | Verificações no executável | Limpeza |
| --- | ---: | ---: | --- |
| 4.4.0 | 26 | 40 | Completa |
| 4.3.6 | 26 | 40 | Completa |

Os relatórios locais estão em `out/rabbitmq-real-6b-results.json`.
A conferência final encontrou zero contêineres e redes com a label do
harness.

## Aceite da entrega

Em 2026-11-20, “Aprovo” aceitou a conclusão e o commit local. Os hashes dos
35 arquivos e do ASAR coincidiram com a revisão apresentada.
