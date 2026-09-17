import { describe, expect, it } from 'vitest';
import { executarTrabalho, trabalhosPendentes } from './servico';

describe('executarTrabalho', () => {
  it('atende os pedidos em fila, um worker por vez', async () => {
    expect(trabalhosPendentes()).toBe(0);
    const primeiro = executarTrabalho({
      tipo: 'calcular',
      sequencia: 'tribonacci',
      n: 7,
      modo: 'sem_cache',
    });
    const segundo = executarTrabalho({
      tipo: 'arvore',
      sequencia: 'fibonacci',
      n: 6,
      modo: 'com_cache',
      limite_nos: 50,
    });
    expect(trabalhosPendentes()).toBe(2);

    const [calculo, arvore] = await Promise.all([primeiro, segundo]);
    expect(calculo.metricas.invocacoes).toBe(46);
    expect(arvore.metricas.invocacoes).toBe(2 * 6 - 1);
    expect(arvore.raiz.valor).toBe('13');
    expect(trabalhosPendentes()).toBe(0);
  });

  it('continua atendendo depois de um pedido recusado', async () => {
    await expect(
      executarTrabalho({ tipo: 'calcular', sequencia: 'tribonacci', n: 31, modo: 'sem_cache' }),
    ).rejects.toMatchObject({ codigo: 'LIMITE_EXCEDIDO' });

    const resposta = await executarTrabalho({
      tipo: 'calcular',
      sequencia: 'fatorial',
      n: 10,
      modo: 'com_cache',
    });
    expect(resposta.metricas.valor).toBe('3628800');
    expect(trabalhosPendentes()).toBe(0);
  });
});
