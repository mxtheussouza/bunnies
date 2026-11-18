# ADR-0003 — Fronteira privilegiada desktop

ID: ADR-0003. Data: 2026-10-28. Status: **Accepted**.

## Contexto

A base isola contexto e desativa Node no renderer, mas desativa sandbox e não valida
remetente IPC/URL externa. A nova integração lidará com credenciais e escritas em brokers.

## Alternativas

| Alternativa | Trade-off |
| --- | --- |
| Rede e acesso ao sistema no renderer | Mais privilégio e segredo expostos à UI |
| Ponte genérica para IPC/HTTP | Conveniência com superfície ampla e contratos frágeis |
| Métodos específicos, validação e execução no main | Mais contratos explícitos, menor superfície |

## Decisão

Adotar renderer com sandbox e sem Node, preload mínimo e contratos serializáveis.
Main valida remetente, frame/origem, schema, tamanho e contexto. Operações críticas
passam por confirmação nativa no núcleo, com revalidação após o diálogo, sem confiar
em `confirmed: true` da UI. Adotar protocolo local com recursos restritos, CSP de
produção e bloqueio de navegação, novas janelas e permissões desnecessárias.

## Justificativa

Reduzir impacto de conteúdo não confiável e tornar validação/erro testáveis. Os
controles e riscos residuais estão no [modelo de segurança](../../08-security/security-model.md).

## Consequências

Adaptar preload às mudanças do Electron 45, extrair CSS de produção e reduzir
handlers de edição por roles nativas. Fakes de confirmação/IPC não homologam o
diálogo ou isolamento reais; testar a configuração efetiva e o pacote por SO.
Uma futura mudança para Tauri exige decisão revisada e aprovação explícita,
preservando limites equivalentes em commands/capabilities.

## Aprovação

O proprietário respondeu **“Aprovado”** ao pedido explícito de aceite dos ADRs
0001–0007, MVP, requisitos/limites e conclusão/commit da Etapa 1B, em 2026-10-28.
Fronteira e confirmação privilegiada aceitas; os controles ainda não foram
implementados e os achados do legado continuam abertos.

Referências: [Electron security](https://www.electronjs.org/docs/latest/tutorial/security),
[arquitetura](../architecture.md) e [testes](../../07-testing/test-strategy.md).
