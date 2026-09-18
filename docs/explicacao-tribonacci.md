# Tribonacci com e sem cache: de 46 chamadas para 16

Este documento explica, com o exemplo Tribonacci f(7), por que a versão com cache faz muito
menos chamadas do que a versão sem cache. É a base conceitual do modo apresentação da interface
(`/apresentacao`) e das respostas às perguntas mais prováveis na defesa do trabalho. O roteiro da
aula está em `docs/roteiro-apresentacao.md` e a forma como o programa mede tempo e memória está
em `docs/metodologia-medicao.md`.

Todos os números daqui foram obtidos desenhando as árvores a partir da definição, contando nó a nó,
e conferidos contra a execução instrumentada do programa. Nenhum valor é ilustrativo.

## Definição usada no trabalho

Tribonacci soma os três termos anteriores:

- f(n) = f(n-1) + f(n-2) + f(n-3), para n ≥ 3
- casos base: f(0) = f(1) = f(2) = 1

Primeiros termos: 1, 1, 1, 3, 5, 9, 17, 31, 57, 105, 193, ... Logo f(7) = 31.

Convenções deste documento (as mesmas de `docs/decisoes.md` e do código):

- Uma **invocação** é qualquer chamada da função: a raiz, os casos base e os acertos de cache
  contam.
- **Chamadas recursivas** = invocações - 1 (tudo menos a raiz).
- Dentro da função a ordem é: caso base, depois cache, depois cálculo. Casos base não entram no
  cache.
- Os filhos de f(n) são visitados na ordem f(n-1), f(n-2), f(n-3). Nas árvores em texto, o filho
  de cima é visitado primeiro.

## 1. O que são subproblemas sobrepostos

A recursão resolve um problema quebrando-o em problemas menores. Para calcular f(7), a função
precisa de f(6), f(5) e f(4). Até aqui, nada de errado. O problema aparece quando olhamos um nível
abaixo:

```text
f(7) precisa de f(6), f(5) e f(4)
f(6) precisa de f(5), f(4) e f(3)
f(5) precisa de f(4), f(3) e f(2)
```

f(5) é pedido por f(7) e também por f(6). f(4) é pedido por f(7), por f(6) e por f(5). O mesmo
subproblema aparece em vários lugares da árvore: são os **subproblemas sobrepostos**.

Sem memória nenhuma, a função não sabe que já resolveu f(5) antes. Ela resolve de novo, do zero,
refazendo toda a subárvore. Quanto maior o n, mais vezes cada subproblema pequeno é repetido.

Compare com o Fatorial: f(7) = 7 · f(6), f(6) = 6 · f(5), e assim por diante. Cada chamada gera uma
única chamada nova. É uma corrente, não uma árvore: cada subproblema aparece uma vez só. Por isso o
Fatorial não tem subproblemas sobrepostos, e o cache não tem nada para evitar nele (a seção 6.4
compara as três sequências).

## 2. A árvore de f(7) sem cache

Cada linha é uma invocação. A indentação mostra quem chamou quem. Os números à esquerda seguem a
ordem em que as chamadas acontecem. `[base]` marca os casos base, que são as folhas da árvore. Para
f(3), f(4) e f(5) indicamos quantas vezes o mesmo cálculo se repete.

