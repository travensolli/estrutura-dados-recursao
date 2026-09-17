import { MemoriaModoSchema } from '@sequencias/contrato';
import {
  fatorialComCache,
  fatorialSemCache,
  fibonacciComCache,
  tribonacciComCache,
} from '@sequencias/nucleo';
import { describe, expect, it, vi } from 'vitest';
import { PURAS_COM_CACHE, PURAS_SEM_CACHE } from './funcoes';
import { medirMemoria, medirPicoDeHeap, medirRetencaoDoCache } from './memoria';

describe('funções usadas na medição de memória', () => {
  it('aponta para as versões puras do núcleo', () => {
    expect(PURAS_SEM_CACHE.fatorial).toBe(fatorialSemCache);
    expect(PURAS_COM_CACHE.fatorial).toBe(fatorialComCache);
    expect(PURAS_COM_CACHE.fibonacci).toBe(fibonacciComCache);
    expect(PURAS_COM_CACHE.tribonacci).toBe(tribonacciComCache);
  });
});

describe('medirRetencaoDoCache', () => {
  it('lê o heap apenas duas vezes por repetição, sem instrumentação ativa', () => {
    const heap = vi.fn(() => 1_000);
    const coletar = vi.fn();
    medirRetencaoDoCache('tribonacci', 12, 'com_cache', { repeticoes: 4, heap, coletar });
    expect(heap).toHaveBeenCalledTimes(8);
    expect(coletar).toHaveBeenCalledTimes(8);
  });

  it('devolve a mediana das diferenças de heap medidas', () => {
    const leituras = [0, 100, 0, 300, 0, 200];
    const heap = vi.fn(() => leituras.shift() ?? 0);
    const retida = medirRetencaoDoCache('fatorial', 10, 'com_cache', {
      repeticoes: 3,
      heap,
      coletar: () => undefined,
    });
    expect(retida).toBe(200);
  });

  it('mostra o cache retendo bem mais memória que a execução sem cache', () => {
    const comCache = medirRetencaoDoCache('fatorial', 1_200, 'com_cache', { repeticoes: 3 });
    const semCache = medirRetencaoDoCache('fatorial', 1_200, 'sem_cache', { repeticoes: 3 });
    expect(comCache).toBeGreaterThan(50_000);
    expect(comCache).toBeGreaterThan(semCache * 2);
  });
});

describe('medirPicoDeHeap', () => {
  it('amostra o heap a cada K invocações e devolve as métricas estruturais', () => {
    const heap = vi.fn(() => 5_000);
    const { pico_heap_bytes, metricas } = medirPicoDeHeap('tribonacci', 7, 'sem_cache', {
      intervaloAmostragem: 10,
      heap,
      coletar: () => undefined,
    });
    expect(metricas.invocacoes).toBe(46);
    expect(metricas.profundidade_maxima).toBe(6);
    expect(metricas.entradas_cache).toBe(0);
    expect(pico_heap_bytes).toBe(5_000);
    // 46 invocações: amostras em 10, 20, 30 e 40, mais a inicial e a final.
    expect(heap).toHaveBeenCalledTimes(6);
  });

  it('não amostra quando o intervalo é nulo, mas ainda mede a estrutura', () => {
    const heap = vi.fn(() => 1);
    const { pico_heap_bytes, metricas } = medirPicoDeHeap('tribonacci', 7, 'com_cache', {
      intervaloAmostragem: null,
      heap,
      coletar: () => undefined,
    });
    expect(pico_heap_bytes).toBeNull();
    expect(heap).not.toHaveBeenCalled();
    expect(metricas.invocacoes).toBe(16);
    expect(metricas.entradas_cache).toBe(5);
    expect(metricas.acertos_cache).toBe(5);
  });
});

describe('medirMemoria', () => {
  it('monta o bloco de memória de um modo no formato do contrato', () => {
    const resultado = medirMemoria('tribonacci', 15, 'com_cache', {
      repeticoes: 2,
      intervaloAmostragem: 5,
    });
    expect(MemoriaModoSchema.safeParse(resultado.memoria).success).toBe(true);
    expect(resultado.memoria.repeticoes).toBe(2);
    expect(resultado.memoria.intervalo_amostragem).toBe(5);
    expect(resultado.memoria.entradas_cache).toBe(13);
    expect(resultado.memoria.profundidade_maxima).toBe(14);
    expect(resultado.metricas.invocacoes).toBe(3 * 15 - 5);
  });

  it('não guarda entradas de cache no modo sem cache', () => {
    const resultado = medirMemoria('fibonacci', 18, 'sem_cache', {
      repeticoes: 1,
      intervaloAmostragem: 1_000,
    });
    expect(resultado.memoria.entradas_cache).toBe(0);
    expect(resultado.metricas.acertos_cache).toBe(0);
  });
});
