# Resultados de benchmark

Gerado por `pnpm benchmark:relatorio` em 17/09/2026, 21:38:14.
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
| Duração total da coleta | 48,537 s                                  |

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
| Fatorial   | 5.000 | 5.000                | 5.000                | 0                 | 0,83×      | 15,40 MiB                |
| Fibonacci  | 35    | 29.860.703           | 69                   | 29.860.634        | 85.379×    | 2,0 KiB                  |
| Tribonacci | 30    | 56.843.233           | 85                   | 56.843.148        | 186.295×   | 1.000 B                  |

## Fatorial

Fórmula: f(n) = n · f(n-1). Casos base: f(0) = f(1) = 1.
Crescimento sem cache: linear: n invocações.
Crescimento com cache: linear: n invocações (o cache não evita nenhuma chamada).

### Invocações e tempo

| n     | valor                        | invocações sem cache | invocações com cache | chamadas evitadas | tempo sem cache | tempo com cache | aceleração |
| ----- | ---------------------------- | -------------------- | -------------------- | ----------------- | --------------- | --------------- | ---------- |
| 10    | 3628800                      | 10                   | 10                   | 0                 | 262 ns          | 629 ns          | 0,42×      |
| 100   | 93326215... (158 dígitos)    | 100                  | 100                  | 0                 | 7,58 µs         | 10,34 µs        | 0,73×      |
| 1.000 | 40238726... (2.568 dígitos)  | 1.000                | 1.000                | 0                 | 184,17 µs       | 227,53 µs       | 0,81×      |
| 5.000 | 42285779... (16.326 dígitos) | 5.000                | 5.000                | 0                 | 4,04 ms         | 4,88 ms         | 0,83×      |

### Memória

| n     | retida sem cache | retida com cache | diferença | entradas no cache | profundidade máxima | pico de heap sem cache | pico de heap com cache |
| ----- | ---------------- | ---------------- | --------- | ----------------- | ------------------- | ---------------------- | ---------------------- |
| 10    | 0 B              | 960 B            | 960 B     | 9                 | 10                  | 9,00 MiB               | 9,00 MiB               |
| 100   | 616 B            | 8,1 KiB          | 7,5 KiB   | 99                | 100                 | 9,03 MiB               | 9,02 MiB               |
| 1.000 | 0 B              | 524,3 KiB        | 524,3 KiB | 999               | 1.000               | 9,60 MiB               | 9,72 MiB               |
| 5.000 | 616 B            | 15,40 MiB        | 15,40 MiB | 4.999             | 5.000               | 8,94 MiB               | 24,00 MiB              |

### Dispersão das medições de tempo

| n     | modo      | mediana   | média     | mínimo    | máximo    | desvio padrão | repetições | execuções por repetição |
| ----- | --------- | --------- | --------- | --------- | --------- | ------------- | ---------- | ----------------------- |
| 10    | sem cache | 262 ns    | 266 ns    | 256 ns    | 286 ns    | 11 ns         | 5          | 923.496                 |
| 10    | com cache | 629 ns    | 636 ns    | 617 ns    | 656 ns    | 15 ns         | 5          | 490.974                 |
| 100   | sem cache | 7,58 µs   | 7,66 µs   | 7,55 µs   | 7,90 µs   | 134 ns        | 5          | 49.050                  |
| 100   | com cache | 10,34 µs  | 10,32 µs  | 10,04 µs  | 10,58 µs  | 187 ns        | 5          | 30.840                  |
| 1.000 | sem cache | 184,17 µs | 184,34 µs | 182,44 µs | 186,86 µs | 1,50 µs       | 5          | 1.218                   |
| 1.000 | com cache | 227,53 µs | 228,92 µs | 219,89 µs | 248,35 µs | 10,28 µs      | 5          | 1.164                   |
| 5.000 | sem cache | 4,04 ms   | 4,07 ms   | 4,04 ms   | 4,20 ms   | 63,28 µs      | 5          | 66                      |
| 5.000 | com cache | 4,88 ms   | 4,88 ms   | 4,78 ms   | 5,00 ms   | 89,13 µs      | 5          | 22                      |

