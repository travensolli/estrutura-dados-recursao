import {
  ErroSequencia,
  REPETICOES_PADRAO,
  type CompararResposta,
  type Modo,
  type Sequencia,
} from '@sequencias/contrato';
import { coletarAmbiente } from './ambiente';
import { medirMemoria, type OpcoesMemoria } from './memoria';
import { normalizarOrdem, porModo } from './modos';
import { medirTemposDosModos, type OpcoesTempo } from './tempo';

export interface OpcoesComparacao {
  repeticoes?: number;
  /** Ordem em que os modos entram na primeira rodada. */
  ordem?: readonly Modo[];
  tempo?: OpcoesTempo;
  memoria?: OpcoesMemoria;
}

/**
 * Executa a comparação completa de um n: tempo dos dois modos intercalado,
 * memória de cada modo em execução separada e o ambiente da máquina.
 */
export function compararModos(
  sequencia: Sequencia,
  n: number,
  opcoes: OpcoesComparacao = {},
): CompararResposta {
  const ordem = normalizarOrdem(opcoes.ordem);
  const repeticoesPedidas = opcoes.repeticoes ?? REPETICOES_PADRAO;

  const { tempo, ordem_execucao, repeticoes } = medirTemposDosModos(sequencia, n, ordem, {
    ...opcoes.tempo,
    repeticoes: opcoes.tempo?.repeticoes ?? repeticoesPedidas,
  });

  const medicoes = porModo(ordem, (modo) => medirMemoria(sequencia, n, modo, opcoes.memoria));
  const semCache = medicoes.sem_cache.metricas;
  const comCache = medicoes.com_cache.metricas;
  if (semCache.valor !== comCache.valor) {
    throw new ErroSequencia('ERRO_INTERNO', 'Os dois modos chegaram a valores diferentes.');
  }

  const medianaSemCache = tempo.sem_cache.mediana_ns;
  const medianaComCache = tempo.com_cache.mediana_ns;

  return {
    sequencia,
    n,
    valor: comCache.valor,
    digitos: comCache.digitos,
    repeticoes,
    tempo,
    memoria: porModo(ordem, (modo) => medicoes[modo].memoria),
    invocacoes: { sem_cache: semCache.invocacoes, com_cache: comCache.invocacoes },
    fator_aceleracao: medianaComCache > 0 ? medianaSemCache / medianaComCache : 0,
    chamadas_evitadas: Math.max(0, semCache.invocacoes - comCache.invocacoes),
    diferenca_memoria_bytes:
      medicoes.com_cache.memoria.retida_cache_bytes - medicoes.sem_cache.memoria.retida_cache_bytes,
    ordem_execucao,
    ambiente: coletarAmbiente(),
  };
}
