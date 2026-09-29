import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { describe, expect, it } from 'vitest';
import { api } from '../api/cliente';
import { servidorMock } from '../mocks/servidor';
import { renderizarComProvedores } from '../testes/renderizar';
import { formatarFator } from '../utilitarios/formatar';
import { PaginaComparar } from './Comparar';

async function abrir(rota = '/comparar') {
  const usuario = userEvent.setup();
  renderizarComProvedores(<PaginaComparar />, { rota });
  // Os limites de n vêm da API: com eles na tela, o formulário está pronto.
  await screen.findByText(/^Aceita de 0 a \d/);
  return usuario;
}

function botaoComparar(): HTMLElement {
  return screen.getByRole('button', { name: 'Comparar' });
}

/** Dispara a medição e espera o cartão de destaque aparecer. */
async function medir(usuario: ReturnType<typeof userEvent.setup>): Promise<void> {
  await usuario.click(botaoComparar());
  await screen.findByText('Fator de aceleração', undefined, { timeout: 5000 });
}

/** Cartão de métrica a partir do rótulo: o valor é irmão da linha do rótulo. */
function cartaoMetrica(rotulo: string): HTMLElement {
  const cartao = screen.getByText(rotulo).closest('div')?.parentElement;
  if (cartao === null || cartao === undefined) throw new Error(`cartão ${rotulo} não encontrado`);
  return cartao;
}

function linhaDaTabela(nome: RegExp): HTMLElement {
  const linha = screen.getByRole('rowheader', { name: nome }).closest('tr');
  if (linha === null) throw new Error(`linha ${String(nome)} não encontrada`);
  return linha;
}

