# Índice dos módulos

Data: 2026-10-28. Status: responsabilidades/recorte aprovados na 1B; CRUD local M01 aprovado na 4A.1. Demais casos de uso dependem de contratos próprios.
Os oito módulos são responsabilidades do produto, não oito serviços ou camadas.
A integração RabbitMQ não existe na base auditada.

## Responsabilidades, dependências e contratos

Os nomes de operações abaixo descrevem interfaces candidatas. As quatro APIs
locais de M01 implementadas na 4A.1 estão em seu documento especializado. A direção de dependência será definida por contratos de sessão,
recurso e capacidades, evitando imports entre componentes de telas.

| ID e módulo | Objetivo / responsabilidades | Dependências conceituais | Interfaces candidatas |
| --- | --- | --- | --- |
| M01 — Connection Manager | Perfis, ambiente, endpoints, autenticação/TLS, status, ciclo da sessão e reconexão | Proteção de segredos pelo SO, configuração local, transportes HTTP/AMQP | Salvar/remover perfil, testar endpoints, ativar/encerrar sessão, consultar estado |
| M02 — Dashboard | Resumir o contexto e explicar métricas/estados disponíveis | Sessão M01, capacidades e snapshots fornecidos por Monitoring | Obter resumo e apresentar atualização/indisponibilidade |
| M03 — Queue Management | Listar, filtrar, criar, excluir, detalhar filas e purgar com segurança | Sessão M01, adapter administrativo e identidade de recursos | Listar/detalhar/criar/excluir fila, consultar consumidores, purgar |
| M04 — Exchange Management | Exchanges, propriedades, bindings e routing keys | Sessão M01, adapter administrativo e contratos de recursos | Listar/criar/excluir exchange; listar/criar/remover binding |
| M05 — Message Management | Validar payload/propriedades e publicar com resultado compreensível | Sessão M01, adapter AMQP e identidades de exchange/vhost; sem depender das telas M03/M04 | Validar mensagem, publicar, observar confirmação/retorno/resultado incerto |
| M06 — Administration | Vhosts, permissões/capacidades e administração avançada futura | Sessão M01 e adapter administrativo | Listar vhosts/capacidades; futuros casos de uso administrativos explícitos |
| M07 — Monitoring | Polling, snapshots, atualidade e diagnóstico de conexão | Sessão M01, adapter administrativo e agendador cancelável | Iniciar/parar atualização, obter snapshot e comunicar falhas |
| M08 — Productivity Tools | Atalhos e ferramentas locais de produtividade | Preferências locais e contratos públicos de navegação/identidade | Registrar atalhos; futuramente favoritos, busca e exportação sem segredos |

M07 fornece dados a M02, sem importar componentes do dashboard. M03/M04/M05 devem
usar identidades compartilhadas de recursos e casos de uso, sem ciclos de telas.
A stack está aprovada; nomenclatura e estrutura física serão detalhadas em contrato
de implementação antes das mudanças.

## Regras, aceitação e testes propostos

Todos os testes abaixo são planejados, não executados. IDs de aceitação referem-se
ao [MVP aprovado](../02-requirements/mvp-scope.md).

| Módulo | Regras de negócio e requisitos | Aceitação | Testes previstos |
| --- | --- | --- | --- |
| M01 | Múltiplos perfis, uma sessão ativa no recorte; resultados HTTP/AMQP separados; persistência segura; nunca ignorar TLS | MVP-C01, C02, C03, S01 | Storage protegido e indisponível; autenticação; CA/certificado inválido; falha/reconexão; cancelamento |
| M02 | Exibir contexto e atualidade; ausente não é zero; sem histórico persistente implícito | MVP-D01 | Estados vazio/carregando/erro/parcial, permissões e troca de vhost |
| M03 | Argumentos por capacidade; propriedades incompatíveis não são editáveis como atualização simples; excluir/purgar exige confirmação contextual | MVP-Q01, Q02, Q03 | Paginação, encoding, classic/quorum, conflito, permissão negada, exclusão condicional e purge em fila efêmera |
| M04 | Respeitar recursos reservados e exchange padrão; bindings têm identidade e argumentos próprios | MVP-E01 | Tipos básicos, restrições, encoding, bindings e erros de permissão |
| M05 | Payload é dado; validar tipos/limites; confirmação e roteamento distintos; não repetir envio ambíguo; sem consumo/inspeção no MVP | MVP-M01, M02 | JSON inválido, texto, headers, limite, confirms, returns, desconexão após envio e UI responsiva |
| M06 | Respeitar vhost/permissões e capacidades detectadas; recorte MVP é seleção, não CRUD administrativo completo | MVP-A01 | Usuários limitados, vhost inacessível e recursos não suportados |
| M07 | Cancelar polling; limitar concorrência; admitir dado desatualizado/indisponível; sem histórico persistente presumido | MVP-O01 | Rede lenta, timeout, falta de métricas, troca de sessão e encerramento |
| M08 | Atalhos respeitam SO, foco e digitação; exportação futura nunca inclui segredos por padrão | MVP-P01 | Teclado, formulários, atalhos por SO; testes próprios das ferramentas futuras |

