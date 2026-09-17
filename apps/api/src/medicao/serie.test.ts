import { SerieRespostaSchema } from '@sequencias/contrato';
import { describe, expect, it } from 'vitest';
import {
  medirSerie,
  paraInteiroSeguro,
  pontosDaSerie,
  repeticoesQueCabem,
  type OpcoesSerie,
} from './serie';

const RAPIDA: OpcoesSerie = { tempo: { duracaoMinimaNs: 1n }, coletar: () => {} };

describe('pontosDaSerie', () => {
  it('respeita o passo e inclui o extremo quando ele cai na grade', () => {
    expect(pontosDaSerie({ n_inicial: 1, n_final: 5, passo: 1, repeticoes: 1 })).toEqual([
      1, 2, 3, 4, 5,
    ]);
    expect(pontosDaSerie({ n_inicial: 0, n_final: 10, passo: 4, repeticoes: 1 })).toEqual([
      0, 4, 8,
    ]);
  });
});

describe('repeticoesQueCabem', () => {
  it('mantém as repetições pedidas quando a série é curta', () => {
    expect(repeticoesQueCabem(5, 3)).toBe(3);
  });

  it('reduz as repetições quando a série tem pontos demais', () => {
    expect(repeticoesQueCabem(60, 30)).toBeLessThan(30);
    expect(repeticoesQueCabem(60, 30)).toBeGreaterThanOrEqual(1);
  });

  it('nunca desce abaixo de uma repetição', () => {
    expect(repeticoesQueCabem(1000, 10)).toBe(1);
  });
});

describe('paraInteiroSeguro', () => {
  it('converte o que cabe e limita o que não cabe', () => {
    expect(paraInteiroSeguro(46n)).toBe(46);
    expect(paraInteiroSeguro(10n ** 40n)).toBe(Number.MAX_SAFE_INTEGER);
  });
});

describe('medirSerie', () => {
  it('mede os dois modos em cada ponto do fatorial', () => {
    const serie = medirSerie(
      'fatorial',
      { n_inicial: 1, n_final: 5, passo: 1, repeticoes: 1 },
      RAPIDA,
    );
    expect(SerieRespostaSchema.parse(serie)).toEqual(serie);
    expect(serie.pontos.map((ponto) => ponto.n)).toEqual([1, 2, 3, 4, 5]);
    for (const ponto of serie.pontos) {
      expect(ponto.tempo_ns.sem_cache).toBeGreaterThan(0);
      expect(ponto.tempo_ns.com_cache).toBeGreaterThan(0);
      expect(ponto.invocacoes.sem_cache).toBe(ponto.invocacoes.com_cache);
    }
    expect(serie.pontos[4]?.digitos).toBe(3);
  });

  it('conta as invocações previstas de tribonacci ponto a ponto', () => {
    const serie = medirSerie(
      'tribonacci',
      { n_inicial: 7, n_final: 7, passo: 1, repeticoes: 1 },
      RAPIDA,
    );
    expect(serie.pontos[0]?.invocacoes).toEqual({ sem_cache: 46, com_cache: 16 });
  });

  it('deixa o tempo sem cache nulo acima do limite do modo', () => {
    const serie = medirSerie(
      'fibonacci',
      { n_inicial: 34, n_final: 36, passo: 1, repeticoes: 1 },
      RAPIDA,
    );
    const acimaDoLimite = serie.pontos.at(-1);
    expect(acimaDoLimite?.n).toBe(36);
    expect(acimaDoLimite?.tempo_ns.sem_cache).toBeNull();
    expect(acimaDoLimite?.tempo_ns.com_cache).toBeGreaterThan(0);
    expect(acimaDoLimite?.invocacoes.sem_cache).toBe(48315633);
    expect(serie.pontos[0]?.tempo_ns.sem_cache).toBeGreaterThan(0);
  });
});
