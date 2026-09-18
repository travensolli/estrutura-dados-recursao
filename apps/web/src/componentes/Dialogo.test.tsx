import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Botao } from './Botao';
import { Dialogo, DialogoConfirmacao } from './Dialogo';

function Exemplo({ aoConfirmar = vi.fn() }: { aoConfirmar?: () => void }) {
  const [aberto, setAberto] = useState(false);
  return (
    <>
      <Botao onClick={() => setAberto(true)}>Calcular mesmo assim</Botao>
      <DialogoConfirmacao
        aberto={aberto}
        aoFechar={() => setAberto(false)}
        aoConfirmar={() => {
          aoConfirmar();
          setAberto(false);
        }}
        titulo="Cálculo pesado"
        descricao="Essa execução prevê mais de um milhão de invocações."
        rotuloConfirmar="Calcular assim mesmo"
      />
    </>
  );
}

describe('Dialogo', () => {
  it('abre como diálogo modal nomeado e descrito', async () => {
    const usuario = userEvent.setup();
    render(<Exemplo />);
    await usuario.click(screen.getByRole('button', { name: 'Calcular mesmo assim' }));
    const dialogo = screen.getByRole('dialog', { name: 'Cálculo pesado' });
    expect(dialogo).toHaveAttribute('aria-modal', 'true');
    expect(dialogo).toHaveAccessibleDescription(/mais de um milhão de invocações/);
    expect(dialogo).toHaveFocus();
  });

  it('Esc fecha e devolve o foco para quem abriu', async () => {
    const usuario = userEvent.setup();
    render(<Exemplo />);
    const gatilho = screen.getByRole('button', { name: 'Calcular mesmo assim' });
    await usuario.click(gatilho);
    await usuario.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(gatilho).toHaveFocus();
  });

  it('prende o foco dentro do painel', async () => {
    const usuario = userEvent.setup();
    render(<Exemplo />);
    await usuario.click(screen.getByRole('button', { name: 'Calcular mesmo assim' }));
    const fechar = screen.getByRole('button', { name: 'Fechar' });
    const cancelar = screen.getByRole('button', { name: 'Cancelar' });
    const confirmar = screen.getByRole('button', { name: 'Calcular assim mesmo' });

    await usuario.tab();
    expect(fechar).toHaveFocus();
    await usuario.tab();
    expect(cancelar).toHaveFocus();
    await usuario.tab();
    expect(confirmar).toHaveFocus();
    await usuario.tab();
    expect(fechar).toHaveFocus();
    await usuario.tab({ shift: true });
    expect(confirmar).toHaveFocus();
  });

  it('confirma pelo teclado', async () => {
    const usuario = userEvent.setup();
    const confirmar = vi.fn();
    render(<Exemplo aoConfirmar={confirmar} />);
    await usuario.click(screen.getByRole('button', { name: 'Calcular mesmo assim' }));
    await usuario.click(screen.getByRole('button', { name: 'Calcular assim mesmo' }));
    expect(confirmar).toHaveBeenCalledOnce();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('não renderiza nada quando fechado', () => {
    render(
      <Dialogo aberto={false} aoFechar={vi.fn()} titulo="Oculto">
        conteúdo
      </Dialogo>,
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
