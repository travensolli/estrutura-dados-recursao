# Resultados de benchmark

Gerado por `pnpm benchmark:relatorio` em 17/09/2026, 12:17:16.
Todos os números vêm da execução registrada abaixo, nesta máquina.

## Máquina e versões

| item                    | valor                                     |
| ----------------------- | ----------------------------------------- |
| Processador             | Intel(R) Core(TM) i5-1035G1 CPU @ 1.00GHz |
| Núcleos lógicos         | 8                                         |
| Memória total           | 14,89 GiB                                 |
| Sistema                 | linux (x64)                               |
| Node                    | 22.22.1                                   |
| V8                      | 12.4.254.21-node.35                       |
| Argumentos do Node      | `--expose-gc --import tsx`                |
| Duração total da coleta | 50,497 s                                  |

## Parâmetros da medição

| parâmetro                           | valor                    |
| ----------------------------------- | ------------------------ |
| Repetições pedidas por comparação   | 5                        |
| Duração mínima de cada bloco medido | 200,00 ms                |
| Orçamento de tempo por comparação   | 8,000 s                  |
| Repetições da medição de memória    | 3                        |
| Amostragem do pico de heap          | a cada 10.000 invocações |
| Prazo de cada trabalho              | 60,000 s                 |
| Pilha do worker                     | 64 MB                    |

## Resumo no maior n de cada sequência

| sequência  | n     | invocações sem cache | invocações com cache | chamadas evitadas | aceleração | memória a mais com cache |
| ---------- | ----- | -------------------- | -------------------- | ----------------- | ---------- | ------------------------ |
| Fatorial   | 5.000 | 5.000                | 5.000                | 0                 | 0,85×      | 15,40 MiB                |
| Fibonacci  | 35    | 29.860.703           | 69                   | 29.860.634        | 81.849×    | 2,0 KiB                  |
| Tribonacci | 30    | 56.843.233           | 85                   | 56.843.148        | 183.556×   | 1.000 B                  |

## Fatorial

Fórmula: f(n) = n · f(n-1). Casos base: f(0) = f(1) = 1.
Crescimento sem cache: linear: n invocações.
Crescimento com cache: linear: n invocações (o cache não evita nenhuma chamada).

### Invocações e tempo

| n     | valor                        | invocações sem cache | invocações com cache | chamadas evitadas | tempo sem cache | tempo com cache | aceleração |
| ----- | ---------------------------- | -------------------- | -------------------- | ----------------- | --------------- | --------------- | ---------- |
| 10    | 3628800                      | 10                   | 10                   | 0                 | 267 ns          | 634 ns          | 0,42×      |
| 100   | 93326215... (158 dígitos)    | 100                  | 100                  | 0                 | 7,30 µs         | 10,08 µs        | 0,72×      |
| 1.000 | 40238726... (2.568 dígitos)  | 1.000                | 1.000                | 0                 | 178,68 µs       | 215,98 µs       | 0,83×      |
| 5.000 | 42285779... (16.326 dígitos) | 5.000                | 5.000                | 0                 | 3,99 ms         | 4,71 ms         | 0,85×      |

### Memória

| n     | retida sem cache | retida com cache | diferença | entradas no cache | profundidade máxima | pico de heap sem cache | pico de heap com cache |
| ----- | ---------------- | ---------------- | --------- | ----------------- | ------------------- | ---------------------- | ---------------------- |
| 10    | 0 B              | 960 B            | 960 B     | 9                 | 10                  | 9,00 MiB               | 9,00 MiB               |
| 100   | 616 B            | 8,1 KiB          | 7,5 KiB   | 99                | 100                 | 9,03 MiB               | 9,02 MiB               |
| 1.000 | 0 B              | 524,3 KiB        | 524,3 KiB | 999               | 1.000               | 9,62 MiB               | 9,73 MiB               |
| 5.000 | 616 B            | 15,40 MiB        | 15,40 MiB | 4.999             | 5.000               | 8,91 MiB               | 23,97 MiB              |

### Dispersão das medições de tempo

| n     | modo      | mediana   | média     | mínimo    | máximo    | desvio padrão | repetições | execuções por repetição |
| ----- | --------- | --------- | --------- | --------- | --------- | ------------- | ---------- | ----------------------- |
| 10    | sem cache | 267 ns    | 267 ns    | 265 ns    | 268 ns    | 1 ns          | 5          | 882.132                 |
| 10    | com cache | 634 ns    | 636 ns    | 628 ns    | 643 ns    | 6 ns          | 5          | 359.250                 |
| 100   | sem cache | 7,30 µs   | 7,35 µs   | 7,29 µs   | 7,52 µs   | 87 ns         | 5          | 48.960                  |
| 100   | com cache | 10,08 µs  | 10,25 µs  | 10,05 µs  | 10,69 µs  | 250 ns        | 5          | 32.520                  |
| 1.000 | sem cache | 178,68 µs | 180,25 µs | 178,45 µs | 186,22 µs | 3,00 µs       | 5          | 1.102                   |
| 1.000 | com cache | 215,98 µs | 216,10 µs | 214,84 µs | 217,04 µs | 774 ns        | 5          | 1.164                   |
| 5.000 | sem cache | 3,99 ms   | 4,01 ms   | 3,99 ms   | 4,10 ms   | 43,47 µs      | 5          | 63                      |
| 5.000 | com cache | 4,71 ms   | 4,71 ms   | 4,69 ms   | 4,73 ms   | 16,47 µs      | 5          | 22                      |

