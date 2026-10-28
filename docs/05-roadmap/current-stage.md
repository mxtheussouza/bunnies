# Estado atual do projeto

Atualizado em: 2026-10-28.

| Campo | Estado |
| --- | --- |
| Etapa atual | 4A.1 — Perfis locais e proteção de credenciais |
| Status | Concluída e aprovada por “Aprovado!”; commit autorizado |
| Última etapa concluída | 4A.1 — Perfis locais, aprovada |
| Último commit | eb535d7 feat(desktop): implement application shell and themes |
| Decisões aprovadas | ADRs 0001–0007, requisitos/MVP/limites, D3A-01–08 e contrato 4A.1 |
| Decisões pendentes | Conclusão da Task adicional histórico/guia/Ajuda; contrato/autorização da 4A.2 |
| Tarefas concluídas | CRUD local/JSON/segredo em memória, proteção condicionada, IPC/UI, testes e documentação |
| Tarefas pendentes | Registrar commit aprovado; executar Task adicional em entrega própria |
| Problemas conhecidos | Seletor nativo de tema exige revisão manual; demais SOs/CPUs, tecnologias assistivas e gates de release não homologados; avisos de dependências anteriores mantidos |
| Próxima ação autorizada | Registrar commit da 4A.1 e executar a Task adicional solicitada; não iniciar 4A.2 |

## Autorização e limites

“Autorizo”, após a apresentação do contrato em `eb535d7`, autoriza a 4A.1,
sem rede/brokers, dependências novas, push ou commit antecipado.
A proteção persistente permanece desligada quando provider e gates não forem
comprovados. Testes usam diretórios temporários e segredos sintéticos.
Não confundir perfil salvo/selecionado com sessão ativa. A 4A.2 não está autorizada.

Retomar por AGENTS, arquitetura, roadmap, progresso e Git. Preservar os logos e
controles desktop aprovados; a pendência do teclado do seletor nativo herdada da
3B continua aberta. Evidências anteriores: [interface 3B](../07-testing/interface-3b.md).

## Entrega aprovada

[M01 implementado parcialmente](../04-modules/01-connection-manager.md) e
[evidências 4A.1](../07-testing/profiles-4a1.md): perfis persistidos sem rede,
senhas em memória, ações keep/replace/remove, conflitos/corrupção preservados,
confirmação local no main, ponte com 12 métodos específicos e UI/temas/zoom.

Check com 130 testes em 17 arquivos; package e smokes locais verificados em macOS
27.0.1 arm64. A conferência final de artefato fica nas evidências. Senha persistente
segue desligada em todos os alvos; nenhuma prova de provider real foi produzida.
Diálogo nativo de remoção tem conteúdo/defaults/respostas verificados com simulação
exclusiva no main; revisão visual/manual do SO permanece pendente, assim como o
seletor nativo de tema herdado da 3B e demais SOs/CPUs/tecnologias assistivas.

O proprietário respondeu **“Aprovado!”**, aprovando conclusão e commit da 4A.1.
O commit conterá este aceite; consultar seu hash no Git. A mesma mensagem autoriza
Task própria de histórico vivo e documentação/Ajuda, sem autorizar a 4A.2.
Nenhum push solicitado ou executado.
