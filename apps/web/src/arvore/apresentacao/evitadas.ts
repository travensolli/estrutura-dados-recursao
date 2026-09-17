import type { No } from '@sequencias/contrato';
import { achatarNos, subarvoresPodadas, totalPodado, type SubarvorePodada } from '../modelo';

export interface ArvoreComEvitadas {
  /** Árvore com cache mais as subárvores que cada acerto evitou. */
  raiz: No;
  /** Ids dos nós que só existem como subárvore evitada. */
  fantasmas: ReadonlySet<number>;
  /** Id do acerto para o selo com a quantidade evitada. */
  selos: ReadonlyMap<number, string>;
  podas: SubarvorePodada[];
  totalEvitadas: number;
}

function maiorId(raiz: No): number {
  return achatarNos(raiz).reduce((maior, no) => Math.max(maior, no.id), 0);
}

/**
 * Pendura em cada acerto uma cópia da subárvore que ele evitou, tirada do nó
 * calculado de mesmo argumento na árvore sem cache. Os ids das cópias seguem
 * depois do maior id da árvore com cache, para continuarem únicos.
 */
export function montarArvoreComEvitadas(semCache: No, comCache: No): ArvoreComEvitadas {
  const podas = subarvoresPodadas(semCache, comCache);
  const porAcerto = new Map(podas.map((poda) => [poda.acerto.id, poda]));
  const fantasmas = new Set<number>();
  const selos = new Map<number, string>();
  let proximoId = maiorId(comCache) + 1;

  const copiar = (no: No): No => {
    const id = proximoId++;
    fantasmas.add(id);
    return { ...no, id, filhos: no.filhos.map(copiar) };
  };

  const refazer = (no: No): No => {
    const poda = porAcerto.get(no.id);
    if (poda?.modelo) {
      const quantidade = poda.podadas;
      selos.set(no.id, `evita ${quantidade} ${quantidade === 1 ? 'chamada' : 'chamadas'}`);
      return { ...no, filhos: poda.modelo.filhos.map(copiar) };
    }
    return { ...no, filhos: no.filhos.map(refazer) };
  };

  return {
    raiz: refazer(comCache),
    fantasmas,
    selos,
    podas,
    totalEvitadas: totalPodado(podas),
  };
}

/** Parcelas da prova pela soma das podas, da maior para a menor. */
export function parcelasEvitadas(podas: readonly SubarvorePodada[]): number[] {
  return podas.map((poda) => poda.podadas).sort((a, b) => b - a);
}
