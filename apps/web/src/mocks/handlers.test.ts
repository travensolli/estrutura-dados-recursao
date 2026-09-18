import { describe, expect, it } from 'vitest';
import { api } from '../api/cliente';

function contarNos(no: { filhos: { filhos: unknown[] }[] }): number {
  return 1 + no.filhos.reduce((soma, filho) => soma + contarNos(filho as never), 0);
}

describe('mocks MSW', () => {
  it('lista as três sequências', async () => {
    const resposta = await api.sequencias();
    expect(resposta.sequencias.map((s) => s.id)).toEqual(['fatorial', 'fibonacci', 'tribonacci']);
  });

  it('árvore de tribonacci f(7) tem 46 nós sem cache e 16 com cache', async () => {
    const sem = await api.arvore({ sequencia: 'tribonacci', n: 7, modo: 'sem_cache' });
    const com = await api.arvore({ sequencia: 'tribonacci', n: 7, modo: 'com_cache' });
    expect(sem.metricas.invocacoes).toBe(46);
    expect(contarNos(sem.raiz)).toBe(46);
    expect(com.metricas.invocacoes).toBe(16);
    expect(contarNos(com.raiz)).toBe(16);
    expect(com.metricas.acertos_cache).toBe(5);
    expect(com.metricas.acertos_detalhados).toEqual([
      { argumento: 3, dentro_de: 5 },
      { argumento: 4, dentro_de: 6 },
      { argumento: 3, dentro_de: 6 },
      { argumento: 5, dentro_de: 7 },
      { argumento: 4, dentro_de: 7 },
    ]);
    expect(sem.metricas.invocacoes - com.metricas.invocacoes).toBe(30);
  });

  it('trunca a árvore acima do orçamento', async () => {
    const resposta = await api.arvore({
      sequencia: 'fibonacci',
      n: 12,
      modo: 'sem_cache',
      limite_nos: 20,
    });
    expect(resposta.truncada).toBe(true);
    expect(resposta.nos_exibidos).toBeLessThanOrEqual(20);
    expect(resposta.metricas.invocacoes).toBe(465);
  });

  it('rejeita n acima do limite com erro amigável', async () => {
    await expect(
      api.calcular({ sequencia: 'fibonacci', n: 90, modo: 'sem_cache' }),
    ).rejects.toMatchObject({
      codigo: 'LIMITE_EXCEDIDO',
    });
  });

  it('rejeita entrada inválida', async () => {
    await expect(
      api.calcular({ sequencia: 'fibonacci', n: -1, modo: 'sem_cache' }),
    ).rejects.toMatchObject({
      codigo: 'ENTRADA_INVALIDA',
    });
  });

  it('mantém valores grandes exatos como texto', async () => {
    const resposta = await api.calcular({ sequencia: 'fatorial', n: 25, modo: 'com_cache' });
    expect(resposta.metricas.valor).toBe('15511210043330985984000000');
  });
});