```text
 1  f(7) = 31
 2    f(6) = 17
 3      f(5) = 9  (cálculo 1 de 2)
 4        f(4) = 5  (cálculo 1 de 4)
 5          f(3) = 3  (cálculo 1 de 7)
 6            f(2) = 1  [base]
 7            f(1) = 1  [base]
 8            f(0) = 1  [base]
 9          f(2) = 1  [base]
10          f(1) = 1  [base]
11        f(3) = 3  (cálculo 2 de 7)
12          f(2) = 1  [base]
13          f(1) = 1  [base]
14          f(0) = 1  [base]
15        f(2) = 1  [base]
16      f(4) = 5  (cálculo 2 de 4)
17        f(3) = 3  (cálculo 3 de 7)
18          f(2) = 1  [base]
19          f(1) = 1  [base]
20          f(0) = 1  [base]
21        f(2) = 1  [base]
22        f(1) = 1  [base]
23      f(3) = 3  (cálculo 4 de 7)
24        f(2) = 1  [base]
25        f(1) = 1  [base]
26        f(0) = 1  [base]
27    f(5) = 9  (cálculo 2 de 2)
28      f(4) = 5  (cálculo 3 de 4)
29        f(3) = 3  (cálculo 5 de 7)
30          f(2) = 1  [base]
31          f(1) = 1  [base]
32          f(0) = 1  [base]
33        f(2) = 1  [base]
34        f(1) = 1  [base]
35      f(3) = 3  (cálculo 6 de 7)
36        f(2) = 1  [base]
37        f(1) = 1  [base]
38        f(0) = 1  [base]
39      f(2) = 1  [base]
40    f(4) = 5  (cálculo 4 de 4)
41      f(3) = 3  (cálculo 7 de 7)
42        f(2) = 1  [base]
43        f(1) = 1  [base]
44        f(0) = 1  [base]
45      f(2) = 1  [base]
46      f(1) = 1  [base]
```

Contagens da árvore:

| O que contamos                          | Quantidade                |
| --------------------------------------- | ------------------------- |
| Invocações (linhas da árvore)           | 46                        |
| Chamadas recursivas (tudo menos a raiz) | 45                        |
| Nós calculados (executaram a fórmula)   | 15                        |
| Casos base (folhas)                     | 31                        |
| Profundidade máxima da pilha            | 6 quadros (f(7) até f(2)) |

Três observações que servem para conferir a árvore:

- Os casos base valem 1 e são as únicas parcelas da soma final. Logo o número de folhas é igual ao
  valor calculado: 31 folhas, f(7) = 31.
- Todo nó calculado tem exatamente 3 filhos. Numa árvore assim, folhas = 2 · (nós calculados) + 1.
  Com 31 folhas, os nós calculados são (31 - 1) / 2 = 15.
- A profundidade máxima está no caminho mais à esquerda: f(7), f(6), f(5), f(4), f(3), f(2). São
  n - 1 quadros na pilha, ou seja 6 para n = 7.

### Invocações por argumento (sem cache)

| Argumento | Invocações | Tipo      | Valor |
| --------- | ---------- | --------- | ----- |
| f(7)      | 1          | calculado | 31    |
| f(6)      | 1          | calculado | 17    |
| f(5)      | 2          | calculado | 9     |
| f(4)      | 4          | calculado | 5     |
| f(3)      | 7          | calculado | 3     |
| f(2)      | 13         | base      | 1     |
| f(1)      | 11         | base      | 1     |
| f(0)      | 7          | base      | 1     |
| Total     | 46         |           |       |

O que a tabela mostra: **f(3) é calculado 7 vezes e f(4), 4 vezes**, sempre com o mesmo resultado.
Cada cálculo de f(3) custa 4 invocações (ele mais três casos base); cada cálculo de f(4) custa 7.
Esse é o desperdício que o cache elimina.

## 3. O que o cache faz

O cache é um dicionário (`Map<number, bigint>`) que guarda pares "argumento, valor já calculado".
Ele nasce vazio a cada execução e é passado como parâmetro pela recursão. Em forma de esquema (a
implementação oficial está em `packages/nucleo`):

```ts
function tribonacci(n, cache) {
  if (n <= 2) return 1n; // caso base: responde direto, não consulta nem grava o cache
  const guardado = cache.get(n);
  if (guardado !== undefined) return guardado; // acerto de cache: responde sem recursão
  const valor = tribonacci(n - 1, cache) + tribonacci(n - 2, cache) + tribonacci(n - 3, cache);
  cache.set(n, valor); // primeira ocorrência: calcula e guarda
  return valor;
}
```

