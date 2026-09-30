# Sequências recursivas com e sem cache: fatorial, Fibonacci e Tribonacci

**Trabalho:** PRJ.ED.1 — Estrutura de Dados\
**Curso:** Desenvolvimento de Software Multiplataforma (FATEC), 2º período\
**Tema:** algoritmos recursivos, árvore de chamadas e memoização\
**Execução de referência:** 28 de setembro de 2026

---

## Resumo

Este trabalho resolve o PRJ.ED.1, que pede o cálculo recursivo, com e sem cache, de três sequências
numéricas — fatorial, Fibonacci e Tribonacci —, a comparação de desempenho em tempo e memória entre
as duas versões e a exibição da árvore de chamadas das versões sem cache. As três sequências foram
implementadas em TypeScript, cada uma em duas versões: uma **pura**, que só calcula e é a única
cronometrada, e uma **instrumentada**, que conta invocações, separa casos base, acertos e cálculos,
registra a profundidade da pilha e monta a árvore de chamadas. Os resultados confirmam a análise
teórica. No fatorial, que faz uma única chamada recursiva por nível, o cache não evita nenhuma
chamada e só acrescenta memória: em n = 5.000 são as mesmas 5.000 invocações nos dois modos, com
tempo 0,85× e 15,40 MiB retidos. No Fibonacci e no Tribonacci, sem cache o número de invocações
cresce exponencialmente, Θ(φⁿ) e Θ(τⁿ); com cache passa a ser linear, 2n − 1 e 3n − 5. A aceleração
medida chegou a 85.324× em Fibonacci f(35) e a 186.434× em Tribonacci f(30), ao custo de 2,4 KiB e
1,4 KiB de cache. Na árvore de Tribonacci f(7), o cache reduz as invocações de 46 para 16, evitando
**30 chamadas recursivas**.

**Palavras-chave:** recursão; memoização; árvore de chamadas; subproblemas sobrepostos; Fibonacci;
Tribonacci.

