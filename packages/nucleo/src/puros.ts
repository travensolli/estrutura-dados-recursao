// Versões puras, sem contadores: só recursão e bigint. Servem de referência de
// valor e de base para medir tempo. O cache é sempre um Map recebido por
// parâmetro; casos base não entram nele.

export function fatorialSemCache(n: number): bigint {
  if (n <= 1) return 1n;
  return BigInt(n) * fatorialSemCache(n - 1);
}

export function fatorialComCache(n: number, cache: Map<number, bigint>): bigint {
  if (n <= 1) return 1n;
  const guardado = cache.get(n);
  if (guardado !== undefined) return guardado;
  const valor = BigInt(n) * fatorialComCache(n - 1, cache);
  cache.set(n, valor);
  return valor;
}

export function fibonacciSemCache(n: number): bigint {
  if (n <= 1) return 1n;
  return fibonacciSemCache(n - 1) + fibonacciSemCache(n - 2);
}

export function fibonacciComCache(n: number, cache: Map<number, bigint>): bigint {
  if (n <= 1) return 1n;
  const guardado = cache.get(n);
  if (guardado !== undefined) return guardado;
  const valor = fibonacciComCache(n - 1, cache) + fibonacciComCache(n - 2, cache);
  cache.set(n, valor);
  return valor;
}

export function tribonacciSemCache(n: number): bigint {
  if (n <= 2) return 1n;
  return tribonacciSemCache(n - 1) + tribonacciSemCache(n - 2) + tribonacciSemCache(n - 3);
}

export function tribonacciComCache(n: number, cache: Map<number, bigint>): bigint {
  if (n <= 2) return 1n;
  const guardado = cache.get(n);
  if (guardado !== undefined) return guardado;
  const valor =
    tribonacciComCache(n - 1, cache) +
    tribonacciComCache(n - 2, cache) +
    tribonacciComCache(n - 3, cache);
  cache.set(n, valor);
  return valor;
}
