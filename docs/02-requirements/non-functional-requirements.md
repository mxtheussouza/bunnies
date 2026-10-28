# Requisitos não funcionais

Data: 2026-10-28. Status: **Approved como requisitos e metas de validação**.
O proprietário aprovou os requisitos/limites na conclusão da Etapa 1B. Os valores
não são capacidades garantidas pelo RabbitMQ ou resultados medidos. O proprietário
informou inicialmente “Nada definido” para ambientes e autenticação e depois aceitou
a matriz de referência; ainda não há compatibilidade homologada.

## Matriz de referência

| ID | Alvo candidato | Limite da proposta |
| --- | --- | --- |
| NFR-001 | Windows 11 x64; Ubuntu 24.04 LTS x64; macOS 14 arm64 e x64 | Quatro combinações de build/smoke; não implica outras distribuições, Windows ARM ou Linux ARM |
| NFR-002 | RabbitMQ 4.4.0 e 4.3.6 como patches iniciais de teste | Revalidar patches suportados antes de implementar; não declarar toda série homologada |
| NFR-003 | Management por HTTPS e mensageria por AMQPS; usuário/senha | TLS obrigatório neste recorte; CA customizada; mTLS, OAuth e proxy corporativo configurável posteriores |
| NFR-004 | Aplicação exclusivamente local/desktop | Nenhum servidor próprio hospedado, telemetria ou execução de conteúdo remoto |

A seleção de macOS 14 é um piso proposto de produto, acima do mínimo informado pelo
Electron 44+; não significa que todos os sistemas mais novos tenham sido testados.
O ciclo de suporte RabbitMQ e a matriz tecnológica estão na
[avaliação](../03-architecture/technology-evaluation.md). Versões adicionais exigem
teste e atualização explícita da matriz; fora dela, informar suporte não homologado.

## Segurança, privacidade e confiabilidade

| ID | Requisito verificável | Evidência futura |
| --- | --- | --- |
| NFR-005 | Segredos não persistidos em claro; modo em memória quando proteção do SO não estiver comprovadamente disponível | T-02, T-09; inspeção de arquivos e falhas do key provider |
| NFR-006 | Renderer sem Node, contexto isolado, sandbox ativo, ponte mínima e navegação/requisições restritas | T-01, T-10; configuração efetiva no artefato |
| NFR-007 | TLS verifica cadeia e hostname; sem flags/API de bypass ou downgrade | T-04, T-12; CA inválida, hostname divergente e expiração |
| NFR-008 | Logs estruturados não contêm segredos, cabeçalhos de autenticação ou payloads; retenção limitada | T-09; entradas com valores sentinela não sensíveis |
| NFR-009 | Escritas não são repetidas automaticamente após erro ambíguo; cancelamento não é rollback | T-05, T-07 |
| NFR-010 | Exclusão, purge e remoção de binding exigem confirmação contextual no núcleo e revalidação após o diálogo | T-06, T-10 |
| NFR-011 | Configuração versionada, escrita atômica e validação; corrupção não sobrescreve o arquivo original silenciosamente | T-02; falhas de disco/permissão/formato |
| NFR-012 | Recursos, sockets, handlers e listeners têm ciclo de vida controlado; descarte de sessão impede retorno obsoleto | T-01, T-05, T-08 |

## Limites operacionais candidatos

Este é o ponto de referência para os valores abaixo. Uma mudança exige atualizar
requisitos, testes e contrato afetados. Verificar bytes durante leitura/serialização
e antes do parsing controlado pela aplicação. O custo inicial de structured clone
do Electron/contextBridge pode preceder o handler; o limite de IPC não é garantia
contra toda alocação de memória causada por renderer comprometido.

| ID | Parâmetro | Valor inicial proposto |
| --- | --- | --- |
| NFR-013 | Timeout total de leitura HTTP / handshake AMQP / comando de escrita / espera de confirm | 10 s / 15 s / 30 s / 10 s; deadline após envio pode gerar resultado incerto |
| NFR-014 | Página de recursos / máximo solicitado pelo cliente | 100 / 200 itens; endpoints sem paginação recebem tratamento próprio, sem inventar paginação no servidor |
| NFR-015 | Resposta HTTP descomprimida / payload publicado UTF-8 | 10 MiB / 1 MiB; resposta/payload acima do limite gera erro explícito |
| NFR-016 | Headers de mensagem / corpo IPC serializado | Até 64 headers e 64 KiB agregados / 2 MiB; limitar também profundidade de dados a 16 níveis |
| NFR-017 | Leituras HTTP simultâneas / publicações em voo | Máximo 4 por sessão / uma por sessão no MVP |
| NFR-018 | Polling | 5 s após conclusão; mínimo 5 s, sem sobreposição; pausar em background/desconexão; atualização manual disponível |
| NFR-019 | Reconexão | Até cinco tentativas: 1, 2, 4, 8 e 16 s com jitter de até 20%; depois, ação manual; não repetir 401/403 ou erro TLS |
| NFR-020 | Perfis / tamanho do arquivo de configuração | Até 50 / 2 MiB, incluindo ciphertext; validar antes da persistência |
| NFR-021 | Logs locais | Até três arquivos de 5 MiB; rotação no núcleo; timestamps e IDs, sem dados sensíveis |

