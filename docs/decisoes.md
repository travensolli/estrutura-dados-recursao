# Registro de decisões

Formato: data, contexto, decisão e consequência. Dúvidas de interpretação do
enunciado seguem sempre a opção mais fiel ao texto original.

## 2026-09-17: Contexto não informado no briefing

- **Tempo da apresentação** não foi informado. Assumimos 15 minutos; o roteiro
  traz a divisão por seção e indica o que cortar se o tempo for menor.
- **Restrições do professor** (linguagem, bibliotecas, formato de entrega) não
  foram informadas. Assumimos "nenhuma". Se surgir alguma, ela vence e a
  decisão será registrada aqui.
- **Critérios de avaliação 1 a 3** não estavam disponíveis; só o critério 4
  (fluidez na apresentação e na demonstração) é conhecido.

## 2026-09-17: Casos base exatamente como no enunciado

Fibonacci usa f(0) = f(1) = 1 (sequência 1, 1, 2, 3, 5, 8, ...) e Tribonacci
usa f(0) = f(1) = f(2) = 1 (1, 1, 1, 3, 5, 9, 17, 31, ...). Isso difere da
convenção com f(0) = 0 e muda os valores de referência: Tribonacci f(7) = 31.

## 2026-09-17: Convenção de contagem

"Invocação" é toda chamada da função, incluindo a raiz, os casos base e os
acertos de cache. Ordem de verificação: caso base, cache, cálculo. A interface
mostra sempre dois números: invocações totais e chamadas recursivas (total
menos a raiz). A contagem por argumento e a lista de acertos seguem a mesma
convenção. Referência: Tribonacci f(7) tem 46 invocações sem cache e 16 com
cache, logo 30 chamadas evitadas.

## 2026-09-17: Nome do campo "faltas de cache"

Nas métricas, o campo chama-se `calculados` (nós que executaram a fórmula).
No modo com cache ele equivale às faltas de cache; no modo sem cache, toda
chamada não-base é calculada. Preferimos um nome único válido nos dois modos
para não ter campos redundantes. A interface rotula como "Calculados (faltas
de cache)" quando o modo é com cache.

## 2026-09-17: Profundidade máxima

`profundidade_maxima` conta quadros da função simultaneamente na pilha, com a
raiz valendo 1. Para Tribonacci f(7) o valor é 6 (f(7) até f(2)).

## 2026-09-17: Pacotes internos consumidos a partir do código-fonte

`packages/contrato` e `packages/nucleo` exportam `src/index.ts` diretamente
(sem etapa de build). Vite, tsx e Vitest transpilam na hora e `tsc` checa os
tipos a partir da fonte. Para produção, a API é empacotada com tsup incluindo
os pacotes internos. Consequência: `pnpm dev` funciona sem builds prévios.

## 2026-09-17: Valores como texto no JSON

`JSON.stringify` não serializa `bigint`. Todos os valores de sequência
trafegam como string decimal; o frontend só reconverte com `BigInt()` quando
precisa calcular. Os schemas Zod validam o formato com a expressão `^\d+$`.

## 2026-09-17: Versões das dependências

Fixamos TypeScript 5.x (o typescript-eslint ainda não aceita a linha 7),
Vite 7 com Vitest 4, ESLint 9, React 19, React Router 7, Zod 4 e Fastify 5.
Versões mais novas existiam no registro, mas com compatibilidade cruzada
incerta entre plugins.

## 2026-09-17: Trabalho em worktrees paralelos

Cada frente de trabalho usa um `git worktree` proprio em
`/home/g-travensolli/fatec/.worktrees-trabalho-ed`, fora da pasta do
repositorio, com branch `feature/*` saido de `develop`. Ficar fora da pasta
evita que ESLint, Prettier, `tsc` e Vitest do repositorio principal enxerguem
os arquivos das outras frentes. A integracao acontece por merge `--no-ff` em
`develop`, feito em um lugar so.

## 2026-09-17: Ambiente de desenvolvimento

- Node 22.22.1 e pnpm 10, instalado por `corepack` em `~/.local/bin`.
- `jsdom` fica na linha 29: a linha 30 exige Node 22.22.2 ou superior e o
  campo `engines` do pacote bloqueia a instalacao.
