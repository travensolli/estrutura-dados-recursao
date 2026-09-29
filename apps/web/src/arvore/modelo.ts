import type { Modo, No } from '@sequencias/contrato';
import { abreviarValor, formatarInteiro, formatarQuantidade } from '../utilitarios/formatar';

export type EstadoNo = 'futuro' | 'ativo' | 'resolvido';

export interface EntradaCache {
  argumento: number;
  valor: string;
  ordem_saida: number;
}

export interface EventoPasso {
  tipo: 'entrada' | 'saida';
  no: No;
}

export interface GrupoArgumento {
  argumento: number;
  nos: No[];
}

export interface SubarvorePodada {
  /** Nó de acerto na árvore com cache. */
  acerto: No;
  /** Nó calculado com o mesmo argumento na árvore sem cache (forma da subárvore evitada). */
  modelo: No | null;
  /** Chamadas evitadas por este acerto. */
  podadas: number;
}

/** Pré-ordem: coincide com a ordem de entrada. */
export function achatarNos(raiz: No): No[] {
  const lista: No[] = [];
  const pilha: No[] = [raiz];
  while (pilha.length > 0) {
    const no = pilha.pop() as No;
    lista.push(no);
    for (let i = no.filhos.length - 1; i >= 0; i -= 1) pilha.push(no.filhos[i] as No);
  }
  return lista;
}

export function contarNos(raiz: No): number {
  return achatarNos(raiz).length;
}

/** Relógio global: 2 instantes por invocação; t vai de 0 até raiz.ordem_saida + 1. */
export function totalPassos(raiz: No): number {
  return raiz.ordem_saida + 1;
}

export function descendentesDe(no: No): number {
  return (no.ordem_saida - no.ordem_entrada - 1) / 2;
}

export function estadoDoNoNoPasso(no: No, t: number): EstadoNo {
  if (t < no.ordem_entrada) return 'futuro';
  if (t < no.ordem_saida) return 'ativo';
  return 'resolvido';
}

/** Pilha de chamadas no instante t, da base (raiz) para o topo. */
export function pilhaNoPasso(nos: readonly No[], t: number): No[] {
  return nos
    .filter((no) => no.ordem_entrada <= t && t < no.ordem_saida)
    .sort((a, b) => a.profundidade - b.profundidade);
}

/** Dicionário no instante t: argumentos calculados já resolvidos, em ordem de inserção. */
export function cacheNoPasso(nos: readonly No[], t: number): EntradaCache[] {
  const vistos = new Set<number>();
  return nos
    .filter((no) => no.tipo === 'calculado' && no.ordem_saida <= t)
    .sort((a, b) => a.ordem_saida - b.ordem_saida)
    .filter((no) => {
      if (vistos.has(no.argumento)) return false;
      vistos.add(no.argumento);
      return true;
    })
    .map((no) => ({ argumento: no.argumento, valor: no.valor, ordem_saida: no.ordem_saida }));
}

/** Do maior argumento para o menor, como em `invocacoes_por_argumento`. */
export function agruparPorArgumento(nos: readonly No[]): GrupoArgumento[] {
  const mapa = new Map<number, No[]>();
  for (const no of nos) {
    const grupo = mapa.get(no.argumento);
    if (grupo) grupo.push(no);
    else mapa.set(no.argumento, [no]);
  }
  return [...mapa.entries()]
    .sort((a, b) => b[0] - a[0])
    .map(([argumento, lista]) => ({ argumento, nos: lista }));
}

/** Índice instante -> evento (entrada ou saída de um nó). */
export function indexarPassos(nos: readonly No[]): Map<number, EventoPasso> {
  const indice = new Map<number, EventoPasso>();
  for (const no of nos) {
    indice.set(no.ordem_entrada, { tipo: 'entrada', no });
    indice.set(no.ordem_saida, { tipo: 'saida', no });
  }
  return indice;
}

export function eventoNoPasso(indice: Map<number, EventoPasso>, t: number): EventoPasso | null {
  return indice.get(t) ?? null;
}

/** Acerto que acontece exatamente no instante t (entrada de um nó acerto_cache). */
export function acertoNoPasso(indice: Map<number, EventoPasso>, t: number): No | null {
  const evento = indice.get(t);
  if (!evento || evento.no.tipo !== 'acerto_cache') return null;
  return evento.no;
}

