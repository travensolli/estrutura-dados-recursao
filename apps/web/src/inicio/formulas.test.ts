import { DESCRICAO_SEQUENCIAS, SEQUENCIAS } from '@sequencias/contrato';
import { executarInstrumentado } from '@sequencias/nucleo';
import { describe, expect, it } from 'vitest';
import { calcularFormulas, N_MINIMO_FORMULAS, TIPOS } from './formulas';

const NS = Array.from({ length: 14 }, (_, indice) => N_MINIMO_FORMULAS + indice);

describe('fórmulas gerais', () => {
  it('usa a mesma ordem e os mesmos casos base do contrato', () => {
    for (const sequencia of SEQUENCIAS) {
      const descricao = DESCRICAO_SEQUENCIAS[sequencia];
      expect(TIPOS[sequencia].k).toBe(descricao.ordem);
      expect(TIPOS[sequencia].b).toBe(descricao.casos_base.match(/f\(\d+\)/g)?.length);
    }
  });

  for (const sequencia of SEQUENCIAS) {
    it.each(NS)(`${sequencia}(%i) bate com a execução instrumentada`, (n) => {
      const calculo = calcularFormulas(sequencia, n);
      const sem = executarInstrumentado(sequencia, n, 'sem_cache', { comArvore: false });
      const com = executarInstrumentado(sequencia, n, 'com_cache', { comArvore: false });

      expect(calculo.valor).toBe(sem.valor);
      expect(calculo.invocacoesSemCache.resultado).toBe(BigInt(sem.metricas.invocacoes));
      expect(calculo.invocacoesComCache.resultado).toBe(BigInt(com.metricas.invocacoes));
      expect(calculo.evitadas.resultado).toBe(
        BigInt(sem.metricas.invocacoes - com.metricas.invocacoes),
      );
      expect(calculo.entradasCache.resultado).toBe(BigInt(com.metricas.entradas_cache));
      expect(calculo.profundidade.resultado).toBe(BigInt(sem.metricas.profundidade_maxima));
      expect(calculo.profundidade.resultado).toBe(BigInt(com.metricas.profundidade_maxima));
    });
  }

  it('mostra a conta do Tribonacci f(7) do enunciado', () => {
    const calculo = calcularFormulas('tribonacci', 7);
    expect(calculo.invocacoesSemCache).toEqual({ conta: '(3 · 31 − 1) / 2', resultado: 46n });
    expect(calculo.invocacoesComCache).toEqual({ conta: '1 + 3 · (7 − 3 + 1)', resultado: 16n });
    expect(calculo.evitadas).toEqual({ conta: '46 − 16', resultado: 30n });
  });

  it('escreve a conta do Fibonacci sem dividir por 1 e a do fatorial pela corrente', () => {
    expect(calcularFormulas('fibonacci', 7).invocacoesSemCache.conta).toBe('2 · 21 − 1');
    expect(calcularFormulas('fatorial', 7).invocacoesSemCache.conta).toBe('7 − 2 + 2');
  });

  it('recusa n abaixo de onde as fórmulas fechadas valem', () => {
    expect(() => calcularFormulas('tribonacci', N_MINIMO_FORMULAS - 1)).toThrow(RangeError);
  });
});
