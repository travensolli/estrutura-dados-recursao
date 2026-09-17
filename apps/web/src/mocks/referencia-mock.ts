// Implementação simplificada usada SOMENTE pelos mocks MSW enquanto a API real
// não existe. Não é o núcleo oficial e será removida na integração (Fase 3).
import type { AcertoCache, Metricas, Modo, No, Sequencia } from '@sequencias/contrato';

const ehBase: Record<Sequencia, (k: number) => boolean> = {
  fatorial: (k) => k <= 1,
  fibonacci: (k) => k <= 1,
  tribonacci: (k) => k <= 2,
};
const argumentosFilhos: Record<Sequencia, (k: number) => number[]> = {
  fatorial: (k) => [k - 1],
  fibonacci: (k) => [k - 1, k - 2],
  tribonacci: (k) => [k - 1, k - 2, k - 3],
};
const combinar: Record<Sequencia, (k: number, valores: bigint[]) => bigint> = {
  fatorial: (k, [a]) => BigInt(k) * (a ?? 1n),
  fibonacci: (_k, valores) => valores.reduce((s, v) => s + v, 0n),
  tribonacci: (_k, valores) => valores.reduce((s, v) => s + v, 0n),
};

export interface ExecucaoMock {
  metricas: Metricas;
  raiz: No;
}

export function executarMock(sequencia: Sequencia, n: number, modo: Modo): ExecucaoMock {
  const comCache = modo === 'com_cache';
  const cache = new Map<number, bigint>();
  let relogio = 0;
  let proximoId = 0;
  let invocacoes = 0;
  let casosBase = 0;
  let calculados = 0;
  let acertos = 0;
  let profundidadeMaxima = 0;
  const porArgumento = new Map<number, number>();
  const acertosDetalhados: AcertoCache[] = [];

  function f(k: number, profundidade: number, pai: number): No {
    invocacoes += 1;
    porArgumento.set(k, (porArgumento.get(k) ?? 0) + 1);
    profundidadeMaxima = Math.max(profundidadeMaxima, profundidade + 1);
    const no: No = {
      id: ++proximoId,
      argumento: k,
      valor: '1',
      profundidade,
      tipo: 'base',
      ordem_entrada: relogio++,
      ordem_saida: 0,
      filhos: [],
    };
    if (ehBase[sequencia](k)) {
      casosBase += 1;
    } else if (comCache && cache.has(k)) {
      no.tipo = 'acerto_cache';
      no.valor = String(cache.get(k));
      acertos += 1;
      acertosDetalhados.push({ argumento: k, dentro_de: pai });
    } else {
      no.tipo = 'calculado';
      const valores = argumentosFilhos[sequencia](k).map((j) => {
        const filho = f(j, profundidade + 1, k);
        no.filhos.push(filho);
        return BigInt(filho.valor);
      });
      const valor = combinar[sequencia](k, valores);
      no.valor = valor.toString();
      calculados += 1;
      if (comCache) cache.set(k, valor);
    }
    no.ordem_saida = relogio++;
    return no;
  }

  const raiz = f(n, 0, n);
  const metricas: Metricas = {
    valor: raiz.valor,
    digitos: raiz.valor.length,
    invocacoes,
    chamadas_recursivas: invocacoes - 1,
    casos_base: casosBase,
    calculados,
    acertos_cache: acertos,
    entradas_cache: cache.size,
    profundidade_maxima: profundidadeMaxima,
    invocacoes_por_argumento: [...porArgumento.entries()]
      .sort((a, b) => b[0] - a[0])
      .map(([argumento, quantidade]) => ({ argumento, invocacoes: quantidade })),
    acertos_detalhados: acertosDetalhados,
  };
  return { metricas, raiz };
}

/** Mantém os primeiros nós em ordem de entrada, até o limite, e colapsa o restante. */
export function truncarArvore(
  raiz: No,
  limite: number,
): { raiz: No; truncada: boolean; nos: number } {
  let mantidos = 0;
  let truncada = false;
  function copiar(no: No, jaContado: boolean): No {
    if (!jaContado) mantidos += 1;
    const copia: No = { ...no, filhos: [] };
    if (no.filhos.length === 0) return copia;
    if (mantidos + no.filhos.length > limite) {
      truncada = true;
      copia.descendentes_ocultos = (no.ordem_saida - no.ordem_entrada - 1) / 2;
      return copia;
    }
    mantidos += no.filhos.length;
    copia.filhos = no.filhos.map((filho) => copiar(filho, true));
    return copia;
  }
  const copia = copiar(raiz, false);
  return { raiz: copia, truncada, nos: mantidos };
}

/** Tempo simulado em nanossegundos, proporcional ao número de invocações. */
export function tempoSimuladoNs(invocacoes: number, digitos: number): number {
  return Math.round(invocacoes * 85 + digitos * 12 + 400);
}
