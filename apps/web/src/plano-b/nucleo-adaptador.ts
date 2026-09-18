import type { OpcoesInstrumentacao, ResultadoInstrumentado } from '@sequencias/nucleo';
import { executarInstrumentado } from '@sequencias/nucleo';

export type { OpcoesInstrumentacao, ResultadoInstrumentado };

/**
 * Origem do cálculo do plano B: o mesmo núcleo que a API usa no servidor.
 * As contagens e a árvore saem idênticas às da API; só o relógio é do
 * navegador, por isso o tempo aparece marcado como indicativo.
 */
export { executarInstrumentado };
