import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Metrica } from './Metrica';

describe('Metrica', () => {
  it('mostra rótulo, valor, unidade e detalhe', () => {
    render(
      <>
        <Metrica
          rotulo="Invocações sem cache"
          valor="46"
          detalhe="1 raiz e 45 recursivas"
          marca="sem-cache"
        />
        <Metrica rotulo="Tempo mediano" valor="1,2" unidade="ms" icone="relogio" destaque />
      </>,
    );
    expect(screen.getByText('Invocações sem cache')).toBeInTheDocument();
    expect(screen.getByText('46')).toBeInTheDocument();
    expect(screen.getByText('1 raiz e 45 recursivas')).toBeInTheDocument();
    expect(screen.getByText('ms')).toBeInTheDocument();
  });
});