describe('Página comparar', () => {
  it('começa vazia, com tribonacci, n 20 e 5 repetições', async () => {
    await abrir();
    expect(screen.getByLabelText('Sequência')).toHaveValue('tribonacci');
    expect(screen.getByLabelText('n')).toHaveValue('20');
    expect(screen.getByLabelText('Repetições')).toHaveValue('5');
    expect(screen.getByText('Nenhuma comparação ainda')).toBeInTheDocument();
  });

  it('explica o método antes de medir e o guarda recolhido depois', async () => {
    const usuario = await abrir();
    const metodo = screen.getByRole('region', { name: 'Como a comparação é feita' });
    for (const termo of ['Contagens', 'Tempo', 'Memória', 'Curvas']) {
      expect(within(metodo).getByText(termo)).toBeInTheDocument();
    }
    expect(within(metodo).getByText(/mede só as funções puras, sem contadores/)).toBeVisible();

    await medir(usuario);
    expect(screen.queryByRole('region', { name: 'Como a comparação é feita' })).toBeNull();
    const resumo = screen.getByRole('heading', { name: 'Como a comparação é feita' });
    expect(resumo.closest('summary')).not.toBeNull();
  });

  it('concorda no singular quando há uma invocação e uma repetição', async () => {
    const usuario = await abrir('/comparar?sequencia=fatorial&n=1&repeticoes=1');
    await medir(usuario);
    expect(cartaoMetrica('Chamadas evitadas pelo cache')).toHaveTextContent(
      'Nenhum argumento se repetiu: 1 invocação nos dois modos.',
    );
    expect(
      screen.getByText(/Os dois modos fizeram a mesma 1 invocação e o cache evitou zero chamadas/),
    ).toBeInTheDocument();
    expect(screen.getByText(/A mediana de 1 repetição foi/)).toBeInTheDocument();
  });

  it('diz uma entrada guardada quando o cache guarda um valor só', async () => {
    const usuario = await abrir('/comparar?sequencia=fatorial&n=2&repeticoes=2');
    await medir(usuario);
    expect(cartaoMetrica('Memória a mais com cache')).toHaveTextContent(/1 entrada guardada\b/);
  });

  it('mede tribonacci f(20) e mostra o fator de aceleração medido', async () => {
    const esperado = await api.comparar({ sequencia: 'tribonacci', n: 20, repeticoes: 5 });
    const usuario = await abrir();
    await medir(usuario);

    const destaque = screen.getByText('Fator de aceleração').parentElement;
    expect(destaque).not.toBeNull();
    expect(
      within(destaque as HTMLElement).getByText(formatarFator(esperado.fator_aceleracao)),
    ).toBeInTheDocument();
    expect(
      within(destaque as HTMLElement).getByText(/com cache foi .* mais rápido\.$/),
    ).toBeVisible();
  });

  it('destaca as chamadas evitadas com as invocações dos dois modos', async () => {
    const usuario = await abrir();
    await medir(usuario);

    const cartao = cartaoMetrica('Chamadas evitadas pelo cache');
    expect(within(cartao).getByText('128.232')).toBeInTheDocument();
    expect(
      within(cartao).getByText('128.287 invocações sem cache contra 55 com cache.'),
    ).toBeInTheDocument();
  });

  it('mostra as cinco estatísticas de tempo e o bloco de memória', async () => {
    const usuario = await abrir();
    await medir(usuario);
    await usuario.click(screen.getByRole('heading', { name: 'Tempo' }));
    await usuario.click(screen.getByRole('heading', { name: 'Memória' }));

    for (const rotulo of [/^Mediana/, /^Média/, /^Mínimo/, /^Máximo/, /^Desvio padrão/]) {
      expect(within(linhaDaTabela(rotulo)).getAllByRole('cell')).toHaveLength(2);
    }
    expect(within(linhaDaTabela(/^Entradas no cache/)).getByText('18')).toBeInTheDocument();
    expect(within(linhaDaTabela(/^Profundidade máxima/)).getAllByText('19')).toHaveLength(2);
    expect(screen.getByText(/O coletor de lixo não é determinista/)).toBeInTheDocument();
  });

  it('não força ganho no fatorial: o cache não evita chamadas e só cobra memória', async () => {
    const usuario = await abrir('/comparar?sequencia=fatorial&n=20');
    await medir(usuario);

    const cartao = cartaoMetrica('Chamadas evitadas pelo cache');
    expect(within(cartao).getByText('0')).toBeInTheDocument();
    expect(
      within(cartao).getByText('Nenhum argumento se repetiu: 20 invocações nos dois modos.'),
    ).toBeInTheDocument();
    expect(screen.getByText(/o cache evitou zero chamadas/)).toBeInTheDocument();
    expect(screen.getByText(/Numa execução isolada o cache aqui só cobra/)).toBeInTheDocument();
  });

  it('avisa que os dados são simulados e mostra o ambiente da resposta', async () => {
    const usuario = await abrir();
    await medir(usuario);

    const aviso = screen.getByText('Dados simulados').closest('[role="status"]');
    expect(aviso).not.toBeNull();
    expect(aviso).toHaveTextContent('A API real ainda não está ligada');
    await usuario.click(screen.getByRole('heading', { name: 'Ambiente de execução' }));
    expect(screen.getByText('navegador (mock MSW) x64')).toBeInTheDocument();
  });

  it('mostra o valor exato, igual nos dois modos', async () => {
    const usuario = await abrir();
    await medir(usuario);
    expect(screen.getByText('Tribonacci f(20) vale')).toBeInTheDocument();
    expect(screen.getByText('85.525')).toBeInTheDocument();
  });

  it('bloqueia n acima do limite e oferece o maior n aceito', async () => {
    const usuario = await abrir('/comparar?sequencia=tribonacci&n=40');

    const aviso = await screen.findByRole('alert');
    expect(aviso).toHaveTextContent('Esse n passa do limite desta demonstração');
    expect(aviso).toHaveTextContent('sem cache Tribonacci não passa de n = 30');
    expect(botaoComparar()).toBeDisabled();

    await usuario.click(screen.getByRole('button', { name: 'Usar n = 30' }));
    expect(screen.getByLabelText('n')).toHaveValue('30');
    expect(botaoComparar()).toBeEnabled();
  });

  it('a escala escolhida na coluna vale para os dois gráficos', async () => {
    const usuario = await abrir();
    await medir(usuario);
    await screen.findByTestId('painel-invocacoes', undefined, { timeout: 5000 });
    expect(screen.getAllByText(/Na escala linear/)).toHaveLength(2);

    await usuario.click(screen.getByRole('radio', { name: 'Logarítmica' }));
    expect(screen.getAllByText(/Na escala logarítmica/)).toHaveLength(2);
    expect(screen.queryByText(/Na escala linear/)).not.toBeInTheDocument();
  });

  it('diz no destaque de memória quando o cache não pesou mais', async () => {
    const medida = await api.comparar({ sequencia: 'tribonacci', n: 20, repeticoes: 5 });
    servidorMock.use(
      http.post('/api/comparar', () =>
        HttpResponse.json({ ...medida, diferenca_memoria_bytes: -208 }),
      ),
    );
    const usuario = await abrir();
    await medir(usuario);
    expect(cartaoMetrica('Memória a mais com cache')).toHaveTextContent(
      /a execução com cache reteve 208 B a menos: a variação do coletor de lixo/,
    );
  });

  it('guarda repetições no endereço e anuncia o resultado numa região viva', async () => {
    const usuario = await abrir('/comparar?sequencia=fibonacci&n=20&repeticoes=3');
    expect(screen.getByLabelText('Repetições')).toHaveValue('3');
    await medir(usuario);

    expect(screen.getByText('3 repetições')).toBeInTheDocument();
    const resumo = screen.getByText(/^Fibonacci f\(20\): 21.891 invocações sem cache/);
    expect(resumo).toHaveAttribute('aria-live', 'polite');

    await usuario.click(screen.getByRole('button', { name: 'Aumentar Repetições' }));
    expect(screen.getByLabelText('Repetições')).toHaveValue('4');
    expect(screen.getByText(/O formulário mudou depois desta medição/)).toBeInTheDocument();
  });
});
