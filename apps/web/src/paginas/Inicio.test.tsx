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

  it('define recursão e mostra o pseudocódigo sem e com cache', async () => {
    await renderizar();
    expect(
      screen.getByText(/são aqueles em que uma determinada instância do problema contém/),
    ).toHaveTextContent(
      'Problemas recursivos são aqueles em que uma determinada instância do problema contém uma instância “menor” do mesmo problema.',
    );

    const semCache = screen.getByRole('region', { name: 'Sem cache' });
    expect(semCache).toHaveTextContent(/o caso base \(“com f\(0\) = …” nos cartões\), sai direto/);
    expect(semCache).toHaveTextContent(/a ordem do cartão/);
    expect(semCache).toHaveTextContent(/custo exponencial/);
    expect(within(semCache).getByText('Função')).toBeInTheDocument();
    expect(semCache.querySelectorAll('mark')).toHaveLength(0);

    const comCache = screen.getByRole('region', { name: 'Com cache (memoização)' });
    expect(comCache).toHaveTextContent(/se f\(n\) já foi calculado, devolve o valor guardado/);
    expect(comCache).toHaveTextContent(/custo linear/);
    expect(comCache).toHaveTextContent(/No Fatorial nada se repete/);
    const marcadas = [...comCache.querySelectorAll('mark')].map((linha) =>
      linha.textContent?.trim(),
    );
    expect(marcadas).toEqual([
      'Senão se cache[n] ≠ vazio Então',
      'retorne cache[n]',
      'cache[n] ← combinação',
      'retorne cache[n]',
    ]);
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

  it('abre o código real das duas funções de cada sequência', async () => {
    const usuario = userEvent.setup();
    await renderizar();
    const tribonacci = screen.getByRole('article', { name: 'Tribonacci' });
    const botao = within(tribonacci).getByRole('button', {
      name: 'Código de Tribonacci em TypeScript',
    });
    await usuario.click(botao);

    const janela = screen.getByRole('dialog', { name: 'Tribonacci em TypeScript' });
    expect(
      within(janela).getByText('export function tribonacciSemCache(n: number): bigint {'),
    ).toBeInTheDocument();
    expect(
      within(janela).getByText(
        'export function tribonacciComCache(n: number, cache: Map<number, bigint>): bigint {',
      ),
    ).toBeInTheDocument();
    expect(
      within(janela).getByText(
        '— as mesmas 3 chamadas recursivas; as linhas marcadas consultam e gravam o cache',
      ),
    ).toBeInTheDocument();
    const marcadas = [...janela.querySelectorAll('mark')].map((linha) => linha.textContent?.trim());
    expect(marcadas).toEqual([
      'const guardado = cache.get(n);',
      'if (guardado !== undefined) return guardado;',
      'cache.set(n, valor);',
    ]);

    await usuario.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(botao).toHaveFocus();
  });

  it('concorda a legenda do código com a ordem: no fatorial, a mesma 1 chamada', async () => {
    const usuario = userEvent.setup();
    await renderizar();
    await usuario.click(screen.getByRole('button', { name: 'Código de Fatorial em TypeScript' }));
    const janela = screen.getByRole('dialog', { name: 'Fatorial em TypeScript' });
    expect(within(janela).getByText('— 1 chamada recursiva por caso não base')).toBeInTheDocument();
    expect(
      within(janela).getByText(
        '— a mesma 1 chamada recursiva; as linhas marcadas consultam e gravam o cache',
      ),
    ).toBeInTheDocument();
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
      within(
        within(tabela)
          .getByRole('rowheader', { name: new RegExp(`^${grandeza}`) })
          .closest('tr')!,
      );

    expect(linha('Tipo de recursão').getByText(/^tripla \(k = 3\)/)).toBeInTheDocument();
    expect(linha('Invocações sem cache').getByText(/^\(3 · 31 − 1\) \/ 2 =/)).toBeInTheDocument();
    expect(
      linha('Invocações com cache').getByText(/^1 \+ 3 · \(7 − 3 \+ 1\) =/),
    ).toBeInTheDocument();
    expect(linha('Chamadas evitadas').getByText(/^46 − 16 =/)).toBeInTheDocument();
    expect(linha('Chamadas evitadas').getByText(/^7 − 7 =/)).toBeInTheDocument();
  });

  it('explica os termos das fórmulas e o que cada linha mede, para quem não conhece a notação', async () => {
    const usuario = userEvent.setup();
    await renderizar();
    await usuario.click(screen.getByText('Fórmulas gerais: invocações, pilha e complexidade'));

    const termos = Object.fromEntries(
      screen
        .getAllByRole('term')
        .map((termo) => [termo.textContent, termo.nextElementSibling?.textContent]),
    );
    expect(Object.keys(termos)).toEqual([
      'n',
      'f(n)',
      'k',
      'b',
      'invocação',
      'Isem, Icom',
      'pilha',
      'Θ(…)',
    ]);
    expect(termos.k).toMatch(/^a ordem: quantas chamadas recursivas/);
    expect(termos['Θ(…)']).toMatch(/φ ≈ 1,618 .* τ ≈ 1,839/);

    const tabela = screen.getByRole('table', { name: /com n = 7$/ });
    expect(
      within(tabela).getByRole('rowheader', {
        name: 'Profundidade da pilha o máximo de chamadas abertas ao mesmo tempo',
      }),
    ).toBeInTheDocument();
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
      within(tabela)
        .getByRole('rowheader', { name: /^Chamadas evitadas/ })
        .closest('tr')!,
    );
    expect(evitadas.getByText(/^289 − 25 =/)).toBeInTheDocument();
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
