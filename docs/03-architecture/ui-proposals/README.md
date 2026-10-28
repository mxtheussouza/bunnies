# Propostas visuais — Etapa 3A

Status do design: **Accepted** por “Aprovado”, após a revisão da 3A e D3A-01–08.
Mockups desktop estáticos com dados fictícios. Não são telas implementadas,
protótipo navegável, conexão real ou homologação de acessibilidade.
Usam a marca já versionada em `39234fa`, sem modificar os arquivos de assets.

| Proposta | Fonte SVG | Preview PNG | O que revisar |
| --- | --- | --- | --- |
| Conexões | [01-connections.svg](01-connections.svg) | [PNG](previews/01-connections.png) | Seleção sem ativação automática; resumo de perfil; segredo não guardado; teste e ativação explícitos |
| Visão geral | [02-overview.svg](02-overview.svg) | [PNG](previews/02-overview.png) | HTTPS disponível/AMQPS indisponível; escopo de vhost; valores sem histórico persistente |
| Filas | [03-queues.svg](03-queues.svg) | [PNG](previews/03-queues.png) | Densidade, busca/filtros/paginação, identificação de produção e ações secundárias |
| Confirmação | [04-confirmation.svg](04-confirmation.svg) | [PNG](previews/04-confirmation.png) | Conteúdo do diálogo nativo; Cancelar padrão; alvo/efeito; janela 1024 × 700 |
| Design system | [05-design-system.svg](05-design-system.svg) | [PNG](previews/05-design-system.png) | Marca nos dois fundos, componentes, cores e contraste |

Os SVGs incorporam cópia byte a byte dos PNGs usados como marca, sem edição ou
recoloração. São autocontidos para abrir/exportar. Os PNGs são renderizações desses
SVGs, não novos logos nem assets da aplicação. A tipografia é do sistema local;
aparência final de fontes/controles dependerá do SO. A barra da janela é esquemática.

Os três mockups principais mostram uma área de janela de 1440 × 900, mais uma
legenda documental de 40 px. A confirmação usa 1024 × 700 mais a legenda; sua
aparência é ilustrativa e não substitui o diálogo nativo do SO. A folha do design
system tem 1440 × 1100 mais legenda. SVGs fixos não comprovam reflow ou zoom real.

Na tabela de filas há nove linhas visíveis e barra de rolagem da página de 100 itens;
248 é total fictício do vhost. Nos exemplos sem sessão, nenhum endpoint está marcado
como conectado. As sequências não constituem uma operação real sobre o mesmo broker;
cada tela é uma fixture ilustrativa independente.

## Dados e validação

- [design-tokens.json](design-tokens.json): valores propostos usados para gerar os SVGs.
- [contrast-report.json](contrast-report.json): 48 pares de cor, limiares e exemplo rejeitado.
- [visual-checks.json](visual-checks.json): dimensões, títulos e limites geométricos dos renders.

Renderização local com Electron 45.1.0/Playwright já instalados, perfil temporário e
acesso externo bloqueado; sem instalar ferramentas, servidor próprio ou executar
a aplicação Bunnies. Os auxiliares de render ficam em out e não integram código de
produto. Inspeção geométrica não detecta toda colisão ou problema de usabilidade;
os previews também precisam de revisão visual. Resultados finais no
[registro de progresso](../../05-roadmap/progress.md).

## Limites e próxima etapa

Dados sintéticos, usuários fictícios e hosts example.invalid; nenhuma senha real.
Não há consumo/ack/requeue, API de publicação, histórico ou gráficos persistentes
implementados. Nenhum controle dos SVGs executa ação. As confirmações destrutivas
deverão permanecer no main quando os casos de uso reais forem implementados.

[Navegação](../navigation.md), [design system](../design-system.md) e decisões
D3A-01–08 foram aprovados. Os arquivos visuais preservam a apresentação original,
inclusive o rótulo “proposta”, como evidência do que foi revisado. A implementação
da 3B exige o contrato do [roadmap](../../05-roadmap/roadmap.md) e autorização
própria; publicar, instalar dependências ou editar assets não fazem parte desta entrega.
