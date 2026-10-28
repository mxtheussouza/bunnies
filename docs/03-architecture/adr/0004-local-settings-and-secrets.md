# ADR-0004 — Configuração local e proteção de credenciais

ID: ADR-0004. Data: 2026-10-28. Status: **Accepted**.

## Contexto

O legado só persiste tema. Perfis são poucos e locais; não há necessidade demonstrada
de banco relacional. O proprietário exige proteção de segredos e funcionamento desktop.

## Alternativas

| Alternativa | Trade-off |
| --- | --- |
| Somente memória | Sem persistência de segredo, exige redigitação |
| JSON e proteção do SO | Adequado ao volume, precisa de escrita atômica e provider confiável |
| Banco local e cofre adicional | Mais dependências/migrações sem benefício comprovado no MVP |

## Decisão

Adotar JSON versionado em diretório de dados do usuário, limite e escrita atômica;
guardar somente metadados e ciphertext opcional. Segredo não salvo fica apenas em
memória. Candidato: safeStorage assíncrono, com persistência habilitada somente após
verificação do provider real em cada SO. Falha, fallback fraco ou provider incerto
impedem salvar senha; não impedir o usuário de utilizar modo em memória.

## Justificativa

Solução pequena para perfis, sem SQL ou cofre customizado antecipado. A proteção do
SO tem limites por plataforma e não protege absolutamente contra malware da mesma conta.
Disponibilidade da API não basta como prova de provider seguro.

## Consequências

Testar Linux sem keyring, falha temporária, rotação/reabertura e comportamento macOS
assinado. Não inferir provider assíncrono a partir de informação síncrona isolada.
Não retornar senha recuperada ao renderer; não persistir em localStorage, logs ou
URLs. Arquivo corrompido/desconhecido deve ser preservado, sem migração destrutiva.
Se a verificação do provider não for implementável, persistência permanece desligada
e uma alternativa exige proposta específica.

## Aprovação

O proprietário respondeu **“Aprovado”** ao pedido explícito de aceite dos ADRs
0001–0007, MVP, requisitos/limites e conclusão/commit da Etapa 1B, em 2026-10-28.
Formato, limites e alternativa em memória aceitos. O mecanismo de credenciais
ainda não está implementado ou validado; os gates de provider permanecem obrigatórios.

Referências: [safeStorage](https://www.electronjs.org/docs/latest/api/safe-storage),
[modelo de segurança](../../08-security/security-model.md) e
[limites NFR](../../02-requirements/non-functional-requirements.md).
