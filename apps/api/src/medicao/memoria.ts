import {
  ErroSequencia,
  type MemoriaModo,
  type Metricas,
  type Modo,
  type Sequencia,
} from '@sequencias/contrato';
import { executarInstrumentado } from '@sequencias/nucleo';
import { coletarLixo, heapUsado } from './coleta-lixo';
import { mediana } from './estatisticas';
import { PURAS_COM_CACHE, PURAS_SEM_CACHE } from './funcoes';

export const REPETICOES_MEMORIA_PADRAO = 3;
/** Uma amostra de heap a cada K invocações. */
export const INTERVALO_AMOSTRAGEM_PADRAO = 10_000;

export interface OpcoesMemoria {
  repeticoes?: number;
  /** Nulo desliga a amostragem do pico. */
  intervaloAmostragem?: number | null;
  coletar?: () => void;
  heap?: () => number;
}

function intervaloDe(opcoes: OpcoesMemoria): number | null {
  return opcoes.intervaloAmostragem === undefined
    ? INTERVALO_AMOSTRAGEM_PADRAO
    : opcoes.intervaloAmostragem;
}

/**
 * Diferença de heapUsed entre uma coleta antes do cálculo e outra depois, com
 * o cache ainda alcançável. Usa só as versões puras, sem instrumentação, e
 * devolve a mediana das repetições.
 */
export function medirRetencaoDoCache(
  sequencia: Sequencia,
  n: number,
  modo: Modo,
  opcoes: OpcoesMemoria = {},
): number {
  const repeticoes = opcoes.repeticoes ?? REPETICOES_MEMORIA_PADRAO;
  const coletar = opcoes.coletar ?? coletarLixo;
  const heap = opcoes.heap ?? heapUsado;
  const amostras: number[] = [];

  for (let repeticao = 0; repeticao < repeticoes; repeticao += 1) {
    const cache = modo === 'com_cache' ? new Map<number, bigint>() : null;
    coletar();
    const base = heap();
    const valor =
      cache === null ? PURAS_SEM_CACHE[sequencia](n) : PURAS_COM_CACHE[sequencia](n, cache);
    coletar();
    amostras.push(heap() - base);
    // Leitura tardia: mantém cache e valor alcançáveis durante as duas coletas.
    if (valor < 0n || (cache?.size ?? 0) < 0) {
      throw new ErroSequencia('ERRO_INTERNO', 'Medição de memória inconsistente.');
    }
  }

  return mediana(amostras);
}

export interface PicoEEstrutura {
  pico_heap_bytes: number | null;
  metricas: Metricas;
}

/** Pico aproximado de heap amostrado a cada K invocações, sem montar a árvore. */
export function medirPicoDeHeap(
  sequencia: Sequencia,
  n: number,
  modo: Modo,
  opcoes: OpcoesMemoria = {},
): PicoEEstrutura {
  const intervalo = intervaloDe(opcoes);
  const coletar = opcoes.coletar ?? coletarLixo;
  const heap = opcoes.heap ?? heapUsado;

  coletar();
  let pico = intervalo === null ? 0 : heap();
  const aoInvocar =
    intervalo === null
      ? undefined
      : (invocacoes: number) => {
          if (invocacoes % intervalo !== 0) return;
          const atual = heap();
          if (atual > pico) pico = atual;
        };

  const resultado = executarInstrumentado(sequencia, n, modo, { comArvore: false, aoInvocar });

  if (intervalo !== null) {
    const fim = heap();
    if (fim > pico) pico = fim;
  }

  return { pico_heap_bytes: intervalo === null ? null : pico, metricas: resultado.metricas };
}

export interface ResultadoMemoria {
  memoria: MemoriaModo;
  metricas: Metricas;
}

/** Junta retenção do cache, pico de heap e métricas estruturais de um modo. */
export function medirMemoria(
  sequencia: Sequencia,
  n: number,
  modo: Modo,
  opcoes: OpcoesMemoria = {},
): ResultadoMemoria {
  const repeticoes = opcoes.repeticoes ?? REPETICOES_MEMORIA_PADRAO;
  const retida = medirRetencaoDoCache(sequencia, n, modo, opcoes);
  const { pico_heap_bytes, metricas } = medirPicoDeHeap(sequencia, n, modo, opcoes);

  return {
    memoria: {
      retida_cache_bytes: retida,
      pico_heap_bytes,
      intervalo_amostragem: intervaloDe(opcoes),
      entradas_cache: metricas.entradas_cache,
      profundidade_maxima: metricas.profundidade_maxima,
      repeticoes,
    },
    metricas,
  };
}
