# Requisitos funcionais

Data: 2026-10-28. Status: **Approved para o planejamento do produto**.
Requisitos e recorte de MVP aprovados explicitamente na conclusão da Etapa 1B.
Nenhum requisito está implementado ou homologado por esta entrega. O proprietário
informou que não há ambientes definidos; os alvos de referência foram aceitos para testes.

## Convenções e rastreabilidade

M01–M08 identificam os módulos do [índice](../04-modules/module-index.md).
Os critérios MVP-* estão no [recorte do MVP](mvp-scope.md). Os casos T-* estão na
[estratégia de testes](../07-testing/test-strategy.md). Cada contrato de implementação
deverá selecionar requisitos e testes, sem autorizar o módulo inteiro implicitamente.

As decisões de stack, transporte e segurança estão aceitas nos
[ADRs](../03-architecture/architecture.md). O backend referido é o núcleo local do
aplicativo, sem serviço hospedado próprio.

## Requisitos do MVP

| ID | Módulo | Comportamento e aceitação específica | Critério |
| --- | --- | --- | --- |
| FR-001 | M01 | Criar, editar, listar e remover perfis com nome, ambiente, endpoints separados e referência TLS; remover perfil não remove recursos do broker | MVP-C01 |
| FR-002 | M01 | Oferecer segredo somente em memória ou persistido por proteção verificada do SO; indisponibilidade impede salvar o segredo, sem impedir o modo em memória | MVP-C01, MVP-S01 |
| FR-003 | M01 | Testar HTTP e AMQP separadamente, sem criar topologia ou publicar mensagens; apresentar autenticação, rede e TLS por endpoint | MVP-C02 |
| FR-004 | M01 | Manter no máximo uma sessão ativa, com perfil/vhost/generation; trocar sessão invalida respostas antigas e libera recursos | MVP-C03 |
| FR-005 | M01 | Reconectar transportes apenas conforme política limitada; autenticação negada e certificado inválido exigem intervenção, sem replay de escritas | MVP-C03 |
| FR-006 | M02 | Exibir resumo com escopo declarado: broker ou vhost; incluir origem, instante e indisponibilidade das métricas, sem misturar totais globais e locais | MVP-D01 |
| FR-007 | M03 | Listar filas por vhost com paginação, pesquisa e filtros básicos; codificar nomes como segmentos, inclusive vhost `/` | MVP-Q01 |
| FR-008 | M03 | Consultar propriedades, argumentos, consumidores e métricas de uma fila; apresentar ausência, permissão negada e dados desatualizados | MVP-Q01 |
| FR-009 | M03 | Criar fila classic ou quorum suportada; recorte inicial durável, não exclusiva e sem auto-delete; validar argumentos e explicar declaração incompatível | MVP-Q02 |
| FR-010 | M03 | Excluir fila somente após confirmação contextual pelo núcleo; suportar condições de vazia/sem uso e informar corrida ou rejeição do broker | MVP-Q03 |
| FR-011 | M03 | Purge requer confirmação própria com alvo completo e efeito irreversível; nunca oferecer rollback como garantia | MVP-Q03 |
| FR-012 | M04 | Listar/detalhar exchanges e suas propriedades; distinguir exchange padrão e recursos reservados de itens editáveis | MVP-E01 |
| FR-013 | M04 | Criar/excluir exchanges direct, topic, fanout e headers quando suportadas; durabilidade e auto-delete explícitos; confirmação na exclusão | MVP-E01 |
| FR-014 | M04 | Listar/criar/remover bindings exchange→queue e exchange→exchange suportados, com routing key, argumentos e identidade retornada pela API | MVP-E01 |
| FR-015 | M05 | Compor texto ou JSON, validar JSON antes do envio e exibir tamanho UTF-8; tratar conteúdo como dado sem executar HTML ou código | MVP-M01 |
| FR-016 | M05 | Editar headers tipados e propriedades essenciais: content type, persistência, messageId e correlationId; rejeitar valores fora do contrato/limites | MVP-M01 |
| FR-017 | M05 | Publicar por canal confirm com `mandatory`; distinguir confirmação, rejeição e retorno sem rota, sem confundir com processamento pelo consumidor | MVP-M02 |
| FR-018 | M05 | Timeout/desconexão após possível envio gera resultado incerto e impede reenvio automático; nova tentativa deve ser ação explícita com aviso de duplicação | MVP-M02 |
| FR-019 | M06 | Listar e selecionar vhosts acessíveis; limpar seleção inválida e vincular todas as operações ao contexto ativo | MVP-A01 |
| FR-020 | M06 | Detectar versão/capacidades e apresentar operação não suportada ou negada sem promover privilégio do usuário ou alterar permissões | MVP-A01 |
| FR-021 | M07 | Consultar apenas métricas necessárias e disponíveis; atualizar snapshots em memória com tempo e escopo; não prometer histórico persistente | MVP-O01, MVP-D01 |
| FR-022 | M07 | Polling cancelável, limitado e sem sobreposição da mesma consulta; pausar no background, admitir atualização manual e indicar reconexão/dado antigo | MVP-O01 |
| FR-023 | M08 | Permitir navegação e fluxos principais por teclado, foco visível e atalhos apropriados ao SO, preservando digitação nos formulários | MVP-P01 |
| FR-024 | Transversal | Tema claro, escuro e preferência de seguir o sistema; salvar apenas preferências não sensíveis e preservar identidade original | MVP-P01 |
| FR-025 | Transversal | Manter ambiente, conexão e vhost visíveis; confirmações incluem esses campos, recurso e efeito; produção usa texto/símbolo além de cor | MVP-Q03, MVP-E01 |
| FR-026 | Transversal | Exibir vazio, carregamento, erro, cancelamento e estado parcial com mensagem sanitizada e identificador de diagnóstico | MVP-D01, MVP-S01 |
| FR-027 | Transversal | Cancelar leituras ao navegar/trocar contexto e descartar resposta antiga; explicar que cancelar escrita enviada não desfaz o efeito no broker | MVP-C03 |
| FR-028 | M01 | Configurar CA por seleção local autorizada; validar cadeia e hostname em HTTPS/AMQPS; nunca disponibilizar bypass de certificado | MVP-C02, MVP-S01 |
| FR-029 | Transversal | Iniciar sem conexão automática e sem requisições ao broker antes da ativação explícita de perfil | MVP-C03, MVP-S01 |
| FR-030 | Transversal | Usar apenas comandos privilegiados específicos, com origem/argumentos verificados, resultados tipados e sem retorno de segredos recuperados | MVP-S01 |

