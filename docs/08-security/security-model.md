# Modelo de segurança

Data: 2026-10-28. Status: **Approved como modelo de controles e validação**.
Aceito na conclusão da 1B com os ADRs. Na 1B não havia novos controles implementados.
O [registro do legado](../01-audit/technical-debt.md) é histórico; a implementação
local e a cobertura parcial da 2B estão detalhadas ao final.
Este modelo usa Electron conforme ADR-0001; mudança de stack exige decisão revisada.

## Ativos e fronteiras

Ativos: credenciais e ciphertext; configuração de endpoints/CA; acesso aos brokers;
integridade de filas, exchanges e mensagens; dados exibidos; pacote e cadeia de build.

| Fronteira | Confiança e risco |
| --- | --- |
| Usuário → renderer | Validar entradas, inclusive nomes, headers, payload e caminhos |
| Renderer → preload/main | UI pode estar comprometida; validar origem, frame, argumentos e contexto no núcleo |
| Main → broker | TLS não torna payload confiável; permissões do broker continuam soberanas |
| Main → disco/provider do SO | Corrupção, acesso local e indisponibilidade exigem falha segura |
| Build → pacote | Dependências, recursos, CSP, fuses e assinatura precisam de verificação própria |

O programa roda com as permissões do usuário. Não oferece proteção absoluta contra
malware, administrador ou outro processo comprometido da mesma conta, nem contra
um broker que já tenha sido comprometido. Não há telemetria ou serviço hospedado.

## Ameaças e controles candidatos

| ID | Ameaça concreta | Controle e requisito | Evidência prevista |
| --- | --- | --- | --- |
| SEC-01 | XSS em nome/header/payload alcança privilégio local | React renderiza texto; sem HTML arbitrário, eval ou scripts remotos; CSP e ponte mínima; NFR-006 | T-01, T-10 |
| SEC-02 | Frame/janela indevida chama operação privilegiada | Verificar webContents e senderFrame principal, origem exata e DTO no main; FR-030 | T-01 |
| SEC-03 | Renderer solicita URL/path/operação genérica | Comandos específicos; endpoints resolvidos por perfil no main; links externos por identificador fixo | T-01, T-10 |
| SEC-04 | Interceptação ou certificado incorreto | HTTPS/AMQPS com cadeia e hostname verificados; CA por perfil; sem downgrade; NFR-007 | T-04, T-12 |
| SEC-05 | Disco, log ou diagnóstico expõe credencial | Provider seguro, memória alternativa, redação e retenção; NFR-005/008 | T-02, T-09 |
| SEC-06 | Exclusão em perfil/vhost errado ou por clique acidental | Confirmação contextual no núcleo, revalidação de generation e condições do broker; NFR-010 | T-06 |
| SEC-07 | Reconexão repete escrita ou publicação | Sem retry automático de escrita; resultado incerto explícito; NFR-009 | T-05, T-07 |
| SEC-08 | Resposta/payload consome memória ou bloqueia UI | Limitar bytes descomprimidos, profundidade, quantidade e concorrência; proteger parsing controlado pelo app sem prometer limitar o clone interno do Electron; NFR-015–017 | T-03, T-07, T-08 |
| SEC-09 | Configuração corrompida ou queda durante gravação | Schema versionado, escrita atômica, limites e preservação do original; NFR-011 | T-02 |
| SEC-10 | Redirecionamento vaza autenticação para outro destino | Rejeitar redirects no adapter; não derivar endpoint de resposta/payload | T-03, T-04 |
| SEC-11 | Pacote perde sandbox/CSP ou inclui segredo de teste | Inspeção e smoke do artefato, fuses e ausência de fixtures sensíveis; NFR-029 | T-12 |
| SEC-12 | Teste destrutivo recebe endereço externo/produção | Harness aceita somente brokers efêmeros provisionados pela própria execução e recursos com namespace de teste | T-06, T-12 |

