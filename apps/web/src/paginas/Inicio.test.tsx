import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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
    expect(within(tribonacci).getByText('linear, 3n − 5 invocações (n ≥ 2)')).toBeInTheDocument();
  });

  it('explica por que o cache importa, sem esquecer os casos base', async () => {
    await renderizar();
    const [semCache, comCache] = screen.getAllByRole('listitem').slice(0, 2);
    expect(semCache).toHaveTextContent(
      /Sem cache, cada chamada que não é caso base abre uma chamada por termo anterior/,
    );
    expect(semCache).toHaveTextContent(/o custo é exponencial/);
    expect(comCache).toHaveTextContent(
      /Com cache \(memoização\), cada f\(k\) acima dos casos base/,
    );
    expect(comCache).toHaveTextContent(/o custo vira linear/);
  });

  it('mostra o tipo de recursão e a ordem de cada recorrência', async () => {
    await renderizar();
    for (const [nome, tipo] of [
      ['Fatorial', 'recursão linear · ordem 1'],
      ['Fibonacci', 'recursão dupla · ordem 2'],
      ['Tribonacci', 'recursão tripla · ordem 3'],
    ] as const) {
      const cartao = screen.getByRole('article', { name: nome });
      expect(within(cartao).getByText(tipo)).toBeInTheDocument();
    }
  });

  it('diz que o fatorial não ganha nada com o cache', async () => {
    await renderizar();
    const fatorial = screen.getByRole('article', { name: 'Fatorial' });
    expect(within(fatorial).getByText('linear, sem ganho')).toBeInTheDocument();
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

  it('não repete nos cartões os limites de n de cada modo', async () => {
    await renderizar();
    expect(screen.queryByText(/Aqui n vai até/)).not.toBeInTheDocument();
  });

  it('traz as fórmulas gerais fechadas, com a conta de cada sequência', async () => {
    const usuario = userEvent.setup();
    await renderizar();
    const resumo = screen.getByText('Fórmulas gerais: invocações, pilha e complexidade');
    expect(resumo.closest('details')).not.toHaveAttribute('open');

    await usuario.click(resumo);
    const tabela = screen.getByRole('table', { name: /com n = 7$/ });
    const linha = (grandeza: string) =>
      within(within(tabela).getByRole('rowheader', { name: grandeza }).closest('tr')!);

    expect(linha('Tipo de recursão').getByText(/^tripla \(k = 3\)/)).toBeInTheDocument();
    expect(linha('Invocações sem cache').getByText(/^\(3 · 31 − 1\) \/ 2 =/)).toBeInTheDocument();
    expect(
      linha('Invocações com cache').getByText(/^1 \+ 3 · \(7 − 3 \+ 1\) =/),
    ).toBeInTheDocument();
    expect(linha('Chamadas evitadas').getByText(/^46 − 16 =/)).toBeInTheDocument();
    expect(linha('Chamadas evitadas').getByText(/^7 − 7 =/)).toBeInTheDocument();
  });

  it('refaz as contas quando o n do exemplo muda', async () => {
    const usuario = userEvent.setup();
    await renderizar();
    await usuario.click(screen.getByText('Fórmulas gerais: invocações, pilha e complexidade'));
    const campo = screen.getByLabelText('n do exemplo');
    await usuario.clear(campo);
    await usuario.type(campo, '10');

    const tabela = screen.getByRole('table', { name: /com n = 10$/ });
    const evitadas = within(
      within(tabela).getByRole('rowheader', { name: 'Chamadas evitadas' }).closest('tr')!,
    );
    expect(evitadas.getByText(/^289 − 25 =/)).toBeInTheDocument();
  });

  it('mapeia os quatro itens do enunciado nas telas', async () => {
    await renderizar();
    expect(screen.getByRole('link', { name: '1 · Calcular com e sem cache' })).toHaveAttribute(
      'href',
      '/calcular?sequencia=tribonacci&n=7&modo=comparar',
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
