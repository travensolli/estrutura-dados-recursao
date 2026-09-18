import { renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useConsultaMidia, usePrefereMenosMovimento } from './midia';

function simularMidia(correspondencias: Record<string, boolean>) {
  vi.stubGlobal('matchMedia', (consulta: string) => ({
    media: consulta,
    matches: correspondencias[consulta] ?? false,
    addEventListener: () => {},
    removeEventListener: () => {},
  }));
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('useConsultaMidia', () => {
  it('devolve o resultado da consulta', () => {
    simularMidia({ '(min-width: 50rem)': true });
    const { result } = renderHook(() => useConsultaMidia('(min-width: 50rem)'));
    expect(result.current).toBe(true);
  });

  it('reconhece a preferência por menos movimento', () => {
    simularMidia({ '(prefers-reduced-motion: reduce)': true });
    const { result } = renderHook(() => usePrefereMenosMovimento());
    expect(result.current).toBe(true);
  });
});
