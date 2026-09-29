import { DESCRICAO_SEQUENCIAS, MODOS, SEQUENCIAS, type Modo } from '@sequencias/contrato';
import { describe, expect, it } from 'vitest';
import { codigoDaFuncao, LINHA_DO_CACHE, nomeDaFuncao, recortarFuncao } from './codigo';

/* O código na tela é o que roda: cada recorte tem de bater com o que o
   contrato diz da sequência — a ordem e os casos base do enunciado. */
describe('código das funções em puros.ts', () => {
  for (const sequencia of SEQUENCIAS) {
    const { ordem, casos_base } = DESCRICAO_SEQUENCIAS[sequencia];
    const casosBase = casos_base.match(/f\(\d+\)/g)?.length ?? 0;

    for (const modo of MODOS) {
      it(`${sequencia} ${modo}: a função inteira, com ${ordem} chamada(s) recursiva(s)`, () => {
        const nome = nomeDaFuncao(sequencia, modo);
        const codigo = codigoDaFuncao(sequencia, modo);
        expect(codigo.startsWith(`export function ${nome}(`)).toBe(true);
        expect(codigo.endsWith('\n}')).toBe(true);
        // O nome aparece uma vez na assinatura e uma vez em cada chamada recursiva.
        expect(codigo.split(`${nome}(`).length - 2).toBe(ordem);
        expect(codigo).toContain(`if (n <= ${casosBase - 1}) return 1n;`);
      });
    }

    it(`${sequencia}: só a versão com cache consulta e grava o cache, em 3 linhas`, () => {
      const linhasDoCache = (modo: Modo) =>
        codigoDaFuncao(sequencia, modo)
          .split('\n')
          .filter((linha) => LINHA_DO_CACHE.test(linha));
      expect(linhasDoCache('sem_cache')).toHaveLength(0);
      expect(linhasDoCache('com_cache')).toHaveLength(3);
    });
  }

  it('avisa quando a função não existe no arquivo', () => {
    expect(() => recortarFuncao('export function a() {\n}\n', 'b')).toThrow(/não está em puros/);
  });
});
