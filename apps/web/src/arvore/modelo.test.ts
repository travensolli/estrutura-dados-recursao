import { executarInstrumentado } from '@sequencias/nucleo';
import { describe, expect, it } from 'vitest';
import { executarMock, truncarArvore } from '../mocks/referencia-mock';
import {
  achatarNos,
  acertoNoPasso,
  agruparPorArgumento,
  cacheNoPasso,
  contarNos,
  descendentesDe,
  descreverArvore,
  descreverPasso,
  estadoDoNoNoPasso,
  eventoNoPasso,
  indexarPassos,
  pilhaNoPasso,
  podasPorAcerto,
  subarvoresPodadas,
  totalPassos,
  totalPodado,
} from './modelo';

const sem = executarMock('tribonacci', 7, 'sem_cache');
const com = executarMock('tribonacci', 7, 'com_cache');
const nosSem = achatarNos(sem.raiz);
const nosCom = achatarNos(com.raiz);

describe('achatarNos e contagens', () => {
  it('achata em ordem de entrada', () => {
    expect(nosSem).toHaveLength(46);
    expect(nosCom).toHaveLength(16);
    expect(nosSem.map((no) => no.ordem_entrada)).toEqual(
      [...nosSem].sort((a, b) => a.ordem_entrada - b.ordem_entrada).map((no) => no.ordem_entrada),
    );
    expect(contarNos(com.raiz)).toBe(16);
  });
  it('total de passos é 2 vezes as invocações', () => {
    expect(totalPassos(sem.raiz)).toBe(2 * sem.metricas.invocacoes);
    expect(totalPassos(com.raiz)).toBe(2 * com.metricas.invocacoes);
  });
  it('descendentes vêm do relógio', () => {
    expect(descendentesDe(sem.raiz)).toBe(45);
    const f5 = nosSem.find((no) => no.argumento === 5);
    expect(f5 && descendentesDe(f5)).toBe(12);
    const folha = nosSem.find((no) => no.tipo === 'base');
    expect(folha && descendentesDe(folha)).toBe(0);
  });
});

describe('estado, pilha e cache por passo', () => {
  it('classifica o nó em futuro, ativo e resolvido', () => {
    const raiz = sem.raiz;
    expect(estadoDoNoNoPasso(raiz, 0)).toBe('ativo');
    expect(estadoDoNoNoPasso(raiz, raiz.ordem_saida)).toBe('resolvido');
    const f6 = raiz.filhos[0];
    expect(f6 && estadoDoNoNoPasso(f6, 0)).toBe('futuro');
    expect(f6 && estadoDoNoNoPasso(f6, 1)).toBe('ativo');
  });
  it('pilha cresce da raiz até o primeiro caso base', () => {
    expect(pilhaNoPasso(nosSem, 0).map((no) => no.argumento)).toEqual([7]);
    expect(pilhaNoPasso(nosSem, 1).map((no) => no.argumento)).toEqual([7, 6]);
    // f(7) > f(6) > f(5) > f(4) > f(3) > f(2): profundidade máxima 6
    expect(pilhaNoPasso(nosSem, 5).map((no) => no.argumento)).toEqual([7, 6, 5, 4, 3, 2]);
    expect(pilhaNoPasso(nosSem, 6)).toHaveLength(5);
    expect(pilhaNoPasso(nosSem, totalPassos(sem.raiz))).toEqual([]);
  });
  it('dicionário recebe só nós calculados já resolvidos', () => {
    expect(cacheNoPasso(nosCom, 0)).toEqual([]);
    const primeiro = nosCom.find((no) => no.tipo === 'calculado' && no.argumento === 3);
    expect(primeiro).toBeDefined();
    const t = (primeiro as (typeof nosCom)[number]).ordem_saida;
    expect(cacheNoPasso(nosCom, t - 1)).toEqual([]);
    expect(cacheNoPasso(nosCom, t)).toEqual([{ argumento: 3, valor: '3', ordem_saida: t }]);
    const final = cacheNoPasso(nosCom, totalPassos(com.raiz));
    expect(final.map((e) => e.argumento)).toEqual([3, 4, 5, 6, 7]);
    expect(final).toHaveLength(com.metricas.entradas_cache);
  });
  it('acertos aparecem no instante da entrada', () => {
    const indice = indexarPassos(nosCom);
    const acertos = nosCom.filter((no) => no.tipo === 'acerto_cache');
    expect(acertos).toHaveLength(5);
    const primeiro = acertos[0] as (typeof nosCom)[number];
    expect(acertoNoPasso(indice, primeiro.ordem_entrada)?.id).toBe(primeiro.id);
    expect(acertoNoPasso(indice, 0)).toBeNull();
    expect(eventoNoPasso(indice, 0)?.tipo).toBe('entrada');
    expect(eventoNoPasso(indice, com.raiz.ordem_saida)?.tipo).toBe('saida');
  });
  it('descreve os passos em português', () => {
    const indice = indexarPassos(nosCom);
    const podas = podasPorAcerto(subarvoresPodadas(sem.raiz, com.raiz));
    expect(descreverPasso(null, 'com_cache')).toMatch(/Início/);
    expect(descreverPasso(eventoNoPasso(indice, 0), 'com_cache')).toBe(
      'Chama f(7): não está no dicionário, precisa calcular.',
    );
    const acerto = nosCom.find((no) => no.tipo === 'acerto_cache') as (typeof nosCom)[number];
    expect(descreverPasso(eventoNoPasso(indice, acerto.ordem_entrada), 'com_cache', podas)).toBe(
      'Chama f(3): já está no dicionário, devolve 3 sem recursão (evita 3 chamadas).',
    );
    expect(descreverPasso(eventoNoPasso(indice, com.raiz.ordem_saida), 'com_cache')).toBe(
      'f(7) = 31: calculado e guardado no dicionário.',
    );
  });
});

