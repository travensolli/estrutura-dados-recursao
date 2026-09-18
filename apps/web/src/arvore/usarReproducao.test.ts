import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { executarInstrumentado } from '../plano-b/nucleo-adaptador';
import { achatarNos, cacheNoPasso, pilhaNoPasso, totalPassos } from './modelo';
import { INTERVALO_BASE, useReproducao } from './usarReproducao';

const semCache = executarInstrumentado('tribonacci', 7, 'sem_cache', { comArvore: true });
const comCache = executarInstrumentado('tribonacci', 7, 'com_cache', { comArvore: true });
const raizSem = semCache.raiz!;
const raizCom = comCache.raiz!;
const total = totalPassos(raizSem);

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe('useReproducao', () => {
  it('começa parada no passo 0 e conhece os limites', () => {
    const { result } = renderHook(() => useReproducao(total));
    expect(result.current.passo).toBe(0);
    expect(result.current.total).toBe(92);
    expect(result.current.ultimoPasso).toBe(91);
    expect(result.current.tocando).toBe(false);
    expect(result.current.noInicio).toBe(true);
    expect(result.current.noFim).toBe(false);
  });

  it('avança, volta e prende nas pontas', () => {
    const { result } = renderHook(() => useReproducao(total));
    act(() => result.current.avancar());
    act(() => result.current.avancar());
    expect(result.current.passo).toBe(2);
    act(() => result.current.voltar());
    expect(result.current.passo).toBe(1);
    act(() => result.current.irPara(-5));
    expect(result.current.passo).toBe(0);
    act(() => result.current.voltar());
    expect(result.current.passo).toBe(0);
    act(() => result.current.irPara(9999));
    expect(result.current.passo).toBe(91);
    expect(result.current.noFim).toBe(true);
  });

  it('toca no ritmo da velocidade e para no fim', () => {
    const { result } = renderHook(() => useReproducao(total));
    act(() => result.current.alternarToque());
    expect(result.current.tocando).toBe(true);

    act(() => vi.advanceTimersByTime(INTERVALO_BASE));
    expect(result.current.passo).toBe(1);

    act(() => result.current.definirVelocidade(4));
    act(() => vi.advanceTimersByTime(INTERVALO_BASE / 4));
    expect(result.current.passo).toBe(2);

    // cada passo agenda o próximo: é preciso deixar o React renderizar entre eles
    for (let i = 0; i < 200 && !result.current.noFim; i += 1) {
      act(() => vi.advanceTimersByTime(INTERVALO_BASE));
    }
    expect(result.current.passo).toBe(91);
    expect(result.current.tocando).toBe(false);
  });

  it('navegar na mão pausa a reprodução', () => {
    const { result } = renderHook(() => useReproducao(total));
    act(() => result.current.alternarToque());
    act(() => result.current.avancar());
    expect(result.current.tocando).toBe(false);
    expect(result.current.passo).toBe(1);
  });

  it('tocar no fim recomeça do início', () => {
    const { result } = renderHook(() => useReproducao(total));
    act(() => result.current.paraOFim());
    act(() => result.current.alternarToque());
    expect(result.current.passo).toBe(0);
    expect(result.current.tocando).toBe(true);
  });

  it('não deixa temporizador pendurado ao desmontar', () => {
    const { result, unmount } = renderHook(() => useReproducao(total));
    act(() => result.current.alternarToque());
    expect(vi.getTimerCount()).toBe(1);
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });
});

describe('passos contra o modelo da árvore', () => {
  it('a pilha de tribonacci f(7) sem cache acompanha o relógio', () => {
    const nos = achatarNos(raizSem);
    const { result } = renderHook(() => useReproducao(total));
    const pilha = () => pilhaNoPasso(nos, result.current.passo).map((no) => no.argumento);

    expect(pilha()).toEqual([7]);
    for (let i = 0; i < 5; i += 1) act(() => result.current.avancar());
    expect(result.current.passo).toBe(5);
    expect(pilha()).toEqual([7, 6, 5, 4, 3, 2]);

    act(() => result.current.paraOFim());
    expect(pilha()).toEqual([]);
  });

  it('o dicionário com cache enche até as 5 entradas', () => {
    const nos = achatarNos(raizCom);
    const { result } = renderHook(() => useReproducao(totalPassos(raizCom)));
    expect(cacheNoPasso(nos, result.current.passo)).toEqual([]);

    act(() => result.current.paraOFim());
    const final = cacheNoPasso(nos, result.current.passo);
    expect(final.map((entrada) => entrada.argumento)).toEqual([3, 4, 5, 6, 7]);
    expect(final).toHaveLength(comCache.metricas.entradas_cache);
  });
});
