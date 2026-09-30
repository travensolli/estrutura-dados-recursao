import type { Modo } from '@sequencias/contrato';

/** Uma linha do pseudocódigo: palavras-chave entre `**`, e se é o que o cache acrescenta. */
export interface LinhaPseudocodigo {
  texto: string;
  cache?: boolean;
}

/**
 * O molde do material de apoio, escrito para as três sequências: k é a ordem
 * e o caso base são os primeiros termos. A versão com cache segue a ordem de
 * packages/nucleo/src/puros.ts: o caso base responde antes de olhar o cache e
 * não entra nele, por isso o cache guarda n − b + 1 valores.
 */
export const PSEUDOCODIGO: Record<Modo, readonly LinhaPseudocodigo[]> = {
  sem_cache: [
    { texto: '**Função** f(n)' },
    { texto: '  **Se** n é caso base **Então**' },
    { texto: '    **retorne** o valor direto' },
    { texto: '  **Senão**' },
    { texto: '    chame f(n−1) … f(n−k)' },
    { texto: '    **retorne** a combinação' },
    { texto: '  **Fim-se**' },
  ],
  com_cache: [
    { texto: '**Função** f(n, cache)' },
    { texto: '  **Se** n é caso base **Então**' },
    { texto: '    **retorne** o valor direto' },
    { texto: '  **Senão se** cache[n] ≠ vazio **Então**', cache: true },
    { texto: '    **retorne** cache[n]', cache: true },
    { texto: '  **Senão**' },
    { texto: '    chame f(n−1) … f(n−k)' },
    { texto: '    cache[n] ← combinação', cache: true },
    { texto: '    **retorne** cache[n]', cache: true },
    { texto: '  **Fim-se**' },
  ],
};

export interface TrechoPseudocodigo {
  texto: string;
  palavraChave: boolean;
}

/** Separa as palavras-chave, marcadas entre `**`, do resto da linha. */
export function trechosDaLinha(texto: string): TrechoPseudocodigo[] {
  return texto
    .split(/(\*\*[^*]+\*\*)/)
    .filter((trecho) => trecho !== '')
    .map((trecho) =>
      trecho.startsWith('**')
        ? { texto: trecho.slice(2, -2), palavraChave: true }
        : { texto: trecho, palavraChave: false },
    );
}