- TypeScript fica na linha 5: o `typescript-eslint` 8 ainda declara
  compatibilidade ate a linha 6.
- O daemon do Docker esta ativo na maquina, mas o usuario nao pertence ao
  grupo `docker` e nao ha `sudo` sem senha. Os arquivos do Compose e os
  Dockerfiles foram escritos e revisados, porem `docker compose up` ainda nao
  foi executado de ponta a ponta. Para validar: `sudo usermod -aG docker $USER`
  e reabrir a sessao.

## 2026-09-17: Onde cada numero da interface nasce

Nenhuma tela mostra numero escrito no codigo. Enquanto a API nao existia, o
frontend foi construido sobre mocks que executam a mesma recorrencia e
devolvem metricas reais. Na integracao, os mocks saem e as respostas passam a
vir da API, que usa `packages/nucleo`. O modo apresentacao tem um plano B que
executa o mesmo nucleo num Web Worker do navegador: as contagens continuam
exatas, os tempos aparecem marcados como indicativos e a memoria nao e
exibida, porque o navegador nao oferece medida confiavel.

## 2026-09-28: Contexto informado — apresentação de 10 minutos

O contexto que faltava no briefing foi informado e substitui a suposição de 15
minutos registrada em 17/09.

- **Tempo:** 10 minutos. O roteiro foi refeito com essa duração e organizado na
  ordem do enunciado, para que nenhum dos quatro pedidos fique de fora.
- **Base da apresentação:** o próprio enunciado. Cada seção do roteiro e do
  relatório responde a um pedido dele, na mesma ordem.
- **Material projetado:** `docs/relatorio.html`, gerado por `pnpm relatorio`. É
  um arquivo único, estático, sem servidor e sem dependência de rede, então a
  apresentação não depende de a aplicação subir na hora.
- **A aplicação continua no projeto**, com front e back em Docker Compose, para
  que seja possível informar o n das três funções e conferir os resultados ao
  vivo. A demonstração passou a ser um bloco curto dentro da seção de
  desempenho, e não mais o centro da apresentação.

**Consequência:** a documentação didática foi consolidada no `README.md`, agora
em formato de artigo, que passa a ser a fonte para montar a apresentação. Os
documentos `explicacao-tribonacci.md` e `metodologia-medicao.md` foram
incorporados a ele (seções 2, 3, 5 e 6) e removidos, para não haver duas versões
dos mesmos números.

## 2026-09-29: A resposta acima da dobra — as telas cabem num notebook

A apresentação será projetada de um notebook comum, então o pior caso de
janela útil é 1366x641 (1366x768 menos a barra de tarefas e o navegador).
As telas de navegação foram compactadas com um princípio único: **acima da
dobra fica a resposta; a prova abre sob demanda.**

- Início, Calcular e Comparar abrem sem rolagem do documento. O teste de
  ponta a ponta `dobra.spec.ts` trava isso no projeto desktop, que passou a
  medir 1366x641.
- As tabelas longas (tempo, memória, ambiente e invocações por argumento)
  viraram blocos recolhidos no componente novo `Detalhes`, com seta que gira
  ao abrir e alvo de toque de 44px no resumo.
- O Início ganhou uma faixa que liga cada item do enunciado à tela que o
  responde, já com Tribonacci e n igual a 7 no endereço.
- Na Árvore os controles podem rolar para fora da primeira dobra, mas
  contadores, ferramentas e desenho cabem juntos numa tela; o teto do
  desenho é min(42vh, 680px), o mesmo espírito do palco da apresentação.
- Nenhum texto de conteúdo desce de 14px: a densidade veio de margens,
  rótulos e ajudas mais curtas, nunca de fonte menor nem de alvo de toque
  menor.

De quebra, a medição achou o motivo de o trabalho de ponta a ponta falhar
no CI: o vite subia só em localhost, que em Node recente resolve para o ::1
do IPv6, enquanto o Playwright esperava em 127.0.0.1. O vite agora nasce
preso ao IPv4 e a espera dos servidores dobrou para 240 segundos.

## 2026-09-29: O palco da apresentação passa a ser o app

