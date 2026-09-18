import { ErroSchema, EstimativaRespostaSchema } from '@sequencias/contrato';
import { afterAll, describe, expect, it } from 'vitest';
import { criarAplicacao } from '../aplicacao';

const app = criarAplicacao();

afterAll(async () => {
  await app.close();
});

function consultar(parametros: Record<string, string>) {
  return app.inject({
    method: 'GET',
    url: `/api/estimativa?${new URLSearchParams(parametros)}`,
  });
}

describe('GET /api/estimativa', () => {
  it('prevê tribonacci f(7) nos dois modos', async () => {
    const sem = await consultar({ sequencia: 'tribonacci', n: '7', modo: 'sem_cache' });
    expect(sem.statusCode).toBe(200);
    expect(EstimativaRespostaSchema.parse(sem.json())).toMatchObject({
      invocacoes_previstas: '46',
      profundidade_prevista: 6,
      dentro_do_limite: true,
      pesado: false,
      aviso: null,
    });

    const com = await consultar({ sequencia: 'tribonacci', n: '7', modo: 'com_cache' });
    expect(EstimativaRespostaSchema.parse(com.json()).invocacoes_previstas).toBe('16');
  });

  it('prevê fibonacci f(10) e o fatorial de 10', async () => {
    const fibonacci = await consultar({ sequencia: 'fibonacci', n: '10', modo: 'sem_cache' });
    expect(fibonacci.json().invocacoes_previstas).toBe('177');
    const fatorial = await consultar({ sequencia: 'fatorial', n: '10', modo: 'com_cache' });
    expect(fatorial.json().invocacoes_previstas).toBe('10');
  });

  it('avisa quando n passa do limite de execução', async () => {
    const resposta = await consultar({ sequencia: 'tribonacci', n: '40', modo: 'sem_cache' });
    expect(resposta.statusCode).toBe(200);
    const corpo = EstimativaRespostaSchema.parse(resposta.json());
    expect(corpo.dentro_do_limite).toBe(false);
    expect(corpo.limite_n).toBe(30);
    expect(corpo.aviso).toMatch(/até n = 30/);
  });

  it('recusa sequência, modo ou n inválidos', async () => {
    const semSequencia = await consultar({ n: '7', modo: 'sem_cache' });
    expect(semSequencia.statusCode).toBe(400);
    expect(ErroSchema.parse(semSequencia.json()).codigo).toBe('ENTRADA_INVALIDA');

    const modoErrado = await consultar({ sequencia: 'fibonacci', n: '7', modo: 'memo' });
    expect(modoErrado.statusCode).toBe(400);

    const nTexto = await consultar({ sequencia: 'fibonacci', n: 'dez', modo: 'sem_cache' });
    expect(nTexto.statusCode).toBe(400);

    const nNegativo = await consultar({ sequencia: 'fibonacci', n: '-1', modo: 'sem_cache' });
    expect(nNegativo.statusCode).toBe(400);
    expect(ErroSchema.parse(nNegativo.json()).mensagem).toMatch(/n:/);
  });

  it('recusa n acima do teto da própria estimativa', async () => {
    const resposta = await consultar({ sequencia: 'fatorial', n: '20001', modo: 'com_cache' });
    expect(resposta.statusCode).toBe(400);
  });

  it('usa a pilha ampliada do worker na recursão profunda', async () => {
    const resposta = await consultar({ sequencia: 'fibonacci', n: '20000', modo: 'sem_cache' });
    expect(resposta.statusCode).toBe(200);
    const corpo = EstimativaRespostaSchema.parse(resposta.json());
    expect(corpo.invocacoes_previstas.length).toBeGreaterThan(4000);
    expect(corpo.pesado).toBe(true);
    expect(corpo.profundidade_prevista).toBe(20_000);
    expect(corpo.aviso).toMatch(/até n = 35/);
  });
});
