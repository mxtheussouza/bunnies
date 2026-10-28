# Estado atual do projeto

Atualizado em: 2026-10-28.

| Campo | Estado |
| --- | --- |
| Etapa atual | Transição da 3A concluída para a proposta da 3B — Interface base desktop |
| Status | 3A concluída e aprovada por “Aprovado”; contrato da 3B apresentado para autorização, execução não iniciada |
| Última etapa concluída | 3A — Navegação e design system; D3A-01–08 Accepted, conclusão e commit autorizados |
| Último commit | Commit de entrega da 3A que contém este estado: docs(design): define desktop navigation and design system; hash em git log -1; pai 39234fa |
| Decisões aprovadas | Diretrizes, auditoria, governança, sete ADRs, requisitos/MVP/limites, entregas 1A/1B/2A/2B/3A e D3A-01–08 |
| Decisões pendentes | Autorização de execução do contrato físico/testes da 3B; módulos RabbitMQ e gates futuros |
| Tarefas concluídas | Inventário visual dos cinco assets; alternativas; navegação rastreada aos 30 FRs do MVP; tokens e componentes; cinco SVGs e previews PNG; 48 pares de contraste; inspeção geométrica/visual e documentação |
| Tarefas pendentes | Obter autorização própria do contrato da 3B antes de implementar; não repetir a aprovação de design/conclusão da 3A |
| Problemas conhecidos | Produto sem integração RabbitMQ; fonte vetorial não identificada; contraste/layout estáticos não homologam a interface; reflow/zoom/teclado e SOs precisam de testes futuros; avisos de dependências/gates de release da 2B continuam registrados |
| Próxima ação autorizada | Conferir o registro do commit aprovado da 3A e apresentar o contrato da 3B; aguardar autorização antes de executar |

## Autorizações e base de retomada

A conclusão da 2B e o commit `fix(desktop): secure Electron process boundaries`
foram aprovados por **“Aprovado”**, registrados em `a550731`. Na retomada seguinte,
Git limpo em `39234fa`: os três assets modificados e os dois logos novos estavam
versionados pelo commit posterior. Não reverter esses recursos nem o histórico.

A resposta **“Autorizo”** aprovou executar o contrato documental/visual da 3A.
Após apresentação dos resultados, a resposta **“Aprovado”** aceitou explicitamente
D3A-01–08, a conclusão da 3A e o commit
`docs(design): define desktop navigation and design system`. Esse aceite não
autoriza implementar a 3B, instalar dependências ou alterar fontes/assets.
O commit de entrega inclui esta sincronização do aceite e o contrato seguinte;
seu hash é obtido do próprio Git, evitando autorreferência de hash no arquivo.
Nenhum push autorizado ou realizado pelo agente.

Branch mantida: `chore/modernization-app`. O agente não realizou o commit/push dos
logos, não fez pull/rebase, não criou branch ou modificou os assets. A base
`39234fa` foi registrada antes das edições. O pacote testado da 2B antecede o commit
dos logos; a 3A não compilou ou homologou a aplicação com os novos recursos.

## Entrega aprovada

- [Navegação](../03-architecture/navigation.md): cinco destinos, contexto, fluxos e rastreabilidade.
- [Design system](../03-architecture/design-system.md): inventário, alternativas, tokens, componentes e decisões D3A-01–08.
- [Mockups e dados de verificação](../03-architecture/ui-proposals/README.md): cinco propostas, SVGs autocontidos, PNGs e relatórios.
- [Progresso](progress.md): comandos/resultados, limites e preservação do código.

Decisões Accepted: neutros com acento laranja, cinco destinos e contexto
fixo, temas Sistema/Claro/Escuro e rótulos PT-BR com termos RabbitMQ preservados.
Nenhum mockup representa broker real ou funcionalidade implementada.

## Retomada

1. Ler [AGENTS.md](../../AGENTS.md), este estado, arquitetura e [roadmap](roadmap.md).
2. Verificar branch/HEAD/working tree e identificar modificações posteriores sem sobrescrevê-las.
3. D3A-01–08 e conclusão/commit da 3A já foram aprovados; não pedir o mesmo aceite novamente.
4. Ler o contrato da 3B no roadmap e conferir se recebeu autorização própria.
5. Sem essa autorização, não alterar código. Após recebê-la, executar apenas o
   escopo da 3B e submeter resultados/conclusão/commit a novo aceite.
