import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { afterEach, describe, expect, it } from 'vitest';
import { Layout } from './Layout';

function renderizar(rota = '/calcular') {
  return render(
    <MemoryRouter initialEntries={[rota]}>
      <Routes>
        <Route element={<Layout />}>
          <Route path="calcular" element={<p>conteúdo</p>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

afterEach(() => {
  document.documentElement.classList.remove('tema-escuro');
  localStorage.clear();
});

describe('Layout', () => {
  it('traz atalho para o conteúdo, navegação e alternador de tema', () => {
    renderizar();
    expect(screen.getByRole('link', { name: 'Ir para o conteúdo' })).toHaveAttribute(
      'href',
      '#conteudo',
    );
    expect(screen.getByRole('navigation', { name: 'Principal' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Ativar tema/ })).toBeInTheDocument();
    expect(screen.getByRole('main')).toHaveAttribute('id', 'conteudo');
  });

  it('marca o item atual da navegação', () => {
    renderizar('/calcular');
    expect(screen.getByRole('link', { name: 'Calcular' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'Comparar' })).not.toHaveAttribute('aria-current');
  });
});
