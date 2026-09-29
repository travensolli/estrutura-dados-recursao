import type { No } from '@sequencias/contrato';

/**
 * Figuras SVG do relatório: gráficos de linha (um painel por sequência) e a
 * árvore de chamadas de Tribonacci f(7) colorida pelo destino de cada nó.
 *
 * Tudo aqui gera SVG como texto, sem biblioteca e sem script: o relatório
 * precisa abrir em qualquer navegador, de um arquivo só, sem servidor.
 */

/* ------------------------------------------------------------------ */
/* Classificação da árvore sem cache                                   */
/* ------------------------------------------------------------------ */

/**
 * O que acontece com um nó da árvore **sem cache** quando o cache é ligado.
 *
 * - `calculado`: primeira vez que o argumento aparece; executa e guarda.
 * - `base`: caso base; responde 1 direto, sem consultar nem gravar o cache.
 * - `acerto`: o argumento já está guardado; retorna sem visitar os filhos.
 * - `evitado`: o nó fica sob um acerto, então com cache ele nunca acontece.
 */
export type EstadoNo = 'calculado' | 'base' | 'acerto' | 'evitado';

export interface NoClassificado {
  argumento: number;
  valor: string;
  profundidade: number;
  estado: EstadoNo;
  filhos: NoClassificado[];
}

/** Uma subárvore que um acerto de cache poda. */
export interface Poda {
  argumento: number;
  /** Argumento da chamada que continha o acerto. */
  dentroDe: number;
  /** Invocações que deixam de acontecer (a subárvore menos o próprio nó). */
  evitadas: number;
}

export interface ArvoreClassificada {
  raiz: NoClassificado;
  totais: Record<EstadoNo, number>;
  podas: Poda[];
}

function contarNos(no: NoClassificado): number {
  return no.filhos.reduce((total, filho) => total + contarNos(filho), 1);
}

/**
 * Percorre a árvore sem cache na ordem da execução e marca cada nó com o que
 * o cache faria ali. Um argumento visto antes vira acerto e tudo abaixo dele
 * vira evitado, porque o acerto retorna sem descer.
 */
export function classificarPeloCache(raiz: No): ArvoreClassificada {
  const vistos = new Set<number>();
  const totais: Record<EstadoNo, number> = { calculado: 0, base: 0, acerto: 0, evitado: 0 };
  const podas: Poda[] = [];

  const visitar = (no: No, paiArgumento: number | null, sobAcerto: boolean): NoClassificado => {
    let estado: EstadoNo;
    if (sobAcerto) estado = 'evitado';
    else if (no.tipo === 'base') estado = 'base';
    else if (vistos.has(no.argumento)) estado = 'acerto';
    else {
      estado = 'calculado';
      vistos.add(no.argumento);
    }
    totais[estado] += 1;

    const filhos = no.filhos.map((filho) =>
      visitar(filho, no.argumento, sobAcerto || estado === 'acerto'),
    );
    const classificado: NoClassificado = {
      argumento: no.argumento,
      valor: no.valor,
      profundidade: no.profundidade,
      estado,
      filhos,
    };

    if (estado === 'acerto') {
      podas.push({
        argumento: no.argumento,
        dentroDe: paiArgumento ?? no.argumento,
        evitadas: contarNos(classificado) - 1,
      });
    }
    return classificado;
  };

  return { raiz: visitar(raiz, null, false), totais, podas };
}

/* ------------------------------------------------------------------ */
/* Estilo compartilhado pela página e pelas figuras                    */
/* ------------------------------------------------------------------ */

export const CORES_CLARO = `
  --superficie: #fcfcfb; --pagina: #f4f4f1;
  --texto: #14140f; --texto-suave: #52514e; --apagado: #8a8880;
  --grade: #e3e2da; --eixo: #c2c1b6; --borda: rgba(20, 20, 15, 0.12);
  --serie-1: #2a6fd6; --serie-2: #e0662c;
  --sobre-serie-1: #ffffff; --sobre-serie-2: #14140f;`;

export const CORES_ESCURO = `
  --superficie: #1b1b19; --pagina: #101010;
  --texto: #f7f7f4; --texto-suave: #c4c3ba; --apagado: #8a8880;
  --grade: #2e2e2b; --eixo: #3b3b37; --borda: rgba(255, 255, 255, 0.12);
  --serie-1: #4b90ea; --serie-2: #ef7c43;
  --sobre-serie-1: #101010; --sobre-serie-2: #101010;`;