MVP-R01 é transversal à distribuição, assim como MVP-S01 à segurança. Testes de
operação destrutiva só podem usar brokers/recursos isolados e reproduzíveis.

## Status e pendências por módulo

| Módulo | Status | Documento especializado planejado | Pendências específicas |
| --- | --- | --- | --- |
| M01 | CRUD/HTTPS/AMQPS 4A.2B aprovados; sessão 4A.2C concluída/aprovada | [Connection Manager](01-connection-manager.md) | Próximo contrato e homologações restantes |
| M02 | Planejado; não implementado | `02-dashboard.md` | Conjunto de métricas; fonte, atualização e layout |
| M03 | Planejado; não implementado | `03-queue-management.md` | Catálogo de argumentos/tipos; confirmações e conflitos |
| M04 | Planejado; não implementado | `04-exchange-management.md` | Tipos/plugins; identidade de binding; restrições de recursos |
| M05 | Planejado; não implementado | `05-message-management.md` | Propriedades/headers; limites; confirms e semântica de resultado |
| M06 | Planejado; não implementado | `06-administration.md` | Matriz de permissão/capacidade e recorte pós-MVP |
| M07 | Planejado; não implementado | `07-monitoring.md` | Frequência, backoff, retenção em memória e diagnóstico |
| M08 | Temas/teclado 3B; Ajuda offline DOC.1 aprovada; demais ferramentas planejadas | `08-productivity-tools.md` | Homologação por SO; privacidade e prioridade das ferramentas posteriores |

Os oito documentos especializados não foram criados na 1A ou 1B; o planejamento
atual detalha requisitos e contratos transversais. Serão criados quando necessário e autorizado; cada
um conterá objetivo, responsabilidades, requisitos, dependências, interfaces,
regras, critérios de aceitação, testes, status e pendências.

## Detalhamento rastreável da Etapa 1B

| Módulo | Requisitos funcionais do MVP | Cenários |
| --- | --- | --- |
| M01 | FR-001, FR-002, FR-003, FR-004, FR-005, FR-028 | T-02, T-04, T-05, T-09 |
| M02 | FR-006 | T-03, T-08, T-10 |
| M03 | FR-007, FR-008, FR-009, FR-010, FR-011 | T-03, T-06 |
| M04 | FR-012, FR-013, FR-014 | T-03, T-06 |
| M05 | FR-015, FR-016, FR-017, FR-018 | T-07 |
| M06 | FR-019, FR-020 | T-03, T-04 |
| M07 | FR-021, FR-022 | T-03, T-08 |
| M08 | FR-023 | T-10 |

FR-024–030 e NFR-001–030 incluem responsabilidades transversais. Definições em
[requisitos funcionais](../02-requirements/functional-requirements.md),
[não funcionais](../02-requirements/non-functional-requirements.md),
[arquitetura](../03-architecture/architecture.md) e
[testes](../07-testing/test-strategy.md). Os contratos conceituais foram aprovados;
schemas e APIs concretas continuam sujeitos à implementação e verificação por etapa.

## Aprovação e referências

Stack, responsabilidades, contratos conceituais e MVP foram aprovados na conclusão
da 1B. Não interpretar esse aceite como autorização para implementar funcionalidades;
cada etapa exige seu contrato e autorização próprios.
Consultar [visão](../00-overview/product-vision.md),
[avaliação tecnológica](../03-architecture/technology-evaluation.md),
[roadmap](../05-roadmap/roadmap.md) e [estado atual](../05-roadmap/current-stage.md).

A fundação transversal da 2A recebeu autorização própria e teve sua conclusão aprovada:
[evidências](../07-testing/foundation-2a.md). Não implementa os oito módulos acima.

## Planejamento visual da 3A — Accepted

O proprietário aprovou D3A-01–08 por “Aprovado”. Isso não implementa módulos. A navegação
agrupa responsabilidades sem criar serviços/telas vazias por antecipação:

| Módulo | Destino/padrão visual proposto | Limite |
| --- | --- | --- |
| M01 | Conexões, resumo/edição, estados HTTPS/AMQPS e modo de segredo | Nenhuma conexão automática; testes/ativação explícitos |
| M02 | Visão geral do vhost, contadores e filas prioritárias | Escopo/instante explícitos; sem dado ausente convertido em zero |
| M03 | Filas, detalhe/criar e menu de exclusão/purge | Sem lote ou inspeção de mensagens; confirmação nativa contextual |
| M04 | Exchanges, detalhe e bindings | Padrão/reservados/capacidades respeitados |
| M05 | Publicar, payload/propriedades e resultados | Sem consumo; resultado incerto sem reenvio automático |
| M06 | Seletor de vhost e estados de permissão | CRUD administrativo avançado não ganha tela no MVP |
| M07 | Atualidade/pausa/estado parcial na Visão geral | Sem histórico persistente ou gráficos avançados implícitos |
| M08 | Teclado, foco, busca local/contextual e preferências | Sem favoritos, pesquisa global ou histórico antecipados |

Referências de revisão: [navegação](../03-architecture/navigation.md),
[design system](../03-architecture/design-system.md) e
[mockups](../03-architecture/ui-proposals/README.md). As decisões D3A-01–08
estão Accepted; documentos individuais dos módulos serão criados nos contratos
correspondentes. A implementação da 3B recebeu autorização própria por “Sim” e
entregou shell, temas, Conexões vazia e Sobre, com conclusão/commit aprovados por
“Aprovado”, sem casos de uso de broker. Ver [evidências da interface](../07-testing/interface-3b.md).

M01 ganhou contrato especializado e implementação local na 4A.1, autorizada por
“Autorizo”: CRUD/JSON, credenciais transitórias e proteção condicionada, IPC e UI.
Não declara M01/MVP completos; todos os providers reais continuam sem habilitação.
[Resultados e limitações](../07-testing/profiles-4a1.md). Os outros sete documentos
individuais continuam planejados e não foram criados sem necessidade/autorização.

DOC.1 acrescenta Ajuda local ao M08 e documentação de uso do M01; não acrescenta
operações de broker. [Guia do usuário](../10-user-guide/README.md) e
[evidências](../07-testing/help-doc1.md). Demais documentos especializados permanecem
sujeitos à necessidade/contrato de suas etapas.

Conclusão/commit DOC.1 aprovados por “Aprovado”; nenhuma funcionalidade de broker
ou homologação pendente foi autorizada/resolvida por esse aceite.

4A.2A implementa CA/probe HTTPS de M01 por autorização própria, com guia/Ajuda
atualizados. Sem AMQP, sessão, métricas ou operações de recurso. [Evidências](../07-testing/https-4a2a.md).

## Incremento 4A.2B

M01 adiciona teste AMQPS/vhost explícito, separado do HTTPS, com fechamento e
resultado datado, sem sessão de trabalho. M08/Ajuda acompanha campos/efeitos e
erros reais. Execução autorizada; conclusão/commit em revisão.
[Evidências](../07-testing/amqps-4a2b.md). Nenhum outro módulo de broker habilitado.

## Recorte em validação — 4B.1

[M06 — Administration](06-administration.md) recebe documentação própria para
versões informadas/vhosts visíveis, três métodos administrativos (25 total), lista
completa limitada e presença do vhost atual, conforme ADR-0009 A aceita. M01 fornece
contexto no main; Conexões apresenta o painel sem dependência de telas M02/M03.
M06 continua parcial: sem seleção/troca de vhost ou administração avançada.
Gate real aprovado e implementação em validação, com conclusão/commit pendentes.

### Resultado vigente — leitura administrativa 4B.1

ADR-0009 A aceita e gate revisado aprovado; consultas manuais de versões/vhosts
visíveis implementadas/verificadas, sem seleção/troca do vhost ou CRUD. Lista
completa limitada 200/256 KiB, metadados descartados e presença do nome atual,
sem inferir permissões AMQP ou capacidades por versão/tag. FR-019/020 e M01/M06
continuam parciais; seleção depende da 4B.2. Check 266 + seis Node, package/seis
smokes e matriz final 60 checks reais aprovados no recorte macOS arm64/nó único.
Conclusão e commit da 4B.1 aprovados por “Autorizado” em 2026-10-31; demais
limitações mantidas. Registro nesta entrega, sem autorizar push ou 4B.2.