### Leitura

O cache não evita nenhuma chamada: em todos os n medidos as invocações são iguais nos dois modos (em n = 5.000, 5.000 de cada lado). O tempo mediano fica em 0,83× e o cache ainda retém 15,40 MiB em 4.999 entradas, contra 616 B sem cache. Numa execução isolada o cache só acrescenta memória.

## Fibonacci

Fórmula: f(n) = f(n-1) + f(n-2). Casos base: f(0) = f(1) = 1.
Crescimento sem cache: exponencial: aproximadamente 1,618ⁿ.
Crescimento com cache: linear: 2n - 1 invocações.

### Invocações e tempo

| n   | valor    | invocações sem cache | invocações com cache | chamadas evitadas | tempo sem cache | tempo com cache | aceleração |
| --- | -------- | -------------------- | -------------------- | ----------------- | --------------- | --------------- | ---------- |
| 10  | 89       | 177                  | 19                   | 158               | 1,03 µs         | 485 ns          | 2,12×      |
| 25  | 121393   | 242.785              | 49                   | 242.736           | 1,48 ms         | 1,31 µs         | 1.132×     |
| 30  | 1346269  | 2.692.537            | 59                   | 2.692.478         | 16,71 ms        | 1,55 µs         | 10.776×    |
| 35  | 14930352 | 29.860.703           | 69                   | 29.860.634        | 175,69 ms       | 2,06 µs         | 85.379×    |

### Memória

| n   | retida sem cache | retida com cache | diferença | entradas no cache | profundidade máxima | pico de heap sem cache | pico de heap com cache |
| --- | ---------------- | ---------------- | --------- | ----------------- | ------------------- | ---------------------- | ---------------------- |
| 10  | 0 B              | 960 B            | 960 B     | 9                 | 10                  | 9,01 MiB               | 9,01 MiB               |
| 25  | 432 B            | 1,3 KiB          | 904 B     | 24                | 25                  | 16,53 MiB              | 9,01 MiB               |
| 30  | 0 B              | 1,4 KiB          | 1,4 KiB   | 29                | 30                  | 16,82 MiB              | 9,02 MiB               |
| 35  | 432 B            | 2,4 KiB          | 2,0 KiB   | 34                | 35                  | 16,90 MiB              | 9,01 MiB               |

### Dispersão das medições de tempo

| n   | modo      | mediana   | média     | mínimo    | máximo    | desvio padrão | repetições | execuções por repetição |
| --- | --------- | --------- | --------- | --------- | --------- | ------------- | ---------- | ----------------------- |
| 10  | sem cache | 1,03 µs   | 1,03 µs   | 998 ns    | 1,07 µs   | 25 ns         | 5          | 207.102                 |
| 10  | com cache | 485 ns    | 487 ns    | 483 ns    | 498 ns    | 6 ns          | 5          | 469.623                 |
| 25  | sem cache | 1,48 ms   | 1,50 ms   | 1,43 ms   | 1,57 ms   | 49,33 µs      | 5          | 136                     |
| 25  | com cache | 1,31 µs   | 1,32 µs   | 1,30 µs   | 1,34 µs   | 18 ns         | 5          | 217.200                 |
| 30  | sem cache | 16,71 ms  | 16,76 ms  | 16,53 ms  | 16,99 ms  | 171,51 µs     | 5          | 16                      |
| 30  | com cache | 1,55 µs   | 1,55 µs   | 1,52 µs   | 1,58 µs   | 22 ns         | 5          | 152.460                 |
| 35  | sem cache | 175,69 ms | 176,23 ms | 174,04 ms | 179,51 ms | 1,89 ms       | 5          | 2                       |
| 35  | com cache | 2,06 µs   | 2,07 µs   | 2,05 µs   | 2,09 µs   | 16 ns         | 5          | 98.072                  |

### Leitura

