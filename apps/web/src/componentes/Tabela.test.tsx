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
  it('por padrão não tem grade, zebra nem largura fixa', () => {
    render(
      <Tabela legenda="Simples" colunas={COLUNAS} linhas={LINHAS} chave={(l) => l.argumento} />,
    );
    const tabela = screen.getByRole('table');
    expect(tabela).not.toHaveClass('table-fixed');
    expect(screen.getByRole('columnheader', { name: 'Argumento' })).toHaveClass(
      'whitespace-nowrap',
    );
    expect(screen.getAllByRole('row')[2]).not.toHaveClass('even:bg-superficie-suave');
  });

  it('com grade, zebra e ajuste, cruza as células e cabe na largura', () => {
    render(
      <Tabela
        legenda="Com grade"
        colunas={COLUNAS}
        linhas={LINHAS}
        chave={(l) => l.argumento}
        grade
        zebrado
        ajustada
        destacar={(l) => l.argumento === 5}
      />,
    );
    expect(screen.getByRole('table')).toHaveClass('table-fixed');
    const cabecalho = screen.getByRole('columnheader', { name: 'Invocações' });
    expect(cabecalho).toHaveClass('border-l');
    expect(cabecalho).not.toHaveClass('whitespace-nowrap');
    const [, primeira, segunda, destacada] = screen.getAllByRole('row');
    expect(primeira).toHaveClass('even:bg-superficie-suave');
    expect(segunda).toHaveClass('even:bg-superficie-suave');
    expect(destacada).toHaveClass('bg-primaria-suave');
    expect(destacada).not.toHaveClass('even:bg-superficie-suave');
    expect(screen.getAllByRole('cell')[0]).toHaveClass('break-words');
  });

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
