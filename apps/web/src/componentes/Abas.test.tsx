import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Abas } from './Abas';

const ABAS = [
  { id: 'tempo', rotulo: 'Tempo', conteudo: <p>Mediana por modo</p> },
  { id: 'memoria', rotulo: 'Memória', conteudo: <p>Heap retido</p> },
  { id: 'chamadas', rotulo: 'Chamadas', conteudo: <p>Invocações por argumento</p> },
];

describe('Abas', () => {
  it('mostra só o painel da aba escolhida', () => {
    render(<Abas rotulo="Detalhes da comparação" abas={ABAS} />);
    expect(screen.getByRole('tablist', { name: 'Detalhes da comparação' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Tempo', selected: true })).toBeInTheDocument();
    expect(screen.getByText('Mediana por modo')).toBeVisible();
    expect(screen.queryByText('Heap retido')).not.toBeInTheDocument();
  });

  it('setas, Home e End percorrem as abas', async () => {
    const usuario = userEvent.setup();
    render(<Abas rotulo="Detalhes" abas={ABAS} />);
    await usuario.tab();
    expect(screen.getByRole('tab', { name: 'Tempo' })).toHaveFocus();
    await usuario.keyboard('{ArrowRight}');
    expect(screen.getByRole('tab', { name: 'Memória', selected: true })).toHaveFocus();
    expect(screen.getByText('Heap retido')).toBeVisible();
    await usuario.keyboard('{End}');
    expect(screen.getByRole('tab', { name: 'Chamadas', selected: true })).toHaveFocus();
    await usuario.keyboard('{Home}');
    expect(screen.getByRole('tab', { name: 'Tempo', selected: true })).toHaveFocus();
    await usuario.keyboard('{ArrowLeft}');
    expect(screen.getByRole('tab', { name: 'Chamadas', selected: true })).toHaveFocus();
  });

  it('o painel é alcançável pelo teclado e ligado à sua aba', async () => {
    const usuario = userEvent.setup();
    render(<Abas rotulo="Detalhes" abas={ABAS} />);
    const aba = screen.getByRole('tab', { name: 'Tempo' });
    const painel = screen.getByRole('tabpanel');
    expect(painel).toHaveAttribute('aria-labelledby', aba.id);
    await usuario.tab();
    await usuario.tab();
    expect(painel).toHaveFocus();
  });

  it('avisa a troca quando é controlada de fora', async () => {
    const usuario = userEvent.setup();
    const aoMudar = vi.fn();
    render(<Abas rotulo="Detalhes" abas={ABAS} ativa="tempo" aoMudar={aoMudar} />);
    await usuario.click(screen.getByRole('tab', { name: 'Memória' }));
    expect(aoMudar).toHaveBeenCalledWith('memoria');
    expect(screen.getByRole('tab', { name: 'Tempo', selected: true })).toBeInTheDocument();
  });
});
