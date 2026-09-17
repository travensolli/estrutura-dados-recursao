import {
  DESCRICAO_SEQUENCIAS,
  type ArvoreResposta,
  type DescricaoSequencia,
  type Sequencia,
} from '@sequencias/contrato';
import { useMemo } from 'react';
import { useSequencias } from '../../api/consultas';
import type { ConsultaArvore } from '../consulta';
import { useArvoreComPlanoB } from '../usarArvore';
import { montarArvoreComEvitadas, parcelasEvitadas, type ArvoreComEvitadas } from './evitadas';
import { LIMITE_NOS_APRESENTACAO, N_APRESENTACAO, SEQUENCIA_APRESENTACAO } from './etapas';

export const CONSULTA_SEM_CACHE: ConsultaArvore = {
  sequencia: SEQUENCIA_APRESENTACAO,
  n: N_APRESENTACAO,
  modo: 'sem_cache',
  limite_nos: LIMITE_NOS_APRESENTACAO,
};

export const CONSULTA_COM_CACHE: ConsultaArvore = {
  ...CONSULTA_SEM_CACHE,
  modo: 'com_cache',
};

export interface LinhaArgumento {
  argumento: number;
  semCache: number;
  comCache: number;
  evitadas: number;
}

export interface Comparacao {
  invocacoesSemCache: number;
  invocacoesComCache: number;
  /** Diferença entre os totais de invocações. */
  evitadas: number;
  recursivasSemCache: number;
  recursivasComCache: number;
  /** Mesma diferença, medida pelas chamadas recursivas. */
  diferencaRecursivas: number;
  /** Uma parcela por acerto, da maior para a menor. */
  parcelas: number[];
  somaParcelas: number;
  /** Verdadeiro quando as três contas dão o mesmo número. */
  provasConferem: boolean;
  linhas: LinhaArgumento[];
  maiorInvocacao: number;
  argumentoMaisChamado: LinhaArgumento | null;
}

function porArgumento(resposta: ArvoreResposta): Map<number, number> {
  return new Map(
    resposta.metricas.invocacoes_por_argumento.map((item) => [item.argumento, item.invocacoes]),
  );
}

export function compararPorArgumento(
  semCache: ArvoreResposta,
  comCache: ArvoreResposta,
): LinhaArgumento[] {
  const sem = porArgumento(semCache);
  const com = porArgumento(comCache);
  const argumentos = [...new Set([...sem.keys(), ...com.keys()])].sort((a, b) => b - a);
  return argumentos.map((argumento) => {
    const invocacoesSem = sem.get(argumento) ?? 0;
    const invocacoesCom = com.get(argumento) ?? 0;
    return {
      argumento,
      semCache: invocacoesSem,
      comCache: invocacoesCom,
      evitadas: invocacoesSem - invocacoesCom,
    };
  });
}

export function resumirComparacao(
  semCache: ArvoreResposta,
  comCache: ArvoreResposta,
  evitada: ArvoreComEvitadas,
): Comparacao {
  const linhas = compararPorArgumento(semCache, comCache);
  const parcelas = parcelasEvitadas(evitada.podas);
  const somaParcelas = parcelas.reduce((soma, parcela) => soma + parcela, 0);
  const evitadas = semCache.metricas.invocacoes - comCache.metricas.invocacoes;
  const diferencaRecursivas =
    semCache.metricas.chamadas_recursivas - comCache.metricas.chamadas_recursivas;
  return {
    invocacoesSemCache: semCache.metricas.invocacoes,
    invocacoesComCache: comCache.metricas.invocacoes,
    evitadas,
    recursivasSemCache: semCache.metricas.chamadas_recursivas,
    recursivasComCache: comCache.metricas.chamadas_recursivas,
    diferencaRecursivas,
    parcelas,
    somaParcelas,
    provasConferem: somaParcelas === evitadas && diferencaRecursivas === evitadas,
    linhas,
    maiorInvocacao: linhas.reduce((maior, linha) => Math.max(maior, linha.semCache), 1),
    argumentoMaisChamado:
      linhas.reduce<LinhaArgumento | null>(
        (maior, linha) => (maior === null || linha.semCache > maior.semCache ? linha : maior),
        null,
      ) ?? null,
  };
}

export interface DadosApresentacao {
  semCache: ArvoreResposta;
  comCache: ArvoreResposta;
  evitada: ArvoreComEvitadas;
  comparacao: Comparacao;
  descricoes: Record<Sequencia, DescricaoSequencia>;
  /** Alguma das duas árvores veio do cálculo no navegador. */
  offline: boolean;
}

export interface EstadoApresentacao {
  dados: DadosApresentacao | null;
  carregando: boolean;
  erro: Error | null;
  recarregar: () => void;
}

/** Busca as duas árvores de Tribonacci f(7) e o catálogo das sequências. */
export function useApresentacao(): EstadoApresentacao {
  const semCache = useArvoreComPlanoB(CONSULTA_SEM_CACHE);
  const comCache = useArvoreComPlanoB(CONSULTA_COM_CACHE);
  const catalogo = useSequencias();

  const descricoes = useMemo(() => {
    const mapa: Record<Sequencia, DescricaoSequencia> = { ...DESCRICAO_SEQUENCIAS };
    for (const info of catalogo.data?.sequencias ?? []) mapa[info.id] = info;
    return mapa;
  }, [catalogo.data]);

  const respostaSem = semCache.data?.resposta;
  const respostaCom = comCache.data?.resposta;

  const dados = useMemo<DadosApresentacao | null>(() => {
    if (!respostaSem || !respostaCom) return null;
    const evitada = montarArvoreComEvitadas(respostaSem.raiz, respostaCom.raiz);
    return {
      semCache: respostaSem,
      comCache: respostaCom,
      evitada,
      comparacao: resumirComparacao(respostaSem, respostaCom, evitada),
      descricoes,
      offline: semCache.data?.origem === 'plano_b' || comCache.data?.origem === 'plano_b',
    };
  }, [descricoes, respostaSem, respostaCom, semCache.data?.origem, comCache.data?.origem]);

  return {
    dados,
    carregando: semCache.isPending || comCache.isPending,
    erro: semCache.error ?? comCache.error,
    recarregar: () => {
      void semCache.refetch();
      void comCache.refetch();
    },
  };
}
