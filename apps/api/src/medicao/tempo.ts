import {
  ErroSequencia,
  REPETICOES_PADRAO,
  type EstatisticasTempo,
  type Modo,
  type Sequencia,
} from '@sequencias/contrato';
import { executarPuro } from '@sequencias/nucleo';
import { coletarLixo } from './coleta-lixo';
import { resumirAmostras } from './estatisticas';
import { inverterOrdem, normalizarOrdem, porModo, type ParDeModos } from './modos';

/** Alvo de duração de cada bloco medido, para o relógio ter resolução suficiente. */
export const DURACAO_MINIMA_NS_PADRAO = 200_000_000n;
export const EXECUCOES_MAXIMAS_PADRAO = 1_000_000;
/** Teto de tempo total das repetições, para a medição caber no tempo limite. */
export const ORCAMENTO_NS_PADRAO = 8_000_000_000n;

export interface OpcoesTempo {
  repeticoes?: number;
  duracaoMinimaNs?: bigint;
  execucoesMaximas?: number;
  orcamentoNs?: bigint;
  coletar?: () => void;
}

export interface Calibragem {
  execucoes: number;
  aquecimentos: number;
}

export type MedidorDeBloco = (execucoes: number) => bigint;

/** Executa o cálculo puro `execucoes` vezes e devolve o total em nanossegundos. */
export function medirBloco(sequencia: Sequencia, n: number, modo: Modo, execucoes: number): bigint {
  const inicio = process.hrtime.bigint();
  let sumidouro = 0n;
  for (let i = 0; i < execucoes; i += 1) sumidouro = executarPuro(sequencia, n, modo);
  const fim = process.hrtime.bigint();
  // O sumidouro mantém o resultado em uso e impede o descarte do cálculo.
  if (sumidouro < 0n) throw new ErroSequencia('ERRO_INTERNO', 'Resultado negativo inesperado.');
  return fim - inicio;
}

/**
 * Aquece e descobre quantas execuções cabem em um bloco: cresce até o bloco
 * passar da duração mínima ou bater no teto de execuções.
 */
export function calibrar(
  medir: MedidorDeBloco,
  duracaoMinimaNs: bigint,
  execucoesMaximas: number,
): Calibragem {
  let execucoes = 1;
  let aquecimentos = 0;
  for (;;) {
    const gasto = medir(execucoes);
    aquecimentos += execucoes;
    if (gasto >= duracaoMinimaNs || execucoes >= execucoesMaximas) {
      return { execucoes, aquecimentos };
    }
    const fator = gasto > 0n ? Number(duracaoMinimaNs / gasto) + 1 : 2;
    execucoes = Math.min(execucoesMaximas, execucoes * Math.max(2, fator));
  }
}

function calibrarModo(sequencia: Sequencia, n: number, modo: Modo, opcoes: OpcoesTempo) {
  return calibrar(
    (execucoes) => medirBloco(sequencia, n, modo, execucoes),
    opcoes.duracaoMinimaNs ?? DURACAO_MINIMA_NS_PADRAO,
    opcoes.execucoesMaximas ?? EXECUCOES_MAXIMAS_PADRAO,
  );
}

function montarEstatisticas(
  amostras: readonly number[],
  repeticoes: number,
  calibragem: Calibragem,
): EstatisticasTempo {
  return {
    ...resumirAmostras(amostras),
    repeticoes,
    aquecimentos: calibragem.aquecimentos,
    execucoes_por_repeticao: calibragem.execucoes,
  };
}

/** Mede um modo isolado: aquecimento, calibragem e repetições com coleta antes de cada bloco. */
export function medirTempo(
  sequencia: Sequencia,
  n: number,
  modo: Modo,
  opcoes: OpcoesTempo = {},
): EstatisticasTempo {
  const repeticoes = opcoes.repeticoes ?? REPETICOES_PADRAO;
  const coletar = opcoes.coletar ?? coletarLixo;
  const calibragem = calibrarModo(sequencia, n, modo, opcoes);

  const amostras: number[] = [];
  for (let repeticao = 0; repeticao < repeticoes; repeticao += 1) {
    coletar();
    amostras.push(
      Number(medirBloco(sequencia, n, modo, calibragem.execucoes)) / calibragem.execucoes,
    );
  }

  return montarEstatisticas(amostras, repeticoes, calibragem);
}

export interface TemposDosModos {
  tempo: Record<Modo, EstatisticasTempo>;
  ordem_execucao: Modo[];
  repeticoes: number;
}

/**
 * Mede os dois modos intercalados: a cada rodada os modos trocam de posição e
 * o total respeita o orçamento de tempo, encerrando ao fim de uma rodada.
 */
export function medirTemposDosModos(
  sequencia: Sequencia,
  n: number,
  ordemPedida?: readonly Modo[],
  opcoes: OpcoesTempo = {},
): TemposDosModos {
  const ordem: ParDeModos = normalizarOrdem(ordemPedida);
  const repeticoesPedidas = opcoes.repeticoes ?? REPETICOES_PADRAO;
  const coletar = opcoes.coletar ?? coletarLixo;
  const orcamentoNs = opcoes.orcamentoNs ?? ORCAMENTO_NS_PADRAO;

  const calibragem = porModo(ordem, (modo) => calibrarModo(sequencia, n, modo, opcoes));
  const amostras = porModo(ordem, () => [] as number[]);

  const inicio = process.hrtime.bigint();
  let repeticoes = 0;
  for (let rodada = 0; rodada < repeticoesPedidas; rodada += 1) {
    for (const modo of rodada % 2 === 0 ? ordem : inverterOrdem(ordem)) {
      const execucoes = calibragem[modo].execucoes;
      coletar();
      amostras[modo].push(Number(medirBloco(sequencia, n, modo, execucoes)) / execucoes);
    }
    repeticoes += 1;
    if (process.hrtime.bigint() - inicio >= orcamentoNs) break;
  }

  return {
    tempo: porModo(ordem, (modo) =>
      montarEstatisticas(amostras[modo], repeticoes, calibragem[modo]),
    ),
    ordem_execucao: [...ordem],
    repeticoes,
  };
}
