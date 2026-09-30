# @sequencias/nucleo

Os algoritmos do trabalho: Fatorial, Fibonacci e Tribonacci, recursivos, com e sem cache, em
TypeScript puro e sem dependências de runtime além do [contrato](../contrato/README.md). Todo valor
exibido pela API, pela CLI ou pela interface sai daqui.

A fundamentação e as contas completas estão no [artigo](../../README.md), seções 2 e 3.

## As duas versões de cada função

| Versão            | Arquivo                 | O que faz                                                                                              |
| ----------------- | ----------------------- | ------------------------------------------------------------------------------------------------------ |
| **Pura**          | `src/puros.ts`          | Só calcula. É a única versão cronometrada nos benchmarks                                               |
| **Instrumentada** | `src/instrumentados.ts` | Calcula e conta: invocações, casos base, acertos, cálculos, profundidade de pilha e árvore de chamadas |

A separação é de propósito: instrumentar custa tempo, então quem mede tempo roda a versão pura e
quem conta chamadas roda a instrumentada. As contagens de uma execução valem para a outra, porque as
duas percorrem as mesmas chamadas.

Os valores são `bigint`, porque estouram o inteiro seguro do JavaScript cedo: o Fatorial em n = 19,
o Tribonacci em n = 62 e o Fibonacci em n = 78.

## Mapa dos arquivos

| Arquivo                 | Responsabilidade                                                       |
| ----------------------- | ---------------------------------------------------------------------- |
| `src/puros.ts`          | As seis funções puras (3 sequências × 2 modos)                         |
| `src/instrumentados.ts` | As seis funções instrumentadas                                         |
| `src/instrumentacao.ts` | O coletor de métricas e o corte da árvore no limite de nós             |
| `src/arvore.ts`         | Montagem da árvore de chamadas que a interface e a CLI desenham        |
| `src/estimativa.ts`     | Fórmulas fechadas de invocações, para prever o custo antes de executar |
| `src/fachadas.ts`       | Ponto de entrada único por sequência e modo                            |
| `src/validacao.ts`      | Validação de n e dos limites por sequência e modo                      |
| `src/testes/oraculo.ts` | Implementações iterativas de referência, usadas só nos testes          |

## Testes

```bash
pnpm --filter @sequencias/nucleo test
```

Os testes comparam as recursões com o oráculo iterativo, conferem as contagens contra as fórmulas
fechadas e usam `fast-check` para propriedades (por exemplo: o valor não muda com o cache).
