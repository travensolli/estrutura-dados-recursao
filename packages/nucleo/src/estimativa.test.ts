import { MODOS, SEQUENCIAS, type Modo, type Sequencia } from '@sequencias/contrato';
import { describe, expect, it } from 'vitest';
import { estimarInvocacoes, estimarProfundidade } from './estimativa';
import {
  fatorialComCacheInstrumentado,
  fatorialSemCacheInstrumentado,
  fibonacciComCacheInstrumentado,
  fibonacciSemCacheInstrumentado,
  tribonacciComCacheInstrumentado,
  tribonacciSemCacheInstrumentado,
} from './instrumentados';
import { invocacoesPelaFormula, profundidadePelaFormula } from './testes/oraculo';

function instrumentar(sequencia: Sequencia, n: number, modo: Modo) {
  const opcoes = { comArvore: false };
  if (sequencia === 'fatorial') {
    return modo === 'com_cache'
      ? fatorialComCacheInstrumentado(n, new Map(), opcoes)
      : fatorialSemCacheInstrumentado(n, opcoes);
  }
  if (sequencia === 'fibonacci') {
    return modo === 'com_cache'
      ? fibonacciComCacheInstrumentado(n, new Map(), opcoes)
      : fibonacciSemCacheInstrumentado(n, opcoes);
  }
  return modo === 'com_cache'
    ? tribonacciComCacheInstrumentado(n, new Map(), opcoes)
    : tribonacciSemCacheInstrumentado(n, opcoes);
}

const COMBINACOES = SEQUENCIAS.flatMap((s) => MODOS.map((m) => [s, m] as const));

describe('estimarInvocacoes', () => {
  it.each(COMBINACOES)('%s %s bate com as métricas reais de 0 a 20', (sequencia, modo) => {
    for (let n = 0; n <= 20; n += 1) {
      const estimativa = estimarInvocacoes(sequencia, n, modo);
      expect(estimativa).toBe(BigInt(instrumentar(sequencia, n, modo).metricas.invocacoes));
      expect(estimativa).toBe(BigInt(invocacoesPelaFormula(sequencia, n, modo)));
    }
  });

  it('reproduz os exemplos do enunciado', () => {
    expect(estimarInvocacoes('tribonacci', 7, 'sem_cache')).toBe(46n);
    expect(estimarInvocacoes('tribonacci', 7, 'com_cache')).toBe(16n);
    expect(estimarInvocacoes('fibonacci', 10, 'sem_cache')).toBe(177n);
    expect(estimarInvocacoes('fibonacci', 10, 'com_cache')).toBe(19n);
    expect(estimarInvocacoes('fatorial', 10, 'sem_cache')).toBe(10n);
    expect(estimarInvocacoes('fatorial', 10, 'com_cache')).toBe(10n);
    expect(estimarInvocacoes('fatorial', 0, 'sem_cache')).toBe(1n);
  });

  it('aceita n grandes sem perder exatidão', () => {
    const fib200 = estimarInvocacoes('fibonacci', 200, 'sem_cache');
    expect(fib200 > BigInt(Number.MAX_SAFE_INTEGER)).toBe(true);
    expect(fib200 % 2n).toBe(1n);
    expect(estimarInvocacoes('tribonacci', 200, 'com_cache')).toBe(595n);
    expect(estimarInvocacoes('fibonacci', 5000, 'com_cache')).toBe(9999n);
    expect(estimarInvocacoes('fatorial', 5000, 'com_cache')).toBe(5000n);
  });
});

describe('estimarProfundidade', () => {
  it.each(COMBINACOES)('%s %s bate com a profundidade real de 0 a 20', (sequencia, modo) => {
    for (let n = 0; n <= 20; n += 1) {
      const profundidade = estimarProfundidade(sequencia, n);
      expect(profundidade).toBe(instrumentar(sequencia, n, modo).metricas.profundidade_maxima);
      expect(profundidade).toBe(profundidadePelaFormula(sequencia, n));
    }
  });

  it('vale 1 nos casos base e n - 1 em tribonacci', () => {
    expect(estimarProfundidade('fatorial', 0)).toBe(1);
    expect(estimarProfundidade('fibonacci', 1)).toBe(1);
    expect(estimarProfundidade('tribonacci', 2)).toBe(1);
    expect(estimarProfundidade('tribonacci', 7)).toBe(6);
    expect(estimarProfundidade('fibonacci', 7)).toBe(7);
  });
});