### Leitura

O cache não evita nenhuma chamada: em todos os n medidos as invocações são iguais nos dois modos (em n = 5.000, 5.000 de cada lado). O tempo mediano fica em 0,85× e o cache ainda retém 15,40 MiB em 4.999 entradas, contra 616 B sem cache. Numa execução isolada o cache só acrescenta memória.

## Fibonacci

Fórmula: f(n) = f(n-1) + f(n-2). Casos base: f(0) = f(1) = 1.
Crescimento sem cache: exponencial: aproximadamente 1,618ⁿ.
Crescimento com cache: linear: 2n - 1 invocações.

### Invocações e tempo

| n   | valor    | invocações sem cache | invocações com cache | chamadas evitadas | tempo sem cache | tempo com cache | aceleração |
| --- | -------- | -------------------- | -------------------- | ----------------- | --------------- | --------------- | ---------- |
| 10  | 89       | 177                  | 19                   | 158               | 987 ns          | 461 ns          | 2,14×      |
| 25  | 121393   | 242.785              | 49                   | 242.736           | 1,38 ms         | 1,25 µs         | 1.107×     |
| 30  | 1346269  | 2.692.537            | 59                   | 2.692.478         | 15,02 ms        | 1,34 µs         | 11.195×    |
| 35  | 14930352 | 29.860.703           | 69                   | 29.860.634        | 169,45 ms       | 2,07 µs         | 81.849×    |

### Memória

| n   | retida sem cache | retida com cache | diferença | entradas no cache | profundidade máxima | pico de heap sem cache | pico de heap com cache |
| --- | ---------------- | ---------------- | --------- | ----------------- | ------------------- | ---------------------- | ---------------------- |
| 10  | 0 B              | 960 B            | 960 B     | 9                 | 10                  | 9,01 MiB               | 9,01 MiB               |
| 25  | 432 B            | 1,3 KiB          | 904 B     | 24                | 25                  | 16,55 MiB              | 9,01 MiB               |
| 30  | 0 B              | 1,4 KiB          | 1,4 KiB   | 29                | 30                  | 16,88 MiB              | 9,02 MiB               |
| 35  | 432 B            | 2,4 KiB          | 2,0 KiB   | 34                | 35                  | 16,89 MiB              | 9,01 MiB               |

### Dispersão das medições de tempo

| n   | modo      | mediana   | média     | mínimo    | máximo    | desvio padrão | repetições | execuções por repetição |
| --- | --------- | --------- | --------- | --------- | --------- | ------------- | ---------- | ----------------------- |
| 10  | sem cache | 987 ns    | 990 ns    | 979 ns    | 1,01 µs   | 10 ns         | 5          | 292.920                 |
| 10  | com cache | 461 ns    | 461 ns    | 457 ns    | 466 ns    | 4 ns          | 5          | 507.936                 |
| 25  | sem cache | 1,38 ms   | 1,38 ms   | 1,38 ms   | 1,40 ms   | 9,36 µs       | 5          | 146                     |
| 25  | com cache | 1,25 µs   | 1,25 µs   | 1,24 µs   | 1,26 µs   | 6 ns          | 5          | 312.616                 |
| 30  | sem cache | 15,02 ms  | 15,04 ms  | 14,92 ms  | 15,18 ms  | 102,35 µs     | 5          | 20                      |
| 30  | com cache | 1,34 µs   | 1,35 µs   | 1,34 µs   | 1,36 µs   | 6 ns          | 5          | 194.271                 |
| 35  | sem cache | 169,45 ms | 167,91 ms | 164,01 ms | 171,71 ms | 3,16 ms       | 5          | 2                       |
| 35  | com cache | 2,07 µs   | 2,05 µs   | 1,95 µs   | 2,11 µs   | 57 ns         | 5          | 143.865                 |

### Leitura

Em n = 35 o cache evita 29.860.634 chamadas: 29.860.703 invocações sem cache contra 69 com cache. O tempo mediano cai de 169,45 ms para 2,07 µs, uma aceleração de 81.849×. O preço são 2,4 KiB retidos pelas 34 entradas do cache.

## Tribonacci

Fórmula: f(n) = f(n-1) + f(n-2) + f(n-3). Casos base: f(0) = f(1) = f(2) = 1.
Crescimento sem cache: exponencial: aproximadamente 1,839ⁿ.
Crescimento com cache: linear: 3n - 5 invocações.

