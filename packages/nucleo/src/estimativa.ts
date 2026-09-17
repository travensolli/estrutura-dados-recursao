import type { Modo, Sequencia } from '@sequencias/contrato';
import { fibonacciComCache, tribonacciComCache } from './puros';

/**
 * Invocações previstas pelas fórmulas fechadas. Sem cache, Fibonacci faz
 * 2·F(n) - 1 e Tribonacci (3·T(n) - 1)/2; com cache, 2n - 1 e 3n - 5.
 * Fatorial faz n invocações nos dois modos (1 para n = 0).
 */
export function estimarInvocacoes(sequencia: Sequencia, n: number, modo: Modo): bigint {
  switch (sequencia) {
    case 'fatorial':
      return n === 0 ? 1n : BigInt(n);
    case 'fibonacci':
      if (modo === 'com_cache') return n === 0 ? 1n : BigInt(2 * n - 1);
      return 2n * fibonacciComCache(n, new Map()) - 1n;
    case 'tribonacci':
      if (modo === 'com_cache') return n < 2 ? 1n : BigInt(3 * n - 5);
      return (3n * tribonacciComCache(n, new Map()) - 1n) / 2n;
  }
}

/** Quadros simultâneos na pilha: a cadeia f(n), f(n-1), ... até o primeiro caso base. */
export function estimarProfundidade(sequencia: Sequencia, n: number): number {
  return sequencia === 'tribonacci' ? Math.max(1, n - 1) : Math.max(1, n);
}
