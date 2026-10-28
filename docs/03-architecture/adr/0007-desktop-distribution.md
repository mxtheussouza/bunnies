# ADR-0007 — Distribuição e verificação por plataforma

ID: ADR-0007. Data: 2026-10-28. Status: **Accepted**.

## Contexto

Há makers legados, mas nenhum artefato homologado, certificado ou publisher
configurado. Distribuição Windows/Linux/macOS é requisito; uma máquina não comprova
todos os resultados. Não há autorização para publicar ou configurar updater.

## Alternativas

| Alternativa | Trade-off |
| --- | --- |
| Empacotar só ao final ou em um único SO | Detecta problemas tarde e deixa alvos sem evidência |
| Introduzir updater/publicação completos na fundação | Exige infraestrutura e decisões ainda não definidas |
| Smoke cedo, build por alvo e release separada | Mais checkpoints, risco de distribuição controlado |

## Decisão

Adotar Forge, conforme ADR-0001 aceito, com smoke de package na fundação e homologação por
SO/CPU. Candidatos: Squirrel Windows, DEB Ubuntu e ZIP macOS; RPM somente após teste
em distribuição compatível. DMG e outros formatos dependem de demanda e contrato.
Assinatura, notarização, credenciais de CI, updater e publicação terão requisitos e
autorização específicos antes de execução.

## Justificativa

Preservar o tooling útil e detectar cedo recursos ausentes, paths dependentes de CWD,
fronteiras e diferenças de provider. Manter release rastreável e controlada.

## Consequências

Gerar/verificar artefatos em alvos apropriados; registrar versão, commit, checksums
e evidências, sem publicar automaticamente. Definir fuses/CSP e testar o artefato
real. Playwright experimental pode exigir perfil de teste separado de release;
resultado de automação não homologa instalador, assinatura ou diálogo nativo.
Uso de CI hospedado e certificados dependerá de infraestrutura ainda não aprovada.

## Aprovação

O proprietário respondeu **“Aprovado”** ao pedido explícito de aceite dos ADRs
0001–0007, MVP, requisitos/limites e conclusão/commit da Etapa 1B, em 2026-10-28.
Estratégia e formatos candidatos aceitos, sem autorizar build/release nesta etapa.
O documento detalhado de releases será elaborado quando necessário e autorizado.

Referências: [Forge build](https://www.electronforge.io/core-concepts/build-lifecycle),
[testes](../../07-testing/test-strategy.md) e
[segurança](../../08-security/security-model.md).