A entrada de 28/09 projetava o `relatorio.html` e deixava a aplicação num
bloco curto de demonstração. Com as telas cabendo na dobra do notebook, a
relação se inverte.

- **Material projetado:** a própria aplicação, navegada do fato medido à
  explicação (`/` → `/calcular` → `/arvore` → `/apresentacao` → `/comparar`);
  a faixa do início mantém os pedidos na ordem do enunciado.
  Todos os números continuam vindo de execuções instrumentadas, ao vivo.
- **O `relatorio.html` não sai do projeto:** vira material de apoio e o
  primeiro degrau do plano B, porque é estático e não depende do app subir.
- **Motivo:** a demonstração ao vivo responde os quatro pedidos do enunciado
  com mais força do que capturas num documento, e a faixa "O enunciado,
  item a item" do início mostra a cobertura de cara, sem margem para
  dúvida sobre o que foi ou não atendido.

**Consequência:** o roteiro foi reescrito seção a seção com as telas e os
endereços prontos, e o checklist passou a exigir zoom em 100% e um ensaio
de navegação antes da aula.

## 2026-09-29: Configuração à esquerda, comparativo lado a lado e a ordem das recorrências

Depois de ensaiar com o app como palco, a leitura das telas de execução pediu
uma mudança de forma: o que se ajusta à esquerda, o que se mostra à direita.

- **Calcular, Comparar e Árvore** ganharam a mesma grade de duas zonas no
  notebook: uma coluna de configuração de 300px e o resultado ao lado. Abaixo
  de 1024px a grade empilha, como antes. A escala dos gráficos do Comparar
  mudou-se para a coluna, porque é um ajuste de leitura.
- **Comparativo lado a lado:** no modo comparar do Calcular, os dois placares,
  sem cache e com cache, mostram as sete contagens na mesma linha de visão. A
  tabela de métricas saiu; as definições de cada contagem ficaram num bloco
  sob demanda.
- **Dobra pós-execução:** o teste `dobra.spec.ts` passou a exigir, além do
  estado inicial sem rolagem, que os dois placares e, no Comparar, os três
  destaques e as duas curvas fiquem inteiros na janela depois de executar.
- **Ordem da recorrência:** o contrato ganhou o campo `ordem` (1, 2 e 3). Um
  teste do núcleo confere que a raiz de f(7) sem cache abre exatamente essa
  quantidade de chamadas, para a tela nunca mostrar uma ordem que a recursão
  não executa. O Início usa a ordem para explicar, em duas linhas, por que
  sem cache o custo é exponencial a partir da ordem 2.
- **Notação do crescimento:** as frases viraram `exponencial, Θ(τⁿ), τ ≈
1,839` e `Θ(φⁿ), φ ≈ 1,618`, a forma do artigo, no lugar de `aproximadamente
1,839ⁿ`. Em f(7) o Tribonacci faz 46 invocações, e 1,839⁷ ≈ 71: o
  "aproximadamente" sugeria uma igualdade que a contagem não confirma. Uma
  primeira versão escreveu `O(1,839ⁿ)`, o que é falso no sentido estrito,
  porque τ = 1,83928... fica acima de 1,839; a revisão pegou e a constante
  passou a ter nome. As contagens com cache ganharam o domínio: 2n − 1 e n
  valem a partir de n = 1, e 3n − 5 a partir de n = 2.
- **Largura:** o miolo passou de 1152px para 1280px, aproveitando a tela de
  1366 que a coluna de configuração estreitava.
- **Árvore inteira:** o piso do enquadramento automático desceu de 0,4 para
  0,25, para f(7) caber inteira na coluna mais estreita, também num projetor
  de 1024px; um teste de ponta a ponta confere os 46 nós dentro do desenho. Nesta tela o objetivo
  é a forma e as repetições pela cor; o zoom continua para ler cada nó.

**Medição:** as telas foram conferidas em 1366x641 com as fontes do sistema e
com uma simulação de fontes mais largas (Verdana e Courier New), para cobrir
as fontes do runner Linux do CI, que já tinham estourado a dobra uma vez.

**Consequência:** `docs/resultados-benchmark.md` recebeu à mão as seis linhas
de crescimento, sem regerar as medições que o roteiro cita; como a fonte do
texto é o contrato, a próxima regeneração sai igual. O roteiro foi ajustado à
nova disposição das telas.

