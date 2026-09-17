import { z } from 'zod';
import { type Ambiente, type Modo, type Sequencia } from './sequencias';

export const LimitesNSchema = z.object({
  sem_cache: z.number().int().nonnegative(),
  com_cache: z.number().int().nonnegative(),
});
export type LimitesN = z.infer<typeof LimitesNSchema>;

/**
 * Maior n aceito por sequência, modo e ambiente. Calibrado para que nenhum
 * cálculo sem cache passe de cerca de 10 s no Node. No navegador a pilha do
 * V8 não é configurável, por isso os limites são menores.
 */
export const LIMITES_N: Record<Ambiente, Record<Sequencia, LimitesN>> = {
  node: {
    fatorial: { sem_cache: 5000, com_cache: 5000 },
    fibonacci: { sem_cache: 35, com_cache: 5000 },
    tribonacci: { sem_cache: 30, com_cache: 5000 },
  },
  navegador: {
    fatorial: { sem_cache: 500, com_cache: 500 },
    fibonacci: { sem_cache: 25, com_cache: 500 },
    tribonacci: { sem_cache: 22, com_cache: 500 },
  },
};

export function limiteN(ambiente: Ambiente, sequencia: Sequencia, modo: Modo): number {
  return LIMITES_N[ambiente][sequencia][modo];
}

/** Orçamento de nós da árvore retornada pela API (padrão e teto). */
export const LIMITE_NOS_ARVORE_PADRAO = 300;
export const LIMITE_NOS_ARVORE_MAXIMO = 5000;

/** Acima deste número previsto de invocações o frontend pede confirmação. */
export const LIMIAR_CONFIRMACAO_INVOCACOES = 1_000_000;

/** Tempo limite padrão de um cálculo pesado, em milissegundos. */
export const TEMPO_LIMITE_MS_PADRAO = 15_000;

export const REPETICOES_PADRAO = 5;
export const REPETICOES_MAXIMO = 30;
export const PONTOS_SERIE_MAXIMO = 60;

/** A estimativa aceita n além dos limites de execução, só para informar o tamanho. */
export const N_MAXIMO_ESTIMATIVA = 100_000;