Validação no renderer serve à usabilidade; a verificação obrigatória ocorre no main.
IDs de sessão, flags `confirmed` e nomes de ambiente enviados pela UI não substituem
a confirmação e o contexto mantidos pelo núcleo.

## Política do renderer, preload e recursos

Proposta: `nodeIntegration: false`, `contextIsolation: true`, `sandbox: true` e Node
desativado em workers/subframes. Registrar protocolo local de aplicação com origem
fixa, recursos permitidos e proteção contra traversal; não aceitar navegação ou
janelas remotas. Bloquear permissões de câmera, microfone, geolocalização e demais
capacidades não necessárias. O app não precisa de webviews de conteúdo externo.

Validar identidade da janela/frame e URL esperada, incluindo protocolo/host/path
normalizados. Não considerar `origin === "null"` uma origem confiável nem aceitar
prefixos textuais de URL como allowlist. O handler de recursos resolve caminhos
somente dentro da raiz empacotada e rejeita traversal/escape após normalização.

CSP de produção candidata: scripts/estilos somente dos recursos locais, sem inline
ou eval; `connect-src 'none'` no renderer e objetos/frames desabilitados. Extrair CSS
em produção para não depender de injeção inline do style-loader. Ajustar fontes e
imagens locais explicitamente. Desenvolvimento limita dev server/HMR ao loopback;
eventuais exceções de CSP não podem alcançar o pacote de release.

