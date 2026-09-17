import type { No } from '@sequencias/contrato';
import { hierarchy, tree } from 'd3-hierarchy';
import { descendentesDe } from './modelo';
import { caminhoDaLigacao } from './formas';

export const DIMENSOES = {
  largura: 112,
  /** Casos base só mostram f(k) e o valor 1: cabem em menos espaço. */
  larguraBase: 76,
  altura: 46,
  espacoX: 16,
  espacoY: 48,
  margem: 28,
} as const;

export function larguraDoNo(tipo: No['tipo']): number {
  return tipo === 'base' ? DIMENSOES.larguraBase : DIMENSOES.largura;
}

export interface NoPosicionado {
  no: No;
  x: number;
  y: number;
  paiId: number | null;
  filhosVisiveis: number[];
  /** Recolhido pelo usuário. */
  recolhido: boolean;
  /** Colapsado pelo orçamento de nós da resposta. */
  podadoPorOrcamento: boolean;
  /** Descendentes escondidos por qualquer um dos dois motivos. */
  ocultos: number;
}

export interface Ligacao {
  id: string;
  caminho: string;
  argumentoDestino: number;
}

export interface Caixa {
  x: number;
  y: number;
  largura: number;
  altura: number;
}

export interface LayoutArvore {
  nos: NoPosicionado[];
  ligacoes: Ligacao[];
  caixa: Caixa;
  /** Posição horizontal da raiz: âncora quando a árvore não cabe inteira. */
  raizX: number;
  porId: Map<number, NoPosicionado>;
  /** Ordem de entrada dos nós visíveis, usada na navegação por teclado. */
  ordem: number[];
}

/** Posiciona só os nós visíveis; recolher um nó não recalcula a resposta. */
export function calcularLayout(raiz: No, recolhidos: ReadonlySet<number>): LayoutArvore {
  const raizHierarquia = hierarchy<No>(raiz, (no) => (recolhidos.has(no.id) ? [] : no.filhos));
  const passoX = DIMENSOES.largura + DIMENSOES.espacoX;
  const disposicao = tree<No>()
    .nodeSize([passoX, DIMENSOES.altura + DIMENSOES.espacoY])
    .separation((a, b) => {
      const vao = (larguraDoNo(a.data.tipo) + larguraDoNo(b.data.tipo)) / 2 + DIMENSOES.espacoX;
      return (vao / passoX) * (a.parent === b.parent ? 1 : 1.25);
    });
  const posicionada = disposicao(raizHierarquia);

  const nos: NoPosicionado[] = [];
  const ligacoes: Ligacao[] = [];
  let minX = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let maxY = 0;

  for (const ponto of posicionada.descendants()) {
    const no = ponto.data;
    const recolhido = recolhidos.has(no.id) && no.filhos.length > 0;
    const podadoPorOrcamento = (no.descendentes_ocultos ?? 0) > 0;
    const ocultos = recolhido
      ? descendentesDe(no)
      : podadoPorOrcamento
        ? (no.descendentes_ocultos ?? 0)
        : 0;
    nos.push({
      no,
      x: ponto.x,
      y: ponto.y,
      paiId: ponto.parent?.data.id ?? null,
      filhosVisiveis: (ponto.children ?? []).map((filho) => filho.data.id),
      recolhido,
      podadoPorOrcamento,
      ocultos,
    });
    minX = Math.min(minX, ponto.x);
    maxX = Math.max(maxX, ponto.x);
    maxY = Math.max(maxY, ponto.y);
  }

  for (const ligacao of posicionada.links()) {
    ligacoes.push({
      id: `${ligacao.source.data.id}-${ligacao.target.data.id}`,
      caminho: caminhoDaLigacao(
        ligacao.source.x,
        ligacao.source.y,
        ligacao.target.x,
        ligacao.target.y,
        DIMENSOES.altura,
      ),
      argumentoDestino: ligacao.target.data.argumento,
    });
  }

  const meiaLargura = DIMENSOES.largura / 2 + DIMENSOES.margem;
  const meiaAltura = DIMENSOES.altura / 2 + DIMENSOES.margem;
  const caixa: Caixa = {
    x: minX - meiaLargura,
    y: -meiaAltura,
    largura: maxX - minX + 2 * meiaLargura,
    altura: maxY + 2 * meiaAltura,
  };

  nos.sort((a, b) => a.no.ordem_entrada - b.no.ordem_entrada);
  return {
    nos,
    ligacoes,
    caixa,
    raizX: posicionada.x,
    porId: new Map(nos.map((posicionado) => [posicionado.no.id, posicionado])),
    ordem: nos.map((posicionado) => posicionado.no.id),
  };
}

/**
 * Escala e deslocamento do enquadramento. Abaixo de `escalaMinima` o desenho
 * ficaria ilegível: nesse caso mostra o topo da árvore, alinhado pela raiz.
 */
export function enquadrar(
  caixa: Caixa,
  raizX: number,
  largura: number,
  altura: number,
  escalaMinima: number,
  escalaMaxima: number,
): { k: number; x: number; y: number } {
  if (largura <= 0 || altura <= 0 || caixa.largura <= 0 || caixa.altura <= 0) {
    return { k: 1, x: 0, y: 0 };
  }
  const bruta = Math.min(largura / caixa.largura, altura / caixa.altura);
  const k = Math.min(escalaMaxima, Math.max(escalaMinima, bruta));
  const cabe = k <= bruta;
  return {
    k,
    x: cabe ? largura / 2 - k * (caixa.x + caixa.largura / 2) : largura / 2 - k * raizX,
    y: cabe ? altura / 2 - k * (caixa.y + caixa.altura / 2) : -k * caixa.y,
  };
}
