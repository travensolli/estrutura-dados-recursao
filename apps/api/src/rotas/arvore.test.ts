import { ArvoreRespostaSchema, ErroSchema, type No } from '@sequencias/contrato';
import { afterAll, describe, expect, it } from 'vitest';
import { criarAplicacao } from '../aplicacao';
import { valoresForaDoFormato } from '../testes/valores';

const app = criarAplicacao();

afterAll(async () => {
  await app.close();
});

function pedirArvore(corpo: object) {
  return app.inject({ method: 'POST', url: '/api/arvore', payload: corpo });
}

function contarNos(no: No): number {
  return 1 + no.filhos.reduce((total, filho) => total + contarNos(filho), 0);
}

describe('POST /api/arvore', () => {
  it('monta a árvore inteira de tribonacci f(7) sem cache', async () => {
    const resposta = await pedirArvore({ sequencia: 'tribonacci', n: 7, modo: 'sem_cache' });
    expect(resposta.statusCode).toBe(200);
    const corpo = ArvoreRespostaSchema.parse(resposta.json());
    expect(corpo.metricas.invocacoes).toBe(46);
    expect(corpo.nos_exibidos).toBe(46);
    expect(contarNos(corpo.raiz)).toBe(46);
    expect(corpo.truncada).toBe(false);
    expect(corpo.limite_nos).toBe(300);
    expect(corpo.raiz).toMatchObject({ argumento: 7, valor: '31', tipo: 'calculado' });
    expect(valoresForaDoFormato(corpo)).toEqual([]);
  });

  it('monta a árvore de tribonacci f(7) com cache marcando os acertos', async () => {
    const resposta = await pedirArvore({ sequencia: 'tribonacci', n: 7, modo: 'com_cache' });
    const corpo = ArvoreRespostaSchema.parse(resposta.json());
    expect(corpo.metricas.invocacoes).toBe(16);
    expect(corpo.nos_exibidos).toBe(16);
    expect(corpo.raiz.filhos.map((filho) => filho.tipo)).toEqual([
      'calculado',
      'acerto_cache',
      'acerto_cache',
    ]);
  });

  it('trunca acima do orçamento sem alterar as métricas da execução inteira', async () => {
    const resposta = await pedirArvore({
      sequencia: 'tribonacci',
      n: 7,
      modo: 'sem_cache',
      limite_nos: 10,
    });
    const corpo = ArvoreRespostaSchema.parse(resposta.json());
    expect(corpo.truncada).toBe(true);
    expect(corpo.nos_exibidos).toBeLessThanOrEqual(10);
    expect(contarNos(corpo.raiz)).toBe(corpo.nos_exibidos);
    expect(corpo.metricas.invocacoes).toBe(46);
    expect(corpo.metricas.profundidade_maxima).toBe(6);
    expect(corpo.raiz.valor).toBe('31');
    const ocultos = JSON.stringify(corpo.raiz).includes('descendentes_ocultos');
    expect(ocultos).toBe(true);
  });

  it('recusa n acima do limite e orçamento de nós inválido', async () => {
    const acimaDoLimite = await pedirArvore({
      sequencia: 'tribonacci',
      n: 31,
      modo: 'sem_cache',
    });
    expect(acimaDoLimite.statusCode).toBe(422);
    expect(ErroSchema.parse(acimaDoLimite.json()).codigo).toBe('LIMITE_EXCEDIDO');

    const semNos = await pedirArvore({
      sequencia: 'tribonacci',
      n: 7,
      modo: 'sem_cache',
      limite_nos: 0,
    });
    expect(semNos.statusCode).toBe(400);
    expect(ErroSchema.parse(semNos.json()).codigo).toBe('ENTRADA_INVALIDA');

    const nosDemais = await pedirArvore({
      sequencia: 'tribonacci',
      n: 7,
      modo: 'sem_cache',
      limite_nos: 5001,
    });
    expect(nosDemais.statusCode).toBe(400);
  });
});
