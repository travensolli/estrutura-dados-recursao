import { MODOS, SEQUENCIAS } from '@sequencias/contrato';
import { describe, expect, it } from 'vitest';
import { executarMock, metricasMock } from './referencia-mock';

describe('referência dos mocks', () => {
  it.each(SEQUENCIAS.flatMap((sequencia) => MODOS.map((modo) => [sequencia, modo] as const)))(
    'métricas de %s %s são as mesmas com e sem árvore',
    (sequencia, modo) => {
      expect(metricasMock(sequencia, 10, modo)).toEqual(executarMock(sequencia, 10, modo).metricas);
    },
  );

  it.each(SEQUENCIAS)('contagem sem cache de %s bate com a execução real', (sequencia) => {
    for (let n = 0; n <= 12; n++) {
      expect(metricasMock(sequencia, n, 'sem_cache')).toEqual(
        executarMock(sequencia, n, 'sem_cache').metricas,
      );
    }
  });

  it('não aloca nós para execuções grandes', () => {
    const metricas = metricasMock('fibonacci', 30, 'sem_cache');
    expect(metricas.invocacoes).toBe(2 * 1346269 - 1);
    expect(metricas.valor).toBe('1346269');
  });

  it('conta o limite de tribonacci sem cache sem executar 57 milhões de chamadas', () => {
    const inicio = performance.now();
    const metricas = metricasMock('tribonacci', 30, 'sem_cache');
    expect(metricas.valor).toBe('37895489');
    expect(metricas.invocacoes).toBe((3 * 37895489 - 1) / 2);
    expect(metricas.profundidade_maxima).toBe(29);
    expect(performance.now() - inicio).toBeLessThan(500);
  });
});
