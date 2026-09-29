import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { api } from '../api/cliente';
import { formatarInteiro } from '../utilitarios/formatar';
import { renderizarComProvedores } from '../testes/renderizar';
import { PaginaCalcular } from './Calcular';

async function abrir(rota = '/calcular') {
  const usuario = userEvent.setup();
  renderizarComProvedores(<PaginaCalcular />, { rota });
  // Os limites de n vêm da API: com eles na tela, o formulário está pronto.
  await screen.findByText(/^Aceita de 0 a \d/);
  return usuario;
}

function botaoCalcular() {
  return screen.getByRole('button', { name: 'Calcular' });
}

/** O valor herói fica ao lado do seu rótulo, que é único na tela. */
async function valorHeroi(rotulo: string): Promise<HTMLElement> {
  const alvo = await screen.findByText(rotulo);
  const bloco = alvo.parentElement;
  if (bloco === null) throw new Error('bloco do valor não encontrado');
  return bloco;
}

function regiaoMetricas(modo: 'sem cache' | 'com cache'): HTMLElement {
  return screen.getByRole('region', { name: `Métricas ${modo}` });
}

/** Cartão de métrica a partir do seu rótulo: o valor é irmão da linha do rótulo. */
function cartaoMetrica(regiao: HTMLElement, rotulo: string | RegExp): HTMLElement {
  const cartao = within(regiao).getByText(rotulo).closest('div')?.parentElement;
  if (cartao === null || cartao === undefined) throw new Error(`cartão ${rotulo} não encontrado`);
  return cartao;
}

/** Linha do placar de um modo: rótulo e valor dividem a mesma linha. */
function linhaMetrica(regiao: HTMLElement, rotulo: string): HTMLElement {
  const linha = within(regiao).getByText(rotulo, { selector: 'dt' }).closest('div');
  if (linha === null) throw new Error(`linha ${rotulo} não encontrada`);
  return linha;
}

function valorNaLinha(modo: 'sem cache' | 'com cache', rotulo: string): string {
  return (
    within(linhaMetrica(regiaoMetricas(modo), rotulo)).getByRole('definition').textContent ?? ''
  );
}

function linhaDaTabela(nome: RegExp | string): HTMLElement {
  const celula = screen.getByRole('rowheader', { name: nome });
  const linha = celula.closest('tr');
  if (linha === null) throw new Error(`linha ${String(nome)} não encontrada`);
  return linha;
}

function linhaDoArgumento(argumento: number): HTMLElement {
  return linhaDaTabela(`f(${argumento})`);
}

