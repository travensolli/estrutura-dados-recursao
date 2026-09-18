import { describe, expect, it } from 'vitest';
import {
  fatorialComCache,
  fatorialSemCache,
  fibonacciComCache,
  fibonacciSemCache,
  tribonacciComCache,
  tribonacciSemCache,
} from './puros';
import { fatorialIterativo, fibonacciIterativo, tribonacciIterativo } from './testes/oraculo';

const ATE_20 = Array.from({ length: 21 }, (_, i) => i);

describe('versões puras', () => {
  it.each(ATE_20)('fatorial(%i) bate com o oráculo nos dois modos', (n) => {
    const esperado = fatorialIterativo(n);
    expect(fatorialSemCache(n)).toBe(esperado);
    expect(fatorialComCache(n, new Map())).toBe(esperado);
  });

  it.each(ATE_20)('fibonacci(%i) bate com o oráculo nos dois modos', (n) => {
    const esperado = fibonacciIterativo(n);
    expect(fibonacciSemCache(n)).toBe(esperado);
    expect(fibonacciComCache(n, new Map())).toBe(esperado);
  });

  it.each(ATE_20)('tribonacci(%i) bate com o oráculo nos dois modos', (n) => {
    const esperado = tribonacciIterativo(n);
    expect(tribonacciSemCache(n)).toBe(esperado);
    expect(tribonacciComCache(n, new Map())).toBe(esperado);
  });

  it('usa os casos base do enunciado', () => {
    expect([0, 1, 2, 3, 4, 5].map(fibonacciSemCache)).toEqual([1n, 1n, 2n, 3n, 5n, 8n]);
    expect([0, 1, 2, 3, 4, 5, 6, 7].map(tribonacciSemCache)).toEqual([
      1n,
      1n,
      1n,
      3n,
      5n,
      9n,
      17n,
      31n,
    ]);
    expect([0, 1, 2, 3, 4].map(fatorialSemCache)).toEqual([1n, 1n, 2n, 6n, 24n]);
  });

  it('mantém precisão acima de 2^53 - 1', () => {
    expect(fatorialComCache(25, new Map()).toString()).toBe('15511210043330985984000000');
    expect(fatorialSemCache(25).toString()).toBe('15511210043330985984000000');
    expect(fibonacciComCache(100, new Map())).toBe(fibonacciIterativo(100));
    expect(fibonacciComCache(100, new Map()) > BigInt(Number.MAX_SAFE_INTEGER)).toBe(true);
    expect(tribonacciComCache(100, new Map())).toBe(tribonacciIterativo(100));
    expect(fatorialSemCache(100)).toBe(fatorialIterativo(100));
  });

  it('só guarda no Map recebido e nunca guarda casos base', () => {
    const cache = new Map<number, bigint>();
    tribonacciComCache(7, cache);
    expect([...cache.keys()].sort((a, b) => a - b)).toEqual([3, 4, 5, 6, 7]);
    expect(cache.get(7)).toBe(31n);

    const cacheFatorial = new Map<number, bigint>();
    fatorialComCache(5, cacheFatorial);
    expect([...cacheFatorial.keys()].sort((a, b) => a - b)).toEqual([2, 3, 4, 5]);

    const cacheFibonacci = new Map<number, bigint>();
    fibonacciComCache(1, cacheFibonacci);
    expect(cacheFibonacci.size).toBe(0);
  });

  it('reaproveita um Map já preenchido', () => {
    const cache = new Map<number, bigint>([[10, 999n]]);
    expect(fibonacciComCache(10, cache)).toBe(999n);
    expect(fibonacciComCache(11, cache)).toBe(999n + fibonacciIterativo(9));
  });
});
