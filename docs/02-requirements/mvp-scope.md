# Escopo do MVP

Data: 2026-10-28. Status: **Approved como recorte do produto**.
Recorte registrado na Etapa 1A e detalhado/aceito explicitamente na conclusão da 1B,
junto aos sete ADRs e requisitos/limites. Nenhuma funcionalidade RabbitMQ está
implementada no legado. Cada etapa de implementação exige autorização própria.

## Objetivo e limites

Primeira versão utilizável: conectar a um broker, compreender recursos e métricas
disponíveis, administrar topologia básica e publicar mensagens com segurança.
Múltiplos perfis poderão ser cadastrados; o recorte propõe uma sessão ativa por vez.
Cada perfil terá identidade de ambiente e endpoints administrativo/AMQP separados.

O proprietário informou que não há ambientes definidos. A
[matriz de referência](non-functional-requirements.md) propõe Windows 11 x64,
Ubuntu 24.04 LTS x64, macOS 14 arm64/x64 e patches RabbitMQ 4.4.0/4.3.6. O MVP
proposto usa HTTPS/AMQPS e usuário/senha, com CA customizada. Não há suporte
comprovado; consultar a [avaliação](../03-architecture/technology-evaluation.md).

## Classificação funcional

| Módulo | MVP | Pós-MVP | Futuro |
| --- | --- | --- | --- |
| 01 — Connection Manager | Criar/editar/remover perfis; rótulo de ambiente; testar endpoints; usuário/senha; TLS e CA; persistência segura; status, falhas e reconexão; uma sessão ativa | Sessões simultâneas, organização avançada, autenticações adicionais e mTLS | Integrações corporativas específicas conforme necessidade |
| 02 — Dashboard | Resumo do contexto, contagens/métricas disponíveis, atualização periódica e indicação de indisponibilidade | Gráficos detalhados, exploração de conexões, canais e nós | Visões comparativas entre ambientes |
| 03 — Queue Management | Listar/paginar, pesquisar, filtrar, criar classic/quorum conforme capacidades, excluir condicionalmente, propriedades, consumidores, métricas, argumentos básicos e purge confirmado | Argumentos avançados, tipos adicionais e inspeção diagnóstica | Operações em lote |
| 04 — Exchange Management | Listar, criar, excluir; propriedades; tipos básicos suportados; bindings; routing keys; acesso ao publicador | Grafo de relacionamentos e recursos de plugins | Ferramentas avançadas de comparação de topologia |
| 05 — Message Management | Publicar texto/JSON, validar payload, headers e propriedades essenciais; confirmações e retorno de roteamento | Templates, ferramentas para binários, inspeção estruturada com restrições | Fluxos avançados de diagnóstico de mensagens |
| 06 — Administration | Selecionar vhost disponível e respeitar permissões/capacidades | CRUD de vhosts, usuários, permissões e policies; detalhes de nós/cluster | Operator policies e parâmetros, conforme capacidades |
| 07 — Monitoring | Polling limitado das métricas necessárias e diagnóstico básico de conexão | Gráficos de sessão, atividade, indicadores aprofundados e alertas locais | Histórico persistente se fonte/retenção forem aprovadas |
| 08 — Productivity Tools | Atalhos essenciais, busca e filtros locais básicos | Favoritos, pesquisa global, filtros avançados, histórico local, exportação sem segredos e templates | Comparação de ambientes, lote e diagnóstico assistido |

Os tipos básicos de exchange propostos são direct, topic, fanout e headers, conforme
suporte efetivo. A exchange padrão e recursos reservados exigem tratamento próprio.
Uma fila existente não pode ter propriedades incompatíveis alteradas como uma
edição simples. O conjunto de argumentos de criação precisa de catálogo por versão,
validação e aprovação antes da implementação.

O detalhamento da 1B propõe criação de filas duráveis, não exclusivas e sem
auto-delete; argumentos limitados ao catálogo da
[arquitetura](../03-architecture/architecture.md). O recorte de bindings inclui
exchange→queue e exchange→exchange quando suportados. Remoção de binding também
recebe confirmação contextual. Tema inclui preferência de seguir o sistema.

Propriedades de mensagem essenciais candidatas: content type, persistência,
identificadores de mensagem/correlação e headers tipados. O contrato da etapa de
mensagens definirá o conjunto final e limites; não implica suportar todas as
extensões AMQP no MVP.

## Critérios de aceitação

Todos os critérios abaixo são futuros e não executados.

