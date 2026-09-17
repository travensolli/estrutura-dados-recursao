import { describe, expect, it } from 'vitest';
import { executarMock } from '../../mocks/referencia-mock';
import { momentosDoCache } from './momentos';

const com = executarMock('tribonacci', 7, 'com_cache');
const momentos = momentosDoCache(com.raiz);

describe('momentos guiados do cache', () => {
  it('traz um guardar por argumento com acerto e um acerto por ocorrência', () => {
    expect(momentos.filter((momento) => momento.tipo === 'guarda')).toHaveLength(3);
    expect(momentos.filter((momento) => momento.tipo === 'acerto')).toHaveLength(
      com.metricas.acertos_cache,
    );
  });

  it('vem em ordem de relógio e guarda antes de reaproveitar', () => {
    const passos = momentos.map((momento) => momento.passo);
    expect(passos).toEqual([...passos].sort((a, b) => a - b));
    for (const argumento of [3, 4, 5]) {
      const doArgumento = momentos.filter((momento) => momento.argumento === argumento);
      expect(doArgumento[0]?.tipo).toBe('guarda');
      expect(doArgumento.length).toBeGreaterThan(1);
    }
  });

  it('bate com os acertos detalhados das métricas', () => {
    expect(
      momentos.filter((momento) => momento.tipo === 'acerto').map((momento) => momento.argumento),
    ).toEqual(com.metricas.acertos_detalhados.map((acerto) => acerto.argumento));
  });

  it('não tem momento nenhum sem cache', () => {
    expect(momentosDoCache(executarMock('tribonacci', 7, 'sem_cache').raiz)).toEqual([]);
  });
});
