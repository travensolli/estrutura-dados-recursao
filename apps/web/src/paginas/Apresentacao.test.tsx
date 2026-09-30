import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { MemoryRouter, useLocation } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { servidorMock } from '../mocks/servidor';
import type { PedidoCalculo } from '../plano-b/mensagens';
import { processarPedido } from '../plano-b/processar';
import { PaginaApresentacao } from './Apresentacao';

/** Worker falso: roda a mesma função pura do worker real. */
class TrabalhadorFalso extends EventTarget {
  postMessage(pedido: PedidoCalculo) {
    queueMicrotask(() =>
      this.dispatchEvent(new MessageEvent('message', { data: processarPedido(pedido) })),
    );
  }
  terminate() {}
}

function Endereco() {
  return <span data-testid="endereco">{useLocation().search}</span>;
}

function abrir(caminho = '/apresentacao') {
  const cliente = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={cliente}>
      <MemoryRouter initialEntries={[caminho]}>
        <PaginaApresentacao />
        <Endereco />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

const titulo = () => screen.getByRole('heading', { level: 1 }).textContent;
const esperarPalco = () => screen.findByRole('heading', { level: 1 });

afterEach(() => {
  vi.unstubAllGlobals();
  Reflect.deleteProperty(document.documentElement, 'requestFullscreen');
});

describe('modo apresentação', () => {
  it('abre na função, com a fórmula e o valor de f(7) da resposta', async () => {
    abrir();
    expect(await esperarPalco()).toHaveTextContent('Tribonacci, definido por ele mesmo');
    await waitFor(() => expect(screen.getByTestId('valor-alvo')).toHaveTextContent('31'));
    expect(screen.getByText('f(n) = f(n-1) + f(n-2) + f(n-3)')).toBeInTheDocument();
    expect(screen.getByText('f(0) = f(1) = f(2) = 1')).toBeInTheDocument();
    expect(screen.getByText('Slide 1 de 6')).toBeInTheDocument();
  });

  it('mostra 46 invocações sem cache vindas das métricas', async () => {
    abrir('/apresentacao?slide=2');
    await esperarPalco();
    const placar = await screen.findByLabelText('Números da execução sem cache');
    expect(within(placar).getByText('invocações').nextElementSibling).toHaveTextContent('46');
    expect(within(placar).getByText('casos base').nextElementSibling).toHaveTextContent('31');
    expect(screen.getAllByTestId('linha-argumento')).toHaveLength(8);
    expect(screen.getByText(/f\(2\) é chamado 13 vezes das 46 invocações/)).toBeInTheDocument();
  });

  it('conta de 46 para 16 e prova as 30 chamadas evitadas', async () => {
    abrir('/apresentacao?slide=5');
    await esperarPalco();
    await waitFor(() => expect(screen.getByTestId('evitadas')).toBeInTheDocument());

    expect(screen.getByTestId('evitadas')).toHaveTextContent('− 30 chamadas evitadas');
    expect(screen.getByText('de 46 sem cache para 16 com cache')).toBeInTheDocument();
    expect(screen.getByTestId('prova-podas')).toHaveTextContent('12 + 6 + 6 + 3 + 3 = 30');
    expect(screen.getByTestId('prova-recursivas')).toHaveTextContent('45 − 15 = 30');
    await waitFor(() => expect(screen.getByTestId('contador')).toHaveTextContent('16'), {
      timeout: 4000,
    });
  });

  it('desenha as subárvores evitadas somando 30 chamadas', async () => {
    abrir('/apresentacao?slide=4');
    await esperarPalco();
    await waitFor(() => expect(screen.getAllByTestId('poda')).toHaveLength(5));

    const quantidades = screen
      .getAllByTestId('poda')
      .map((item) => Number(/evita (\d+)/.exec(item.textContent ?? '')?.[1]));
    expect(quantidades).toEqual([12, 6, 6, 3, 3]);
    expect(quantidades.reduce((soma, parcela) => soma + parcela, 0)).toBe(30);
    expect(screen.getByText('evita 12 chamadas')).toBeInTheDocument();
    expect(
      screen.getAllByTestId('no-arvore').filter((no) => no.dataset.fantasma === 'sim'),
    ).toHaveLength(30);
    expect(screen.getByText(/dá 46 nós, exatamente o total sem cache/)).toBeInTheDocument();
  });

  it('navega entre slides pelo teclado e guarda o slide no endereço', async () => {
    const usuario = userEvent.setup();
    abrir();
    await esperarPalco();

    await usuario.keyboard('{ArrowRight}');
    expect(titulo()).toContain('Sem cache');
    expect(screen.getByTestId('endereco')).toHaveTextContent('?slide=2');

    await usuario.keyboard('{ArrowRight}');
    expect(titulo()).toContain('O cache calcula uma vez');

    // No slide do cache as setas são da reprodução: a trilha anda com PageDown.
    await usuario.keyboard('{PageDown}');
    expect(titulo()).toContain('O que deixou de ser chamado');
    await usuario.keyboard('{PageUp}');
    expect(titulo()).toContain('O cache calcula uma vez');

    await usuario.keyboard('6');
    expect(screen.getByText('Slide 6 de 6')).toBeInTheDocument();
    expect(screen.getByTestId('endereco')).toHaveTextContent('?slide=6');

    await usuario.keyboard('{Home}');
    expect(screen.getByText('Slide 1 de 6')).toBeInTheDocument();
  });

  it('anda pela trilha e pelos botões do rodapé', async () => {
    const usuario = userEvent.setup();
    abrir();
    await esperarPalco();

    await usuario.click(screen.getByRole('button', { name: /Próximo/ }));
    expect(screen.getByText('Slide 2 de 6')).toBeInTheDocument();

    const trilha = screen.getAllByTestId('slide-trilha');
    await usuario.click(trilha[4] as HTMLElement);
    expect(screen.getByText('Slide 5 de 6')).toBeInTheDocument();
    expect(trilha[4]).toHaveAttribute('aria-current', 'step');
  });

  it('caminha pela reprodução do cache com os momentos guiados', async () => {
    const usuario = userEvent.setup();
    abrir('/apresentacao?slide=3');
    await esperarPalco();
    await waitFor(() => expect(screen.getAllByTestId('momento-cache').length).toBeGreaterThan(0));

    const momentos = screen.getAllByTestId('momento-cache');
    expect(momentos.map((botao) => botao.textContent)).toEqual([
      'f(3) guardado',
      'f(4) guardado',
      'f(3) do dicionário',
      'f(5) guardado',
      'f(4) do dicionário',
      'f(3) do dicionário',
      'f(5) do dicionário',
      'f(4) do dicionário',
    ]);

    await usuario.click(momentos[2] as HTMLElement);
    expect(
      screen.getByText(
        'Chama f(3): já está no dicionário, devolve 3 sem recursão (evita 3 chamadas).',
      ),
    ).toBeVisible();
    const entradas = screen.getAllByTestId('entrada-dicionario');
    expect(entradas.map((entrada) => entrada.dataset.argumento)).toEqual(['3', '4']);
    expect(entradas.filter((entrada) => entrada.dataset.usada === 'sim')).toHaveLength(1);
  });

  it('oferece tela cheia quando o navegador tem a API', async () => {
    const pedir = vi.fn(() => Promise.resolve());
    Object.defineProperty(document.documentElement, 'requestFullscreen', {
      value: pedir,
      configurable: true,
      writable: true,
    });
    const usuario = userEvent.setup();
    abrir();
    await esperarPalco();

    await usuario.click(screen.getByRole('button', { name: 'Tela cheia' }));
    expect(pedir).toHaveBeenCalledTimes(1);
  });

  it('alterna entre o tema claro e o escuro pelo rodapé', async () => {
    const usuario = userEvent.setup();
    abrir();
    await esperarPalco();

    await usuario.click(screen.getByRole('button', { name: 'Ativar tema escuro' }));
    expect(document.documentElement).toHaveClass('tema-escuro');
    await usuario.click(screen.getByRole('button', { name: 'Ativar tema claro' }));
    expect(document.documentElement).not.toHaveClass('tema-escuro');
    localStorage.clear();
  });

  it('calcula no navegador e mostra o selo offline quando a API cai', async () => {
    vi.stubGlobal('Worker', TrabalhadorFalso);
    servidorMock.use(http.post('/api/arvore', () => HttpResponse.error()));
    abrir();
    expect(await screen.findByText('modo offline: calculado no navegador')).toBeInTheDocument();
    await waitFor(() => expect(screen.getByTestId('valor-alvo')).toHaveTextContent('31'));
  });

  it('avisa quando nem a API nem o plano B respondem', async () => {
    servidorMock.use(
      http.post('/api/arvore', () =>
        HttpResponse.json(
          { codigo: 'LIMITE_EXCEDIDO', mensagem: 'Teste: limite estourado.' },
          { status: 422 },
        ),
      ),
    );
    abrir();
    expect(await screen.findByText('Não deu para montar a apresentação')).toBeInTheDocument();
    expect(screen.getByText('Teste: limite estourado.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Tentar de novo' })).toBeInTheDocument();
  });
});
