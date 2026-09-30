/** Duração da contagem de um total ao outro, no contador e nos quadrados ao lado. */
export const DURACAO_CONTAGEM_MS = 1400;

/** Sai rápido e chega devagar: o número final assenta em vez de parar seco. */
export function suavizar(t: number): number {
  return 1 - (1 - t) ** 3;
}

/** Instante, em ms, em que a contagem suavizada percorre esta fração do caminho. */
export function instanteDaContagem(fracao: number, duracaoMs = DURACAO_CONTAGEM_MS): number {
  const limitada = Math.min(1, Math.max(0, fracao));
  return duracaoMs * (1 - Math.cbrt(1 - limitada));
}
