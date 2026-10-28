# Design system desktop — aprovado na Etapa 3A

Data: 2026-10-28. Status: **Accepted**, ainda não implementado.
Execução autorizada por “Autorizo”; decisões D3A-01–08, conclusão e commit aprovados
posteriormente por “Aprovado”. Base `39234fa`; nome Bunnies preservado.
Referências: [navegação](navigation.md), [mockups](ui-proposals/README.md),
[tokens propostos](ui-proposals/design-tokens.json) e
[medição de contraste](ui-proposals/contrast-report.json).

## Identidade observada

O commit posterior `39234fa` registrou os cinco assets que estavam pendentes ao
concluir a 2B. O Git estava limpo ao iniciar a 3A; esses arquivos não foram produzidos,
editados ou substituídos nesta etapa. O pacote testado da 2B antecede esse commit.

| Arquivo existente | Formato/tamanho observado | Uso recomendado na proposta |
| --- | --- | --- |
| assets/icons/bunnies.png | PNG RGBA, 60 × 60; mesmo hash do logo pequeno | Símbolo ao lado do nome textual do aplicativo, até 24–28 CSS px com avaliação em alta densidade |
| assets/images/logo.png | PNG RGBA, 60 × 60; idêntico ao ícone acima | Preservar compatibilidade de referências; não duplicar mais arquivos |
| assets/images/appIcon.ico | ICO 32 × 32 com alpha | Asset existente, sem homologação de qualidade em todos os tamanhos de instalação |
| assets/logotipos/bunnies-logo.png | PNG RGBA, 1254 × 1254 | Símbolo maior em documentação/Sobre; preservá-lo sem recriar contornos |
| assets/logotipos/bunnies-logo-extensive.png | PNG RGBA, 2172 × 724 | Logotipo extenso em Sobre/apresentações; usar proporção original, sem redigitar o lettering |

Inspeção visual: símbolo laranja com dois coelhos e versão extensa Bunnies; alpha
presente e confirmado por leitura dos PNGs. O símbolo pequeno ocupa aproximadamente
x=8–49, y=1–58 no canvas de 60 px. O extenso tem área visível aproximadamente
x=263–1990, y=79–675; respeitar seu respiro ao dimensionar, sem cortar o lettering.

Os PNGs têm variação/gradiente e bordas raster visíveis em ampliação. Não foi
identificada fonte vetorial. Recomendar obter o original vetorial e ícones de
distribuição adequados em recorte futuro; não vetorizar, recolorir, limpar bordas ou
fabricar outra marca agora. Fontes/arquivos originais de autoria não foram verificados.

### Alternativas de direção visual

| Direção | Benefício | Trade-off | Situação |
| --- | --- | --- | --- |
| Neutros + acento laranja derivado da marca atual | Conecta os novos assets ao produto e destaca ações com pouca decoração | Precisa de tons específicos para contraste e separação de alertas | Aprovada em D3A-01 |
| Neutros + azul do legado nas ações | Menor distância da paleta Sass atual | Marca laranja e acento principal azul ficam menos relacionados | Alternativa avaliada; não escolhida |

Usar o laranja da marca como referência, sem assumir que todos os pixels são de um
único hex. `#FF6600` é **âncora proposta**, não a extração de uma cor única do PNG.
Botões/estados recebem tons semânticos; isso não altera os arquivos da marca.
Azul permanece para links/informação/foco no tema claro, sem virar outra identidade.

## Tokens de cor propostos

Valores completos no JSON vinculado, fonte dos SVGs. Prefixos de código/geração de
CSS só serão detalhados no contrato de implementação, sem editar Theme.scss na 3A.

