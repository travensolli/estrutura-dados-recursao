import type { No } from '@sequencias/contrato';
import { achatarNos } from '../modelo';

export interface Termo {
  argumento: number;
  /** Valor devolvido pela execução, como texto para não perder dígitos. */
  valor: string;
}

export interface Passo extends Termo {
  /** Os termos que a recorrência soma, de f(k − 1) a f(k − ordem). */
  parcelas: Termo[];
}

export interface ContaPassoAPasso {
  casosBase: Termo[];
  passos: Passo[];
}

/**
 * A conta de uma recorrência de soma termo a termo, com os valores que a
 * própria execução devolveu: os casos base e, de cada argumento acima deles
 * até a raiz, as parcelas que ele somou.
 */
export function contaPassoAPasso(raiz: No, ordem: number): ContaPassoAPasso {
  const valores = new Map<number, string>();
  const base = new Set<number>();
  for (const no of achatarNos(raiz)) {
    valores.set(no.argumento, no.valor);
    if (no.tipo === 'base') base.add(no.argumento);
  }
  const termo = (argumento: number): Termo => ({
    argumento,
    valor: valores.get(argumento) ?? '',
  });

  const casosBase = [...base].sort((a, b) => a - b).map(termo);
  const passos: Passo[] = [];
  const primeiro = casosBase.length > 0 ? Math.max(...base) + 1 : raiz.argumento + 1;
  for (let argumento = primeiro; argumento <= raiz.argumento; argumento++) {
    passos.push({
      ...termo(argumento),
      parcelas: Array.from({ length: ordem }, (_, i) => termo(argumento - 1 - i)),
    });
  }
  return { casosBase, passos };
}