O comportamento muda conforme o argumento já apareceu ou não:

| Situação                           | O que acontece                                                      | Custo                        |
| ---------------------------------- | ------------------------------------------------------------------- | ---------------------------- |
| Caso base (n ≤ 2)                  | Devolve 1. Não mexe no cache.                                       | 1 invocação                  |
| Primeira ocorrência de f(k), k ≥ 3 | Falta de cache: faz as três chamadas, soma e guarda o resultado.    | 1 invocação mais a subárvore |
| Ocorrências seguintes de f(k)      | Acerto de cache: devolve o valor guardado. Nenhum filho é visitado. | 1 invocação, sem subárvore   |

Essa técnica chama-se **memoização**: continua sendo recursão de cima para baixo (top-down), só
que com memória. A primeira vez paga o preço cheio; as seguintes custam uma consulta ao dicionário.

A ordem dos filhos importa. Como a recursão visita f(n-1) antes de f(n-2) e de f(n-3), o primeiro
filho é quem desce até o fundo e calcula. Quando chega a vez dos irmãos da direita, o valor deles já
está guardado (ou eles são casos base, que respondem direto, sem consultar o cache).

## 4. A árvore de f(7) com cache

Mesma notação. `[calcula e guarda]` marca as faltas de cache (primeira ocorrência de cada
argumento) e `[acerto de cache, dentro de f(k)]` marca as consultas que encontraram o valor pronto,
dizendo em qual chamada isso aconteceu.

```text
 1  f(7) = 31  [calcula e guarda]
 2    f(6) = 17  [calcula e guarda]
 3      f(5) = 9  [calcula e guarda]
 4        f(4) = 5  [calcula e guarda]
 5          f(3) = 3  [calcula e guarda]
 6            f(2) = 1  [base]
 7            f(1) = 1  [base]
 8            f(0) = 1  [base]
 9          f(2) = 1  [base]
10          f(1) = 1  [base]
11        f(3) = 3  [acerto de cache, dentro de f(5)]
12        f(2) = 1  [base]
13      f(4) = 5  [acerto de cache, dentro de f(6)]
14      f(3) = 3  [acerto de cache, dentro de f(6)]
15    f(5) = 9  [acerto de cache, dentro de f(7)]
16    f(4) = 5  [acerto de cache, dentro de f(7)]
```

Leitura em ordem:

1. f(7) chama f(6), que chama f(5), que chama f(4), que chama f(3). Esse caminho até f(2) é igual
   ao da versão sem cache: 6 quadros na pilha.
2. f(3) é o primeiro a terminar: soma três casos base e guarda 3 no cache.
3. f(4) termina em seguida (f(3) calculado, f(2) e f(1) base) e guarda 5.
4. f(5) pede f(3): **primeiro acerto de cache**. Depois pede f(2), caso base. Guarda 9.
5. f(6) pede f(4) e f(3): dois acertos seguidos. Guarda 17.
6. f(7) pede f(5) e f(4): dois acertos. Guarda 31 e termina.

Ao final, o cache tem 5 entradas: f(3), f(4), f(5), f(6) e f(7).

| O que contamos                   | Quantidade                           |
| -------------------------------- | ------------------------------------ |
| Invocações                       | 16                                   |
| Chamadas recursivas              | 15                                   |
| Nós calculados (faltas de cache) | 5 (f(3) a f(7))                      |
| Acertos de cache                 | 5                                    |
| Casos base                       | 6                                    |
| Entradas no cache ao final       | 5                                    |
| Profundidade máxima da pilha     | 6 quadros (igual à versão sem cache) |

Acertos, em ordem de ocorrência: f(3) dentro de f(5); f(4) dentro de f(6); f(3) dentro de f(6);
f(5) dentro de f(7); f(4) dentro de f(7).

### Invocações por argumento (com cache)

