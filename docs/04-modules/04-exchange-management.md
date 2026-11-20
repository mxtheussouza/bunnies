# M04 — Gerenciamento de exchanges e bindings

A 6A entrega a leitura de exchanges e bindings na sessão ativa. A tela usa o
vhost do AMQPS, incluindo uma seleção temporária, e consulta o endpoint HTTPS
Management salvo no perfil. O endpoint decide a permissão e a visibilidade de
cada consulta. Os horários indicam quando cada resposta foi recebida.

## Operações

| Operação | Comportamento |
| --- | --- |
| Listar e pesquisar | Página de até 100 exchanges. Busca literal de até 255 bytes UTF-8 enviada por ação explícita |
| Abrir detalhe | Nome exato, tipo, durabilidade, auto-delete, flag interna e argumentos informados |
| Consultar saída | O broker retorna os vínculos cuja origem é a exchange aberta. O destino pode ser fila ou exchange |
| Consultar entrada | O broker retorna os vínculos cuja exchange de destino está aberta |
| Cancelar | A leitura pendente é abortada. Navegação ou perda de contexto também descarta o resultado |

A exchange padrão tem nome AMQP vazio e alias HTTP `amq.default` na rota de
detalhe. O detalhe explica os vínculos implícitos de cada fila. Recursos
`amq.*` são identificados como reservados. Recursos internos têm um indicador
separado. Tipos são exibidos conforme informados pelo broker. Nomes exatos
`.`, `..` e o literal `amq.default` têm detalhe indisponível.

Na leitura de bindings, validar o vhost, direção e identidade composta por
origem, tipo de destino, destino e `properties_key` opaco. Uma resposta vazia
descreve apenas os vínculos que o endpoint retornou naquela consulta. O teto
da lista é de 200 por direção. Exceder o teto recusa a resposta inteira.
Os argumentos são exibidos como JSON de leitura e valores numéricos fora da
precisão segura tornam os argumentos do item indisponíveis.

## Contratos internos

`src/main/management/exchangeRead.ts` define as quatro rotas GET e a projeção.
O serviço administrativo resolve o vhost no main, com a mesma vaga de leitura
e operações de filas e vhosts e o mesmo controle por janela, geração, revisão
e ciclo de vida. O prazo é de 10 s e a resposta é limitada a 256 KiB de corpo
e 16 KiB de cabeçalhos. `whoami` segue independente.

A ponte expõe `listSessionExchanges`, `getSessionExchange` e
`listSessionExchangeBindings`. O cancelamento reutiliza
`cancelManagementRead`. Os DTOs passam por validação na origem e no preload.
O renderer usa o mesmo componente e transporte lógico nos três sistemas.

FR-012 e a leitura de FR-014 compõem a 6A. Escritas de exchanges e bindings e
o restante de MVP-E01 dependem de contratos próprios. As evidências registram
as plataformas executadas e as limitações de validação.

[Guia do usuário](../10-user-guide/README.md#consultar-exchanges) ·
[Contrato 6A](../05-roadmap/roadmap.md#contrato-proposto--6a-leitura-de-exchanges-e-bindings) ·
[Evidências](../07-testing/exchanges-6a.md).
