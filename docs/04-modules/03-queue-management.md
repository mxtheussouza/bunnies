# M03 — Gerenciamento de filas

A 5A disponibiliza leituras manuais de filas no vhost exato da sessão, inclusive
quando a seleção é temporária. O destino Filas apresenta a origem HTTPS Management,
o perfil, o ambiente, o vhost e o horário de cada consulta.

## Contrato de leitura

| Operação | Comportamento |
| --- | --- |
| Listar | Uma página de até 100 filas do vhost, ordenada por nome no broker. Busca opcional por trecho literal de até 255 bytes UTF-8 |
| Filtrar | Tipo classic, quorum, stream ou outros/indisponíveis. Atua somente na página carregada |
| Detalhar | Identidade exata da linha, metadados, argumentos básicos do catálogo e até 100 consumidores, com indicação de resultado parcial |
| Cancelar | Navegação, fechamento do detalhe, perda de elegibilidade e mudança de contexto invalidam a operação aplicável |

A listagem do vhost de nome exato `detailed` é recusada antes de qualquer
requisição porque o RabbitMQ usa esse caminho para uma rota global. Os
segmentos exatos `.` e `..` ficam fora das rotas. Uma fila com um desses
nomes pode aparecer na listagem de um vhost admitido, e a linha informa que
o detalhe está indisponível.

## Implementação

- `src/main/sessions/sessionService.ts` autoriza owner, sessão, geração, perfil
  e vhost. Filas exige janela em foreground, HTTPS disponível e AMQPS estabelecido,
  inclusive se o broker bloqueou apenas o fluxo.
- `src/main/management/service.ts` compartilha a vaga das leituras administrativas.
  O adapter monta dois GETs fixos e usa os limites de 10 s totais, 16 KiB de
  cabeçalhos, 256 KiB de corpo e 16 níveis de profundidade JSON. Confirma identidade
  do recurso e descarta campos fora da projeção.
- `bunnies:management` oferece `listSessionQueues` e `getSessionQueue` e
  reutiliza `cancelManagementRead`. O renderer fornece referência de sessão,
  operação, página e busca ou nome exato da fila. O main resolve vhost, rota,
  endpoint, TLS e credenciais. IPC e preload validam o retorno.
- `src/renderer/pages/Queues.tsx` mantém a página em memória, indica dados
  desatualizados no mesmo contexto e descarta os dados quando muda a geração.
  A Ajuda offline e o Markdown usam o mesmo guia canônico.

O acesso e o recorte de métricas dependem da resposta HTTPS. Campos ausentes
aparecem como indisponíveis, e zero e lista vazia têm representações próprias.
Ver [guia](../10-user-guide/README.md), [contrato](../05-roadmap/roadmap.md#contrato-proposto--5a-listagem-e-detalhe-de-filas)
e [evidências da 5A](../07-testing/queues-5a.md).

Criação de filas pertence à 5B. Exclusão e limpeza de mensagens prontas
pertencem à 5C. Esses incrementos aguardam contratos próprios.
