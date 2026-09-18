import { ErroSequencia } from '@sequencias/contrato';

export interface ResumoAmostras {
  mediana_ns: number;
  media_ns: number;
  minimo_ns: number;
  maximo_ns: number;
  desvio_padrao_ns: number;
}

function exigirAmostras(amostras: readonly number[]): void {
  if (amostras.length === 0) {
    throw new ErroSequencia('ERRO_INTERNO', 'Não há amostras para resumir.');
  }
}

/** Mediana simples: com quantidade par, média dos dois valores centrais. */
export function mediana(amostras: readonly number[]): number {
  exigirAmostras(amostras);
  const ordenadas = [...amostras].sort((a, b) => a - b);
  const meio = Math.floor(ordenadas.length / 2);
  const central = ordenadas[meio] ?? 0;
  if (ordenadas.length % 2 === 1) return central;
  return ((ordenadas[meio - 1] ?? 0) + central) / 2;
}

export function media(amostras: readonly number[]): number {
  exigirAmostras(amostras);
  return amostras.reduce((soma, valor) => soma + valor, 0) / amostras.length;
}

/** Desvio padrão populacional (divide por n, não por n - 1). */
export function desvioPadrao(amostras: readonly number[]): number {
  exigirAmostras(amostras);
  const centro = media(amostras);
  const variancia =
    amostras.reduce((soma, valor) => soma + (valor - centro) ** 2, 0) / amostras.length;
  return Math.sqrt(variancia);
}

export function resumirAmostras(amostras: readonly number[]): ResumoAmostras {
  exigirAmostras(amostras);
  return {
    mediana_ns: mediana(amostras),
    media_ns: media(amostras),
    minimo_ns: Math.min(...amostras),
    maximo_ns: Math.max(...amostras),
    desvio_padrao_ns: desvioPadrao(amostras),
  };
}
