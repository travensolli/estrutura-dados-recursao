import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import { SeletorSegmentado } from './SeletorSegmentado';

const OPCOES = [
  { valor: 'fatorial', rotulo: 'Fatorial' },
  { valor: 'fibonacci', rotulo: 'Fibonacci' },
  { valor: 'tribonacci', rotulo: 'Tribonacci' },
] as const;

function SeletorControlado({ vertical = false }: { vertical?: boolean }) {
  const [valor, setValor] = useState<(typeof OPCOES)[number]['valor']>('fatorial');
  return (
    <SeletorSegmentado
      rotulo="Sequência"
      valor={valor}
      aoMudar={setValor}
      opcoes={OPCOES}
      vertical={vertical}
    />
  );
}

describe('SeletorSegmentado', () => {
  it('expõe um grupo de rádios nomeado', () => {
    render(<SeletorControlado />);
    const grupo = screen.getByRole('radiogroup', { name: 'Sequência' });
    expect(grupo).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Fatorial' })).toBeChecked();
  });

  it('só o selecionado entra na ordem de tabulação', () => {
    render(<SeletorControlado />);
    expect(screen.getByRole('radio', { name: 'Fatorial' })).toHaveAttribute('tabindex', '0');
    expect(screen.getByRole('radio', { name: 'Fibonacci' })).toHaveAttribute('tabindex', '-1');
  });

  it('setas movem a seleção e dão a volta', async () => {
    const usuario = userEvent.setup();
    render(<SeletorControlado />);
    await usuario.tab();
    expect(screen.getByRole('radio', { name: 'Fatorial' })).toHaveFocus();
    await usuario.keyboard('{ArrowRight}');
    expect(screen.getByRole('radio', { name: 'Fibonacci' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Fibonacci' })).toHaveFocus();
    await usuario.keyboard('{ArrowLeft}{ArrowLeft}');
    expect(screen.getByRole('radio', { name: 'Tribonacci' })).toBeChecked();
    await usuario.keyboard('{Home}');
    expect(screen.getByRole('radio', { name: 'Fatorial' })).toBeChecked();
    await usuario.keyboard('{End}');
    expect(screen.getByRole('radio', { name: 'Tribonacci' })).toBeChecked();
  });

  it('na vertical empilha em qualquer largura e anda com as setas verticais', async () => {
    const usuario = userEvent.setup();
    render(<SeletorControlado vertical />);
    const grupo = screen.getByRole('radiogroup', { name: 'Sequência' });
    expect(grupo).toHaveClass('flex-col');
    expect(grupo).not.toHaveClass('sm:flex-row');
    await usuario.tab();
    await usuario.keyboard('{ArrowDown}');
    expect(screen.getByRole('radio', { name: 'Fibonacci' })).toBeChecked();
    await usuario.keyboard('{ArrowUp}');
    expect(screen.getByRole('radio', { name: 'Fatorial' })).toBeChecked();
  });

  it('clique também seleciona', async () => {
    const usuario = userEvent.setup();
    render(<SeletorControlado />);
    await usuario.click(screen.getByRole('radio', { name: 'Fibonacci' }));
    expect(screen.getByRole('radio', { name: 'Fibonacci' })).toBeChecked();
  });
});
