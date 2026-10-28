# Etapa 4A.2A — CA personalizada e teste HTTPS

Data: 2026-10-28. Execução autorizada por **“Autorizo”** ao contrato detalhado.
Status: **implementada/verificada; conclusão e commit aprovados por “Aprovado”**.
Branch `chore/modernization-app`, base `66183f7`; cinco mudanças documentais da
proposta preservadas. Sem instalação, nova dependência, mudança de lock/assets,
criação de branch ou push. O commit apresentado foi autorizado após a revisão.

## Escopo e ambiente

CA pública PEM por perfil, backup/migração explícita v1/v2, probe whoami HTTPS
cancelável e interface/guia. Não inclui AMQP, sessão ativa ou provider real de senha.
Host macOS 27.0.1 arm64; Node 24.22.1/npm 11.19.1, Electron 45.1.0.
Runtime do pacote observado: Node 24.22.1/Electron 45.1.0. Fixture gera material
sintético com LibreSSL 3.3.6 em diretórios temporários.

## Verificações

| Verificação | Resultado |
| --- | --- |
| Fixture TLS | Gerada/limpa com CA, leaf, hostname divergente e certificado expirado sintéticos |
| npm run check | Aprovado: typecheck, lint, 166 testes/24 arquivos, format:check e docs:check |
| npm run package | Aprovado: executável darwin-arm64; sem instalador/assinatura |
| npm run smoke:package | Aprovado: interface, Ajuda offline completa (12 tópicos), foco, zoom e negativas de segurança |
| node tools/testing/profiles.cjs | Aprovado: CRUD, reinício real, descarte de senha, erros e proteção condicionada desligada |
| node tools/testing/https.cjs | Aprovado: CA/migração/probe, erros, cancelamento, deadline, proxy e cleanup |
| Revisão visual | Capturas atuais dos dois temas e zoom 200% inspecionadas; sem overflow horizontal no modal |
| Docker/broker real | docker info falhou: socket do daemon inexistente; nenhum container ou broker iniciado |

## Cobertura exercitada

- CA: apenas certificados CA, DER completo sem dados extras, rejeição de chave,
  leaf, tipos/symlink/PEM/limites; seleção por janela, cancelamento, erro, expiração
  e cleanup. Token e fingerprints não incluem bytes/path.
- Configuração: v1 lido sem mutação; backup idêntico antes de v2; backup divergente,
  escrita/rename falhos, corrupção/versão, duplicidade e limites preservam original.
  Token é consumido só após sucesso; senha anterior é mantida nos erros.
- TLS/HTTP real em Node: CA correta, CA desconhecida, hostname divergente, expiração,
  prefixo/Basic, 401/403/404/3xx, identidade divergente, JSON/formato/profundidade,
  corpo/headers/compressão, cancelamento e rede. Nenhum broker real nesses cenários.
- Lifecycle: uma execução por janela, cancelamento por owner/ID, revision, resultado
  atrasado, snapshot atrasado sob deadline total e quit. Clock falso cobre prazo;
  socket real cobre cancelamento/encerramento.
- IPC: janela/frame/URL/shape/tamanho, path/URL proibidos, seletor main-only e
  revalidação, cleanup em reload/crash/closed; falhas sem segredo/stack/path/certificado.
- UI: ação explícita, segredo ausente, resultado datado sem sessão, cancelamento,
  descarte de seleção e campo password transitório; guia/Ajuda com fonte única.

## Smoke do executável

`tools/testing/https.cjs` usa userData e servidor HTTPS locais próprios. Começa com
arquivo v1, prova ausência de gravação/rede ao abrir/selecionar e falta de senha
antes da rede. Picker simulado exclusivamente no main devolve chave privada
(rejeitada), depois CA válida; arquivo/parser/IPC do produto são reais. Salvar cria
v2/backup v1 exato e não persiste senha/caminho original. Snapshot não inclui PEM.

Testa login, códigos/redirect sem retry, cancelamento, deadline, mudança de perfil
em voo e fechamento real da janela macOS. Remove CA para defaults e prova recusa
da fixture desconhecida. Proxy é configurado somente no processo filho; uma trap
loopback recebe zero requests quando o agente dedicado ignora esse ambiente.
Nenhuma preferência persistente do host/proxy/TLS é alterada.

Verifica dois temas, zoom 200%, ausência de overflow no modal, sessão não ativada,
páginas de broker bloqueadas e senha ausente de arquivo/DTO/storage. Smokes base e
perfis mantêm sandbox/CSP/recursos/rede/permissões, janela estrangeira, 16 métodos,
duas recriações e Ajuda completa offline. Picker/diálogos nativos visuais não são
homologados por interceptação do harness.

## Ocorrências de verificação

Typecheck exigiu fixtures com trust, terceiro invoke explícito do preload e literal
de environment no teste novo. Um teste reteve a expectativa VALIDATION após o novo
diagnóstico TEST_CREDENTIAL_FORMAT; corrigido para a intenção nova. A revisão
acrescentou rejeição de DER extra, mensagem explícita de ausência de AMQPS e erro de
CA associado ao seletor. O cenário adicional de framing TLS cru expirou no harness;
a fixture passou a consumir a requisição e destruir seu peer no finally, sem relaxar
qualquer limite do produto. O cenário alvo e a suíte completa passaram depois da correção.

