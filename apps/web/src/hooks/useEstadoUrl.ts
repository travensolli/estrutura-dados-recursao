import {
  MODOS,
  N_MAXIMO_ESTIMATIVA,
  REPETICOES_MAXIMO,
  REPETICOES_PADRAO,
  SEQUENCIAS,
  type Modo,
  type Sequencia,
} from '@sequencias/contrato';
import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router';
import { validarInteiro } from '../utilitarios/validacao';

/** Modos da interface: os dois do contrato mais a comparação lado a lado. */
export const MODOS_TELA = [...MODOS, 'comparar'] as const;
export type ModoTela = (typeof MODOS_TELA)[number];

export interface EstadoUrl {
  sequencia: Sequencia;
  n: number;
  modo: ModoTela;
  /** Quantas vezes a comparação repete cada execução. */
  repeticoes: number;
}

export type EstadoUrlParcial = Partial<EstadoUrl>;

export const ESTADO_URL_PADRAO: EstadoUrl = {
  sequencia: 'tribonacci',
  n: 7,
  modo: 'sem_cache',
  repeticoes: REPETICOES_PADRAO,
};

export interface OpcoesEstadoUrl {
  padrao?: EstadoUrlParcial;
  /** Modos aceitos nesta tela; qualquer outro valor cai no padrão. */
  modosPermitidos?: readonly ModoTela[];
}

export interface UsoEstadoUrl {
  estado: EstadoUrl;
  definir: (parcial: EstadoUrlParcial, opcoes?: { substituir?: boolean }) => void;
}

function ehSequencia(valor: string | null): valor is Sequencia {
  return valor !== null && (SEQUENCIAS as readonly string[]).includes(valor);
}

function ehModoTela(valor: string | null, permitidos: readonly ModoTela[]): valor is ModoTela {
  return valor !== null && (permitidos as readonly string[]).includes(valor);
}

/** Modo do contrato usado para limites e estimativa; comparar segue o sem cache, o mais caro. */
export function modoDeReferencia(modo: ModoTela): Modo {
  return modo === 'com_cache' ? 'com_cache' : 'sem_cache';
}

/** Modos executados de fato: comparar roda os dois, sempre sem cache primeiro. */
export function modosDaExecucao(modo: ModoTela): readonly Modo[] {
  if (modo === 'comparar') return MODOS;
  return [modo];
}

export function lerEstadoUrl(parametros: URLSearchParams, opcoes: OpcoesEstadoUrl = {}): EstadoUrl {
  const { padrao, modosPermitidos = MODOS_TELA } = opcoes;
  const base = { ...ESTADO_URL_PADRAO, ...padrao };
  const modoPadrao = ehModoTela(base.modo, modosPermitidos)
    ? base.modo
    : (modosPermitidos[0] ?? ESTADO_URL_PADRAO.modo);

  const sequencia = parametros.get('sequencia');
  const modo = parametros.get('modo');
  const n = parametros.get('n');
  const nLido = n === null ? null : validarInteiro(n, { minimo: 0, maximo: N_MAXIMO_ESTIMATIVA });
  const repeticoes = parametros.get('repeticoes');
  const repeticoesLidas =
    repeticoes === null
      ? null
      : validarInteiro(repeticoes, { minimo: 1, maximo: REPETICOES_MAXIMO });

  return {
    sequencia: ehSequencia(sequencia) ? sequencia : base.sequencia,
    n: nLido?.valido ? nLido.valor : base.n,
    modo: ehModoTela(modo, modosPermitidos) ? modo : modoPadrao,
    repeticoes: repeticoesLidas?.valido ? repeticoesLidas.valor : base.repeticoes,
  };
}

/** Grava só as chaves informadas, preservando os demais parâmetros do endereço. */
export function escreverEstadoUrl(
  parametros: URLSearchParams,
  parcial: EstadoUrlParcial,
): URLSearchParams {
  const proximos = new URLSearchParams(parametros);
  if (parcial.sequencia !== undefined) proximos.set('sequencia', parcial.sequencia);
  if (parcial.n !== undefined) proximos.set('n', String(parcial.n));
  if (parcial.modo !== undefined) proximos.set('modo', parcial.modo);
  if (parcial.repeticoes !== undefined) proximos.set('repeticoes', String(parcial.repeticoes));
  return proximos;
}

/** Endereço de outra tela já com o estado, para links entre Início, Calcular e Árvore. */
export function enderecoComEstado(caminho: string, parcial: EstadoUrlParcial): string {
  const consulta = escreverEstadoUrl(new URLSearchParams(), parcial).toString();
  return consulta === '' ? caminho : `${caminho}?${consulta}`;
}

/**
 * Sequência, n, modo e repetições lidos e validados do endereço, com padrões e
 * escrita parcial.
 * Use um objeto de opções constante para o estado manter a mesma referência.
 */
export function useEstadoUrl(opcoes: OpcoesEstadoUrl = {}): UsoEstadoUrl {
  const [parametros, definirParametros] = useSearchParams();
  const { padrao, modosPermitidos } = opcoes;
  const consulta = parametros.toString();

  const estado = useMemo(
    () => lerEstadoUrl(new URLSearchParams(consulta), { padrao, modosPermitidos }),
    [consulta, padrao, modosPermitidos],
  );

  const definir = useCallback(
    (parcial: EstadoUrlParcial, { substituir = false }: { substituir?: boolean } = {}) => {
      definirParametros((anteriores) => escreverEstadoUrl(anteriores, parcial), {
        replace: substituir,
      });
    },
    [definirParametros],
  );

  return { estado, definir };
}
