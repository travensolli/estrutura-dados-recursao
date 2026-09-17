import {
  executarComInstrumentacao,
  RECORRENCIA_FATORIAL,
  RECORRENCIA_FIBONACCI,
  RECORRENCIA_TRIBONACCI,
  type OpcoesInstrumentacao,
  type ResultadoInstrumentado,
} from './instrumentacao';

export function fatorialSemCacheInstrumentado(
  n: number,
  opcoes?: OpcoesInstrumentacao,
): ResultadoInstrumentado {
  return executarComInstrumentacao(RECORRENCIA_FATORIAL, n, null, opcoes);
}

export function fatorialComCacheInstrumentado(
  n: number,
  cache: Map<number, bigint>,
  opcoes?: OpcoesInstrumentacao,
): ResultadoInstrumentado {
  return executarComInstrumentacao(RECORRENCIA_FATORIAL, n, cache, opcoes);
}

export function fibonacciSemCacheInstrumentado(
  n: number,
  opcoes?: OpcoesInstrumentacao,
): ResultadoInstrumentado {
  return executarComInstrumentacao(RECORRENCIA_FIBONACCI, n, null, opcoes);
}

export function fibonacciComCacheInstrumentado(
  n: number,
  cache: Map<number, bigint>,
  opcoes?: OpcoesInstrumentacao,
): ResultadoInstrumentado {
  return executarComInstrumentacao(RECORRENCIA_FIBONACCI, n, cache, opcoes);
}

export function tribonacciSemCacheInstrumentado(
  n: number,
  opcoes?: OpcoesInstrumentacao,
): ResultadoInstrumentado {
  return executarComInstrumentacao(RECORRENCIA_TRIBONACCI, n, null, opcoes);
}

export function tribonacciComCacheInstrumentado(
  n: number,
  cache: Map<number, bigint>,
  opcoes?: OpcoesInstrumentacao,
): ResultadoInstrumentado {
  return executarComInstrumentacao(RECORRENCIA_TRIBONACCI, n, cache, opcoes);
}
