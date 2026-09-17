import { ErroSequencia } from '@sequencias/contrato';

const MENSAGEM_PILHA =
  'A recursão ficou profunda demais para a pilha disponível. Tente um n menor.';

function representar(valor: unknown): unknown {
  return typeof valor === 'number' || typeof valor === 'string' || valor === null
    ? valor
    : String(valor);
}

/** Garante inteiro seguro, não negativo e, se informado, dentro do limite. */
export function validarN(n: unknown, limite?: number): asserts n is number {
  const detalhes = { recebido: representar(n) };
  if (typeof n !== 'number' || Number.isNaN(n)) {
    throw new ErroSequencia('ENTRADA_INVALIDA', 'n deve ser um número inteiro.', detalhes);
  }
  if (!Number.isInteger(n)) {
    throw new ErroSequencia('ENTRADA_INVALIDA', 'n deve ser um número inteiro.', detalhes);
  }
  if (n < 0) {
    throw new ErroSequencia('ENTRADA_INVALIDA', 'n não pode ser negativo.', detalhes);
  }
  if (!Number.isSafeInteger(n)) {
    throw new ErroSequencia(
      'ENTRADA_INVALIDA',
      'n é grande demais para ser representado com exatidão.',
      detalhes,
    );
  }
  if (limite !== undefined && n > limite) {
    throw new ErroSequencia('LIMITE_EXCEDIDO', `n não pode passar de ${limite}.`, { n, limite });
  }
}

/** Converte estouro de pilha em ErroSequencia; outros erros passam intactos. */
export function executarProtegido<T>(fn: () => T): T {
  try {
    return fn();
  } catch (erro) {
    if (erro instanceof RangeError && erro.message.includes('Maximum call stack size exceeded')) {
      throw new ErroSequencia('PILHA_ESTOURADA', MENSAGEM_PILHA);
    }
    throw erro;
  }
}
