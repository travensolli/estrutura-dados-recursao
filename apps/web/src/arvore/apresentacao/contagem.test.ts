import { describe, expect, it } from 'vitest';
import { DURACAO_CONTAGEM_MS, instanteDaContagem, suavizar } from './contagem';

describe('curva da contagem', () => {
  it('vai de zero ao fim da duração', () => {
    expect(instanteDaContagem(0)).toBe(0);
    expect(instanteDaContagem(1)).toBe(DURACAO_CONTAGEM_MS);
    expect(instanteDaContagem(2)).toBe(DURACAO_CONTAGEM_MS);
  });

  it('é a inversa da suavização do contador', () => {
    for (const fracao of [0.1, 0.25, 0.5, 0.9]) {
      expect(suavizar(instanteDaContagem(fracao, 1))).toBeCloseTo(fracao, 10);
    }
  });
});
