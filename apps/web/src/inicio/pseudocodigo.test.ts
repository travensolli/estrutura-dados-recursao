import { MODOS } from '@sequencias/contrato';
import { describe, expect, it } from 'vitest';
import { PSEUDOCODIGO, trechosDaLinha } from './pseudocodigo';

describe('pseudocódigo do início', () => {
  it('separa as palavras-chave do resto da linha, sem perder o recuo', () => {
    expect(trechosDaLinha('  **Se** n é caso base **Então**')).toEqual([
      { texto: '  ', palavraChave: false },
      { texto: 'Se', palavraChave: true },
      { texto: ' n é caso base ', palavraChave: false },
      { texto: 'Então', palavraChave: true },
    ]);
  });

  it('marca como do cache exatamente as linhas que o consultam ou gravam', () => {
    for (const modo of MODOS) {
      const [assinatura, ...corpo] = PSEUDOCODIGO[modo];
      expect(assinatura?.cache).toBeUndefined();
      for (const linha of corpo) {
        expect(Boolean(linha.cache), linha.texto).toBe(linha.texto.includes('cache['));
      }
    }
    expect(PSEUDOCODIGO.sem_cache.some((linha) => linha.texto.includes('cache'))).toBe(false);
  });

  it('é a versão sem cache acrescida só das linhas do cache', () => {
    const semAssinatura = (modo: 'sem_cache' | 'com_cache') =>
      PSEUDOCODIGO[modo]
        .slice(1)
        .filter((linha) => !linha.cache)
        .map((linha) => linha.texto);
    const retornoSemCache = '    **retorne** a combinação';
    expect(semAssinatura('com_cache')).toEqual(
      semAssinatura('sem_cache').filter((texto) => texto !== retornoSemCache),
    );
  });

  it('fecha cada Se com um Fim-se', () => {
    for (const modo of MODOS) {
      const textos = PSEUDOCODIGO[modo].map((linha) => linha.texto.trim());
      const abertos = textos.filter((texto) => texto.startsWith('**Se**')).length;
      const fechados = textos.filter((texto) => texto === '**Fim-se**').length;
      expect(fechados, modo).toBe(abertos);
    }
  });
});
