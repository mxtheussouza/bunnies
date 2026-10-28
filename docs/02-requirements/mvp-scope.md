# Escopo do MVP proposto

Data: 2026-10-28. Status: **proposta, não aprovada como escopo de implementação**.
A Etapa 1A autoriza registrar este recorte. Nenhuma funcionalidade RabbitMQ está
implementada no legado. A aprovação definitiva cabe à Etapa 1B.

## Objetivo e limites

Primeira versão utilizável: conectar a um broker, compreender recursos e métricas
disponíveis, administrar topologia básica e publicar mensagens com segurança.
Múltiplos perfis poderão ser cadastrados; o recorte propõe uma sessão ativa por vez.
Cada perfil terá identidade de ambiente e endpoints administrativo/AMQP separados.

Plataformas: Windows, Linux e macOS, com versões mínimas e CPUs ainda a definir.
RabbitMQ 4.4.x e 4.3.x são alvos de homologação propostos, não suporte comprovado.
Consultar [avaliação tecnológica](../03-architecture/technology-evaluation.md).

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

Propriedades de mensagem essenciais candidatas: content type, persistência,
identificadores de mensagem/correlação e headers tipados. O contrato da etapa de
mensagens definirá o conjunto final e limites; não implica suportar todas as
extensões AMQP no MVP.

## Critérios de aceitação propostos

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

Validar antes da aprovação do MVP: versões/CPUs dos sistemas, brokers reais,
autenticação corporativa/mTLS, proxies, tamanho e volume de recursos, limites de
payload e metas de desempenho. Caso sejam essenciais, ajustar o recorte com o
proprietário; esta lista de pendências não autoriza novas funcionalidades.

Responsabilidades e dependências: [índice dos módulos](../04-modules/module-index.md).
Sequência e aprovação: [roadmap](../05-roadmap/roadmap.md).
