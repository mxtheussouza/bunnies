# M01 — Connection Manager

Data: 2026-10-30. Status: **4A.1/4A.2A/4A.2B/4A.2C concluídas/aprovadas**.
Execução 4A.2A autorizada por “Autorizo”; conclusão/commit aprovados por “Aprovado”.
M01/MVP ainda não completos. 4A.2B concluída/aprovada, incluindo testes reais; sessão depende da 4A.2C.

## Objetivo e responsabilidades

Organizar perfis locais e verificar autenticação HTTPS/AMQPS do perfil salvo somente
após ação explícita. O main mantém configuração, senha, certificados e transporte.
A UI cadastra/edita/lista/seleciona/remove perfis sem gerar rede; o botão Testar
HTTPS ou AMQPS dispara somente seu teste limitado e não ativa sessão de broker.

Sem filas/exchanges/mensagens, sessão AMQP, polling, reconexão ou administração avançada.
Testes reais 4.4.0/4.3.6 cobrem o recorte de conexão, sem homologar todo o M01.

## Requisitos e dependências

FR-001/002/003/028 parcialmente atendidos. NFR-005/006/007/011/012/013/016/020 e
sub-limites NFR-031–033 orientam o incremento. ADRs 0001–0005, fundação 2B,
interface 3B, guia DOC.1 e APIs instaladas Node/Electron; nenhuma nova dependência.

Fontes: [requisitos funcionais](../02-requirements/functional-requirements.md),
[limites](../02-requirements/non-functional-requirements.md),
[contrato autorizado](../05-roadmap/roadmap.md) e [guia do usuário](../10-user-guide/README.md).

## Interfaces implementadas

`window.bunnies`: oito métodos desktop, quatro de perfis e quatro de conexão/CA,
sem invoke/send ou API genérica de arquivo/transporte. Canal `bunnies:profiles`:

| Operação | Entrada | Saída de sucesso |
| --- | --- | --- |
| listProfiles | Nenhuma | Revision e até 50 resumos sem senha/PEM/ciphertext |
| getSecretProtectionStatus | Nenhuma | Persistence/reason, sempre disabled/unverified no produto atual |
| saveProfile | Campos, revision, ID opcional, ação de segredo e confiança opcional | Novo snapshot; ausência de trust mantém a configuração existente |
| removeProfile | ID e revision | Snapshot após confirmação nativa contextual no main |

Canal `bunnies:connections`:

| Operação | Entrada | Saída de sucesso |
| --- | --- | --- |
| selectProfileCa | Nenhuma | Null ao cancelar; ou selectionId/fingerprints, sem caminho/PEM |
| discardProfileCa | SelectionId UUID | Sem valor; somente seleção da janela remetente |
| testProfileHttps | ProfileId, revision e operationId UUID | Identificadores, authenticated, checkedAt e durationMs; sem resposta bruta |
| cancelProfileHttpsTest | OperationId UUID | Sem valor; somente operação da janela remetente |

Validar janela ativa, frame principal e URL integral antes dos efeitos; validar
novamente após seletor nativo e antes de devolver resultado. Campos extras,
paths/URLs arbitrários, tipos indevidos e IDs inválidos são rejeitados. Operações
aceitas têm shape raso e campos limitados, abaixo de 2 MiB; o clone interno do
Electron precede o handler e não é prometido como limitado pelo app.

| Campo | Contrato |
| --- | --- |
| id | UUID v4 atribuído no main; edição exige ID existente |
| name | 1–120 unidades UTF-16, sem controles nem espaços nas pontas |
| environment | development, staging, production ou other |
| httpsUrl / amqpsUrl | Até 2048 unidades cada; protocolo exato/host, sem espaços/backslash, userinfo, query ou fragmento; prefixo permitido |
| username | 1–256 unidades sem controles; preservado; teste Basic rejeita dois-pontos e texto não representável em UTF-8 |
| revision | SHA-256 dos bytes; absent somente para arquivo inexistente |
| secret | Keep/remove; replace com mode memory/protected e password de 1–4096 unidades, sem NUL; protected gated |
| trust | Keep/default; replace exige selectionId válido da mesma janela; opcional significa keep |
| Resumo de segredo | Saved indica ciphertext presente; availableThisRun indica valor no main; nenhum prova autenticação |
| Resumo de confiança | Default ou custom/fingerprints, sem caminho/PEM; importação não comprova confiança em servidor |