| Token | Claro | Escuro | Regra |
| --- | --- | --- | --- |
| canvas | #F6F7F9 | #101418 | Fundo geral |
| surface | #FFFFFF | #191F26 | Conteúdo e cards |
| alternate | #EEF1F5 | #222B35 | Cabeçalhos/superfícies secundárias |
| sidebar | #FFFFFF | #13191F | Navegação |
| text | #17212B | #F0F4F8 | Texto principal |
| muted | #526172 | #ACB8C7 | Texto secundário legível, sem opacity arbitrária |
| border | #738294 | #77889C | Limite necessário de controles |
| separator | #D8DEE7 | #35414F | Separador decorativo; não identifica sozinho um controle |
| accent | #B94700 | #FF944D | Ação primária |
| accentHover | #983A00 | #FFAE78 | Hover da ação primária |
| onAccent | #FFFFFF | #17212B | Texto sobre a ação primária |
| accentSoft / accentText | #FFF0E5 / #9A3900 | #3B281E / #FFAE78 | Destino ativo/seleção não destrutiva |
| focus | #1D4ED8 | #82B6FF | Anel de foco com separação do preenchimento |
| success / successSoft | #166534 / #ECFDF3 | #80DCAC / #153327 | Disponível/concluído, sempre com texto e ícone |
| warning / warningSoft | #92400E / #FFFAEB | #FFD08A / #362B18 | Parcial, antigo ou atenção |
| danger / dangerSoft | #B42318 / #FEF3F2 | #FFB4AA / #3B2022 | Erro/destruição e identificação textual de produção |
| onDanger | #FFFFFF | #17212B | Texto de ação destrutiva sobre danger |
| info / infoSoft | #1D4ED8 / #EFF6FF | #9CC5FF / #192D48 | Informação, links e ajuda |

Produção, falha e ação destrutiva têm rótulos/símbolos distintos mesmo quando usam
a família danger. Estado ativo da navegação não é estado do broker. Não substituir
status por bolinhas coloridas sem texto.

## Temas e geometria

Preferências: **Sistema, Claro, Escuro** (FR-024). Propor Sistema para instalação
nova sem escolha anterior; preservar uma preferência explícita existente clara ou
escura. Mudar o tema não troca sessão e não dispara consultas. Nada de segredo ou
payload em preferências de interface. Observar mudança de tema do SO só no modo
Sistema; não sobrescrever o modo manual durante o uso.

| Elemento | Proposta |
| --- | --- |
| Tipografia | Fonte de sistema: SF/Segoe UI/fallback sans local; sem download de fontes |
| Corpo / linha | 14 / 20 CSS px |
| Labels e metadados | 13 / 18; 12 px apenas em auxiliares curtos, ainda com contraste de texto |
| Título / seção | 28 / 36 e 18 / 24; pesos 600–650 |
| Valores técnicos | Monoespaçada local, números tabulares; preservar nome exato/Unicode |
| Espaçamento | Escala 4, 8, 12, 16, 24, 32, 48 px |
| Gutter de conteúdo | 24 px; 16 px em área estreita |
| Sidebar | 224 px; modo compacto 64 px abaixo de 1200 px de largura útil |
| Controles | Altura 36 px; ícone com alvo 32 px; linha de tabela 44 px |
| Cantos / elevação | 8 px; sombras discretas só em superfícies sobrepostas |
| Foco | Anel de 2 px, offset de 2 px e fundo de separação coerente com a superfície |

O modo compacto mantém nomes acessíveis/tooltips em foco e ponteiro. A expansão
temporária vira painel sobreposto, com Escape e retorno de foco ao gatilho; não
troca a conexão. Não depender de hover para navegar ou explicar um bloqueio.

### Redimensionamento e zoom

Alvo de validação NFR-024: janela a partir de 1024 × 700. Abaixo disso, manter acesso
por reflow/rolagem, sem cortar ações. A 200% de zoom, contexto pode ocupar duas
linhas e filtros viram pilha. Não reduzir tipografia para “caber”. Formulários e
diálogos reorganizam linhas e permitem rolagem; campos/ações críticos não somem.

Tabela extensa pode ter rolagem horizontal e cabeçalho identificável; o entorno e
as células devem continuar legíveis, sem exigir arrastar para descobrir ambiente
ou ação crítica. Nomes e ações podem ficar acessíveis em colunas fixas somente se
não colidirem em pouca largura; alternativa é abrir detalhe da linha pelo teclado.
Validar tamanhos e zoom na aplicação futura, não presumir aprovação por imagem
estática. [Reflow WCAG](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html).

## Componentes e contratos de interação

