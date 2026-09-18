import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { CampoNumero } from './CampoNumero';

function CampoControlado({
  inicial = '7',
  aoConfirmar,
}: {
  inicial?: string;
  aoConfirmar?: (valor: number) => void;
}) {
  const [texto, setTexto] = useState(inicial);
  return (
    <CampoNumero
      rotulo="n"
      valor={texto}
      minimo={0}
      maximo={30}
      aoMudar={(novo) => setTexto(novo)}
      aoConfirmar={aoConfirmar}
    />
  );
}

describe('CampoNumero', () => {
  it('mostra os limites e usa teclado numérico', () => {
    render(<CampoControlado />);
    const campo = screen.getByLabelText('n');
    expect(campo).toHaveAttribute('inputmode', 'numeric');
    expect(screen.getByText(/Aceita de 0 a 30/)).toBeInTheDocument();
    expect(campo).toHaveAccessibleDescription(/Aceita de 0 a 30/);
  });

  it('valida em tempo real acima do máximo', async () => {
    const usuario = userEvent.setup();
    render(<CampoControlado inicial="" />);
    const campo = screen.getByLabelText('n');
    await usuario.type(campo, '31');
    expect(await screen.findByText('O maior valor aceito é 30.')).toBeInTheDocument();
    expect(campo).toHaveAttribute('aria-invalid', 'true');
  });

  it('recusa texto que não é dígito', async () => {
    const usuario = userEvent.setup();
    render(<CampoControlado inicial="" />);
    await usuario.type(screen.getByLabelText('n'), 'abc');
    expect(screen.getByText(/apenas dígitos/)).toBeInTheDocument();
  });

  it('só cobra o preenchimento depois que o campo perde o foco', async () => {
    const usuario = userEvent.setup();
    render(<CampoControlado inicial="" />);
    expect(screen.queryByText('Informe um valor para n.')).not.toBeInTheDocument();
    await usuario.click(screen.getByLabelText('n'));
    await usuario.tab();
    expect(screen.getByText('Informe um valor para n.')).toBeInTheDocument();
  });

  it('botões e setas respeitam os limites', async () => {
    const usuario = userEvent.setup();
    render(<CampoControlado inicial="29" />);
    const campo = screen.getByLabelText('n');
    await usuario.click(screen.getByRole('button', { name: 'Aumentar n' }));
    expect(campo).toHaveValue('30');
    expect(screen.getByRole('button', { name: 'Aumentar n' })).toBeDisabled();
    await usuario.type(campo, '{ArrowDown}');
    expect(campo).toHaveValue('29');
  });

  it('Enter confirma somente com valor válido', async () => {
    const usuario = userEvent.setup();
    const confirmar = vi.fn();
    render(<CampoControlado inicial="7" aoConfirmar={confirmar} />);
    const campo = screen.getByLabelText('n');
    await usuario.type(campo, '{Enter}');
    expect(confirmar).toHaveBeenCalledWith(7);
    await usuario.clear(campo);
    await usuario.type(campo, '{Enter}');
    expect(confirmar).toHaveBeenCalledOnce();
  });
});
