# ADR-0001 — Stack desktop e modernização incremental

ID: ADR-0001. Data: 2026-10-28. Status: **Accepted**.

## Contexto

A base usa Electron/React/TypeScript/Webpack, sem integração RabbitMQ. O proprietário
autorizou inicialmente planejamento; a seleção foi posteriormente aprovada conforme
o registro de aprovação abaixo. Não há requisito de
memória/tamanho ou experiência Rust informado. A
[matriz tecnológica](../technology-evaluation.md) distingue versões publicadas,
candidatas e verificações ainda não realizadas.

## Alternativas

| Alternativa | Benefício | Custo/risco |
| --- | --- | --- |
| Electron atualizado, modernização incremental | Reaproveita base e usa cliente Node local | Runtime incluído e manutenção frequente de segurança |
| Tauri 2 com React/Rust | Potencial de pacote menor | Reescrever núcleo/IPC e homologar WebViews e cliente Rust |
| Reconstruir em outro toolkit | Componentes nativos possíveis conforme toolkit | Reescrita da UI sem ganho demonstrado neste contexto |

## Decisão

Adotar Electron com React/TypeScript, Forge e Webpack atualizados em recortes.
Manter npm e lockfile, unificar estilos gradualmente em Sass/CSS e adotar testes
compatíveis. Não migrar o bundler da aplicação neste ciclo. A stack está aprovada;
a estrutura definitiva de código será detalhada no contrato de implementação.

Para resolver peers, adotar a matriz candidata TypeScript 6.0.3 com typescript-eslint 8.72.1 e ESLint 10;
retirar os plugins legados React/import sem suporte declarado a ESLint 10, usar
checagem TypeScript e react-hooks compatível. Isso perde regras específicas desses
plugins, compensadas por tipagem, testes e revisão; não alegar equivalência total.
Não selecionar ESLint EOL ou ignorar peers como solução permanente. TypeScript 7
fica adiado até suporte do ecossistema. As versões exatas estão na matriz vinculada.

## Justificativa

Reduzir mudanças simultâneas ao construir o produto. Metadados suportam uma matriz
candidata, mas não comprovam resolução transitiva ou compatibilidade de runtime.
Vitest usa Vite como infraestrutura de teste, sem criar produto web ou trocar Webpack.

## Consequências

Revisar breaking changes até Electron 45, preload sandboxed, CSP e APIs de credenciais.
Gate obrigatório na 2A: instalação limpa sem peers forçados, typecheck/lint e smoke;
API ou dependência incompatível exige revisão da proposta antes de trocar a stack.
Tauri pode ser reavaliado com benchmark autorizado se tamanho/memória se tornarem
determinantes. Nenhuma atualização de pacote foi executada na 1B.

## Aprovação

O proprietário respondeu **“Aprovado”** ao pedido explícito de aceite dos ADRs
0001–0007, MVP, requisitos/limites e conclusão/commit da Etapa 1B. Stack, matriz
candidata e trade-off de lint foram aceitos em 2026-10-28. Instalação e execução da
2A dependem de contrato e autorização próprios; a matriz ainda não foi homologada.

Referências: [comparação](../technology-evaluation.md),
[processos Tauri](https://v2.tauri.app/concept/process-model/),
[breaking changes Electron](https://www.electronjs.org/docs/latest/breaking-changes).