## 2026-09-29: Fórmulas gerais no Início e a altura do desenho da árvore

Ajustes pedidos pelo usuário depois da revisão da configuração à esquerda.

- **Fórmulas gerais:** o Início ganhou um painel com as contagens escritas em
  função de k (a ordem) e b (a quantidade de casos base): invocações sem cache,
  com cache, 1 + k · (n − b + 1), chamadas evitadas, valores no cache,
  n − b + 1, profundidade, n − b + 2, e o tempo em Θ. A tabela aplica cada
  fórmula às três sequências para um n do exemplo (7 por padrão, de 2 a 40),
  mostrando a conta e o resultado. O painel nasce fechado porque a dobra do
  Início tinha cerca de 75px de folga com fontes largas. Um teste confere as
  fórmulas contra a execução instrumentada para n de 2 a 15.
- **Tipo de cada sequência:** o selo do cartão passou de "ordem N" para
  "recursão linear · ordem 1", "dupla · ordem 2" e "tripla · ordem 3".
- **Limites de n:** a frase "Aqui n vai até …" saiu dos cartões. Os limites
  continuam junto do campo de n em cada tela.
- **Legenda da árvore:** a frase sobre a cor por argumento saiu. A coluna da
  esquerda já diz que a cor é o argumento.
- **Altura do desenho:** o desenho da árvore passou a ocupar a altura que
  sobra na janela, `clamp(200px, 100dvh − 386px, 820px)` a partir de 1280px de
  largura e `100dvh − 474px` abaixo disso, onde as barras acima dele quebram
  linha. Antes a altura seguia a proporção da árvore, limitada a 46vh.

**Medição:** em 1366x641 o desenho tem 255px e nenhuma variação rola: sem
cache, com cache e fatorial, nas fontes do sistema e na simulação das fontes
do Linux. Com cache rolava de 40 a 68px depois dos botões de 44px. Em
1440x900 o desenho chega a cerca de 515px. Em 1024x641 sobram 33px de
rolagem por causa do piso de 200px; numa janela de 1024x768 não rola.

**Consequência:** a árvore sem cache é larga, e o enquadramento continua
limitado pela largura. A altura extra vira espaço para aproximar e arrastar,
não nós maiores. `e2e/dobra.spec.ts` ganhou o caso com cache sem rolagem.

## 2026-09-29: O código real no início, a tabela com grade e o método à vista

Mais um passe de legibilidade para a apresentação, a partir do ensaio.

- **Código em TypeScript:** cada cartão do início ganhou o botão Código, que
  abre uma janela larga com as duas funções da sequência. O texto não é
  copiado: vem de `packages/nucleo/src/puros.ts` no build, com `?raw` do Vite,
  e são essas as funções que o comparar cronometra. Um teste recorta cada
  função e confere que o número de chamadas recursivas é a ordem do contrato
  e que o caso base é o do enunciado. A janela foi escolhida em vez de código
  dentro do cartão porque a linha mais longa tem 92 caracteres e o cartão
  comporta uns 48: dentro dele, o código quebraria e empurraria a página.
- **Tabela de fórmulas:** grade entre todas as células, zebra nas linhas e
  colunas de largura fixa com quebra de texto, sem rolagem lateral em 1366 e
  1024px, mesmo com n = 40. As opções ficaram na Tabela compartilhada,
  desligadas por padrão.
- **Sem previsão:** a linha de previsão de invocações saiu do calcular e do
  comparar, porque repetia o que o resultado mostra logo depois. A estimativa
  continua por trás do bloqueio de n, do aviso de cálculo pesado e da
  confirmação.
- **Método à vista:** o comparar explica como mede, aberto antes da primeira
  medição e recolhido depois dela: contagens da versão instrumentada, tempo das
  funções puras com relógio de nanossegundos, aquecimento que calibra blocos de
  200 ms, coleta de lixo antes de cada bloco, modos alternados e mediana, e a
  memória retida entre duas coletas. Cada número do texto foi conferido contra
  a API.

**Consequência:** o roteiro mostra o código na seção das sequências e o
método antes da medição ao vivo, e a lista de perguntas ganhou a do custo do
bigint.

