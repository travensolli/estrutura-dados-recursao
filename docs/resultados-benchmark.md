# Resultados de benchmark

Gerado por `pnpm relatorio` em 30/09/2026, 14:44:29.
Todos os números vêm da execução registrada abaixo, nesta máquina.

## Máquina e versões

| item                    | valor                                  |
| ----------------------- | -------------------------------------- |
| Processador             | AMD Ryzen 7 2700X Eight-Core Processor |
| Núcleos lógicos         | 16                                     |
| Memória total           | 31,95 GiB                              |
| Sistema                 | win32 (x64)                            |
| Node                    | 24.14.0                                |
| V8                      | 13.6.233.17-node.41                    |
| Argumentos do Node      | `--expose-gc --import tsx`             |
| Duração total da coleta | 78,866 s                               |

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
| Fatorial   | 5.000 | 5.000                | 5.000                | 0                 | 0,95×      | 15,40 MiB                |
| Fibonacci  | 35    | 29.860.703           | 69                   | 29.860.634        | 77.013×    | 2,4 KiB                  |
| Tribonacci | 30    | 56.843.233           | 85                   | 56.843.148        | 162.042×   | 1,4 KiB                  |

## Fatorial

Fórmula: f(n) = n · f(n-1). Casos base: f(0) = f(1) = 1.
Crescimento sem cache: linear, n invocações (n ≥ 1).
Crescimento com cache: linear, sem ganho.

### Invocações e tempo

| n     | valor                        | invocações sem cache | invocações com cache | chamadas evitadas | tempo sem cache | tempo com cache | aceleração |
| ----- | ---------------------------- | -------------------- | -------------------- | ----------------- | --------------- | --------------- | ---------- |
| 10    | 3628800                      | 10                   | 10                   | 0                 | 331 ns          | 748 ns          | 0,44×      |
| 100   | 93326215... (158 dígitos)    | 100                  | 100                  | 0                 | 6,53 µs         | 10,77 µs        | 0,61×      |
| 500   | 12201368... (1.135 dígitos)  | 500                  | 500                  | 0                 | 52,27 µs        | 70,59 µs        | 0,74×      |
| 1.000 | 40238726... (2.568 dígitos)  | 1.000                | 1.000                | 0                 | 155,31 µs       | 203,41 µs       | 0,76×      |
| 2.500 | 16288884... (7.412 dígitos)  | 2.500                | 2.500                | 0                 | 809,06 µs       | 895,47 µs       | 0,90×      |
| 5.000 | 42285779... (16.326 dígitos) | 5.000                | 5.000                | 0                 | 3,67 ms         | 3,84 ms         | 0,95×      |

### Memória

| n     | retida sem cache | retida com cache | diferença | entradas no cache | profundidade máxima | pico de heap sem cache | pico de heap com cache |
| ----- | ---------------- | ---------------- | --------- | ----------------- | ------------------- | ---------------------- | ---------------------- |
| 10    | 0 B              | 944 B            | 944 B     | 9                 | 10                  | 11,53 MiB              | 11,53 MiB              |
| 100   | 0 B              | 8,7 KiB          | 8,7 KiB   | 99                | 100                 | 11,54 MiB              | 11,57 MiB              |
| 500   | 0 B              | 128,1 KiB        | 128,1 KiB | 499               | 500                 | 11,69 MiB              | 11,75 MiB              |
| 1.000 | 0 B              | 524,3 KiB        | 524,3 KiB | 999               | 1.000               | 12,13 MiB              | 12,24 MiB              |
| 2.500 | 0 B              | 3,56 MiB         | 3,56 MiB  | 2.499             | 2.500               | 15,29 MiB              | 15,68 MiB              |
| 5.000 | 0 B              | 15,40 MiB        | 15,40 MiB | 4.999             | 5.000               | 27,46 MiB              | 28,19 MiB              |

### Dispersão das medições de tempo