## Configuração e regras de negócio

`profiles.json` no userData: schemaVersion 2, writeId UUID v4 e profiles. Registros
contêm campos validados, secret memory/none ou protected/ciphertext e trust default
ou custom/pem público. V1 permanece legível sem regravar ao iniciar; é normalizado
em memória para confiança default. Ao salvar explicitamente, preservar os bytes
v1 em `profiles.v1.backup.json` privado antes do rename v2. Backup existente só é
reutilizado quando idêntico à origem; outro conteúdo gera conflito, sem sobrescrevê-lo.
Uma versão anterior do app pode não ler v2; não há downgrade automático.

UTF-8/schema/IDs/CA inválidos e versões desconhecidas bloqueiam a edição, preservando
original. Até 50 perfis e 2 MiB, incluindo PEM/ciphertext; backup v1 é cópia separada,
também limitado a 2 MiB. Uma configuração com bundles grandes pode atingir o teto
antes de 50 perfis. Nenhum segredo em memória vai ao arquivo/backup.

Leitura verifica tipo/tamanho/identidade do arquivo, não segue symlink final e lê
até orçamento + sentinela. Escritas serializadas, lock exclusivo cooperativo,
revision antes/depois do temporário, wx/0600, fsync de arquivo e rename na mesma
pasta. Diretórios novos 0700 onde aplicável; fila local até 16 operações. Escrita
falha não altera segredo/seleção anteriores; token CA só é consumido após sucesso.

Lock de outra operação ou stale lock não é apagado automaticamente. Não há CAS
contra editor externo arbitrário entre última checagem e rename, garantia contra
perda de energia ou homologação de ACL Windows. Permissões POSIX foram testadas
localmente; não prometem uma proteção absoluta contra a mesma conta comprometida.

Selecionar perfil não ativa sessão e não persiste seleção no renderer. Remover
perfil exige diálogo nativo contextual, Cancelar padrão e revision revalidada; só
remove cadastro/segredo local. Alterações próprias cancelam testes; mudanças externas
são detectadas ao ler/concluir e invalidam senha/resultado antigo.

## CA e TLS

Seletor assíncrono no main lê apenas arquivo escolhido pelo SO, sem path recebido
do renderer. Até 256 KiB e 16 certificados CA PEM; parse X509, DER sem bytes extras,
apenas blocos CERTIFICATE, sem dados privados/leaf/PFX/PKCS#12. Chaves e arquivos
inválidos são rejeitados. O material público válido é normalizado e copiado para
configuração; não depende de arquivo original e não altera confiança do SO.

Uma seleção pendente por janela, UUID opaco e dez minutos de validade; timer,
substituição, descarte, reload/crash/fechamento/quit liberam a seleção. Cancelar
seletor ou importar arquivo inválido mantém seleção anterior. Fingerprints são
informativas; importar uma CA não valida identidade/expiração de servidor.

Default usa confiança do runtime Node, não promessa de equivalência ao SO. Custom
usa exclusivamente o bundle salvo, sem unir silenciosamente às CAs padrão.
HTTPS usa agente próprio, sem proxy herdado, TLS mínimo 1.2, rejectUnauthorized
true e checagem padrão de identidade. Sem bypass, downgrade ou alteração global;
não há promessa de CRL/OCSP automáticos.

## Credenciais, teste HTTPS e ciclo de vida

Senha fica apenas no main durante a execução, com keep/replace/remove explícitos.
Campo do formulário é descartado após envio/tentativa de fechamento; não é repovoado.
Falha de escrita/provider preserva valor anterior. Fechar janela macOS não encerra
processo/senhas; Arquivo → Sair descarta referências. Sem zeroização garantida de
strings/cópias JavaScript. Provider seguro real continua sem prova em todos os
alvos; modo persistente segue desabilitado, sem inicializar keychain neste incremento.

