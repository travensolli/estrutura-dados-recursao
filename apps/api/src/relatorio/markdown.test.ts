import { type CompararResposta, type Modo, type Sequencia } from '@sequencias/contrato';
import { describe, expect, it } from 'vitest';
import { type DadosRelatorio } from './coleta';
import {
  abreviarValor,
  formatarBytes,
  formatarDuracao,
  formatarFator,
  formatarInteiro,
  montarRelatorio,
} from './markdown';

function tempo(mediana: number) {
  return {
    mediana_ns: mediana,
    media_ns: mediana * 1.1,
    minimo_ns: mediana * 0.9,
    maximo_ns: mediana * 1.3,
    desvio_padrao_ns: mediana * 0.05,
    repeticoes: 5,
    aquecimentos: 3,
    execucoes_por_repeticao: 1,
  };
}

function memoria(retida: number, entradas: number) {
  return {
    retida_cache_bytes: retida,
    pico_heap_bytes: 5_000_000 + retida,
    intervalo_amostragem: 10_000,
    entradas_cache: entradas,
    profundidade_maxima: 6,
    repeticoes: 3,
  };
}

interface Caso {
  sequencia: Sequencia;
  n: number;
  valor: string;
  invocacoes: Record<Modo, number>;
  medianas: Record<Modo, number>;
  retidas: Record<Modo, number>;
  entradas: number;
}

function comparacao(caso: Caso): CompararResposta {
  const retidaComCache = caso.retidas.com_cache;
  return {
    sequencia: caso.sequencia,
    n: caso.n,
    valor: caso.valor,
    digitos: caso.valor.length,
    repeticoes: 5,
    tempo: { sem_cache: tempo(caso.medianas.sem_cache), com_cache: tempo(caso.medianas.com_cache) },
    memoria: {
      sem_cache: memoria(caso.retidas.sem_cache, 0),
      com_cache: memoria(retidaComCache, caso.entradas),
    },
    invocacoes: caso.invocacoes,
    fator_aceleracao: caso.medianas.sem_cache / caso.medianas.com_cache,
    chamadas_evitadas: caso.invocacoes.sem_cache - caso.invocacoes.com_cache,
    diferenca_memoria_bytes: retidaComCache - caso.retidas.sem_cache,
    ordem_execucao: ['sem_cache', 'com_cache'],
    ambiente: {
      node: '22.22.1',
      v8: '12.4.254.21',
      plataforma: 'linux',
      arquitetura: 'x64',
      cpu: 'CPU de teste',
      nucleos: 8,
      memoria_total_bytes: 16 * 1024 ** 3,
    },
  };
}

const TRIBONACCI = comparacao({
  sequencia: 'tribonacci',
  n: 7,
  valor: '31',
  invocacoes: { sem_cache: 46, com_cache: 16 },
  medianas: { sem_cache: 2_000, com_cache: 500 },
  retidas: { sem_cache: 0, com_cache: 480 },
  entradas: 5,
});

const FATORIAL = comparacao({
  sequencia: 'fatorial',
  n: 10,
  valor: '3628800',
  invocacoes: { sem_cache: 10, com_cache: 10 },
  medianas: { sem_cache: 900, com_cache: 1_000 },
  retidas: { sem_cache: 0, com_cache: 1_024 },
  entradas: 9,
});

const DADOS: DadosRelatorio = {
  gerado_em: '2026-09-17T15:04:05.000Z',
  duracao_total_ms: 12_345,
  argumentos_node: ['--expose-gc'],
  plano: {
    repeticoes: 5,
    prazo_ms: 60_000,
    casos: [
      { sequencia: 'fatorial', ns: [10] },
      { sequencia: 'tribonacci', ns: [7] },
    ],
  },
  parametros: {
    duracao_minima_bloco_ns: 200_000_000,
    orcamento_comparacao_ns: 8_000_000_000,
    repeticoes_memoria: 3,
    intervalo_amostragem: 10_000,
    prazo_ms: 60_000,
    pilha_mb: 64,
  },
  comparacoes: [FATORIAL, TRIBONACCI],
};

describe('formatação', () => {
  it('escolhe a unidade de tempo pela ordem de grandeza', () => {
    expect(formatarDuracao(450)).toBe('450 ns');
    expect(formatarDuracao(1_500)).toBe('1,50 µs');
    expect(formatarDuracao(2_500_000)).toBe('2,50 ms');
    expect(formatarDuracao(3_000_000_000)).toBe('3,000 s');
  });

  it('escreve bytes em unidades binárias', () => {
    expect(formatarBytes(512)).toBe('512 B');
    expect(formatarBytes(2048)).toBe('2,0 KiB');
    expect(formatarBytes(16_148_856)).toBe('15,40 MiB');
    expect(formatarBytes(-1024)).toBe('-1,0 KiB');
    expect(formatarBytes(16 * 1024 ** 3)).toBe('16,00 GiB');
  });

  it('usa menos casas decimais conforme o fator cresce', () => {
    expect(formatarFator(0.93)).toBe('0,93×');
    expect(formatarFator(12.34)).toBe('12,3×');
    expect(formatarFator(190_295.4)).toBe('190.295×');
  });

  it('agrupa milhares e abrevia valores enormes', () => {
    expect(formatarInteiro(29_860_703)).toBe('29.860.703');
    expect(abreviarValor('3628800', 7)).toBe('3628800');
    expect(abreviarValor('1'.repeat(40), 40)).toBe('11111111... (40 dígitos)');
  });
});

describe('montarRelatorio', () => {
  const texto = montarRelatorio(DADOS);

  it('registra a máquina, as versões e os parâmetros usados', () => {
    expect(texto).toContain('## Máquina e versões');
    expect(texto).toContain('CPU de teste');
    expect(texto).toContain('| Node | 22.22.1 |');
    expect(texto).toContain('| V8 | 12.4.254.21 |');
    expect(texto).toContain('`--expose-gc`');
    expect(texto).toContain('## Parâmetros da medição');
    expect(texto).toContain('| Pilha do worker | 64 MB |');
  });

  it('traz uma seção por sequência com as três tabelas', () => {
    for (const titulo of ['## Fatorial', '## Tribonacci']) expect(texto).toContain(titulo);
    expect(texto.match(/### Invocações e tempo/g)).toHaveLength(2);
    expect(texto.match(/### Memória/g)).toHaveLength(2);
    expect(texto.match(/### Dispersão das medições de tempo/g)).toHaveLength(2);
  });

  it('mostra as 30 chamadas evitadas de tribonacci f(7)', () => {
    expect(texto).toContain('| 7 | 31 | 46 | 16 | 30 |');
    expect(texto).toContain('o cache evita 30 chamadas');
  });

  it('diz com todas as letras que o fatorial não ganha com cache', () => {
    expect(texto).toContain('O cache não evita nenhuma chamada');
    expect(texto).toContain('Numa execução isolada o cache só acrescenta memória.');
    expect(texto).toContain('| 10 | 3628800 | 10 | 10 | 0 |');
  });

  it('não deixa buracos de formatação no texto gerado', () => {
    expect(texto).not.toMatch(/undefined|NaN|Infinity/);
  });
});
