import { ArvoreRespostaSchema, CalcularRespostaSchema, ErroSequencia } from '@sequencias/contrato';
import { describe, expect, it } from 'vitest';
import { executarPedido } from './tarefas';

describe('pedido de cálculo', () => {
  it('devolve as métricas de tribonacci f(7) sem cache', () => {
    const resposta = executarPedido({
      tipo: 'calcular',
      sequencia: 'tribonacci',
      n: 7,
      modo: 'sem_cache',
    });
    expect(CalcularRespostaSchema.safeParse(resposta).success).toBe(true);
    expect(resposta.metricas).toMatchObject({
      valor: '31',
      invocacoes: 46,
      chamadas_recursivas: 45,
      casos_base: 31,
      calculados: 15,
      acertos_cache: 0,
      entradas_cache: 0,
      profundidade_maxima: 6,
    });
    expect(resposta.duracao_ms).toBeGreaterThanOrEqual(0);
  });

  it('devolve as métricas de tribonacci f(7) com cache', () => {
    const { metricas } = executarPedido({
      tipo: 'calcular',
      sequencia: 'tribonacci',
      n: 7,
      modo: 'com_cache',
    });
    expect(metricas).toMatchObject({
      valor: '31',
      invocacoes: 16,
      calculados: 5,
      acertos_cache: 5,
      casos_base: 6,
      entradas_cache: 5,
    });
    expect(metricas.acertos_detalhados).toEqual([
      { argumento: 3, dentro_de: 5 },
      { argumento: 4, dentro_de: 6 },
      { argumento: 3, dentro_de: 6 },
      { argumento: 5, dentro_de: 7 },
      { argumento: 4, dentro_de: 7 },
    ]);
  });

  it('recusa n acima do limite do ambiente node', () => {
    const pedido = { tipo: 'calcular', sequencia: 'fibonacci', n: 36, modo: 'sem_cache' } as const;
    expect(() => executarPedido(pedido)).toThrow(ErroSequencia);
    try {
      executarPedido(pedido);
    } catch (erro) {
      expect((erro as ErroSequencia).codigo).toBe('LIMITE_EXCEDIDO');
    }
  });

  it('recusa n inválido', () => {
    try {
      executarPedido({ tipo: 'calcular', sequencia: 'fatorial', n: -1, modo: 'com_cache' });
      expect.unreachable('deveria ter recusado');
    } catch (erro) {
      expect((erro as ErroSequencia).codigo).toBe('ENTRADA_INVALIDA');
    }
  });
});

describe('pedido de árvore', () => {
  it('monta a árvore inteira quando cabe no orçamento de nós', () => {
    const resposta = executarPedido({
      tipo: 'arvore',
      sequencia: 'tribonacci',
      n: 7,
      modo: 'sem_cache',
      limite_nos: 300,
    });
    expect(ArvoreRespostaSchema.safeParse(resposta).success).toBe(true);
    expect(resposta.nos_exibidos).toBe(46);
    expect(resposta.truncada).toBe(false);
    expect(resposta.raiz.argumento).toBe(7);
    expect(resposta.raiz.valor).toBe('31');
  });

  it('trunca a árvore sem alterar as métricas da execução completa', () => {
    const resposta = executarPedido({
      tipo: 'arvore',
      sequencia: 'tribonacci',
      n: 7,
      modo: 'sem_cache',
      limite_nos: 10,
    });
    expect(resposta.truncada).toBe(true);
    expect(resposta.nos_exibidos).toBeLessThan(46);
    expect(resposta.metricas.invocacoes).toBe(46);
  });
});

describe('pedido de comparação', () => {
  it('mostra o fatorial sem chamadas evitadas', () => {
    const resposta = executarPedido({
      tipo: 'comparar',
      sequencia: 'fatorial',
      n: 10,
      repeticoes: 1,
      ordem: ['com_cache', 'sem_cache'],
    });
    expect(resposta.valor).toBe('3628800');
    expect(resposta.invocacoes).toEqual({ sem_cache: 10, com_cache: 10 });
    expect(resposta.chamadas_evitadas).toBe(0);
    expect(resposta.ordem_execucao).toEqual(['com_cache', 'sem_cache']);
  });
});