| Componente | Comportamento proposto |
| --- | --- |
| Button / IconButton | Um primário por grupo; rótulo de ação concreto; loading sem mudar largura; foco visível; ícone tem nome acessível; destruição nunca é primário de listagem |
| NavItem / ContextBar | Destino ativo acessível, contexto persistente, razão de bloqueio legível; não confundir seleção de perfil com ativação |
| EndpointStatus / EnvironmentBadge | Estados HTTPS/AMQPS separados; símbolo e texto; produção em caixa identificável, sem depender de vermelho |
| Field / Select / Password | Label visível, descrição e erro associados; validação junto ao campo e resumo quando necessário; password nunca repovoado do cofre |
| ProfileSummary | Valores somente leitura selecionáveis; Editar explícito; teste antigo não vira “conectado”; não embutir botão em outro botão |
| DataTable / Pagination | Colunas semânticas, nome/detalhe acionável por teclado, números alinhados, cabeçalhos associados; paginação e busca com universo explícito; sem lote no MVP |
| Tabs / Detail | Propriedades, consumidores e bindings; sem aba de inspeção/consumo de mensagens no MVP |
| Loading / Empty / Error / Partial | Distinguir sem dados, sem resultados de filtro, sem permissão, falha e snapshot antigo; ação de recuperação contextual, sem loop automático |
| Banner / StatusMessage | Região de status não intrusiva para atualizações; erro crítico/incerto persistente; não roubar foco em polling |
| FormDialog / Drawer | Foco inicial previsível, Escape quando não enviar escrita, contenção e retorno de foco; não substituir confirmação privilegiada por modal React |
| NativeEditMenu / NativeConfirmation | Edição por roles/atalhos; sem API direta de clipboard. Destruição confirmada no main, contexto revalidado, Cancelar padrão |

Reaproveitar a base React/Sass e modernizar Button/Card/estados pequenos. Não
selecionar ou instalar biblioteca visual nova nesta proposta. Primitivas complexas
de acessibilidade poderão ser avaliadas no contrato correspondente, com CSP e
segurança como restrições; não introduzir estilos inline/eval para contornar falhas.

### Estados mínimos de componentes

| Estado | Tratamento |
| --- | --- |
| Default / hover / focus | Superfície estável, contraste e anel; hover não é único sinal |
| Disabled / indisponível | Razão acessível por texto/ajuda; texto continua legível; não tornar ação falsa clicável |
| Loading | Indicador e nome da operação, leitura assíncrona; bloquear apenas a ação duplicada |
| Empty | Explicar ausência de perfis/recursos; CTA só quando o caso de uso existir |
| Filter empty | Manter filtros e oferecer limpá-los; não dizer que o broker não tem recursos |
| Error / forbidden / unsupported | Mensagem sanitizada adequada ao caso e ID de diagnóstico; sem sugerir bypass ou elevação |
| Stale / paused / partial | Instante/origem e estado visíveis; valores ausentes não viram zero |
| Unknown write outcome | Mensagem persistente e explícita; sem ícone de sucesso ou retry automático |

## Teclado, foco e acessibilidade

Tab/Shift+Tab em ordem visual, link de pular para conteúdo, landmarks e título da
página. Enter/Space acionam controles semânticos; Escape fecha menus/painéis e retorna
foco. Tabela comum usa semântica table/link/button, sem fingir um grid complexo com
atalhos incompletos. Preservar edição nativa e digitação; não capturar letras soltas.

Atalhos propostos: Cmd/Ctrl+1…5 para os cinco destinos quando disponíveis e fora de
edição; Cmd/Ctrl+F foca busca da lista atual; Escape limpa popup, não apaga formulário
silenciosamente. Confirmar conflitos por SO na implementação. Nenhum atalho de
purge/excluir/publicar que possa escrever acidentalmente. Cmd/Ctrl+Enter para enviar
fica adiado até revisar o fluxo de mensagens; Enter no payload insere conteúdo.

