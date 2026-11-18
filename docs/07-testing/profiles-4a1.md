# Etapa 4A.1 — evidências de perfis locais

Data: 2026-10-28. Execução autorizada por **“Autorizo”**, após contrato em `eb535d7`.
Status: **concluída e aprovada por “Aprovado!”; commit autorizado**.
Branch `chore/modernization-app`, base limpa `eb535d7`. Sem instalação, atualização
de pacotes, edição de lock/assets, criação de branch, commit ou push.

## Escopo e ambiente

CRUD local/JSON/segredo em memória e proteção condicionada, IPC específico e UI.
Não conecta a RabbitMQ, não testa TLS/autenticação e não homologa M01/MVP.
Ambiente local: macOS arm64, Node 24.22.1/npm 11.19.1, Electron 45.1.0.
Host macOS 27.0.1 (26A434), arm64; isso não homologa macOS mínimo/Intel, Windows ou Linux.

## Comandos e resultados

| Verificação | Resultado efetivo |
| --- | --- |
| npm run check | Passou: typecheck, lint sem warnings, 130 testes em 17 arquivos e formatação |
| npm run package | Passou em darwin arm64; ASAR inspecionado abaixo |
| npm run smoke:package | Passou com proteções 2B/3B e allowlist explícita ampliada |
| node tools/testing/profiles.cjs | Passou: CRUD, reinício completo, memória descartada, foco/zoom/descarte e arquivo inválido preservado |

## Cobertura e limites

Arquivo temporário: schema/UTF-8/versão/duplicados, limites de 50/2 MiB, locks,
revisões, escritores simultâneos, falha de rename e preservação/limpeza.
Serviço: keep/replace/remove, reinício sem senha transitória, mudança externa,
fila limitada, cancelamento e conflito após confirmação. IPC: origem/frame/URL,
campos extras, tipo/tamanho e sanitização. Componentes: campo password transitório,
bloqueio de duplicidade, seleção sem sessão, ações explícitas e descarte.

Provider: somente fakes com prova sintética para seguro/inseguro/desconhecido,
ausência/falha/indisponibilidade, reopen, decrypt e rotação. Composição de produto
não recebe prova e permanece em memória. O round-trip fake não valida criptografia
do SO, assinatura ou provider real. Não houve acesso ao cofre do usuário.

Limites residuais: strings JS não são zeroizáveis por garantia; lock cooperativo
não é CAS contra escritor arbitrário; stale lock exige tratamento manual futuro;
permissões POSIX não homologam ACL Windows; sem garantia de perda de energia.
Temas/zoom e automação não certificam WCAG/tecnologias assistivas. Seletor nativo
de tema continua com pendência manual da 3B.

## Ocorrências corrigidas

- União discriminada de ações de segredo e tipagem do ref do botão ajustadas no typecheck.
- Testes IPC passaram a alterar frame fake, pois URL real Electron é readonly.
- Validação de controles usa códigos de caracteres, respeitando lint; comandos não sofrem coerção para string.
- Métodos de dialog ausentes no jsdom foram simulados somente nos testes; o produto usa HTMLDialogElement nativo.
- Formatação de dois testes corrigida antes do check completo.
- Smoke Chromium identificou label de select incluindo texto das opções; controles passaram a usar label/for/id explícitos.

## Artefato, smoke e revisão final

Executável local: `out/Bunnies-darwin-arm64/Bunnies.app`.
ASAR: **774315 bytes**; SHA-256:

```text
f5085b0648745ed5285bdc1eb4a6285a4b5818c04d108d0852d49b0c45fa9acb
```

Oito arquivos no ASAR: main, HTML/JS/CSS, licença do bundle, preload, wordmark e
package.json. Sem testes, documentação, perfis ou sentinelas de senha sintética.
Preload contém somente require externo electron; nenhum shim Node adicionado.
Inspeção local: `out/profiles-4a1-artifact.json`. Uma consulta inicial ao ASAR usou
caminhos com barra inicial e falhou; corrigida para caminhos relativos antes da
inspeção aprovada. Nenhuma alteração do pacote para facilitar inspeção.

Smoke base mantém todas as proteções anteriores: sandbox, contexto, CSP, recursos,
rede/permissões/navegação, janela estrangeira e duas recriações. Acrescentado teste
real de listProfiles negado para janela estrangeira. Os 60 pares anteriores de
contraste continuam aprovados; isso não cobre todos os pixels/estados nativos novos.