| n     | modo      | mediana   | média     | mínimo    | máximo    | desvio padrão | repetições | execuções por repetição |
| ----- | --------- | --------- | --------- | --------- | --------- | ------------- | ---------- | ----------------------- |
| 10    | sem cache | 331 ns    | 332 ns    | 323 ns    | 337 ns    | 5 ns          | 5          | 1.000.000               |
| 10    | com cache | 748 ns    | 756 ns    | 738 ns    | 779 ns    | 15 ns         | 5          | 353.336                 |
| 100   | sem cache | 6,53 µs   | 7,14 µs   | 6,27 µs   | 9,12 µs   | 1,05 µs       | 5          | 32.824                  |
| 100   | com cache | 10,77 µs  | 10,78 µs  | 10,47 µs  | 11,11 µs  | 240 ns        | 5          | 37.646                  |
| 500   | sem cache | 52,27 µs  | 52,97 µs  | 50,97 µs  | 55,88 µs  | 1,74 µs       | 5          | 3.927                   |
| 500   | com cache | 70,59 µs  | 73,10 µs  | 69,23 µs  | 84,62 µs  | 5,79 µs       | 5          | 3.120                   |
| 1.000 | sem cache | 155,31 µs | 155,29 µs | 148,60 µs | 162,26 µs | 4,87 µs       | 5          | 1.578                   |
| 1.000 | com cache | 203,41 µs | 203,30 µs | 193,36 µs | 213,61 µs | 6,57 µs       | 5          | 1.263                   |
| 2.500 | sem cache | 809,06 µs | 858,44 µs | 736,64 µs | 1,07 ms   | 123,10 µs     | 5          | 255                     |
| 2.500 | com cache | 895,47 µs | 911,30 µs | 880,06 µs | 988,61 µs | 39,63 µs      | 5          | 244                     |
| 5.000 | sem cache | 3,67 ms   | 3,65 ms   | 3,51 ms   | 3,82 ms   | 110,40 µs     | 5          | 55                      |
| 5.000 | com cache | 3,84 ms   | 3,82 ms   | 3,73 ms   | 3,89 ms   | 58,28 µs      | 5          | 68                      |

### Leitura

O cache não evita nenhuma chamada: em todos os n medidos as invocações são iguais nos dois modos (em n = 5.000, 5.000 de cada lado). O tempo mediano fica em 0,95× e o cache ainda retém 15,40 MiB em 4.999 entradas, contra 0 B sem cache. Numa execução isolada o cache só acrescenta memória.

## Fibonacci

Fórmula: f(n) = f(n-1) + f(n-2). Casos base: f(0) = f(1) = 1.
Crescimento sem cache: exponencial, Θ(φⁿ), φ ≈ 1,618.
Crescimento com cache: linear, 2n − 1 invocações (n ≥ 1).

### Invocações e tempo

| n   | valor    | invocações sem cache | invocações com cache | chamadas evitadas | tempo sem cache | tempo com cache | aceleração |
| --- | -------- | -------------------- | -------------------- | ----------------- | --------------- | --------------- | ---------- |
| 10  | 89       | 177                  | 19                   | 158               | 1,00 µs         | 571 ns          | 1,75×      |
| 15  | 987      | 1.973                | 29                   | 1.944             | 12,55 µs        | 815 ns          | 15,4×      |
| 20  | 10946    | 21.891               | 39                   | 21.852            | 129,48 µs       | 1,18 µs         | 110×       |
| 25  | 121393   | 242.785              | 49                   | 242.736           | 1,48 ms         | 1,47 µs         | 1.010×     |
| 30  | 1346269  | 2.692.537            | 59                   | 2.692.478         | 16,09 ms        | 1,55 µs         | 10.383×    |
| 35  | 14930352 | 29.860.703           | 69                   | 29.860.634        | 172,36 ms       | 2,24 µs         | 77.013×    |

### Memória

| n   | retida sem cache | retida com cache | diferença | entradas no cache | profundidade máxima | pico de heap sem cache | pico de heap com cache |
| --- | ---------------- | ---------------- | --------- | ----------------- | ------------------- | ---------------------- | ---------------------- |
| 10  | 0 B              | 944 B            | 944 B     | 9                 | 10                  | 11,54 MiB              | 11,54 MiB              |
| 15  | 0 B              | 648 B            | 648 B     | 14                | 15                  | 11,58 MiB              | 11,53 MiB              |
| 20  | 0 B              | 1,2 KiB          | 1,2 KiB   | 19                | 20                  | 12,05 MiB              | 11,54 MiB              |
| 25  | 0 B              | 1,3 KiB          | 1,3 KiB   | 24                | 25                  | 18,76 MiB              | 11,52 MiB              |
| 30  | 0 B              | 1,4 KiB          | 1,4 KiB   | 29                | 30                  | 19,52 MiB              | 11,53 MiB              |
| 35  | 0 B              | 2,4 KiB          | 2,4 KiB   | 34                | 35                  | 19,54 MiB              | 11,53 MiB              |

