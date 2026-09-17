import { MetricasSchema, NoSchema, type Metricas, type Modo, type No } from '@sequencias/contrato';
import { describe, expect, it } from 'vitest';
import type { OpcoesInstrumentacao, ResultadoInstrumentado } from './instrumentacao';
import {
  fatorialComCacheInstrumentado,
  fatorialSemCacheInstrumentado,
  fibonacciComCacheInstrumentado,
  fibonacciSemCacheInstrumentado,
  tribonacciComCacheInstrumentado,
  tribonacciSemCacheInstrumentado,
} from './instrumentados';
import {
  fatorialComCache,
  fatorialSemCache,
  fibonacciComCache,
  fibonacciSemCache,
  tribonacciComCache,
  tribonacciSemCache,
} from './puros';
import { invocacoesPelaFormula, profundidadePelaFormula, valorPeloOraculo } from './testes/oraculo';

const ATE_20 = Array.from({ length: 21 }, (_, i) => i);

type Instrumentada = (n: number, opcoes?: OpcoesInstrumentacao) => ResultadoInstrumentado;

const INSTRUMENTADAS: Record<
  'fatorial' | 'fibonacci' | 'tribonacci',
  Record<Modo, Instrumentada>
> = {
  fatorial: {
    sem_cache: (n, o) => fatorialSemCacheInstrumentado(n, o),
    com_cache: (n, o) => fatorialComCacheInstrumentado(n, new Map(), o),
  },
  fibonacci: {
    sem_cache: (n, o) => fibonacciSemCacheInstrumentado(n, o),
    com_cache: (n, o) => fibonacciComCacheInstrumentado(n, new Map(), o),
  },
  tribonacci: {
    sem_cache: (n, o) => tribonacciSemCacheInstrumentado(n, o),
    com_cache: (n, o) => tribonacciComCacheInstrumentado(n, new Map(), o),
  },
};

const PURAS: Record<
  'fatorial' | 'fibonacci' | 'tribonacci',
  Record<Modo, (n: number) => bigint>
> = {
  fatorial: { sem_cache: fatorialSemCache, com_cache: (n) => fatorialComCache(n, new Map()) },
  fibonacci: { sem_cache: fibonacciSemCache, com_cache: (n) => fibonacciComCache(n, new Map()) },
  tribonacci: {
    sem_cache: tribonacciSemCache,
    com_cache: (n) => tribonacciComCache(n, new Map()),
  },
};

const SEQUENCIAS = ['fatorial', 'fibonacci', 'tribonacci'] as const;
const MODOS = ['sem_cache', 'com_cache'] as const;
const COMBINACOES = SEQUENCIAS.flatMap((s) => MODOS.map((m) => [s, m] as const));

function porArgumento(metricas: Metricas): Record<number, number> {
  return Object.fromEntries(
    metricas.invocacoes_por_argumento.map((e) => [e.argumento, e.invocacoes]),
  );
}

function todosOsNos(raiz: No): No[] {
  const lista: No[] = [];
  const pilha = [raiz];
  while (pilha.length > 0) {
    const no = pilha.pop() as No;
    lista.push(no);
    for (const filho of no.filhos) pilha.push(filho);
  }
  return lista;
}

describe('valores das versões instrumentadas', () => {
  it.each(COMBINACOES)('%s %s bate com o oráculo e com a versão pura de 0 a 20', (seq, modo) => {
    for (const n of ATE_20) {
      const resultado = INSTRUMENTADAS[seq][modo](n);
      expect(resultado.valor).toBe(valorPeloOraculo(seq, n));
      expect(resultado.valor).toBe(PURAS[seq][modo](n));
      expect(resultado.metricas.valor).toBe(resultado.valor.toString());
      expect(resultado.metricas.digitos).toBe(resultado.valor.toString().length);
      expect(() => MetricasSchema.parse(resultado.metricas)).not.toThrow();
    }
  });

  it('mantém precisão acima de 2^53 - 1', () => {
    expect(fatorialComCacheInstrumentado(25, new Map()).metricas.valor).toBe(
      '15511210043330985984000000',
    );
    expect(fatorialSemCacheInstrumentado(25).metricas.digitos).toBe(26);
    expect(fibonacciComCacheInstrumentado(100, new Map()).valor).toBe(
      valorPeloOraculo('fibonacci', 100),
    );
    expect(tribonacciComCacheInstrumentado(100, new Map()).valor).toBe(
      valorPeloOraculo('tribonacci', 100),
    );
  });
});