describe('agrupamento e podas', () => {
  it('agrupa por argumento do maior para o menor', () => {
    const grupos = agruparPorArgumento(nosSem);
    expect(grupos.map((g) => g.argumento)).toEqual([7, 6, 5, 4, 3, 2, 1, 0]);
    const porArgumento = new Map(
      sem.metricas.invocacoes_por_argumento.map((e) => [e.argumento, e.invocacoes]),
    );
    for (const grupo of grupos) expect(grupo.nos).toHaveLength(porArgumento.get(grupo.argumento)!);
  });
  it('calcula as subárvores podadas de tribonacci f(7)', () => {
    const podas = subarvoresPodadas(sem.raiz, com.raiz);
    expect(podas.map((p) => [p.acerto.argumento, p.podadas])).toEqual([
      [3, 3],
      [4, 6],
      [3, 3],
      [5, 12],
      [4, 6],
    ]);
    expect(totalPodado(podas)).toBe(30);
    expect(totalPodado(podas)).toBe(sem.metricas.invocacoes - com.metricas.invocacoes);
    for (const poda of podas) expect(poda.modelo?.argumento).toBe(poda.acerto.argumento);
  });
  it('usa nós colapsados por orçamento como modelo', () => {
    const truncada = truncarArvore(sem.raiz, 8).raiz;
    const podas = subarvoresPodadas(truncada, com.raiz);
    expect(totalPodado(podas)).toBe(30);
  });
  it('descreve a árvore em texto', () => {
    expect(descreverArvore('Tribonacci', 7, 'sem_cache', sem.metricas)).toBe(
      'Árvore de chamadas de Tribonacci f(7) sem cache: 46 invocações, 31 casos base, 15 calculados, 0 acertos de cache, profundidade máxima 6.',
    );
  });
  it('põe no singular cada contagem que vale 1', () => {
    const fatorial = executarInstrumentado('fatorial', 1, 'sem_cache').metricas;
    expect(descreverArvore('Fatorial', 1, 'sem_cache', fatorial)).toBe(
      'Árvore de chamadas de Fatorial f(1) sem cache: 1 invocação, 1 caso base, 0 calculados, 0 acertos de cache, profundidade máxima 1.',
    );
    const fibonacci = executarInstrumentado('fibonacci', 4, 'com_cache').metricas;
    expect(descreverArvore('Fibonacci', 4, 'com_cache', fibonacci)).toBe(
      'Árvore de chamadas de Fibonacci f(4) com cache: 7 invocações, 3 casos base, 3 calculados, 1 acerto de cache, profundidade máxima 4.',
    );
  });
});
