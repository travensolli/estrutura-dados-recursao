import {
  DESCRICAO_SEQUENCIAS,
  type Metricas,
  type Modo,
  type Sequencia,
} from '@sequencias/contrato';

const LOCALE = 'pt-BR';
const LARGURA_BARRA = 24;
const DIGITOS_ATE_MOSTRAR_TUDO = 120;
const ACERTOS_LISTADOS = 20;

export function formatarInteiro(valor: number | bigint | string): string {
  const grande = typeof valor === 'number' ? BigInt(Math.trunc(valor)) : BigInt(valor);
  return grande.toLocaleString(LOCALE);
}

export function rotuloModo(modo: Modo): string {
  return modo === 'sem_cache' ? 'sem cache' : 'com cache';
}

/** Valores enormes aparecem pelas pontas, com a contagem de dígitos. */
export function formatarValor(texto: string): string {
  const digitos = texto.length;
  const plural = digitos === 1 ? 'dígito' : 'dígitos';
  if (digitos <= DIGITOS_ATE_MOSTRAR_TUDO) {
    return `${formatarInteiro(texto)} (${formatarInteiro(digitos)} ${plural})`;
  }
  const pontas = 24;
  return `${texto.slice(0, pontas)}...${texto.slice(-pontas)} (${formatarInteiro(digitos)} ${plural})`;
}

export function cabecalho(sequencia: Sequencia, n: number, modo: Modo): string[] {
  const descricao = DESCRICAO_SEQUENCIAS[sequencia];
  return [
    `${descricao.nome} f(${n}), modo ${rotuloModo(modo)}`,
    `${descricao.formula}, com ${descricao.casos_base}`,
  ];
}

function linhaMetrica(rotulo: string, valor: number, largura: number): string {
  return `  ${rotulo.padEnd(largura)}  ${formatarInteiro(valor).padStart(7)}`;
}

export function blocoMetricas(metricas: Metricas): string[] {
  const itens: Array<[string, number]> = [
    ['Invocações', metricas.invocacoes],
    ['Chamadas recursivas', metricas.chamadas_recursivas],
    ['Casos base', metricas.casos_base],
    ['Calculados', metricas.calculados],
    ['Acertos de cache', metricas.acertos_cache],
    ['Entradas no cache', metricas.entradas_cache],
    ['Profundidade máxima', metricas.profundidade_maxima],
  ];
  const largura = Math.max(...itens.map(([rotulo]) => rotulo.length));
  return ['Métricas', ...itens.map(([rotulo, valor]) => linhaMetrica(rotulo, valor, largura))];
}

export function blocoInvocacoesPorArgumento(metricas: Metricas): string[] {
  const entradas = metricas.invocacoes_por_argumento;
  const maximo = entradas.reduce((maior, e) => Math.max(maior, e.invocacoes), 1);
  const rotulos = entradas.map((e) => `f(${e.argumento})`);
  const numeros = entradas.map((e) => formatarInteiro(e.invocacoes));
  const larguraRotulo = rotulos.reduce((maior, r) => Math.max(maior, r.length), 0);
  const larguraNumero = numeros.reduce((maior, s) => Math.max(maior, s.length), 0);
  const linhas = entradas.map((entrada, i) => {
    const barra = '#'.repeat(
      Math.max(1, Math.round((entrada.invocacoes / maximo) * LARGURA_BARRA)),
    );
    const rotulo = (rotulos[i] ?? '').padEnd(larguraRotulo);
    const numero = (numeros[i] ?? '').padStart(larguraNumero);
    return `  ${rotulo}  ${numero}  ${barra}`;
  });
  return ['Invocações por argumento', ...linhas];
}

export function blocoAcertos(metricas: Metricas): string[] {
  if (metricas.acertos_detalhados.length === 0) return [];
  const listados = metricas.acertos_detalhados.slice(0, ACERTOS_LISTADOS);
  const linhas = listados.map((a) => `  f(${a.argumento}) dentro de f(${a.dentro_de})`);
  const restantes = metricas.acertos_detalhados.length - listados.length;
  if (restantes > 0) linhas.push(`  e mais ${formatarInteiro(restantes)}`);
  return ['Acertos de cache, na ordem em que aconteceram', ...linhas];
}

/** Observação honesta: o fatorial não economiza chamadas numa execução isolada. */
export function blocoObservacao(sequencia: Sequencia, modo: Modo, metricas: Metricas): string[] {
  if (sequencia !== 'fatorial' || modo !== 'com_cache' || metricas.acertos_cache > 0) return [];
  return [
    `Observação: nenhum acerto de cache aconteceu. O fatorial chama cada f(k) uma vez só, ` +
      `então numa execução isolada o cache guarda ${formatarInteiro(metricas.entradas_cache)} ` +
      `entradas e não evita nenhuma chamada.`,
  ];
}
