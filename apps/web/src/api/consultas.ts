import { useQuery } from '@tanstack/react-query';
import {
  api,
  type ArvoreEntrada,
  type CalcularEntrada,
  type CompararEntrada,
  type EstimativaEntrada,
  type SerieEntrada,
} from './cliente';

export const chaves = {
  sequencias: ['sequencias'] as const,
  estimativa: (e: EstimativaEntrada) => ['estimativa', e] as const,
  calcular: (e: CalcularEntrada) => ['calcular', e] as const,
  comparar: (e: CompararEntrada) => ['comparar', e] as const,
  serie: (e: SerieEntrada) => ['serie', e] as const,
  arvore: (e: ArvoreEntrada) => ['arvore', e] as const,
};

export function useSequencias() {
  return useQuery({
    queryKey: chaves.sequencias,
    queryFn: ({ signal }) => api.sequencias(signal),
    staleTime: Number.POSITIVE_INFINITY,
  });
}

export function useEstimativa(entrada: EstimativaEntrada | null) {
  return useQuery({
    queryKey: entrada ? chaves.estimativa(entrada) : ['estimativa', 'vazia'],
    queryFn: ({ signal }) => api.estimativa(entrada as EstimativaEntrada, signal),
    enabled: entrada !== null,
    staleTime: Number.POSITIVE_INFINITY,
  });
}

/** Cálculos pesados: sem repetição automática e habilitados só com entrada definida. */
export function useCalcular(entrada: CalcularEntrada | null) {
  return useQuery({
    queryKey: entrada ? chaves.calcular(entrada) : ['calcular', 'vazio'],
    queryFn: ({ signal }) => api.calcular(entrada as CalcularEntrada, signal),
    enabled: entrada !== null,
    retry: false,
  });
}

export function useComparar(entrada: CompararEntrada | null) {
  return useQuery({
    queryKey: entrada ? chaves.comparar(entrada) : ['comparar', 'vazio'],
    queryFn: ({ signal }) => api.comparar(entrada as CompararEntrada, signal),
    enabled: entrada !== null,
    retry: false,
  });
}

export function useSerie(entrada: SerieEntrada | null) {
  return useQuery({
    queryKey: entrada ? chaves.serie(entrada) : ['serie', 'vazia'],
    queryFn: ({ signal }) => api.serie(entrada as SerieEntrada, signal),
    enabled: entrada !== null,
    retry: false,
  });
}

export function useArvore(entrada: ArvoreEntrada | null) {
  return useQuery({
    queryKey: entrada ? chaves.arvore(entrada) : ['arvore', 'vazia'],
    queryFn: ({ signal }) => api.arvore(entrada as ArvoreEntrada, signal),
    enabled: entrada !== null,
    retry: false,
  });
}