| ID | Critério verificável | Verificação prevista |
| --- | --- | --- |
| MVP-C01 | Cadastrar perfis sem segredo em texto puro e manter ambiente/endpoints identificáveis | Persistência e leitura dos arquivos; teste do mecanismo do SO |
| MVP-C02 | Testes HTTP e AMQP informam resultados separados; falhas de autenticação, TLS e rede são distinguíveis | Broker isolado e cenários de erro |
| MVP-C03 | Trocar sessão cancela trabalho anterior; reconexão não repete escritas automaticamente | Integração com falha de rede e respostas atrasadas |
| MVP-D01 | Resumo apresenta fonte, contexto, instante/atualidade e campos indisponíveis sem convertê-los em zero | Componentes com respostas variadas e integração |
| MVP-Q01 | Listar e filtrar filas com paginação, nomes/vhosts codificados e permissões respeitadas | Contrato HTTP e integração real |
| MVP-Q02 | Criar filas apenas com propriedades/argumentos suportados; explicar conflitos e tipos | Matriz classic/quorum e versões-alvo |
| MVP-Q03 | Excluir e purgar exigem confirmação contextual; condições de exclusão e erros são apresentados | E2E e integração em filas efêmeras |
| MVP-E01 | Administrar exchanges e bindings suportados, incluindo routing keys e restrições de recursos especiais | Integração e componentes |
| MVP-M01 | Validar texto/JSON, headers e propriedades; respeitar limites sem bloquear a UI | Casos de uso e componentes |
| MVP-M02 | Distinguir confirmação do broker, ausência de rota e resultado incerto após desconexão | AMQP com confirms/returns e interrupção de rede |
| MVP-A01 | Vhosts e recursos respeitam permissões; operação negada não aparece como sucesso | Usuários de teste com permissões distintas |
| MVP-O01 | Polling não sobrepõe requisições sem limite, admite cancelamento e indica perda de conexão | Rede lenta, indisponibilidade e troca de sessão |
| MVP-P01 | Fluxos principais operam por teclado, com foco visível e atalhos apropriados ao SO | Testes de componentes e homologação manual |
| MVP-S01 | Bridge valida origem/entradas, TLS é validado e logs não revelam segredos | Testes de fronteira, TLS e inspeção dos logs |
| MVP-R01 | Artefatos aprovados iniciam e executam fluxos essenciais nos SOs/CPUs suportados | Instalação e smoke por plataforma |

Operações destrutivas serão testadas exclusivamente em recursos isolados. Purge
precisa explicar seu efeito; não oferecer rollback ou simulação como garantias.
Cancelamento de uma chamada já enviada não comprova que o broker deixou de executá-la.

## Inspeção e consumo de mensagens

