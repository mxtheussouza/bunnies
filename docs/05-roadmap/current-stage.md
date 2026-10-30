# Estado atual do projeto

Atualizado em: 2026-10-30. Ler [PROJECTS_STATUS.md](../../PROJECTS_STATUS.md) antes
de toda Task e atualizá-lo a cada bloco/fase/alteração.

| Campo | Estado |
| --- | --- |
| Etapa atual | 4A.2B — teste AMQPS/autenticação/vhost |
| Status | Concluída/aprovada em 2026-10-30; commit autorizado |
| Última etapa concluída | 4A.2B — teste AMQPS/vhost, incluindo verificação real 4.4.0/4.3.6 |
| Último commit | Entrega feat(connections): add cancellable AMQPS connection tests; pai 9401448; consultar Git |
| Decisões aprovadas | ADRs/requisitos/MVP/D3A e entregas anteriores; execução/limites/cliente e conclusão 4A.2B |
| Decisões pendentes | Contrato detalhado e autorização de implementação 4A.2C |
| Tarefas concluídas | Instalação exata/audit, parser/vhost, probe/coordenação/IPC, UI/guia, check de 216 testes, package/quatro smokes, 40 checks em RabbitMQ real e revisão |
| Tarefas pendentes | Conferência do commit aprovado; contrato 4A.2C e homologações restantes |
| Problemas conhecidos | Testes reais HTTPS/AMQPS passaram em RabbitMQ 4.4.0/4.3.6; cluster/HA, nativos manuais/assistivas/outros alvos/providers/releases sem homologação |
| Próxima ação autorizada | Registrar/conferir commit aprovado e preparar contrato 4A.2C; sem push ou sessão antecipada |

## Autorização e escopo

Após o contrato detalhado, **“Autorizo”**, em 2026-10-29, aprovou instalar amqplib
2.2.0 e executar o recorte de testes AMQPS. Cinco documentos da proposta estavam
modificados em 9401448 e foram preservados. Sem outra dependência nova/transitiva.
Audit mantém seis avisos conhecidos de tooling (2 baixos/4 moderados), sem auto-fix.

A mudança macOS em 9401448 permanece preservada. Os smokes do pacote precisam usar
expectativas atuais por plataforma; resultados anteriores não homologam essa mudança.

## Implementação verificada para revisão

[M01](../04-modules/01-connection-manager.md): parser puro do vhost na URL salva,
TLS/SASL/abertura/close sem canais, socket próprio com TCP antes de TLS e API callback
pública para evitar sucesso no atalho blocked sem confirmação. Coordenação única
por janela entre HTTPS/AMQPS; ponte finita com 18 métodos e políticas preservadas.

UI apresenta vhost, dois testes explícitos/cancelamento/resultados datados; guia e
Ajuda atualizados com efeitos, exemplos/erros e menus por plataforma. Continua
Sem sessão ativa. Persistência de senha, AMQP de trabalho e broker pages indisponíveis.

[Evidências 4A.2B](../07-testing/amqps-4a2b.md): check aprovado com **216 testes/27
arquivos**, typecheck/lint/format/docs:check, package e quatro smokes sequenciais
(base/Ajuda/segurança, perfis, HTTPS, AMQPS). Runtime Electron 45.1.0/Node 24.22.1
com DNS/IP, quit/reabertura/credenciais e cleanup exercitados. Artefato/capturas
revisados; guia/Ajuda de 13 tópicos. Complemento posterior passou em RabbitMQ real
4.4.0/4.3.6: 20 verificações por versão no mesmo executável, sem alterar o produto.
Não homologa funcionalidades futuras, cluster/HA ou outro SO/CPU.

## Limites e retomada

Na apresentação inicial, Docker estava indisponível. Após o pedido explícito de
testes reais e Docker ativo, o harness provisionou instâncias próprias das duas
versões; TLS/HTTPS/AMQPS/vhosts/recusas/cancelamento/prazo/cleanup passaram.
Docker Engine 29.8.0/linux arm64; portas host só loopback. Containers/redes/dados
próprios removidos; recursos de outros projetos preservados. Imagens em cache.
Menu nativo manual, assistivas, outros SOs/CPUs e gates de provider/release pendentes.

Ler AGENTS/PROJECTS/arquitetura/roadmap/estado e conferir Git. Continuar somente
4A.2B aprovada ou seu aceite posterior. Conclusão/commit foram aprovados em 2026-10-30. Registrar a entrega e preparar
contrato detalhado da 4A.2C; aguardar seu aceite antes da implementação. Sem push.
