// Oráculo iterativo em bigint, usado apenas nos testes. Independente da
// implementação recursiva, com os casos base do enunciado.

import type { Modo, Sequencia } from '@sequencias/contrato';

export function fatorialIterativo(n: number): bigint {
  let valor = 1n;
  for (let i = 2; i <= n; i += 1) valor *= BigInt(i);
  return valor;
}

export function fibonacciIterativo(n: number): bigint {
  let anterior = 1n;
  let atual = 1n;
  for (let i = 2; i <= n; i += 1) [anterior, atual] = [atual, anterior + atual];
  return atual;
}

export function tribonacciIterativo(n: number): bigint {
  let a = 1n;
  let b = 1n;
  let c = 1n;
  for (let i = 3; i <= n; i += 1) [a, b, c] = [b, c, a + b + c];
  return c;
}

export function valorPeloOraculo(sequencia: Sequencia, n: number): bigint {
  switch (sequencia) {
    case 'fatorial':
      return fatorialIterativo(n);
    case 'fibonacci':
      return fibonacciIterativo(n);
    case 'tribonacci':
      return tribonacciIterativo(n);
  }
}

// Fórmulas fechadas de invocações, escritas de forma independente do núcleo.
export function invocacoesPelaFormula(sequencia: Sequencia, n: number, modo: Modo): number {
  if (sequencia === 'fatorial') return n === 0 ? 1 : n;
  if (sequencia === 'fibonacci') {
    if (modo === 'com_cache') return n === 0 ? 1 : 2 * n - 1;
    return Number(2n * fibonacciIterativo(n) - 1n);
  }
  if (modo === 'com_cache') return n < 2 ? 1 : 3 * n - 5;
  return Number((3n * tribonacciIterativo(n) - 1n) / 2n);
}

export function profundidadePelaFormula(sequencia: Sequencia, n: number): number {
  return sequencia === 'tribonacci' ? Math.max(1, n - 1) : Math.max(1, n);
}
