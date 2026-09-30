import { DESCRICAO_SEQUENCIAS, type ArvoreResposta, type Modo } from '@sequencias/contrato';
import { render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { executarMock } from '../../mocks/referencia-mock';
import { contarNos } from '../modelo';
import { resumirComparacao, type DadosApresentacao } from './dados';
import { SlideConta } from './SlideConta';
import { SlideConclusao } from './SlideConclusao';
import { SlideSemCache } from './SlideSemCache';
import { LIMITE_NOS_APRESENTACAO, N_APRESENTACAO, SEQUENCIA_APRESENTACAO } from './slides';
import { montarArvoreComEvitadas } from './evitadas';

/** Os três números de referência de f(7): 46 invocações, 16 e 30 evitadas. */
const REFERENCIA = /\b(46|16|30)\b/;

/** Sem animação o contador mostra o destino direto, sem valores intermediários. */
function semMovimento() {
  vi.stubGlobal('matchMedia', (consulta: string) => ({
    matches: consulta.includes('prefers-reduced-motion'),
    media: consulta,
    addEventListener: () => {},
    removeEventListener: () => {},
  }));
}

function resposta(n: number, modo: Modo): ArvoreResposta {
  const { metricas, raiz } = executarMock(SEQUENCIA_APRESENTACAO, n, modo);
  return {
    sequencia: SEQUENCIA_APRESENTACAO,
    n,
    modo,
    metricas,
    raiz,
    truncada: false,
    limite_nos: LIMITE_NOS_APRESENTACAO,
    nos_exibidos: contarNos(raiz),
  };
}

function dadosDe(n: number): DadosApresentacao {
  const semCache = resposta(n, 'sem_cache');
  const comCache = resposta(n, 'com_cache');
  const evitada = montarArvoreComEvitadas(semCache.raiz, comCache.raiz);
  return {
    semCache,
    comCache,
    evitada,
    comparacao: resumirComparacao(semCache, comCache, evitada),
    descricoes: DESCRICAO_SEQUENCIAS,
    offline: false,
  };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('números da apresentação', () => {
  it('chega nos valores de referência com a resposta de f(7)', () => {
    semMovimento();
    const { container } = render(<SlideConta dados={dadosDe(N_APRESENTACAO)} />);

    expect(screen.getByText('30 chamadas evitadas')).toBeInTheDocument();
    expect(screen.getByTestId('contador')).toHaveTextContent('30');
    expect(
      screen.getByText('das 46 invocações sem cache, só 16 acontecem com cache'),
    ).toBeInTheDocument();
    expect(screen.getByTestId('prova-podas')).toHaveTextContent('12 + 6 + 6 + 3 + 3 = 30');
    expect(screen.getByTestId('prova-recursivas')).toHaveTextContent('45 − 15 = 30');
    expect(container.textContent).toMatch(REFERENCIA);

    // Um quadrado por chamada: todos são as sem cache, os tracejados as evitadas.
    const quadros = screen.getAllByTestId('quadro-chamada');
    expect(quadros).toHaveLength(46);
    expect(quadros.filter((quadro) => quadro.dataset.evitada === 'sim')).toHaveLength(30);
    const linhaDe2 = screen
      .getAllByTestId('linha-chamadas')
      .find((linha) => linha.dataset.argumento === '2') as HTMLElement;
    expect(within(linhaDe2).getAllByTestId('quadro-chamada')).toHaveLength(13);
    expect(linhaDe2).toHaveTextContent('f(2)133−10');
    expect(screen.getByTestId('total-chamadas')).toHaveTextContent('total4616−30');
  });

  it('acompanha outra execução, sem repetir nenhum número de f(7)', () => {
    semMovimento();
    const { container } = render(<SlideConta dados={dadosDe(N_APRESENTACAO - 1)} />);

    expect(screen.getByText('12 chamadas evitadas')).toBeInTheDocument();
    expect(screen.getByTestId('contador')).toHaveTextContent('12');
    expect(
      screen.getByText('das 25 invocações sem cache, só 13 acontecem com cache'),
    ).toBeInTheDocument();
    expect(screen.getByTestId('prova-podas')).toHaveTextContent('6 + 3 + 3 = 12');
    expect(screen.getByTestId('prova-recursivas')).toHaveTextContent('24 − 12 = 12');
    expect(screen.getAllByTestId('quadro-chamada')).toHaveLength(25);
    expect(screen.getByTestId('total-chamadas')).toHaveTextContent('total2513−12');
    expect(container.textContent).not.toMatch(REFERENCIA);
  });

  it('tira o placar sem cache das métricas da resposta', () => {
    semMovimento();
    render(<SlideSemCache dados={dadosDe(N_APRESENTACAO - 1)} />);

    const placar = screen.getByLabelText('Números da execução sem cache');
    expect(within(placar).getByText('invocações').nextElementSibling).toHaveTextContent('25');
    expect(within(placar).getByText('casos base').nextElementSibling).toHaveTextContent('17');
    expect(screen.getAllByTestId('linha-argumento')).toHaveLength(7);
    expect(screen.getByText(/f\(2\) é chamado 7 vezes das 25 invocações/)).toBeInTheDocument();
  });

  it('generaliza com os totais da própria resposta', () => {
    semMovimento();
    const { container } = render(<SlideConclusao dados={dadosDe(N_APRESENTACAO - 1)} />);

    expect(screen.getByLabelText('Sem cache')).toHaveTextContent('25');
    expect(screen.getByLabelText('Com cache')).toHaveTextContent('13');
    expect(screen.getAllByText('invocações para n = 6')).toHaveLength(2);
    expect(screen.getByTestId('pergunta-cache')).toHaveTextContent(
      'a função é chamada mais de uma vez com o mesmo argumento? No Tribonacci, sim: f(2) é chamado 7 vezes, e o cache evita 12 das 25 chamadas.',
    );
    expect(container.textContent).not.toMatch(REFERENCIA);
  });
});
