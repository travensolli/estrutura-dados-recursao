import { type Modo } from '@sequencias/contrato';

export type ParDeModos = readonly [Modo, Modo];

export const ORDEM_PADRAO: ParDeModos = ['sem_cache', 'com_cache'];

/** Garante um par com os dois modos, respeitando quem foi pedido primeiro. */
export function normalizarOrdem(ordem?: readonly Modo[]): ParDeModos {
  return ordem?.[0] === 'com_cache' ? ['com_cache', 'sem_cache'] : ORDEM_PADRAO;
}

export function inverterOrdem(ordem: ParDeModos): ParDeModos {
  return [ordem[1], ordem[0]];
}

/** Aplica `criar` na ordem informada e devolve o resultado indexado por modo. */
export function porModo<T>(ordem: ParDeModos, criar: (modo: Modo) => T): Record<Modo, T> {
  const primeiro = criar(ordem[0]);
  const segundo = criar(ordem[1]);
  return ordem[0] === 'sem_cache'
    ? { sem_cache: primeiro, com_cache: segundo }
    : { sem_cache: segundo, com_cache: primeiro };
}

let rodadas = 0;

/** Alterna qual modo é medido primeiro a cada comparação pedida. */
export function proximaOrdemDeModos(): ParDeModos {
  const ordem = rodadas % 2 === 0 ? ORDEM_PADRAO : inverterOrdem(ORDEM_PADRAO);
  rodadas += 1;
  return ordem;
}

export function reiniciarAlternanciaDeModos(): void {
  rodadas = 0;
}
