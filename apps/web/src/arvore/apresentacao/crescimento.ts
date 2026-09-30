import type { Sequencia } from '@sequencias/contrato';
import { executarInstrumentado } from '@sequencias/nucleo';

/** A curva passa de f(7) para mostrar para onde sobe; até f(10) o próprio f(7) ainda aparece. */
export const N_MAXIMO_CRESCIMENTO = 10;

export interface PontoCrescimento {
  n: number;
  invocacoes: number;
}

/**
 * Invocações sem cache de f(0) até f(ate), contadas pela versão instrumentada
 * do núcleo, a mesma da API e do plano B. Sem árvore: só a contagem importa.
 */
export function crescimentoSemCache(sequencia: Sequencia, ate: number): PontoCrescimento[] {
  return Array.from({ length: ate + 1 }, (_, n) => ({
    n,
    invocacoes: executarInstrumentado(sequencia, n, 'sem_cache', { comArvore: false }).metricas
      .invocacoes,
  }));
}

/** Quanto um n a mais multiplica as chamadas, medido nos dois últimos pontos. */
export function fatorPorPasso(pontos: readonly PontoCrescimento[]): number | null {
  const [penultimo, ultimo] = pontos.slice(-2);
  if (!penultimo || !ultimo || penultimo.invocacoes === 0) return null;
  return ultimo.invocacoes / penultimo.invocacoes;
}