`connectionSnapshot` é método interno main, nunca ponte: exige ID/revision e senha
presente. Sem senha, sem request. Teste só usa o endpoint salvo, acrescentando
`/api/whoami` ao prefixo. Basic apenas em header para destino TLS verificado;
identidade precisa corresponder ao username. Main descarta corpo/cabeçalhos e só
retorna resultado local datado; não consulta filas/vhosts nem comprova versão/AMQP.

Uma operação por janela; deadline de 10 s cobre obtenção do snapshot, DNS, handshake,
leitura e revalidação. Headers 16 KiB, corpo 64 KiB, UTF-8/JSON até profundidade 16;
solicitar identity e rejeitar compressão inesperada. Sem redirects ou retry.
401/403/TLS/rede/timeout/cancelamento/protocolo/formato Basic recebem códigos fixos.

AbortController controla o resultado e destrói request/resposta/agente; liberar
sockets/timers ao concluir/cancelar, invalidar por edição/remoção/reload/crash/fechar.
ID de operação é correlação, nunca autorização. Trabalho já entregue ao SO, como
resolução DNS/arquivo em andamento, não tem garantia de cancelamento físico imediato;
nenhum request novo deve começar após cancelamento observado.

## Interface, aceitação e testes

Conexões contém Confiança TLS/seleção/fingerprints, resumo, Testar HTTPS/cancelamento
e resultado datado, mantendo Sem sessão ativa e destinos de broker bloqueados.
Guia/Ajuda explicam campos, confiança, senhas, migração, efeitos e limitações.

Oito critérios da 4A.1 e nove da 4A.2A estão no roadmap. Unitários/integração exercitam
CA, migração/falhas, probe TLS real, lifecycle/IPC/UI. Smokes usam userData/fixtures
próprios. [Evidências 4A.1](../07-testing/profiles-4a1.md) e
[evidências 4A.2A](../07-testing/https-4a2a.md).

Pendentes: aprovação de conclusão/commit 4A.2A; RabbitMQ real (daemon Docker ausente),
AMQPS/sessão e demais M01; providers reais/release/assinatura; seletor/diálogos nativos
visuais, teclado de tema herdado, tecnologias assistivas e outros SOs/CPUs.

## Incremento 4A.2B — AMQPS explícito (implementado para revisão)

Autorizado por “Autorizo” em 2026-10-29. Cliente amqplib 2.2.0 exato no main, sem
transitivas de produção. M01 continua parcial: não há sessão/vhost ativo de trabalho,
reconexão, polling, canais, publicação ou consumo. Conclusão/commit pendentes.

Interface adiciona vhost interpretado (leitura) e Testar AMQPS/cancelar/resultado
datado. ProfileTests coordena dois ConnectionTest sem duplicar o ciclo; o main,
via ConnectionTestService, também impede HTTPS e AMQPS simultâneos na mesma janela.
Testar só resolve perfil salvo/revision/senha/CA; não há rede ao abrir/salvar/selecionar.

Parser puro em shared/amqpsEndpoint preserva path bruto, vhost UTF-8 e escapes;
sem caminho significa /, /%2F explicita /, barra final vazia é rejeitada. Um segmento
literal, até 255 bytes sem C0/DEL; barras no nome exigem %2F. Não normalizar pontos,
espaços ou dupla codificação. Porta padrão 5671, sem userinfo/query/hash/amqp.
Snapshot interno passa amqpsUrl; DTO público nunca inclui senha, CA ou ciphertext.
Perfis v1/v2 antigos permanecem legíveis/editáveis sem regravação ao testar.

Adapter amqpsProbe usa socket TCP próprio, espera connect antes de TLS, valida
cadeia/validade/hostname ou IP e usa CA default/custom já salva. SASL PLAIN só dentro
de TLS; sem guest, proxy/túnel ou recovery. Username com dois-pontos é válido no
AMQP, ao contrário de Basic; texto malformado/NUL é recusado antes da rede.
Negociação: heartbeat 10 s/frameMax 128 KiB/channelMax 1, sem abrir canal.

