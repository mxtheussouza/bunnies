# Etapa 4A.2B — teste AMQPS e acesso ao vhost

Data: 2026-10-29. Execução autorizada por **“Autorizo”** ao contrato detalhado.
Status: **concluída/aprovada em 2026-10-30; commit autorizado**.
Base 9401448, branch chore/modernization-app; cinco documentos da proposta
preservados. Sem commit/push ou instalação alheia ao cliente aprovado.

## Ambiente e dependências

amqplib **2.2.0** exato, tipos incluídos, sem dependências de produção transitivas.
Diff de manifesto/lock adiciona somente esse pacote. npm audit registrou seis
avisos de tooling (2 baixos/4 moderados): plugin-webpack, fork-ts-checker-webpack-plugin,
webpack-dev-server, deepmerge, sockjs e uuid; nenhum alerta para amqplib na consulta.
Não houve auto-fix; ausência de alerta não prova ausência de vulnerabilidade.

Host macOS 27.0.1 arm64, Node 24.22.1/npm 11.19.1. Runtime observado no pacote:
Electron 45.1.0/Node 24.22.1. Não houve instalação de daemon ou alteração de trust
global do host. Testes usam certificados/usuários/portas/userData sintéticos próprios.

## Verificações finais

| Verificação | Resultado efetivo |
| --- | --- |
| npm run check | Passou: typecheck, lint, 216 testes/27 arquivos, format:check e docs:check |
| npm run package | Passou: aplicativo darwin-arm64; sem instalador/assinatura |
| npm run smoke:package | Passou: interface, Ajuda offline completa de 13 tópicos, foco/zoom e negativas de segurança |
| node tools/testing/profiles.cjs | Passou: CRUD/reinício real/descarte de senha/corrupção e proteção condicionada desligada |
| node tools/testing/https.cjs | Passou: regressão CA/migração/Basic, cancelamento/prazo/proxy e cleanup |
| node tools/testing/amqps.cjs | Passou: TLS/SASL/vhost/close sem canais, recusas/blocked/protocolo, concorrência/cancelamento/prazo/invalidação/reload/close/zoom |
| Revisão de código/artefato/capturas | Concluída, dois temas e zoom 200%; 43 arquivos protegidos preservados |
| node tools/testing/rabbitmq-real.cjs | Passou: 20 verificações em cada RabbitMQ real 4.4.0/4.3.6, TLS/HTTPS/AMQPS e cleanup; complemento autorizado após ativação do Docker |

Os quatro smokes foram executados em sequência, com dados temporários isolados.
Depois dos ajustes exclusivos do harness, somente lint/smoke AMQPS foi repetido
sobre o mesmo ASAR, acrescentando DNS (localhost), quit/reabertura e descarte de
senha ao IPv4 já exercitado no próprio runtime.
DNS/IP passaram sem a queda inicial. Nenhum código de produto mudou após esse pacote.

A rodada final AMQPS mediu **15.475 ms** do clique ao feedback, incluindo runner/UI;
deadline do serviço continua **15.000 ms**, coberto por clock controlado. Regressão
HTTPS mediu 10.417 ms clique-feedback, com prazo do serviço 10.000 ms. Cancelamento,
edição, recarga, fechamento macOS e quit deixaram zero sockets da fixture; Chromium não
fez requests externos. Nenhuma sessão ativa, canal, topologia ou mensagem.

## Critérios do contrato

| Critério | Evidência obtida |
| --- | --- |
| 1 — Dependência/lock/main | Somente amqplib 2.2.0 adicionado; duas entradas do lock alteradas (raiz e pacote), audit registrado; cliente ausente do renderer/preload |
| 2 — Parse/persistência | Testes de Unicode, limites/escapes/dot/IP/DNS; v1/v2/regressões preservadas, arquivo não regravado ao testar e endpoint inválido sem rede |
| 3 — Credenciais | Ausência de senha sem tentativa; SASL apenas após TLS; sentinela ausente de disco/DTO/storage/pacote e segredo fora da URI |
| 4 — TLS/CA | Integração real Node rejeita CA desconhecida, SAN divergente e expiração; pacote cobre DNS/IP e defaults recusando fixture; HTTPS revalidado com mesma configuração |
| 5 — Open/close sem canais | Peer confere vhost/tune/SASL, sequência apenas channel 0 e CloseOk; não registra ChannelOpen/topologia/mensagens/recovery |
| 6 — Diagnóstico | Recusa genérica autenticação/vhost, protocolo/frame inválido, prazo e close não confirmado sanitizados; blocked não gera sucesso falso |
| 7 — Lifecycle/exclusão mútua | Serviço/UI/IPC e pacote cobrem prazos, respostas tardias, revisão, cancelamento pré-TCP/TLS/handshake/close, reload/quit/janela e HTTPS versus AMQPS |
| 8 — Fronteira | Allowlist de 18 métodos, negativas de shape/origem/janela/frame e janela real estrangeira no pacote; sandbox/CSP/URL/protocolo/permissões preservados |
| 9 — UI/guia/macOS | Componentes/teclado/foco/erros, temas/zoom, guia e Ajuda de 13 tópicos/12 campos; 9401448 preservado; menu nativo manual não homologado |
| 10 — Verificações/matriz | Check/package/quatro smokes passaram em macOS arm64; fixture Node TLS/AMQP distinguida do complemento real 4.4.0/4.3.6 descrito abaixo; outros alvos não homologados |

