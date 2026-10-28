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
aprovação. Não há autorização para criar outra marca ou gerar novos recursos.

## Situação comprovada

No commit auditado `52077522486403a3d0351341c952ebb69e00b954`, o aplicativo contém uma
base Electron/React, tema e controles de janela. Não existe integração RabbitMQ
implementada. A descrição do README e o número `1.0.0` do manifesto não comprovam
uma versão utilizável do produto. A execução não foi homologada.

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
testes e distribuição foram aceitos. Permanecem pendentes a estrutura física final,
design system detalhado, infraestrutura de release, autenticação adicional e a
validação efetiva dos mecanismos e da compatibilidade. Consultar a
[avaliação tecnológica](../03-architecture/technology-evaluation.md) e o
[roadmap](../05-roadmap/roadmap.md).
