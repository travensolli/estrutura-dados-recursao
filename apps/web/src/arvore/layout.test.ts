import { describe, expect, it } from 'vitest';
import { executarMock, truncarArvore } from '../mocks/referencia-mock';
import { calcularLayout, DIMENSOES, enquadrar } from './layout';

const sem = executarMock('tribonacci', 7, 'sem_cache');
const vazio = new Set<number>();

describe('calcularLayout', () => {
  it('posiciona todos os nós visíveis em ordem de entrada', () => {
    const layout = calcularLayout(sem.raiz, vazio);
    expect(layout.nos).toHaveLength(46);
    expect(layout.ligacoes).toHaveLength(45);
    expect(layout.ordem[0]).toBe(sem.raiz.id);
    expect(layout.nos.map((p) => p.no.ordem_entrada)).toEqual(
      [...layout.nos].map((p) => p.no.ordem_entrada).sort((a, b) => a - b),
    );
  });

  it('separa os níveis pela profundidade', () => {
    const layout = calcularLayout(sem.raiz, vazio);
    const alturaNivel = DIMENSOES.altura + DIMENSOES.espacoY;
    for (const posicionado of layout.nos) {
      expect(posicionado.y).toBe(posicionado.no.profundidade * alturaNivel);
    }
  });

  it('recolher um nó tira a subárvore e conta os descendentes', () => {
    const f6 = sem.raiz.filhos[0];
    expect(f6).toBeDefined();
    const layout = calcularLayout(sem.raiz, new Set([f6!.id]));
    const recolhido = layout.porId.get(f6!.id);
    expect(recolhido?.recolhido).toBe(true);
    expect(recolhido?.ocultos).toBe(24);
    expect(layout.nos).toHaveLength(46 - 24);
  });

  it('marca os nós colapsados pelo orçamento de nós', () => {
    const truncada = truncarArvore(sem.raiz, 8);
    const layout = calcularLayout(truncada.raiz, vazio);
    const podados = layout.nos.filter((p) => p.podadoPorOrcamento);
    expect(podados.length).toBeGreaterThan(0);
    for (const podado of podados) {
      expect(podado.ocultos).toBe(podado.no.descendentes_ocultos);
      expect(podado.filhosVisiveis).toEqual([]);
    }
  });

  it('a caixa envolve a árvore inteira com margem', () => {
    const layout = calcularLayout(sem.raiz, vazio);
    expect(layout.raizX).toBe(layout.nos[0]?.x);
    const xs = layout.nos.map((p) => p.x);
    expect(layout.caixa.x).toBeLessThan(Math.min(...xs));
    expect(layout.caixa.x + layout.caixa.largura).toBeGreaterThan(Math.max(...xs));
    expect(layout.caixa.altura).toBeGreaterThan(5 * (DIMENSOES.altura + DIMENSOES.espacoY));
  });
});

describe('enquadrar', () => {
  const caixa = { x: -500, y: -50, largura: 1000, altura: 500 };

  it('centraliza a caixa quando a árvore inteira cabe', () => {
    const { k, x, y } = enquadrar(caixa, 0, 500, 500, 0.4, 1.4);
    expect(k).toBeCloseTo(0.5);
    expect(x).toBeCloseTo(250);
    expect(y).toBeCloseTo(150);
  });

  it('respeita o teto e o piso de escala', () => {
    expect(enquadrar(caixa, 0, 10_000, 10_000, 0.4, 1.4).k).toBe(1.4);
    expect(enquadrar(caixa, 0, 100, 100, 0.4, 1.4).k).toBe(0.4);
  });

  it('mostra o topo pela raiz quando a árvore não cabe legível', () => {
    const { k, x, y } = enquadrar(caixa, 120, 100, 100, 0.4, 1.4);
    expect(k).toBe(0.4);
    expect(x).toBeCloseTo(50 - 0.4 * 120);
    expect(y).toBeCloseTo(0.4 * 50);
  });

  it('não quebra quando a área ainda não foi medida', () => {
    expect(enquadrar({ x: 0, y: 0, largura: 100, altura: 100 }, 0, 0, 0, 0.4, 1.4)).toEqual({
      k: 1,
      x: 0,
      y: 0,
    });
  });
});