Em n = 35 o cache evita 29.860.634 chamadas: 29.860.703 invocações sem cache contra 69 com cache. O tempo mediano cai de 175,69 ms para 2,06 µs, uma aceleração de 85.379×. O preço são 2,4 KiB retidos pelas 34 entradas do cache.

## Tribonacci

Fórmula: f(n) = f(n-1) + f(n-2) + f(n-3). Casos base: f(0) = f(1) = f(2) = 1.
Crescimento sem cache: exponencial: aproximadamente 1,839ⁿ.
Crescimento com cache: linear: 3n - 5 invocações.

### Invocações e tempo

| n   | valor    | invocações sem cache | invocações com cache | chamadas evitadas | tempo sem cache | tempo com cache | aceleração |
| --- | -------- | -------------------- | -------------------- | ----------------- | --------------- | --------------- | ---------- |
| 7   | 31       | 46                   | 16                   | 30                | 266 ns          | 286 ns          | 0,93×      |
| 20  | 85525    | 128.287              | 55                   | 128.232           | 720,95 µs       | 1,19 µs         | 605×       |
| 25  | 1800281  | 2.700.421            | 70                   | 2.700.351         | 14,84 ms        | 1,43 µs         | 10.351×    |
| 30  | 37895489 | 56.843.233           | 85                   | 56.843.148        | 311,50 ms       | 1,67 µs         | 186.295×   |

### Memória

| n   | retida sem cache | retida com cache | diferença | entradas no cache | profundidade máxima | pico de heap sem cache | pico de heap com cache |
| --- | ---------------- | ---------------- | --------- | ----------------- | ------------------- | ---------------------- | ---------------------- |
| 7   | 0 B              | 640 B            | 640 B     | 5                 | 6                   | 9,01 MiB               | 9,01 MiB               |
| 20  | 432 B            | 1,2 KiB          | 760 B     | 18                | 19                  | 13,77 MiB              | 9,01 MiB               |
| 25  | 0 B              | 1,3 KiB          | 1,3 KiB   | 23                | 24                  | 16,88 MiB              | 9,02 MiB               |
| 30  | 432 B            | 1,4 KiB          | 1.000 B   | 28                | 29                  | 16,90 MiB              | 9,02 MiB               |

### Dispersão das medições de tempo

| n   | modo      | mediana   | média     | mínimo    | máximo    | desvio padrão | repetições | execuções por repetição |
| --- | --------- | --------- | --------- | --------- | --------- | ------------- | ---------- | ----------------------- |
| 7   | sem cache | 266 ns    | 266 ns    | 263 ns    | 272 ns    | 3 ns          | 5          | 836.784                 |
| 7   | com cache | 286 ns    | 285 ns    | 283 ns    | 287 ns    | 1 ns          | 5          | 675.840                 |
| 20  | sem cache | 720,95 µs | 726,22 µs | 701,04 µs | 750,62 µs | 17,26 µs      | 5          | 324                     |
| 20  | com cache | 1,19 µs   | 1,19 µs   | 1,18 µs   | 1,21 µs   | 8 ns          | 5          | 211.692                 |
| 25  | sem cache | 14,84 ms  | 14,96 ms  | 14,76 ms  | 15,39 ms  | 225,95 µs     | 5          | 20                      |
| 25  | com cache | 1,43 µs   | 1,45 µs   | 1,43 µs   | 1,49 µs   | 24 ns         | 5          | 152.134                 |
| 30  | sem cache | 311,50 ms | 311,69 ms | 309,57 ms | 314,22 ms | 1,68 ms       | 5          | 1                       |
| 30  | com cache | 1,67 µs   | 1,68 µs   | 1,64 µs   | 1,71 µs   | 25 ns         | 5          | 119.262                 |

### Leitura

Em n = 30 o cache evita 56.843.148 chamadas: 56.843.233 invocações sem cache contra 85 com cache. O tempo mediano cai de 311,50 ms para 1,67 µs, uma aceleração de 186.295×. O preço são 1,4 KiB retidos pelas 28 entradas do cache.

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
