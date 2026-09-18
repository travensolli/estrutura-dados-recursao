import v8 from 'node:v8';
import vm from 'node:vm';

export type ColetorDeLixo = () => void;

/**
 * Coletor exposto por --expose-gc; sem a flag, cria um a partir do V8 num
 * contexto novo, para as medições funcionarem também nos testes.
 */
export function obterColetorDeLixo(): ColetorDeLixo | null {
  const global = globalThis as { gc?: ColetorDeLixo };
  if (typeof global.gc === 'function') return global.gc.bind(globalThis);
  try {
    v8.setFlagsFromString('--expose-gc');
    const coletor: unknown = vm.runInNewContext('gc');
    v8.setFlagsFromString('--no-expose-gc');
    return typeof coletor === 'function' ? (coletor as ColetorDeLixo) : null;
  } catch {
    return null;
  }
}

let coletor: ColetorDeLixo | null | undefined;

function resolverColetor(): ColetorDeLixo | null {
  if (coletor === undefined) coletor = obterColetorDeLixo();
  return coletor;
}

export function coletaDeLixoDisponivel(): boolean {
  return resolverColetor() !== null;
}

/** Duas passagens: a segunda recolhe o que só ficou livre depois da primeira. */
export function coletarLixo(): void {
  const atual = resolverColetor();
  if (atual === null) return;
  atual();
  atual();
}

export function heapUsado(): number {
  return process.memoryUsage().heapUsed;
}
