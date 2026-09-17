import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { executarInstrumentado } from '../plano-b/nucleo-adaptador';
import { ArvoreLista } from './ArvoreLista';

function montar(modo: 'sem_cache' | 'com_cache', passo?: number, limiteNos?: number) {
  const execucao = executarInstrumentado('tribonacci', 7, modo, { comArvore: true, limiteNos });
  if (!execucao.raiz) throw new Error('execução sem árvore');
  render(<ArvoreLista raiz={execucao.raiz} passo={passo ?? null} />);
  return execucao;
}

const itens = () => screen.getAllByRole('treeitem');

describe('ArvoreLista', () => {
  it('lista a árvore inteira de tribonacci f(7) sem cache', () => {
    const execucao = montar('sem_cache');
    expect(itens()).toHaveLength(46);
    expect(itens()).toHaveLength(execucao.metricas.invocacoes);
    expect(screen.getByRole('tree')).toHaveAttribute('aria-label', 'Árvore de chamadas');
    expect(itens().filter((item) => item.dataset.tipo === 'base')).toHaveLength(31);
  });

  it('lista os 16 nós da execução com cache, com os acertos marcados', () => {
    montar('com_cache');
    expect(itens()).toHaveLength(16);
    expect(itens().filter((item) => item.dataset.tipo === 'acerto_cache')).toHaveLength(5);
    expect(screen.getAllByText('acerto de cache', { exact: false })).not.toHaveLength(0);
  });

  it('descreve a posição de cada nó para o leitor de tela', () => {
    montar('sem_cache');
    const raiz = itens()[0]!;
    expect(raiz).toHaveAttribute('aria-level', '1');
    expect(raiz).toHaveAttribute('aria-expanded', 'true');
    expect(raiz).toHaveAttribute('aria-label', expect.stringContaining('f(7) igual a 31'));
    expect(itens()[1]).toHaveAttribute('aria-level', '2');
    expect(itens()[1]).toHaveAttribute('aria-posinset', '1');
    expect(itens()[1]).toHaveAttribute('aria-setsize', '3');
  });

  it('recolhe e abre a subárvore pelo teclado', () => {
    montar('sem_cache');
    const f6 = itens()[1]!;
    expect(f6.dataset.argumento).toBe('6');

    fireEvent.keyDown(f6, { key: 'ArrowLeft' });
    expect(itens()).toHaveLength(46 - 24);
    expect(screen.getByText('+24 ocultos')).toBeInTheDocument();
    expect(itens()[1]).toHaveAttribute('aria-expanded', 'false');

    fireEvent.keyDown(itens()[1]!, { key: 'ArrowRight' });
    expect(itens()).toHaveLength(46);
  });

  it('anda pela lista com as setas, Home e End', () => {
    montar('sem_cache');
    itens()[0]!.focus();
    fireEvent.keyDown(document.activeElement!, { key: 'ArrowDown' });
    expect(document.activeElement).toHaveAttribute('data-argumento', '6');

    fireEvent.keyDown(document.activeElement!, { key: 'ArrowUp' });
    expect(document.activeElement).toHaveAttribute('data-argumento', '7');

    fireEvent.keyDown(document.activeElement!, { key: 'End' });
    expect(document.activeElement).toBe(itens()[45]);

    fireEvent.keyDown(document.activeElement!, { key: 'Home' });
    expect(document.activeElement).toBe(itens()[0]);
  });

  it('acompanha o passo da reprodução', () => {
    montar('sem_cache', 1);
    expect(itens().filter((item) => item.dataset.estado === 'ativo')).toHaveLength(2);
    expect(itens().filter((item) => item.dataset.estado === 'futuro')).toHaveLength(44);
    expect(screen.getByText('f(7) = …')).toBeInTheDocument();
    const evento = itens().filter((item) => item.dataset.evento === 'sim');
    expect(evento).toHaveLength(1);
    expect(evento[0]).toHaveAttribute('data-argumento', '6');
  });

  it('marca os nós cortados pelo limite de nós', () => {
    montar('sem_cache', undefined, 8);
    expect(itens().length).toBeLessThanOrEqual(8);
    expect(screen.getAllByText(/ocultos$/).length).toBeGreaterThan(0);
  });
});