| Argumento | Invocações | Como se dividem                   | Valor |
| --------- | ---------- | --------------------------------- | ----- |
| f(7)      | 1          | 1 calculado                       | 31    |
| f(6)      | 1          | 1 calculado                       | 17    |
| f(5)      | 2          | 1 calculado + 1 acerto            | 9     |
| f(4)      | 3          | 1 calculado + 2 acertos           | 5     |
| f(3)      | 3          | 1 calculado + 2 acertos           | 3     |
| f(2)      | 3          | 3 base                            | 1     |
| f(1)      | 2          | 2 base                            | 1     |
| f(0)      | 1          | 1 base                            | 1     |
| Total     | 16         | 5 calculados + 5 acertos + 6 base |       |

Agora cada argumento de 3 a 7 é calculado **uma única vez**. As outras aparições são acertos.

## As mesmas árvores em figura

As árvores desenhadas acima em texto existem também em imagem, exportadas do
aplicativo e prontas para slide:

- `figuras/arvore-tribonacci-f7-sem-cache.svg` e `.png`, com os 46 nós.
- `figuras/arvore-tribonacci-f7-com-cache.svg` e `.png`, com os 16 nós, em que
  os acertos de cache aparecem tracejados e com marca própria.

Nas figuras, a cor identifica o argumento: todas as ocorrências de f(3) têm a
mesma cor, o que deixa a repetição visível de longe.

## 5. A conta das chamadas evitadas: 30

Há três formas de chegar ao mesmo número, e as três batem.

### 5.1 Pela diferença

- Invocações: 46 - 16 = 30.
- Só chamadas recursivas: 45 - 15 = 30. A raiz existe nos dois modos, então a diferença é a mesma.

### 5.2 Pela soma das subárvores podadas

Sem cache, uma chamada f(k) gera uma subárvore inteira com C(k) invocações. Com cache, um acerto em
f(k) vira um nó único: a subárvore deixa de existir, exceto o próprio nó. Cada acerto em f(k)
evita, portanto, C(k) - 1 invocações.

Os tamanhos das subárvores pequenas, contados na árvore da seção 2:

| Subárvore | Invocações C(k) | Evitadas por acerto: C(k) - 1 |
| --------- | --------------- | ----------------------------- |
| f(3)      | 4               | 3                             |
| f(4)      | 7               | 6                             |
| f(5)      | 13              | 12                            |

Aplicando aos cinco acertos:

| Acerto | Onde ocorre    | Linhas da árvore sem cache que somem | Evita |
| ------ | -------------- | ------------------------------------ | ----- |
| f(3)   | dentro de f(5) | 11 a 14 (4 nós viram 1)              | 3     |
| f(4)   | dentro de f(6) | 16 a 22 (7 nós viram 1)              | 6     |
| f(3)   | dentro de f(6) | 23 a 26 (4 nós viram 1)              | 3     |
| f(5)   | dentro de f(7) | 27 a 39 (13 nós viram 1)             | 12    |
| f(4)   | dentro de f(7) | 40 a 46 (7 nós viram 1)              | 6     |
| Total  |                |                                      | 30    |

12 + 6 + 6 + 3 + 3 = 30. É esse o conjunto de subárvores que o modo apresentação esmaece ao
mostrar os dois modos lado a lado (recurso visual a conferir na revisão final).

### 5.3 Pela diferença por argumento

| Argumento | Sem cache | Com cache | Diferença |
| --------- | --------- | --------- | --------- |
| f(7)      | 1         | 1         | 0         |
| f(6)      | 1         | 1         | 0         |
| f(5)      | 2         | 2         | 0         |
| f(4)      | 4         | 3         | 1         |
| f(3)      | 7         | 3         | 4         |
| f(2)      | 13        | 3         | 10        |
| f(1)      | 11        | 2         | 9         |
| f(0)      | 7         | 1         | 6         |
| Total     | 46        | 16        | 30        |

