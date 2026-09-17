import { type Modo, type Sequencia } from '@sequencias/contrato';
import { type OpcoesInstrumentacao, type ResultadoInstrumentado } from './instrumentacao';
import {
  fatorialComCacheInstrumentado,
  fatorialSemCacheInstrumentado,
  fibonacciComCacheInstrumentado,
  fibonacciSemCacheInstrumentado,
  tribonacciComCacheInstrumentado,
  tribonacciSemCacheInstrumentado,
} from './instrumentados';
import {
  fatorialComCache,
  fatorialSemCache,
  fibonacciComCache,
  fibonacciSemCache,
  tribonacciComCache,
  tribonacciSemCache,
} from './puros';

type PuraSemCache = (n: number) => bigint;
type PuraComCache = (n: number, cache: Map<number, bigint>) => bigint;
type InstrumentadaSemCache = (n: number, opcoes?: OpcoesInstrumentacao) => ResultadoInstrumentado;
type InstrumentadaComCache = (
  n: number,
  cache: Map<number, bigint>,
  opcoes?: OpcoesInstrumentacao,
) => ResultadoInstrumentado;

const PURAS_SEM_CACHE: Record<Sequencia, PuraSemCache> = {
  fatorial: fatorialSemCache,
  fibonacci: fibonacciSemCache,
  tribonacci: tribonacciSemCache,
};

const PURAS_COM_CACHE: Record<Sequencia, PuraComCache> = {
  fatorial: fatorialComCache,
  fibonacci: fibonacciComCache,
  tribonacci: tribonacciComCache,
};

const INSTRUMENTADAS_SEM_CACHE: Record<Sequencia, InstrumentadaSemCache> = {
  fatorial: fatorialSemCacheInstrumentado,
  fibonacci: fibonacciSemCacheInstrumentado,
  tribonacci: tribonacciSemCacheInstrumentado,
};

const INSTRUMENTADAS_COM_CACHE: Record<Sequencia, InstrumentadaComCache> = {
  fatorial: fatorialComCacheInstrumentado,
  fibonacci: fibonacciComCacheInstrumentado,
  tribonacci: tribonacciComCacheInstrumentado,
};

/**
 * Escolhe a versão pura por nome de sequência e modo. No modo com cache o Map
 * nasce aqui e morre ao fim da chamada: nenhum estado sobrevive entre execuções.
 */
export function executarPuro(sequencia: Sequencia, n: number, modo: Modo): bigint {
  if (modo === 'sem_cache') return PURAS_SEM_CACHE[sequencia](n);
  return PURAS_COM_CACHE[sequencia](n, new Map());
}

/** Mesma escolha por nome, agora na versão instrumentada. */
export function executarInstrumentado(
  sequencia: Sequencia,
  n: number,
  modo: Modo,
  opcoes?: OpcoesInstrumentacao,
): ResultadoInstrumentado {
  if (modo === 'sem_cache') return INSTRUMENTADAS_SEM_CACHE[sequencia](n, opcoes);
  return INSTRUMENTADAS_COM_CACHE[sequencia](n, new Map(), opcoes);
}
