import { LIMITES_N } from '@sequencias/contrato';
import { describe, expect, it } from 'vitest';
import {
  CONSULTA_PADRAO,
  consultaValida,
  escreverConsulta,
  lerConsulta,
  validarConsulta,
} from './consulta';

const limites = LIMITES_N.node.tribonacci;

describe('lerConsulta', () => {
  it('usa tribonacci f(7) sem cache e 300 nós como padrão', () => {
    expect(lerConsulta(new URLSearchParams())).toEqual(CONSULTA_PADRAO);
  });

  it('lê os quatro parâmetros da URL', () => {
    expect(
      lerConsulta(new URLSearchParams('sequencia=fibonacci&n=12&modo=com_cache&limite_nos=50')),
    ).toEqual({ sequencia: 'fibonacci', n: 12, modo: 'com_cache', limite_nos: 50 });
  });

  it('ignora valores fora do domínio e volta ao padrão', () => {
    expect(
      lerConsulta(new URLSearchParams('sequencia=lucas&modo=memo&n=x&limite_nos=2.5')),
    ).toEqual(CONSULTA_PADRAO);
  });

  it('escreve de volta o que consegue ler', () => {
    const consulta = { sequencia: 'fatorial', n: 20, modo: 'com_cache', limite_nos: 40 } as const;
    expect(lerConsulta(new URLSearchParams(escreverConsulta(consulta)))).toEqual(consulta);
  });
});

describe('validarConsulta', () => {
  it('aceita a consulta padrão', () => {
    const erros = validarConsulta(CONSULTA_PADRAO, limites, 2000);
    expect(erros).toEqual({});
    expect(consultaValida(erros)).toBe(true);
  });

  it('recusa n acima do limite da sequência e do modo', () => {
    const erros = validarConsulta({ ...CONSULTA_PADRAO, n: 31 }, limites, 2000);
    expect(erros.n).toBe('Tribonacci sem cache vai até n = 30.');
    expect(consultaValida(erros)).toBe(false);
    expect(
      validarConsulta({ ...CONSULTA_PADRAO, n: 31, modo: 'com_cache' }, limites, 2000),
    ).toEqual({});
  });

  it('recusa n negativo ou quebrado', () => {
    expect(validarConsulta({ ...CONSULTA_PADRAO, n: -1 }, limites, 2000).n).toMatch(/inteiro/);
    expect(validarConsulta({ ...CONSULTA_PADRAO, n: 2.5 }, limites, 2000).n).toMatch(/inteiro/);
  });

  it('recusa limite de nós fora da faixa da tela', () => {
    expect(
      validarConsulta({ ...CONSULTA_PADRAO, limite_nos: 0 }, limites, 2000).limite_nos,
    ).toMatch(/a partir de 1/);
    expect(
      validarConsulta({ ...CONSULTA_PADRAO, limite_nos: 5000 }, limites, 2000).limite_nos,
    ).toBe('O limite de nós vai até 2000.');
  });
});
