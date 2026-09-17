import { SequenciasRespostaSchema } from '@sequencias/contrato';
import { describe, expect, it } from 'vitest';
import { criarAplicacao } from '../aplicacao';

describe('GET /api/sequencias', () => {
  it('descreve as três sequências com os casos base do enunciado', async () => {
    const app = criarAplicacao();
    const resposta = await app.inject({ method: 'GET', url: '/api/sequencias' });
    expect(resposta.statusCode).toBe(200);
    const corpo = SequenciasRespostaSchema.parse(resposta.json());
    await app.close();

    expect(corpo.sequencias.map((s) => s.id)).toEqual(['fatorial', 'fibonacci', 'tribonacci']);
    const fibonacci = corpo.sequencias[1];
    expect(fibonacci?.casos_base).toBe('f(0) = f(1) = 1');
    expect(fibonacci?.primeiros_termos.slice(0, 6)).toEqual(['1', '1', '2', '3', '5', '8']);
    const tribonacci = corpo.sequencias[2];
    expect(tribonacci?.primeiros_termos.slice(0, 8)).toEqual([
      '1',
      '1',
      '1',
      '3',
      '5',
      '9',
      '17',
      '31',
    ]);
    expect(tribonacci?.limites).toEqual({ sem_cache: 30, com_cache: 5000 });
    expect(corpo.limite_nos_arvore_padrao).toBe(300);
    expect(corpo.limiar_confirmacao_invocacoes).toBe(1_000_000);
  });
});
