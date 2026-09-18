import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { CHAVE_TEMA } from '../hooks/tema';
import { BotaoTema } from './BotaoTema';

describe('BotaoTema', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('tema-escuro');
  });
  afterEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('tema-escuro');
  });

  it('parte do tema aplicado no documento e alterna para escuro', async () => {
    const usuario = userEvent.setup();
    render(<BotaoTema />);
    await usuario.click(screen.getByRole('button', { name: 'Ativar tema escuro' }));
    expect(document.documentElement).toHaveClass('tema-escuro');
    expect(localStorage.getItem(CHAVE_TEMA)).toBe('escuro');
    expect(screen.getByRole('button', { name: 'Ativar tema claro' })).toBeInTheDocument();
  });

  it('volta para claro e guarda a escolha', async () => {
    const usuario = userEvent.setup();
    document.documentElement.classList.add('tema-escuro');
    render(<BotaoTema comRotulo />);
    await usuario.click(screen.getByRole('button', { name: 'Ativar tema claro' }));
    expect(document.documentElement).not.toHaveClass('tema-escuro');
    expect(localStorage.getItem(CHAVE_TEMA)).toBe('claro');
  });

  it('mantém todas as instâncias em sincronia', async () => {
    const usuario = userEvent.setup();
    render(
      <>
        <BotaoTema />
        <BotaoTema comRotulo />
      </>,
    );
    await usuario.click(screen.getAllByRole('button', { name: 'Ativar tema escuro' })[0]!);
    expect(screen.getAllByRole('button', { name: 'Ativar tema claro' })).toHaveLength(2);
  });
});
