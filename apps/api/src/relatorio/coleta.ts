import { type CompararResposta } from '@sequencias/contrato';
import { config } from '../config';
import { REPETICOES_MEMORIA_PADRAO } from '../medicao/memoria';
import { DURACAO_MINIMA_NS_PADRAO, ORCAMENTO_NS_PADRAO } from '../medicao/tempo';
import { type PlanoRelatorio, totalDeComparacoes } from './plano';
import { executarTrabalho, pedidoDeComparacao } from '../trabalho/servico';

export interface ParametrosRelatorio {
  duracao_minima_bloco_ns: number;
  orcamento_comparacao_ns: number;
  repeticoes_memoria: number;
  intervalo_amostragem: number;
  prazo_ms: number;
  pilha_mb: number;
}

/** Registra a configuração vigente, para o relatório dizer como foi medido. */
export function coletarParametros(plano: PlanoRelatorio): ParametrosRelatorio {
  return {
    duracao_minima_bloco_ns: Number(DURACAO_MINIMA_NS_PADRAO),
    orcamento_comparacao_ns: Number(ORCAMENTO_NS_PADRAO),
    repeticoes_memoria: REPETICOES_MEMORIA_PADRAO,
    intervalo_amostragem: config.intervaloAmostragemMemoria,
    prazo_ms: plano.prazo_ms,
    pilha_mb: config.pilhaMb,
  };
}

export interface DadosRelatorio {
  gerado_em: string;
  duracao_total_ms: number;
  argumentos_node: string[];
  plano: PlanoRelatorio;
  parametros: ParametrosRelatorio;
  comparacoes: CompararResposta[];
}

export interface Progresso {
  indice: number;
  total: number;
  sequencia: string;
  n: number;
  duracao_ms: number | null;
}

export type AoAvancar = (progresso: Progresso) => void;

/** Roda o plano inteiro pelo mesmo caminho da rota /api/comparar. */
export async function coletarDados(
  plano: PlanoRelatorio,
  aoAvancar: AoAvancar = () => {},
): Promise<DadosRelatorio> {
  const total = totalDeComparacoes(plano);
  const comparacoes: CompararResposta[] = [];
  const inicio = Date.now();

  for (const caso of plano.casos) {
    for (const n of caso.ns) {
      const indice = comparacoes.length + 1;
      aoAvancar({ indice, total, sequencia: caso.sequencia, n, duracao_ms: null });
      const comeco = Date.now();
      comparacoes.push(
        await executarTrabalho(pedidoDeComparacao(caso.sequencia, n, plano.repeticoes), {
          tempoLimiteMs: plano.prazo_ms,
        }),
      );
      aoAvancar({ indice, total, sequencia: caso.sequencia, n, duracao_ms: Date.now() - comeco });
    }
  }

  return {
    gerado_em: new Date().toISOString(),
    duracao_total_ms: Date.now() - inicio,
    argumentos_node: [...process.execArgv],
    plano,
    parametros: coletarParametros(plano),
    comparacoes,
  };
}
