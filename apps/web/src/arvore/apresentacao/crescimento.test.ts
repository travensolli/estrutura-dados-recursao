import { describe, expect, it } from 'vitest';
import { executarMock } from '../../mocks/referencia-mock';
import { crescimentoSemCache, fatorPorPasso, N_MAXIMO_CRESCIMENTO } from './crescimento';
import { N_APRESENTACAO, SEQUENCIA_APRESENTACAO } from './slides';

const pontos = crescimentoSemCache(SEQUENCIA_APRESENTACAO, N_MAXIMO_CRESCIMENTO);

describe('crescimento das chamadas sem cache', () => {
  it('conta de f(0) até o último n, um ponto por n', () => {
    expect(pontos.map((ponto) => ponto.n)).toEqual(
      Array.from({ length: N_MAXIMO_CRESCIMENTO + 1 }, (_, n) => n),
    );
    expect(pontos.slice(0, 8).map((ponto) => ponto.invocacoes)).toEqual([
      1, 1, 1, 4, 7, 13, 25, 46,
    ]);
  });

  it('bate com a execução de referência em f(7)', () => {
    const referencia = executarMock(SEQUENCIA_APRESENTACAO, N_APRESENTACAO, 'sem_cache');
    expect(pontos[N_APRESENTACAO]?.invocacoes).toBe(referencia.metricas.invocacoes);
  });

  it('multiplica por perto de 1,84 a cada n a mais', () => {
    expect(fatorPorPasso(pontos)).toBeCloseTo(1.84, 2);
    expect(fatorPorPasso(pontos.slice(0, 1))).toBeNull();
  });
});