**Revisão do texto (mesmo dia):** como a apresentação usa mouse, as instruções
dizem "clique em", e não "toque em". O cartão do método passou a separar as
repetições: a mediana do tempo usa as repetições escolhidas na coluna da
esquerda, e a memória usa sempre 3 repetições próprias. Isso foi conferido
numa chamada à API com 5 repetições, que devolveu 5 no tempo e 3 na memória.
E toda contagem que pode valer 1 passou a concordar no singular: "a mesma 1
chamada recursiva", "1 invocação", "1 repetição", "Abrir o nó recolhido".

**Sem rodapé (mesmo dia):** o rodapé com a frase de resumo saiu de todas as
telas, porque repetia o que o início e o roteiro já dizem. Os 37px voltaram
ao desenho da árvore, cuja altura é calculada a partir da janela.

**Tempo no placar (mesmo dia):** o tempo da execução do calcular saiu da
frase ao pé da tela e passou a fechar cada placar, em destaque e alinhado
aos outros números. Continua sendo uma medida única da versão instrumentada,
e a nota ao lado diz isso. Em f(7) os dois modos ficam perto de 0,3 ms, porque
o custo fixo de uma execução a frio domina 46 chamadas; em n = 20 e n = 25 a
diferença aparece (3,7 contra 0,4 ms e 46 contra 0,4 ms, medidos na API).

## 2026-09-29: Densidade — o alvo segue o ponteiro, o texto sobe e o desenho cresce

A calibração da dobra valia para o estado inicial das telas. Depois de
executar, e dentro da apresentação, o conteúdo ainda passava da janela, e
o peso visual estava invertido: botões de 44px por toda parte e o texto que
explica o conceito em 14px apagados.

- **O alvo segue o ponteiro.** O piso de 44px continua no toque (WCAG 2.5.5),
  mas com ponteiro fino e hover, que é o notebook com mouse ou trackpad, cai
  para 32px, acima dos 24px de WCAG 2.2 SC 2.5.8. A troca é uma variável,
  `--alvo`, lida pelo token `--spacing-toque`: o Tailwind copia o valor para
  dentro da utilidade, então `min-h-toque` virou `min-height: var(--alvo)` e
  nenhum dos cerca de 50 usos precisou mudar. A variante `denso:` usa a mesma
  consulta, para layout e alvo mudarem juntos, e `data-densidade="confortavel"`
  devolve os 44px a uma subárvore se um ensaio pedir. A decisão de 29/09 de
  não reduzir o alvo cai; a de não descer texto de conteúdo abaixo de 14px
  continua.
- **O texto sobe, o botão desce.** A tese do Início fica lado a lado, em
  tamanho de leitura, e os quatro botões de cada cartão viram atalhos
  discretos. Uma ação principal por tela, a 40px; o resto a 32px. Três
  entrelinhas nomeadas (dado, interface, prosa) e a utilidade `prosa` para o
  texto explicativo.
- **Um cartão por resposta.** No Calcular, o valor, as chamadas evitadas, as
  barras e os dois placares viram um cartão com réguas; no Comparar, os três
  destaques. Tempo, memória e ambiente viram abas num único bloco recolhido,
  com o componente `Abas`, que existia sem uso. Os gráficos sobem de 150 para
  200px: a reta da escala logarítmica é a prova visual do exponencial.
- **O desenho da árvore fica com a coluna da direita.** Os contadores descem
  para a coluna lateral, que estreita para 260px, e a barra de zoom flutua no
  canto inferior direito do desenho, que as três recorrências deixam vazio
  porque o ramo mais fundo é o da esquerda. As alturas saem de constantes em
  `arvore/layout.ts`.
- **O palco cabe inteiro.** A moldura perde 80px, a etapa 2 põe a árvore na
  largura toda com a contagem por argumento numa faixa abaixo, e a etapa 6
  fecha com o critério: o mesmo argumento volta?

