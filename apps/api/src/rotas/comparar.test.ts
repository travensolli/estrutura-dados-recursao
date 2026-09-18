import { CompararRespostaSchema, ErroSchema, MODOS } from '@sequencias/contrato';
import { afterAll, describe, expect, it } from 'vitest';
import { criarAplicacao } from '../aplicacao';
import { valoresForaDoFormato } from '../testes/valores';

const app = criarAplicacao();

afterAll(async () => {
  await app.close();
});

function comparar(corpo: object) {
  return app.inject({ method: 'POST', url: '/api/comparar', payload: corpo });
}

describe('POST /api/comparar', () => {
  it('mede os dois modos de tribonacci f(7) e conta 30 chamadas evitadas', async () => {
    const resposta = await comparar({ sequencia: 'tribonacci', n: 7, repeticoes: 1 });
    expect(resposta.statusCode).toBe(200);
    const corpo = CompararRespostaSchema.parse(resposta.json());

    expect(corpo.valor).toBe('31');
    expect(corpo.digitos).toBe(2);
    expect(corpo.invocacoes).toEqual({ sem_cache: 46, com_cache: 16 });
    expect(corpo.chamadas_evitadas).toBe(30);
    expect(corpo.tempo.sem_cache.mediana_ns).toBeGreaterThan(0);
    expect(corpo.tempo.com_cache.mediana_ns).toBeGreaterThan(0);
    expect(corpo.memoria.com_cache.entradas_cache).toBe(5);
    expect(corpo.memoria.sem_cache.entradas_cache).toBe(0);
    expect(corpo.memoria.com_cache.profundidade_maxima).toBe(6);
    expect([...corpo.ordem_execucao].sort()).toEqual([...MODOS].sort());
    expect(corpo.ambiente.node).toBe(process.versions.node);
    expect(corpo.ambiente.nucleos).toBeGreaterThan(0);
    expect(valoresForaDoFormato(corpo)).toEqual([]);
  });

  it('mostra o fatorial sem ganho: mesmas invocações e nenhuma chamada evitada', async () => {
    const resposta = await comparar({ sequencia: 'fatorial', n: 20, repeticoes: 1 });
    const corpo = CompararRespostaSchema.parse(resposta.json());
    expect(corpo.valor).toBe('2432902008176640000');
    expect(corpo.invocacoes).toEqual({ sem_cache: 20, com_cache: 20 });
    expect(corpo.chamadas_evitadas).toBe(0);
    expect(corpo.memoria.com_cache.entradas_cache).toBe(19);
    expect(corpo.diferenca_memoria_bytes).toBeGreaterThan(0);
  });

  it('usa o limite do modo sem cache, que é o mais restrito', async () => {
    const resposta = await comparar({ sequencia: 'fibonacci', n: 36, repeticoes: 1 });
    expect(resposta.statusCode).toBe(422);
    expect(ErroSchema.parse(resposta.json()).codigo).toBe('LIMITE_EXCEDIDO');
  });

  it('recusa repetições fora da faixa aceita', async () => {
    for (const repeticoes of [0, 31, 2.5]) {
      const resposta = await comparar({ sequencia: 'fatorial', n: 5, repeticoes });
      expect(resposta.statusCode).toBe(400);
      expect(ErroSchema.parse(resposta.json()).codigo).toBe('ENTRADA_INVALIDA');
    }
  });
});
