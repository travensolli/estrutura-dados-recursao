import { describe, expect, it } from 'vitest';
import {
  abreviarValor,
  corDoArgumento,
  formatarBytes,
  formatarCompacto,
  formatarFator,
  formatarInteiro,
  formatarQuantidade,
  formatarTempoNs,
} from './formatar';

describe('formatar', () => {
  it('formata inteiros grandes sem perder precisão', () => {
    expect(formatarInteiro('15511210043330985984000000')).toBe(
      '15.511.210.043.330.985.984.000.000',
    );
    expect(formatarInteiro(1234)).toBe('1.234');
  });
  it('concorda o substantivo com a quantidade, singular só para um', () => {
    expect(formatarQuantidade(1, 'invocação', 'invocações')).toBe('1 invocação');
    expect(formatarQuantidade(0, 'invocação', 'invocações')).toBe('0 invocações');
    expect(formatarQuantidade(46, 'invocação', 'invocações')).toBe('46 invocações');
    expect(formatarQuantidade(1n, 'entrada', 'entradas')).toBe('1 entrada');
    expect(formatarQuantidade(128287, 'invocação', 'invocações')).toBe('128.287 invocações');
  });
  it('abrevia valores enormes mantendo o texto completo', () => {
    const r = abreviarValor('15511210043330985984000000');
    expect(r.foiAbreviado).toBe(true);
    expect(r.digitos).toBe(26);
    expect(r.abreviado).toBe('155112…000000');
    expect(r.completo).toBe('15511210043330985984000000');
    expect(abreviarValor('31').foiAbreviado).toBe(false);
  });
  it('escolhe a unidade de tempo', () => {
    expect(formatarTempoNs(850)).toBe('850 ns');
    expect(formatarTempoNs(12_345)).toBe('12,3 µs');
    expect(formatarTempoNs(45_600_000)).toBe('45,6 ms');
    expect(formatarTempoNs(1_230_000_000)).toBe('1,23 s');
  });
  it('escolhe a unidade de memória com sinal', () => {
    expect(formatarBytes(512)).toBe('512 B');
    expect(formatarBytes(-2048)).toBe('-2,0 KB');
    expect(formatarBytes(3 * 1024 ** 2)).toBe('3,0 MB');
  });
  it('encurta números grandes e preserva os pequenos', () => {
    /* O Intl separa número e unidade com espaço fixo. */
    const fixo = '\u00a0';
    expect(formatarCompacto(46)).toBe('46');
    expect(formatarCompacto(9_999)).toBe('9.999');
    expect(formatarCompacto(128_287)).toBe(`128,3${fixo}mil`);
    expect(formatarCompacto(1_234_567)).toBe(`1,2${fixo}mi`);
  });
  it('formata fator e cor', () => {
    expect(formatarFator(12.34)).toBe('12,3×');
    expect(formatarFator(250)).toBe('250×');
    expect(corDoArgumento(3)).toBe('var(--arg-3)');
    expect(corDoArgumento(15)).toBe('var(--arg-3)');
  });
});