### Invocações e tempo

| n   | valor    | invocações sem cache | invocações com cache | chamadas evitadas | tempo sem cache | tempo com cache | aceleração |
| --- | -------- | -------------------- | -------------------- | ----------------- | --------------- | --------------- | ---------- |
| 7   | 31       | 46                   | 16                   | 30                | 247 ns          | 275 ns          | 0,90×      |
| 20  | 85525    | 128.287              | 55                   | 128.232           | 680,44 µs       | 1,17 µs         | 580×       |
| 25  | 1800281  | 2.700.421            | 70                   | 2.700.351         | 14,69 ms        | 1,40 µs         | 10.475×    |
| 30  | 37895489 | 56.843.233           | 85                   | 56.843.148        | 301,49 ms       | 1,64 µs         | 183.556×   |

### Memória

| n   | retida sem cache | retida com cache | diferença | entradas no cache | profundidade máxima | pico de heap sem cache | pico de heap com cache |
| --- | ---------------- | ---------------- | --------- | ----------------- | ------------------- | ---------------------- | ---------------------- |
| 7   | 0 B              | 640 B            | 640 B     | 5                 | 6                   | 9,01 MiB               | 9,01 MiB               |
| 20  | 432 B            | 1,2 KiB          | 760 B     | 18                | 19                  | 13,80 MiB              | 9,01 MiB               |
| 25  | 0 B              | 1,3 KiB          | 1,3 KiB   | 23                | 24                  | 16,89 MiB              | 9,02 MiB               |
| 30  | 432 B            | 1,4 KiB          | 1.000 B   | 28                | 29                  | 16,90 MiB              | 9,02 MiB               |

### Dispersão das medições de tempo

| n   | modo      | mediana   | média     | mínimo    | máximo    | desvio padrão | repetições | execuções por repetição |
| --- | --------- | --------- | --------- | --------- | --------- | ------------- | ---------- | ----------------------- |
| 7   | sem cache | 247 ns    | 246 ns    | 244 ns    | 248 ns    | 2 ns          | 5          | 964.992                 |
| 7   | com cache | 275 ns    | 275 ns    | 271 ns    | 277 ns    | 2 ns          | 5          | 704.608                 |
| 20  | sem cache | 680,44 µs | 681,74 µs | 668,51 µs | 696,41 µs | 11,14 µs      | 5          | 384                     |
| 20  | com cache | 1,17 µs   | 1,17 µs   | 1,14 µs   | 1,19 µs   | 17 ns         | 5          | 167.184                 |
| 25  | sem cache | 14,69 ms  | 14,79 ms  | 14,55 ms  | 15,37 ms  | 296,86 µs     | 5          | 20                      |
| 25  | com cache | 1,40 µs   | 1,41 µs   | 1,40 µs   | 1,43 µs   | 10 ns         | 5          | 282.520                 |
| 30  | sem cache | 301,49 ms | 301,72 ms | 299,51 ms | 305,88 ms | 2,22 ms       | 5          | 1                       |
| 30  | com cache | 1,64 µs   | 1,65 µs   | 1,61 µs   | 1,72 µs   | 38 ns         | 5          | 130.935                 |

### Leitura

Em n = 30 o cache evita 56.843.148 chamadas: 56.843.233 invocações sem cache contra 85 com cache. O tempo mediano cai de 301,49 ms para 1,64 µs, uma aceleração de 183.556×. O preço são 1,4 KiB retidos pelas 28 entradas do cache.

## Como as medições são feitas

- O tempo é medido só sobre as funções puras, com `process.hrtime.bigint()`.
  As versões instrumentadas contam invocações e não entram no cronômetro.
- Cada bloco medido cresce até passar da duração mínima da tabela de
  parâmetros, e o tempo de uma execução é o total do bloco dividido pelo
  número de execuções. Isso mantém a resolução do relógio longe do erro.
- Os dois modos são medidos intercalados e a ordem alterna a cada rodada e a
  cada comparação, para o aquecimento não favorecer sempre o mesmo modo.
- O valor relatado é a mediana das repetições; média, mínimo, máximo e desvio
  padrão aparecem na tabela de dispersão.
- O cache nasce e morre dentro de cada execução: nenhuma medição aproveita o
  cache da anterior.
- A memória retida é a diferença de `heapUsed` entre duas coletas de lixo com
  o cache ainda referenciado. O pico de heap é o `heapUsed` absoluto do
  worker, amostrado a cada K invocações, então inclui a linha de base do
  processo: o que interessa nele é a comparação entre os dois modos.
- Cada comparação roda em um worker próprio, um de cada vez, com prazo.

Nenhum número deste relatório está escrito no código: todos vêm da execução
registrada acima. Rodar de novo em outra máquina muda os tempos, não as
contagens de invocações.
