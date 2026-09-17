import { describe, expect, it } from 'vitest';
import { executarMock } from '../../mocks/referencia-mock';
import { achatarNos, contarNos } from '../modelo';
import { montarArvoreComEvitadas, parcelasEvitadas } from './evitadas';

const sem = executarMock('tribonacci', 7, 'sem_cache');
const com = executarMock('tribonacci', 7, 'com_cache');
const evitada = montarArvoreComEvitadas(sem.raiz, com.raiz);

describe('árvore com as subárvores evitadas', () => {
  it('as subárvores podadas somam a diferença de invocações', () => {
    expect(evitada.totalEvitadas).toBe(30);
    expect(evitada.totalEvitadas).toBe(sem.metricas.invocacoes - com.metricas.invocacoes);
    expect(parcelasEvitadas(evitada.podas)).toEqual([12, 6, 6, 3, 3]);
  });

  it('com cache mais as evitadas reconstrói a árvore sem cache', () => {
    expect(contarNos(evitada.raiz)).toBe(sem.metricas.invocacoes);
    expect(evitada.fantasmas.size).toBe(evitada.totalEvitadas);
    expect(contarNos(evitada.raiz) - evitada.fantasmas.size).toBe(com.metricas.invocacoes);
  });

  it('mantém os ids únicos e não toca na árvore original', () => {
    const ids = achatarNos(evitada.raiz).map((no) => no.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(contarNos(com.raiz)).toBe(16);
  });

  it('marca cada acerto com a quantidade que ele evitou', () => {
    const acertos = achatarNos(com.raiz).filter((no) => no.tipo === 'acerto_cache');
    expect(acertos).toHaveLength(5);
    expect([...evitada.selos.keys()].sort()).toEqual(acertos.map((no) => no.id).sort());
    const f5 = acertos.find((no) => no.argumento === 5);
    expect(f5 && evitada.selos.get(f5.id)).toBe('evita 12 chamadas');
  });

  it('pendura a subárvore evitada logo abaixo do acerto', () => {
    const acertoF5 = achatarNos(evitada.raiz).find(
      (no) => no.tipo === 'acerto_cache' && no.argumento === 5,
    );
    expect(acertoF5).toBeDefined();
    expect(acertoF5 && achatarNos(acertoF5).length - 1).toBe(12);
    expect(acertoF5?.filhos.map((filho) => filho.argumento)).toEqual([4, 3, 2]);
  });
});