describe('contagens contra as fórmulas fechadas', () => {
  it.each(COMBINACOES)('%s %s de 0 a 20', (seq, modo) => {
    for (const n of ATE_20) {
      const { metricas } = INSTRUMENTADAS[seq][modo](n, { comArvore: false });
      expect(metricas.invocacoes).toBe(invocacoesPelaFormula(seq, n, modo));
      expect(metricas.chamadas_recursivas).toBe(metricas.invocacoes - 1);
      expect(metricas.invocacoes).toBe(
        metricas.casos_base + metricas.calculados + metricas.acertos_cache,
      );
      expect(metricas.profundidade_maxima).toBe(profundidadePelaFormula(seq, n));
      const soma = metricas.invocacoes_por_argumento.reduce((s, e) => s + e.invocacoes, 0);
      expect(soma).toBe(metricas.invocacoes);
      const argumentos = metricas.invocacoes_por_argumento.map((e) => e.argumento);
      expect(argumentos).toEqual([...argumentos].sort((a, b) => b - a));
      expect(metricas.acertos_detalhados).toHaveLength(metricas.acertos_cache);
      if (modo === 'sem_cache') {
        expect(metricas.acertos_cache).toBe(0);
        expect(metricas.entradas_cache).toBe(0);
        expect(metricas.acertos_detalhados).toEqual([]);
      }
    }
  });

  it('folhas = valor para fibonacci e tribonacci sem cache', () => {
    for (const n of ATE_20) {
      const fib = fibonacciSemCacheInstrumentado(n, { comArvore: false });
      expect(BigInt(fib.metricas.casos_base)).toBe(fib.valor);
      const trib = tribonacciSemCacheInstrumentado(n, { comArvore: false });
      expect(BigInt(trib.metricas.casos_base)).toBe(trib.valor);
    }
  });

  it('fatorial não ganha nada com cache numa execução isolada', () => {
    for (const n of ATE_20) {
      const sem = fatorialSemCacheInstrumentado(n).metricas;
      const com = fatorialComCacheInstrumentado(n, new Map()).metricas;
      expect(com.invocacoes).toBe(sem.invocacoes);
      expect(com.invocacoes).toBe(n === 0 ? 1 : n);
      expect(com.acertos_cache).toBe(0);
      expect(com.casos_base).toBe(1);
      expect(com.calculados).toBe(Math.max(0, n - 1));
      expect(com.entradas_cache).toBe(Math.max(0, n - 1));
      expect(sem.entradas_cache).toBe(0);
    }
    expect(fatorialSemCacheInstrumentado(10).metricas).toMatchObject({
      valor: '3628800',
      invocacoes: 10,
      chamadas_recursivas: 9,
    });
  });

  it('fibonacci f(10) = 89 com 177 invocações sem cache e 19 com cache', () => {
    const sem = fibonacciSemCacheInstrumentado(10).metricas;
    const com = fibonacciComCacheInstrumentado(10, new Map()).metricas;
    expect(sem).toMatchObject({ valor: '89', invocacoes: 177, casos_base: 89, calculados: 88 });
    expect(com).toMatchObject({
      valor: '89',
      invocacoes: 19,
      calculados: 9,
      acertos_cache: 7,
      casos_base: 3,
      entradas_cache: 9,
      profundidade_maxima: 10,
    });
  });
});