Atualizações de números não reiniciam foco/rolagem e não geram anúncios contínuos.
Resultado de ação iniciada pelo usuário pode usar aria-live moderado; erro bloqueante
de formulário foca o resumo/primeiro campo inválido. Respeitar redução de movimento;
não usar animação como único indicador de carga. Alvos de ícone propostos de 32 px
superam a referência mínima de 24 CSS px, sem alegar conformidade integral.
[Alvos WCAG](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html).

## Contraste verificado nos tokens

48 pares calculados por luminância relativa sRGB, sem alpha; comparação usa valores
não arredondados. Todos passaram seus limiares propostos de 4,5:1 para texto e 3:1
para controles/foco. Exemplos arredondados apenas para leitura:

| Par | Claro | Escuro |
| --- | --- | --- |
| onAccent / accent | 5,30:1 | 7,44:1 |
| muted / alternate | 5,60:1 | 7,12:1 |
| border / surface | 3,93:1 | 4,57:1 |
| focus / surface | 6,70:1 | 7,97:1 |

Branco sobre o laranja de referência #FF6600 dá **2,94:1**: exemplo rejeitado para
texto de botão. O logo permanece sem recoloração; a exceção para logotipos não se
estende aos demais rótulos/controles. Contornos decorativos de cards não substituem
o limite forte de inputs. Foco tem gap para contrastar com a superfície adjacente.
[Texto WCAG](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html),
[contraste não textual](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html).

Isso mede somente pares definidos. Não certifica todos os estados, rasterização,
tecnologias assistivas, zoom ou acessibilidade do Electron nos três sistemas.
Validação funcional/manual de NFR-022/023/024 ocorrerá nas etapas de implementação.

## Decisões aprovadas pelo proprietário

| ID | Proposta | Situação |
| --- | --- | --- |
| D3A-01 | Neutros + laranja semântico, usando a identidade de 39234fa sem editar assets | Accepted |
| D3A-02 | Cinco destinos e contexto fixo de ambiente/conexão/vhost; navegação em memória | Accepted |
| D3A-03 | Sistema como padrão novo, mantendo escolha anterior; temas e tokens desta proposta | Accepted |
| D3A-04 | Rótulos PT-BR e nomes técnicos/recursos preservados | Accepted |
| D3A-05 | Sidebar compacta, densidade e regras de reflow/zoom/foco | Accepted |
| D3A-06 | Tabelas sem lote, dados com escopo/atualidade e estados independentes por transporte | Accepted |
| D3A-07 | Conteúdo/padrão seguro das confirmações nativas; sem leitura/consumo de mensagens no MVP | Accepted; mantém ADRs aceitos |
| D3A-08 | Próximo recorte 3B: shell/temas/componentes/estados offline, sem simular operações RabbitMQ | Accepted |

A resposta **“Aprovado”**, após apresentação dos mockups, aceitou explicitamente
D3A-01–08 e a conclusão/commit da 3A. O recorte da 3B está aprovado como direção;
seu contrato físico e sua execução ainda exigem autorização própria. Os SVGs/PNGs
preservam os rótulos da apresentação original como evidência estática, sem homologação runtime.

## Implementação parcial na 3B

Execução autorizada por “Sim”; conclusão e commit aprovados depois por “Aprovado”
com as limitações registradas. Tokens foram materializados
em `src/renderer/styles/Theme.scss` com prefixo --bn-, sem import de documentação
no runtime. Button/Card modernizados; IconButton, StatusMessage, EmptyState e
ícones geométricos de UI acrescentados, sem alterar a marca. O shell usa cinco
destinos, contexto fixo, temas e estados sem sessão. Sobre usa o PNG extenso existente.

O controle de pular conteúdo é button semântico que foca main sem inserir hash na
URL validada; menus da barra também usam buttons, com Tab/Enter/Escape. O painel
compacto usa dialog HTML; não substitui confirmação privilegiada de broker.
Tabelas, campos de broker, drawers complexos e demais padrões acima não foram
implementados por antecipação. Fixtures de componentes só existem nos testes.

60 pares de contraste verificados no runtime local: 48 pares dos tokens computados
e 12 estados de botões. Layout/zoom/foco revistos no alvo local; isso não certifica
acessibilidade ou os demais sistemas. Ver [evidências da 3B](../07-testing/interface-3b.md).