O catálogo inicial de argumentos e os contratos de operação constam na
[arquitetura proposta](../03-architecture/architecture.md). Argumentos não catalogados
exigem novo recorte; não haverá editor arbitrário que contorne a validação.

## Requisitos posteriores

| ID | Módulo | Requisito candidato | Classificação |
| --- | --- | --- | --- |
| FR-031 | M01 | Sessões simultâneas, autenticações adicionais, mTLS e proxy corporativo configurável | Pós-MVP |
| FR-032 | M02/M07 | Gráficos de sessão, investigação detalhada de conexões/canais/nós e alertas locais | Pós-MVP |
| FR-033 | M03/M05 | Inspeção diagnóstica com efeitos de consumo/ack/requeue explicitados e restrições de produção | Pós-MVP, mediante ADR-0006 |
| FR-034 | M05/M08 | Templates e ferramentas de visualização/publicação binária | Pós-MVP |
| FR-035 | M06 | CRUD de vhosts, usuários, permissões e policies | Pós-MVP |
| FR-036 | M08 | Favoritos, pesquisa global, filtros avançados, histórico local e exportação sem credenciais | Pós-MVP |
| FR-037 | M06/M08 | Operator policies, parâmetros, comparação de ambientes, lote e diagnóstico assistido | Futuro |
| FR-038 | M07 | Histórico persistente de métricas com fonte, retenção e privacidade definidas | Futuro, sem promessa atual |

Aplicação web, SaaS e backend hospedado próprio estão fora de escopo. Atualização
automática, assinatura e publicação exigem infraestrutura e aprovação específicas.

## Exemplos de fluxos de aceitação

1. Perfil com senha não persistida: ativar sessão, consultar fila, encerrar; nenhum
   segredo aparece no arquivo de configuração ou logs.
2. Broker com HTTP disponível e AMQP negado: consultas autorizadas continuam
   disponíveis, publicador mostra indisponibilidade sem alegar falha global.
3. Exclusão com diálogo aberto seguida de troca de sessão: revalidar contexto e
   rejeitar alvo antigo, sem executar em outro broker.
4. Publicação seguida de corte de rede antes da confirmação: apresentar resultado
   incerto e não reenviar automaticamente.
5. Nome/vhost contendo `/`, espaços ou caracteres Unicode: consultar o recurso
   correto sem concatenar caminhos sem codificação.

Esses fluxos definem verificações futuras; nenhum foi executado na Etapa 1B.

## Incremento implementado — 4A.2A

Autorizado por “Autorizo”: FR-001/002/003/028 recebem CA pública por perfil e teste
HTTPS explícito, com validação/cancelamento/resultado datado. Parte HTTPS de FR-003
é verificada localmente com fixtures, sem afirmar suporte real às versões de broker.
AMQPS, sessão/reconexão e demais operações permanecem futuras. [M01](../04-modules/01-connection-manager.md)
e [evidências](../07-testing/https-4a2a.md). Conclusão/commit aprovados por “Aprovado”.

## Incremento implementado/aprovado — 4A.2B

Execução autorizada por “Autorizo” em 2026-10-29: FR-001/002/003/028 recebem teste
AMQPS separado, CA/credencial no main e abertura do vhost da URL, com cancelamento/
resultado datado e encerramento. Ainda sem sessão/reconexão/permissão de recursos
comprovadas; testes reais verificaram este recorte em 4.4.0/4.3.6 de nó único.
Conclusão/commit aprovados em 2026-10-30; M01 permanece parcial.
[M01](../04-modules/01-connection-manager.md), [evidências](../07-testing/amqps-4a2b.md).

## Cobertura incremental 4A.2C

FR-004 recebe sessão única com contexto derivado do perfil/vhost da URL AMQPS,
generation/sequence e invalidação. FR-022 recebe polling limitado/cancelável de
whoami com data/pausa e recuperação limitada por endpoint; sem métricas/gráficos
ou atualização manual de métricas ainda. FR-019 permanece parcial: não há listagem
ou seleção de vhosts pela sessão. Não declarar requisitos completos a partir deste
incremento; ver M01/evidências e aguardar aprovação da conclusão da etapa.

### Resultado vigente — leitura administrativa 4B.1

ADR-0009 A aceita e gate revisado aprovado; consultas manuais de versões/vhosts
visíveis implementadas/verificadas, sem seleção/troca do vhost ou CRUD. Lista
completa limitada 200/256 KiB, metadados descartados e presença do nome atual,
sem inferir permissões AMQP ou capacidades por versão/tag. FR-019/020 e M01/M06
continuam parciais; seleção depende da 4B.2. Check 266 + seis Node, package/seis
smokes e matriz final 60 checks reais aprovados no recorte macOS arm64/nó único.
Conclusão e commit da 4B.1 aprovados por “Autorizado” em 2026-10-31; demais
limitações mantidas. Registro nesta entrega, sem autorizar push ou 4B.2.