Repare onde está a economia: 25 das 30 chamadas evitadas são casos base. O cache poupa
principalmente as folhas, que são a parte mais numerosa da árvore.

## 6. Generalização

### 6.1 Sem cache: crescimento exponencial

Chamando de C(n) o total de invocações sem cache, a árvore obedece à mesma regra da sequência,
mais um pela própria chamada:

- C(0) = C(1) = C(2) = 1
- C(n) = 1 + C(n-1) + C(n-2) + C(n-3), para n ≥ 3

A forma fechada é **C(n) = (3 · T(n) - 1) / 2**, em que T(n) é o próprio valor de Tribonacci. O
raciocínio é o da seção 2: as folhas são T(n) (cada uma contribui com 1 para a soma) e os nós
calculados são (T(n) - 1) / 2 (cada um tem 3 filhos). Somando: T(n) + (T(n) - 1) / 2 =
(3 · T(n) - 1) / 2. Para n = 7: (3 · 31 - 1) / 2 = 46.

Como T(n) cresce aproximadamente como 1,839ⁿ, o número de chamadas cresce na mesma taxa: cada
incremento de 1 em n multiplica as chamadas por cerca de 1,84.

### 6.2 Com cache: crescimento linear

Com cache, cada argumento de 3 a n é calculado uma vez só: são n - 2 nós calculados, cada um com 3
filhos, mais a raiz que já está entre eles. Total: **3 · (n - 2) + 1 = 3n - 5** (para n ≥ 2; para
n = 0 e n = 1 é 1). Cada incremento de 1 em n acrescenta apenas 3 chamadas. Para n = 7: 16.

### 6.3 As fórmulas aplicadas

| n   | T(n)       | Sem cache: (3 · T(n) - 1) / 2 | Com cache: 3n - 5 | Chamadas evitadas | Redução       |
| --- | ---------- | ----------------------------- | ----------------- | ----------------- | ------------- |
| 7   | 31         | 46                            | 16                | 30                | 2,9 vezes     |
| 10  | 193        | 289                           | 25                | 264               | 11,6 vezes    |
| 20  | 85 525     | 128 287                       | 55                | 128 232           | 2 332 vezes   |
| 30  | 37 895 489 | 56 843 233                    | 85                | 56 843 148        | 668 744 vezes |

Para n = 30, a versão sem cache faz quase 57 milhões de chamadas; é o maior n aceito pela API nesse
modo, calibrado para ficar em torno de 10 segundos. A versão com cache faz 85 chamadas e aceita n
até 5000.

### 6.4 As outras sequências

| Sequência  | Sem cache          | Com cache      | Exemplo f(10)                       |
| ---------- | ------------------ | -------------- | ----------------------------------- |
| Fatorial   | n (1 se n = 0)     | n (1 se n = 0) | 10 e 10 invocações; valor 3 628 800 |
| Fibonacci  | 2 · F(n) - 1       | 2n - 1 (n ≥ 1) | 177 e 19 invocações; valor 89       |
| Tribonacci | (3 · T(n) - 1) / 2 | 3n - 5 (n ≥ 2) | 289 e 25 invocações; valor 193      |

Fibonacci segue o mesmo raciocínio com 2 filhos: folhas = F(n), nós calculados = F(n) - 1, total
2 · F(n) - 1; com cache, n - 1 argumentos calculados com 2 filhos cada, mais a raiz: 2n - 1. O
crescimento sem cache é de aproximadamente 1,618ⁿ. Fatorial é uma corrente de n chamadas nos dois
modos, porque nunca há repetição de argumento.

