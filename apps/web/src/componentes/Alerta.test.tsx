import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Alerta } from './Alerta';

describe('Alerta', () => {
  it('erro é anunciado como alert e traz prefixo textual', () => {
    render(
      <Alerta tipo="erro" titulo="Falhou">
        Detalhes
      </Alerta>,
    );
    const alerta = screen.getByRole('alert');
    expect(alerta).toHaveTextContent('Erro:');
    expect(alerta).toHaveTextContent('Falhou');
  });

  it('informação usa status e prefixo próprio', () => {
    render(<Alerta tipo="info">Só avisando</Alerta>);
    expect(screen.getByRole('status')).toHaveTextContent('Informação: Só avisando');
  });
});
