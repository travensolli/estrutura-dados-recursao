import { describe, expect, it } from 'vitest';
import { SLIDES, TOTAL_SLIDES, escreverSlide, slidePorIndice, lerSlide } from './slides';

const consulta = (busca: string) => new URLSearchParams(busca);

describe('slides da apresentação', () => {
  it('tem seis slides com identificadores únicos', () => {
    expect(TOTAL_SLIDES).toBe(6);
    expect(new Set(SLIDES.map((slide) => slide.id)).size).toBe(TOTAL_SLIDES);
  });

  it('lê o slide da URL em base 1', () => {
    expect(lerSlide(consulta(''))).toBe(0);
    expect(lerSlide(consulta('slide=1'))).toBe(0);
    expect(lerSlide(consulta('slide=4'))).toBe(3);
  });

  it('aceita o identificador do slide', () => {
    expect(lerSlide(consulta('slide=conta'))).toBe(4);
    expect(lerSlide(consulta('slide=conclusao'))).toBe(5);
    expect(lerSlide(consulta('slide=inexistente'))).toBe(0);
  });

  it('prende o slide dentro do roteiro', () => {
    expect(lerSlide(consulta('slide=0'))).toBe(0);
    expect(lerSlide(consulta('slide=-3'))).toBe(0);
    expect(lerSlide(consulta('slide=99'))).toBe(TOTAL_SLIDES - 1);
  });

  it('escreve o slide de volta na URL', () => {
    expect(escreverSlide(0)).toEqual({ slide: '1' });
    expect(escreverSlide(5)).toEqual({ slide: '6' });
    expect(escreverSlide(50)).toEqual({ slide: String(TOTAL_SLIDES) });
  });

  it('devolve o slide pelo índice, mesmo fora da faixa', () => {
    expect(slidePorIndice(2).id).toBe('cache');
    expect(slidePorIndice(-1).id).toBe(SLIDES[0]?.id);
    expect(slidePorIndice(99).id).toBe(SLIDES[TOTAL_SLIDES - 1]?.id);
  });

  it('só o slide do cache reserva as setas para a reprodução', () => {
    expect(SLIDES.filter((slide) => slide.setasOcupadas).map((slide) => slide.id)).toEqual([
      'cache',
    ]);
  });
});
