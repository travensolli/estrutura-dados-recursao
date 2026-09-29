# Resultados de benchmark

Gerado por `pnpm relatorio` em 28/09/2026, 19:40:53.
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
| Duração total da coleta | 76,887 s                                  |

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
| Fibonacci  | 35    | 29.860.703           | 69                   | 29.860.634        | 85.324×    | 2,0 KiB                  |
| Tribonacci | 30    | 56.843.233           | 85                   | 56.843.148        | 186.434×   | 1.000 B                  |

## Fatorial

Fórmula: f(n) = n · f(n-1). Casos base: f(0) = f(1) = 1.
Crescimento sem cache: linear (n invocações).
Crescimento com cache: linear (sem ganho).

### Invocações e tempo

| n     | valor                        | invocações sem cache | invocações com cache | chamadas evitadas | tempo sem cache | tempo com cache | aceleração |
| ----- | ---------------------------- | -------------------- | -------------------- | ----------------- | --------------- | --------------- | ---------- |
| 10    | 3628800                      | 10                   | 10                   | 0                 | 274 ns          | 645 ns          | 0,42×      |
| 100   | 93326215... (158 dígitos)    | 100                  | 100                  | 0                 | 7,58 µs         | 10,34 µs        | 0,73×      |
| 500   | 12201368... (1.135 dígitos)  | 500                  | 500                  | 0                 | 61,35 µs        | 78,07 µs        | 0,79×      |
| 1.000 | 40238726... (2.568 dígitos)  | 1.000                | 1.000                | 0                 | 189,81 µs       | 228,68 µs       | 0,83×      |
| 2.500 | 16288884... (7.412 dígitos)  | 2.500                | 2.500                | 0                 | 1,02 ms         | 1,23 ms         | 0,83×      |
| 5.000 | 42285779... (16.326 dígitos) | 5.000                | 5.000                | 0                 | 4,06 ms         | 4,79 ms         | 0,85×      |

### Memória

| n     | retida sem cache | retida com cache | diferença | entradas no cache | profundidade máxima | pico de heap sem cache | pico de heap com cache |
| ----- | ---------------- | ---------------- | --------- | ----------------- | ------------------- | ---------------------- | ---------------------- |
| 10    | 0 B              | 960 B            | 960 B     | 9                 | 10                  | 9,00 MiB               | 9,00 MiB               |
| 100   | 616 B            | 8,1 KiB          | 7,5 KiB   | 99                | 100                 | 9,03 MiB               | 9,02 MiB               |
| 500   | 0 B              | 128,1 KiB        | 128,1 KiB | 499               | 500                 | 9,16 MiB               | 9,23 MiB               |
| 1.000 | 616 B            | 523,7 KiB        | 523,1 KiB | 999               | 1.000               | 9,66 MiB               | 9,66 MiB               |
| 2.500 | 0 B              | 3,56 MiB         | 3,56 MiB  | 2.499             | 2.500               | 12,74 MiB              | 13,11 MiB              |
| 5.000 | 616 B            | 15,40 MiB        | 15,40 MiB | 4.999             | 5.000               | 8,87 MiB               | 23,97 MiB              |

### Dispersão das medições de tempo

