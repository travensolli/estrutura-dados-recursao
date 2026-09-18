/** Roteiro fixo da apresentação: Tribonacci f(7) com e sem cache. */
export const SEQUENCIA_APRESENTACAO = 'tribonacci' as const;
export const N_APRESENTACAO = 7;
/** Orçamento folgado: a árvore inteira precisa caber na resposta. */
export const LIMITE_NOS_APRESENTACAO = 2000;

export interface Etapa {
  id: string;
  /** Rótulo curto na trilha de progresso. */
  nome: string;
  titulo: string;
  resumo: string;
  /** A etapa usa as setas na própria reprodução: a trilha anda com PageUp e PageDown. */
  setasOcupadas?: boolean;
}

export const ETAPAS: readonly Etapa[] = [
  {
    id: 'funcao',
    nome: 'A função',
    titulo: 'Tribonacci, definido por ele mesmo',
    resumo: 'Cada termo é a soma dos três anteriores, e três casos base param a recursão.',
  },
  {
    id: 'sem-cache',
    nome: 'Sem cache',
    titulo: 'Sem cache, o mesmo argumento volta muitas vezes',
    resumo: 'Passe o ponteiro por um nó ou por uma linha da tabela para ver todas as repetições.',
  },
  {
    id: 'cache',
    nome: 'O cache',
    titulo: 'O cache calcula uma vez e guarda',
    resumo: 'A primeira chamada de cada argumento calcula; as seguintes voltam do dicionário.',
    setasOcupadas: true,
  },
  {
    id: 'com-cache',
    nome: 'Com cache',
    titulo: 'O que deixou de ser chamado',
    resumo: 'O tracejado é a subárvore que o dicionário evitou em cada acerto.',
  },
  {
    id: 'conta',
    nome: 'A conta',
    titulo: 'A conta das chamadas evitadas',
    resumo: 'Duas provas independentes para o mesmo número.',
  },
  {
    id: 'geral',
    nome: 'Generalizando',
    titulo: 'Exponencial contra linear',
    resumo: 'O cache troca tempo por memória, e nem toda sequência ganha com isso.',
  },
];

export const TOTAL_ETAPAS = ETAPAS.length;
export const PARAMETRO_ETAPA = 'etapa';

function limitar(indice: number): number {
  if (!Number.isFinite(indice)) return 0;
  return Math.min(TOTAL_ETAPAS - 1, Math.max(0, Math.trunc(indice)));
}

/** A etapa vai na URL em base 1, como o público lê no rodapé. */
export function lerEtapa(parametros: URLSearchParams): number {
  const bruto = parametros.get(PARAMETRO_ETAPA);
  if (bruto === null) return 0;
  const porNumero = Number(bruto);
  if (Number.isInteger(porNumero)) return limitar(porNumero - 1);
  const porId = ETAPAS.findIndex((etapa) => etapa.id === bruto);
  return porId >= 0 ? porId : 0;
}

export function escreverEtapa(indice: number): Record<string, string> {
  return { [PARAMETRO_ETAPA]: String(limitar(indice) + 1) };
}

export function etapaPorIndice(indice: number): Etapa {
  return ETAPAS[limitar(indice)] as Etapa;
}