Os limites do broker e suas políticas continuam valendo e podem ser mais restritivos.
Leituras de grandes conjuntos sem paginação suportada devem informar o limite, em
vez de baixar tudo e alegar que a paginação visual resolveu o custo de rede.

## Interface e desempenho

| ID | Meta candidata | Como verificar |
| --- | --- | --- |
| NFR-022 | Teclado, ordem de foco, nomes acessíveis e foco visível nos fluxos do MVP; produção distinguida além da cor | Componentes e revisão manual com tecnologias assistivas por SO |
| NFR-023 | Contraste mínimo 4,5:1 em texto comum e 3:1 em texto grande/componentes aplicáveis; zoom 200% sem perda de ações essenciais | Medição e inspeção dos temas; referência WCAG 2.2 AA, sem alegação de certificação |
| NFR-024 | Janela a partir de 1024 × 700; em tamanhos menores, rolagem e acesso aos controles, sem truncar ações críticas | E2E em dimensões/zoom e teste manual |
| NFR-025 | p95 de resposta visual a interação local até 100 ms com rede lenta; tabela de 100 linhas utilizável | Pelo menos 20 interações por cenário no equipamento de referência, medindo evento→feedback |
| NFR-026 | Inicialização até interface utilizável em até 5 s no p95 | 20 inicializações de release por alvo; registrar hardware/cache/OS; não incluir conexão ao broker |

NFR-025/026 são metas a validar antes de assumidas como compromisso de release.
Equipamento de referência proposto: ao menos quatro núcleos, 8 GiB de RAM e SSD;
registrar CPU/OS reais ao medir. Memória será medida no processo principal e filhos,
com método/compartilhamento documentados por SO; não há orçamento ou ganho percentual
comprovado. Se metas forem inviáveis, propor revisão antes de mudar o critério.
[Referência de acessibilidade](https://www.w3.org/TR/WCAG22/).

## Qualidade e distribuição

| ID | Requisito | Evidência futura |
| --- | --- | --- |
| NFR-027 | Compilação separa Node, preload e DOM; tipagem estrita e imports respeitam fronteiras | Typecheck e revisão de dependências |
| NFR-028 | Instalação reproduzível pelo lockfile e package manager fixado; CI sem testes destrutivos em ambiente externo | Jobs e relatórios por commit |
| NFR-029 | Smoke de pacote por SO/CPU, incluindo recursos, sandbox, CSP, credenciais e fechamento/reabertura | T-12; testes não equivalem a assinatura/notarização |
| NFR-030 | Alterações incrementais, documentação sincronizada, aprovação e Conventional Commits | Contrato, revisão e histórico |

Não há SLA de broker, alta disponibilidade de cluster ou entrega exatamente uma vez
prometidos pelo aplicativo. A [estratégia de testes](../07-testing/test-strategy.md)
e o [modelo de segurança](../08-security/security-model.md) definem verificações
planejadas. Nenhuma métrica de desempenho ou teste funcional foi executado na 1B.

## Sublimites aceitos para 4A.2A

A resposta “Autorizo” ao contrato 4A.2A aprovou os limites específicos abaixo;
eles não ampliam os tetos gerais anteriores e não constituem homologação de broker.

| ID | Parâmetro específico | Limite aceito |
| --- | --- | --- |
| NFR-031 | CA pública por perfil / seleção temporária | Bundle PEM até 256 KiB/16 certificados CA; uma seleção por janela; validade de dez minutos; material público copiado no main, sem chave privada/trust global |
| NFR-032 | Probe whoami HTTPS | Headers até 16 KiB/corpo até 64 KiB, UTF-8/JSON profundidade até 16, somente identity; TLS mínimo 1.2, cadeia/validade/hostname obrigatórios, sem redirect/retry/proxy herdado |
| NFR-033 | Execução do teste / contexto | Uma operação em voo por janela, deadline total 10 s (NFR-013); cancelamento/invalidação e resultado datado sem ativar sessão |

Schema v2/backup v1 implementam NFR-011; arquivo principal e backup individual
continuam limitados a 2 MiB, sem segredo em memória. Regressão e limites efetivamente
executados: [4A.2A](../07-testing/https-4a2a.md).
