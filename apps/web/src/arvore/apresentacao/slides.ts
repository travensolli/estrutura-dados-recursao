/** Roteiro fixo da apresentação: Tribonacci f(7) com e sem cache. */
export const SEQUENCIA_APRESENTACAO = 'tribonacci' as const;
export const N_APRESENTACAO = 7;
/** Orçamento folgado: a árvore inteira precisa caber na resposta. */
export const LIMITE_NOS_APRESENTACAO = 2000;

export interface Slide {
  id: string;
  /** Rótulo curto na trilha de progresso. */
  nome: string;
  titulo: string;
  /** Linha abaixo do título; o slide que se explica sozinho fica sem ela. */
  resumo?: string;
  /** O slide usa as setas na própria reprodução: a trilha anda com PageUp e PageDown. */
  setasOcupadas?: boolean;
}

export const SLIDES: readonly Slide[] = [
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
    resumo:
      'Passe o ponteiro por um nó ou por uma coluna da contagem para ver todas as repetições.',
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
  },
  {
    id: 'conclusao',
    nome: 'Conclusão',
    titulo: 'Conclusão',
    resumo:
      'O cache gasta memória para evitar chamadas repetidas, e só compensa quando elas se repetem.',
  },
];

export const TOTAL_SLIDES = SLIDES.length;
export const PARAMETRO_SLIDE = 'slide';

function limitar(indice: number): number {
  if (!Number.isFinite(indice)) return 0;
  return Math.min(TOTAL_SLIDES - 1, Math.max(0, Math.trunc(indice)));
}

/** O slide vai na URL em base 1, como o público lê no rodapé. */
export function lerSlide(parametros: URLSearchParams): number {
  const bruto = parametros.get(PARAMETRO_SLIDE);
  if (bruto === null) return 0;
  const porNumero = Number(bruto);
  if (Number.isInteger(porNumero)) return limitar(porNumero - 1);
  const porId = SLIDES.findIndex((slide) => slide.id === bruto);
  return porId >= 0 ? porId : 0;
}

export function escreverSlide(indice: number): Record<string, string> {
  return { [PARAMETRO_SLIDE]: String(limitar(indice) + 1) };
}

export function slidePorIndice(indice: number): Slide {
  return SLIDES[limitar(indice)] as Slide;
}
