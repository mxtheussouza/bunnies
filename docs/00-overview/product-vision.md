# Visão do produto

Data: 2026-10-28. Status: visão alinhada às diretrizes do proprietário; MVP, requisitos
e decisões arquiteturais aprovados explicitamente na conclusão da Etapa 1B.
O aceite não representa funcionalidades implementadas ou compatibilidade homologada.

## Identidade e objetivo

O Bunnies pretende oferecer uma experiência desktop clara, segura e produtiva para
administrar e observar RabbitMQ. O objetivo é simplificar fluxos frequentes e
reduzir erros operacionais, preservando o nome e a identidade original.

O produto será exclusivamente desktop para Windows, Linux e macOS, executado
localmente e conectado aos brokers configurados pelo usuário. Rede, autenticação,
permissões e plugins do broker condicionam as operações disponíveis.

O [inventário](../01-audit/repository-inventory.md) registra os recursos visuais
existentes. Sua substituição ou alteração significativa exige justificativa e
aprovação. Na 3A não há autorização para criar outra marca ou editar os assets; mockups
documentais podem referenciar a identidade existente.

## Situação comprovada

No commit auditado `52077522486403a3d0351341c952ebb69e00b954`, o aplicativo contém uma
base Electron/React, tema e controles de janela. Não existe integração RabbitMQ
implementada. A descrição do README e o número `1.0.0` do manifesto não comprovam
uma versão utilizável do produto. A fundação desktop teve smoke local na 2B, sem
homologar o produto completo ou os outros sistemas; o commit posterior de logos
também não foi homologado no runtime por esta entrega documental.

## Fluxos pretendidos

- Gerenciar perfis e testar conectividade com identificação de ambientes.
- Entender filas, exchanges, bindings e métricas disponíveis.
- Criar e administrar recursos com permissões mínimas e confirmação adequada.
- Publicar mensagens e compreender confirmação, roteamento e falhas.
- Diagnosticar problemas sem induzir operações acidentais em produção.

O [escopo de MVP](../02-requirements/mvp-scope.md) classifica funcionalidades. Seu
aceite explícito na 1B aprovou o recorte; execução depende de autorização por etapa.

## Limites estabelecidos pelo proprietário

- Aplicação web, SaaS e infraestrutura para uma futura versão web: fora de escopo.
- Backend hospedado próprio e microserviços: sem necessidade demonstrada ou aprovação.
- Não substituir tecnologias ou identidade sem avaliação e aprovação.
- Não armazenar segredos em texto puro nem contornar validação TLS.
- Não prometer inspeção de mensagens sem efeitos colaterais ou histórico de métricas
  sem definir a fonte e a retenção.
- Não executar testes destrutivos em brokers de produção.
- Implementação incremental, documentação sincronizada e aprovação por etapa.

## Qualidade esperada

A interface deve responder durante operações de rede, suportar redimensionamento,
teclado e foco visível e explicar carregamento, erros e estados vazios. Produção deve
ser identificada por texto e símbolo, além de cor. Ações destrutivas devem mostrar
conexão, vhost, recurso e efeito.

Metas quantitativas, limites e matriz de referência foram aprovados como alvos de
validação nos requisitos não funcionais. Não existem benchmarks ou homologações atuais.

## Decisões pendentes

Stack, arquitetura, matriz candidata, MVP, armazenamento e estratégias de segurança,
testes e distribuição foram aceitos. A organização desktop foi implementada na 2B.
O design da 3A também foi aprovado, sem implementação. Permanecem pendentes a
autorização das subetapas da 4A, os módulos de produto, infraestrutura de release,
autenticação adicional e validação efetiva da compatibilidade. Consultar a
[avaliação tecnológica](../03-architecture/technology-evaluation.md) e o
[roadmap](../05-roadmap/roadmap.md).

## Direção visual aprovada na 3A

