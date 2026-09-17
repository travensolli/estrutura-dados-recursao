import { ErroSequencia } from '@sequencias/contrato';
import { describe, expect, it } from 'vitest';
import { desvioPadrao, media, mediana, resumirAmostras } from './estatisticas';

describe('mediana', () => {
  it('usa o valor central com quantidade ímpar', () => {
    expect(mediana([30, 10, 20])).toBe(20);
  });
  it('usa a média dos dois centrais com quantidade par', () => {
    expect(mediana([40, 10, 30, 20])).toBe(25);
  });
  it('não depende da ordem de entrada', () => {
    expect(mediana([5, 1, 4, 2, 3])).toBe(3);
  });
});

describe('media e desvio padrão', () => {
  it('calcula a média aritmética', () => {
    expect(media([10, 20, 30, 40])).toBe(25);
  });
  it('calcula o desvio padrão populacional', () => {
    expect(desvioPadrao([10, 20, 30, 40])).toBeCloseTo(Math.sqrt(125), 9);
  });
  it('devolve desvio zero para amostra única', () => {
    expect(desvioPadrao([7])).toBe(0);
  });
});

describe('resumirAmostras', () => {
  it('resume uma amostra conhecida', () => {
    expect(resumirAmostras([120, 100, 140, 160])).toEqual({
      mediana_ns: 130,
      media_ns: 130,
      minimo_ns: 100,
      maximo_ns: 160,
      desvio_padrao_ns: Math.sqrt(500),
    });
  });
  it('resume amostra única repetindo o mesmo valor', () => {
    expect(resumirAmostras([42])).toEqual({
      mediana_ns: 42,
      media_ns: 42,
      minimo_ns: 42,
      maximo_ns: 42,
      desvio_padrao_ns: 0,
    });
  });
  it('recusa lista vazia', () => {
    expect(() => resumirAmostras([])).toThrow(ErroSequencia);
  });
});
