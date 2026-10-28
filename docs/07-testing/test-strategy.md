# Estratégia de testes

Data: 2026-10-28. Status: **Approved como estratégia de validação**.
Aceita na conclusão da 1B junto aos requisitos e ADRs. O catálogo abaixo define a cobertura pretendida; a Etapa 1B executou somente
verificações documentais. Evidências iniciais da implementação estão no final.

## Ferramentas e limites

Candidatos: Vitest para funções/casos de uso e integração; Testing Library + jsdom
para React; Playwright para E2E Electron; brokers efêmeros via containers. Versões e
peers estão na [matriz tecnológica](../03-architecture/technology-evaluation.md).
Vite é dependência do runner Vitest; seu uso não altera o bundle Webpack da aplicação.

Playwright declara suporte experimental ao Electron. Ele não comprova diálogos
nativos nem substitui smoke do pacote. A inspeção CLI exigida pela automação pode
ser desabilitada por fuses de release: executar automação em perfil de teste e
verificar o pacote real separadamente, sem reduzir sua proteção.
[Playwright Electron](https://playwright.dev/docs/api/class-electron).

Schemas/fakes devem exercitar contratos e casos reais. Não criar testes que apenas
espelhem implementação ou snapshots gigantes. Coverage é informação de lacunas,
sem meta arbitrária de percentual que substitua cenários críticos.

## Catálogo e rastreabilidade

| ID | Camada / cenário | Requisitos e critérios | Evidência esperada |
| --- | --- | --- | --- |
| T-01 | Contratos, fronteiras e ciclo IPC | FR-030; NFR-006/012/027; MVP-S01 | Remetente/frame inválido, comando desconhecido, DTO/tamanho inválido, registro único e unsubscribe |
| T-02 | Perfis, persistência e segredos | FR-001/002/024; NFR-005/011/020; MVP-C01 | Round-trip protegido, memória, provider indisponível, limites, corrupção, interrupção de escrita e schema desconhecido |
| T-03 | Adapter HTTP e contratos de resposta | FR-006/007/008/012/019/020/021; NFR-014/015; MVP-D01/Q01/A01 | Encoding, paginação suportada, redirect rejeitado, limites, campos ausentes e escopo de métricas |
| T-04 | Autenticação e TLS HTTP/AMQP | FR-003/028; NFR-003/007; MVP-C02/S01 | Usuário inválido, 401/403, CA própria, cadeia inválida, certificado expirado e hostname divergente |
| T-05 | Sessão, cancelamento e reconexão | FR-004/005/027/029; NFR-009/012/013/019; MVP-C03 | Corte/restauração de rede, resposta atrasada, troca de contexto, limite de tentativas e ausência de replay |
| T-06 | Topologia e ações destrutivas | FR-009/010/011/013/014/025; NFR-010; MVP-Q02/Q03/E01 | Classic/quorum, argumentos, conflitos, binding, condições de exclusão, confirmação/cancelamento e contexto alterado |
| T-07 | Publicação e resultados AMQP | FR-015/016/017/018; NFR-009/015/016/017; MVP-M01/M02 | JSON, headers, limits, backpressure, confirm, nack/return e resultado incerto |
| T-08 | Polling, snapshots e escalabilidade | FR-021/022; NFR-014/017/018; MVP-O01 | Sem sobreposição, background, dados indisponíveis, limite de resposta e cancelamento |
| T-09 | Redação de logs e privacidade | FR-002/026; NFR-005/008/021; MVP-S01 | Sentinelas ausentes de logs/arquivos indevidos, rotação e erros sanitizados |
| T-10 | Componentes e E2E desktop | FR-023/024/025/026/030; NFR-006/010/022/023/024; MVP-P01/S01 | Teclado, foco, temas, zoom, CSP, payload como texto e fluxo de confirmação |
| T-11 | Desempenho de referência | NFR-025/026 | Medições com hardware/OS, amostras e p95; sem alegar SLA de rede |
| T-12 | Pacote, governança da entrega e homologação | NFR-001/002/004/007/028/029/030; MVP-R01 | Recursos/caminhos, ausência de telemetria/serviço próprio, sandbox/CSP/fuses, credenciais, aprovação registrada e instalação por alvo real |

Para células compactas, `FR-001/002` significa FR-001 e FR-002; o mesmo vale para
NFR e MVP quando o prefixo se repete. Documentos de módulo deverão vincular os
cenários selecionados ao contrato de implementação.

## Fakes e integração real

Injetar relógio/backoff, confirmação, armazenamento, proteção de segredo e transportes
em casos de uso. Fake de cofre testa lógica, não segurança do SO. Mock de HTTP testa
tratamento de resposta, não contrato real do broker. Fake de confirmação não homologa
o diálogo nativo, que precisa de verificação manual por plataforma.

Integração real proposta: RabbitMQ 4.4.0 e 4.3.6, plugin management, TLS efêmero,
usuários com permissões distintas, vhost e recursos únicos por execução. Fixar imagem
por digest ao implementar, sem inventar digest nesta etapa. Criar dados sintéticos;
uma instância de nó único cobre fluxos básicos, sem alegar homologação de cluster/HA.

O harness provisiona seus próprios endpoints e verifica sua origem antes de permitir
criação, exclusão ou purge. Não aceitar `BROKER_URL` arbitrária como substituto de
fixture destrutiva. Namespace único, cleanup no teardown e encerramento no finally;
falha de cleanup deve aparecer no relatório. Certificados/senhas gerados para testes
não são credenciais reais e não devem vazar nos logs.

Falhas de rede: interromper conexão do container ou usar transporte/proxy de teste
isolado e determinístico; verificar efeito observado, não só contador de retries.
Confirmar que reconexão não duplica criação/envio. Para publicação ambígua, verificar
que a UI diz resultado incerto e não dispara nova chamada.

## Matriz de execução candidata

| Momento | Verificações | Ambiente |
| --- | --- | --- |
| 1B | Links, tabelas, IDs, rastreabilidade, status ADR e preservação do código | Diagnóstico de leitura, sem instalar ferramentas |
| 2A | Instalação limpa, typecheck, lint, funções e componentes iniciais | Node/npm fixados e CI por contrato |
| 2B | Fronteira real, sandbox/CSP, ciclo da janela e smoke de pacote | Electron candidato; cada alvo disponível |
| 4A/4B | Credenciais/TLS e HTTP nas duas versões de referência | Brokers isolados; provider real por SO |
| 5/6/7 | Topologia, destruição e publicação | Recursos efêmeros por execução |
| 8/9 | E2E, falhas, acessibilidade e metas de desempenho | Quatro alvos candidatos e cenários estáveis |
| 10/11 | Instalação, atualização apenas se aprovada e smoke de artefato real | Máquinas/runners de cada SO/CPU |

Uma estratégia possível de CI usa unitários/componentes em todas as mudanças,
integração das duas versões em Linux e smoke nativo por SO/CPU. Runners e custos ainda
precisam de definição. RPM requer ambiente compatível e teste próprio antes de
qualquer promessa de suporte a Fedora/RHEL. Headless Linux não homologa Wayland,
acessibilidade ou armazenamento de credenciais numa sessão desktop real.

## Gates de aceitação

1. **Matriz tecnológica:** dependências resolvidas sem peers forçados; compilação,
   lint e execução verificam APIs além dos intervalos declarados.
2. **Fronteira:** T-01/T-10 e inspeção efetiva comprovam Node desativado, sandbox,
   navegação e CSP, sem expor Electron pelo preload.
3. **Segredos:** T-02/T-09 por SO antes de habilitar persistência; provider incerto
   mantém apenas memória. Não usar cofre fake como aprovação do mecanismo real.
4. **Broker:** contratos T-03/T-04/T-06/T-07 nas versões-alvo antes de declarar suporte.
5. **Release:** T-12 por artefato; pacote com fuses de release não herda relaxamentos
   do perfil de automação. Assinatura/notarização têm gates próprios quando aprovadas.

Falha ou teste indisponível deve ser registrado com impacto e próxima ação, sem
marcar o gate como aprovado. Não executar teste destrutivo em produção. Não declarar
que a aprovação documental comprova compatibilidade de runtime ou distribuição.

## Registro de resultados

Cada execução futura registra commit/dirty state, versões, OS/CPU, comandos, fixtures,
tempo, resultado e limitações; anexos devem excluir segredos. Guardar relatórios
apenas onde a etapa autorizar. O histórico de entrega fica em
[progress.md](../05-roadmap/progress.md).

Na 1B não foram criados testes, scripts, containers, imagens ou snapshots de aplicação.
Os resultados efetivamente executados ficam no registro da etapa; este catálogo
permanece um plano. [Guia Vitest](https://vitest.dev/guide/).

## Evidências iniciais da Etapa 2A

Foram executados 11 testes de comportamento em dois arquivos (tema/teclado e
metadados de versão), instalação limpa, typecheck/lint/formatação e smoke do pacote
macOS arm64. São cobertura inicial e parcial de T-10/T-12; não encerram esses
cenários, o MVP ou a matriz multiplataforma. Não houve integração com RabbitMQ,
credenciais, rede/TLS ou operação destrutiva. Consulte as
[evidências da 2A](foundation-2a.md), incluindo resultados, falhas corrigidas e limites.

## Evidências da fronteira desktop — Etapa 2B

65 testes em oito arquivos cobrem políticas/recursos/sessão, validação e erros IPC,
preload, tema, metadados pelo bridge e feedback de erro. O smoke passou no Electron
real macOS arm64, incluindo ponte mínima, sandbox, CSP, rede/nav/popup, permissão
Notification, recursos privados, janela estrangeira e duas recriações.

A edição passa pelo menu nativo; o teste de seleção por teclado não homologa todas
as escolhas do popup, clipboard ou comportamento nativo de cada SO. Não alterar
o clipboard real do usuário para aprovar uma fixture de teste. O teste de eval
desativa o bypass CSP que o CDP habilita por padrão.

São evidências parciais de T-01/T-10/T-12; continuam pendentes integração RabbitMQ,
SOs/CPUs não executados, acessibilidade completa e gates de release. CI preparada
para smoke macOS após package, ainda sem execução remota. Ver
[comandos, falhas corrigidas e limites](desktop-boundary-2b.md).

## Revisão estática de design — Etapa 3A

Design aprovado em [navegação](../03-architecture/navigation.md) e
[design system](../03-architecture/design-system.md), decisões D3A-01–08 Accepted
por “Aprovado”. A verificação desta etapa é
documental/visual: 48 pares de cor recalculados sem arredondamento na comparação;
SVGs renderizados e inspecionados; rastreabilidade dos 30 FRs do MVP; preservação
dos arquivos de código/config/assets da base 39234fa. Não foram executados testes
funcionais da aplicação, brokers, empacotamento, benchmark ou CI.

Para a implementação futura de D3A-01–08, selecionar os casos pertinentes de T-10:
modo Sistema/Claro/Escuro e migração da preferência; Tab/foco/teclado nativo;
redimensionamento/zoom 200%; contexto de produção além de cor; carregamento/vazio/
erro/indisponível/parcial; dados antigos e resultado incerto. Medir contraste de
todos os estados reais e revisar tecnologias assistivas por SO antes de alegar
conformidade. Testar também que a navegação em memória não altera a URL validada
pela fronteira e que dados sintéticos ficam no harness, não numa sessão real falsa.

Mockups fixos não exercitam fluxo, foco ou reflow. Contraste de tokens não certifica
a aplicação. Confirmação destrutiva continua exigindo T-06/T-10 nas etapas dos
casos de uso, com main/nativo/contexto real; a imagem não substitui esse teste.
Resultados e limitações da 3A constam em [progresso](../05-roadmap/progress.md).

## Verificação executada da interface — Etapa 3B

Contrato autorizado por “Sim”. Check com 82 testes em 11 arquivos, package e smoke
do artefato local passaram no macOS 27.0.1 arm64. Conclusão/commit aprovados por
“Aprovado”, sem homologar as pendências manuais ou outros SOs. T-10 exercitado parcialmente com
temas/preferência, navegação, nomes/foco/teclado, dialog compacto, redimensionamento,
zoom 200%, Sobre e feedback de erro. T-01/T-12 preservam os gates da 2B no smoke,
incluindo janela estrangeira e duas recriações. Não são testes de módulos RabbitMQ.

Contraste de 48 pares de tokens do CSS e 12 estados de botões em fixtures do
harness; não equivale a todos os estados/controles nem a certificação WCAG.
Storage indisponível e listeners são testados em jsdom; sinal de tema do SO é
emulado no runtime. Nenhuma configuração real do usuário é alterada pelo smoke.

Execuções, falhas intermediárias corrigidas, capturas, checksum e pendências por SO:
[interface 3B](interface-3b.md). CI remota, tecnologias assistivas, benchmark,
instaladores e confirmação real de broker continuam pendentes dos contratos próprios.

## Perfis locais — 4A.1

Recorte autorizado por “Autorizo”, após `eb535d7`. T-01/02/09/10 recebem validação
local de DTO/arquivo/segredo/UI, sem broker ou TLS. Unitários/integração usam fakes,
diretórios temporários e senhas sintéticas. Provider seguro no teste não habilita
persistência real. T-12 inclui smoke do executável com reinício completo, descarte
de senha e negativas 2B/3B preservadas com a allowlist específica ampliada.

Executar check, package, smoke:package e `node tools/testing/profiles.cjs` de modo
sequencial. Não usar o userData real nem brokers externos. Revisão visual dos
formulários/resumos nos dois temas e zoom não certifica WCAG. Menu de tema e
confirmação nativa visual requerem revisão manual por alvo. Resultados efetivos,
checksum e pendências: [evidências 4A.1](profiles-4a1.md).

## Histórico/guia/Ajuda — DOC.1

Autorizada pelo pedido direto do proprietário após a aprovação 4A.1. Testes de
componente cobrem campos, disponibilidade real, ciclo de senha, índice/foco/retorno,
URL fixa e destino local sem consulta de metadados. `docs:check` verifica Markdown
contra a fonte JSON; caso negativo executado em cópia temporária, sem modificar o
guia do usuário real.

Smoke base agora também verifica Ajuda com contexto offline após reload: todo o
conteúdo, 11 tópicos, temas, teclado, painel compacto e zoom 200%. O modo offline é
restaurado antes das negativas de segurança para não mascarar bloqueios reais.
Smoke de perfis reexecutado separadamente. Não homologa leitores de tela, controles
nativos/SOs adicionais, brokers ou release. [Resultados](help-doc1.md).