### Dispersão das medições de tempo

| n   | modo      | mediana   | média     | mínimo    | máximo    | desvio padrão | repetições | execuções por repetição |
| --- | --------- | --------- | --------- | --------- | --------- | ------------- | ---------- | ----------------------- |
| 10  | sem cache | 1,00 µs   | 1,09 µs   | 997 ns    | 1,40 µs   | 155 ns        | 5          | 257.810                 |
| 10  | com cache | 571 ns    | 601 ns    | 565 ns    | 712 ns    | 56 ns         | 5          | 443.450                 |
| 15  | sem cache | 12,55 µs  | 12,72 µs  | 11,55 µs  | 14,50 µs  | 1,11 µs       | 5          | 30.564                  |
| 15  | com cache | 815 ns    | 861 ns    | 784 ns    | 1,10 µs   | 119 ns        | 5          | 342.900                 |
| 20  | sem cache | 129,48 µs | 129,62 µs | 128,81 µs | 130,58 µs | 603 ns        | 5          | 1.623                   |
| 20  | com cache | 1,18 µs   | 1,22 µs   | 1,16 µs   | 1,38 µs   | 81 ns         | 5          | 219.830                 |
| 25  | sem cache | 1,48 ms   | 1,54 ms   | 1,40 ms   | 1,92 ms   | 188,48 µs     | 5          | 206                     |
| 25  | com cache | 1,47 µs   | 1,47 µs   | 1,36 µs   | 1,60 µs   | 87 ns         | 5          | 187.872                 |
| 30  | sem cache | 16,09 ms  | 16,00 ms  | 15,35 ms  | 16,70 ms  | 471,48 µs     | 5          | 24                      |
| 30  | com cache | 1,55 µs   | 1,55 µs   | 1,51 µs   | 1,58 µs   | 29 ns         | 5          | 233.760                 |
| 35  | sem cache | 172,36 ms | 182,08 ms | 170,78 ms | 219,22 ms | 18,71 ms      | 5          | 2                       |
| 35  | com cache | 2,24 µs   | 2,31 µs   | 2,16 µs   | 2,66 µs   | 180 ns        | 5          | 143.412                 |

### Leitura

Em n = 35 o cache evita 29.860.634 chamadas: 29.860.703 invocações sem cache contra 69 com cache. O tempo mediano cai de 172,36 ms para 2,24 µs, uma aceleração de 77.013×. O preço são 2,4 KiB retidos pelas 34 entradas do cache.

## Tribonacci

Fórmula: f(n) = f(n-1) + f(n-2) + f(n-3). Casos base: f(0) = f(1) = f(2) = 1.
Crescimento sem cache: exponencial, Θ(τⁿ), τ ≈ 1,839.
Crescimento com cache: linear, 3n − 5 invocações (n ≥ 2).

### Invocações e tempo

| n   | valor    | invocações sem cache | invocações com cache | chamadas evitadas | tempo sem cache | tempo com cache | aceleração |
| --- | -------- | -------------------- | -------------------- | ----------------- | --------------- | --------------- | ---------- |
| 7   | 31       | 46                   | 16                   | 30                | 242 ns          | 335 ns          | 0,72×      |
| 10  | 193      | 289                  | 25                   | 264               | 1,66 µs         | 481 ns          | 3,44×      |
| 15  | 4063     | 6.094                | 40                   | 6.054             | 32,57 µs        | 826 ns          | 39,4×      |
| 20  | 85525    | 128.287              | 55                   | 128.232           | 688,10 µs       | 1,28 µs         | 539×       |
| 25  | 1800281  | 2.700.421            | 70                   | 2.700.351         | 14,63 ms        | 1,57 µs         | 9.313×     |
| 30  | 37895489 | 56.843.233           | 85                   | 56.843.148        | 307,28 ms       | 1,90 µs         | 162.042×   |

### Memória

| n   | retida sem cache | retida com cache | diferença | entradas no cache | profundidade máxima | pico de heap sem cache | pico de heap com cache |
| --- | ---------------- | ---------------- | --------- | ----------------- | ------------------- | ---------------------- | ---------------------- |
| 7   | 0 B              | 624 B            | 624 B     | 5                 | 6                   | 11,54 MiB              | 11,54 MiB              |
| 10  | 0 B              | 696 B            | 696 B     | 8                 | 9                   | 11,54 MiB              | 11,54 MiB              |
| 15  | 0 B              | 1,0 KiB          | 1,0 KiB   | 13                | 14                  | 11,69 MiB              | 11,55 MiB              |
| 20  | 0 B              | 1,2 KiB          | 1,2 KiB   | 18                | 19                  | 14,47 MiB              | 11,52 MiB              |
| 25  | 0 B              | 1,3 KiB          | 1,3 KiB   | 23                | 24                  | 19,53 MiB              | 11,55 MiB              |
| 30  | 0 B              | 1,4 KiB          | 1,4 KiB   | 28                | 29                  | 19,55 MiB              | 11,54 MiB              |

