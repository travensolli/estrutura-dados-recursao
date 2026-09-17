import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';
import {
  ESTADO_URL_PADRAO,
  enderecoComEstado,
  lerEstadoUrl,
  modoDeReferencia,
  modosDaExecucao,
  useEstadoUrl,
  type OpcoesEstadoUrl,
} from './useEstadoUrl';

function renderizar(rota: string, opcoes?: OpcoesEstadoUrl) {
  function Provedor({ children }: { children: ReactNode }) {
    return <MemoryRouter initialEntries={[rota]}>{children}</MemoryRouter>;
  }
  return renderHook(() => useEstadoUrl(opcoes), { wrapper: Provedor });
}

describe('lerEstadoUrl', () => {
  it('usa tribonacci, n 7 e sem cache quando o endereço está vazio', () => {
    expect(lerEstadoUrl(new URLSearchParams())).toEqual(ESTADO_URL_PADRAO);
  });

  it('lê os três parâmetros do endereço', () => {
    expect(lerEstadoUrl(new URLSearchParams('sequencia=fibonacci&n=10&modo=comparar'))).toEqual({
      sequencia: 'fibonacci',
      n: 10,
      modo: 'comparar',
    });
  });

  it.each(['sequencia=lucas', 'modo=memo', 'n=-3', 'n=2,5', 'n=abc', 'n=999999'])(
    'cai no padrão com %s',
    (consulta) => {
      expect(lerEstadoUrl(new URLSearchParams(consulta))).toEqual(ESTADO_URL_PADRAO);
    },
  );

  it('respeita padrão próprio e lista de modos permitidos', () => {
    const estado = lerEstadoUrl(new URLSearchParams('modo=comparar'), {
      padrao: { sequencia: 'fatorial', n: 25 },
      modosPermitidos: ['sem_cache', 'com_cache'],
    });
    expect(estado).toEqual({ sequencia: 'fatorial', n: 25, modo: 'sem_cache' });
  });
});

describe('useEstadoUrl', () => {
  it('devolve o estado do endereço', () => {
    const { result } = renderizar('/calcular?sequencia=fatorial&n=25&modo=com_cache');
    expect(result.current.estado).toEqual({ sequencia: 'fatorial', n: 25, modo: 'com_cache' });
  });

  it('grava só a chave alterada e preserva os outros parâmetros', () => {
    const { result } = renderizar('/calcular?sequencia=fibonacci&n=10&limite_nos=50');
    act(() => {
      result.current.definir({ n: 12 });
    });
    expect(result.current.estado).toEqual({ sequencia: 'fibonacci', n: 12, modo: 'sem_cache' });
  });

  it('mantém a mesma referência de definir entre renderizações', () => {
    const { result, rerender } = renderizar('/calcular');
    const primeira = result.current.definir;
    rerender();
    expect(result.current.definir).toBe(primeira);
  });
});

describe('auxiliares', () => {
  it('escolhe o modo de referência e os modos executados', () => {
    expect(modoDeReferencia('comparar')).toBe('sem_cache');
    expect(modoDeReferencia('com_cache')).toBe('com_cache');
    expect(modosDaExecucao('comparar')).toEqual(['sem_cache', 'com_cache']);
    expect(modosDaExecucao('com_cache')).toEqual(['com_cache']);
  });

  it('monta endereços de outras telas', () => {
    expect(enderecoComEstado('/arvore', { sequencia: 'tribonacci', n: 7, modo: 'sem_cache' })).toBe(
      '/arvore?sequencia=tribonacci&n=7&modo=sem_cache',
    );
    expect(enderecoComEstado('/calcular', { sequencia: 'fatorial' })).toBe(
      '/calcular?sequencia=fatorial',
    );
    expect(enderecoComEstado('/calcular', {})).toBe('/calcular');
  });
});