describe('tribonacci f(7): valores de referência', () => {
  it('sem cache', () => {
    const { valor, metricas, raiz, truncada, nosExibidos } = tribonacciSemCacheInstrumentado(7);
    expect(valor).toBe(31n);
    expect(metricas).toMatchObject({
      valor: '31',
      digitos: 2,
      invocacoes: 46,
      chamadas_recursivas: 45,
      casos_base: 31,
      calculados: 15,
      acertos_cache: 0,
      entradas_cache: 0,
      profundidade_maxima: 6,
      acertos_detalhados: [],
    });
    expect(porArgumento(metricas)).toEqual({ 7: 1, 6: 1, 5: 2, 4: 4, 3: 7, 2: 13, 1: 11, 0: 7 });
    expect(metricas.invocacoes_por_argumento[0]).toEqual({ argumento: 7, invocacoes: 1 });
    expect(truncada).toBe(false);
    expect(nosExibidos).toBe(46);
    expect(raiz).not.toBeNull();
  });

  it('com cache', () => {
    const cache = new Map<number, bigint>();
    const { valor, metricas, nosExibidos } = tribonacciComCacheInstrumentado(7, cache);
    expect(valor).toBe(31n);
    expect(metricas).toMatchObject({
      valor: '31',
      invocacoes: 16,
      chamadas_recursivas: 15,
      casos_base: 6,
      calculados: 5,
      acertos_cache: 5,
      entradas_cache: 5,
      profundidade_maxima: 6,
    });
    expect(metricas.acertos_detalhados).toEqual([
      { argumento: 3, dentro_de: 5 },
      { argumento: 4, dentro_de: 6 },
      { argumento: 3, dentro_de: 6 },
      { argumento: 5, dentro_de: 7 },
      { argumento: 4, dentro_de: 7 },
    ]);
    expect(porArgumento(metricas)).toEqual({ 7: 1, 6: 1, 5: 2, 4: 3, 3: 3, 2: 3, 1: 2, 0: 1 });
    expect([...cache.keys()].sort((a, b) => a - b)).toEqual([3, 4, 5, 6, 7]);
    expect(nosExibidos).toBe(16);
  });

  it('evita 30 chamadas', () => {
    const sem = tribonacciSemCacheInstrumentado(7, { comArvore: false }).metricas;
    const com = tribonacciComCacheInstrumentado(7, new Map(), { comArvore: false }).metricas;
    expect(sem.invocacoes - com.invocacoes).toBe(30);
  });
});

describe('estado e opções', () => {
  it('executar duas vezes dá métricas idênticas', () => {
    for (const [seq, modo] of COMBINACOES) {
      const primeira = INSTRUMENTADAS[seq][modo](12);
      const segunda = INSTRUMENTADAS[seq][modo](12);
      expect(segunda.metricas).toEqual(primeira.metricas);
      expect(segunda.raiz).toEqual(primeira.raiz);
    }
  });

  it('o Map recebido é o único cache', () => {
    const cache = new Map<number, bigint>();
    tribonacciComCacheInstrumentado(7, cache);
    const reuso = tribonacciComCacheInstrumentado(7, cache);
    expect(reuso.metricas.invocacoes).toBe(1);
    expect(reuso.metricas.acertos_cache).toBe(1);
    expect(reuso.raiz?.tipo).toBe('acerto_cache');
    const limpo = tribonacciComCacheInstrumentado(7, new Map());
    expect(limpo.metricas.invocacoes).toBe(16);
  });

  it('comArvore = false devolve raiz nula e métricas completas', () => {
    const resultado = fibonacciSemCacheInstrumentado(10, { comArvore: false });
    expect(resultado.raiz).toBeNull();
    expect(resultado.nosExibidos).toBe(0);
    expect(resultado.truncada).toBe(false);
    expect(resultado.metricas.invocacoes).toBe(177);
  });

  it('aoInvocar recebe o total acumulado a cada invocação', () => {
    const vistos: number[] = [];
    const { metricas } = tribonacciSemCacheInstrumentado(7, {
      comArvore: false,
      aoInvocar: (i) => vistos.push(i),
    });
    expect(vistos).toHaveLength(metricas.invocacoes);
    expect(vistos).toEqual(Array.from({ length: 46 }, (_, i) => i + 1));
  });
});

