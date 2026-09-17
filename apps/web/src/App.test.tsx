import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
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
    ['/comparar', 'Comparar desempenho'],
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
