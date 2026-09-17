import type { Metricas, Modo, No, Sequencia } from '@sequencias/contrato';
import { executarMock, truncarArvore } from '../mocks/referencia-mock';

export interface OpcoesExecucao {
  comArvore?: boolean;
  limiteNos?: number;
}

export interface ResultadoInstrumentado {
  valor: bigint;
  metricas: Metricas;
  raiz: No | null;
  truncada: boolean;
  nosExibidos: number;
}

/**
 * Ponto único de troca do plano B. Enquanto o núcleo não está integrado, o
 * cálculo vem de `executarMock` e `truncarArvore` (src/mocks/referencia-mock).
 * Na integração, apagar o corpo desta função e delegar para
 * `executarInstrumentado` de `@sequencias/nucleo`, que tem a mesma assinatura;
 * nenhum outro arquivo de src/plano-b, src/arvore ou src/trabalhadores muda.
 */
export function executarInstrumentado(
  sequencia: Sequencia,
  n: number,
  modo: Modo,
  opcoes: OpcoesExecucao = {},
): ResultadoInstrumentado {
  const { metricas, raiz } = executarMock(sequencia, n, modo);
  const valor = BigInt(metricas.valor);
  if (!opcoes.comArvore) return { valor, metricas, raiz: null, truncada: false, nosExibidos: 0 };
  const truncamento = truncarArvore(raiz, opcoes.limiteNos ?? Number.POSITIVE_INFINITY);
  return {
    valor,
    metricas,
    raiz: truncamento.raiz,
    truncada: truncamento.truncada,
    nosExibidos: truncamento.nos,
  };
}