describe('árvore de chamadas', () => {
  it.each(COMBINACOES)('%s %s: relógio, ids, profundidades e tipos consistentes', (seq, modo) => {
    for (const n of [0, 1, 2, 3, 5, 8, 12]) {
      const { metricas, raiz, nosExibidos, truncada } = INSTRUMENTADAS[seq][modo](n);
      expect(truncada).toBe(false);
      expect(raiz).not.toBeNull();
      const nos = todosOsNos(raiz as No);
      expect(nos).toHaveLength(metricas.invocacoes);
      expect(nosExibidos).toBe(metricas.invocacoes);
      expect(() => NoSchema.parse(raiz)).not.toThrow();

      expect(raiz?.id).toBe(1);
      expect(raiz?.argumento).toBe(n);
      expect(raiz?.profundidade).toBe(0);
      expect(raiz?.ordem_entrada).toBe(0);
      expect(raiz?.ordem_saida).toBe(2 * metricas.invocacoes - 1);
      expect(raiz?.valor).toBe(metricas.valor);

      const porEntrada = [...nos].sort((a, b) => a.ordem_entrada - b.ordem_entrada);
      expect(porEntrada.map((no) => no.id)).toEqual(nos.map((_, i) => i + 1));

      const instantes = nos
        .flatMap((no) => [no.ordem_entrada, no.ordem_saida])
        .sort((a, b) => a - b);
      expect(instantes).toEqual(instantes.map((_, i) => i));

      const contagem = { base: 0, calculado: 0, acerto_cache: 0 };
      for (const no of nos) {
        contagem[no.tipo] += 1;
        expect(no.ordem_saida).toBeGreaterThan(no.ordem_entrada);
        expect(no.descendentes_ocultos).toBeUndefined();
        if (no.tipo !== 'calculado') expect(no.filhos).toEqual([]);
        for (const filho of no.filhos) {
          expect(filho.profundidade).toBe(no.profundidade + 1);
          expect(filho.ordem_entrada).toBeGreaterThan(no.ordem_entrada);
          expect(filho.ordem_saida).toBeLessThan(no.ordem_saida);
          expect(filho.argumento).toBeLessThan(no.argumento);
        }
        const descendentes = (no.ordem_saida - no.ordem_entrada - 1) / 2;
        expect(descendentes).toBe(todosOsNos(no).length - 1);
      }
      expect(contagem.base).toBe(metricas.casos_base);
      expect(contagem.calculado).toBe(metricas.calculados);
      expect(contagem.acerto_cache).toBe(metricas.acertos_cache);

      // Pilha no passo t: nós com ordem_entrada <= t < ordem_saida.
      let maior = 0;
      for (let t = 0; t < 2 * metricas.invocacoes; t += 1) {
        const pilha = nos.filter((no) => no.ordem_entrada <= t && t < no.ordem_saida).length;
        expect(pilha).toBeLessThanOrEqual(metricas.profundidade_maxima);
        maior = Math.max(maior, pilha);
      }
      expect(maior).toBe(metricas.profundidade_maxima);
      expect(Math.max(...nos.map((no) => no.profundidade)) + 1).toBe(metricas.profundidade_maxima);
    }
  });

  it('tribonacci f(7) com cache marca os acertos na árvore em ordem', () => {
    const { raiz } = tribonacciComCacheInstrumentado(7, new Map());
    const acertos = todosOsNos(raiz as No)
      .filter((no) => no.tipo === 'acerto_cache')
      .sort((a, b) => a.ordem_entrada - b.ordem_entrada)
      .map((no) => no.argumento);
    expect(acertos).toEqual([3, 4, 3, 5, 4]);
    expect(raiz?.filhos.map((f) => [f.argumento, f.tipo])).toEqual([
      [6, 'calculado'],
      [5, 'acerto_cache'],
      [4, 'acerto_cache'],
    ]);
  });

  it('casos base não entram no cache nem viram acerto', () => {
    const { raiz } = fibonacciComCacheInstrumentado(5, new Map());
    for (const no of todosOsNos(raiz as No)) {
      if (no.argumento <= 1) expect(no.tipo).toBe('base');
    }
  });
});

