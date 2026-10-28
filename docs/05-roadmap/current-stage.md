# Estado atual do projeto

Atualizado em: 2026-10-28.

| Campo | Estado |
| --- | --- |
| Etapa atual | Transição da 3B concluída para a proposta da 4A.1 — Perfis locais e proteção de credenciais |
| Status | 3B concluída e aprovada por “Aprovado”; contrato da 4A.1 em apresentação, execução não autorizada |
| Última etapa concluída | 3B — Interface base desktop; conclusão e commit aprovados |
| Último commit | Entrega 3B que contém este estado: feat(desktop): implement application shell and themes; hash em git log -1; pai c215004 |
| Decisões aprovadas | Diretrizes, auditoria, sete ADRs, requisitos/MVP/limites, entregas 1A/1B/2A/2B/3A/3B e D3A-01–08 |
| Decisões pendentes | Subdivisão da 4A, autorização de execução do contrato da 4A.1 e gates futuros |
| Tarefas concluídas | Shell/contexto sem sessão, Conexões vazia, Sobre, temas/migração, primitivas, menus/controles PT-BR, testes e documentação da 3B |
| Tarefas pendentes | Apresentar o contrato da 4A.1 e aguardar autorização própria; não repetir o aceite da conclusão da 3B |
| Problemas conhecidos | Menu nativo de tema por teclado requer revisão manual; demais SOs/CPUs e tecnologias assistivas não homologados; sem integração RabbitMQ/cofre/perfis; avisos de dependências e gates de release da 2B mantidos |
| Próxima ação autorizada | Conferir o registro do commit aprovado da 3B e apresentar o contrato da 4A.1; não implementar antes de autorização própria |

## Autorizações e base

A resposta **“Aprovado”** aceitou D3A-01–08, conclusão e commit da 3A, registrados
em `c215004`. A resposta seguinte **“Sim”** autorizou o contrato próprio da 3B
apresentado no [roadmap](roadmap.md). Não autoriza commit da 3B ou execução da 4A.
A resposta posterior **“Aprovado”**, após apresentação das evidências e limitações,
aceitou a conclusão da 3B e autorizou
`feat(desktop): implement application shell and themes`. O commit de entrega inclui
este registro e o contrato seguinte; seu hash é consultável no Git, evitando
autorreferência de hash no arquivo. Não autoriza executar a 4A.1 ou acessar o cofre.

Git inicialmente limpo, branch `chore/modernization-app`, HEAD `c215004` preservado.
Nenhuma instalação, nova dependência ou edição de manifesto/lock/assets. Os logos
de `39234fa` foram usados como estão no pacote local, sem alteração da marca.
Main mudou somente a janela inicial de 800 × 600 para 1200 × 800; preload/shared,
IPC/protocolo/CSP e configuração de segurança preservados. O aceite autoriza o
commit da entrega apresentada, sem implementação adicional. Nenhum push realizado.

## Entrega aprovada

- [Interface 3B](../07-testing/interface-3b.md): critérios, comandos/resultados, capturas locais, checksum e limitações.
- [Arquitetura física](../03-architecture/architecture.md): shell/pages/primitivas e limites.
- [Design aprovado](../03-architecture/design-system.md) e [navegação](../03-architecture/navigation.md): implementação parcial sem antecipar broker.
- [Progresso](progress.md): histórico da execução e próxima aprovação necessária.

Check passou com **82 testes em 11 arquivos**; package e smoke locais aprovados em
macOS 27.0.1 arm64. Sessão vazia, temas/persistência/migração, foco/painel/atalho,
1024 × 700, 800 × 600 e zoom 200% verificados. 60 pares de contraste passaram.
Asserções de segurança 2B mantidas, incluindo janela estrangeira e duas recriações.

Menu nativo de tema: foco, rolagem e seleção do valor testados; tentativas por
setas/Enter no runner não confirmaram a mudança. Revisão manual por SO pendente.
Isso e a ausência de tecnologias assistivas impedem alegar homologação integral
WCAG/teclado. Os resultados não incluem brokers, cofre, benchmark, instalador ou CI remota.

## Retomada

1. Ler AGENTS, este estado, arquitetura, roadmap e progresso; conferir Git.
2. Preservar a implementação e alterações existentes; não reiniciar o design aprovado.
3. Conferir no Git o registro da entrega 3B e identificar alterações posteriores sem sobrescrevê-las.
4. Conclusão e commit da 3B já foram aprovados por “Aprovado”; não pedir o mesmo aceite novamente.
5. Ler a proposta 4A.1 no roadmap e conferir se recebeu autorização própria; sem
   ela, não criar código, instalar dependências ou acessar cofre/brokers.