/** Regras usadas dentro dos SVGs; a página repete este bloco. */
export const ESTILO_SVG = `
  .fundo { fill: var(--superficie); }
  .titulo-painel { fill: var(--texto); font-size: 13px; font-weight: 600; }
  .grade { stroke: var(--grade); stroke-width: 1; }
  .linha-base { stroke: var(--eixo); stroke-width: 1; }
  .eixo { fill: var(--apagado); font-size: 11px; font-variant-numeric: tabular-nums; }
  .legenda-texto { fill: var(--texto-suave); font-size: 12px; }
  .serie { fill: none; stroke-width: 2; stroke-linejoin: round; stroke-linecap: round; }
  .serie.s1, .chave-linha.s1 { stroke: var(--serie-1); }
  .serie.s2, .chave-linha.s2 { stroke: var(--serie-2); }
  .chave-linha { stroke-width: 2; stroke-linecap: round; }
  .ponto { stroke: var(--superficie); stroke-width: 2; }
  .ponto.s1 { fill: var(--serie-1); }
  .ponto.s2 { fill: var(--serie-2); }
  .aresta { stroke: var(--eixo); stroke-width: 1.5; }
  .aresta.evitado { stroke: var(--grade); }
  .no circle { stroke: var(--superficie); stroke-width: 2; }
  .no.calculado circle { fill: var(--serie-1); }
  .no.acerto circle { fill: var(--serie-2); }
  .no.base circle { fill: var(--superficie); stroke: var(--eixo); stroke-width: 1.5; }
  .no.evitado circle { fill: var(--superficie); stroke: var(--grade); stroke-width: 1; }
  .no text { font-size: 11px; font-weight: 600; text-anchor: middle; dominant-baseline: central; }
  .no.calculado text { fill: var(--sobre-serie-1); }
  .no.acerto text { fill: var(--sobre-serie-2); }
  .no.base text { fill: var(--texto-suave); }
  .no.evitado text { fill: var(--apagado); font-weight: 400; }`;

/* ------------------------------------------------------------------ */
/* Painel de linhas                                                    */
/* ------------------------------------------------------------------ */

const PAINEL_L = 320;
const PAINEL_A = 230;
const MARGEM = { topo: 34, direita: 14, base: 42, esquerda: 60 };

export interface PontoGrafico {
  x: number;
  y: number;
  /** Texto do tooltip nativo do navegador. */
  rotulo: string;
}

export interface SerieGrafico {
  nome: string;
  classe: 's1' | 's2';
  pontos: PontoGrafico[];
}

export interface ConfigPainel {
  titulo: string;
  series: SerieGrafico[];
  escala: 'log' | 'linear';
  formatarEixo: (valor: number) => string;
}

/** Passo "redondo" (1, 2 ou 5 × 10^k) para o eixo linear. */
function passoRedondo(bruto: number): number {
  const potencia = 10 ** Math.floor(Math.log10(bruto));
  const fator = bruto / potencia;
  const escolhido = fator <= 1 ? 1 : fator <= 2 ? 2 : fator <= 5 ? 5 : 10;
  return escolhido * potencia;
}

