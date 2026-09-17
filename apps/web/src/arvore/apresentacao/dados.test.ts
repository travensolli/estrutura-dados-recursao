import type { ArvoreResposta, Modo } from '@sequencias/contrato';
import { describe, expect, it } from 'vitest';
import { executarMock } from '../../mocks/referencia-mock';
import { contarNos } from '../modelo';
import { compararPorArgumento, resumirComparacao } from './dados';
import { montarArvoreComEvitadas } from './evitadas';
import { LIMITE_NOS_APRESENTACAO, N_APRESENTACAO, SEQUENCIA_APRESENTACAO } from './etapas';

function resposta(modo: Modo): ArvoreResposta {
  const { metricas, raiz } = executarMock(SEQUENCIA_APRESENTACAO, N_APRESENTACAO, modo);
  return {
    sequencia: SEQUENCIA_APRESENTACAO,
    n: N_APRESENTACAO,
    modo,
    metricas,
    raiz,
    truncada: false,
    limite_nos: LIMITE_NOS_APRESENTACAO,
    nos_exibidos: contarNos(raiz),
  };
}

const sem = resposta('sem_cache');
const com = resposta('com_cache');
const comparacao = resumirComparacao(sem, com, montarArvoreComEvitadas(sem.raiz, com.raiz));

describe('comparação da apresentação', () => {
  it('tira os totais das métricas das duas respostas', () => {
    expect(comparacao.invocacoesSemCache).toBe(46);
    expect(comparacao.invocacoesComCache).toBe(16);
    expect(comparacao.evitadas).toBe(30);
  });

  it('confere as chamadas evitadas por duas provas independentes', () => {
    expect(comparacao.somaParcelas).toBe(comparacao.evitadas);
    expect(comparacao.diferencaRecursivas).toBe(comparacao.evitadas);
    expect(comparacao.recursivasSemCache).toBe(45);
    expect(comparacao.recursivasComCache).toBe(15);
    expect(comparacao.provasConferem).toBe(true);
  });

  it('cruza as invocações por argumento nos dois modos', () => {
    expect(comparacao.linhas.map((linha) => linha.argumento)).toEqual([7, 6, 5, 4, 3, 2, 1, 0]);
    expect(comparacao.linhas.map((linha) => linha.semCache)).toEqual([1, 1, 2, 4, 7, 13, 11, 7]);
    const soma = comparacao.linhas.reduce((total, linha) => total + linha.evitadas, 0);
    expect(soma).toBe(comparacao.evitadas);
  });

  it('acha o argumento mais chamado sem cache', () => {
    expect(comparacao.argumentoMaisChamado?.argumento).toBe(2);
    expect(comparacao.argumentoMaisChamado?.semCache).toBe(13);
    expect(comparacao.maiorInvocacao).toBe(13);
  });

  it('mantém argumentos que só aparecem em um dos modos', () => {
    const recortada: ArvoreResposta = {
      ...com,
      metricas: {
        ...com.metricas,
        invocacoes_por_argumento: com.metricas.invocacoes_por_argumento.filter(
          (item) => item.argumento !== 0,
        ),
      },
    };
    const linhas = compararPorArgumento(sem, recortada);
    const zero = linhas.find((linha) => linha.argumento === 0);
    expect(zero).toEqual({ argumento: 0, semCache: 7, comCache: 0, evitadas: 7 });
  });
});