Só open-ok + close confirmado permite sucesso; prazo total 15 s, close até 1 s
no restante, destruição/invalidação em erro/abort/prazo/reload/crash/close/quit.
API callback pública identifica close síncrono sem confirmação no estado blocked,
sem stream/estado privado. Erros fixos distinguem TLS/rede/negociação/recusa/close;
não expõem replyText nem adivinham se a causa é senha/vhost/permissão.

A ponte tem 18 métodos específicos, com testProfileAmqps/cancelProfileAmqpsTest.
Origem integral, janela/frame, DTO e pós-await revalidados; cancelamento confinado
a owner/id/modalidade. Mudanças de configuração invalidam testes/credenciais conforme
regras existentes. Resultado não comprova permissão de recurso ou broker idêntico
nos dois endpoints. Tentativas geram conexões/login/logs/métricas transitórias.

Critérios adicionais: dez itens do contrato 4A.2B no roadmap. Testes perto das
unidades + fixture TLS/AMQP roteirizada e smoke tools/testing/amqps.cjs, além das
regressões anteriores. [Evidências 4A.2B](../07-testing/amqps-4a2b.md) distinguem
resultados locais de RabbitMQ real, nativos manuais, outros alvos e providers.
Guia/Ajuda são atualizados na mesma fonte canônica. Sessão 4A.2C exige novo contrato.

Complemento posterior autorizado pelo pedido de teste real: RabbitMQ 4.4.0/4.3.6
passaram no mesmo executável (20 checks por versão), incluindo HTTPS/AMQPS, TLS/CA,
vhosts/recusas/cancelamento/prazo e cleanup. [Resultados](../07-testing/amqps-4a2b.md).
A pendência de broker real foi resolvida para esse recorte; não homologa recursos
M01 futuros, cluster/HA ou outros alvos. Conclusão/commit 4A.2B continuam pendentes.

Aceite de conclusão 4A.2B: “Aprove a 4A.2B, e siga para a próxima etapa”, em
2026-10-30, aprovou entrega/commit e limitações. Preparar contrato próprio 4A.2C;
sessão/reconexão e conclusão do módulo permanecem futuras.

## Registro histórico — gate da 4A.2C e decisão adicional

Contrato de sessão autorizado por “Autorizado” em 2026-10-30. Gate inicial
reprovado antes de implementar serviço/IPC/UI: eventos precoces podem lançar
exceção antes de o cliente devolver modelo público. Potencial impacto no probe
existente é inferência do caminho compartilhado, não resultado de novo smoke.
[Evidências](../07-testing/sessions-4a2c.md) e
[ADR-0008 Proposed](../03-architecture/adr/0008-amqp-lifecycle-safety.md).
Produto/guia/dependências preservados; aguardar decisão antes do trabalho dependente.

## Incremento implementado — 4A.2C

Contrato C-01–07 autorizado, ADR-0008 A aceita e gate corrigido aprovado. Sessão
única explícita, HTTPS/AMQPS independentes, recuperação limitada, background/suspend,
invalidação e UI/guia implementados; verificada, sem conclusão/commit aprovado.

Interfaces: SessionApi no shared (quatro operações), SessionService no main;
ConnectionActivity controla exclusão com probes. Dependências: ProfileService,
amqpsConnection/probeHttps, Electron lifecycle/IPC, sem pacote novo.
Regras/limites e critérios: contrato 4A.2C no roadmap/NFR; testes unitários próximos
ao código, smokes sessions.cjs e matriz rabbitmq-real.cjs. Não há canais, mensagens,
listagem de vhosts ou providers; leitura de estado/seleção nunca conecta.
Pendências: aprovação de conclusão/commit; evidências finais registradas e M01 ainda parcial.

Resultado final 4A.2C: 237 testes + seis Node/gate de 30/instalação limpa,
package/cinco smokes e 54 checks reais passaram. [Evidências](../07-testing/sessions-4a2c.md).
Entrega pronta para revisão, não conclusão aceita; demais funcionalidades M01
continuam parciais e outros alvos/providers/cluster não homologados.

Aceite posterior: “Aprovado”, em 2026-10-30, aceitou a conclusão da 4A.2C e seu
commit de entrega. M01 permanece parcial; os resultados/limitações apresentados
continuam válidos, sem autorização de etapa seguinte ou push.
