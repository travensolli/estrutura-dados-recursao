import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { BarraComparativa, LegendaSeries } from './BarraComparativa';

describe('BarraComparativa', () => {
  it('escreve o nome do modo e o valor de cada série', () => {
    render(
      <BarraComparativa
        titulo="Invocações de Tribonacci f(7)"
        series={[
          { modo: 'sem_cache', valor: 46, texto: '46' },
          { modo: 'com_cache', valor: 16, texto: '16' },
        ]}
        nota="30 chamadas evitadas"
      />,
    );
    expect(screen.getByText('sem cache')).toBeInTheDocument();
    expect(screen.getByText('com cache')).toBeInTheDocument();
    expect(screen.getByText('46')).toBeInTheDocument();
    expect(screen.getByText('16')).toBeInTheDocument();
    expect(screen.getByText('30 chamadas evitadas')).toBeInTheDocument();
  });

  it('a barra maior ocupa toda a escala', () => {
    const { container } = render(
      <BarraComparativa
        titulo="Invocações"
        series={[
          { modo: 'sem_cache', valor: 46 },
          { modo: 'com_cache', valor: 23 },
        ]}
      />,
    );
    const preenchimentos = container.querySelectorAll<HTMLElement>('[style*="width"]');
    expect(preenchimentos[0]?.style.width).toBe('100%');
    expect(preenchimentos[1]?.style.width).toBe('50%');
  });

  it('série sem valor não quebra a escala', () => {
    const { container } = render(
      <BarraComparativa
        titulo="Invocações"
        series={[
          { modo: 'sem_cache', valor: 0 },
          { modo: 'com_cache', valor: 0 },
        ]}
      />,
    );
    const preenchimentos = container.querySelectorAll<HTMLElement>('[style*="width"]');
    expect(preenchimentos[0]?.style.width).toBe('0%');
  });
});

describe('LegendaSeries', () => {
  it('nomeia as duas séries por escrito', () => {
    render(<LegendaSeries />);
    expect(screen.getByText('sem cache')).toBeInTheDocument();
    expect(screen.getByText('com cache')).toBeInTheDocument();
  });
});
