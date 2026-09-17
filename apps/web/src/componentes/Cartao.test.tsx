import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Cartao } from './Cartao';

describe('Cartao', () => {
  it('seção com título vira região nomeada', () => {
    render(
      <Cartao as="section" titulo="Métricas" descricao="Execução instrumentada">
        conteúdo
      </Cartao>,
    );
    expect(screen.getByRole('region', { name: 'Métricas' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Métricas' })).toBeInTheDocument();
  });

  it('respeita o nível do título pedido', () => {
    render(<Cartao titulo="Detalhes" nivelTitulo={3} />);
    expect(screen.getByRole('heading', { level: 3, name: 'Detalhes' })).toBeInTheDocument();
  });
});
