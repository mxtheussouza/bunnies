# DOC.1 — Histórico vivo, guia do usuário e Ajuda offline

Data: 2026-10-28. Status: **concluída e aprovada por “Aprovado”**.
Conclusão/commit DOC.1 aprovados; nenhum push.
Execução autorizada diretamente pelo pedido do proprietário após “Aprovado!” para
a 4A.1, registrada em `fe4a252`. A 4A.2 permanece sem autorização.

## Entrega e ambiente

[PROJECTS_STATUS.md](../../PROJECTS_STATUS.md) passa a ser histórico vivo obrigatório,
referenciado no AGENTS para leitura/atualização em toda Task/alteração/fase.
Guia de 11 tópicos e campos reais, fonte única JSON, Markdown linkado no README e
Ajuda React offline no aplicativo. Sem nova dependência, IPC, rede ou mudança de
CSP/protocolo/sandbox. package.json mudou somente scripts de documentação/check;
manifesto de dependências/lock e assets preservados.

Host: macOS 27.0.1 arm64, Node 24.22.1/npm 11.19.1, Electron 45.1.0.
Não homologa macOS mínimo/Intel, Windows/Linux ou instaladores.

## Verificações executadas

| Comando/verificação | Resultado |
| --- | --- |
| npm run docs:generate | Gerou Markdown a partir de guide.json |
| npm run check | Passou: typecheck, lint sem warnings, 133 testes em 18 arquivos, formatação e docs:check |
| Checagem negativa de guia divergente | Passou em cópia temporária: --check aceitou arquivo correto e rejeitou alteração com exit 1; repositório preservado |
| npm run package | Passou em darwin arm64 |
| npm run smoke:package | Passou: Ajuda offline completa e todas as proteções/layout/temas da base |
| node tools/testing/profiles.cjs | Passou: regressão de CRUD, reinício, senha transitória, corrupção e confirmação simulada no main |
| Revisão visual | Índice escuro, campos claros e zoom 200% inspecionados; conteúdo/índice alcançáveis por rolagem |

Novo componente testa os oito campos atuais, exemplos de endpoints, limites,
privacidade/encerramento macOS, indisponibilidades e solução de problemas. Índice
por teclado foca h2; retorno ao índice foca o primeiro botão; URL preservada.
Shell testa entrada Ajuda, foco h1, estado ativo e retorno a Conexões pelo atalho.
O primeiro typecheck identificou duas consultas Testing Library usando a opção
exact do Playwright; corrigidas para a API correta antes do check aprovado.

O check de sincronização integra o comando check já utilizado na CI; não houve
execução remota ou alteração do workflow. Esse controle detecta divergência entre
fonte e Markdown, sem prometer revisão automática da verdade de cada instrução.
AGENTS exige revisar o guia junto de cada mudança de função/formulário.

## Smoke do executável e revisão

O harness abre o pacote com userData temporário, ativa modo offline, recarrega e
abre Ajuda. Confere todo o conteúdo canônico: introdução, 11 títulos, parágrafos,
passos, campos/exemplos, notas e situações/soluções. Nenhum link remoto, script,
formulário ou iframe é renderizado dentro da Ajuda. Não há parser HTML/Markdown
no renderer; somente React/texto e âncoras estáticas no Markdown do repositório.

Verificados índice/retorno por teclado, foco, dois temas, painel compacto e zoom
200% em 1024 × 700; sem overflow horizontal do documento e com retorno ao índice
alcançável. Modo offline restaurado antes das negativas de segurança para não
mascarar bloqueios. Janela estrangeira, CSP, recursos, rede/permissões/navegação,
12 métodos da ponte e duas recriações permanecem verificados. Os 60 pares de
contraste anteriores passaram; isso não mede todos os estados/pixels novos.

Regressão de perfis foi executada em sequência e perfil temporário próprio,
incluindo reinício completo do processo e senha ausente após reabrir. Nenhuma
configuração real, credencial de usuário, cofre ou broker foi acessado. Os smokes
encerram seus processos e removem apenas seus diretórios temporários.

Capturas locais ignoradas, inspecionadas visualmente:

| Arquivo | Conteúdo |
| --- | --- |
| out/help-doc1-index-dark.png | Índice e entrada Ajuda no tema escuro |
| out/help-doc1-fields-light.png | Instruções e campos no tema claro |
| out/help-doc1-zoom200.png | Tópico focado em janela 1024 × 700 com zoom 200% |

## Artefato

Pacote: `out/Bunnies-darwin-arm64/Bunnies.app`.
ASAR com **793591 bytes**; SHA-256:

```text
515d6f9d997a4121bb52bed6d8f56172449e0661358db2abb8f1c63b020df5da
```

Oito arquivos no ASAR; todos os IDs do guia estão incluídos no bundle renderer.
Não foram copiados PROJECTS_STATUS/AGENTS ou acervo de engenharia para exposição
no aplicativo. Sem testes/perfis/sentinelas sintéticas no pacote. Preload requer
apenas electron; código privilegiado de perfis e políticas preservado nesta Task.

Relatórios locais: `out/doc1-artifact.json`, `out/help-doc1-results.json`,
`out/ui-3b-results.json` e `out/profiles-4a1-results.json`. Os dois últimos nomes
históricos agora refletem a regressão do pacote DOC.1; evidências dos commits
anteriores continuam registradas nos documentos de cada entrega.
Logs: `out/doc1-check.log`, `out/doc1-package.log`, `out/doc1-smoke.log` e
`out/doc1-profiles-smoke.log`. Artefatos ignorados não serão commitados.

## Critérios, pendências e aprovação

Histórico e regras no AGENTS implementados; README aponta guia completo;
Ajuda contém a mesma fonte offline e orienta cada campo/ação atual. Navegação
local, foco, temas, zoom e segurança verificados; conclusão aprovada com limites mantidos.

Persistem as limitações anteriores: provider real/reopen/rotação/release sem prova,
senha protegida desligada, diálogo nativo visual e seletor de tema por teclado
pendentes de revisão manual, leitores de tela/outros SOs/CPUs sem homologação.
Sem rede/TLS/CA/sessão de broker, CI remota, publicação, assinatura ou novos instaladores.
O guia informa essas indisponibilidades; não implementa funções futuras descritas.

O proprietário respondeu “Aprovado” à solicitação de conclusão DOC.1 e do commit
`feat(help): add offline user guide and project status tracking`. Autoriza registrar
a entrega apresentada; não homologa controles/plataformas pendentes nem autoriza
nova etapa ou push. Os hashes de código/guia/ferramentas e do ASAR apresentado
foram conferidos antes de sincronizar este aceite. Sem repetição de testes
funcionais por alteração exclusivamente documental; resultados acima mantidos.
