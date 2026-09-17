import type { Modo } from '@sequencias/contrato';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { executarInstrumentado } from '../plano-b/nucleo-adaptador';
import { Reproducao } from './Reproducao';
import { achatarNos, pilhaNoPasso, podasPorAcerto, subarvoresPodadas, totalPassos } from './modelo';
import { useReproducao } from './usarReproducao';

const semCache = executarInstrumentado('tribonacci', 7, 'sem_cache', { comArvore: true });
const cortada = executarInstrumentado('tribonacci', 7, 'sem_cache', {
  comArvore: true,
  limiteNos: 8,
});
const comCache = executarInstrumentado('tribonacci', 7, 'com_cache', { comArvore: true });
const raizSem = semCache.raiz!;
const raizCom = comCache.raiz!;
const podas = podasPorAcerto(subarvoresPodadas(raizSem, raizCom));

function Cenario({ modo, raizEscolhida }: { modo: Modo; raizEscolhida?: typeof raizSem }) {
  const raiz = raizEscolhida ?? (modo === 'com_cache' ? raizCom : raizSem);
  const nos = achatarNos(raiz);
  const relogio = useReproducao(totalPassos(raiz));
  return <Reproducao nos={nos} modo={modo} relogio={relogio} podasPorAcerto={podas} />;
}

const pilha = () =>
  screen.getAllByTestId('quadro-pilha').map((quadro) => Number(quadro.dataset.argumento));
const entradas = () =>
  screen.getAllByTestId('entrada-dicionario').map((linha) => Number(linha.dataset.argumento));

function irParaOPasso(t: number) {
  fireEvent.change(screen.getByLabelText('Passo da reprodução'), { target: { value: String(t) } });
}

describe('Reproducao', () => {
  it('começa na raiz, com a pilha só com f(7)', () => {
    render(<Cenario modo="sem_cache" />);
    expect(pilha()).toEqual([7]);
    expect(screen.getByText('Chama f(7): precisa calcular.')).toBeInTheDocument();
    expect(screen.getByText('0 / 91')).toBeInTheDocument();
  });

  it('avançar passos empilha as chamadas como no modelo', () => {
    render(<Cenario modo="sem_cache" />);
    const nos = achatarNos(raizSem);
    for (let i = 0; i < 5; i += 1) {
      fireEvent.click(screen.getByRole('button', { name: 'Próximo passo' }));
    }
    // do topo para a base: f(2) é o quadro mais novo
    expect(pilha()).toEqual([2, 3, 4, 5, 6, 7]);
    expect(pilha()).toEqual(
      pilhaNoPasso(nos, 5)
        .map((no) => no.argumento)
        .reverse(),
    );
    expect(screen.getByText('Chama f(2): caso base, devolve 1 direto.')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Passo anterior' }));
    expect(pilha()).toEqual([3, 4, 5, 6, 7]);
  });

  it('esvazia a pilha no fim da execução', () => {
    render(<Cenario modo="sem_cache" />);
    fireEvent.click(screen.getByRole('button', { name: 'Ir para o fim' }));
    expect(screen.queryAllByTestId('quadro-pilha')).toHaveLength(0);
    expect(screen.getByText('A pilha está vazia: a execução terminou.')).toBeInTheDocument();
    expect(screen.getByText('f(7) = 31: calculado.')).toBeInTheDocument();
  });

  it('sem cache explica que não existe dicionário', () => {
    render(<Cenario modo="sem_cache" />);
    expect(screen.getByText(/Sem cache não existe dicionário/)).toBeInTheDocument();
    expect(screen.queryAllByTestId('entrada-dicionario')).toHaveLength(0);
  });

  it('com cache enche o dicionário e realça a entrada usada no acerto', () => {
    render(<Cenario modo="com_cache" />);
    expect(screen.getByText('Ainda vazio: nada foi calculado até aqui.')).toBeInTheDocument();

    const acertos = achatarNos(raizCom).filter((no) => no.tipo === 'acerto_cache');
    const primeiro = acertos[0]!;
    expect(primeiro.argumento).toBe(3);
    irParaOPasso(primeiro.ordem_entrada);

    expect(entradas()).toEqual([3, 4]);
    const usadas = screen
      .getAllByTestId('entrada-dicionario')
      .filter((linha) => linha.dataset.usada === 'sim');
    expect(usadas).toHaveLength(1);
    expect(usadas[0]).toHaveAttribute('data-argumento', '3');
    expect(
      screen.getByText(
        'Chama f(3): já está no dicionário, devolve 3 sem recursão (evita 3 chamadas).',
      ),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Ir para o fim' }));
    expect(entradas()).toEqual([3, 4, 5, 6, 7]);
    expect(entradas()).toHaveLength(comCache.metricas.entradas_cache);
  });

  it('avisa quando o passo caiu numa subárvore cortada', () => {
    render(<Cenario modo="sem_cache" raizEscolhida={cortada.raiz!} />);
    irParaOPasso(20);
    expect(
      screen.getByText('Este passo acontece dentro de uma subárvore que o limite de nós cortou.'),
    ).toBeInTheDocument();
  });

  it('anuncia o passo numa região aria-live', () => {
    const { container } = render(<Cenario modo="sem_cache" />);
    const regiao = container.querySelector('[aria-live="polite"]');
    expect(regiao).toHaveTextContent('Passo 0 de 91. Chama f(7): precisa calcular.');
    fireEvent.click(screen.getByRole('button', { name: 'Próximo passo' }));
    expect(regiao).toHaveTextContent('Passo 1 de 91.');
  });

  it('atende aos atalhos de teclado', () => {
    render(<Cenario modo="sem_cache" />);
    fireEvent.keyDown(document.body, { key: 'ArrowRight' });
    fireEvent.keyDown(document.body, { key: 'ArrowRight' });
    expect(screen.getByText('2 / 91')).toBeInTheDocument();

    fireEvent.keyDown(document.body, { key: 'ArrowLeft' });
    expect(screen.getByText('1 / 91')).toBeInTheDocument();

    fireEvent.keyDown(document.body, { key: 'End' });
    expect(screen.getByText('91 / 91')).toBeInTheDocument();

    fireEvent.keyDown(document.body, { key: 'Home' });
    expect(screen.getByText('0 / 91')).toBeInTheDocument();

    fireEvent.keyDown(document.body, { key: ' ' });
    expect(screen.getByRole('button', { name: 'Pausar' })).toBeInTheDocument();
    fireEvent.keyDown(document.body, { key: ' ' });
    expect(screen.getByRole('button', { name: 'Tocar' })).toBeInTheDocument();
  });

  it('deixa o espaço para o botão quando ele já está com o foco', () => {
    render(<Cenario modo="sem_cache" />);
    fireEvent.keyDown(screen.getByRole('button', { name: 'Tocar' }), { key: ' ' });
    expect(screen.getByRole('button', { name: 'Tocar' })).toBeInTheDocument();
  });

  it('ignora atalhos quando o foco está num campo', () => {
    render(<Cenario modo="sem_cache" />);
    const controle = screen.getByLabelText('Passo da reprodução');
    fireEvent.keyDown(controle, { key: 'ArrowRight' });
    expect(screen.getByText('0 / 91')).toBeInTheDocument();
  });
});