> **Para apresentar:** o material projetado é [`docs/relatorio.html`](docs/relatorio.html), gerado
> por `pnpm relatorio`. Para rodar a aplicação e informar o seu próprio n, veja o
> [Apêndice A](#apêndice-a--como-executar).

---

## Sumário

1. [Introdução](#1-introdução)
2. [Fundamentação teórica](#2-fundamentação-teórica)
3. [Implementação e metodologia](#3-implementação-e-metodologia)
4. [Resultados](#4-resultados)
5. [Discussão](#5-discussão)
6. [A explicação pedida: o cache no Tribonacci f(7)](#6-a-explicação-pedida-o-cache-no-tribonacci-f7)
7. [Conclusão](#7-conclusão)
8. [Apêndice A — Como executar](#apêndice-a--como-executar)
9. [Apêndice B — Mapa do repositório](#apêndice-b--mapa-do-repositório)
10. [Referências](#referências)

---

## 1. Introdução

### 1.1 Enunciado

> **PRJ.ED.1.** Desenvolva um programa que efetue o cálculo recursivo, com cache e sem cache, das
> seguintes sequências numéricas:
>
> a) Fatorial: f(n) = n · f(n−1), com f(0) = f(1) = 1
> b) Fibonacci: f(n) = f(n−1) + f(n−2), com f(0) = f(1) = 1
> c) Tribonacci: f(n) = f(n−1) + f(n−2) + f(n−3), com f(0) = f(1) = f(2) = 1
>
> Para cada caso, compare o desempenho, em tempo e memória, para os casos com e sem a utilização de
> cache. Além disso, o seu programa deve exibir a árvore de chamadas para os casos sem a utilização
> de cache.
>
> Explique (na sua apresentação e não no código), para o caso da sequência de Tribonacci, como um
> cache evita chamadas recursivas repetidas. Nesse caso, desenhe a árvore de chamadas para f(7) e
> diga quantas chamadas recursivas são evitadas.

### 1.2 Objetivos

**Geral:** comparar, em tempo e memória, versões recursivas com e sem cache de três sequências com
estruturas de recursão diferentes — linear, dupla e tripla.

**Específicos:**

- implementar cada sequência nas versões sem cache e com cache (memoização);
- exibir a árvore de chamadas das versões sem cache;
- medir invocações, tempo, profundidade da pilha e memória retida pelo cache para vários n;
- deduzir fórmulas fechadas para o número de invocações e confrontá-las com as medições;
- explicar, com a árvore de Tribonacci f(7), como o cache evita chamadas repetidas e quantas evita.

### 1.3 Onde cada pedido do enunciado é respondido

| Pedido do enunciado                                | Neste documento  | No relatório projetado |
| -------------------------------------------------- | ---------------- | ---------------------- |
| Calcular as três sequências, com e sem cache       | seções 2.2 e 3.2 | seções 1 e 2           |
| Exibir a árvore de chamadas **sem cache**          | seções 3.3 e 6.1 | seção 3                |
| Comparar desempenho em **tempo e memória**         | seção 4          | seção 4                |
| Explicar o cache no Tribonacci e **quantas** evita | seção 6          | seção 5                |

---

## 2. Fundamentação teórica

### 2.1 Recursão e árvore de chamadas

Um problema é recursivo quando uma instância contém instâncias menores do mesmo problema
(CARVALHO, 2024). A solução
combina um **caso base**, resolvido diretamente, com **chamadas recursivas** sobre instâncias
reduzidas. A execução pode ser representada por uma **árvore de chamadas**: cada nó é uma invocação
f(k) e seus filhos são as invocações que ela dispara. A forma dessa árvore depende de quantas
chamadas recursivas cada nível faz, e é ela que decide tudo o que vem a seguir:

| Sequência  | Chamadas por nível      | Forma da árvore                        |
| ---------- | ----------------------- | -------------------------------------- |
| Fatorial   | 1 (recursão **linear**) | uma corrente: f(n) → f(n−1) → … → f(1) |
| Fibonacci  | 2 (recursão **dupla**)  | árvore binária                         |
| Tribonacci | 3 (recursão **tripla**) | árvore ternária                        |

### 2.2 As três sequências

Os casos base são exatamente os do enunciado. Isso importa: com f(0) = f(1) = 1, o Fibonacci começa
em 1, 1, 2, 3, 5 e não em 0, 1, 1, 2, 3, e os valores ficam deslocados em relação à convenção mais
comum. Com essa definição, **Tribonacci f(7) = 31**.

**Tabela 1 — Primeiros termos.**

| n          |   0 |   1 |   2 |   3 |   4 |   5 |   6 |     7 |      8 |       9 |        10 |
| ---------- | --: | --: | --: | --: | --: | --: | --: | ----: | -----: | ------: | --------: |
| Fatorial   |   1 |   1 |   2 |   6 |  24 | 120 | 720 | 5.040 | 40.320 | 362.880 | 3.628.800 |
| Fibonacci  |   1 |   1 |   2 |   3 |   5 |   8 |  13 |    21 |     34 |      55 |        89 |
| Tribonacci |   1 |   1 |   1 |   3 |   5 |   9 |  17 |    31 |     57 |     105 |       193 |

O Fibonacci cresce assintoticamente como φⁿ, com φ = (1 + √5)/2 ≈ 1,618, a razão áurea (GRAHAM;
KNUTH; PATASHNIK, 1994). O Tribonacci, nome dado por Feinberg (1963), cresce como τⁿ, em que
τ ≈ 1,839 é a **constante de Tribonacci**, raiz real de x³ = x² + x + 1.

### 2.3 Convenção de contagem

Todo o trabalho usa a mesma convenção, também adotada pela interface e pela linha de comando:

- **Invocação** é qualquer chamada da função: a raiz, os casos base e os acertos de cache contam.
  Um acerto é uma chamada de verdade — entra na pilha, consulta o dicionário e retorna. É barato,
  mas não é de graça.
- **Chamadas recursivas** = invocações − 1 (tudo menos a raiz).
- Dentro da função a ordem é: **caso base, depois cache, depois cálculo**. Casos base não entram no
  cache, porque devolver 1 já é mais barato que consultar.
- Vale sempre: `invocações = casos base + calculados + acertos`.

### 2.4 Número de invocações sem cache

Seja C(n) o total de invocações de f(n) sem cache. Cada invocação conta a si mesma mais as dos
filhos.

**Fatorial.** Há um filho por nível, então **C(n) = n** (para n ≥ 1): crescimento linear.

**Fibonacci e Tribonacci.** Nessas duas, todo caso base devolve 1 e todo nó calculado apenas **soma**
os filhos. Logo **f(n) é igual ao número de folhas da árvore**. Além disso, as árvores são cheias:
todo nó calculado do Fibonacci tem 2 filhos e todo nó calculado do Tribonacci tem 3. Numa árvore
k-ária cheia com L folhas há (L − 1)/(k − 1) nós internos, o que dá:

$$
C_{\text{Fib}}(n) = 2f(n) - 1 = \Theta(\varphi^n)
\qquad\qquad
C_{\text{Trib}}(n) = \frac{3f(n) - 1}{2} = \Theta(\tau^n)
$$

Exemplo: em Tribonacci f(7) = 31 há 31 folhas, e C(7) = (3 · 31 − 1)/2 = **46 invocações**, que é
exatamente o que o programa conta.

### 2.5 Número de invocações com cache

Com memoização, cada argumento que não é caso base é **calculado uma única vez**; toda ocorrência
posterior é um acerto e retorna na hora. Chamando de _a_ a aridade (filhos por nó calculado) e de
_b_ o maior caso base, há n − b argumentos calculados, cada um disparando _a_ filhos, mais a
invocação da raiz:

$$
C^{c}(n) = 1 + a\,(n - b)
$$

| Sequência  | Argumentos calculados | Invocações com cache      | Entradas no cache | Complexidade |
| ---------- | --------------------- | ------------------------- | ----------------- | ------------ |
| Fatorial   | 2, …, n               | **n** (igual a sem cache) | n − 1             | Θ(n)         |
| Fibonacci  | 2, …, n               | 1 + 2(n − 1) = **2n − 1** | n − 1             | Θ(n)         |
| Tribonacci | 3, …, n               | 1 + 3(n − 2) = **3n − 5** | n − 2             | Θ(n)         |

O cache transforma crescimento **exponencial em linear** no Fibonacci e no Tribonacci, e **não muda
nada** no fatorial. O cache só é eficaz quando há chamadas com argumentos repetidos — os
**subproblemas sobrepostos**, que são também a condição que caracteriza a programação dinâmica
(CORMEN _et al._, 2012). O fatorial não os tem: cada k! aparece uma única vez na recursão.

### 2.6 Memória: pilha de execução × heap

A memória de uma função recursiva tem duas partes, e confundi-las é o erro mais comum ao falar de
cache:

- **Pilha de execução.** Cada invocação ativa ocupa um quadro até retornar. O pico é proporcional à
  **profundidade máxima** da árvore, não ao total de invocações, porque a árvore é percorrida em
  profundidade e os quadros são liberados na volta. A profundidade é **n** no fatorial e no
  Fibonacci e **n − 1** no Tribonacci — e é **igual com e sem cache**, porque a primeira descida
  pelo ramo mais à esquerda é idêntica nas duas versões.
- **Heap.** A versão sem cache não guarda nada entre invocações. A versão com cache mantém Θ(n)
  entradas. Em bytes o custo depende do tamanho dos valores: os termos do Fibonacci e do Tribonacci
  têm Θ(n) bits, e os do fatorial, Θ(n log n) bits — por isso o cache do fatorial fica caro.

**Tabela 2 — Resumo da complexidade** (contando invocações).

| Sequência  | Tempo sem cache | Tempo com cache | Pilha (ambas) | Heap sem cache | Heap com cache |
| ---------- | --------------- | --------------- | ------------- | -------------- | -------------- |
| Fatorial   | Θ(n)            | Θ(n)            | Θ(n)          | O(1)           | Θ(n) entradas  |
| Fibonacci  | Θ(φⁿ)           | Θ(n)            | Θ(n)          | O(1)           | Θ(n) entradas  |
| Tribonacci | Θ(τⁿ)           | Θ(n)            | Θ(n)          | O(1)           | Θ(n) entradas  |

O cache é uma **troca de espaço por tempo**: muito vantajosa quando elimina recomputação, e
desvantajosa quando não há o que reaproveitar.

### 2.7 Memoização

O termo **memoização** foi cunhado por Michie (1968) para funções que "lembram" resultados já
calculados. O esquema, seguido pelas implementações deste trabalho, é:

```ts
function tribonacci(n, cache) {
  if (n <= 2) return 1n; // caso base: responde direto, não consulta nem grava
  const guardado = cache.get(n);
  if (guardado !== undefined) return guardado; // acerto: responde sem recursão
  const valor = tribonacci(n - 1, cache) + tribonacci(n - 2, cache) + tribonacci(n - 3, cache);
  cache.set(n, valor); // primeira ocorrência: calcula e guarda
  return valor;
}
```

Memoização é a forma **de cima para baixo** da programação dinâmica: a recursão continua, e só os
subproblemas que realmente aparecem são calculados. A forma de baixo para cima preenche uma tabela
de 0 até n com um laço, sem pilha. O enunciado pede recursão, então usamos memoização.

---

## 3. Implementação e metodologia

### 3.1 Organização

O projeto é um monorepo em TypeScript. O contrato é o centro: interface, API e linha de comando
falam pelos mesmos tipos e pelos mesmos schemas, validados em tempo de execução.

| Pacote              | Papel                                                                     |
| ------------------- | ------------------------------------------------------------------------- |
| `packages/contrato` | Schemas Zod, tipos, limites de n e as descrições das três sequências      |
| `packages/nucleo`   | Os algoritmos: versões puras e instrumentadas, árvore e estimativas       |
| `apps/api`          | Fastify: cálculo, medições em `worker_threads`, árvore e o relatório      |
| `apps/web`          | React + Vite: telas para informar o n e ver métricas, árvore e comparação |
| `apps/cli`          | Execução por terminal                                                     |

### 3.2 Duas versões de cada algoritmo

Cada sequência existe em duas versões dentro de `packages/nucleo`:

- **Pura**: só calcula. Não conta, não monta árvore, não olha memória. **É a única cronometrada.**
- **Instrumentada**: conta invocações, separa casos base, acertos e cálculos, registra a
  profundidade e, quando pedido, monta a árvore.

Cronometrar a instrumentada mediria o custo da instrumentação, não o do algoritmo. Por isso as duas
existem, e por isso as contagens e os tempos saem de execuções diferentes.

Os valores são `bigint`, porque passam do inteiro seguro do JavaScript (2⁵³ − 1): o fatorial estoura
em n = 19, o Tribonacci em n = 62 e o Fibonacci em n = 78. Com `number` o erro seria silencioso — a
tela mostraria um número arredondado com cara de certo. Como `JSON.stringify` não serializa
`bigint`, os valores trafegam como texto decimal.

### 3.3 A árvore de chamadas

A versão instrumentada monta a árvore durante a própria execução, guardando em cada nó o argumento,
o valor, a profundidade e o tipo (`base`, `calculado` ou `acerto_cache`). A árvore é exibida de três
formas: em texto indentado na linha de comando e no relatório, em SVG interativo na tela `/arvore`, e
em SVG estático no relatório projetado.

Árvores sem cache crescem rápido demais para caber na tela, então a API aceita um **orçamento de
nós** (padrão 300). Quando a árvore passa disso, o nó cortado ganha o campo `descendentes_ocultos` e
a resposta vem com `truncada: true`, mas **nenhum número fica errado**: as métricas são calculadas
sem montar a árvore inteira. Some o desenho, não some a contagem.

### 3.4 Protocolo de medição

| Decisão                         | Justificativa                                                                                                                             |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| **Relógio**                     | `process.hrtime.bigint()`: monotônico, em nanossegundos, sem perda de precisão.                                                           |
| **Aquecimento**                 | Cada função roda algumas vezes com o resultado descartado, para o JIT do V8 já ter otimizado antes da primeira medição.                   |
| **Lote por repetição**          | Casos rápidos (f(7) com cache leva ~300 ns) são executados em laço até o bloco passar de 200 ms, e divide-se pelo número de execuções.    |
| **Mediana**                     | O número oficial é a mediana de 5 repetições. Uma pausa do coletor de lixo desloca a média e quase não mexe na mediana.                   |
| **Cache vazio sempre**          | O dicionário nasce e morre dentro de cada execução. Se sobrevivesse, a segunda repetição mediria o histórico, não o algoritmo.            |
| **Ordem alternada**             | A ordem dos dois modos alterna entre as rodadas, para o aquecimento não favorecer sempre o mesmo lado. A ordem usada volta na resposta.   |
| **Memória em execução à parte** | Amostrar memória custa tempo. O bloco de memória roda depois do de tempo, nunca junto.                                                    |
| **Memória retida**              | Diferença de `heapUsed` entre duas coletas de lixo, com o cache ainda referenciado. A segunda coleta tira o lixo temporário dos `bigint`. |
| **Isolamento**                  | Cada comparação roda num `worker_thread` próprio, um de cada vez, com pilha ampliada e prazo.                                             |

As **contagens** (invocações, casos base, acertos, entradas, profundidade) são exatas e repetíveis:
dão o mesmo número em qualquer máquina. As **medidas** (tempo, memória) dependem do computador. Por
isso as duas aparecem sempre lado a lado: a contagem prova o argumento, a medida ilustra o efeito.

### 3.5 Limitações assumidas

- Os quadros da pilha ficam **fora do heap**, então a memória da recursão profunda não aparece em
  `heapUsed`. Por isso a profundidade máxima é reportada ao lado, sempre.
- O coletor de lixo não é determinista: duas execuções idênticas podem dar bytes diferentes. Em n
  pequeno isso chega a produzir diferença negativa, como o −152 B do Tribonacci n = 10 na rodada
  registrada.
- Operações com `bigint` geram lixo temporário, porque `bigint` é imutável.
- O relógio mede a máquina, não só o algoritmo.

Em uma frase: **cada medida é repetida, reporta-se a mediana com a dispersão ao lado, e toda medida
aparece junto das contagens exatas.** Se o tempo medido contar uma história diferente da contagem de
invocações, a contagem é que está certa.

### 3.6 Ambiente da execução de referência

Intel Core i5-1035G1 (8 núcleos lógicos), 14,89 GiB de RAM, Linux x64, Node 22.22.1, V8
12.4.254.21-node.35, com `--expose-gc`. Rodada de 28/09/2026, registrada por inteiro em
[`docs/resultados-benchmark.md`](docs/resultados-benchmark.md), inclusive com média, mínimo, máximo
e desvio padrão de cada medição.

---

## 4. Resultados

Os números abaixo são os da rodada de referência. O tempo é a mediana de 5 repetições, com o cache
vazio a cada execução.

**Tabela 3 — Fatorial.** f(n) = n · f(n−1), com f(0) = f(1) = 1.

|     n | f(n)           | Invocações sem cache | Invocações com cache | Tempo sem cache | Tempo com cache | Aceleração | Profundidade | Entradas | Memória do cache |
| ----: | -------------- | -------------------: | -------------------: | --------------: | --------------: | ---------: | -----------: | -------: | ---------------: |
|    10 | 3.628.800      |                   10 |                   10 |          274 ns |          645 ns |      0,42× |           10 |        9 |            960 B |
|   100 | 158 dígitos    |                  100 |                  100 |         7,58 µs |        10,34 µs |      0,73× |          100 |       99 |          8,1 KiB |
|   500 | 1.135 dígitos  |                  500 |                  500 |        61,35 µs |        78,07 µs |      0,79× |          500 |      499 |        128,1 KiB |
| 1.000 | 2.568 dígitos  |                1.000 |                1.000 |       189,81 µs |       228,68 µs |      0,83× |        1.000 |      999 |        523,7 KiB |
| 2.500 | 7.412 dígitos  |                2.500 |                2.500 |         1,02 ms |         1,23 ms |      0,83× |        2.500 |    2.499 |         3,56 MiB |
| 5.000 | 16.326 dígitos |                5.000 |                5.000 |         4,06 ms |         4,79 ms |      0,85× |        5.000 |    4.999 |        15,40 MiB |

**Tabela 4 — Fibonacci.** f(n) = f(n−1) + f(n−2), com f(0) = f(1) = 1.

|   n | f(n)       | Invocações sem cache | Invocações com cache | Chamadas evitadas | Tempo sem cache | Tempo com cache | Aceleração | Profundidade | Entradas | Memória do cache |
| --: | ---------- | -------------------: | -------------------: | ----------------: | --------------: | --------------: | ---------: | -----------: | -------: | ---------------: |
|  10 | 89         |                  177 |                   19 |               158 |         1,06 µs |          494 ns |      2,14× |           10 |        9 |            960 B |
|  15 | 987        |                1.973 |                   29 |             1.944 |        11,73 µs |          647 ns |      18,1× |           15 |       14 |            648 B |
|  20 | 10.946     |               21.891 |                   39 |            21.852 |       132,96 µs |         1,11 µs |       119× |           20 |       19 |          1,2 KiB |
|  25 | 121.393    |              242.785 |                   49 |           242.736 |         1,46 ms |         1,28 µs |     1.136× |           25 |       24 |          1,3 KiB |
|  30 | 1.346.269  |            2.692.537 |                   59 |         2.692.478 |        15,97 ms |         1,46 µs |    10.921× |           30 |       29 |          1,4 KiB |
|  35 | 14.930.352 |           29.860.703 |                   69 |        29.860.634 |       183,11 ms |         2,15 µs |    85.324× |           35 |       34 |          2,4 KiB |

**Tabela 5 — Tribonacci.** f(n) = f(n−1) + f(n−2) + f(n−3), com f(0) = f(1) = f(2) = 1.

|   n | f(n)       | Invocações sem cache | Invocações com cache | Chamadas evitadas | Tempo sem cache | Tempo com cache | Aceleração | Profundidade | Entradas | Memória do cache |
| --: | ---------- | -------------------: | -------------------: | ----------------: | --------------: | --------------: | ---------: | -----------: | -------: | ---------------: |
|   7 | 31         |                   46 |                   16 |                30 |          267 ns |          295 ns |      0,91× |            6 |        5 |            640 B |
|  10 | 193        |                  289 |                   25 |               264 |         1,69 µs |          398 ns |      4,24× |            9 |        8 |            280 B |
|  15 | 4.063      |                6.094 |                   40 |             6.054 |        34,07 µs |          768 ns |      44,4× |           14 |       13 |            624 B |
|  20 | 85.525     |              128.287 |                   55 |           128.232 |       713,88 µs |         1,26 µs |       567× |           19 |       18 |          1,2 KiB |
|  25 | 1.800.281  |            2.700.421 |                   70 |         2.700.351 |        15,74 ms |         1,51 µs |    10.412× |           24 |       23 |          1,3 KiB |
|  30 | 37.895.489 |           56.843.233 |                   85 |        56.843.148 |       319,49 ms |         1,71 µs |   186.434× |           29 |       28 |          1,4 KiB |

No fatorial a coluna de chamadas evitadas é sempre **zero**, e por isso foi omitida da Tabela 3.

**Figura 1 — Invocações por n, com o eixo vertical em escala logarítmica.** É a medida exata: não
depende de máquina nenhuma. Uma reta subindo no eixo logarítmico é a assinatura do crescimento
exponencial.

![Três gráficos de invocações por n. No fatorial as duas linhas se sobrepõem. No Fibonacci e no Tribonacci a linha sem cache sobe em reta e a linha com cache fica quase horizontal](docs/figuras/grafico-invocacoes.svg)

**Figura 2 — Tempo mediano de uma chamada f(n), eixo vertical logarítmico.**

![Três gráficos de tempo por n. No fatorial as duas linhas quase se tocam, com a linha com cache ligeiramente acima. No Fibonacci e no Tribonacci a linha sem cache sobe em reta até centenas de milissegundos e a linha com cache permanece perto de 1 microssegundo](docs/figuras/grafico-tempo.svg)

**Figura 3 — Memória retida pelo cache, eixo vertical linear.** A versão sem cache não retém nada; o
que aparece nela é ruído do coletor de lixo, de algumas centenas de bytes.

![Três gráficos de memória por n. No fatorial a linha com cache sobe até mais de 15 MiB; no Fibonacci e no Tribonacci ela fica na casa de 1 a 2 KiB](docs/figuras/grafico-memoria.svg)

---

## 5. Discussão

### 5.1 Fatorial: o cache não ajuda uma execução isolada

As invocações com e sem cache são **idênticas** (n) em todos os n medidos, como previsto na seção
2.5. Sem subproblemas repetidos, o cache não evita nenhuma chamada. O resultado é um tempo **maior**
com cache em todos os n medidos — 18% em n = 5.000 e 138% em n = 10, ou seja, aceleração de 0,85× a
0,42× —, por causa do custo de consultar e gravar, além de **15,40 MiB** de memória extra em
n = 5.000. Guardar os 4.999 intermediários sai caro porque os valores do fatorial são enormes: em
média cerca de 3,2 KiB por entrada, contra dezenas de bytes no Fibonacci.

Isso não é falha da medição: é o resultado certo, e é ele que ensina o critério. O cache do fatorial
só compensaria se o mesmo dicionário sobrevivesse a vários pedidos — um serviço que responde f(1000),
depois f(900) e de novo f(1000). Optamos por não fazer isso, porque um cache compartilhado mediria o
histórico de cliques e não o algoritmo.

### 5.2 Fibonacci e Tribonacci: de exponencial para linear

- **Invocações.** As contagens medidas coincidem exatamente com as fórmulas fechadas: 2f(n) − 1 e
  (3f(n) − 1)/2 sem cache; 2n − 1 e 3n − 5 com cache. A razão entre contagens consecutivas
  (n → n + 5) confirma as taxas de crescimento: 2.692.537 / 242.785 = **11,09**, igual a φ⁵ ≈ 11,09;
  e 56.843.233 / 2.700.421 = **21,05**, igual a τ⁵ ≈ 21,05.
- **Tempo.** Nas Figuras 1 e 2, a linha sem cache é uma **reta** no eixo logarítmico. A linha com
  cache fica praticamente plana, entre 0,3 e 2,2 µs em toda a faixa medida. A aceleração passa de
  85.000× em Fibonacci f(35) e de 186.000× em Tribonacci f(30).
- **n pequeno.** Em Tribonacci n = 7 o cache é **mais lento** (0,91×). A árvore é tão pequena que as
  30 chamadas evitadas custam menos que criar e consultar o dicionário. O cache só compensa quando o
  trabalho repetido supera seu custo fixo — o que, aqui, acontece já em n = 10 (4,24×).
- **Tribonacci × Fibonacci.** Em n = 25 o Tribonacci sem cache já faz mais invocações (2,7 milhões)
  que o Fibonacci em n = 30. É consequência de τ ≈ 1,839 > φ ≈ 1,618: cada filho a mais por nível
  aumenta a base da exponencial.

### 5.3 Memória

- **Pilha.** A profundidade máxima é **a mesma com e sem cache** em todas as linhas das Tabelas 3 a 5. O cache não reduz o pico de pilha, porque a primeira descida pelo ramo mais à esquerda é
  idêntica nas duas versões. O que muda é quantas vezes a pilha sobe e desce, não a altura máxima. O
  risco de estouro de pilha, portanto, **não é resolvido pelo cache**.
- **Heap.** O cache ocupa memória proporcional a n: cerca de 1 a 2 KiB no Fibonacci e no Tribonacci
  em toda a faixa medida, e muito mais no fatorial, cujos valores crescem depressa.
- **Balanço.** No Fibonacci e no Tribonacci, 1 a 2 KiB compram uma redução de quatro a cinco ordens
  de grandeza no tempo. É uma troca excelente. No fatorial, gasta-se memória sem ganho algum.

### 5.4 O limite prático da versão sem cache

A versão sem cache do Tribonacci é limitada a n = 30 na API justamente porque ali ela já leva cerca
de 320 ms e faz 56,8 milhões de invocações. Cada unidade a mais em n multiplica esse trabalho por
≈ 1,84; em n = 50 seriam 11,2 trilhões de invocações, cerca de **17 horas** de processamento ao
custo por invocação medido em n = 30. Com cache, o mesmo n = 50 custa 145 invocações. A recursão com
cache fica limitada apenas pela profundidade da pilha, e não mais pelo tempo.

---

## 6. A explicação pedida: o cache no Tribonacci f(7)

Esta seção responde ao último parágrafo do enunciado.

### 6.1 A árvore de chamadas de f(7) sem cache

Sem cache, f(7) dispara **46 invocações** (1 raiz + 45 recursivas), com 31 folhas — uma para cada
unidade de f(7) = 31. Na figura, cada nó é uma invocação e a cor indica o que aconteceria com aquela
chamada **se o cache estivesse ligado**.

**Figura 4 — Árvore de chamadas de Tribonacci f(7) sem cache.** Azul: calculada pela primeira vez.
Branco com borda: caso base. Laranja: viraria acerto de cache. Apagado: seria evitada.

![Árvore de chamadas de Tribonacci f(7) com 46 nós: 5 azuis no ramo mais à esquerda, 6 casos base, 5 laranja e 30 nós apagados nas subárvores abaixo dos laranja](docs/figuras/arvore-tribonacci-f7.svg)

Contagens da árvore:

| O que contamos                          | Quantidade                |
| --------------------------------------- | ------------------------- |
| Invocações (nós da árvore)              | 46                        |
| Chamadas recursivas (tudo menos a raiz) | 45                        |
| Nós calculados (executaram a fórmula)   | 15                        |
| Casos base (folhas)                     | 31                        |
| Profundidade máxima da pilha            | 6 quadros (f(7) até f(2)) |

**Tabela 6 — Invocações por argumento, sem cache.**

| Argumento  | f(7) | f(6) | f(5) | f(4) | f(3) | f(2) | f(1) | f(0) | Total |
| ---------- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ----: |
| Invocações |    1 |    1 |    2 |    4 |    7 |   13 |   11 |    7 |    46 |

A tabela mostra o desperdício: **f(3) é calculado 7 vezes e f(4), 4 vezes**, sempre com o mesmo
resultado. Cada cálculo de f(3) custa 4 invocações; cada um de f(4) custa 7.

### 6.2 Como o cache evita as chamadas repetidas

O mecanismo tem duas etapas, e elas acontecem na ordem em que a recursão executa:

1. **Na descida, cada argumento é calculado uma vez.** f(7) chama f(6), que chama f(5), f(4), f(3),
   até os casos base f(2), f(1), f(0). Nesse ramo mais à esquerda cada argumento aparece pela
   primeira vez: é calculado e guardado. São **5 cálculos**, um para cada argumento de 3 a 7.
2. **Na volta, os irmãos já estão no cache.** Depois de calcular f(3), a chamada f(4) ainda precisa
   de f(2) e f(1), que são casos base e respondem direto. Mas f(5) pede f(3), que já está guardado:
   é o **primeiro acerto**. O mesmo acontece em f(6), que pede f(4) e f(3), e em f(7), que pede f(5)
   e f(4). São **5 acertos** no total.

A chave está no que um acerto **não** faz: ele devolve o valor guardado e **não visita nenhum
filho**. Cada acerto em f(k), portanto, apaga a subárvore inteira que estaria abaixo dele — as
C(k) − 1 invocações da subárvore de f(k).

**Tabela 7 — Chamadas evitadas por acerto.** Os tamanhos de subárvore são os da árvore da seção 6.1.

| Acerto    | Onde ocorre    | Tamanho da subárvore C(k) | Evita C(k) − 1 |
| --------- | -------------- | ------------------------: | -------------: |
| f(5)      | dentro de f(7) |                        13 |             12 |
| f(4)      | dentro de f(6) |                         7 |              6 |
| f(4)      | dentro de f(7) |                         7 |              6 |
| f(3)      | dentro de f(5) |                         4 |              3 |
| f(3)      | dentro de f(6) |                         4 |              3 |
| **Total** |                |                           |         **30** |

### 6.3 A árvore que o cache realmente executa

Com cache, a árvore encolhe para 16 nós. É o que o programa imprime:

```text
 1  f(7) = 31  [calculado]
 2    f(6) = 17  [calculado]
 3      f(5) = 9  [calculado]
 4        f(4) = 5  [calculado]
 5          f(3) = 3  [calculado]
 6            f(2) = 1  [base]
 7            f(1) = 1  [base]
 8            f(0) = 1  [base]
 9          f(2) = 1  [base]
10          f(1) = 1  [base]
11        f(3) = 3  [acerto de cache]
12        f(2) = 1  [base]
13      f(4) = 5  [acerto de cache]
14      f(3) = 3  [acerto de cache]
15    f(5) = 9  [acerto de cache]
16    f(4) = 5  [acerto de cache]
```

| O que contamos               | Quantidade                           |
| ---------------------------- | ------------------------------------ |
| Invocações                   | 16                                   |
| Nós calculados               | 5 (f(3) a f(7))                      |
| Acertos de cache             | 5                                    |
| Casos base                   | 6                                    |
| Entradas no cache ao final   | 5                                    |
| Profundidade máxima da pilha | 6 quadros (igual à versão sem cache) |

Confere com a convenção da seção 2.3: 5 + 5 + 6 = 16. E confere com a fórmula da seção 2.5:
3n − 5 = 3 · 7 − 5 = 16.

### 6.4 Resposta

> **Com cache, Tribonacci f(7) faz 16 invocações em vez de 46: são evitadas 30 chamadas recursivas,
> ou 65% do total.** As 16 restantes são 5 cálculos (um por argumento de 3 a 7), 5 acertos de cache
> e 6 casos base.

A conta fecha de três maneiras independentes, e as três dão 30:

- **Pela diferença de invocações:** 46 − 16 = 30.
- **Pelas chamadas recursivas:** 45 − 15 = 30. A raiz existe nos dois modos, então a diferença é a
  mesma se contarmos só as recursivas — a resposta ao enunciado não depende dessa escolha.
- **Pela soma das subárvores podadas:** 12 + 6 + 6 + 3 + 3 = 30 (Tabela 7).

Em geral, para Tribonacci f(n), o número de chamadas evitadas é:

$$
E(n) = \underbrace{\frac{3f(n) - 1}{2}}_{\text{sem cache}} - \underbrace{(3n - 5)}_{\text{com cache}}
\qquad\Rightarrow\qquad E(7) = 46 - 16 = 30
$$

Para n = 30, por exemplo, são evitadas 56.843.233 − 85 = **56.843.148** chamadas.

---

## 7. Conclusão

As três sequências mostram que o valor do cache depende da **estrutura da recursão**, não do tamanho
de n:

1. **Recursão linear (fatorial).** Não há argumentos repetidos, e o cache não evita nenhuma chamada.
   Ele deixa a execução mais lenta em todos os n medidos — 18% em n = 5.000, mais que o dobro em
   n = 10 — e consome memória proporcional a n, 15,40 MiB em n = 5.000. Mostrar esse caso, em que a
   própria otimização não serve para nada, é o que dá sentido ao critério.
2. **Recursão múltipla (Fibonacci e Tribonacci).** Os subproblemas se sobrepõem, e o número de
   invocações cai de Θ(φⁿ) e Θ(τⁿ) para Θ(n). A aceleração chega a cinco ordens de grandeza já em
   n = 30–35, por 1 a 2 KiB de memória.
3. **A pilha não muda.** A profundidade máxima é a mesma nas duas versões, em todas as medições. O
   cache economiza chamadas, não altura de pilha.

A árvore de Tribonacci f(7) sintetiza o mecanismo: cada argumento é calculado uma vez na descida, e
cada repetição vira um acerto que poda a subárvore inteira abaixo dele. 46 invocações caem para 16,
**evitando 30 chamadas recursivas**.

---

## Apêndice A — Como executar

### A.1 Com Docker, sem instalar nada

```bash
docker compose up --build
```

- Interface: <http://localhost:8080>
- API: <http://localhost:3333>

O Compose sobe os dois serviços: a API (back) e a interface servida por nginx (front). A interface só
começa depois que o healthcheck da API responde.

### A.2 Sem Docker

Pré-requisitos: Node 22 e pnpm 10 (`corepack enable`).

```bash
pnpm install
pnpm dev
```

- Interface: <http://localhost:5173>
- API: <http://localhost:3333/api/saude>
- Documentação OpenAPI: <http://localhost:3333/docs>

### A.3 Informando o seu próprio n

As telas aceitam qualquer n dentro dos limites, tanto pelo campo na tela quanto pelo endereço — então
qualquer estado pode ser aberto pronto ou compartilhado por link:

| Tela                | Endereço        | O que mostra                                                      |
| ------------------- | --------------- | ----------------------------------------------------------------- |
| Início              | `/`             | O problema, as três sequências e os caminhos para as outras telas |
| Calcular            | `/calcular`     | Valor e métricas de uma execução: invocações, acertos, casos base |
| Comparar desempenho | `/comparar`     | Os dois modos lado a lado, em tempo, memória e chamadas evitadas  |
| Árvore de chamadas  | `/arvore`       | A árvore da execução, com casos base, cálculos e acertos de cache |
| Modo apresentação   | `/apresentacao` | Tribonacci f(7) nos dois modos em uma tela só, para o projetor    |

```text
/calcular?sequencia=tribonacci&n=7&modo=sem_cache
/arvore?sequencia=fibonacci&n=10&modo=com_cache
/comparar?sequencia=fatorial&n=1000
```

Os parâmetros são `sequencia` (`fatorial`, `fibonacci` ou `tribonacci`), `n` (inteiro não negativo) e
`modo` (`sem_cache` ou `com_cache`).

**Limites de n.** Sem cache o custo é exponencial, então há um teto por sequência e modo, validado
antes de executar: no Node, Tribonacci aceita até 30 sem cache e 5.000 com cache; Fibonacci, 35 e
5.000; fatorial, 5.000 nos dois modos. Acima de um milhão de invocações previstas, a interface avisa
e pede confirmação antes de medir — a previsão vem da fórmula fechada, sem rodar nada.

### A.4 Pela linha de comando

```bash
pnpm cli tribonacci 7 --modo sem_cache --arvore
pnpm cli fibonacci 10 --modo com_cache
```

Imprime o valor, as métricas, as invocações por argumento e, com `--arvore`, a árvore em texto
indentado. Opções: `--modo sem_cache|com_cache`, `--arvore`, `--limite-nos <n>` (padrão 300),
`--json` e `--ajuda`.

### A.5 Regerando o relatório e as figuras

```bash
pnpm relatorio
```

Roda a bateria completa de medições (cerca de um minuto e meio) e reescreve
[`docs/relatorio.html`](docs/relatorio.html), [`docs/resultados-benchmark.md`](docs/resultados-benchmark.md)
e os quatro SVGs de `docs/figuras/`. **Rode na véspera da apresentação, na máquina que será usada**,
para que os tempos do relatório sejam os daquela máquina. As contagens não mudam.

---

## Apêndice B — Mapa do repositório

```
packages/contrato   schemas Zod, tipos e limites compartilhados
packages/nucleo     algoritmos puros e instrumentados (TypeScript puro, sem dependências)
apps/api            Fastify: cálculo, medições em worker_threads, árvore e relatório
apps/web            React + Vite: telas, árvore em SVG, modo apresentação
apps/cli            execução por terminal
docs/               relatório projetado, roteiro da aula, medições e decisões
```

Cada app e pacote tem um README próprio, com o mapa dos arquivos e como rodar e testar:
[`packages/contrato`](packages/contrato/README.md), [`packages/nucleo`](packages/nucleo/README.md),
[`apps/api`](apps/api/README.md), [`apps/web`](apps/web/README.md) e
[`apps/cli`](apps/cli/README.md).

### Qualidade

```bash
pnpm lint          # ESLint
pnpm format:check  # Prettier
pnpm typecheck     # tsc --noEmit em todos os pacotes
pnpm test          # Vitest em todos os pacotes
pnpm e2e           # Playwright (após instalar navegadores)
pnpm ci:local      # tudo acima, na mesma ordem do CI
```

O mesmo conjunto roda no GitHub Actions a cada envio, junto com a checagem das mensagens de commit.
O versionamento segue Gitflow e Conventional Commits com escopos fixos (`nucleo`, `contrato`, `api`,
`web`, `cli`, `docs`, `infra`, `repo`), validados por hook e pelo CI.

### Documentação

O índice está em [`docs/README.md`](docs/README.md). O documento que interessa para a aula é
[`docs/relatorio.html`](docs/relatorio.html), que vai ao projetor.

---

## Referências

CARVALHO, Fabrício Galende Marques de. **Notas de aula da disciplina estrutura de dados**. São José
dos Campos, 2024.

CORMEN, Thomas H.; LEISERSON, Charles E.; RIVEST, Ronald L.; STEIN, Clifford. **Algoritmos**: teoria
e prática. Tradução da 3. ed. Rio de Janeiro: Elsevier, 2012.

FEINBERG, Mark. Fibonacci-Tribonacci. **The Fibonacci Quarterly**, v. 1, n. 3, p. 71-74, 1963.

GRAHAM, Ronald L.; KNUTH, Donald E.; PATASHNIK, Oren. **Concrete mathematics**: a foundation for
computer science. 2. ed. Reading: Addison-Wesley, 1994.

MICHIE, Donald. "Memo" functions and machine learning. **Nature**, v. 218, p. 19-22, 1968.

NODE.JS. **Node.js v22 documentation**: `perf_hooks`, `process.memoryUsage()`, `v8` e
`worker_threads`. Disponível em: <https://nodejs.org/api/>. Acesso em: 28 set. 2026.
