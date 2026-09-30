import { CompararRespostaSchema } from '@sequencias/contrato';
import { describe, expect, it } from 'vitest';
import { compararModos } from './comparacao';

const RAPIDO = {
  tempo: { duracaoMinimaNs: 1_000_000n, coletar: () => undefined },
  memoria: { repeticoes: 1, intervaloAmostragem: 1_000 },
  repeticoes: 2,
};

describe('compararModos', () => {
  it('responde no formato do contrato para tribonacci f(7)', () => {
    const resposta = compararModos('tribonacci', 7, RAPIDO);
    expect(CompararRespostaSchema.safeParse(resposta).success).toBe(true);
    expect(resposta.valor).toBe('31');
    expect(resposta.digitos).toBe(2);
    expect(resposta.invocacoes).toEqual({ sem_cache: 46, com_cache: 16 });
    expect(resposta.chamadas_evitadas).toBe(30);
    expect(resposta.repeticoes).toBe(2);
    expect(resposta.ordem_execucao).toEqual(['sem_cache', 'com_cache']);
    expect(resposta.memoria.com_cache.entradas_cache).toBe(5);
    expect(resposta.memoria.sem_cache.entradas_cache).toBe(0);
    expect(resposta.ambiente.node).toBe(process.versions.node);
  });

  it('respeita a ordem pedida dos modos', () => {
    const resposta = compararModos('fibonacci', 12, { ...RAPIDO, ordem: ['com_cache'] });
    expect(resposta.ordem_execucao).toEqual(['com_cache', 'sem_cache']);
    expect(resposta.invocacoes).toEqual({ sem_cache: 2 * 233 - 1, com_cache: 2 * 12 - 1 });
  });

  it('mede a memória em ordem fixa mesmo quando o tempo começa pelo com cache', () => {
    // Cada modo lê o heap duas vezes (base e depois da coleta): quem for
    // medido primeiro retém 500 e o segundo 700.
    const leituras = [0, 500, 0, 700];
    let indice = 0;
    const resposta = compararModos('fibonacci', 12, {
      ...RAPIDO,
      ordem: ['com_cache'],
      memoria: {
        repeticoes: 1,
        intervaloAmostragem: null,
        coletar: () => undefined,
        heap: () => leituras[indice++] ?? 0,
      },
    });
    expect(resposta.ordem_execucao).toEqual(['com_cache', 'sem_cache']);
    expect(resposta.memoria.sem_cache.retida_cache_bytes).toBe(500);
    expect(resposta.memoria.com_cache.retida_cache_bytes).toBe(700);
    expect(resposta.diferenca_memoria_bytes).toBe(200);
  });

  it('mostra o fatorial sem ganho de chamadas e com memória extra no cache', () => {
    const resposta = compararModos('fatorial', 400, RAPIDO);
    expect(resposta.invocacoes).toEqual({ sem_cache: 400, com_cache: 400 });
    expect(resposta.chamadas_evitadas).toBe(0);
    expect(resposta.memoria.com_cache.entradas_cache).toBe(399);
    expect(resposta.diferenca_memoria_bytes).toBeGreaterThan(0);
  });

  it('acelera de verdade o fibonacci com cache', () => {
    const resposta = compararModos('fibonacci', 24, RAPIDO);
    expect(resposta.valor).toBe('75025');
    expect(resposta.fator_aceleracao).toBeGreaterThan(10);
  });
});
