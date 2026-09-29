import { screen, within } from '@testing-library/react';
import { HttpResponse, http } from 'msw';
import { describe, expect, it } from 'vitest';
import { servidorMock } from '../mocks/servidor';
import { renderizarComProvedores } from '../testes/renderizar';
import { PaginaInicio } from './Inicio';

async function renderizar() {
  const resultado = renderizarComProvedores(<PaginaInicio />, { rota: '/' });
  await screen.findByRole('article', { name: 'Tribonacci' });
  return resultado;
}

describe('Página inicial', () => {
  it('lista as três sequências com fórmula, casos base e primeiros termos', async () => {
    await renderizar();
    const cartoes = screen.getAllByRole('article');
    expect(cartoes.map((cartao) => within(cartao).getByRole('heading').textContent)).toEqual([
      'Fatorial',
      'Fibonacci',
      'Tribonacci',
    ]);

    const tribonacci = screen.getByRole('article', { name: 'Tribonacci' });
    expect(within(tribonacci).getByText('f(n) = f(n-1) + f(n-2) + f(n-3)')).toBeInTheDocument();
    expect(within(tribonacci).getByText('com f(0) = f(1) = f(2) = 1')).toBeInTheDocument();
    expect(within(tribonacci).getByText('1, 1, 1, 3, 5, 9, 17, 31')).toBeInTheDocument();
    expect(within(tribonacci).getByText(/linear \(3n - 5 invocações\)/)).toBeInTheDocument();
  });

  it('mostra a ordem de cada recorrência', async () => {
    await renderizar();
    for (const [nome, ordem] of [
      ['Fatorial', 1],
      ['Fibonacci', 2],
      ['Tribonacci', 3],
    ] as const) {
      const cartao = screen.getByRole('article', { name: nome });
      expect(within(cartao).getByText(`ordem ${ordem}`)).toBeInTheDocument();
    }
  });

  it('diz que o fatorial não ganha nada com o cache', async () => {
    await renderizar();
    const fatorial = screen.getByRole('article', { name: 'Fatorial' });
    expect(within(fatorial).getByText(/linear \(sem ganho\)/)).toBeInTheDocument();
  });

  it('leva a cada tela com a sequência no endereço', async () => {
    await renderizar();
    const fibonacci = screen.getByRole('article', { name: 'Fibonacci' });
    expect(within(fibonacci).getByRole('link', { name: 'Calcular' })).toHaveAttribute(
      'href',
      '/calcular?sequencia=fibonacci',
    );
    expect(within(fibonacci).getByRole('link', { name: 'Comparar' })).toHaveAttribute(
      'href',
      '/comparar?sequencia=fibonacci',
    );
    expect(within(fibonacci).getByRole('link', { name: 'Árvore' })).toHaveAttribute(
      'href',
      '/arvore?sequencia=fibonacci',
    );
  });

  it('mostra os limites de n vindos da API', async () => {
    await renderizar();
    const tribonacci = screen.getByRole('article', { name: 'Tribonacci' });
    expect(
      within(tribonacci).getByText('Aqui n vai até 30 sem cache e 5.000 com cache.'),
    ).toBeInTheDocument();
  });

  it('mapeia os quatro itens do enunciado nas telas', async () => {
    await renderizar();
    expect(screen.getByRole('link', { name: '1 · Calcular com e sem cache' })).toHaveAttribute(
      'href',
      '/calcular?sequencia=tribonacci&n=7',
    );
    expect(screen.getByRole('link', { name: '2 · Comparar tempo e memória' })).toHaveAttribute(
      'href',
      '/comparar?sequencia=tribonacci',
    );
    expect(screen.getByRole('link', { name: '3 · Árvore de chamadas' })).toHaveAttribute(
      'href',
      '/arvore?sequencia=tribonacci&n=7&modo=sem_cache',
    );
    expect(screen.getByRole('link', { name: '4 · Apresentação do f(7)' })).toHaveAttribute(
      'href',
      '/apresentacao',
    );
  });

  it('mostra erro com ação de tentar de novo quando a API falha', async () => {
    servidorMock.use(
      http.get('/api/sequencias', () =>
        HttpResponse.json(
          { codigo: 'ERRO_INTERNO', mensagem: 'Falha ao listar.' },
          { status: 500 },
        ),
      ),
    );
    renderizarComProvedores(<PaginaInicio />, { rota: '/' });
    expect(await screen.findByRole('alert')).toHaveTextContent('Falha ao listar.');
    expect(screen.getByRole('button', { name: 'Tentar de novo' })).toBeInTheDocument();
  });
});
