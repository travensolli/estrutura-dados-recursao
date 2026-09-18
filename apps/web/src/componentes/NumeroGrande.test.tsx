import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { NumeroGrande } from './NumeroGrande';

const FATORIAL_25 = '15511210043330985984000000';

describe('NumeroGrande', () => {
  it('valor curto aparece inteiro, sem opção de expandir', () => {
    render(<NumeroGrande valor="3628800" rotulo="Fatorial de 10" />);
    expect(screen.getByText('3.628.800')).toBeInTheDocument();
    expect(screen.getByText('7 dígitos')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /valor completo/ })).not.toBeInTheDocument();
  });

  it('valor longo é abreviado e informa a quantidade de dígitos', () => {
    render(<NumeroGrande valor={FATORIAL_25} />);
    expect(screen.getByText('1551121…4000000')).toBeInTheDocument();
    expect(screen.getByText('26 dígitos')).toBeInTheDocument();
  });

  it('ver valor completo expande e recolhe', async () => {
    const usuario = userEvent.setup();
    render(<NumeroGrande valor={FATORIAL_25} />);
    const alternar = screen.getByRole('button', { name: 'Ver valor completo' });
    expect(alternar).toHaveAttribute('aria-expanded', 'false');
    await usuario.click(alternar);
    const expandido = screen.getByRole('button', { name: 'Ocultar valor completo' });
    expect(expandido).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText(FATORIAL_25)).toBeVisible();
    await usuario.click(expandido);
    expect(screen.getByRole('button', { name: 'Ver valor completo' })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
  });

  it('copiar leva o valor completo e mostra retorno', async () => {
    const usuario = userEvent.setup();
    render(<NumeroGrande valor={FATORIAL_25} nome="fatorial de 25" />);
    await usuario.click(screen.getByRole('button', { name: 'Copiar o valor de fatorial de 25' }));
    expect(await navigator.clipboard.readText()).toBe(FATORIAL_25);
    expect(await screen.findByText('Valor copiado')).toBeInTheDocument();
  });
});
