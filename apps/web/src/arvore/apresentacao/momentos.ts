import type { No } from '@sequencias/contrato';
import { achatarNos } from '../modelo';

export interface Momento {
  id: string;
  rotulo: string;
  /** Instante do relógio da reprodução. */
  passo: number;
  argumento: number;
  tipo: 'guarda' | 'acerto';
}

/**
 * Roteiro do cache: o instante em que cada argumento entra no dicionário e os
 * instantes em que ele volta de lá. Só entram argumentos que tiveram acerto.
 */
export function momentosDoCache(raiz: No): Momento[] {
  const nos = achatarNos(raiz);
  const acertos = nos.filter((no) => no.tipo === 'acerto_cache');
  const argumentos = [...new Set(acertos.map((no) => no.argumento))];
  const momentos: Momento[] = [];

  for (const argumento of argumentos) {
    const calculado = nos.find((no) => no.tipo === 'calculado' && no.argumento === argumento);
    if (calculado) {
      momentos.push({
        id: `guarda-${calculado.id}`,
        rotulo: `f(${argumento}) guardado`,
        passo: calculado.ordem_saida,
        argumento,
        tipo: 'guarda',
      });
    }
  }
  for (const acerto of acertos) {
    momentos.push({
      id: `acerto-${acerto.id}`,
      rotulo: `f(${acerto.argumento}) do dicionário`,
      passo: acerto.ordem_entrada,
      argumento: acerto.argumento,
      tipo: 'acerto',
    });
  }

  return momentos.sort((a, b) => a.passo - b.passo);
}
