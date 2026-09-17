import {
  DESCRICAO_SEQUENCIAS,
  LIMIAR_CONFIRMACAO_INVOCACOES,
  limiteN,
  type EstimativaResposta,
  type Modo,
  type Sequencia,
} from '@sequencias/contrato';
import { estimarInvocacoes, estimarProfundidade } from '@sequencias/nucleo';

/**
 * Acima desta profundidade a estimativa vai para o worker, que tem a pilha
 * ampliada: obter o valor exato de Fibonacci ou Tribonacci sem cache exige
 * uma cadeia de n chamadas.
 */
export const PROFUNDIDADE_SEGURA_ESTIMATIVA = 3000;

export function profundidadeDaEstimativa(sequencia: Sequencia, n: number, modo: Modo): number {
  if (modo === 'com_cache' || sequencia === 'fatorial') return 0;
  return n;
}

export function estimativaPrecisaDeWorker(
  sequencia: Sequencia,
  n: number,
  modo: Modo,
  profundidadeSegura = PROFUNDIDADE_SEGURA_ESTIMATIVA,
): boolean {
  return profundidadeDaEstimativa(sequencia, n, modo) > profundidadeSegura;
}

/** Números longos demais para ler viram notação científica aproximada. */
export function descreverQuantidade(valor: bigint): string {
  const texto = valor.toString();
  if (texto.length <= 15) return valor.toLocaleString('pt-BR');
  return `cerca de ${texto[0]},${texto.slice(1, 3)} × 10^${texto.length - 1}`;
}

function montarAviso(
  sequencia: Sequencia,
  modo: Modo,
  limite: number,
  dentroDoLimite: boolean,
  previstas: bigint,
  pesado: boolean,
): string | null {
  const nome = DESCRICAO_SEQUENCIAS[sequencia].nome;
  const comOuSem = modo === 'sem_cache' ? 'sem cache' : 'com cache';
  if (!dentroDoLimite) {
    return `A API executa ${nome} ${comOuSem} até n = ${limite}. Acima disso a previsão é só informativa.`;
  }
  if (pesado) {
    return `São ${descreverQuantidade(previstas)} invocações: o cálculo pode levar alguns segundos.`;
  }
  return null;
}

/** Previsão pelas fórmulas fechadas, sem executar a recursão do cálculo. */
export function montarEstimativa(sequencia: Sequencia, n: number, modo: Modo): EstimativaResposta {
  const previstas = estimarInvocacoes(sequencia, n, modo);
  const limite = limiteN('node', sequencia, modo);
  const dentro_do_limite = n <= limite;
  const pesado = previstas > BigInt(LIMIAR_CONFIRMACAO_INVOCACOES);
  return {
    sequencia,
    n,
    modo,
    invocacoes_previstas: previstas.toString(),
    profundidade_prevista: estimarProfundidade(sequencia, n),
    limite_n: limite,
    dentro_do_limite,
    pesado,
    aviso: montarAviso(sequencia, modo, limite, dentro_do_limite, previstas, pesado),
  };
}
