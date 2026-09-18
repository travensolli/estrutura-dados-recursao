import { MODOS, SEQUENCIAS, type Modo, type Sequencia } from '@sequencias/contrato';
import { describe, expect, it } from 'vitest';
import { executarInstrumentado, executarPuro } from './fachadas';
import {
  fatorialComCacheInstrumentado,
  fatorialSemCacheInstrumentado,
  fibonacciComCacheInstrumentado,
  fibonacciSemCacheInstrumentado,
  tribonacciComCacheInstrumentado,
  tribonacciSemCacheInstrumentado,
} from './instrumentados';
import {
  fatorialComCache,
  fatorialSemCache,
  fibonacciComCache,
  fibonacciSemCache,
  tribonacciComCache,
  tribonacciSemCache,
} from './puros';
import { invocacoesPelaFormula, valorPeloOraculo } from './testes/oraculo';

const ATE_15 = Array.from({ length: 16 }, (_, i) => i);
const COMBINACOES = SEQUENCIAS.flatMap((s) => MODOS.map((m) => [s, m] as const));

function puraNomeada(sequencia: Sequencia, n: number, modo: Modo): bigint {
  if (modo === 'sem_cache') {
    if (sequencia === 'fatorial') return fatorialSemCache(n);
    if (sequencia === 'fibonacci') return fibonacciSemCache(n);
    return tribonacciSemCache(n);
  }
  if (sequencia === 'fatorial') return fatorialComCache(n, new Map());
  if (sequencia === 'fibonacci') return fibonacciComCache(n, new Map());
  return tribonacciComCache(n, new Map());
}

function instrumentadaNomeada(sequencia: Sequencia, n: number, modo: Modo) {
  if (modo === 'sem_cache') {
    if (sequencia === 'fatorial') return fatorialSemCacheInstrumentado(n);
    if (sequencia === 'fibonacci') return fibonacciSemCacheInstrumentado(n);
    return tribonacciSemCacheInstrumentado(n);
  }
  if (sequencia === 'fatorial') return fatorialComCacheInstrumentado(n, new Map());
  if (sequencia === 'fibonacci') return fibonacciComCacheInstrumentado(n, new Map());
  return tribonacciComCacheInstrumentado(n, new Map());
}

describe('executarPuro', () => {
  it.each(COMBINACOES)('%s %s devolve o mesmo valor da função nomeada', (sequencia, modo) => {
    for (const n of ATE_15) {
      const valor = executarPuro(sequencia, n, modo);
      expect(valor).toBe(puraNomeada(sequencia, n, modo));
      expect(valor).toBe(valorPeloOraculo(sequencia, n));
    }
  });

  it('mantém precisão acima de 2^53 - 1', () => {
    expect(executarPuro('fatorial', 25, 'com_cache').toString()).toBe('15511210043330985984000000');
    expect(executarPuro('fibonacci', 100, 'com_cache')).toBe(valorPeloOraculo('fibonacci', 100));
  });
});

describe('executarInstrumentado', () => {
  it.each(COMBINACOES)('%s %s repete valor, métricas e árvore da nomeada', (sequencia, modo) => {
    for (const n of [0, 1, 2, 3, 7, 10]) {
      const fachada = executarInstrumentado(sequencia, n, modo);
      const nomeada = instrumentadaNomeada(sequencia, n, modo);
      expect(fachada.valor).toBe(nomeada.valor);
      expect(fachada.metricas).toEqual(nomeada.metricas);
      expect(fachada.raiz).toEqual(nomeada.raiz);
      expect(fachada.truncada).toBe(nomeada.truncada);
      expect(fachada.nosExibidos).toBe(nomeada.nosExibidos);
    }
  });

  it.each(COMBINACOES)('%s %s bate com as fórmulas fechadas', (sequencia, modo) => {
    for (const n of ATE_15) {
      const { metricas } = executarInstrumentado(sequencia, n, modo, { comArvore: false });
      expect(metricas.invocacoes).toBe(invocacoesPelaFormula(sequencia, n, modo));
      expect(metricas.chamadas_recursivas).toBe(metricas.invocacoes - 1);
    }
  });

  it('confere os valores de referência de tribonacci f(7)', () => {
    const sem = executarInstrumentado('tribonacci', 7, 'sem_cache');
    expect(sem.valor).toBe(31n);
    expect(sem.metricas).toMatchObject({
      invocacoes: 46,
      chamadas_recursivas: 45,
      casos_base: 31,
      calculados: 15,
      acertos_cache: 0,
      entradas_cache: 0,
      profundidade_maxima: 6,
    });
    const com = executarInstrumentado('tribonacci', 7, 'com_cache');
    expect(com.metricas).toMatchObject({
      invocacoes: 16,
      calculados: 5,
      acertos_cache: 5,
      casos_base: 6,
      entradas_cache: 5,
    });
    expect(sem.metricas.invocacoes - com.metricas.invocacoes).toBe(30);
  });

  it('repassa as opções de instrumentação', () => {
    const semArvore = executarInstrumentado('tribonacci', 7, 'sem_cache', { comArvore: false });
    expect(semArvore.raiz).toBeNull();
    expect(semArvore.metricas.invocacoes).toBe(46);

    const limitada = executarInstrumentado('tribonacci', 7, 'sem_cache', { limiteNos: 10 });
    expect(limitada.nosExibidos).toBeLessThanOrEqual(10);
    expect(limitada.truncada).toBe(true);
    expect(limitada.metricas.invocacoes).toBe(46);

    const vistos: number[] = [];
    executarInstrumentado('fibonacci', 10, 'sem_cache', {
      comArvore: false,
      aoInvocar: (i) => vistos.push(i),
    });
    expect(vistos).toHaveLength(177);
  });
});

describe('as fachadas não guardam estado entre execuções', () => {
  it.each(COMBINACOES)('%s %s repete o resultado em três chamadas seguidas', (sequencia, modo) => {
    const primeira = executarInstrumentado(sequencia, 12, modo);
    const segunda = executarInstrumentado(sequencia, 12, modo);
    const terceira = executarInstrumentado(sequencia, 12, modo);
    expect(segunda.metricas).toEqual(primeira.metricas);
    expect(terceira.metricas).toEqual(primeira.metricas);
    expect(segunda.raiz).toEqual(primeira.raiz);
    expect(executarPuro(sequencia, 12, modo)).toBe(primeira.valor);
    expect(executarPuro(sequencia, 12, modo)).toBe(primeira.valor);
  });

  it('cria um cache novo a cada chamada com cache', () => {
    const primeira = executarInstrumentado('tribonacci', 7, 'com_cache');
    const segunda = executarInstrumentado('tribonacci', 7, 'com_cache');
    expect(segunda.metricas.invocacoes).toBe(16);
    expect(segunda.metricas.entradas_cache).toBe(5);
    expect(segunda.metricas.acertos_cache).toBe(primeira.metricas.acertos_cache);
  });

  it('n menor depois de n maior não aproveita cache antigo', () => {
    executarInstrumentado('fibonacci', 20, 'com_cache', { comArvore: false });
    const menor = executarInstrumentado('fibonacci', 10, 'com_cache', { comArvore: false });
    expect(menor.metricas.invocacoes).toBe(19);
    expect(menor.metricas.calculados).toBe(9);
  });
});