describe('orçamento de nós', () => {
  const casos = COMBINACOES.flatMap(([seq, modo]) =>
    [1, 2, 3, 4, 5, 7, 10, 16, 30, 45, 46, 100].map((l) => [seq, modo, l] as const),
  );

  it.each(casos)(
    '%s %s com limite %i respeita o orçamento e mantém as métricas',
    (seq, modo, limite) => {
      const completa = INSTRUMENTADAS[seq][modo](9);
      const parcial = INSTRUMENTADAS[seq][modo](9, { limiteNos: limite });
      expect(parcial.metricas).toEqual(completa.metricas);
      expect(parcial.valor).toBe(completa.valor);
      expect(parcial.nosExibidos).toBeLessThanOrEqual(limite);
      expect(parcial.nosExibidos).toBeGreaterThanOrEqual(1);
      expect(parcial.truncada).toBe(parcial.nosExibidos < completa.nosExibidos);
      expect(() => NoSchema.parse(parcial.raiz)).not.toThrow();

      const nosParciais = todosOsNos(parcial.raiz as No);
      expect(nosParciais).toHaveLength(parcial.nosExibidos);
      const porEntrada = new Map(
        todosOsNos(completa.raiz as No).map((no) => [no.ordem_entrada, no]),
      );
      const ordenados = [...nosParciais].sort((a, b) => a.ordem_entrada - b.ordem_entrada);
      expect(ordenados.map((no) => no.id)).toEqual(ordenados.map((_, i) => i + 1));

      for (const no of nosParciais) {
        const original = porEntrada.get(no.ordem_entrada) as No;
        expect(original).toBeDefined();
        expect(no).toMatchObject({
          argumento: original.argumento,
          valor: original.valor,
          profundidade: original.profundidade,
          tipo: original.tipo,
          ordem_saida: original.ordem_saida,
        });
        if (no.descendentes_ocultos !== undefined) {
          expect(no.tipo).toBe('calculado');
          expect(no.filhos).toEqual([]);
          expect(no.descendentes_ocultos).toBe(todosOsNos(original).length - 1);
          expect(no.descendentes_ocultos).toBeGreaterThan(0);
        } else {
          expect(no.filhos.length).toBe(original.filhos.length);
        }
      }
      if (parcial.truncada) {
        expect(nosParciais.some((no) => (no.descendentes_ocultos ?? 0) > 0)).toBe(true);
      }
    },
  );

  it('limite abaixo de 1 não aloca nada e marca truncada', () => {
    const resultado = tribonacciSemCacheInstrumentado(7, { limiteNos: 0 });
    expect(resultado.raiz).toBeNull();
    expect(resultado.nosExibidos).toBe(0);
    expect(resultado.truncada).toBe(true);
    expect(resultado.metricas.invocacoes).toBe(46);
  });

  it('limite 5 em tribonacci f(7) mostra a raiz e os três filhos colapsados', () => {
    const { raiz, nosExibidos, truncada } = tribonacciSemCacheInstrumentado(7, { limiteNos: 5 });
    expect(truncada).toBe(true);
    expect(nosExibidos).toBe(4);
    expect(raiz?.filhos.map((f) => [f.argumento, f.descendentes_ocultos])).toEqual([
      [6, 24],
      [5, 12],
      [4, 6],
    ]);
  });
});
