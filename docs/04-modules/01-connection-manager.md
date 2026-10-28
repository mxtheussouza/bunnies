# M01 — Connection Manager

Data: 2026-10-28. Status: **4A.1 concluída e aprovada**.
Conclusão e commit da 4A.1 aprovados por “Aprovado!”. M01/MVP não estão completos.

## Objetivo e responsabilidades

Organizar perfis locais para brokers RabbitMQ, mantendo nome, ambiente, endpoints
HTTPS e AMQPS independentes e usuário. O main é proprietário da configuração e dos
segredos; a UI cadastra/edita/lista/seleciona/remove perfis sem abrir conexões.
Teste TLS, CA customizada, autenticação real, sessão e reconexão pertencem à 4A.2
ou posteriores, com contratos próprios. Não há cliente RabbitMQ nesta entrega.

## Requisitos e dependências

FR-001/002/003 e FR-028 parcialmente atendidos pelo recorte local; NFR-005/011/016/020
orientam proteção, arquivo e IPC. Dependências: ADR-0001/0003/0004, fundação 2B,
interface 3B e APIs já instaladas do Node/Electron. Não há nova biblioteca, banco,
serviço remoto, schema genérico ou cliente de broker.

Fontes: [requisitos funcionais](../02-requirements/functional-requirements.md),
[limites](../02-requirements/non-functional-requirements.md) e
[contrato autorizado](../05-roadmap/roadmap.md).

## Interfaces implementadas

`window.bunnies` recebe quatro operações específicas, além das oito desktop:

| Operação | Entrada | Saída de sucesso |
| --- | --- | --- |
| listProfiles | Nenhuma | Snapshot com revision e até 50 resumos |
| getSecretProtectionStatus | Nenhuma | persistence enabled/disabled e reason verified/unverified/unavailable |
| saveProfile | Campos, revision, ID opcional e ação explícita de segredo | Novo snapshot sem senha/ciphertext |
| removeProfile | ID e revision | Snapshot após confirmação nativa contextual no main |

Canal fixo `bunnies:profiles`, sem invoke/send ou leitura de arquivo genéricos.
Janela ativa, frame principal, URL integral e DTO são verificados antes de qualquer
acesso. Erros têm código, requestId e mensagem fixa. Código em
`src/shared/profiles.ts`, `src/main/ipc/profiles.ts` e `src/preload/desktopApi.ts`.

| Campo | Contrato |
| --- | --- |
| id | UUID v4 atribuído no main; edição exige ID existente |
| name | 1–120 unidades UTF-16, sem controles/limites de espaço no início/fim |
| environment | development, staging, production ou other |
| httpsUrl / amqpsUrl | Até 2048 unidades cada; protocolo exato, host, sem espaços/backslash, userinfo, query ou fragmento; paths/prefixos permitidos |
| username | 1–256 unidades, sem caracteres de controle; preservado literalmente |
| revision | SHA-256 dos bytes lidos; absent somente para arquivo inexistente |
| secret | keep; remove; ou replace com mode memory/protected e password de 1–4096 unidades, sem NUL |
| Resumo do segredo | saved indica ciphertext existente; availableThisRun indica valor transitório no main; nenhum deles comprova autenticação |

Campos extras, tipos coercíveis e IDs/caminhos arbitrários são rejeitados. O
validador confere estruturas pequenas antes de serializar; entradas aceitas são
rasas e devem caber no limite IPC de 2 MiB. O clone interno do Electron ocorre antes
dessa validação e não é anunciado como limitado pelo aplicativo.

## Configuração e regras de negócio

Arquivo `profiles.json` no userData do aplicativo. Documento com schemaVersion 1,
writeId UUID v4 e profiles; cada registro contém somente campos validados, ID e
secret `{ mode: memory/none }` ou `{ mode: protected, ciphertext: base64 }`.
Sem migração automática ou reset de arquivo inválido/desconhecido. UTF-8 inválido,
IDs duplicados e dados fora do schema bloqueiam a edição e preservam o original.

Leitura limitada a 2 MiB + byte sentinela. Escrita valida até 50 perfis/2 MiB,
serializa operações no main, adquire diretório lock exclusivo e verifica revision
antes e depois de preparar o temporário. Temporário criado com wx/0600, fsync do
arquivo e rename na mesma pasta. Diretórios novos usam 0700 onde aplicável. O lock
não é removido se pertencer a outra operação; lock deixado por queda bloqueia novas
escritas com conflito, sem recuperação destrutiva automática.