/** Conteúdo SVG de um painel, sem a tag <svg>. */
export function desenharPainel(cfg: ConfigPainel): string {
  const esquerda = MARGEM.esquerda;
  const direita = PAINEL_L - MARGEM.direita;
  const topo = MARGEM.topo;
  const base = PAINEL_A - MARGEM.base;

  const todosX = cfg.series.flatMap((serie) => serie.pontos.map((ponto) => ponto.x));
  const todosY = cfg.series.flatMap((serie) => serie.pontos.map((ponto) => ponto.y));
  if (todosX.length === 0) return '';

  const xMin = Math.min(...todosX);
  const xMax = Math.max(...todosX);
  const posX = (valor: number) =>
    esquerda + 12 + ((valor - xMin) / (xMax - xMin || 1)) * (direita - esquerda - 24);

  const marcas: number[] = [];
  let posY: (valor: number) => number;
  if (cfg.escala === 'log') {
    const piso = (valor: number) => Math.max(valor, 1e-9);
    const expMin = Math.floor(Math.log10(piso(Math.min(...todosY))));
    let expMax = Math.ceil(Math.log10(piso(Math.max(...todosY))));
    if (expMax === expMin) expMax += 1;
    for (let exp = expMin; exp <= expMax; exp += 1) marcas.push(10 ** exp);
    posY = (valor) =>
      base - ((Math.log10(piso(valor)) - expMin) / (expMax - expMin)) * (base - topo);
  } else {
    const passo = passoRedondo(Math.max(...todosY, 1) / 4);
    const yMax = Math.ceil(Math.max(...todosY, 1) / passo) * passo;
    for (let valor = 0; valor <= yMax + passo / 2; valor += passo) marcas.push(valor);
    posY = (valor) => base - (valor / yMax) * (base - topo);
  }

  let svg = `<text class="titulo-painel" x="0" y="14">${cfg.titulo}</text>`;
  for (const marca of marcas) {
    const y = posY(marca).toFixed(1);
    svg += `<line class="grade" x1="${esquerda}" x2="${direita}" y1="${y}" y2="${y}"/>`;
    svg += `<text class="eixo" x="${esquerda - 8}" y="${y}" dy="0.32em" text-anchor="end">${cfg.formatarEixo(marca)}</text>`;
  }
  svg += `<line class="linha-base" x1="${esquerda}" x2="${direita}" y1="${base}" y2="${base}"/>`;

  /*
   * Os n não são igualmente espaçados (o fatorial vai de 10 a 5.000), então
   * rotular todos empilharia texto sobre texto. O primeiro e o último sempre
   * aparecem; os do meio só entram se couberem com folga.
   */
  const rotulosX = [...new Set(todosX)].sort((a, b) => a - b);
  const ESPACO_MINIMO = 34;
  const xFinal = posX(rotulosX[rotulosX.length - 1] ?? 0);
  let ultimoRotulo = -Infinity;
  rotulosX.forEach((valor, indice) => {
    const x = posX(valor);
    const ehUltimo = indice === rotulosX.length - 1;
    if (!ehUltimo && (x - ultimoRotulo < ESPACO_MINIMO || xFinal - x < ESPACO_MINIMO)) return;
    svg += `<text class="eixo" x="${x.toFixed(1)}" y="${base + 17}" text-anchor="middle">${valor.toLocaleString('pt-BR')}</text>`;
    ultimoRotulo = x;
  });
  svg += `<text class="eixo" x="${(esquerda + direita) / 2}" y="${base + 34}" text-anchor="middle">n</text>`;

  for (const serie of cfg.series) {
    const caminho = serie.pontos
      .map(
        (ponto, indice) =>
          `${indice === 0 ? 'M' : 'L'}${posX(ponto.x).toFixed(1)},${posY(ponto.y).toFixed(1)}`,
      )
      .join(' ');
    svg += `<path class="serie ${serie.classe}" d="${caminho}"/>`;
  }
  for (const serie of cfg.series) {
    for (const ponto of serie.pontos) {
      svg += `<circle class="ponto ${serie.classe}" cx="${posX(ponto.x).toFixed(1)}" cy="${posY(ponto.y).toFixed(1)}" r="3.5"><title>${serie.nome} — ${ponto.rotulo}</title></circle>`;
    }
  }
  return svg;
}

/** Um painel embrulhado numa tag <svg> responsiva, pronto para a página. */
export function painelEmbutido(cfg: ConfigPainel, descricao: string): string {
  return `<svg class="painel" viewBox="0 0 ${PAINEL_L} ${PAINEL_A}" role="img" aria-label="${descricao}">${desenharPainel(cfg)}</svg>`;
}