## Artefato inspecionado

`out/Bunnies-darwin-arm64/Bunnies.app/Contents/Resources/app.asar`: **947.976 bytes**.
SHA-256: `a9ebb984b6e2b1a7827339a921324400862ded77f68f8352f9332d0d332d8147`.
Nove arquivos de produto, incluindo licença do bundle main e licença do renderer.
Preload requer somente electron. amqplib só está no main; os 13 tópicos do guia
estão no renderer. Sem fixtures, mapas de fonte, chaves privadas/certificados
sintéticos ou sentinelas de senha no pacote.

Relatórios/capturas são locais e ignorados pelo Git, em out: `4a2b-check.log`,
`4a2b-package.log`, `4a2b-audit.json`, `4a2b-artifact.json`, `ui-3b-results.json`,
`help-doc1-results.json`, `profiles-4a1-results.json`, `https-4a2a-results.json`,
`amqps-4a2b-results.json` e `amqps-4a2b-*.png`. Nomes históricos dos smokes anteriores
foram mantidos; resultados citados aqui são a regressão no artefato desta etapa.

## Ocorrências e decisões de implementação

O parser inicial deixava um surrogate Unicode solto ser substituído silenciosamente;
regressão exige rejeição. Vhost vem do caminho bruto, sem normalização de segmentos
ou dupla decodificação, com limite e caracteres conforme contrato aprovado.

O worker de testes teve SIGSEGV ao envolver em TLS um socket ainda conectando a
localhost. IPv4 direto isolado passava. O adapter agora espera TCP antes de envolver
em TLS, com socket cancelável desde o início; cenários DNS/CA/cancelamento passaram
sem a queda anterior. Sem alterar runtime ou aplicar patch global/nativo.

No amqplib fixado, close pode concluir sincronamente em estado blocked sem receber
CloseOk. Usa-se API callback pública e rejeita-se esse atalho, sem ler estado/stream
privado. Fixture entrega open-ok + blocked no mesmo registro TLS para reproduzir
notificação anterior à criação do modelo; fechamento confirmado real continua válido.

Frame oversize da fixture inicialmente só anunciava tamanho e deixava o cliente
aguardar corpo até prazo. Agora entrega o frame completo para testar rejeição de
protocolo. O parser da biblioteca e seus limites globais não são homologados por
esse cenário; frameMax negociado não é orçamento global de memória.

Extração do componente comum exigiu corrigir dois nomes indevidamente substituídos.
O teste de menu customizado agora usa plataforma Linux; no macOS o comportamento
9401448 não apresenta esses botões. Smoke macOS conferiu roles/menu nativo e IPC
real, sem alegar revisão manual de teclado do SO. Sua primeira rodada falhou ao
acionar a próxima operação antes da restauração anterior completar; o harness agora
espera/confere essa transição. Nenhuma asserção de estado foi removida.
Capturas nativas inicialmente antecederam a pintura de tema/scroll; dois frames
foram aguardados e as novas imagens foram inspecionadas.

## Limitações mantidas

Fixture Node TLS com handshake AMQP roteirizado não é RabbitMQ. O complemento
abaixo verifica o recorte HTTPS/AMQPS em 4.4.0/4.3.6 reais de nó único; não homologa
as versões integralmente, cluster/HA, outros SOs/CPUs, leitores de tela,
provider de senha, assinatura/notarização/fuses/instaladores/releases.
Deadline/abort invalida resultado e fecha recursos do app; DNS/I/O entregue ao SO
não tem garantia de interrupção física imediata ou rollback da tentativa de login.
Sem canal, topologia, publicação/consumo, sessão, polling ou reconexão nesta entrega.


## Fontes e aprovação

