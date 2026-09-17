import { describe, expect, it } from 'vitest';
import { coletaDeLixoDisponivel, coletarLixo, heapUsado, obterColetorDeLixo } from './coleta-lixo';

describe('coleta de lixo', () => {
  it('encontra um coletor mesmo sem a flag --expose-gc no processo de teste', () => {
    expect(obterColetorDeLixo()).toBeTypeOf('function');
    expect(coletaDeLixoDisponivel()).toBe(true);
  });

  it('libera memória de lixo recém-criado', () => {
    const caixa: { lixo: number[][] | null } = { lixo: [] };
    coletarLixo();
    const base = heapUsado();
    for (let i = 0; i < 40; i += 1) caixa.lixo?.push(new Array<number>(100_000).fill(i));
    const pico = heapUsado();
    expect(pico).toBeGreaterThan(base);
    caixa.lixo = null;
    coletarLixo();
    expect(heapUsado()).toBeLessThan(pico);
  });
});

describe('heapUsado', () => {
  it('devolve um número positivo de bytes', () => {
    expect(heapUsado()).toBeGreaterThan(0);
  });
});
