import { describe, expect, it } from 'vitest';
import {
  ArvoreRequisicaoSchema,
  CalcularRequisicaoSchema,
  CompararRequisicaoSchema,
  DESCRICAO_SEQUENCIAS,
  ErroSequencia,
  EstimativaConsultaSchema,
  LIMITES_N,
  MetricasSchema,
  NSchema,
  NoSchema,
  SEQUENCIAS,
  SerieRequisicaoSchema,
  limiteN,
} from './index';

describe('NSchema', () => {
  it('aceita inteiros não negativos', () => {
    expect(NSchema.parse(0)).toBe(0);
    expect(NSchema.parse(7)).toBe(7);
  });
  it.each([-1, 1.5, Number.NaN, Number.POSITIVE_INFINITY, '7', null])('rejeita %p', (entrada) => {
    expect(NSchema.safeParse(entrada).success).toBe(false);
  });
});

describe('requisições', () => {
  it('aplica padrões em comparar, série e árvore', () => {
    expect(CompararRequisicaoSchema.parse({ sequencia: 'fibonacci', n: 10 }).repeticoes).toBe(5);
    expect(
      ArvoreRequisicaoSchema.parse({ sequencia: 'tribonacci', n: 7, modo: 'sem_cache' }),
    ).toEqual({
      sequencia: 'tribonacci',
      n: 7,
      modo: 'sem_cache',
      limite_nos: 300,
    });
    const serie = SerieRequisicaoSchema.parse({ sequencia: 'fatorial', n_inicial: 1, n_final: 10 });
    expect(serie.passo).toBe(1);
    expect(serie.repeticoes).toBe(3);
  });
  it('rejeita sequência ou modo desconhecidos', () => {
    expect(
      CalcularRequisicaoSchema.safeParse({ sequencia: 'lucas', n: 1, modo: 'sem_cache' }).success,
    ).toBe(false);
    expect(
      CalcularRequisicaoSchema.safeParse({ sequencia: 'fatorial', n: 1, modo: 'memo' }).success,
    ).toBe(false);
  });
  it('rejeita série com n_final menor que n_inicial ou pontos demais', () => {
    expect(
      SerieRequisicaoSchema.safeParse({ sequencia: 'fatorial', n_inicial: 10, n_final: 1 }).success,
    ).toBe(false);
    expect(
      SerieRequisicaoSchema.safeParse({ sequencia: 'fatorial', n_inicial: 0, n_final: 500 })
        .success,
    ).toBe(false);
  });
  it('converte n de texto na consulta de estimativa', () => {
    expect(
      EstimativaConsultaSchema.parse({ sequencia: 'fibonacci', n: '40', modo: 'com_cache' }).n,
    ).toBe(40);
    expect(
      EstimativaConsultaSchema.safeParse({ sequencia: 'fibonacci', n: 'x', modo: 'com_cache' })
        .success,
    ).toBe(false);
  });
});

describe('métricas e árvore', () => {
  it('valida métricas de tribonacci f(7) sem cache', () => {
    const metricas = MetricasSchema.parse({
      valor: '31',
      digitos: 2,
      invocacoes: 46,
      chamadas_recursivas: 45,
      casos_base: 31,
      calculados: 15,
      acertos_cache: 0,
      entradas_cache: 0,
      profundidade_maxima: 6,
      invocacoes_por_argumento: [
        { argumento: 7, invocacoes: 1 },
        { argumento: 0, invocacoes: 7 },
      ],
    });
    expect(metricas.invocacoes).toBe(46);
  });
  it('rejeita valor que não seja inteiro em texto', () => {
    expect(MetricasSchema.shape.valor.safeParse('3.1e2').success).toBe(false);
  });
  it('valida nó recursivo e nó colapsado', () => {
    const folha = {
      id: 2,
      argumento: 1,
      valor: '1',
      profundidade: 1,
      tipo: 'base',
      ordem_entrada: 1,
      ordem_saida: 2,
      filhos: [],
    };
    const raiz = {
      id: 1,
      argumento: 2,
      valor: '2',
      profundidade: 0,
      tipo: 'calculado',
      ordem_entrada: 0,
      ordem_saida: 5,
      filhos: [folha],
    };
    expect(NoSchema.parse(raiz).filhos).toHaveLength(1);
    expect(
      NoSchema.parse({ ...raiz, filhos: [], descendentes_ocultos: 3 }).descendentes_ocultos,
    ).toBe(3);
    expect(NoSchema.safeParse({ ...raiz, tipo: 'memo' }).success).toBe(false);
  });
});

describe('limites e descrições', () => {
  it('cobre as três sequências nos dois ambientes', () => {
    for (const sequencia of SEQUENCIAS) {
      expect(DESCRICAO_SEQUENCIAS[sequencia].id).toBe(sequencia);
      expect(limiteN('navegador', sequencia, 'sem_cache')).toBeLessThanOrEqual(
        limiteN('node', sequencia, 'sem_cache'),
      );
      expect(LIMITES_N.node[sequencia].com_cache).toBeGreaterThanOrEqual(
        LIMITES_N.node[sequencia].sem_cache,
      );
    }
  });
  it('usa os casos base do enunciado', () => {
    expect(DESCRICAO_SEQUENCIAS.fibonacci.primeiros_termos.slice(0, 4)).toEqual([
      '1',
      '1',
      '2',
      '3',
    ]);
    expect(DESCRICAO_SEQUENCIAS.tribonacci.primeiros_termos.slice(0, 8)).toEqual([
      '1',
      '1',
      '1',
      '3',
      '5',
      '9',
      '17',
      '31',
    ]);
  });
});

describe('ErroSequencia', () => {
  it('serializa no formato { codigo, mensagem }', () => {
    const erro = new ErroSequencia('LIMITE_EXCEDIDO', 'n acima do limite', { limite: 30 });
    expect(erro.paraJson()).toEqual({
      codigo: 'LIMITE_EXCEDIDO',
      mensagem: 'n acima do limite',
      detalhes: { limite: 30 },
    });
    expect(new ErroSequencia('TEMPO_LIMITE', 'demorou').paraJson()).toEqual({
      codigo: 'TEMPO_LIMITE',
      mensagem: 'demorou',
    });
  });
});