Com execução autorizada por “Autorizo”, a avaliação considerou a marca laranja
registrada em 39234fa. A direção recomendada usa neutros e acentos semânticos
laranja, sem alterar logos, com contexto fixo de ambiente/conexão/vhost e cinco
destinos principais. A resposta posterior **“Aprovado”** aceitou D3A-01–08 e a
conclusão/commit da 3A. O design está **Accepted**, com implementação parcial na 3B. Ver
[navegação](../03-architecture/navigation.md),
[design system](../03-architecture/design-system.md) e
[mockups](../03-architecture/ui-proposals/README.md).

## Interface base aprovada na 3B

O proprietário autorizou o contrato próprio por “Sim”. O shell, os temas e a
navegação local estão implementados, com Conexões vazia e Sobre. Contexto sem
sessão e endpoints separados não simulam broker conectado. Cadastro de perfis e
operações RabbitMQ continuam indisponíveis, conforme o recorte desta entrega.
A resposta posterior “Aprovado” aceitou sua conclusão e autorizou o commit da 3B,
mantendo as limitações registradas e a necessidade de autorização própria da 4A.

Check com 82 testes e package/smoke locais em macOS arm64; logos existentes usados
sem alteração. Isso não homologa os demais sistemas nem conclui o MVP. A interação
do menu nativo de tema por teclado precisa de revisão manual. Ver
[evidências da 3B](../07-testing/interface-3b.md).

## Perfis locais — incremento 4A.1

Execução autorizada por “Autorizo”, após `eb535d7`. Conexões permite cadastrar,
listar, selecionar, editar e remover perfis locais reais. Nome, ambiente,
endpoints HTTPS/AMQPS e usuário persistem no main; senha pode ficar em memória
somente durante a execução. A opção de salvar senha protegida permanece desligada
até comprovação por alvo. Salvar/selecionar não testa nem ativa conexão.

Sem integração RabbitMQ, CA customizada ou sessão nesta subetapa. M01 e MVP ainda
não completos. Contrato: [Connection Manager](../04-modules/01-connection-manager.md).
Conclusão/commit da 4A.1 aprovados e registrados em `fe4a252`, com limites mantidos.

## Guia e Ajuda offline — DOC.1

Por solicitação explícita do proprietário, o [guia do usuário](../10-user-guide/README.md)
explica funções reais, todos os campos do formulário, senhas, temas/menus e solução
de problemas. A mesma fonte é incluída na Ajuda do aplicativo, acessível pela barra
lateral sem internet. Funções de broker continuam identificadas como indisponíveis.
O histórico vivo [PROJECTS_STATUS.md](../../PROJECTS_STATUS.md) passa a ser leitura
e atualização obrigatórias em toda Task. Conclusão/commit DOC.1 aceitos por
“Aprovado”, mantendo as indisponibilidades e limitações apresentadas.

## Incremento 4A.2A — CA e teste administrativo explícito

Execução autorizada por “Autorizo”. O usuário pode configurar CA pública por perfil
e testar autenticação HTTPS, com cancelamento/resultado datado, sem ativar sessão
ou abrir AMQP. Perfis antigos são preservados em leitura e convertidos somente em
gravação explícita com backup. Guia e Ajuda passam a documentar os novos campos.
A conclusão/commit foram aprovados por “Aprovado”; RabbitMQ real e outros alvos não homologados.
[Evidências](../07-testing/https-4a2a.md).

## Incremento 4A.2B — teste AMQPS/vhost

Execução autorizada por “Autorizo” em 2026-10-29. O usuário pode verificar a prévia
de vhost, testar AMQPS separadamente de HTTPS, cancelar e consultar resultado datado.
O teste encerra a conexão, não cria canais/recursos nem publica/consome mensagens.
Senha permanece somente nesta execução e UI sem sessão ativa. Guia/Ajuda explicam
preenchimento, efeitos e erros. [Verificações](../07-testing/amqps-4a2b.md): 216 testes e 40 checks reais no
recorte de conexão 4.4.0/4.3.6 passaram. Conclusão/commit aprovados em 2026-10-30;
demais recursos, cluster/HA e outros alvos não homologados.
