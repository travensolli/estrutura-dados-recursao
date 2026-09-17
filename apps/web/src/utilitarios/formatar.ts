import type { Modo } from '@sequencias/contrato';

const LOCALE = 'pt-BR';
const CORES_ARGUMENTO = 12;

/** Formata inteiros (number, bigint ou texto decimal) com separador de milhar. */
export function formatarInteiro(valor: number | bigint | string): string {
  if (typeof valor === 'number') return valor.toLocaleString(LOCALE, { maximumFractionDigits: 0 });
  const grande = typeof valor === 'bigint' ? valor : BigInt(valor);
  return grande.toLocaleString(LOCALE);
}

export function formatarDecimal(valor: number, casas = 1): string {
  return valor.toLocaleString(LOCALE, {
    minimumFractionDigits: casas,
    maximumFractionDigits: casas,
  });
}

export interface ValorAbreviado {
  abreviado: string;
  completo: string;
  digitos: number;
  foiAbreviado: boolean;
}

/** Números enormes aparecem com início e fim, mais a quantidade de dígitos. */
export function abreviarValor(texto: string, digitosVisiveis = 12): ValorAbreviado {
  const digitos = texto.length;
  if (digitos <= digitosVisiveis) {
    return { abreviado: formatarInteiro(texto), completo: texto, digitos, foiAbreviado: false };
  }
  const metade = Math.floor(digitosVisiveis / 2);
  const abreviado = `${texto.slice(0, metade)}…${texto.slice(-metade)}`;
  return { abreviado, completo: texto, digitos, foiAbreviado: true };
}

export function formatarTempoNs(ns: number): string {
  if (!Number.isFinite(ns)) return '–';
  if (ns < 1_000) return `${formatarDecimal(ns, 0)} ns`;
  if (ns < 1_000_000) return `${formatarDecimal(ns / 1_000, 1)} µs`;
  if (ns < 1_000_000_000) return `${formatarDecimal(ns / 1_000_000, 1)} ms`;
  return `${formatarDecimal(ns / 1_000_000_000, 2)} s`;
}

export function formatarBytes(bytes: number): string {
  if (!Number.isFinite(bytes)) return '–';
  const sinal = bytes < 0 ? '-' : '';
  const absoluto = Math.abs(bytes);
  if (absoluto < 1024) return `${sinal}${formatarDecimal(absoluto, 0)} B`;
  if (absoluto < 1024 ** 2) return `${sinal}${formatarDecimal(absoluto / 1024, 1)} KB`;
  if (absoluto < 1024 ** 3) return `${sinal}${formatarDecimal(absoluto / 1024 ** 2, 1)} MB`;
  return `${sinal}${formatarDecimal(absoluto / 1024 ** 3, 2)} GB`;
}

export function formatarFator(fator: number): string {
  if (!Number.isFinite(fator)) return '–';
  return `${formatarDecimal(fator, fator >= 100 ? 0 : 1)}×`;
}

/** Cor estável por argumento: todas as ocorrências de f(k) usam a mesma cor. */
export function corDoArgumento(argumento: number): string {
  return `var(--arg-${argumento % CORES_ARGUMENTO})`;
}

export function rotuloModo(modo: Modo): string {
  return modo === 'sem_cache' ? 'sem cache' : 'com cache';
}
