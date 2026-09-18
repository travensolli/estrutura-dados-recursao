import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Tabela, type ColunaTabela } from './Tabela';

interface Linha {
  argumento: number;
  invocacoes: number;
}

const COLUNAS: ColunaTabela<Linha>[] = [
  {
    chave: 'argumento',
    rotulo: 'Argumento',
    cabecalhoDeLinha: true,
    conteudo: (linha) => `f(${linha.argumento})`,
  },
  {
    chave: 'invocacoes',
    rotulo: 'Invocações',
    numerico: true,
    conteudo: (linha) => linha.invocacoes,
  },
];

const LINHAS: Linha[] = [
  { argumento: 7, invocacoes: 1 },
  { argumento: 6, invocacoes: 1 },
  { argumento: 5, invocacoes: 2 },
];

describe('Tabela', () => {
  it('é uma região rolável nomeada e alcançável pelo teclado', () => {
    render(
      <Tabela
        legenda="Invocações por argumento"
        colunas={COLUNAS}
        linhas={LINHAS}
        chave={(linha) => linha.argumento}
      />,
    );
    const regiao = screen.getByRole('region', { name: 'Invocações por argumento' });
    expect(regiao).toHaveAttribute('tabindex', '0');
    expect(screen.getByRole('table', { name: 'Invocações por argumento' })).toBeInTheDocument();
  });

  it('monta cabeçalhos de coluna e de linha', () => {
    render(
      <Tabela
        legenda="Invocações por argumento"
        colunas={COLUNAS}
        linhas={LINHAS}
        chave={(linha) => linha.argumento}
      />,
    );
    expect(screen.getByRole('columnheader', { name: 'Argumento' })).toBeInTheDocument();
    expect(screen.getByRole('rowheader', { name: 'f(5)' })).toBeInTheDocument();
    expect(screen.getAllByRole('row')).toHaveLength(LINHAS.length + 1);
  });

  it('sem linhas mostra a mensagem de vazio', () => {
    render(
      <Tabela
        legenda="Invocações por argumento"
        colunas={COLUNAS}
        linhas={[]}
        chave={(linha) => linha.argumento}
        vazio="Rode um cálculo para ver a contagem."
      />,
    );
    expect(screen.getByText('Rode um cálculo para ver a contagem.')).toBeInTheDocument();
  });
});
