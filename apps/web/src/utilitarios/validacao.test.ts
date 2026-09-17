import { describe, expect, it } from 'vitest';
import { descreverIntervalo, validarInteiro } from './validacao';

describe('validarInteiro', () => {
  it('aceita um inteiro dentro do intervalo', () => {
    expect(validarInteiro('7', { minimo: 0, maximo: 30 })).toEqual({
      valido: true,
      valor: 7,
      mensagem: null,
    });
  });

  it('recusa texto vazio quando o campo é obrigatório', () => {
    expect(validarInteiro('  ').mensagem).toBe('Informe um valor para n.');
  });

  it('recusa caracteres que não são dígitos', () => {
    expect(validarInteiro('7,5').mensagem).toMatch(/apenas dígitos/);
    expect(validarInteiro('-3').mensagem).toMatch(/apenas dígitos/);
  });

  it('avisa quando passa dos limites', () => {
    expect(validarInteiro('31', { minimo: 0, maximo: 30 }).mensagem).toBe(
      'O maior valor aceito é 30.',
    );
    expect(validarInteiro('1', { minimo: 2, maximo: 30 }).mensagem).toBe(
      'O menor valor aceito é 2.',
    );
  });
});

describe('descreverIntervalo', () => {
  it('descreve intervalo fechado e aberto', () => {
    expect(descreverIntervalo(0, 30)).toBe('de 0 a 30');
    expect(descreverIntervalo(2)).toBe('a partir de 2');
  });
});
