import { describe, expect, it } from 'vitest';
import { executarMock } from '../mocks/referencia-mock';
import { executarInstrumentado } from './nucleo-adaptador';

describe('executarInstrumentado', () => {
  it('reproduz as contagens do mock para tribonacci f(7)', () => {
    const sem = executarInstrumentado('tribonacci', 7, 'sem_cache', { comArvore: true });
    const com = executarInstrumentado('tribonacci', 7, 'com_cache', { comArvore: true });
    expect(sem.valor).toBe(31n);
    expect(sem.metricas.invocacoes).toBe(46);
    expect(com.metricas.invocacoes).toBe(16);
    expect(sem.metricas.invocacoes - com.metricas.invocacoes).toBe(30);
    expect(sem.nosExibidos).toBe(46);
    expect(com.nosExibidos).toBe(16);
    expect(sem.truncada).toBe(false);
    expect(sem.metricas).toEqual(executarMock('tribonacci', 7, 'sem_cache').metricas);
  });
  it('omite a árvore quando não pedida', () => {
    const r = executarInstrumentado('fibonacci', 10, 'com_cache');
    expect(r.raiz).toBeNull();
    expect(r.nosExibidos).toBe(0);
    expect(r.metricas.invocacoes).toBe(19);
  });
  it('trunca pelo limite de nós', () => {
    const r = executarInstrumentado('fibonacci', 12, 'sem_cache', {
      comArvore: true,
      limiteNos: 20,
    });
    expect(r.truncada).toBe(true);
    expect(r.nosExibidos).toBeLessThanOrEqual(20);
    expect(r.metricas.invocacoes).toBe(465);
  });
});
