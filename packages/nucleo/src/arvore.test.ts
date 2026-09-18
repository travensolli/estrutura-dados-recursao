import type { No } from '@sequencias/contrato';
import { describe, expect, it } from 'vitest';
import { arvoreParaTexto, descreverNo } from './arvore';
import {
  fatorialSemCacheInstrumentado,
  fibonacciComCacheInstrumentado,
  tribonacciSemCacheInstrumentado,
} from './instrumentados';

describe('arvoreParaTexto', () => {
  it('imprime tribonacci f(3) sem cache em pré-ordem com indentação', () => {
    const { raiz } = tribonacciSemCacheInstrumentado(3);
    expect(arvoreParaTexto(raiz as No)).toBe(
      ['f(3) = 3 [calculado]', '  f(2) = 1 [base]', '  f(1) = 1 [base]', '  f(0) = 1 [base]'].join(
        '\n',
      ),
    );
  });

  it('marca acertos de cache em fibonacci f(4) com cache', () => {
    const { raiz } = fibonacciComCacheInstrumentado(4, new Map());
    expect(arvoreParaTexto(raiz as No)).toBe(
      [
        'f(4) = 5 [calculado]',
        '  f(3) = 3 [calculado]',
        '    f(2) = 2 [calculado]',
        '      f(1) = 1 [base]',
        '      f(0) = 1 [base]',
        '    f(1) = 1 [base]',
        '  f(2) = 2 [acerto de cache]',
      ].join('\n'),
    );
  });

  it('mostra descendentes ocultos quando a árvore é truncada', () => {
    const { raiz } = tribonacciSemCacheInstrumentado(7, { limiteNos: 5 });
    expect(arvoreParaTexto(raiz as No)).toBe(
      [
        'f(7) = 31 [calculado]',
        '  f(6) = 17 [calculado]',
        '    +24 descendentes ocultos',
        '  f(5) = 9 [calculado]',
        '    +12 descendentes ocultos',
        '  f(4) = 5 [calculado]',
        '    +6 descendentes ocultos',
      ].join('\n'),
    );
    const fatorial = fatorialSemCacheInstrumentado(3, { limiteNos: 2 });
    expect(arvoreParaTexto(fatorial.raiz as No)).toBe(
      ['f(3) = 6 [calculado]', '  f(2) = 2 [calculado]', '    +1 descendente oculto'].join('\n'),
    );
  });

  it('tem uma linha por nó exibido mais uma por subárvore colapsada', () => {
    for (const limite of [1, 4, 10, 46, 100]) {
      const { raiz, nosExibidos } = tribonacciSemCacheInstrumentado(7, { limiteNos: limite });
      const texto = arvoreParaTexto(raiz as No);
      const linhas = texto.split('\n');
      const colapsadas = linhas.filter((l) => l.includes('descendente')).length;
      expect(linhas).toHaveLength(nosExibidos + colapsadas);
      expect(linhas[0]).toBe('f(7) = 31 [calculado]');
    }
  });

  it('aceita uma subárvore como raiz, com indentação relativa', () => {
    const { raiz } = tribonacciSemCacheInstrumentado(4);
    const filho = (raiz as No).filhos[0] as No;
    expect(arvoreParaTexto(filho).split('\n')[0]).toBe(descreverNo(filho));
    expect(arvoreParaTexto(filho)).toBe(
      ['f(3) = 3 [calculado]', '  f(2) = 1 [base]', '  f(1) = 1 [base]', '  f(0) = 1 [base]'].join(
        '\n',
      ),
    );
  });

  it('não depende da pilha em árvores profundas', () => {
    const { raiz } = fatorialSemCacheInstrumentado(3000);
    const linhas = arvoreParaTexto(raiz as No).split('\n');
    expect(linhas).toHaveLength(3000);
    expect(linhas[2999]).toBe(`${'  '.repeat(2999)}f(1) = 1 [base]`);
  });
});
