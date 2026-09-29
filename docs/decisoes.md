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
