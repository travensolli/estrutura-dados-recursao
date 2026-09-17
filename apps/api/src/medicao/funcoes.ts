import { type Sequencia } from '@sequencias/contrato';
import {
  fatorialComCache,
  fatorialSemCache,
  fibonacciComCache,
  fibonacciSemCache,
  tribonacciComCache,
  tribonacciSemCache,
} from '@sequencias/nucleo';

export type PuraSemCache = (n: number) => bigint;
export type PuraComCache = (n: number, cache: Map<number, bigint>) => bigint;

export const PURAS_SEM_CACHE: Record<Sequencia, PuraSemCache> = {
  fatorial: fatorialSemCache,
  fibonacci: fibonacciSemCache,
  tribonacci: tribonacciSemCache,
};

/**
 * Versões puras que recebem o Map de fora: a medição de memória precisa
 * continuar apontando para o cache depois do cálculo.
 */
export const PURAS_COM_CACHE: Record<Sequencia, PuraComCache> = {
  fatorial: fatorialComCache,
  fibonacci: fibonacciComCache,
  tribonacci: tribonacciComCache,
};
