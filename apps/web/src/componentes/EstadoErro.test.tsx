import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ErroApi } from '../api/cliente';
import { EstadoErro } from './EstadoErro';

describe('EstadoErro', () => {
  it('limite excedido sugere usar o n permitido', async () => {
    const usuario = userEvent.setup();
    const reduzir = vi.fn();
    const erro = new ErroApi(
      'LIMITE_EXCEDIDO',
      'Para Fibonacci sem cache, o maior n permitido é 35.',
      422,
      { limite: 35 },
    );
    render(<EstadoErro erro={erro} aoReduzirN={reduzir} aoTentarDeNovo={vi.fn()} />);
    expect(screen.getByRole('alert')).toHaveTextContent('Esse n passa do limite');
    expect(screen.getByText(/maior n permitido é 35/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Tentar de novo' })).not.toBeInTheDocument();
    await usuario.click(screen.getByRole('button', { name: 'Usar n = 35' }));
    expect(reduzir).toHaveBeenCalledOnce();
  });

  it('cancelamento oferece tentar de novo', () => {
    render(
      <EstadoErro
        erro={new ErroApi('CANCELADO', 'Cálculo cancelado.', 0)}
        aoTentarDeNovo={vi.fn()}
      />,
    );
    expect(screen.getByRole('status')).toHaveTextContent('Cálculo cancelado');
    expect(screen.getByRole('button', { name: 'Tentar de novo' })).toBeInTheDocument();
  });

  it('erro desconhecido mostra mensagem genérica', () => {
    render(<EstadoErro erro={new Error('boom')} />);
    expect(screen.getByRole('alert')).toHaveTextContent('Algo deu errado');
    expect(screen.getByText('boom')).toBeInTheDocument();
  });
});
