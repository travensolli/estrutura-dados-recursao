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

interface ResultadoMock {
  metricas: Metricas;
  raiz: No | null;
}

/* Sem árvore o consumo fica em O(profundidade): é o caminho das rotas que só
   precisam de métricas, onde n grande geraria milhões de nós. */
function rodar(sequencia: Sequencia, n: number, modo: Modo, comArvore: boolean): ResultadoMock {
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

  function f(k: number, profundidade: number, pai: number): { valor: bigint; no: No | null } {
    invocacoes += 1;
    porArgumento.set(k, (porArgumento.get(k) ?? 0) + 1);
    profundidadeMaxima = Math.max(profundidadeMaxima, profundidade + 1);
    const no: No | null = comArvore
      ? {
          id: ++proximoId,
          argumento: k,
          valor: '1',
          profundidade,
          tipo: 'base',
          ordem_entrada: relogio++,
          ordem_saida: 0,
          filhos: [],
        }
      : null;
    let valor = 1n;

    if (ehBase[sequencia](k)) {
      casosBase += 1;
    } else if (comCache && cache.has(k)) {
      valor = cache.get(k) ?? 1n;
      acertos += 1;
      acertosDetalhados.push({ argumento: k, dentro_de: pai });
      if (no) {
        no.tipo = 'acerto_cache';
        no.valor = valor.toString();
      }
    } else {
      const valores = argumentosFilhos[sequencia](k).map((j) => {
        const filho = f(j, profundidade + 1, k);
        if (no && filho.no) no.filhos.push(filho.no);
        return filho.valor;
      });
      valor = combinar[sequencia](k, valores);
      calculados += 1;
      if (comCache) cache.set(k, valor);
      if (no) {
        no.tipo = 'calculado';
        no.valor = valor.toString();
      }
    }
    if (no) no.ordem_saida = relogio++;
    return { valor, no };
  }

  const raiz = f(n, 0, n);
  const texto = raiz.valor.toString();
  const metricas: Metricas = {
    valor: texto,
    digitos: texto.length,
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
  return { metricas, raiz: raiz.no };
}

/** Execução completa com a árvore de chamadas; use só onde a árvore é exibida. */
export function executarMock(sequencia: Sequencia, n: number, modo: Modo): ExecucaoMock {
  const { metricas, raiz } = rodar(sequencia, n, modo, true);
  if (raiz === null) throw new Error('árvore não montada');
  return { metricas, raiz };
}

/** Só as métricas, sem alocar um nó por invocação. */
export function metricasMock(sequencia: Sequencia, n: number, modo: Modo): Metricas {
  return rodar(sequencia, n, modo, false).metricas;
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
