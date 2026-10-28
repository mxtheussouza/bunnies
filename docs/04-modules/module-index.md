# Índice dos módulos propostos

Data: 2026-10-28. Status: desenho inicial para revisão, sem implementação autorizada.
Os oito módulos são responsabilidades do produto, não oito serviços ou camadas.
A integração RabbitMQ não existe na base auditada.

## Responsabilidades, dependências e contratos

Os nomes de operações abaixo descrevem interfaces candidatas; não são APIs
implementadas. A direção de dependência será definida por contratos de sessão,
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
A nomenclatura e a estrutura definitiva dependem da stack aprovada.

## Regras, aceitação e testes propostos

Todos os testes abaixo são planejados, não executados. IDs de aceitação referem-se
ao [MVP proposto](../02-requirements/mvp-scope.md).

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
| M01 | Proposto; não implementado | `01-connection-manager.md` | Schema de perfil; proteção por SO; autenticações; timeout/reconexão |
| M02 | Proposto; não implementado | `02-dashboard.md` | Conjunto de métricas; fonte, atualização e layout |
| M03 | Proposto; não implementado | `03-queue-management.md` | Catálogo de argumentos/tipos; confirmações e conflitos |
| M04 | Proposto; não implementado | `04-exchange-management.md` | Tipos/plugins; identidade de binding; restrições de recursos |
| M05 | Proposto; não implementado | `05-message-management.md` | Propriedades/headers; limites; confirms e semântica de resultado |
| M06 | Proposto; não implementado | `06-administration.md` | Matriz de permissão/capacidade e recorte pós-MVP |
| M07 | Proposto; não implementado | `07-monitoring.md` | Frequência, backoff, retenção em memória e diagnóstico |
| M08 | Proposto; não implementado | `08-productivity-tools.md` | Atalhos mínimos; privacidade e prioridade das ferramentas posteriores |

Os oito documentos especializados não foram criados nesta etapa, cujo contrato
inclui somente este índice. Serão detalhados quando necessário e autorizado; cada
um conterá objetivo, responsabilidades, requisitos, dependências, interfaces,
regras, critérios de aceitação, testes, status e pendências.

## Aprovação e referências

Stack, interfaces, módulos de implementação e MVP definitivo permanecem pendentes.
Não interpretar uma responsabilidade listada como funcionalidade autorizada.
Consultar [visão](../00-overview/product-vision.md),
[avaliação tecnológica](../03-architecture/technology-evaluation.md),
[roadmap](../05-roadmap/roadmap.md) e [estado atual](../05-roadmap/current-stage.md).