O Fatorial merece uma observação honesta: numa execução isolada ele não ganha nada com cache. São
as mesmas n invocações, nenhum acerto, e ainda sobram n - 1 entradas guardadas sem serem usadas. O
cache só ajudaria se o mesmo cache sobrevivesse entre execuções, atendendo a vários pedidos. Como
aqui cada execução começa com o cache vazio, a interface mostra tempo parecido nos dois modos e
memória um pouco maior com cache. Isso não é falha da medição: é o resultado correto, e ele ensina
que memoização só compensa onde existem subproblemas repetidos. A seção 8 de
`docs/metodologia-medicao.md` detalha esse ponto.

### 6.5 O custo em memória

O ganho de tempo não sai de graça. São três custos, e todos crescem com n:

- **Cache**: n - 2 entradas para Tribonacci (f(3) a f(n)). Cada valor é um `bigint` cujo tamanho
  cresce com n: T(n) ganha aproximadamente um dígito novo a cada quatro incrementos de n. Para
  n = 30 são 28 entradas de até 8 dígitos, em troca de 56 843 148 chamadas a menos. Para n = 5000,
  o maior valor aceito no modo com cache, T(n) tem 1 323 dígitos e as 4 998 entradas somam cerca de
  3,3 milhões de dígitos, ou seja alguns megabytes.
- **Pilha**: a profundidade máxima é n - 1 quadros nos dois modos, porque o caminho mais à esquerda
  (f(n), f(n-1), ..., f(2)) é idêntico com e sem cache. O cache não reduz em nada o risco de
  estouro de pilha. Por isso a API executa os cálculos em um worker com pilha ampliada e limita n
  por sequência, modo e ambiente: no Node, Tribonacci aceita n até 30 sem cache e até 5000 com
  cache; no navegador, usado só no plano B offline, os limites são 22 e 500.
- **Tempo com cache**: o número de chamadas é linear, mas cada soma opera números com cada vez mais
  dígitos. Contando chamadas, o custo é proporcional a n; contando dígito a dígito, fica perto de
  n².

Resumo da troca:

| Modo      | Chamadas  | Pilha | Cache         |
| --------- | --------- | ----- | ------------- |
| Sem cache | O(1,839ⁿ) | O(n)  | nenhum        |
| Com cache | O(n)      | O(n)  | O(n) entradas |

Trocamos memória proporcional a n por uma redução exponencial no número de chamadas. É um negócio
excelente no Tribonacci e no Fibonacci, e é exatamente o tipo de troca que não compensa no
Fatorial, onde não existe repetição para evitar.

## 7. Como conferir estes números na ferramenta

Nenhum número deste documento é digitado à mão na interface: tudo que aparece na tela vem de uma
execução instrumentada de verdade. Para conferir ao vivo, com a interface em
`http://localhost:5173`:

| O que conferir                     | Endereço                                            |
| ---------------------------------- | --------------------------------------------------- |
| Métricas de f(7) sem cache         | `/calcular?sequencia=tribonacci&n=7&modo=sem_cache` |
| Métricas de f(7) com cache         | `/calcular?sequencia=tribonacci&n=7&modo=com_cache` |
| A árvore de 46 nós                 | `/arvore?sequencia=tribonacci&n=7&modo=sem_cache`   |
| A árvore de 16 nós e os 5 acertos  | `/arvore?sequencia=tribonacci&n=7&modo=com_cache`   |
| Tempo, memória e chamadas evitadas | `/comparar?sequencia=tribonacci&n=7`                |
| Os dois modos lado a lado          | `/apresentacao`                                     |

Os números de tempo e memória da tela `/comparar` seguem o método descrito em
`docs/metodologia-medicao.md`: mediana de várias repetições, com aquecimento, cache novo a cada
repetição e memória medida em execução separada.

Sem abrir o navegador, pela linha de comando:

```bash
pnpm cli tribonacci 7 --modo sem_cache --arvore
pnpm cli tribonacci 7 --modo com_cache --arvore
```

A conferir na revisão final: os nomes exatos dos parâmetros do endereço e o formato da saída da
linha de comando ainda estão sendo fechados pelos outros módulos. As contagens deste documento não
mudam.