/** Envolve um SVG avulso com o próprio estilo e fundo, claro e escuro. */
function svgAvulso(largura: number, altura: number, conteudo: string, descricao: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${largura} ${altura}" width="${largura}" height="${altura}" role="img" aria-label="${descricao}" font-family="system-ui, -apple-system, 'Segoe UI', sans-serif">
<style>
  svg {${CORES_CLARO} }
  @media (prefers-color-scheme: dark) { svg {${CORES_ESCURO} } }
${ESTILO_SVG}
</style>
<rect class="fundo" width="100%" height="100%"/>
${conteudo}
</svg>
`;
}

/** Legenda das duas séries, em SVG. */
function legendaSeries(y: number): string {
  return (
    `<line class="chave-linha s1" x1="0" x2="16" y1="${y}" y2="${y}"/>` +
    `<text class="legenda-texto" x="24" y="${y}" dy="0.32em">Recursiva sem cache</text>` +
    `<line class="chave-linha s2" x1="176" x2="192" y1="${y}" y2="${y}"/>` +
    `<text class="legenda-texto" x="200" y="${y}" dy="0.32em">Recursiva com cache</text>`
  );
}

/** Figura avulsa com os painéis lado a lado: serve para o artigo e para slides. */
export function figuraDePaineis(configs: readonly ConfigPainel[], descricao: string): string {
  const vao = 22;
  const alturaLegenda = 26;
  let conteudo = `<g transform="translate(16, 16)">${legendaSeries(0)}</g>`;
  configs.forEach((cfg, indice) => {
    const x = 16 + indice * (PAINEL_L + vao);
    conteudo += `<svg x="${x}" y="${16 + alturaLegenda}" width="${PAINEL_L}" height="${PAINEL_A}" viewBox="0 0 ${PAINEL_L} ${PAINEL_A}">${desenharPainel(cfg)}</svg>`;
  });
  const largura = 32 + configs.length * PAINEL_L + Math.max(configs.length - 1, 0) * vao;
  return svgAvulso(largura, 32 + alturaLegenda + PAINEL_A, conteudo, descricao);
}

/** A árvore como figura avulsa, com legenda dos quatro estados. */
export function figuraDaArvore(arvore: ArvoreClassificada, descricao: string): string {
  const { svg, largura, altura } = desenharArvore(arvore);
  const itens: [EstadoNo, string][] = [
    ['calculado', `Calculada pela 1ª vez: ${arvore.totais.calculado}`],
    ['base', `Caso base: ${arvore.totais.base}`],
    ['acerto', `Acerto de cache: ${arvore.totais.acerto}`],
    ['evitado', `Evitada pelo cache: ${arvore.totais.evitado}`],
  ];
  let legenda = '';
  itens.forEach(([estado, texto], indice) => {
    const x = 18 + (indice % 2) * 300;
    const y = 14 + Math.floor(indice / 2) * 22;
    legenda +=
      `<g class="no ${estado}"><circle cx="${x + 7}" cy="${y}" r="6"/></g>` +
      `<text class="legenda-texto" x="${x + 20}" y="${y}" dy="0.32em">${texto}</text>`;
  });
  const alturaLegenda = 44;
  const conteudo = `${legenda}<g transform="translate(0, ${alturaLegenda})">${svg}</g>`;
  return svgAvulso(Math.max(largura, 620), altura + alturaLegenda, conteudo, descricao);
}

/* ------------------------------------------------------------------ */
/* Árvore de chamadas                                                  */
/* ------------------------------------------------------------------ */

const ROTULO_ESTADO: Record<EstadoNo, string> = {
  calculado: 'calculada pela primeira vez (guarda no cache)',
  base: 'caso base (responde 1 sem tocar no cache)',
  acerto: 'acerto de cache (retorna sem descer)',
  evitado: 'evitada pelo cache (não acontece)',
};

/**
 * Desenha a árvore sem cache com cada nó pintado pelo seu destino com cache.
 * As folhas ficam igualmente espaçadas e cada nó interno fica centralizado
 * sobre os filhos, então a figura mostra de longe o tamanho de cada poda.
 */
export function desenharArvore(arvore: ArvoreClassificada): {
  svg: string;
  largura: number;
  altura: number;
} {
  const dx = 26;
  const dy = 54;
  const margem = 18;
  const topo = 30;

  const posicoes = new Map<NoClassificado, { x: number; y: number }>();
  let folhas = 0;
  let profundidadeMaxima = 0;

  const posicionar = (no: NoClassificado, nivel: number): number => {
    let x: number;
    if (no.filhos.length === 0) {
      x = margem + 14 + folhas * dx;
      folhas += 1;
    } else {
      const xs = no.filhos.map((filho) => posicionar(filho, nivel + 1));
      x = ((xs[0] ?? 0) + (xs[xs.length - 1] ?? 0)) / 2;
    }
    profundidadeMaxima = Math.max(profundidadeMaxima, nivel);
    posicoes.set(no, { x, y: topo + nivel * dy });
    return x;
  };
  posicionar(arvore.raiz, 0);

  let arestas = '';
  let nos = '';
  const desenhar = (no: NoClassificado): void => {
    const pai = posicoes.get(no);
    if (pai === undefined) return;
    for (const filho of no.filhos) {
      const posicaoFilho = posicoes.get(filho);
      if (posicaoFilho !== undefined) {
        const classe = filho.estado === 'evitado' ? ' evitado' : '';
        arestas += `<line class="aresta${classe}" x1="${pai.x.toFixed(1)}" y1="${pai.y}" x2="${posicaoFilho.x.toFixed(1)}" y2="${posicaoFilho.y}"/>`;
      }
      desenhar(filho);
    }
    nos +=
      `<g class="no ${no.estado}"><title>f(${no.argumento}) = ${no.valor} — ${ROTULO_ESTADO[no.estado]}</title>` +
      `<circle cx="${pai.x.toFixed(1)}" cy="${pai.y}" r="10.5"/>` +
      `<text x="${pai.x.toFixed(1)}" y="${pai.y}">${no.argumento}</text></g>`;
  };
  desenhar(arvore.raiz);

  return {
    svg: arestas + nos,
    largura: margem * 2 + 28 + Math.max(folhas - 1, 0) * dx,
    altura: topo + profundidadeMaxima * dy + 28,
  };
}

/** A árvore embrulhada numa tag <svg> responsiva, pronta para a página. */
export function arvoreEmbutida(arvore: ArvoreClassificada, descricao: string): string {
  const { svg, largura, altura } = desenharArvore(arvore);
  return `<svg class="arvore" viewBox="0 0 ${largura} ${altura}" role="img" aria-label="${descricao}">${svg}</svg>`;
}

export { ROTULO_ESTADO };
