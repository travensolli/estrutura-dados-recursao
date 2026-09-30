import { describe, expect, it } from 'vitest';
import { executarMock } from '../../mocks/referencia-mock';
import { contaPassoAPasso } from './passos';
import { N_APRESENTACAO, SEQUENCIA_APRESENTACAO } from './slides';

const conta = (n: number, modo: 'sem_cache' | 'com_cache' = 'com_cache') =>
  contaPassoAPasso(executarMock(SEQUENCIA_APRESENTACAO, n, modo).raiz, 3);

describe('conta passo a passo', () => {
  it('parte dos três casos base valendo 1', () => {
    expect(conta(N_APRESENTACAO).casosBase).toEqual([
      { argumento: 0, valor: '1' },
      { argumento: 1, valor: '1' },
      { argumento: 2, valor: '1' },
    ]);
  });

  it('soma os três termos anteriores de f(3) até f(7)', () => {
    const { passos } = conta(N_APRESENTACAO);
    expect(passos.map((passo) => [passo.argumento, passo.valor])).toEqual([
      [3, '3'],
      [4, '5'],
      [5, '9'],
      [6, '17'],
      [7, '31'],
    ]);
    expect(passos.at(-1)?.parcelas).toEqual([
      { argumento: 6, valor: '17' },
      { argumento: 5, valor: '9' },
      { argumento: 4, valor: '5' },
    ]);
  });

  it('dá a mesma conta com e sem cache', () => {
    expect(conta(N_APRESENTACAO, 'sem_cache')).toEqual(conta(N_APRESENTACAO));
  });

  it('não tem passo quando o próprio n é caso base', () => {
    expect(conta(2).passos).toEqual([]);
  });
});