### Dispersão das medições de tempo

| n   | modo      | mediana   | média     | mínimo    | máximo    | desvio padrão | repetições | execuções por repetição |
| --- | --------- | --------- | --------- | --------- | --------- | ------------- | ---------- | ----------------------- |
| 7   | sem cache | 242 ns    | 247 ns    | 235 ns    | 275 ns    | 15 ns         | 5          | 1.000.000               |
| 7   | com cache | 335 ns    | 328 ns    | 309 ns    | 344 ns    | 13 ns         | 5          | 807.840                 |
| 10  | sem cache | 1,66 µs   | 1,74 µs   | 1,60 µs   | 2,14 µs   | 202 ns        | 5          | 126.279                 |
| 10  | com cache | 481 ns    | 494 ns    | 472 ns    | 547 ns    | 28 ns         | 5          | 538.880                 |
| 15  | sem cache | 32,57 µs  | 32,15 µs  | 31,12 µs  | 32,91 µs  | 746 ns        | 5          | 10.096                  |
| 15  | com cache | 826 ns    | 832 ns    | 807 ns    | 853 ns    | 18 ns         | 5          | 285.140                 |
| 20  | sem cache | 688,10 µs | 690,79 µs | 680,80 µs | 699,27 µs | 7,13 µs       | 5          | 390                     |
| 20  | com cache | 1,28 µs   | 1,29 µs   | 1,26 µs   | 1,34 µs   | 33 ns         | 5          | 224.928                 |
| 25  | sem cache | 14,63 ms  | 15,04 ms  | 14,44 ms  | 16,83 ms  | 902,80 µs     | 5          | 22                      |
| 25  | com cache | 1,57 µs   | 1,56 µs   | 1,49 µs   | 1,62 µs   | 46 ns         | 5          | 190.728                 |
| 30  | sem cache | 307,28 ms | 302,94 ms | 292,39 ms | 309,76 ms | 6,67 ms       | 5          | 1                       |
| 30  | com cache | 1,90 µs   | 1,89 µs   | 1,84 µs   | 1,92 µs   | 27 ns         | 5          | 180.036                 |

### Leitura

Em n = 30 o cache evita 56.843.148 chamadas: 56.843.233 invocações sem cache contra 85 com cache. O tempo mediano cai de 307,28 ms para 1,90 µs, uma aceleração de 162.042×. O preço são 1,4 KiB retidos pelas 28 entradas do cache.

## Como as medições são feitas

- O tempo é medido só sobre as funções puras, com `process.hrtime.bigint()`.
  As versões instrumentadas contam invocações e não entram no cronômetro.
- Cada bloco medido cresce até passar da duração mínima da tabela de
  parâmetros, e o tempo de uma execução é o total do bloco dividido pelo
  número de execuções. Isso mantém a resolução do relógio longe do erro.
- No tempo, os dois modos são medidos intercalados e a ordem alterna a cada
  rodada e a cada comparação, para o aquecimento não favorecer sempre o
  mesmo modo.
- O valor relatado é a mediana das repetições; média, mínimo, máximo e desvio
  padrão aparecem na tabela de dispersão.
- O cache nasce e morre dentro de cada execução: nenhuma medição aproveita o
  cache da anterior.
- A memória retida é a diferença de `heapUsed` entre duas coletas de lixo com
  o cache ainda referenciado, medida sempre na mesma ordem (primeiro sem
  cache, depois com cache), porque o modo medido depois herda o heap
  aquecido pelo primeiro. O pico de heap é o `heapUsed` absoluto do
  worker, amostrado a cada K invocações, então inclui a linha de base do
  processo: o que interessa nele é a comparação entre os dois modos.
- Cada comparação roda em um worker próprio, um de cada vez, com prazo.

Nenhum número deste relatório está escrito no código: todos vêm da execução
registrada acima. Rodar de novo em outra máquina muda os tempos, não as
contagens de invocações.