**Medição** em 1366x641, antes e depois: Calcular depois de calcular rolava
188px e não rola; Comparar rolava 774px e rola 347, com destaques e curvas
na dobra e o resto recolhido abaixo; o desenho da Árvore foi de 292 para
466px e a reprodução passo a passo, que rolava 112px, cabe; as etapas 2, 3 e
5 rolavam 265, 334 e 132px por dentro do palco e nenhuma rola, também em
1366x768. Na etapa 2 a árvore foi de 191 para 291px em 1366x768.

**Limite conhecido:** a árvore sem cache de f(7) tem 31 folhas e é limitada
pela largura, não pela altura; na Árvore, a altura extra vira espaço para
aproximar e arrastar, e quem ganha tamanho é a árvore com cache, que é alta.

**Testes:** `e2e/alvos.spec.ts` mede o menor lado de todo controle visível e
exige 44px no projeto celular e 32px nos outros; `dobra.spec.ts` ganhou a
janela útil de um 1440x900 e a garantia de que as seis etapas não rolam por
dentro, em 768 e 641. Os projetos desktop e tablet do Playwright usam o
Chrome de mesa, com ponteiro fino e hover, e por isso ficam densos; só o
celular, com toque, vê os 44px.

## 2026-09-29: Os mesmos controles nas três telas de trabalho

Calcular, Comparar e Árvore montavam os mesmos controles de jeitos
diferentes: a sequência numa lista suspensa, os campos da árvore com as
setas do navegador e o rótulo "Valor de n", e colunas de 300 e 260px.

- **Um molde.** `PaginaComPainel` fixa a coluna em 288px nas três telas, o
  título com uma linha de descrição e a ordem dos controles: sequência,
  modo, números e a ação. O modo vem antes de n porque define o limite.
- **A sequência à vista.** Três opções cabem num seletor segmentado, no
  mesmo estilo do modo: um clique, e a escolhida fica marcada. No
  Calcular o modo fica em duas colunas, com "Comparar" na linha de baixo,
  sob os dois modos que ele junta.
- **Um campo numérico.** Cada campo é uma linha: o nome e a faixa aceita
  ("De 0 a 30") à esquerda, e à direita o valor entre menos e mais, numa
  peça só, com uma borda e divisórias finas. Dois campos numa tela ficam
  empilhados, não lado a lado: a primeira versão, com três caixas soltas e
  dois campos encostados, parecia um formulário só. O erro aparece sob a
  linha e a faixa fica à vista para explicar o limite. O limite de nós anda
  de 100 em 100.
- **Fonte larga.** As telas foram conferidas também com Verdana forçada,
  de métricas parecidas com as do DejaVu Sans do runner Linux. Com colunas
  iguais, "Tribonacci" era cortado na opção escolhida; as colunas dos
  segmentos passaram a seguir o conteúdo, e a descrição da Árvore ficou
  numa linha para a coluna caber na dobra.

## 2026-09-30: O conceito no Início e as fórmulas para quem não conhece a notação

Ajustes pedidos pelo usuário para o público da apresentação, que não é todo
da área.

- **A definição primeiro.** O título ganhou a frase do material de apoio:
  "Problemas recursivos são aqueles em que uma determinada instância do
  problema contém uma instância 'menor' do mesmo problema."
- **Dois blocos com pseudocódigo.** As duas linhas da tese viraram dois
  blocos, sem cache e com cache, cada um com um texto curto e o pseudocódigo
  no molde do material (Se, Então, Senão, Fim-se em negrito). O texto usa o
  vocabulário do material, caso base e k termos anteriores, e fecha no
  Fatorial, que com k ≤ 1 não ganha nada com o cache. Uma primeira versão
  apontava o "com f(0) = …" e a ordem dos cartões; o usuário preferiu o texto
  mais direto. A versão com cache segue a ordem de `puros.ts`, e não a do
  material: o caso base responde antes de olhar o cache e não entra nele,
  que é o que dá os n − b + 1 valores guardados da tabela. As linhas do cache
  levam a mesma marca da janela de código, e um teste confere que a versão
  com cache é a sem cache mais essas linhas.
- **Sem a faixa do enunciado.** Os quatro atalhos numerados saíram; o menu
  do topo e os atalhos de cada cartão continuam levando às telas. O roteiro
  passou a entrar no Calcular pelo cartão do Tribonacci.
