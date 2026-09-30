import { queryOptions, useQuery } from '@tanstack/react-query';
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

/** Opções reusadas pelo gancho e por quem precisa da estimativa fora da renderização. */
export function opcoesEstimativa(entrada: EstimativaEntrada) {
  return queryOptions({
    queryKey: chaves.estimativa(entrada),
    queryFn: ({ signal }) => api.estimativa(entrada, signal),
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

/**
 * Execuções já feitas ficam como estão: voltar à tela não refaz a conta nem a
 * medição, e o tempo mostrado continua o mesmo. O resultado também não expira do
 * cache, porque a tela lembra qual execução mostrava (ver hooks/memoria).
 *
 * As consultas de execução não repassam o signal: com ele, sair da tela no meio
 * abortaria o pedido, e a volta mediria tudo de novo. A API termina a conta de
 * qualquer jeito, então o pedido segue e o resultado espera a volta. O Cancelar
 * continua valendo: o cancelQueries larga a espera na hora.
 */
export const OPCOES_EXECUCAO = {
  retry: false,
  refetchOnMount: false,
  gcTime: Number.POSITIVE_INFINITY,
} as const;

/** Cálculos pesados: sem repetição automática e habilitados só com entrada definida. */
export function useCalcular(entrada: CalcularEntrada | null) {
  return useQuery({
    queryKey: entrada ? chaves.calcular(entrada) : ['calcular', 'vazio'],
    queryFn: () => api.calcular(entrada as CalcularEntrada),
    enabled: entrada !== null,
    ...OPCOES_EXECUCAO,
  });
}

export function useComparar(entrada: CompararEntrada | null) {
  return useQuery({
    queryKey: entrada ? chaves.comparar(entrada) : ['comparar', 'vazio'],
    queryFn: () => api.comparar(entrada as CompararEntrada),
    enabled: entrada !== null,
    ...OPCOES_EXECUCAO,
  });
}

export function useSerie(entrada: SerieEntrada | null) {
  return useQuery({
    queryKey: entrada ? chaves.serie(entrada) : ['serie', 'vazia'],
    queryFn: () => api.serie(entrada as SerieEntrada),
    enabled: entrada !== null,
    ...OPCOES_EXECUCAO,
  });
}

export function useArvore(entrada: ArvoreEntrada | null) {
  return useQuery({
    queryKey: entrada ? chaves.arvore(entrada) : ['arvore', 'vazia'],
    queryFn: () => api.arvore(entrada as ArvoreEntrada),
    enabled: entrada !== null,
    ...OPCOES_EXECUCAO,
  });
}
