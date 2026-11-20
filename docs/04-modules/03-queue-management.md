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

## Declaração de filas — 5B

A tela Filas apresenta **Nova fila**. A declaração usa o vhost exato da
sessão, o endpoint HTTPS Management e flags fixas: durável, não exclusiva
e sem exclusão automática. Os tipos são classic e quorum. O formulário
aceita TTL de mensagens, limite de mensagens, DLX e routing key, conforme
o [catálogo e limites](../05-roadmap/roadmap.md#contrato-proposto--5b-declaração-de-filas-classic-e-quorum).

O main aceita a declaração explícita e monta um PUT de item. O aceite
HTTP é seguido de uma leitura pontual das propriedades. Uma fila
equivalente preexistente pode receber confirmação. O resultado distingue
conflito, divergência após aceite, falta de conferência após aceite e
perda de resposta após possível envio. A pausa local não desfaz a escrita.
O usuário pode conferir o item exato, inclusive no vhost `detailed`.
Nos brokers de referência, um conflito exercitado com nome Unicode
retornou 5xx e manteve o TTL original. A interface indica resultado
incerto e oferece a leitura manual do item.

A declaração compartilha a vaga administrativa das consultas. Resultados
ficam em memória no contexto autorizado. O [guia](../10-user-guide/README.md#declarar-fila)
explica permissões, cancelamento e próximos passos. Ver
[evidências](../07-testing/queues-5b.md) para o recorte verificado.
## Limpeza de mensagens

O detalhe de uma fila classic ou quorum oferece **Limpar mensagens**.
Em `detailed`, a consulta de item pelo nome exato permite abrir o
detalhe mesmo com a listagem indisponível. O main faz outra consulta
pontual, verifica tipo e identidade e apresenta a confirmação nativa
com destino, ambiente e efeito. Após aceite explícito, revalida a
janela, a sessão e a revisão e envia um único DELETE de `/contents`.

O purge mantém a fila e os vínculos. Remove Ready e preserva entregas
sem ack. Em quorum também pode limpar mensagens em retry adiado e
dead-lettering pendente. Uma possível escrita torna lista e detalhe
desatualizados. **Verificar fila** faz uma leitura pontual atual,
sem atribuir ao purge os contadores observados. FR-010 (exclusão
condicional de fila) permanece pendente.

[Contrato 5C.1](../05-roadmap/roadmap.md#contrato-proposto--5c1-purge-com-confirmação-nativa)
· [Evidências](../07-testing/queues-5c1.md)