| n     | modo      | mediana   | média     | mínimo    | máximo    | desvio padrão | repetições | execuções por repetição |
| ----- | --------- | --------- | --------- | --------- | --------- | ------------- | ---------- | ----------------------- |
| 10    | sem cache | 274 ns    | 273 ns    | 267 ns    | 276 ns    | 3 ns          | 5          | 938.448                 |
| 10    | com cache | 645 ns    | 649 ns    | 643 ns    | 660 ns    | 7 ns          | 5          | 339.976                 |
| 100   | sem cache | 7,58 µs   | 7,67 µs   | 7,53 µs   | 7,94 µs   | 156 ns        | 5          | 25.475                  |
| 100   | com cache | 10,34 µs  | 10,39 µs  | 10,23 µs  | 10,70 µs  | 173 ns        | 5          | 32.436                  |
| 500   | sem cache | 61,35 µs  | 61,51 µs  | 58,69 µs  | 64,62 µs  | 2,20 µs       | 5          | 4.035                   |
| 500   | com cache | 78,07 µs  | 77,89 µs  | 75,89 µs  | 80,06 µs  | 1,38 µs       | 5          | 4.880                   |
| 1.000 | sem cache | 189,81 µs | 189,11 µs | 184,78 µs | 194,11 µs | 3,20 µs       | 5          | 1.536                   |
| 1.000 | com cache | 228,68 µs | 228,30 µs | 224,07 µs | 231,86 µs | 2,67 µs       | 5          | 930                     |
| 2.500 | sem cache | 1,02 ms   | 1,04 ms   | 1,01 ms   | 1,10 ms   | 31,27 µs      | 5          | 207                     |
| 2.500 | com cache | 1,23 ms   | 1,23 ms   | 1,19 ms   | 1,27 ms   | 26,16 µs      | 5          | 202                     |
| 5.000 | sem cache | 4,06 ms   | 4,12 ms   | 4,03 ms   | 4,32 ms   | 108,32 µs     | 5          | 63                      |
| 5.000 | com cache | 4,79 ms   | 4,77 ms   | 4,63 ms   | 4,88 ms   | 92,38 µs      | 5          | 24                      |

### Leitura

O cache não evita nenhuma chamada: em todos os n medidos as invocações são iguais nos dois modos (em n = 5.000, 5.000 de cada lado). O tempo mediano fica em 0,85× e o cache ainda retém 15,40 MiB em 4.999 entradas, contra 616 B sem cache. Numa execução isolada o cache só acrescenta memória.

## Fibonacci

Fórmula: f(n) = f(n-1) + f(n-2). Casos base: f(0) = f(1) = 1.
Crescimento sem cache: exponencial, O(1,618ⁿ).
Crescimento com cache: linear (2n - 1 invocações).

### Invocações e tempo

| n   | valor    | invocações sem cache | invocações com cache | chamadas evitadas | tempo sem cache | tempo com cache | aceleração |
| --- | -------- | -------------------- | -------------------- | ----------------- | --------------- | --------------- | ---------- |
| 10  | 89       | 177                  | 19                   | 158               | 1,06 µs         | 494 ns          | 2,14×      |
| 15  | 987      | 1.973                | 29                   | 1.944             | 11,73 µs        | 647 ns          | 18,1×      |
| 20  | 10946    | 21.891               | 39                   | 21.852            | 132,96 µs       | 1,11 µs         | 119×       |
| 25  | 121393   | 242.785              | 49                   | 242.736           | 1,46 ms         | 1,28 µs         | 1.136×     |
| 30  | 1346269  | 2.692.537            | 59                   | 2.692.478         | 15,97 ms        | 1,46 µs         | 10.921×    |
| 35  | 14930352 | 29.860.703           | 69                   | 29.860.634        | 183,11 ms       | 2,15 µs         | 85.324×    |

### Memória

| n   | retida sem cache | retida com cache | diferença | entradas no cache | profundidade máxima | pico de heap sem cache | pico de heap com cache |
| --- | ---------------- | ---------------- | --------- | ----------------- | ------------------- | ---------------------- | ---------------------- |
| 10  | 0 B              | 960 B            | 960 B     | 9                 | 10                  | 9,01 MiB               | 9,00 MiB               |
| 15  | 432 B            | 648 B            | 216 B     | 14                | 15                  | 9,05 MiB               | 9,00 MiB               |
| 20  | 0 B              | 1,2 KiB          | 1,2 KiB   | 19                | 20                  | 9,69 MiB               | 9,01 MiB               |
| 25  | 432 B            | 1,3 KiB          | 904 B     | 24                | 25                  | 16,51 MiB              | 9,01 MiB               |
| 30  | 0 B              | 1,4 KiB          | 1,4 KiB   | 29                | 30                  | 16,86 MiB              | 9,02 MiB               |
| 35  | 432 B            | 2,4 KiB          | 2,0 KiB   | 34                | 35                  | 16,91 MiB              | 9,02 MiB               |