Consumo contínuo, ack manual e inspeção não integram este MVP. Não existe promessa
de leitura passiva: obter mensagens e aplicar requeue altera o estado da fila e
pode afetar redelivery, ordem e políticas. A API HTTP documenta a operação de
obtenção para desenvolvimento/diagnóstico. [HTTP API](https://www.rabbitmq.com/docs/http-api-reference#post-apiqueuesvhostnameget).

Uma futura proposta de inspeção precisa definir contagem/tamanho máximos, modo de
ack, cancelamento, concorrência, tratamento de binários e restrições em produção,
além de explicar efeitos antes da ação. Qualquer modo que remova mensagens depende
de confirmação inequívoca e testes próprios.

## Fonte e retenção das métricas

O MVP consulta dados disponíveis no broker. Polling não cria histórico persistente.
Gráficos futuros de sessão devem informar sua janela e perda de dados ao encerrar.
Métricas indisponíveis por configuração/permissão não serão fabricadas. Armazenamento
de longo prazo exige fonte e retenção explícitas; a documentação do RabbitMQ
recomenda soluções de monitoramento apropriadas para esse fim.
[Management e observabilidade](https://www.rabbitmq.com/docs/management).

## Requisitos transversais

Interface responsiva ao redimensionamento e às operações de rede; temas claro/escuro;
identidade preservada; estados de erro, vazio, carregamento e desconexão. Confirmações
devem identificar conexão, ambiente, vhost, alvo e efeito. Produção será distinguida
com texto/símbolo além de cor. Valores de tokens e telas complexas exigem aprovação.

Sem persistência insegura de segredos, bypass TLS ou payloads em logs por padrão.
Falhas de rede não devem produzir sucesso aparente ou repetição automática de
publicação/remoção. Tamanho de payload, frequência de polling e concorrência terão
limites definidos no planejamento e nos contratos específicos.

## Fora de escopo e decisões pendentes

Aplicação web, SaaS, backend hospedado próprio e abstrações criadas exclusivamente
para uma versão web estão fora de escopo. Não há autorização de updater, assinatura
ou publicação sem requisitos e infraestrutura definidos.

Na implementação, validar a matriz/limites aprovados e investigar ambientes reais
quando definidos: autenticação corporativa/mTLS, proxies, tamanho e volume de
recursos. Se surgirem necessidades essenciais fora do recorte aprovado, apresentar
ajuste ao proprietário; esta lista não autoriza novas funcionalidades.

Responsabilidades e dependências: [índice dos módulos](../04-modules/module-index.md).
Sequência e aprovação: [roadmap](../05-roadmap/roadmap.md).

## Rastreabilidade da Etapa 1B

Os [requisitos funcionais](functional-requirements.md) detalham FR-001–030 para o
MVP e FR-031–038 para etapas posteriores. Os
[requisitos não funcionais](non-functional-requirements.md) definem NFR-001–030,
incluindo limites, qualidade e matriz candidata. Foram aprovados para guiar a
implementação e os testes; não representam funcionalidades ou homologações concluídas.

| Critério | Requisitos funcionais principais | Cenários planejados |
| --- | --- | --- |
| MVP-C01 | FR-001, FR-002 | T-02, T-09 |
| MVP-C02 | FR-003, FR-028 | T-04 |
| MVP-C03 | FR-004, FR-005, FR-027, FR-029 | T-05 |
| MVP-D01 | FR-006, FR-021, FR-026 | T-03, T-08, T-10 |
| MVP-Q01 | FR-007, FR-008 | T-03 |
| MVP-Q02 | FR-009 | T-06 |
| MVP-Q03 | FR-010, FR-011, FR-025 | T-06, T-10 |
| MVP-E01 | FR-012, FR-013, FR-014 | T-06 |
| MVP-M01 | FR-015, FR-016 | T-07 |
| MVP-M02 | FR-017, FR-018 | T-07 |
| MVP-A01 | FR-019, FR-020 | T-03, T-04 |
| MVP-O01 | FR-021, FR-022 | T-08 |
| MVP-P01 | FR-023, FR-024 | T-10 |
| MVP-S01 | FR-002, FR-026, FR-028, FR-030 | T-01, T-04, T-09, T-10 |
| MVP-R01 | NFR-001, NFR-028, NFR-029 | T-12 |

Os cenários estão definidos na [estratégia de testes](../07-testing/test-strategy.md).
Nenhum desses testes foi executado na 1B; os resultados documentais ficam no progresso.

## Estado parcial após implementação 4A.2A

MVP-C01 tem CRUD/segredo transitório e confiança local, com provider persistente
real ainda desabilitado. MVP-C02 tem parte HTTPS implementada/testada em fixture
TLS própria; AMQPS e homologação de broker continuam pendentes. MVP-C03 (sessão/
reconexão) não é cumprido apenas por cancelamento de probe. M01/MVP não completos;
conclusão/commit 4A.2A sujeitos a aceite. [Evidências](../07-testing/https-4a2a.md).

## Incremento 4A.2B aprovado

Autorizado por “Autorizo” em 2026-10-29, adiciona teste explícito AMQPS e vhost ao
MVP-C02, com TLS/CA e fechamento, sem sessão de trabalho MVP-C03. Nenhum canal,
topologia, publicação ou consumo foi habilitado. Resultado de teste não comprova
permissão futura de recurso. Conclusão/commit aprovados em 2026-10-30, incluindo
testes reais do recorte de conexão 4.4.0/4.3.6 de nó único;
[evidências](../07-testing/amqps-4a2b.md). Escopo aprovado do MVP não foi ampliado.

### Resultado vigente — leitura administrativa 4B.1

ADR-0009 A aceita e gate revisado aprovado; consultas manuais de versões/vhosts
visíveis implementadas/verificadas, sem seleção/troca do vhost ou CRUD. Lista
completa limitada 200/256 KiB, metadados descartados e presença do nome atual,
sem inferir permissões AMQP ou capacidades por versão/tag. FR-019/020 e M01/M06
continuam parciais; seleção depende da 4B.2. Check 266 + seis Node, package/seis
smokes e matriz final 60 checks reais aprovados no recorte macOS arm64/nó único.
Conclusão e commit da 4B.1 aprovados por “Autorizado” em 2026-10-31; demais
limitações mantidas. Registro nesta entrega, sem autorizar push ou 4B.2.
