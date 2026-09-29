import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { api } from '../api/cliente';
import { renderizarComProvedores } from '../testes/renderizar';
import { formatarFator } from '../utilitarios/formatar';
import { PaginaComparar } from './Comparar';

async function abrir(rota = '/comparar') {
  const usuario = userEvent.setup();
  renderizarComProvedores(<PaginaComparar />, { rota });
  await screen.findByText(/^Previsão:/);
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

  it('troca a escala dos dois gráficos pela coluna de configuração', async () => {
    const usuario = await abrir();
    const logaritmica = screen.getByRole('radio', { name: 'Logarítmica' });
    await usuario.click(logaritmica);
    expect(logaritmica).toBeChecked();
    expect(screen.getByRole('radiogroup', { name: 'Escala dos gráficos' })).toBeInTheDocument();
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
