import type { Sequencia } from '@sequencias/contrato';
import { executarPuro } from '@sequencias/nucleo';
import { formatarInteiro } from '../utilitarios/formatar';

/**
 * O que uma sequência entrega às fórmulas gerais: a ordem k (chamadas
 * recursivas por caso não base) e a quantidade b de casos base, f(0) até
 * f(b − 1). O resto descreve o tipo da função para quem lê.
 */
export interface TipoSequencia {
  k: number;
  b: number;
  /** Tipo de recursão, pelo número de chamadas que cada caso não base abre. */
  recursao: string;
  /** Forma da árvore de chamadas sem cache. */
  arvore: string;
  /** Como a recorrência combina os termos anteriores. */
  combinacao: string;
  /** Tempo sem cache; com cache as três ficam em Θ(n). */
  complexidadeSemCache: string;
}

export const TIPOS: Record<Sequencia, TipoSequencia> = {
  fatorial: {
    k: 1,
    b: 2,
    recursao: 'linear',
    arvore: 'em corrente',
    combinacao: 'produto: n · f(n−1)',
    complexidadeSemCache: 'Θ(n)',
  },
  fibonacci: {
    k: 2,
    b: 2,
    recursao: 'dupla',
    arvore: 'binária',
    combinacao: 'soma dos 2 anteriores',
    complexidadeSemCache: 'Θ(φⁿ), φ ≈ 1,618',
  },
  tribonacci: {
    k: 3,
    b: 3,
    recursao: 'tripla',
    arvore: 'ternária',
    combinacao: 'soma dos 3 anteriores',
    complexidadeSemCache: 'Θ(τⁿ), τ ≈ 1,839',
  },
};

/** As fórmulas fechadas valem a partir de n = b − 1; b chega a 3 no Tribonacci. */
export const N_MINIMO_FORMULAS = 2;
/** Teto do exemplo: f(n) ainda cabe na tabela sem abreviar. */
export const N_MAXIMO_FORMULAS = 40;
export const N_EXEMPLO_FORMULAS = 7;

/** Um resultado junto da conta que leva até ele. */
export interface Conta {
  conta: string;
  resultado: bigint;
}

export interface CalculoSequencia {
  /** f(n), o valor da sequência. */
  valor: bigint;
  invocacoesSemCache: Conta;
  invocacoesComCache: Conta;
  evitadas: Conta;
  /** Valores guardados no cache: um por argumento de b até n. */
  entradasCache: Conta;
  /** Quadros simultâneos na pilha, iguais nos dois modos. */
  profundidade: Conta;
}

/**
 * Aplica as fórmulas gerais a uma sequência. Sem cache, a árvore é k-ária
 * cheia; com k ≥ 2 e todos os casos base valendo 1, cada folha soma 1 ao
 * resultado, então f(n) é o número de folhas e as invocações são
 * (k·f(n) − 1)/(k − 1). Com k = 1 a árvore é uma corrente de n − b + 2 nós.
 */
export function calcularFormulas(sequencia: Sequencia, n: number): CalculoSequencia {
  if (!Number.isInteger(n) || n < N_MINIMO_FORMULAS) {
    throw new RangeError(`as fórmulas fechadas valem para n ≥ ${N_MINIMO_FORMULAS}`);
  }
  const { k, b } = TIPOS[sequencia];
  const valor = executarPuro(sequencia, n, 'com_cache');
  const f = formatarInteiro(valor);

  const semCache: Conta =
    k === 1
      ? { conta: `${n} − ${b} + 2`, resultado: BigInt(n - b + 2) }
      : {
          conta: k === 2 ? `2 · ${f} − 1` : `(${k} · ${f} − 1) / ${k - 1}`,
          resultado: (BigInt(k) * valor - 1n) / BigInt(k - 1),
        };
  const comCache: Conta = {
    conta: `1 + ${k} · (${n} − ${b} + 1)`,
    resultado: BigInt(1 + k * (n - b + 1)),
  };

  return {
    valor,
    invocacoesSemCache: semCache,
    invocacoesComCache: comCache,
    evitadas: {
      conta: `${formatarInteiro(semCache.resultado)} − ${formatarInteiro(comCache.resultado)}`,
      resultado: semCache.resultado - comCache.resultado,
    },
    entradasCache: { conta: `${n} − ${b} + 1`, resultado: BigInt(n - b + 1) },
    profundidade: { conta: `${n} − ${b} + 2`, resultado: BigInt(n - b + 2) },
  };
}
