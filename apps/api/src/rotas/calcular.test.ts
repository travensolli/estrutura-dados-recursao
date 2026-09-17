import { CalcularRespostaSchema, ErroSchema } from '@sequencias/contrato';
import { afterAll, describe, expect, it } from 'vitest';
import { criarAplicacao } from '../aplicacao';
import { valoresForaDoFormato } from '../testes/valores';

const app = criarAplicacao();

afterAll(async () => {
  await app.close();
});

function calcular(corpo: object) {
  return app.inject({ method: 'POST', url: '/api/calcular', payload: corpo });
}

describe('POST /api/calcular', () => {
  it('conta 46 invocações em tribonacci f(7) sem cache', async () => {
    const resposta = await calcular({ sequencia: 'tribonacci', n: 7, modo: 'sem_cache' });
    expect(resposta.statusCode).toBe(200);
    const corpo = CalcularRespostaSchema.parse(resposta.json());
    expect(corpo.metricas).toMatchObject({
      valor: '31',
      invocacoes: 46,
      chamadas_recursivas: 45,
      casos_base: 31,
      calculados: 15,
      acertos_cache: 0,
      entradas_cache: 0,
      profundidade_maxima: 6,
    });
    expect(corpo.duracao_ms).toBeGreaterThanOrEqual(0);
    expect(valoresForaDoFormato(corpo)).toEqual([]);
  });

  it('conta 16 invocações em tribonacci f(7) com cache, com os acertos na ordem', async () => {
    const resposta = await calcular({ sequencia: 'tribonacci', n: 7, modo: 'com_cache' });
    const { metricas } = CalcularRespostaSchema.parse(resposta.json());
    expect(metricas).toMatchObject({
      valor: '31',
      invocacoes: 16,
      chamadas_recursivas: 15,
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

  it('devolve o fatorial de 25 exato como texto', async () => {
    const resposta = await calcular({ sequencia: 'fatorial', n: 25, modo: 'sem_cache' });
    const { metricas } = CalcularRespostaSchema.parse(resposta.json());
    expect(metricas.valor).toBe('15511210043330985984000000');
    expect(metricas.digitos).toBe(26);
    expect(metricas.invocacoes).toBe(25);
    expect(resposta.payload).toContain('"15511210043330985984000000"');
  });

  it('conta 177 invocações em fibonacci f(10) sem cache e 19 com cache', async () => {
    const sem = await calcular({ sequencia: 'fibonacci', n: 10, modo: 'sem_cache' });
    expect(sem.json().metricas).toMatchObject({ valor: '89', invocacoes: 177 });
    const com = await calcular({ sequencia: 'fibonacci', n: 10, modo: 'com_cache' });
    expect(com.json().metricas).toMatchObject({ valor: '89', invocacoes: 19 });
  });

  it('recusa n acima do limite com 422 e código LIMITE_EXCEDIDO', async () => {
    const resposta = await calcular({ sequencia: 'fibonacci', n: 36, modo: 'sem_cache' });
    expect(resposta.statusCode).toBe(422);
    const erro = ErroSchema.parse(resposta.json());
    expect(erro.codigo).toBe('LIMITE_EXCEDIDO');
    expect(erro.mensagem).toMatch(/35/);
  });

  it('recusa entrada inválida com 400 e código ENTRADA_INVALIDA', async () => {
    for (const corpo of [
      { sequencia: 'lucas', n: 5, modo: 'sem_cache' },
      { sequencia: 'fibonacci', n: -1, modo: 'sem_cache' },
      { sequencia: 'fibonacci', n: 1.5, modo: 'sem_cache' },
      { sequencia: 'fibonacci', n: '10', modo: 'sem_cache' },
      { sequencia: 'fibonacci', n: 10 },
    ]) {
      const resposta = await calcular(corpo);
      expect(resposta.statusCode).toBe(400);
      expect(ErroSchema.parse(resposta.json()).codigo).toBe('ENTRADA_INVALIDA');
    }
  });

  it('recusa corpo que não é JSON', async () => {
    const resposta = await app.inject({
      method: 'POST',
      url: '/api/calcular',
      headers: { 'content-type': 'application/json' },
      payload: 'isto não é json',
    });
    expect(resposta.statusCode).toBe(400);
    expect(ErroSchema.parse(resposta.json()).codigo).toBe('ENTRADA_INVALIDA');
  });
});
