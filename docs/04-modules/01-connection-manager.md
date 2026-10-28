# M01 — Connection Manager

Data: 2026-10-28. Status: **4A.1 e 4A.2A concluídas/aprovadas**.
Execução 4A.2A autorizada por “Autorizo”; conclusão/commit aprovados por “Aprovado”.
M01/MVP ainda não completos. AMQPS e sessão dependem dos contratos 4A.2B/C.

## Objetivo e responsabilidades

Organizar perfis locais e verificar autenticação HTTPS do perfil salvo somente
após ação explícita. O main mantém configuração, senha, certificados e transporte.
A UI cadastra/edita/lista/seleciona/remove perfis sem gerar rede; o botão Testar
HTTPS dispara uma consulta limitada e não ativa sessão de broker.

Sem filas/exchanges/mensagens, AMQP, polling, reconexão ou administração avançada.
A ausência de broker real na validação local é limite, não compatibilidade comprovada.

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