### Dispersão das medições de tempo

| n   | modo      | mediana   | média     | mínimo    | máximo    | desvio padrão | repetições | execuções por repetição |
| --- | --------- | --------- | --------- | --------- | --------- | ------------- | ---------- | ----------------------- |
| 10  | sem cache | 1,06 µs   | 1,06 µs   | 1,01 µs   | 1,12 µs   | 38 ns         | 5          | 283.632                 |
| 10  | com cache | 494 ns    | 497 ns    | 487 ns    | 513 ns    | 9 ns          | 5          | 752.388                 |
| 15  | sem cache | 11,73 µs  | 11,73 µs  | 11,56 µs  | 11,99 µs  | 145 ns        | 5          | 31.800                  |
| 15  | com cache | 647 ns    | 649 ns    | 639 ns    | 668 ns    | 10 ns         | 5          | 387.345                 |
| 20  | sem cache | 132,96 µs | 133,90 µs | 131,90 µs | 136,77 µs | 2,04 µs       | 5          | 2.670                   |
| 20  | com cache | 1,11 µs   | 1,12 µs   | 1,10 µs   | 1,14 µs   | 15 ns         | 5          | 191.418                 |
| 25  | sem cache | 1,46 ms   | 1,46 ms   | 1,41 ms   | 1,53 ms   | 40,17 µs      | 5          | 156                     |
| 25  | com cache | 1,28 µs   | 1,29 µs   | 1,26 µs   | 1,33 µs   | 27 ns         | 5          | 212.280                 |
| 30  | sem cache | 15,97 ms  | 16,18 ms  | 15,86 ms  | 17,06 ms  | 446,43 µs     | 5          | 20                      |
| 30  | com cache | 1,46 µs   | 1,47 µs   | 1,46 µs   | 1,52 µs   | 26 ns         | 5          | 156.000                 |
| 35  | sem cache | 183,11 ms | 183,97 ms | 182,39 ms | 185,93 ms | 1,50 ms       | 5          | 2                       |
| 35  | com cache | 2,15 µs   | 2,16 µs   | 2,11 µs   | 2,25 µs   | 51 ns         | 5          | 102.680                 |

### Leitura

Em n = 35 o cache evita 29.860.634 chamadas: 29.860.703 invocações sem cache contra 69 com cache. O tempo mediano cai de 183,11 ms para 2,15 µs, uma aceleração de 85.324×. O preço são 2,4 KiB retidos pelas 34 entradas do cache.

## Tribonacci

Fórmula: f(n) = f(n-1) + f(n-2) + f(n-3). Casos base: f(0) = f(1) = f(2) = 1.
Crescimento sem cache: exponencial, O(1,839ⁿ).
Crescimento com cache: linear (3n - 5 invocações).

### Invocações e tempo

| n   | valor    | invocações sem cache | invocações com cache | chamadas evitadas | tempo sem cache | tempo com cache | aceleração |
| --- | -------- | -------------------- | -------------------- | ----------------- | --------------- | --------------- | ---------- |
| 7   | 31       | 46                   | 16                   | 30                | 267 ns          | 295 ns          | 0,91×      |
| 10  | 193      | 289                  | 25                   | 264               | 1,69 µs         | 398 ns          | 4,24×      |
| 15  | 4063     | 6.094                | 40                   | 6.054             | 34,07 µs        | 768 ns          | 44,4×      |
| 20  | 85525    | 128.287              | 55                   | 128.232           | 713,88 µs       | 1,26 µs         | 567×       |
| 25  | 1800281  | 2.700.421            | 70                   | 2.700.351         | 15,74 ms        | 1,51 µs         | 10.412×    |
| 30  | 37895489 | 56.843.233           | 85                   | 56.843.148        | 319,49 ms       | 1,71 µs         | 186.434×   |

