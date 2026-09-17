import { EstatisticasTempoSchema } from '@sequencias/contrato';
import { describe, expect, it, vi } from 'vitest';
import { calibrar, medirTempo, medirTemposDosModos } from './tempo';

const RAPIDO = { duracaoMinimaNs: 1_000_000n, repeticoes: 3, coletar: () => undefined };

describe('calibrar', () => {
  it('para na primeira tentativa quando o bloco já é longo o bastante', () => {
    const medir = vi.fn(() => 500n);
    expect(calibrar(medir, 100n, 1_000)).toEqual({ execucoes: 1, aquecimentos: 1 });
    expect(medir).toHaveBeenCalledTimes(1);
  });

  it('cresce até o bloco alcançar a duração mínima', () => {
    const medir = vi.fn((execucoes: number) => BigInt(execucoes) * 10n);
    const { execucoes, aquecimentos } = calibrar(medir, 1_000n, 1_000_000);
    expect(execucoes).toBeGreaterThanOrEqual(100);
    expect(aquecimentos).toBeGreaterThanOrEqual(execucoes);
  });

  it('respeita o teto de execuções quando o bloco nunca alcança a mínima', () => {
    const { execucoes } = calibrar(() => 1n, 10_000_000n, 64);
    expect(execucoes).toBe(64);
  });
});

describe('medirTempo', () => {
  it('produz estatísticas válidas pelo schema do contrato', () => {
    const estatisticas = medirTempo('fibonacci', 20, 'sem_cache', RAPIDO);
    expect(EstatisticasTempoSchema.safeParse(estatisticas).success).toBe(true);
    expect(estatisticas.repeticoes).toBe(3);
    expect(estatisticas.aquecimentos).toBeGreaterThanOrEqual(1);
    expect(estatisticas.minimo_ns).toBeLessThanOrEqual(estatisticas.mediana_ns);
    expect(estatisticas.mediana_ns).toBeLessThanOrEqual(estatisticas.maximo_ns);
    expect(estatisticas.minimo_ns).toBeGreaterThan(0);
  });

  it('repete internamente quando o caso é rápido demais', () => {
    const estatisticas = medirTempo('fatorial', 5, 'sem_cache', RAPIDO);
    expect(estatisticas.execucoes_por_repeticao).toBeGreaterThan(1);
  });

  it('coleta lixo antes de cada bloco medido', () => {
    const coletar = vi.fn();
    medirTempo('fatorial', 5, 'com_cache', { ...RAPIDO, coletar });
    expect(coletar).toHaveBeenCalledTimes(3);
  });
});

describe('medirTemposDosModos', () => {
  it('mede os dois modos e registra a ordem pedida', () => {
    const resultado = medirTemposDosModos('fibonacci', 18, ['com_cache', 'sem_cache'], RAPIDO);
    expect(resultado.ordem_execucao).toEqual(['com_cache', 'sem_cache']);
    expect(resultado.repeticoes).toBe(3);
    expect(EstatisticasTempoSchema.safeParse(resultado.tempo.sem_cache).success).toBe(true);
    expect(EstatisticasTempoSchema.safeParse(resultado.tempo.com_cache).success).toBe(true);
  });

  it('mostra o cache muito mais rápido em fibonacci', () => {
    const { tempo } = medirTemposDosModos('fibonacci', 22, undefined, RAPIDO);
    expect(tempo.sem_cache.mediana_ns).toBeGreaterThan(tempo.com_cache.mediana_ns * 10);
  });

  it('encerra as rodadas ao estourar o orçamento de tempo', () => {
    const resultado = medirTemposDosModos('fibonacci', 20, undefined, {
      ...RAPIDO,
      repeticoes: 20,
      orcamentoNs: 1n,
    });
    expect(resultado.repeticoes).toBe(1);
    expect(resultado.tempo.sem_cache.repeticoes).toBe(1);
  });
});
