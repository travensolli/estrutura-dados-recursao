import { ErroSchema, SerieRespostaSchema } from '@sequencias/contrato';
import { afterAll, describe, expect, it } from 'vitest';
import { criarAplicacao } from '../aplicacao';
import { valoresForaDoFormato } from '../testes/valores';

const app = criarAplicacao();

afterAll(async () => {
  await app.close();
});

function pedirSerie(corpo: object) {
  return app.inject({ method: 'POST', url: '/api/serie', payload: corpo });
}

describe('POST /api/serie', () => {
  it('devolve um ponto por n com tempo nos dois modos', async () => {
    const resposta = await pedirSerie({
      sequencia: 'tribonacci',
      n_inicial: 3,
      n_final: 7,
      passo: 1,
      repeticoes: 1,
    });
    expect(resposta.statusCode).toBe(200);
    const corpo = SerieRespostaSchema.parse(resposta.json());
    expect(corpo.pontos.map((ponto) => ponto.n)).toEqual([3, 4, 5, 6, 7]);
    expect(corpo.pontos.at(-1)?.invocacoes).toEqual({ sem_cache: 46, com_cache: 16 });
    for (const ponto of corpo.pontos) {
      expect(ponto.tempo_ns.com_cache).toBeGreaterThan(0);
      expect(ponto.tempo_ns.sem_cache).toBeGreaterThan(0);
    }
    expect(corpo.ambiente.node).toBe(process.versions.node);
    expect(valoresForaDoFormato(corpo)).toEqual([]);
  });

  it('respeita o passo e informa quantas repetições foram usadas', async () => {
    const resposta = await pedirSerie({
      sequencia: 'fatorial',
      n_inicial: 0,
      n_final: 8,
      passo: 4,
      repeticoes: 2,
    });
    const corpo = SerieRespostaSchema.parse(resposta.json());
    expect(corpo.pontos.map((ponto) => ponto.n)).toEqual([0, 4, 8]);
    expect(corpo.repeticoes).toBe(2);
    expect(corpo.passo).toBe(4);
  });

  it('deixa o tempo sem cache nulo acima do limite desse modo', async () => {
    const resposta = await pedirSerie({
      sequencia: 'fibonacci',
      n_inicial: 35,
      n_final: 37,
      passo: 1,
      repeticoes: 1,
    });
    const corpo = SerieRespostaSchema.parse(resposta.json());
    expect(corpo.pontos[0]?.tempo_ns.sem_cache).toBeGreaterThan(0);
    expect(corpo.pontos[1]?.tempo_ns.sem_cache).toBeNull();
    expect(corpo.pontos[2]?.tempo_ns.sem_cache).toBeNull();
    expect(corpo.pontos[2]?.tempo_ns.com_cache).toBeGreaterThan(0);
    expect(corpo.pontos[2]?.invocacoes.com_cache).toBe(73);
  });

  it('recusa intervalo invertido, pontos demais e n acima do limite', async () => {
    const invertido = await pedirSerie({ sequencia: 'fatorial', n_inicial: 10, n_final: 1 });
    expect(invertido.statusCode).toBe(400);
    expect(ErroSchema.parse(invertido.json()).codigo).toBe('ENTRADA_INVALIDA');

    const pontosDemais = await pedirSerie({ sequencia: 'fatorial', n_inicial: 0, n_final: 500 });
    expect(pontosDemais.statusCode).toBe(400);

    const acimaDoLimite = await pedirSerie({
      sequencia: 'fatorial',
      n_inicial: 5000,
      n_final: 5001,
      passo: 1,
      repeticoes: 1,
    });
    expect(acimaDoLimite.statusCode).toBe(422);
    expect(ErroSchema.parse(acimaDoLimite.json()).codigo).toBe('LIMITE_EXCEDIDO');
  });
});