Preload contém ponte serializável e listeners com unsubscribe. Mudanças do sandbox
do Electron 45 exigem evitar dependência de shims Node removidos. Dados de erro
privilegiados são sanitizados; eventos Electron não atravessam a ponte.
[Guia Electron](https://www.electronjs.org/docs/latest/tutorial/security),
[protocolo](https://www.electronjs.org/docs/latest/api/protocol) e
[breaking changes](https://www.electronjs.org/docs/latest/breaking-changes).

## Credenciais e configuração

Não devolver senha armazenada para preencher formulário. A UI informa apenas se
existe segredo e oferece substituir/remover. Credenciais digitadas passam
temporariamente pelo formulário e IPC, sendo descartadas após entrega ao núcleo;
não prometer zeroização completa de strings JavaScript ou proteção contra dumps.

Proposta de persistência: arquivo JSON versionado e limitado no diretório de dados
do usuário, com metadados e ciphertext opcional. Permissões restritas onde o SO
permitir; não alegar que `chmod` implementa ACL Windows. Segredos nunca em URLs,
localStorage, argumentos de processo ou variáveis de ambiente do aplicativo.
Migrations não podem sobrescrever arquivo desconhecido/corrompido silenciosamente.

Usar API assíncrona safeStorage como candidata. A documentação distingue providers
e fallback Linux; disponibilidade de criptografia não é, sozinha, comprovação de
proteção adequada. `basic_text`, provider desconhecido/inseguro ou falha temporária
impedem persistir segredo; oferecer modo em memória. A implementação deve comprovar
o provider efetivo da API escolhida, sem inferir que a seleção síncrona prova a
segurança da API assíncrona. [safeStorage](https://www.electronjs.org/docs/latest/api/safe-storage).

**Gate de implementação:** validar disponibilidade, provider Linux, indisponibilidade,
rotação e reabertura por SO antes de habilitar salvar senha. Se não for possível
identificar proteção confiável, manter memória e apresentar a limitação; propor
outra integração com o SO mediante decisão específica. Assinatura macOS e acesso ao
Keychain precisam de testes próprios; builds locais não comprovam comportamento de release.

## TLS, endpoints e arquivos locais

MVP proposto aceita HTTPS e AMQPS, username/password e CA local. Host e endpoint
devem vir de perfil validado e ativado pelo usuário. IPs privados são esperados
para brokers; não usar uma regra genérica de bloqueio de rede privada que inviabilize
o produto. Não executar URLs vindas de mensagens, nomes de fila ou respostas do broker.

Não oferecer opção de certificado inválido, `rejectUnauthorized: false`, alteração
global de TLS ou fallback para protocolo sem TLS. Não seguir redirects administrativos.
CA selecionada por diálogo local, tamanho limitado e usada somente no transporte
associado. Arquivos de chave de cliente e mTLS ficam fora do MVP, sem armazenar
material criptográfico adicional antecipadamente.

## Operações, logs e retenção

Confirmação destrutiva mostra ambiente, broker sem segredo, vhost, alvo e efeito.
O main não aceita autorização derivada apenas de booleano enviado pela UI. Revalidar
sessão após diálogo; mudanças concorrentes no broker ainda podem fazer a ação falhar.
Não oferecer rollback de purge ou prometer que um timeout desfez a operação.

Logs registram data, nível, categoria, requestId e código de resultado. Redigir
credenciais, Authorization, ciphertext, payloads e corpos de resposta; não registrar
nomes/URLs completos por padrão. Na falha, usar códigos sanitizados. Exportação de
diagnóstico é recurso futuro e deve ter prévia revisão de dados.
Rotação/limites seguem NFR-021; crash dumps/uploads não serão habilitados por padrão.

## Empacotamento e testes

Avaliar fuses para desabilitar recursos não necessários, incluindo RunAsNode,
NODE_OPTIONS e inspeção CLI em release, e usar integridade ASAR onde suportada.
A automação Playwright pode precisar da inspeção CLI; o perfil de teste deve ser
distinto, sem enfraquecer o artefato distribuído. Smoke do pacote real continua
obrigatório. [Fuses](https://www.electronjs.org/docs/latest/tutorial/fuses).

Não executar testes destrutivos em endpoints fornecidos pelo usuário, mesmo que
rotulados como desenvolvimento. Fixtures e senhas/certificados efêmeros somente
no ambiente de teste, nunca credenciais reais. Ver
[estratégia de testes](../07-testing/test-strategy.md) e
[ADR-0007](../03-architecture/adr/0007-desktop-distribution.md).

## Riscos residuais e aprovação

Riscos permanecem: comprometimento do usuário/OS/broker; avisos de dependências;
diferenças de providers; limites de automação e corridas externas. Não houve pentest,
teste TLS ou verificação dinâmica desses controles. Aprovar este modelo não resolve
os achados nem autoriza instalar dependências, iniciar brokers ou publicar pacotes.

## Implementação e verificação local da 2B

SEC-01/02/03 receberam sandbox/context isolation, validação de janela/frame/URL e
comandos desktop, ponte mínima e restrições de navegação/permissões. SEC-11 tem
verificação inicial de recursos/CSP e smoke do pacote, sem concluir fuses/assinatura
ou homologação de release. Detalhes e evidências em
[fronteira desktop 2B](../07-testing/desktop-boundary-2b.md).

CSP de produção usa default-src none, script/style self, connect-src none, imagens
locais/data e frames/objetos/forms desativados. O protocolo serve somente os recursos
da UI permitidos, confina realpath e devolve erros vazios. A sessão cancela rede
Chromium/file; futuros transportes de broker serão no Node main, sujeitos a seus
próprios controles TLS/limites. Essa política não bloqueia transporte Node por si só.

Não expor copiar/colar/seletores nativos como comandos de IPC: o main abre um menu
nativo e os roles exigem a escolha do usuário no SO. A ponte não pode ler clipboard
ou receber URLs arbitrárias; openLink resolve somente o identificador fixo author.
O preload expõe a API apenas no frame principal e após confirmar sandbox/context
isolation no wrapper do Electron, sem depender de shims Node.

SEC-04/05/06/07/08/09/10/12 e controles de dados de broker/credenciais permanecem
para as etapas dos módulos; não foram homologados pela 2B. A automação e a inspeção
local usam um artefato de teste, sem comprovar fuses de release, SOs não executados
ou diálogos nativos. A conclusão da 2B foi posteriormente aprovada por “Aprovado”, com as limitações
registradas; isso não homologa os demais controles ou autoriza a 3A.
