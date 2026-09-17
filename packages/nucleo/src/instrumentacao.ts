import type { AcertoCache, Metricas, No } from '@sequencias/contrato';

export interface OpcoesInstrumentacao {
  /** Monta a árvore de chamadas (padrão true). */
  comArvore?: boolean;
  /** Orçamento de nós alocados na árvore (padrão Infinity). */
  limiteNos?: number;
  /** Chamado a cada invocação com o total acumulado (uso: amostragem de memória). */
  aoInvocar?: (invocacoes: number) => void;
}

export interface ResultadoInstrumentado {
  valor: bigint;
  metricas: Metricas;
  /** Nulo quando comArvore = false. */
  raiz: No | null;
  truncada: boolean;
  nosExibidos: number;
}

/**
 * Recorrência do tipo f(n) = combinação de f(n-1), ..., f(n-aridade), com
 * todos os casos base valendo 1. Cobre as três sequências do enunciado.
 */
export interface DefinicaoRecorrencia {
  /** Maior argumento tratado como caso base. */
  maiorCasoBase: number;
  /** Quantidade de chamadas recursivas por nó calculado. */
  aridade: number;
  /** Valor de partida da combinação (fatorial: n; somas: 0). */
  inicial: (n: number) => bigint;
  acumular: (acumulado: bigint, valorFilho: bigint) => bigint;
}

export const RECORRENCIA_FATORIAL: DefinicaoRecorrencia = {
  maiorCasoBase: 1,
  aridade: 1,
  inicial: (n) => BigInt(n),
  acumular: (acumulado, valorFilho) => acumulado * valorFilho,
};

export const RECORRENCIA_FIBONACCI: DefinicaoRecorrencia = {
  maiorCasoBase: 1,
  aridade: 2,
  inicial: () => 0n,
  acumular: (acumulado, valorFilho) => acumulado + valorFilho,
};

export const RECORRENCIA_TRIBONACCI: DefinicaoRecorrencia = {
  maiorCasoBase: 2,
  aridade: 3,
  inicial: () => 0n,
  acumular: (acumulado, valorFilho) => acumulado + valorFilho,
};

/**
 * Executa a recorrência de forma recursiva (memoização top-down quando há
 * cache) coletando métricas e, opcionalmente, a árvore de chamadas. Todo o
 * estado vive nesta chamada; nada fica em variáveis de módulo.
 *
 * Ordem dentro de cada invocação: caso base, cache, cálculo. Relógio global
 * avança 1 na entrada e 1 na saída de cada invocação. O orçamento de nós
 * reserva as vagas dos filhos ao entrar num nó calculado; se não couberem,
 * o nó fica com filhos vazios e descendentes_ocultos, mas a recursão e as
 * contagens seguem normalmente.
 */