No smoke final, o macOS limitou a janela normal solicitada a 1440x900 à área útil
1440x870 da tela. Diagnóstico confirmou zoom 1/estado normal. O harness usa agora
tela cheia apenas na sua janela para manter a asserção exata 1440x900; retorna ao
modo normal nos tamanhos menores e antes de testar minimizar/maximizar. Nenhuma
resolução/preferência global ou configuração de produto foi alterada. Lint e os
três smokes passaram no mesmo pacote após esse ajuste exclusivo do harness.

## Resultado por critério aprovado

| Critério do contrato | Evidência obtida |
| --- | --- |
| 1 — CA e seleção limitada | Testes de parser/arquivo/token/IPC e smoke rejeitam chave e importam CA; sem caminho/PEM no DTO |
| 2 — v1/v2 e preservação | Integração de repositório/migração cobre backup, conflito e falhas; smoke compara backup byte a byte |
| 3 — credencial main-only | Ausência de senha impede rede; sentinela ausente de disco/DTO/storage/pacote; senha não retornada ao renderer |
| 4 — validação TLS | Servidor TLS real isolado cobre CA correta/desconhecida, SAN divergente e expiração; sem trust global/bypass |
| 5 — request/erros/limites | Prefixo e Basic conferidos; 401/403/404/3xx, resposta, framing, tamanho, profundidade, cancelamento e prazo exercitados |
| 6 — invalidação e lifecycle | Serviço/UI/IPC e smoke cobrem revision, resultado atrasado, edição, fechamento, recriação e sockets encerrados |
| 7 — autoridade e regressões | Negativas de IPC e smoke preservam URL/CSP/sandbox/permissões/recursos, com 16 métodos específicos |
| 8 — UI e guia | Componentes, teclado/foco, temas, modal 1024x700/zoom 200%, conteúdo completo da Ajuda; revisão nativa/assistiva pendente |
| 9 — verificações e limites | Check/package/três smokes aprovados em macOS arm64; broker real e outros alvos explicitamente não homologados |

No prazo real medido, clique até feedback levou **10.421 ms**, incluindo espera do
Playwright/renderização; deadline do serviço continua **10.000 ms**, coberto por
clock controlado. Cancelamento/prazo/fechamento deixaram zero sockets da fixture.
Proxy herdado foi ignorado (trap com zero requests); Chromium fez zero requests
externos. Não houve sessão ativa nem acesso a broker/configuração do usuário.

## Artefato conferido

`out/Bunnies-darwin-arm64/Bunnies.app/Contents/Resources/app.asar`: **819.822 bytes**.
SHA-256: `ece1644c4ba1a6e5c3fc6e19249a8a075bbf956512aeda05239ed2aa0008f146`.
Contém oito arquivos de produto; preload requer somente electron. Os 12 tópicos
do guia estão no bundle. Sem testes, fixtures, source maps, chaves privadas,
certificados sintéticos ou sentinela de senha no ASAR.

Relatórios/capturas locais em out são ignorados pelo Git: `4a2a-check.log`,
`4a2a-package.log`, `ui-3b-results.json`, `help-doc1-results.json`,
`profiles-4a1-results.json`, `https-4a2a-results.json`, `4a2a-artifact.json` e
`https-4a2a-*.png`. Os nomes históricos dos smokes base/perfis foram mantidos;
seus resultados citados aqui são da regressão final 4A.2A sobre o artefato acima.

## Compatibilidade e fontes

Revalidação em 2026-10-28: a página oficial mantém 4.4.0/4.3.6 nas séries de referência;
não houve mudança da matriz aceita. [Release Information](https://www.rabbitmq.com/release-information).
Código oficial de whoami chama o formatter de usuário; o campo name foi conferido
nas tags [4.4.0](https://github.com/rabbitmq/rabbitmq-server/blob/v4.4.0/deps/rabbitmq_management_agent/src/rabbit_mgmt_format.erl#L250) e
[4.3.6](https://github.com/rabbitmq/rabbitmq-server/blob/v4.3.6/deps/rabbitmq_management_agent/src/rabbit_mgmt_format.erl#L250).
Isso é revisão de contrato de resposta, não execução/homologação desses brokers.

## Limitações e aprovação

RabbitMQ real, AMQPS/sessão, providers/release, outros SOs/CPUs, leitores de tela,
seletor nativo de CA visual e teclado nativo de tema herdado continuam pendentes.
Sem CRL/OCSP automático, CAS contra editor externo arbitrário, recuperação automática
de stale lock, garantia contra perda de energia ou zeroização de strings JS.
Deadline invalida resultado e destrói recursos do app; trabalho DNS/I/O já entregue
ao SO não é cancelamento físico garantido nem rollback de tentativa de login.

O proprietário respondeu “Aprovado” à solicitação explícita de conclusão/commit
4A.2A. Os 58 arquivos apresentados e o ASAR mantinham os hashes registrados.
Este aceite sincroniza somente documentação; código/guia/ferramentas apresentados
permanecem inalterados. Resultados funcionais anteriores não foram repetidos.

Uma alteração local posterior em misc/window/components/Titlebar/index.tsx foi
preservada fora do commit aprovado e não integra o artefato/evidências acima.
Não iniciar 4A.2B/C ou realizar push sem suas autorizações específicas.