Smoke dos perfis usa processo empacotado e userData temporário. Cadastra perfil,
confere estado de produção, guarda senha somente no main, seleciona sem sessão,
edita metadados com keep e cancela substituição/alterações. Fecha completamente o
processo, reabre e verifica metadados presentes/senha ausente. Simula somente no
main as respostas Cancelar/Remover do diálogo nativo, verifica conteúdo/defaults,
remove o perfil e injeta versão desconhecida no arquivo temporário para provar
preservação/bloqueio. Nenhum request externo Chromium observado nesses fluxos;
não há cliente/transporte de broker no código executado. Sem teste de rede/TLS.

A senha sentinela não foi encontrada no JSON de perfis, snapshots IPC ou storage
local/session do renderer; erros do provider e do IPC são testados por sanitização.
Código de produto não registra senha/ciphertext. Isso não representa varredura de
memória, dump de processo ou garantia contra captura por malware da conta.
Diretórios/processos próprios dos testes foram encerrados/removidos.

Capturas locais ignoradas e inspecionadas visualmente:

| Arquivo em out/ | Conteúdo |
| --- | --- |
| profiles-4a1-form-light.png | Formulário claro, labels e produção |
| profiles-4a1-selected-dark.png | Perfil selecionado/sem sessão e senha desta execução |
| profiles-4a1-form-dark-zoom200.png | Formulário escuro em 1024 × 700 / zoom 200%, botões alcançáveis pela rolagem |
| profiles-4a1-reopened-light.png | Metadados após reinício, senha indisponível |
| profiles-4a1-corrupt-light.png | Erro de versão inválida, sem reset/sucesso aparente |

Revisão encontrou e corrigiu falta de padding no novo card, seletores antigos sem
uso, aviso anterior mantido após recarga e quebra de nomes longos. Labels de selects
usam for/id; erro do formulário é associado ao fieldset. URL fixa e CSP preservadas.
Os checks/package/smokes acima foram repetidos após os últimos ajustes de produto.

Logs locais: `out/profiles-4a1-check.log`, `out/profiles-4a1-package.log`,
`out/smoke-4a1-base.log`, `out/profiles-4a1-smoke.log`. Relatórios:
`out/ui-3b-results.json` (base reexecutada) e `out/profiles-4a1-results.json`.
O nome histórico do relatório base não significa uso de um pacote antigo.

## Conferência dos critérios do contrato

| Critério | Evidência / limite |
| --- | --- |
| 1 — CRUD/limites/reinício sem broker | Repository/service/components e smoke com reinício completo; somente metadados persistem |
| 2 — Falhas/corrupção/conflitos | UTF-8/schema/versão, 50/2 MiB, rename falho, lock/revision/escritores concorrentes; original preservado |
| 3 — Provider condicionado | Fakes de gates/provider/indisponibilidade/decrypt/reopen/rotação; produto em memória, sem prova real |
| 4 — Ausência de senha em superfícies persistidas/retorno | Sentinelas em disco/DTO/storage/pacote; mensagens sanitizadas; sem promessa sobre dumps |
| 5 — keep/replace/remove/descarte | Serviço, formulário e smoke; falha de escrita/provider não apaga valor anterior |
| 6 — UI/seleção/teclado | Dois temas, produção textual/simbólica, foco modal/Tab/Shift+Tab/Escape e zoom; nativos/assistivas permanecem pendentes |
| 7 — Fronteira IPC | Quatro métodos adicionais finitos, negativas unitárias e janela estrangeira no pacote; proteções base mantidas |
| 8 — Checks/revisão/documentação | Comandos acima executados, revisão técnica/visual e docs sincronizados; pronto para apreciação do proprietário |

## Pendências declaradas

- Persistência protegida **desligada em todos os alvos**: provider assíncrono efetivo,
  reabertura/indisponibilidade/rotação reais e release assinado não comprovados.
  Fakes não habilitam o gate. Não houve consulta/inicialização do cofre real.
- Confirmação nativa: conteúdo/defaults/respostas testados com interceptação no
  main; apresentação visual e interação real do SO exigem revisão manual.
- Seletor nativo de tema por teclado herdado da 3B, tecnologias assistivas,
  Windows/Linux/macOS Intel/mínimo, CI remota, p95 e instaladores não homologados.
- Avisos de dependências da 2B e gates de assinatura/fuses/notarização mantidos;
  dependências não foram alteradas nem reavaliadas nesta subetapa.
- Rede, CA, autenticação/sessão/reconexão e demais operações RabbitMQ dependem da
  4A.2 e contratos futuros. M01/MVP não concluídos.

## Aprovação

O proprietário respondeu **“Aprovado!”** ao pedido explícito de conclusão da
4A.1 e commit `feat(connections): implement local profiles and transient credentials`.
Limitações mantidas; nenhum provider/diálogo nativo/outra plataforma homologado
por esse aceite. Registrar o commit apresentado, sem push ou execução da 4A.2.
A Task adicional de histórico/guia/Ajuda tem autorização própria e entrega separada.