export function descreverPasso(
  evento: EventoPasso | null,
  modo: Modo,
  podadasPorAcerto?: ReadonlyMap<number, number>,
): string {
  if (!evento) return 'Início: nenhuma chamada ainda.';
  const { no, tipo } = evento;
  const nome = `f(${no.argumento})`;
  const valor = abreviarValor(no.valor).abreviado;
  if (tipo === 'entrada') {
    if (no.tipo === 'base') return `Chama ${nome}: caso base, devolve ${valor} direto.`;
    if (no.tipo === 'acerto_cache') {
      const podadas = podadasPorAcerto?.get(no.id);
      const evitadas = podadas === undefined ? '' : ` (evita ${podadas} chamadas)`;
      return `Chama ${nome}: já está no dicionário, devolve ${valor} sem recursão${evitadas}.`;
    }
    return modo === 'com_cache'
      ? `Chama ${nome}: não está no dicionário, precisa calcular.`
      : `Chama ${nome}: precisa calcular.`;
  }
  if (no.tipo === 'base') return `${nome} devolve ${valor}.`;
  if (no.tipo === 'acerto_cache') return `${nome} = ${valor}, veio do dicionário.`;
  return modo === 'com_cache'
    ? `${nome} = ${valor}: calculado e guardado no dicionário.`
    : `${nome} = ${valor}: calculado.`;
}

/**
 * Para cada acerto da árvore com cache, a subárvore evitada é a de um nó
 * calculado com o mesmo argumento na árvore sem cache (todas as ocorrências de
 * f(k) sem cache têm a mesma forma). Nós colapsados por orçamento servem como
 * modelo porque `ordem_entrada`/`ordem_saida` continuam exatos.
 */
export function subarvoresPodadas(arvoreSemCache: No, arvoreComCache: No): SubarvorePodada[] {
  const modelos = new Map<number, No>();
  for (const no of achatarNos(arvoreSemCache)) {
    if (no.tipo === 'calculado' && !modelos.has(no.argumento)) modelos.set(no.argumento, no);
  }
  return achatarNos(arvoreComCache)
    .filter((no) => no.tipo === 'acerto_cache')
    .map((acerto) => {
      const modelo = modelos.get(acerto.argumento) ?? null;
      return { acerto, modelo, podadas: modelo ? descendentesDe(modelo) : 0 };
    });
}

export function totalPodado(podas: readonly SubarvorePodada[]): number {
  return podas.reduce((soma, poda) => soma + poda.podadas, 0);
}

export function podasPorAcerto(podas: readonly SubarvorePodada[]): Map<number, number> {
  return new Map(podas.map((poda) => [poda.acerto.id, poda.podadas]));
}

export function rotuloTipo(tipo: No['tipo']): string {
  if (tipo === 'base') return 'caso base';
  if (tipo === 'acerto_cache') return 'acerto de cache';
  return 'calculado';
}

/** Rótulo do botão que reabre os nós recolhidos pelo clique. */
export function rotuloAbrirRecolhidos(quantidade: number): string {
  return quantidade === 1
    ? 'Abrir o nó recolhido'
    : `Abrir os ${formatarInteiro(quantidade)} nós recolhidos`;
}

/** Descrição textual da árvore para leitores de tela. */
export function descreverArvore(
  nomeSequencia: string,
  n: number,
  modo: Modo,
  metricas: {
    invocacoes: number;
    casos_base: number;
    calculados: number;
    acertos_cache: number;
    profundidade_maxima: number;
  },
): string {
  const partes = [
    `Árvore de chamadas de ${nomeSequencia} f(${n}) ${modo === 'com_cache' ? 'com' : 'sem'} cache:`,
    `${formatarQuantidade(metricas.invocacoes, 'invocação', 'invocações')},`,
    `${formatarQuantidade(metricas.casos_base, 'caso base', 'casos base')},`,
    `${formatarQuantidade(metricas.calculados, 'calculado', 'calculados')},`,
    `${formatarQuantidade(metricas.acertos_cache, 'acerto de cache', 'acertos de cache')},`,
    `profundidade máxima ${metricas.profundidade_maxima}.`,
  ];
  return partes.join(' ');
}