Isso evita perda por escritores Bunnies cooperantes e detecta alterações externas
observadas nas verificações; não é CAS contra editor externo que ignore o lock
exatamente entre a última verificação e rename. Não há garantia de durabilidade
após perda de energia nem de ACL Windows por chmod. Erro de rename preserva o
arquivo anterior. Limpeza alcança apenas os temporários/lock da própria operação.

Fila local limitada a 16 operações, incluindo a execução, para não acumular pedidos
indefinidamente durante confirmação nativa. Revision muda a cada gravação, inclusive
substituição somente de senha em memória. Conflito exige recarga explícita, sem
mesclar ou sobrescrever automaticamente. Alteração externa invalida senhas transitórias.

Selecionar um perfil só muda a seleção da tela. Não cria sessão nem comunica com
broker; seleção não persiste no renderer. Remover pede diálogo nativo com nome,
ambiente, endpoints e efeito local; Cancelar é padrão. O main revalida remetente e
revision após o diálogo. Não remove filas, mensagens, usuários ou recursos remotos.

## Credenciais e gate do SO

Modo em memória retém a senha apenas no main durante a execução. Manter, substituir
e remover são explícitos; falha de escrita não troca/apaga o valor anterior. Remover
perfil ou encerrar o aplicativo descarta a referência. Fechar só a janela no macOS
não encerra o processo e, portanto, não equivale a descartar todas as senhas.

A UI recebe apenas flags e nunca repopula a senha. Campo password é descartado após
envio e tentativa de fechamento; continuar editando exige redigitá-lo. Cancelar
edição com alterações oferece continuar/descartar e não grava o perfil. Strings e
cópias internas JavaScript não têm promessa de zeroização.

Adapter `SecretProtection` integra as funções assíncronas do safeStorage por porta
mínima. Prova de provider e gates de reabertura, indisponibilidade, rotação e release
são internos ao main, nunca argumento IPC, flag CLI ou preferência de UI. Fallback,
provider desconhecido, gate incompleto e erro impedem persistir. O adapter tem
operações de criptografia/restauração/rotação testadas com fakes; a restauração não
é utilizada por uma sessão ou transporte nesta subetapa.

**Nenhum alvo está habilitado para senha persistente nesta entrega.** Composição
real não fornece prova de provider; não inicializa keychain nem provoca prompt só
para listar perfis. Há memória, diagnóstico e opção protegida desabilitada. A API
pública instalada não identifica o provider assíncrono efetivo por método específico;
backend síncrono não é substituto. Não houve teste do cofre real nem homologação de
macOS assinado/Windows/Linux. Ciphertext existente válido é preservado ao manter,
mesmo sem poder descriptografar. Alternativa de cofre exige decisão própria.

Referência consultada em 2026-10-28: [Electron safeStorage](https://www.electronjs.org/docs/latest/api/safe-storage).
Não usar API síncrona depreciada, fallback de texto puro ou criptografia própria.

## Interface e aceitação

Conexões contém lista, resumo, estado de carregamento/erro, recarga e formulário
modal com labels associados, foco e descarte explícito. Produção tem texto/símbolo.
Mantém temas, URL fixa, ausência de sessão e destinos de broker bloqueados.

Os oito critérios da 4A.1 no roadmap são a fonte de aceitação: CRUD/reinício;
falhas/corrupção/conflito; provider condicionado; sentinelas; ações de segredo;
UI/teclado; negativas IPC; check/package/smoke e documentação. Não declarar M01
concluído ao atender somente o CRUD local.

## Testes, status e pendências

Unitários de validação, adapter, serviço e IPC; integração de arquivo temporário;
componentes por comportamento; smoke do executável com perfil e senhas sintéticos.
Resultados e limitações: [evidências 4A.1](../07-testing/profiles-4a1.md).

Pendentes: providers reais e release por alvo;
confirmação nativa visual/manual; teclado do seletor nativo herdado da 3B;
tecnologias assistivas e SOs/CPUs não executados; CA, rede, sessões e demais M01.
Nenhum broker externo/produção participa dos testes.
