import { describe, expect, it } from 'vitest';
import { ETAPAS, TOTAL_ETAPAS, escreverEtapa, etapaPorIndice, lerEtapa } from './etapas';

const consulta = (busca: string) => new URLSearchParams(busca);

describe('etapas da apresentação', () => {
  it('tem seis etapas com identificadores únicos', () => {
    expect(TOTAL_ETAPAS).toBe(6);
    expect(new Set(ETAPAS.map((etapa) => etapa.id)).size).toBe(TOTAL_ETAPAS);
  });

  it('lê a etapa da URL em base 1', () => {
    expect(lerEtapa(consulta(''))).toBe(0);
    expect(lerEtapa(consulta('etapa=1'))).toBe(0);
    expect(lerEtapa(consulta('etapa=4'))).toBe(3);
  });

  it('aceita o identificador da etapa', () => {
    expect(lerEtapa(consulta('etapa=conta'))).toBe(4);
    expect(lerEtapa(consulta('etapa=inexistente'))).toBe(0);
  });

  it('prende a etapa dentro do roteiro', () => {
    expect(lerEtapa(consulta('etapa=0'))).toBe(0);
    expect(lerEtapa(consulta('etapa=-3'))).toBe(0);
    expect(lerEtapa(consulta('etapa=99'))).toBe(TOTAL_ETAPAS - 1);
  });

  it('escreve a etapa de volta na URL', () => {
    expect(escreverEtapa(0)).toEqual({ etapa: '1' });
    expect(escreverEtapa(5)).toEqual({ etapa: '6' });
    expect(escreverEtapa(50)).toEqual({ etapa: String(TOTAL_ETAPAS) });
  });

  it('devolve a etapa pelo índice, mesmo fora da faixa', () => {
    expect(etapaPorIndice(2).id).toBe('cache');
    expect(etapaPorIndice(-1).id).toBe(ETAPAS[0]?.id);
    expect(etapaPorIndice(99).id).toBe(ETAPAS[TOTAL_ETAPAS - 1]?.id);
  });

  it('só a etapa do cache reserva as setas para a reprodução', () => {
    expect(ETAPAS.filter((etapa) => etapa.setasOcupadas).map((etapa) => etapa.id)).toEqual([
      'cache',
    ]);
  });
});
