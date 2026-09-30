import type { Modo } from '@sequencias/contrato';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { act } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { executarInstrumentado } from '../plano-b/nucleo-adaptador';
import { montarArvoreComEvitadas } from './apresentacao/evitadas';
import { ArvoreSvg, type ArvoreSvgProps } from './ArvoreSvg';

function executar(modo: Modo, limiteNos?: number) {
  const execucao = executarInstrumentado('tribonacci', 7, modo, { comArvore: true, limiteNos });
  if (!execucao.raiz) throw new Error('execução sem árvore');
  return { ...execucao, raiz: execucao.raiz };
}

function desenhar(
  modo: Modo,
  limiteNos?: number,
  passo?: number,
  extras: Partial<ArvoreSvgProps> = {},
) {
  const execucao = executar(modo, limiteNos);
  render(
    <ArvoreSvg
      raiz={execucao.raiz}
      metricas={execucao.metricas}
      sequencia="tribonacci"
      n={7}
      modo={modo}
      truncada={execucao.truncada}
      nosExibidos={execucao.nosExibidos}
      passo={passo ?? null}
      {...extras}
    />,
  );
  return execucao;
}

function nos() {
  return screen.getAllByTestId('no-arvore');
}

/** O desenho, sem os contadores em volta. */
function figura() {
  return within(screen.getByRole('group', { name: /Árvore de chamadas/ }));
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

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

  it('mostra a descrição textual da execução', () => {
    desenhar('sem_cache');
    expect(screen.getByRole('group', { name: /Árvore de chamadas/ })).toHaveAttribute(
      'aria-label',
      'Árvore de chamadas de Tribonacci f(7) sem cache: 46 invocações, 31 casos base, 15 calculados, 0 acertos de cache, profundidade máxima 6.',
    );
  });

  it('põe a barra de zoom e a de exportar sobre o desenho, fora do palco', () => {
    desenhar('sem_cache');
    const zoom = within(screen.getByRole('group', { name: 'Zoom da árvore sem cache' }));
    for (const rotulo of ['Aproximar', 'Afastar', 'Ajustar à tela']) {
      // Só o ícone fica à vista: o nome vem do texto para leitor de tela e da dica.
      expect(zoom.getByRole('button', { name: rotulo })).toHaveAttribute('title', rotulo);
    }
    expect(zoom.queryByText('Ajustar à tela', { selector: ':not(.sr-only)' })).toBeNull();
    expect(screen.getByRole('button', { name: 'Baixar a árvore' })).toBeInTheDocument();
  });

  it('no palco da apresentação não oferece exportar', () => {
    desenhar('sem_cache', undefined, undefined, { palco: true });
    expect(screen.getByRole('button', { name: 'Ajustar à tela' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Baixar a árvore' })).toBeNull();
  });

  it('o botão de baixar abre a escolha do formato e fecha com Esc', () => {
    desenhar('sem_cache');
    const baixar = screen.getByRole('button', { name: 'Baixar a árvore' });
    expect(baixar).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('button', { name: 'Baixar SVG' })).toBeNull();

    fireEvent.click(baixar);
    expect(baixar).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('button', { name: 'Baixar SVG' })).toHaveAccessibleDescription(
      'Vetor, abre em editores de slides',
    );
    expect(screen.getByRole('button', { name: 'Baixar PNG' })).toBeInTheDocument();

    fireEvent.keyDown(screen.getByRole('button', { name: 'Baixar PNG' }), { key: 'Escape' });
    expect(baixar).toHaveAttribute('aria-expanded', 'false');
    expect(baixar).toHaveFocus();
    expect(screen.queryByRole('button', { name: 'Baixar PNG' })).toBeNull();
  });

  it('clicar fora fecha a escolha do formato', () => {
    desenhar('sem_cache');
    fireEvent.click(screen.getByRole('button', { name: 'Baixar a árvore' }));
    fireEvent.pointerDown(document.body);
    expect(screen.queryByRole('button', { name: 'Baixar SVG' })).toBeNull();
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

    fireEvent.click(screen.getByRole('button', { name: 'Abrir o nó recolhido' }));
    expect(nos()).toHaveLength(46);
  });

  it('sem reprodução mostra a árvore inteira já resolvida', () => {
    desenhar('sem_cache');
    expect(nos().every((no) => no.dataset.estado === 'inteira')).toBe(true);
    expect(figura().getByText('31')).toBeInTheDocument();
  });

  it('apaga os nós futuros e esconde o valor ainda não calculado', () => {
    desenhar('sem_cache', undefined, 1);
    const porEstado = (estado: string) => nos().filter((no) => no.dataset.estado === estado);
    // passo 1: f(7) e f(6) na pilha, o resto ainda não aconteceu
    expect(porEstado('ativo')).toHaveLength(2);
    expect(porEstado('futuro')).toHaveLength(44);
    expect(porEstado('resolvido')).toHaveLength(0);
    expect(figura().queryByText('31')).not.toBeInTheDocument();
    expect(figura().getAllByText('…').length).toBeGreaterThan(0);
  });

  it('mostra o valor dos nós já resolvidos', () => {
    desenhar('sem_cache', undefined, 91);
    expect(nos().every((no) => no.dataset.estado === 'resolvido')).toBe(true);
    expect(figura().getByText('31')).toBeInTheDocument();
    expect(figura().queryByText('…')).not.toBeInTheDocument();
  });

  it('baixa o desenho em SVG com o nome da execução', () => {
    vi.stubGlobal(
      'URL',
      Object.assign(URL, { createObjectURL: () => 'blob:teste', revokeObjectURL: () => {} }),
    );
    const clicar = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (
      this: HTMLAnchorElement,
    ) {
      expect(this.download).toBe('arvore-tribonacci-f7-sem_cache.svg');
    });
    desenhar('sem_cache');

    fireEvent.click(screen.getByRole('button', { name: 'Baixar a árvore' }));
    fireEvent.click(screen.getByRole('button', { name: 'Baixar SVG' }));

    expect(clicar).toHaveBeenCalledTimes(1);
    // Escolher fecha a lista; ao reabrir, o PNG segue disponível.
    expect(screen.queryByRole('button', { name: 'Baixar SVG' })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Baixar a árvore' }));
    expect(screen.getByRole('button', { name: 'Baixar PNG' })).toBeEnabled();
  });

  it('aceita realce vindo de fora e avisa o realce do ponteiro', () => {
    const aoRealcar = vi.fn();
    desenhar('sem_cache', undefined, undefined, {
      argumentoRealcado: 3,
      aoRealcarArgumento: aoRealcar,
    });
    expect(nos().filter((no) => no.dataset.realce === 'sim')).toHaveLength(7);
    expect(aoRealcar).toHaveBeenLastCalledWith(null);

    const alvo = nos().find((no) => no.dataset.argumento === '6');
    act(() => alvo!.focus());
    expect(aoRealcar).toHaveBeenLastCalledWith(6);
    expect(nos().filter((no) => no.dataset.realce === 'sim')).toHaveLength(1);
  });

  it('desenha as subárvores evitadas tracejadas e com a quantidade podada', () => {
    const sem = executar('sem_cache');
    const com = executar('com_cache');
    const evitada = montarArvoreComEvitadas(sem.raiz, com.raiz);
    render(
      <ArvoreSvg
        raiz={evitada.raiz}
        metricas={com.metricas}
        sequencia="tribonacci"
        n={7}
        modo="com_cache"
        fantasmas={evitada.fantasmas}
        selos={evitada.selos}
      />,
    );

    expect(nos()).toHaveLength(sem.metricas.invocacoes);
    expect(nos().filter((no) => no.dataset.fantasma === 'sim')).toHaveLength(30);
    expect(screen.getByText('evita 12 chamadas')).toBeInTheDocument();
    expect(screen.getAllByText('evita 6 chamadas')).toHaveLength(2);
    expect(screen.getAllByText('evita 3 chamadas')).toHaveLength(2);
  });

  it('marca com selo os nós colapsados pelo orçamento', () => {
    const execucao = desenhar('sem_cache', 8);
    expect(execucao.truncada).toBe(true);
    expect(nos().length).toBeLessThanOrEqual(8);
    const selos = screen.getAllByText(/ocultos$/);
    expect(selos.length).toBeGreaterThan(0);
  });
});
