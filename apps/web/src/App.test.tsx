import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { api } from './api/cliente';
import { App } from './App';
import { renderizarComProvedores } from './testes/renderizar';

function renderizarEm(caminho: string) {
  return renderizarComProvedores(<App />, { rota: caminho });
}

describe('App', () => {
  it('renderiza a página inicial com navegação', () => {
    renderizarEm('/');
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Recursão com e sem cache');
    expect(screen.getByRole('navigation', { name: 'Principal' })).toBeInTheDocument();
  });

  it.each([
    ['/calcular', 'Calcular'],
    ['/comparar', 'Comparar'],
    ['/arvore', 'Árvore de chamadas'],
    ['/apresentacao', 'Modo apresentação'],
  ])('abre %s', (caminho, titulo) => {
    renderizarEm(caminho);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(titulo);
  });

  it('mostra página não encontrada para rota desconhecida', () => {
    renderizarEm('/nada');
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Página não encontrada');
  });
});

describe('troca de página', () => {
  afterEach(() => vi.restoreAllMocks());

  /** Vai pelo menu do topo e espera o título da tela de destino. */
  async function irPeloMenu(
    usuario: ReturnType<typeof userEvent.setup>,
    item: string,
    titulo: string,
  ) {
    const menu = screen.getByRole('navigation', { name: 'Principal' });
    await usuario.click(within(menu).getByRole('link', { name: item }));
    expect(await screen.findByRole('heading', { level: 1 })).toHaveTextContent(titulo);
  }

  it('volta ao Calcular com o mesmo formulário e o mesmo resultado, sem recalcular', async () => {
    const calcular = vi.spyOn(api, 'calcular');
    const usuario = userEvent.setup();
    renderizarEm('/calcular');
    await screen.findByText(/^De 0 a \d/);

    await usuario.click(screen.getByRole('radio', { name: 'Com cache' }));
    await usuario.click(screen.getByRole('button', { name: 'Calcular' }));
    expect(await screen.findByText('Tribonacci f(7) vale')).toBeInTheDocument();
    const invocacoes = screen.getByTestId('metrica-invocacoes').textContent;

    await irPeloMenu(usuario, 'Árvore', 'Árvore de chamadas');
    await irPeloMenu(usuario, 'Calcular', 'Calcular');

    expect(screen.getByRole('radio', { name: 'Com cache' })).toBeChecked();
    expect(screen.getByText('Tribonacci f(7) vale')).toBeInTheDocument();
    expect(screen.getByTestId('metrica-invocacoes')).toHaveTextContent(invocacoes ?? '');
    expect(screen.queryByText('Nenhum cálculo ainda')).not.toBeInTheDocument();
    expect(calcular).toHaveBeenCalledTimes(1);
  });

  it('volta ao Comparar com a mesma medição e a mesma escala, sem medir de novo', async () => {
    const comparar = vi.spyOn(api, 'comparar');
    const usuario = userEvent.setup();
    renderizarEm('/comparar');
    await screen.findByText(/^De 0 a \d/);

    await usuario.click(screen.getByRole('button', { name: 'Comparar' }));
    await screen.findByText('Fator de aceleração', undefined, { timeout: 5000 });
    await usuario.click(screen.getByRole('radio', { name: 'Logarítmica' }));

    await irPeloMenu(usuario, 'Início', 'Recursão com e sem cache');
    await irPeloMenu(usuario, 'Comparar', 'Comparar');

    expect(screen.getByText('Fator de aceleração')).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Logarítmica' })).toBeChecked();
    expect(comparar).toHaveBeenCalledTimes(1);
  });

  it('sair no meio da medição não a descarta: a volta encontra o resultado', async () => {
    const comparar = vi.spyOn(api, 'comparar');
    const usuario = userEvent.setup();
    renderizarEm('/comparar');
    await screen.findByText(/^De 0 a \d/);

    await usuario.click(screen.getByRole('button', { name: 'Comparar' }));
    expect(await screen.findByRole('button', { name: /Medindo/ })).toBeInTheDocument();
    await irPeloMenu(usuario, 'Início', 'Recursão com e sem cache');
    await irPeloMenu(usuario, 'Comparar', 'Comparar');

    await screen.findByText('Fator de aceleração', undefined, { timeout: 5000 });
    expect(comparar).toHaveBeenCalledTimes(1);
  });

  it('volta à Árvore com a mesma árvore e a mesma vista', async () => {
    const usuario = userEvent.setup();
    renderizarEm('/arvore');
    await screen.findByRole('heading', { level: 2 });

    const campoN = screen.getByLabelText('n');
    await usuario.clear(campoN);
    await usuario.type(campoN, '5');
    await usuario.click(screen.getByRole('button', { name: 'Ver árvore' }));
    await waitFor(() =>
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('f(5)'),
    );
    await usuario.click(screen.getByRole('button', { name: 'Lista' }));

    await irPeloMenu(usuario, 'Calcular', 'Calcular');
    await irPeloMenu(usuario, 'Árvore', 'Árvore de chamadas');

    expect(await screen.findByRole('heading', { level: 2 })).toHaveTextContent(
      'Tribonacci f(5) sem cache',
    );
    expect(screen.getByRole('button', { name: 'Lista' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getAllByRole('treeitem')).toHaveLength(13);
  });
});