- **Fórmulas legíveis.** O painel abre com uma frase de como ler a tabela e
  um glossário dos símbolos: n, f(n), k, b, invocação, I_sem e I_com, pilha e
  Θ, com φ e τ. Cada linha diz em palavras o que mede, na primeira coluna,
  que passou de "Grandeza" para "O que se mede", e as fórmulas com notação
  trazem a leitura logo abaixo. A nota abaixo da tabela, que deduzia o
  (k·f(n) − 1) / (k − 1), foi reescrita sem jargão e depois saiu: o
  usuário achou que ela confundia mais do que explicava. A dedução segue
  no artigo, na seção 2.4.

**Medição:** em 1366x641 o Início termina 13px acima da dobra, com as
fontes do sistema e com Verdana e Courier New forçadas. O pseudocódigo com
cache, de 10 linhas, é o que define a altura dos blocos; por isso ele usa a
entrelinha de dados e o texto ao lado foi cortado até caber numa linha a
menos na fonte larga. A tabela não rola para o lado em 1366 nem em 1024px
com n = 40.

## 2026-09-30: As telas lembram o que mostravam

Pedido do usuário: depois de calcular, comparar ou desenhar uma árvore,
trocar de página e voltar deve mostrar a mesma coisa. O formulário já
vivia no endereço, mas o menu levava à rota sem a consulta, e a execução
disparada era estado local da tela, perdido ao desmontar. A volta
mostrava tudo zerado, e a Árvore redesenhava o f(7) padrão.

- **Memória da sessão.** `hooks/memoria.ts` guarda um mapa num contexto
  acima das rotas, para sobreviver também à apresentação, que fica fora
  do layout. O menu leva cada tela ao último endereço visto nela, e
  `useEstadoLembrado` substitui o `useState` da execução do Calcular, da
  medição e da escala do Comparar e da vista Desenho ou Lista da Árvore,
  que só volta para a mesma árvore. Vale enquanto a aba estiver aberta:
  recarregar começa do zero, e o checklist do roteiro pede isso depois do
  ensaio.
- **Sem refazer.** As consultas de execução (calcular, comparar, série e
  árvore) não refazem ao montar e não expiram do cache
  (`refetchOnMount: false`, `gcTime` infinito). A volta mostra o mesmo
  tempo medido, não uma medição nova. O custo é memória: cada execução
  diferente da sessão fica no cache até recarregar a página.
- **Sair no meio não descarta.** Essas consultas deixaram de repassar o
  `signal` ao `fetch`. Com ele, desmontar a tela abortava o pedido e a
  volta media tudo de novo, enquanto a API, cujo worker não para quando o
  cliente desiste, terminava a conta de qualquer jeito. Agora o pedido
  segue e o resultado espera a volta. O Cancelar continua valendo: o
  `cancelQueries` larga a espera na hora e a resposta tardia é ignorada.
- **Link com outros parâmetros.** Entrar por um atalho que muda a
  consulta, como o cartão do Início, preenche o formulário e mantém o
  resultado anterior com o aviso de que o formulário mudou, como já
  acontecia ao mexer no formulário depois de calcular.
- **O que não volta.** O zoom e os nós recolhidos do desenho, o passo a
  passo, os blocos abertos e a aba dos números completos voltam ao
  estado inicial: são posição de leitura, não resultado.

**Medição:** o e2e `navegacao.spec.ts` calcula, compara e desenha, passa
pelas três telas de novo pelo menu e confere, contra a API real, que a
volta não fez nenhum pedido novo e que o tempo mostrado é o mesmo, em
desktop, tablet e celular.

## 2026-09-30: A árvore avisa o formulário mudado e a barra vira ícones

Ajustes pedidos pelo usuário nas telas com árvore.

- **O aviso do formulário.** Calcular e Comparar já diziam "O formulário
  mudou depois deste resultado"; a Árvore não dizia nada, e quem mexia
  nos controles via a árvore antiga sem saber. Agora diz "O formulário
  mudou depois desta árvore. Clique em Ver árvore para atualizar."
  enquanto os controles pedem uma árvore válida diferente da desenhada.
  Controles inválidos já mostram o erro no campo, e voltar ao que está
  desenhado tira o aviso. Como na Árvore o formulário é um rascunho, e
  não o endereço, a página guarda o endereço em que ele foi mexido:
  pedir outra árvore, ou chegar por outro link, apaga o aviso.