export function executarComInstrumentacao(
  definicao: DefinicaoRecorrencia,
  n: number,
  cache: Map<number, bigint> | null,
  opcoes: OpcoesInstrumentacao = {},
): ResultadoInstrumentado {
  const comArvore = opcoes.comArvore ?? true;
  const limiteNos = opcoes.limiteNos ?? Number.POSITIVE_INFINITY;
  const aoInvocar = opcoes.aoInvocar;
  const { maiorCasoBase, aridade, inicial, acumular } = definicao;

  let relogio = 0;
  let invocacoes = 0;
  let casosBase = 0;
  let calculados = 0;
  let acertosCache = 0;
  let profundidadeMaxima = 0;
  let nosExibidos = 0;
  let mantidos = 0;
  let truncada = false;
  const invocacoesPorArgumento = new Array<number>(Math.max(n, maiorCasoBase) + 1).fill(0);
  const acertosDetalhados: AcertoCache[] = [];

  function criarNo(
    id: number,
    argumento: number,
    valor: bigint,
    profundidade: number,
    tipo: No['tipo'],
    ordemEntrada: number,
    ordemSaida: number,
    filhos: No[],
  ): No {
    return {
      id,
      argumento,
      valor: valor.toString(),
      profundidade,
      tipo,
      ordem_entrada: ordemEntrada,
      ordem_saida: ordemSaida,
      filhos,
    };
  }

  // filhosDoPai é a lista onde o nó desta invocação deve ser inserido; nulo
  // quando a subárvore não é alocada (fora do orçamento ou sem árvore).
  function visitar(
    argumento: number,
    profundidade: number,
    dentroDe: number,
    filhosDoPai: No[] | null,
  ): bigint {
    invocacoes += 1;
    invocacoesPorArgumento[argumento] = (invocacoesPorArgumento[argumento] ?? 0) + 1;
    if (profundidade + 1 > profundidadeMaxima) profundidadeMaxima = profundidade + 1;
    if (aoInvocar !== undefined) aoInvocar(invocacoes);
    const ordemEntrada = relogio;
    relogio += 1;
    // O id segue a ordem de entrada dos nós alocados (1 = raiz, sem lacunas).
    let id = 0;
    if (filhosDoPai !== null) {
      nosExibidos += 1;
      id = nosExibidos;
    }

    if (argumento <= maiorCasoBase) {
      casosBase += 1;
      const ordemSaida = relogio;
      relogio += 1;
      if (filhosDoPai !== null) {
        filhosDoPai.push(
          criarNo(id, argumento, 1n, profundidade, 'base', ordemEntrada, ordemSaida, []),
        );
      }
      return 1n;
    }

    if (cache !== null) {
      const guardado = cache.get(argumento);
      if (guardado !== undefined) {
        acertosCache += 1;
        acertosDetalhados.push({ argumento, dentro_de: dentroDe });
        const ordemSaida = relogio;
        relogio += 1;
        if (filhosDoPai !== null) {
          filhosDoPai.push(
            criarNo(
              id,
              argumento,
              guardado,
              profundidade,
              'acerto_cache',
              ordemEntrada,
              ordemSaida,
              [],
            ),
          );
        }
        return guardado;
      }
    }

    calculados += 1;
    let filhos: No[] | null = null;
    if (filhosDoPai !== null) {
      if (mantidos + aridade > limiteNos) {
        truncada = true;
      } else {
        mantidos += aridade;
        filhos = [];
      }
    }

    let valor = inicial(argumento);
    for (let i = 1; i <= aridade; i += 1) {
      valor = acumular(valor, visitar(argumento - i, profundidade + 1, argumento, filhos));
    }
    if (cache !== null) cache.set(argumento, valor);

    const ordemSaida = relogio;
    relogio += 1;
    if (filhosDoPai !== null) {
      const no = criarNo(
        id,
        argumento,
        valor,
        profundidade,
        'calculado',
        ordemEntrada,
        ordemSaida,
        filhos ?? [],
      );
      if (filhos === null) no.descendentes_ocultos = (ordemSaida - ordemEntrada - 1) / 2;
      filhosDoPai.push(no);
    }
    return valor;
  }

  const alocarRaiz = comArvore && limiteNos >= 1;
  const raizes: No[] | null = alocarRaiz ? [] : null;
  if (alocarRaiz) mantidos = 1;
  const valor = visitar(n, 0, n, raizes);
  if (comArvore && !alocarRaiz) truncada = true;

  const valorTexto = valor.toString();
  const porArgumento: Metricas['invocacoes_por_argumento'] = [];
  for (let argumento = invocacoesPorArgumento.length - 1; argumento >= 0; argumento -= 1) {
    const quantidade = invocacoesPorArgumento[argumento] ?? 0;
    if (quantidade > 0) porArgumento.push({ argumento, invocacoes: quantidade });
  }

  return {
    valor,
    metricas: {
      valor: valorTexto,
      digitos: valorTexto.length,
      invocacoes,
      chamadas_recursivas: invocacoes - 1,
      casos_base: casosBase,
      calculados,
      acertos_cache: acertosCache,
      entradas_cache: cache?.size ?? 0,
      profundidade_maxima: profundidadeMaxima,
      invocacoes_por_argumento: porArgumento,
      acertos_detalhados: acertosDetalhados,
    },
    raiz: raizes?.[0] ?? null,
    truncada,
    nosExibidos,
  };
}
