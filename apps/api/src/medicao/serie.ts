import {
  ErroSequencia,
  limiteN,
  type EstatisticasTempo,
  type Modo,
  type PontoSerie,
  type SerieResposta,
  type Sequencia,
} from '@sequencias/contrato';
import { estimarInvocacoes, executarPuro } from '@sequencias/nucleo';
import { coletarAmbiente } from './ambiente';
import { coletarLixo } from './coleta-lixo';
import { ORDEM_PADRAO, inverterOrdem } from './modos';
import { medirTempo, type OpcoesTempo } from './tempo';

/** Bloco curto: a série tem muitos pontos e serve para o formato da curva. */
export const DURACAO_BLOCO_SERIE_NS = 20_000_000n;
export const ORCAMENTO_SERIE_NS = 6_000_000_000n;
/** Blocos gastos na calibragem de cada modo, descontados do orçamento. */
const BLOCOS_DE_CALIBRAGEM = 2;

export interface ParametrosSerie {
  n_inicial: number;
  n_final: number;
  passo: number;
  repeticoes: number;
}

export interface OpcoesSerie {
  tempo?: OpcoesTempo;
  orcamentoNs?: bigint;
  coletar?: () => void;
}

export function pontosDaSerie(parametros: ParametrosSerie): number[] {
  const ns: number[] = [];
  for (let n = parametros.n_inicial; n <= parametros.n_final; n += parametros.passo) ns.push(n);
  return ns;
}

/** Com muitos pontos as repetições caem, para a série inteira caber no prazo. */
export function repeticoesQueCabem(
  pontos: number,
  repeticoesPedidas: number,
  orcamentoNs = ORCAMENTO_SERIE_NS,
  duracaoBlocoNs = DURACAO_BLOCO_SERIE_NS,
): number {
  const blocos = Number(orcamentoNs / duracaoBlocoNs);
  const medicoes = Math.max(1, pontos) * ORDEM_PADRAO.length;
  return Math.max(
    1,
    Math.min(repeticoesPedidas, Math.floor(blocos / medicoes) - BLOCOS_DE_CALIBRAGEM),
  );
}

/**
 * Acima do inteiro seguro a contagem deixa de ser exata em JSON; o valor
 * exato de qualquer n está em /api/estimativa, que devolve texto.
 */
export function paraInteiroSeguro(valor: bigint): number {
  const teto = BigInt(Number.MAX_SAFE_INTEGER);
  return Number(valor > teto ? teto : valor);
}

function exigirMedida(medida: EstatisticasTempo | undefined, modo: Modo): EstatisticasTempo {
  if (medida === undefined) {
    throw new ErroSequencia('ERRO_INTERNO', `O modo ${modo} não chegou a ser medido.`);
  }
  return medida;
}

/** Um ponto do gráfico: tempo dos dois modos e invocações previstas para o n. */
function medirPonto(
  sequencia: Sequencia,
  n: number,
  ordem: readonly Modo[],
  limiteSemCache: number,
  opcoes: OpcoesTempo,
): PontoSerie {
  const medidas: Partial<Record<Modo, EstatisticasTempo>> = {};
  for (const modo of ordem) {
    if (modo === 'sem_cache' && n > limiteSemCache) continue;
    medidas[modo] = medirTempo(sequencia, n, modo, opcoes);
  }
  return {
    n,
    digitos: executarPuro(sequencia, n, 'com_cache').toString().length,
    tempo_ns: {
      sem_cache: medidas.sem_cache?.mediana_ns ?? null,
      com_cache: exigirMedida(medidas.com_cache, 'com_cache').mediana_ns,
    },
    invocacoes: {
      sem_cache: paraInteiroSeguro(estimarInvocacoes(sequencia, n, 'sem_cache')),
      com_cache: paraInteiroSeguro(estimarInvocacoes(sequencia, n, 'com_cache')),
    },
  };
}

/**
 * Percorre os n pedidos medindo os dois modos em cada ponto. Acima do limite
 * do modo sem cache só o modo com cache é medido, e o tempo sem cache fica
 * nulo. A coleta de lixo acontece uma vez por ponto, não a cada bloco.
 */
export function medirSerie(
  sequencia: Sequencia,
  parametros: ParametrosSerie,
  opcoes: OpcoesSerie = {},
): SerieResposta {
  const ns = pontosDaSerie(parametros);
  const repeticoes = repeticoesQueCabem(
    ns.length,
    parametros.repeticoes,
    opcoes.orcamentoNs ?? ORCAMENTO_SERIE_NS,
    opcoes.tempo?.duracaoMinimaNs ?? DURACAO_BLOCO_SERIE_NS,
  );
  const limiteSemCache = limiteN('node', sequencia, 'sem_cache');
  const coletar = opcoes.coletar ?? coletarLixo;
  const semColeta = () => {};
  const opcoesTempo: OpcoesTempo = {
    duracaoMinimaNs: DURACAO_BLOCO_SERIE_NS,
    ...opcoes.tempo,
    repeticoes,
    coletar: semColeta,
  };

  const pontos = ns.map((n, indice) => {
    coletar();
    const ordem = indice % 2 === 0 ? ORDEM_PADRAO : inverterOrdem(ORDEM_PADRAO);
    return medirPonto(sequencia, n, ordem, limiteSemCache, opcoesTempo);
  });

  return {
    sequencia,
    n_inicial: parametros.n_inicial,
    n_final: parametros.n_final,
    passo: parametros.passo,
    repeticoes,
    pontos,
    ambiente: coletarAmbiente(),
  };
}
