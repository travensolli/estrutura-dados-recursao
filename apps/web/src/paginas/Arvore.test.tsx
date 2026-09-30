import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { MemoryRouter } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { PedidoCalculo } from '../plano-b/mensagens';
import { processarPedido } from '../plano-b/processar';
import { servidorMock } from '../mocks/servidor';
import { PaginaArvore } from './Arvore';

/** Worker falso: roda a mesma função pura do worker real. */
class TrabalhadorFalso extends EventTarget {
  postMessage(pedido: PedidoCalculo) {
    queueMicrotask(() =>
      this.dispatchEvent(new MessageEvent('message', { data: processarPedido(pedido) })),
    );
  }
  terminate() {}
}

function abrir(caminho = '/arvore') {
  const cliente = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={cliente}>
      <MemoryRouter initialEntries={[caminho]}>
        <PaginaArvore />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

const nos = () => screen.getAllByTestId('no-arvore');

afterEach(() => vi.unstubAllGlobals());

describe('página Árvore', () => {
  it('desenha tribonacci f(7) sem cache com os padrões da URL', async () => {
    abrir();
    expect(await screen.findByRole('heading', { level: 2 })).toHaveTextContent(
      'Tribonacci f(7) sem cache',
    );
    expect(nos()).toHaveLength(46);
    expect(screen.getByLabelText('n')).toHaveValue('7');
    expect(screen.getByLabelText('Limite de nós')).toHaveValue('300');
    expect(screen.getByRole('radio', { name: 'Tribonacci' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Sem cache' })).toBeChecked();
  });

  it('lê sequência, n, modo e limite de nós da URL', async () => {
    abrir('/arvore?sequencia=tribonacci&n=7&modo=com_cache&limite_nos=300');
    await screen.findByRole('heading', { level: 2 });
    expect(nos()).toHaveLength(16);
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
      'Tribonacci f(7) com cache',
    );
  });

  it('aplica os controles na URL ao pedir a árvore', async () => {
    const usuario = userEvent.setup();
    abrir();
    await screen.findByRole('heading', { level: 2 });

    const campoN = screen.getByLabelText('n');
    await usuario.clear(campoN);
    await usuario.type(campoN, '5');
    await usuario.click(screen.getByRole('button', { name: 'Ver árvore' }));

    await waitFor(() =>
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('f(5)'),
    );
    expect(nos()).toHaveLength(13);
  });

  it('avisa que os controles mudaram até pedir a árvore de novo', async () => {
    const usuario = userEvent.setup();
    abrir();
    await screen.findByRole('heading', { level: 2 });
    const aviso = /O formulário mudou depois desta árvore/;
    expect(screen.queryByText(aviso)).not.toBeInTheDocument();

    await usuario.click(screen.getByRole('radio', { name: 'Com cache' }));
    expect(screen.getByText(aviso)).toBeInTheDocument();

    // Voltar ao que está desenhado tira o aviso.
    await usuario.click(screen.getByRole('radio', { name: 'Sem cache' }));
    expect(screen.queryByText(aviso)).not.toBeInTheDocument();

    await usuario.click(screen.getByRole('radio', { name: 'Com cache' }));
    await usuario.click(screen.getByRole('button', { name: 'Ver árvore' }));
    await waitFor(() =>
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('com cache'),
    );
    expect(screen.queryByText(aviso)).not.toBeInTheDocument();
  });

  it('não pede para atualizar enquanto os controles não formam uma árvore válida', async () => {
    const usuario = userEvent.setup();
    abrir();
    await screen.findByRole('heading', { level: 2 });

    const campoN = screen.getByLabelText('n');
    await usuario.clear(campoN);
    expect(screen.queryByText(/O formulário mudou/)).not.toBeInTheDocument();
    await usuario.type(campoN, '5');
    expect(screen.getByText(/O formulário mudou/)).toBeInTheDocument();
  });

  it('avisa quando n passa do limite da sequência', async () => {
    abrir('/arvore?sequencia=tribonacci&n=40&modo=sem_cache');
    expect(
      await screen.findByText('Ajuste os parâmetros para desenhar a árvore'),
    ).toBeInTheDocument();
    const alerta = screen.getByRole('status');
    expect(within(alerta).getByText('Tribonacci sem cache vai até n = 30.')).toBeInTheDocument();
    expect(screen.queryAllByTestId('no-arvore')).toHaveLength(0);
  });

  it('avisa quando a resposta vem truncada', async () => {
    abrir('/arvore?sequencia=fibonacci&n=12&modo=sem_cache&limite_nos=20');
    expect(await screen.findByText('A árvore foi cortada no limite de nós')).toBeInTheDocument();
    expect(screen.getByText(/nós de 465 invocações/)).toBeInTheDocument();
    expect(nos().length).toBeLessThanOrEqual(20);
  });

  it('troca o desenho pela lista indentada', async () => {
    const usuario = userEvent.setup();
    abrir();
    await screen.findByRole('heading', { level: 2 });

    await usuario.click(screen.getByRole('button', { name: 'Lista' }));

    expect(screen.getAllByRole('treeitem')).toHaveLength(46);
    expect(screen.queryAllByTestId('no-arvore')).toHaveLength(0);
    expect(screen.getByRole('button', { name: 'Lista' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('reproduz a execução passo a passo', async () => {
    const usuario = userEvent.setup();
    abrir('/arvore?sequencia=tribonacci&n=7&modo=com_cache&limite_nos=300');
    await screen.findByRole('heading', { level: 2 });

    await usuario.click(screen.getByRole('button', { name: 'Reproduzir passo a passo' }));
    expect(screen.getByText('Chama f(7): não está no dicionário, precisa calcular.')).toBeVisible();
    expect(screen.getAllByTestId('quadro-pilha')).toHaveLength(1);
    expect(screen.getByText('0 / 31')).toBeInTheDocument();

    await usuario.keyboard('{ArrowRight}{ArrowRight}');
    expect(screen.getByText('2 / 31')).toBeInTheDocument();
    expect(screen.getAllByTestId('quadro-pilha')).toHaveLength(3);
    expect(nos().filter((no) => no.dataset.estado === 'futuro')).toHaveLength(13);

    await usuario.click(screen.getByRole('button', { name: 'Ver a árvore inteira' }));
    expect(screen.queryAllByTestId('quadro-pilha')).toHaveLength(0);
    expect(nos().every((no) => no.dataset.estado === 'inteira')).toBe(true);
  });

  it('mostra o erro da API e deixa tentar de novo', async () => {
    servidorMock.use(
      http.post('/api/arvore', () =>
        HttpResponse.json(
          { codigo: 'LIMITE_EXCEDIDO', mensagem: 'Teste: limite estourado.' },
          { status: 422 },
        ),
      ),
    );
    abrir();
    expect(await screen.findByText('Não deu para montar a árvore')).toBeInTheDocument();
    expect(screen.getByText('Teste: limite estourado.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Tentar de novo' })).toBeInTheDocument();
  });

  it('cai para o plano B quando a API está indisponível', async () => {
    vi.stubGlobal('Worker', TrabalhadorFalso);
    servidorMock.use(http.post('/api/arvore', () => HttpResponse.error()));
    abrir();
    expect(await screen.findByText('modo offline: calculado no navegador')).toBeInTheDocument();
    expect(nos()).toHaveLength(46);
  });
});
