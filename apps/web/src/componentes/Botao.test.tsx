import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { renderizarComProvedores } from '../testes/renderizar';
import { Botao, BotaoIcone, BotaoLink } from './Botao';

describe('Botao', () => {
  it('é do tipo button por padrão e dispara onClick', async () => {
    const usuario = userEvent.setup();
    const aoClicar = vi.fn();
    render(<Botao onClick={aoClicar}>Calcular</Botao>);
    const botao = screen.getByRole('button', { name: 'Calcular' });
    expect(botao).toHaveAttribute('type', 'button');
    await usuario.click(botao);
    expect(aoClicar).toHaveBeenCalledOnce();
  });

  it('em carregamento fica desabilitado, ocupado e troca o rótulo', () => {
    render(
      <Botao carregando rotuloCarregando="Calculando…">
        Calcular
      </Botao>,
    );
    const botao = screen.getByRole('button', { name: 'Calculando…' });
    expect(botao).toBeDisabled();
    expect(botao).toHaveAttribute('aria-busy', 'true');
  });

  it('BotaoIcone expõe nome acessível mesmo sem texto visível', async () => {
    const usuario = userEvent.setup();
    const aoClicar = vi.fn();
    render(<BotaoIcone icone="copiar" rotulo="Copiar valor" onClick={aoClicar} />);
    const botao = screen.getByRole('button', { name: 'Copiar valor' });
    await usuario.click(botao);
    expect(aoClicar).toHaveBeenCalledOnce();
  });

  it('BotaoLink renderiza um link para o destino', () => {
    renderizarComProvedores(<BotaoLink to="/calcular?sequencia=fatorial">Calcular</BotaoLink>);
    expect(screen.getByRole('link', { name: 'Calcular' })).toHaveAttribute(
      'href',
      '/calcular?sequencia=fatorial',
    );
  });
});
