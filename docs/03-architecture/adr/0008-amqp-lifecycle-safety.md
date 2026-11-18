# ADR-0008 — Segurança do lifecycle inicial AMQP

ID: ADR-0008. Data: 2026-10-30. Status: **Accepted**.
O proprietário respondeu “Autorizo aplicar e testar a alternativa A da ADR-0008”.
Aceita a exceção delimitada abaixo; eficácia permanece sujeita aos testes. Não
autoriza ampliar o diff, trocar cliente ou registrar conclusão/commit antecipados.

## Contexto

O gate 4A.2C reproduziu exceções antes de amqplib 2.2.0 entregar o modelo público:
open-ok combinado com Close 403 ou frame inesperado. Seis saídas anormais em onze
cenários, incluindo Callback/Promise e runtime Node do Electron. TCP próprio e
listeners públicos após connect não impediram. [Evidências](../../07-testing/sessions-4a2c.md).

Potencial impacto no probe existente é inferência do mesmo caminho, sem novo smoke
de GUI. Latest observado no registry em 2026-10-30: 2.2.0; nenhuma correção publicada
foi comprovada na consulta. Dependência permanecia intacta durante esse diagnóstico inicial.

## Alternativas

| Alternativa | Benefício | Custo/limite |
| --- | --- | --- |
| A — Patch local mínimo, versionado e verificado | Preserva stack/cliente; corrige ordem com mudança pequena | Mantemos modificação de terceiro, com instalação/build reproduzíveis, regressões e retirada futura |
| B — AMQP em utilityProcess Electron | Queda não derruba diretamente o main | Nova fronteira IPC/segredos/build e supervisão; não corrige perda de evento por si só |
| C — Outro cliente ou fork/release corrigido | Pode dispensar manutenção de patch | Nenhum candidato homologado; avaliação de dependências/API/TLS e migração próprias |
| D — Capturar exceção global ou ler estado privado | Oculta parte da falha | Rejeitado: estado possivelmente corrompido e violação do contrato |

Mudar apenas para Promise foi testado e não resolveu. Trocar stack ou implementar
AMQP próprio não é necessário para formular esta decisão.

## Decisão

**Alternativa A aceita para aplicação e teste**, limitada a um
ponto em lib/connection.js do amqplib 2.2.0: adiar o primeiro loop até o próximo
turno, deixando callbacks e cadeias Promise instalarem handlers. Hipótese
fundamentada na ordem observada, **não solução já testada**.

Diff exato dentro de succeed:

~~~diff
-      self.acceptLoop();
+      setImmediate(() => self.acceptLoop());
       openCallback(null, ok);
~~~

Não alterar parsing/framing, autenticação, TLS, heartbeat, close ou recovery.
Sem catch global, alteração de protótipos ou patch em runtime do app. Se esse diff
não satisfizer gates, não ampliar silenciosamente; apresentar nova decisão.

### Identificação do candidato

- Arquivo: lib/connection.js, amqplib 2.2.0.
- SHA-256 original: 0966aae8e582c2ec6e137cb8773deb28b962a287d28890c61504b83cee1d803b.
- SHA-256 candidato: e429dd17f333dcedf925c692c862bc3aa8a85cbed971396456d9df61d2a98de6.

Hash candidato calculado em memória com substituição única, sem gravar
node_modules ou executar a modificação. Hashes não provam correção funcional.

### Autorização adicional solicitada — A

1. Criar patch e aplicador/verificador Node em tools/patches, sem pacote adicional.
   Validar versão, hash original e ocorrência única; aceitar também hash final
   para idempotência. Conteúdo inesperado falha fechado, sem tentar adaptá-lo.
2. Aplicar na instalação local/npm ci por postinstall raiz controlado; verificar
   antes de check/start/package e no build main, detectando scripts ignorados.
   Nada de patch no binário distribuído. Manifesto/lock só recebem metadados
   necessários, sem resolver/atualizar outros pacotes ou mudar versão fixada.
3. Preservar licença/proveniência e registrar dependência modificada, com remoção
   explícita quando houver release upstream corrigido e validado. Aplicador não
   baixa código nem altera outros arquivos da biblioteca.
4. Reexecutar gate em Callback/Promise/Electron Node, acrescentar ambos modelos
   no runtime embarcado, eventos precoces/tardios, heartbeat e abort/close antes
   e depois do loop adiado. Exigir ausência de crash/falso sucesso/recurso órfão;
   regressão do app/probe existente também obrigatória.
5. Provar instalação limpa reproduzível com lock/scripts permitidos em diretório
   temporário; hashes/versões exatos, sem sobrescrever workspace/arquivos do usuário.
6. Somente com gate aprovado, retomar 4A.2C já autorizada, mantendo seus limites.
   Check/package/smokes/matriz real 4.4.0/4.3.6 devem validar o resultado completo.

Arquivos adicionais: tools/patches/amqplib-2.2.0.patch e aplicador .cjs, seus testes,
scripts raiz/metadados mínimos do lock, configuração de build main, regressões e
documentação de dependências/segurança/desenvolvimento. Não autoriza B/C, enviar
issue/PR upstream, publicar, criar commit ou push automaticamente.

## Justificativa

A falha antecede a instalação de handlers pela API pública; mudança proposta
limita-se a esse agendamento. Menor que criar processo/supervisão ou substituir
cliente, mas assume manutenção explícita. A prova inclui ambos modelos: adiar
somente até o fim do callback síncrono não garante handlers de Promise.

## Consequências

- Benefício: gate corrigido converteu os crashes reproduzidos em eventos/estados tratados; alcance limitado aos cenários executados.
- Risco: muda agendamento inicial, podendo afetar close/abort/probe. Regressões
  preservam semântica de confirmação, sem apenas mudar expectativas para ficar verde.
- Lock identifica tarball upstream; integridade da modificação local passa também
  por hashes/aplicador/build. Não alegar instalação idêntica à publicada.
- Ignorar scripts causa falha explícita na verificação/build, sem flag de bypass.
- ADRs 0001–0007 continuam Accepted; esta é exceção delimitada à política da 4A.2C.
  Até o aceite, gate reprovado e trabalho dependente parado; produto intacto.

## Aprovação

Em 2026-10-30, “Autorizo aplicar e testar a alternativa A da ADR-0008” aprovou A,
incluindo aplicação/verificação e testes desta decisão. B/C continuam não aceitas;
D permanece rejeitada. Gate aprovado é condição para retomar a 4A.2C já autorizada.
Aceite não comprova correção nem aprova conclusão/commit da entrega.

## Execução da alternativa A

Aplicada somente a linha autorizada. SHA final conferido pelo aplicador/build,
seis testes Node e instalação limpa isolada aprovados. Gate de 30 cenários passou
em Callback/Promise, Node/Electron Node, com prazos/cleanup/zero canais e sem
handler global. Regressões do adapter/probes e pacote intermediário/matriz real
passaram; sessão integrada verificada/pronta para revisão. Histórico da falha e resultados completos
ficam nas evidências 4A.2C. Não equivale à homologação universal ou conclusão aceita.
