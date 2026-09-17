import type { Modo } from '@sequencias/contrato';
import { fireEvent, render, screen } from '@testing-library/react';
import { act } from 'react';
import { describe, expect, it } from 'vitest';
import { executarInstrumentado } from '../plano-b/nucleo-adaptador';
import { ArvoreSvg } from './ArvoreSvg';

function desenhar(modo: Modo, limiteNos?: number) {
  const execucao = executarInstrumentado('tribonacci', 7, modo, { comArvore: true, limiteNos });
  if (!execucao.raiz) throw new Error('execução sem árvore');
  render(
    <ArvoreSvg
      raiz={execucao.raiz}
      metricas={execucao.metricas}
      sequencia="tribonacci"
      n={7}
      modo={modo}
      truncada={execucao.truncada}
      nosExibidos={execucao.nosExibidos}
    />,
  );
  return execucao;
}

function nos() {
  return screen.getAllByTestId('no-arvore');
}

describe('ArvoreSvg', () => {
  it('desenha 46 nós para tribonacci f(7) sem cache', () => {
    const execucao = desenhar('sem_cache');
    expect(nos()).toHaveLength(46);
    expect(execucao.metricas.invocacoes).toBe(46);
    expect(nos().filter((no) => no.dataset.tipo === 'base')).toHaveLength(31);
    expect(nos().filter((no) => no.dataset.tipo === 'calculado')).toHaveLength(15);
    expect(nos().filter((no) => no.dataset.tipo === 'acerto_cache')).toHaveLength(0);
  });

  it('desenha 16 nós para tribonacci f(7) com cache', () => {
    const execucao = desenhar('com_cache');
    expect(nos()).toHaveLength(16);
    expect(execucao.metricas.invocacoes).toBe(16);
    expect(nos().filter((no) => no.dataset.tipo === 'acerto_cache')).toHaveLength(5);
    expect(nos().filter((no) => no.dataset.tipo === 'calculado')).toHaveLength(5);
    expect(nos().filter((no) => no.dataset.tipo === 'base')).toHaveLength(6);
  });

  it('mostra a descrição textual e os contadores da execução', () => {
    desenhar('sem_cache');
    expect(screen.getByRole('img')).toHaveAttribute(
      'aria-label',
      'Árvore de chamadas de Tribonacci f(7) sem cache: 46 invocações, 31 casos base, 15 calculados, 0 acertos de cache, profundidade máxima 6.',
    );
    expect(screen.getByText('invocações').nextElementSibling).toHaveTextContent('46');
    expect(screen.getByText('chamadas recursivas').nextElementSibling).toHaveTextContent('45');
    expect(screen.getByText('profundidade máxima').nextElementSibling).toHaveTextContent('6');
  });

  it('destaca todas as ocorrências do argumento ao focar um nó', () => {
    desenhar('sem_cache');
    expect(nos().every((no) => no.dataset.realce === 'neutro')).toBe(true);

    const alvo = nos().find((no) => no.dataset.argumento === '3');
    expect(alvo).toBeDefined();
    act(() => alvo!.focus());

    const comArgumentoTres = nos().filter((no) => no.dataset.argumento === '3');
    expect(comArgumentoTres).toHaveLength(7);
    expect(comArgumentoTres.every((no) => no.dataset.realce === 'sim')).toBe(true);
    expect(
      nos()
        .filter((no) => no.dataset.argumento !== '3')
        .every((no) => no.dataset.realce === 'nao'),
    ).toBe(true);
    expect(screen.getByText('f(3) = 3')).toBeInTheDocument();
    expect(screen.getByText('aparece 7 vezes na execução')).toBeInTheDocument();
  });

  it('recolhe e abre a subárvore pelo teclado', () => {
    desenhar('sem_cache');
    const f6 = nos().find((no) => no.dataset.argumento === '6');
    expect(f6).toBeDefined();

    fireEvent.keyDown(f6!, { key: 'Enter' });
    expect(nos()).toHaveLength(46 - 24);
    expect(screen.getByText('+24')).toBeInTheDocument();
    expect(f6).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(screen.getByRole('button', { name: 'Abrir os 1 nós recolhidos' }));
    expect(nos()).toHaveLength(46);
  });

  it('marca com selo os nós colapsados pelo orçamento', () => {
    const execucao = desenhar('sem_cache', 8);
    expect(execucao.truncada).toBe(true);
    expect(nos().length).toBeLessThanOrEqual(8);
    const selos = screen.getAllByText(/ocultos$/);
    expect(selos.length).toBeGreaterThan(0);
    expect(screen.getByText('nós desenhados')).toBeInTheDocument();
  });
});