describe('Página calcular', () => {
  it('começa vazia, com tribonacci, n 7 e sem cache', async () => {
    await abrir();
    expect(screen.getByLabelText('Sequência')).toHaveValue('tribonacci');
    expect(screen.getByRole('radio', { name: 'Sem cache' })).toBeChecked();
    expect(screen.getByLabelText('n')).toHaveValue('7');
    expect(screen.getByText('Nenhum cálculo ainda')).toBeInTheDocument();
  });

  it('calcula tribonacci f(7) sem cache e mostra as 46 invocações da resposta', async () => {
    const usuario = await abrir();
    await usuario.click(botaoCalcular());

    const heroi = await valorHeroi('Tribonacci f(7) vale');
    expect(within(heroi).getByText('31')).toBeInTheDocument();
    expect(within(heroi).getByText('2 dígitos')).toBeInTheDocument();

    const esperado = [
      ['Invocações', '46'],
      ['Chamadas recursivas', '45'],
      ['Casos base', '31'],
      ['Calculados', '15'],
      ['Acertos de cache', '0'],
      ['Entradas no cache', '0'],
      ['Profundidade máxima', '6'],
    ] as const;
    for (const [rotulo, valor] of esperado) {
      expect(valorNaLinha('sem cache', rotulo)).toBe(valor);
    }
  });

  it('explica sob demanda o que cada número conta', async () => {
    const usuario = await abrir();
    await usuario.click(botaoCalcular());
    await valorHeroi('Tribonacci f(7) vale');
    await usuario.click(screen.getByText('O que cada número conta'));
    expect(
      screen.getByText(
        'Todas as chamadas, a raiz incluída: casos base + calculados + acertos de cache.',
      ),
    ).toBeVisible();
    expect(screen.getByText('Sem cache nada é reaproveitado.')).toBeVisible();
    expect(screen.getByText(/versão instrumentada da recursão/)).toBeVisible();
  });

  it('mostra as invocações por argumento com barra proporcional', async () => {
    const usuario = await abrir();
    await usuario.click(botaoCalcular());
    await valorHeroi('Tribonacci f(7) vale');
    await usuario.click(screen.getByText('Invocações por argumento'));

    const esperado: Array<[number, string]> = [
      [7, '1'],
      [6, '1'],
      [5, '2'],
      [4, '4'],
      [3, '7'],
      [2, '13'],
      [1, '11'],
      [0, '7'],
    ];
    for (const [argumento, invocacoes] of esperado) {
      expect(within(linhaDoArgumento(argumento)).getByText(invocacoes)).toBeInTheDocument();
    }
    expect(screen.getByText('Somando todos os argumentos: 46 sem cache.')).toBeInTheDocument();
  });

  it('anuncia o resultado numa região viva, com os parâmetros executados', async () => {
    const usuario = await abrir();
    await usuario.click(botaoCalcular());
    await valorHeroi('Tribonacci f(7) vale');
    const resumo = screen.getByText('Tribonacci f(7) = 31. 46 invocações sem cache.');
    expect(resumo).toHaveAttribute('role', 'status');
    expect(resumo).toHaveAttribute('aria-live', 'polite');
  });

  it('anuncia no singular uma execução de uma invocação só', async () => {
    const usuario = await abrir('/calcular?sequencia=fatorial&n=1&modo=sem_cache');
    await usuario.click(botaoCalcular());
    await valorHeroi('Fatorial f(1) vale');
    expect(screen.getByText('Fatorial f(1) = 1. 1 invocação sem cache.')).toHaveAttribute(
      'role',
      'status',
    );
  });

  it('liga o resultado à árvore da mesma execução', async () => {
    const usuario = await abrir();
    await usuario.click(botaoCalcular());
    await valorHeroi('Tribonacci f(7) vale');
    expect(screen.getByRole('link', { name: 'Ver árvore desta execução' })).toHaveAttribute(
      'href',
      '/arvore?sequencia=tribonacci&n=7&modo=sem_cache',
    );
  });

  it('avisa que a duração é indicativa e não é benchmark', async () => {
    const usuario = await abrir();
    await usuario.click(botaoCalcular());
    await valorHeroi('Tribonacci f(7) vale');
    expect(screen.getByText(/não é benchmark/)).toBeInTheDocument();
  });

  it('compara os dois modos lado a lado', async () => {
    const usuario = await abrir('/calcular?sequencia=tribonacci&n=7&modo=comparar');
    await usuario.click(botaoCalcular());
    await valorHeroi('Tribonacci f(7) vale');
    await usuario.click(screen.getByText('Invocações por argumento'));

    expect(valorNaLinha('sem cache', 'Invocações')).toBe('46');
    expect(valorNaLinha('com cache', 'Invocações')).toBe('16');
    expect(valorNaLinha('sem cache', 'Acertos de cache')).toBe('0');
    expect(valorNaLinha('com cache', 'Acertos de cache')).toBe('5');

    const linha = linhaDoArgumento(3);
    expect(within(linha).getByText('7')).toBeInTheDocument();
    expect(within(linha).getByText('3')).toBeInTheDocument();
    expect(
      screen.getByText('Somando todos os argumentos: 46 sem cache e 16 com cache.'),
    ).toBeInTheDocument();
  });

  it('destaca as chamadas evitadas pelo cache', async () => {
    const usuario = await abrir('/calcular?sequencia=tribonacci&n=7&modo=comparar');
    await usuario.click(botaoCalcular());
    await valorHeroi('Tribonacci f(7) vale');

    const cartao = cartaoMetrica(document.body, 'Chamadas evitadas pelo cache');
    expect(within(cartao).getByText('30')).toBeInTheDocument();
    expect(within(cartao).getByText('46 invocações sem cache contra 16 com cache.')).toBeVisible();
  });

  it('não força ganho onde não existe: fatorial evita zero chamadas', async () => {
    const usuario = await abrir('/calcular?sequencia=fatorial&n=10&modo=comparar');
    await usuario.click(botaoCalcular());
    await valorHeroi('Fatorial f(10) vale');

    expect(valorNaLinha('sem cache', 'Invocações')).toBe('10');
    expect(valorNaLinha('com cache', 'Invocações')).toBe('10');
    const cartao = cartaoMetrica(document.body, 'Chamadas evitadas pelo cache');
    expect(within(cartao).getByText('0')).toBeInTheDocument();
    expect(within(cartao).getByText(/Nenhum argumento se repetiu/)).toBeInTheDocument();
  });

  it('pede confirmação quando a estimativa diz que o cálculo é pesado', async () => {
    const previsao = await api.estimativa({ sequencia: 'fibonacci', n: 30, modo: 'sem_cache' });
    expect(previsao.pesado).toBe(true);

    const usuario = await abrir('/calcular?sequencia=fibonacci&n=30&modo=sem_cache');
    await usuario.click(botaoCalcular());

    const diagolo = await screen.findByRole('dialog');
    expect(within(diagolo).getByRole('heading')).toHaveTextContent('Este cálculo é pesado');
    expect(diagolo).toHaveTextContent(
      `${formatarInteiro(previsao.invocacoes_previstas)} invocações`,
    );

    await usuario.click(within(diagolo).getByRole('button', { name: 'Voltar e ajustar' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByText('Nenhum cálculo ainda')).toBeInTheDocument();
  });

  it('bloqueia n acima do limite e oferece o maior n aceito', async () => {
    const usuario = await abrir('/calcular?sequencia=tribonacci&n=40&modo=sem_cache');

    const aviso = await screen.findByRole('alert');
    expect(aviso).toHaveTextContent('Esse n passa do limite desta demonstração');
    expect(aviso).toHaveTextContent('o maior n permitido é 30');
    expect(botaoCalcular()).toBeDisabled();

    await usuario.click(screen.getByRole('button', { name: 'Usar n = 30' }));
    expect(screen.getByLabelText('n')).toHaveValue('30');
    expect(botaoCalcular()).toBeEnabled();
  });

  it('mostra o fatorial de 25 sem perder precisão', async () => {
    const usuario = await abrir('/calcular?sequencia=fatorial&n=25&modo=com_cache');
    await usuario.click(botaoCalcular());

    expect(await screen.findByText('26 dígitos')).toBeInTheDocument();
    expect(
      within(regiaoMetricas('com cache')).getByText('Calculados (faltas de cache)'),
    ).toBeInTheDocument();
    await usuario.click(screen.getByRole('button', { name: 'Ver valor completo' }));
    expect(screen.getByText('15511210043330985984000000')).toBeVisible();
  });

  it('guarda sequência, n e modo no endereço', async () => {
    const usuario = await abrir();
    await usuario.selectOptions(screen.getByLabelText('Sequência'), 'fibonacci');
    await usuario.click(screen.getByRole('radio', { name: 'Com cache' }));
    await usuario.clear(screen.getByLabelText('n'));
    await usuario.type(screen.getByLabelText('n'), '12');
    expect(screen.getByLabelText('Sequência')).toHaveValue('fibonacci');
    expect(screen.getByRole('radio', { name: 'Com cache' })).toBeChecked();
    expect(screen.getByLabelText('n')).toHaveValue('12');
    expect(document.title).toMatch(/^Calcular Fibonacci f\(12\)/);
  });
});