### Memória

| n   | retida sem cache | retida com cache | diferença | entradas no cache | profundidade máxima | pico de heap sem cache | pico de heap com cache |
| --- | ---------------- | ---------------- | --------- | ----------------- | ------------------- | ---------------------- | ---------------------- |
| 7   | 0 B              | 640 B            | 640 B     | 5                 | 6                   | 9,01 MiB               | 9,01 MiB               |
| 10  | 432 B            | 280 B            | -152 B    | 8                 | 9                   | 9,02 MiB               | 9,01 MiB               |
| 15  | 0 B              | 624 B            | 624 B     | 13                | 14                  | 9,15 MiB               | 9,02 MiB               |
| 20  | 432 B            | 1,2 KiB          | 760 B     | 18                | 19                  | 13,78 MiB              | 9,01 MiB               |
| 25  | 0 B              | 1,3 KiB          | 1,3 KiB   | 23                | 24                  | 16,89 MiB              | 9,02 MiB               |
| 30  | 432 B            | 1,4 KiB          | 1.000 B   | 28                | 29                  | 16,90 MiB              | 9,01 MiB               |

### Dispersão das medições de tempo

| n   | modo      | mediana   | média     | mínimo    | máximo    | desvio padrão | repetições | execuções por repetição |
| --- | --------- | --------- | --------- | --------- | --------- | ------------- | ---------- | ----------------------- |
| 7   | sem cache | 267 ns    | 269 ns    | 260 ns    | 280 ns    | 7 ns          | 5          | 1.000.000               |
| 7   | com cache | 295 ns    | 293 ns    | 287 ns    | 296 ns    | 3 ns          | 5          | 668.220                 |
| 10  | sem cache | 1,69 µs   | 1,70 µs   | 1,66 µs   | 1,79 µs   | 48 ns         | 5          | 130.154                 |
| 10  | com cache | 398 ns    | 398 ns    | 396 ns    | 399 ns    | 1 ns          | 5          | 1.000.000               |
| 15  | sem cache | 34,07 µs  | 34,44 µs  | 33,37 µs  | 35,55 µs  | 842 ns        | 5          | 11.632                  |
| 15  | com cache | 768 ns    | 762 ns    | 724 ns    | 796 ns    | 27 ns         | 5          | 328.860                 |
| 20  | sem cache | 713,88 µs | 723,56 µs | 703,25 µs | 766,71 µs | 22,99 µs      | 5          | 304                     |
| 20  | com cache | 1,26 µs   | 1,24 µs   | 1,18 µs   | 1,29 µs   | 41 ns         | 5          | 199.520                 |
| 25  | sem cache | 15,74 ms  | 15,78 ms  | 15,53 ms  | 16,13 ms  | 194,28 µs     | 5          | 18                      |
| 25  | com cache | 1,51 µs   | 1,52 µs   | 1,49 µs   | 1,55 µs   | 22 ns         | 5          | 139.316                 |
| 30  | sem cache | 319,49 ms | 323,15 ms | 313,27 ms | 341,40 ms | 9,78 ms       | 5          | 1                       |
| 30  | com cache | 1,71 µs   | 1,71 µs   | 1,68 µs   | 1,73 µs   | 20 ns         | 5          | 202.566                 |

### Leitura

Em n = 30 o cache evita 56.843.148 chamadas: 56.843.233 invocações sem cache contra 85 com cache. O tempo mediano cai de 319,49 ms para 1,71 µs, uma aceleração de 186.434×. O preço são 1,4 KiB retidos pelas 28 entradas do cache.

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