Revalidação em 2026-10-29: [releases RabbitMQ](https://www.rabbitmq.com/release-information)
continuam indicando 4.4.0/4.3.6 nas séries de referência aceitas, sem alteração da
matriz nem homologação executada. A API callback e a exceção blocked foram revistas
no código fixado de [callback_api](https://github.com/amqp-node/amqplib/blob/v2.2.0/callback_api.js)
e [connection](https://github.com/amqp-node/amqplib/blob/v2.2.0/lib/connection.js).
A prova de runtime vem dos testes executados acima, não apenas dessas leituras.

Apresentar esta entrega para aprovação de conclusão/commit. Não iniciar 4A.2C,
registrar commit ou fazer push sem seus aceites específicos.

Conferência documental final: 39 Markdown, 304 links locais, 109 tabelas e 13 âncoras
válidos; guia com 12 campos. docs:check/format:check/whitespace aprovados. Os dois
diretórios de certificados sintéticos deixados pelos workers que tiveram SIGSEGV
foram identificados por horário/configuração e removidos; zero fixture TLS própria
restante. Nenhum arquivo/certificado do usuário removido.

## Complemento autorizado — RabbitMQ real

Após a apresentação, o proprietário pediu “Faça o teste com o rabbitmq real, o
docker já está ativado” e “Continue”. A limitação inicial de daemon ausente foi
superada: Docker Engine **29.8.0**, VM Linux aarch64; imagens oficiais **arm64**.
Nenhum daemon/configuração global foi iniciado/alterado pelo harness.

`tools/testing/rabbitmq-real.cjs` executa a UI do **mesmo aplicativo empacotado**
(Electron 45.1.0/Node 24.22.1), com userData temporário e senhas geradas em memória.
Definições do broker contêm somente hashes SHA-256 salteados; perfil não contém
senha. Certificados/chaves sintéticos ficam sob diretório temporário privado.
Uma rede/container por execução, nomes/labels próprios e apenas 5671/15671 publicados
em portas aleatórias de **127.0.0.1**. Eventual HTTP interno fica no loopback do
container, sem porta publicada; aplicativo e observador usam exclusivamente TLS.

### Imagens reproduzíveis

Os digests foram obtidos dos pulls oficiais e fixados no harness antes da rodada
final; não usar tags mutáveis para selecionar uma imagem diferente silenciosamente.
Versão efetiva conferida em `/api/overview` de cada broker, com cadeia/identidade TLS
validadas. Tags abaixo identificam a origem observada; a criação usa o digest.

| Versão/tag observada | Digest fixado |
| --- | --- |
| rabbitmq:4.4.0-management | sha256:af6f50d38098d8bd52fef7f3fa85015dd8b2bf6def58e995bf584ae9ba0f6407 |
| rabbitmq:4.3.6-management | sha256:54cb013d76cd1fd6c0a0708f34062ad61c452bb6f016b434c6c33f1a765d2b58 |

Com Docker ativo e o pacote local existente, reproduzir na raiz usando Node/npm
do projeto. Esses comandos baixam apenas as imagens fixadas; não instalam pacotes:

```bash
docker pull rabbitmq@sha256:af6f50d38098d8bd52fef7f3fa85015dd8b2bf6def58e995bf584ae9ba0f6407
docker pull rabbitmq@sha256:54cb013d76cd1fd6c0a0708f34062ad61c452bb6f016b434c6c33f1a765d2b58
node tools/testing/rabbitmq-real.cjs
```

Não recebe URL/credencial de broker externo. Nunca substituir pela configuração do
usuário. No finally, confere label do container antes de removê-lo, remove rede,
relay, dados/certificados próprios e registra falhas de cleanup. Imagens ficam no
cache Docker; containers/redes/imagens preexistentes de outros projetos preservados.

### Resultados do executável

**20 verificações por versão (40 no total)**, separadas dos 216 testes Vitest.
Rodada final após fixar digests e tornar obrigatório o contador de canais: passou
nas duas versões. Prazo clique-feedback, incluindo runner/UI/observador: **15480 ms**
(4.4.0) e **15492 ms** (4.3.6); deadline do serviço permanece 15.000 ms.
`npm run check` repetido após o novo harness: typecheck/lint, **216 testes/27 arquivos**,
format:check/docs:check passaram. Sem novo package: produto/ASAR preservados.

| Cenário | 4.4.0 | 4.3.6 |
| --- | --- | --- |
| Versão exata, TLS e HTTPS whoami do Management real | Passou | Passou |
| Sem rede automática, sem regravar perfil ao testar, senha em memória | Passou | Passou |
| AMQPS abrir/fechar em / explícito e ausente | Passou | Passou |
| Vhost equipe/pedidos, literal%2F, área pedidos e ponto literal | Passou | Passou |
| DNS localhost e IP 127.0.0.1 com a mesma CA nos dois endpoints | Passou | Passou |
| Senha incorreta, vhost inexistente/sem acesso e usuário sem permissão | Passou | Passou |
| Nova tentativa explícita após recusa | Passou | Passou |
| Cancelamento TLS e exclusão mútua HTTPS/AMQPS | Passou | Passou |
| Prazo total de 15 s e encerramento de sockets locais | Passou | Passou |
| Confiança padrão recusa CA privada em HTTPS e AMQPS | Passou | Passou |
| Logs do broker confirmam nomes exatos de vhost e closes | Passou | Passou |
| Contador channel_created=0, nenhuma conexão/canal vivo, fila ou consumidor | Passou | Passou |
| URL canônica, zero request externo Chromium/pageerror e Sem sessão ativa | Passou | Passou |
| Cleanup de app/container/rede/relay/userData/CA/chaves | Passou | Passou |

Para cancelar/exceder prazo durante TLS com determinismo, um relay TCP **opaco de
teste** encaminha ClientHello ao RabbitMQ real e retém sua resposta. Timeout TLS do
broker de teste é 30 s para não encerrar antes do deadline 15 s do app. Nenhuma
validação TLS do aplicativo é desabilitada; não há negociação SASL completa nesses
dois casos interrompidos. Os sucessos/refusals usam conexão direta com o broker.

Relatórios JSON e logs filtrados ficam em out, ignorados pelo Git:
`rabbitmq-real-4a2b-results.json`, `rabbitmq-real-4.4.0-results.json`,
`rabbitmq-real-4.3.6-results.json`, `rabbitmq-real-*-broker.log` e
`4a2b-rabbitmq-real.log`. Não contêm senhas/chaves privadas.

### Ocorrências e alcance

As primeiras tentativas falharam no próprio harness: management.tcp.port=none não
é inteiro; timeout TLS padrão do broker antecipava o deadline do app; a expectativa
de log invertia a ordem de “granted access”. Corrigidos configuração, timeout apenas
da fixture e expectativa, sem alterar produto/TLS/ASAR. Recursos próprios removidos
em cada tentativa. PROJECTS preserva a sequência e os resultados parciais reais.

Esta execução resolve o teste real do **recorte HTTPS/AMQPS da 4A.2B** nessas duas
imagens, nó único e host macOS arm64. Não homologa toda a série, cluster/HA, limites
globais do parser, outros SOs/CPUs, TLS corporativo/mTLS/OAuth/proxy personalizado,
recursos futuros de filas/mensagens/sessão ou distribuição. Testes de SAN divergente,
expiração e blocked continuam nas fixtures controladas anteriores; não são
reclassificados como cenários executados nesse broker real. Nenhuma operação de
mensagens ou topologia de produto foi habilitada.

Configuração baseada na [imagem oficial RabbitMQ](https://hub.docker.com/_/rabbitmq),
[documentação TLS](https://www.rabbitmq.com/docs/ssl) e
[HTTPS do Management](https://www.rabbitmq.com/docs/management#https). Asserção de
log conferida no [rabbit_reader 4.4.0](https://github.com/rabbitmq/rabbitmq-server/blob/v4.4.0/deps/rabbit/src/rabbit_reader.erl).
Guia/Ajuda preservados e sincronização verificada: não houve mudança de formulário
ou comportamento do app. Conclusão/commit seguem pendentes de aprovação.

Conferência do complemento: 39 Markdown, 322 links locais e 111 tabelas válidos;
whitespace/check aprovados. Snapshot de revisão atualizado para 57 caminhos, com
produto/guia/ASAR anteriores preservados. Nenhum recurso próprio de Docker ou
diretório temporário real restante; index vazio, sem commit/push.

## Aprovação da entrega

Em 2026-10-30, “Aprove a 4A.2B, e siga para a próxima etapa” aceitou conclusão e
commit `feat(connections): add cancellable AMQPS connection tests`, incluindo os
40 checks reais e limites acima. Conferidos os 57 caminhos do snapshot e ASAR sem
divergências antes da sincronização documental. Sem código/guia/artefato novo.
Check de 216 testes, package/quatro smokes e matriz real são resultados apresentados
e aceitos, sem repetição funcional para registrar o aceite. O registro integra
essa entrega com pai 9401448; consultar hash no Git. Próximo trabalho é preparar
contrato 4A.2C; implementação e push não são autorizados pelo registro desta conclusão.
