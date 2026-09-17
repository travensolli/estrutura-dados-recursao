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

  it('não aloca nós para execuções grandes', () => {
    const metricas = metricasMock('fibonacci', 30, 'sem_cache');
    expect(metricas.invocacoes).toBe(2 * 1346269 - 1);
    expect(metricas.valor).toBe('1346269');
  });
});