- **Sem custar altura.** O aviso fica na linha dos botões Desenho, Lista
  e Reproduzir, e em 1366x641 cabe nela sem rolagem. No passo a passo, a
  dica do teclado ocupa a linha e o aviso desce: a página rola 16px e só
  a legenda sai da janela. O aviso do Calcular no modo Comparar já custa
  14px pelo mesmo motivo.
- **Ícones na barra do desenho.** Aproximar, afastar e ajustar à tela
  viram ícones (+, − e os quatro cantos de um quadrado), com o nome para
  o leitor de tela e na dica do ponteiro. Vale também no palco da
  apresentação, que usa o mesmo desenho.
- **Um botão de baixar.** Os dois botões "Baixar SVG" e "Baixar PNG"
  viraram um ícone de download que abre, para cima, a escolha do
  formato, cada um com uma linha do que é: SVG, vetor para editores de
  slides, e PNG, imagem em 2x para o projetor. A escolha fecha ao
  baixar, com Esc ou com clique fora. Enquanto o PNG é gerado, o ícone
  gira e a opção PNG fica desabilitada.

## 2026-09-30: Os slides da apresentação ficam mais visuais

Ajustes pedidos pelo usuário no modo apresentação, para cada tela ler
melhor projetada.

- **Slide, não etapa.** O rodapé diz "Slide 1 de 6", o botão de avançar
  é Próximo e o endereço usa `?slide=`. O código acompanha o termo
  (`slides.ts`, `Slide*.tsx`). O resumo abaixo do título ocupa a linha
  toda e só quebra quando a tela não comporta. O rodapé ganha o botão de
  tema claro e escuro, que antes só existia no layout.
- **Slide 1, a definição e a conta.** A fórmula vai em MathML, desenhada
  com a fonte matemática do sistema (Cambria Math no Windows), como
  definição por partes. Ao lado, a conta de f(0) a f(7), termo a termo,
  com os valores tirados da árvore com cache da própria execução. O
  resultado fica só como f(7) = 31, em destaque.
- **Slide 2, o crescimento.** A nota "quadros na pilha" sai. Ao lado da
  contagem por argumento entra a curva das invocações sem cache de n = 0
  a n = 10, contadas pela versão instrumentada do núcleo no navegador,
  a mesma da API e do plano B. Até 10 porque, com escala linear e n = 12,
  a barra do próprio f(7) some no chão.
- **Slide 4, uma árvore só.** As duas árvores lado a lado ficavam
  pequenas demais. A com cache já traz no tracejado o que a sem cache
  faria, então fica só ela, com os selos, e uma linha com a conta do
  desenho: 16 feitas + 30 evitadas = 46. O `ArvoreSvg` ganhou o modo
  `preencher`, em que o desenho ocupa a altura que o contêiner flex
  sobrar; o desconto fixo em pixels rolava em 1920×1080 e no tablet.
- **Slide 5, uma chamada por quadrado.** As barras de sem cache e com
  cache na mesma escala deixavam as do modo com cache rentes ao zero.
  Agora cada linha tem um quadrado por chamada: todos são as sem cache,
  os cheios as com cache e os tracejados as evitadas, como na árvore.
  Os tracejados se esvaziam no ritmo do contador, pela inversa da mesma
  curva, e o lado do quadrado sai da largura da coluna para a fileira
  mais longa não quebrar.
- **Slide 6, Conclusão.** Sai o nome Generalizando e o título
  Exponencial contra linear. O fecho ocupa a largura toda do palco.

**Medição:** os slides 1, 2, 4, 5 e 6 cabem sem rolagem em 1024×640,
1280×720, 1366×641, 1366×768, 1440×773 e 1920×1080, e o e2e confere os
seis em 1366×641 e 1366×768. O slide 3, que não mudou, ainda rola por
dentro em 1024×640 (a dica das setas quebra o rodapé em duas linhas),
1440×773 e 1920×1080 (a altura da reprodução é um desconto fixo em
pixels). A figura `tela-apresentacao-slide-conta.png` foi exportada de
novo com o slide 5 novo.
