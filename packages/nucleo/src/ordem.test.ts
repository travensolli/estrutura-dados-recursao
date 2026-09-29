import { DESCRICAO_SEQUENCIAS, SEQUENCIAS } from '@sequencias/contrato';
import { describe, expect, it } from 'vitest';
import { executarInstrumentado } from './fachadas';

/* A ordem que a tela mostra tem de ser a da recursão que roda: um caso não
   base abre exatamente `ordem` chamadas, uma por termo anterior. */
describe('ordem da recorrência', () => {
  for (const sequencia of SEQUENCIAS) {
    const { ordem } = DESCRICAO_SEQUENCIAS[sequencia];

    it(`${sequencia}: f(7) sem cache abre ${ordem} chamadas na raiz`, () => {
      const { raiz } = executarInstrumentado(sequencia, 7, 'sem_cache');
      expect(raiz?.filhos.map((filho) => filho.argumento)).toEqual(
        Array.from({ length: ordem }, (_, indice) => 7 - 1 - indice),
      );
    });
  }
});
