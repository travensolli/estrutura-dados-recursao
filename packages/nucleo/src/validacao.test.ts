import { ErroSequencia } from '@sequencias/contrato';
import { describe, expect, it } from 'vitest';
import { executarProtegido, validarN } from './validacao';

function capturar(fn: () => void): ErroSequencia {
  try {
    fn();
  } catch (erro) {
    if (erro instanceof ErroSequencia) return erro;
    throw erro;
  }
  throw new Error('esperava ErroSequencia');
}

describe('validarN', () => {
  it('aceita inteiros não negativos dentro do limite', () => {
    expect(() => validarN(0)).not.toThrow();
    expect(() => validarN(7)).not.toThrow();
    expect(() => validarN(30, 30)).not.toThrow();
    expect(() => validarN(Number.MAX_SAFE_INTEGER)).not.toThrow();
  });

  const invalidos: Array<[unknown, string]> = [
    [-1, 'negativo'],
    [1.5, 'fracionário'],
    [Number.NaN, 'NaN'],
    ['7', 'string'],
    [Number.POSITIVE_INFINITY, 'infinito'],
    [Number.MAX_SAFE_INTEGER + 2, 'não seguro'],
    [null, 'nulo'],
    [undefined, 'indefinido'],
    [7n, 'bigint'],
  ];
  it.each(invalidos)('rejeita %p (%s) com ENTRADA_INVALIDA', (entrada, _descricao) => {
    const erro = capturar(() => validarN(entrada));
    expect(erro.codigo).toBe('ENTRADA_INVALIDA');
    expect(erro.message).toMatch(/^n /);
    expect(() => JSON.stringify(erro.paraJson())).not.toThrow();
  });

  it('rejeita acima do limite com LIMITE_EXCEDIDO e detalhes', () => {
    const erro = capturar(() => validarN(31, 30));
    expect(erro.codigo).toBe('LIMITE_EXCEDIDO');
    expect(erro.message).toContain('30');
    expect(erro.detalhes).toEqual({ n: 31, limite: 30 });
  });

  it('checa a validade antes do limite', () => {
    expect(capturar(() => validarN(-5, 30)).codigo).toBe('ENTRADA_INVALIDA');
  });

  it('estreita o tipo para number', () => {
    const entrada: unknown = 5;
    validarN(entrada);
    expect(entrada + 1).toBe(6);
  });
});

describe('executarProtegido', () => {
  it('devolve o resultado da função quando não há erro', () => {
    expect(executarProtegido(() => 42)).toBe(42);
  });

  it('converte estouro de pilha em PILHA_ESTOURADA', () => {
    const infinita = (n: number): number => infinita(n + 1) + 1;
    const erro = capturar(() => executarProtegido(() => infinita(0)));
    expect(erro.codigo).toBe('PILHA_ESTOURADA');
    expect(erro.message).toBe(
      'A recursão ficou profunda demais para a pilha disponível. Tente um n menor.',
    );
  });

  it('deixa outros erros passarem intactos', () => {
    const original = new RangeError('outro range error');
    expect(() =>
      executarProtegido(() => {
        throw original;
      }),
    ).toThrow(original);
    const dominio = new ErroSequencia('ENTRADA_INVALIDA', 'n inválido');
    expect(() =>
      executarProtegido(() => {
        throw dominio;
      }),
    ).toThrow(dominio);
    expect(() =>
      executarProtegido(() => {
        throw new TypeError('tipo');
      }),
    ).toThrow(TypeError);
  });
});
