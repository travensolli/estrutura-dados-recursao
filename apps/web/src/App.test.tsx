import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';
import { App } from './App';

function renderizarEm(caminho: string) {
  const cliente = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={cliente}>
      <MemoryRouter initialEntries={[caminho]}>
        <App />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('App', () => {
  it('renderiza a página inicial com navegação', () => {
    renderizarEm('/');
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Início');
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
