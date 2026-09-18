import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Esqueleto } from './Esqueleto';

describe('Esqueleto', () => {
  it('anuncia carregamento para leitores de tela', () => {
    render(<Esqueleto linhas={2} rotulo="Carregando resultado…" />);
    const status = screen.getByRole('status');
    expect(status).toHaveAttribute('aria-busy', 'true');
    expect(status).toHaveTextContent('Carregando resultado…');
  });
});
