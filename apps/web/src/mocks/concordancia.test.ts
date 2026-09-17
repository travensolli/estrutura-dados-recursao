import { MODOS, SEQUENCIAS, type No } from '@sequencias/contrato';
import { executarInstrumentado } from '@sequencias/nucleo';
import { describe, expect, it } from 'vitest';
import { executarMock, metricasMock, truncarArvore } from './referencia-mock';

/* Os mocks contam por fórmula fechada para responder rápido no navegador.
   Estes testes prendem esse atalho ao resultado do núcleo que a API usa. */

const pares = SEQUENCIAS.flatMap((sequencia) => MODOS.map((modo) => [sequencia, modo] as const));

function formato(no: No): unknown {
  return {
    argumento: no.argumento,
    valor: no.valor,
    profundidade: no.profundidade,
    tipo: no.tipo,
    ordem_entrada: no.ordem_entrada,
    ordem_saida: no.ordem_saida,
    ocultos: no.descendentes_ocultos ?? null,
    filhos: no.filhos.map(formato),
  };
}

describe('mocks contra o núcleo real', () => {
  it.each(pares)('métricas de %s %s batem de f(0) a f(12)', (sequencia, modo) => {
    for (let n = 0; n <= 12; n++) {
      const real = executarInstrumentado(sequencia, n, modo, { comArvore: false }).metricas;
      expect(metricasMock(sequencia, n, modo)).toEqual(real);
      expect(executarMock(sequencia, n, modo).metricas).toEqual(real);
    }
  });

  it.each(pares)('árvore de %s %s é idêntica em f(8)', (sequencia, modo) => {
    const real = executarInstrumentado(sequencia, 8, modo, { comArvore: true });
    expect(formato(executarMock(sequencia, 8, modo).raiz)).toEqual(formato(real.raiz!));
  });

  it.each([5, 8, 13, 40])('truncamento em %d nós concorda com o núcleo', (limite) => {
    const real = executarInstrumentado('tribonacci', 7, 'sem_cache', {
      comArvore: true,
      limiteNos: limite,
    });
    const doMock = truncarArvore(executarMock('tribonacci', 7, 'sem_cache').raiz, limite);
    expect(doMock.nos).toBe(real.nosExibidos);
    expect(doMock.truncada).toBe(real.truncada);
    expect(formato(doMock.raiz)).toEqual(formato(real.raiz!));
  });

  it('contagem por fórmula fechada bate com a execução em n grande', () => {
    const porFormula = metricasMock('fibonacci', 25, 'sem_cache');
    const porExecucao = executarInstrumentado('fibonacci', 25, 'sem_cache', {
      comArvore: false,
    }).metricas;
    expect(porFormula).toEqual(porExecucao);
  });
});
