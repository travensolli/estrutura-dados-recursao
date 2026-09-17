import { REPETICOES_PADRAO, type Sequencia } from '@sequencias/contrato';

export interface CasoRelatorio {
  sequencia: Sequencia;
  ns: number[];
}

export interface PlanoRelatorio {
  repeticoes: number;
  /** Prazo de cada comparação: o relatório é lote, não pedido de interface. */
  prazo_ms: number;
  casos: CasoRelatorio[];
}

export const PRAZO_RELATORIO_MS = 60_000;

/**
 * O primeiro n de cada sequência é o do enunciado, para conferir os valores
 * de referência; os demais crescem até o maior n aceito pela API.
 */
export const PLANO_PADRAO: PlanoRelatorio = {
  repeticoes: REPETICOES_PADRAO,
  prazo_ms: PRAZO_RELATORIO_MS,
  casos: [
    { sequencia: 'fatorial', ns: [10, 100, 1000, 5000] },
    { sequencia: 'fibonacci', ns: [10, 25, 30, 35] },
    { sequencia: 'tribonacci', ns: [7, 20, 25, 30] },
  ],
};

export function totalDeComparacoes(plano: PlanoRelatorio): number {
  return plano.casos.reduce((total, caso) => total + caso.ns.length, 0);
}
