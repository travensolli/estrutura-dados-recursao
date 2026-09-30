import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { executarInstrumentado } from '../../plano-b/nucleo-adaptador';
import { Contadores } from './Contadores';

function metricas(limiteNos?: number) {
  return executarInstrumentado('tribonacci', 7, 'sem_cache', { comArvore: true, limiteNos });
}

describe('Contadores', () => {
  it('lista os números da execução, cada rótulo ao lado do seu valor', () => {
    render(<Contadores metricas={metricas().metricas} />);
    expect(screen.getByText('invocações').nextElementSibling).toHaveTextContent('46');
    expect(screen.getByText('chamadas recursivas').nextElementSibling).toHaveTextContent('45');
    expect(screen.getByText('casos base').nextElementSibling).toHaveTextContent('31');
    expect(screen.getByText('profundidade máxima').nextElementSibling).toHaveTextContent('6');
    expect(screen.queryByText('nós desenhados')).toBeNull();
  });

  it('avisa quantos nós foram desenhados quando a árvore veio cortada', () => {
    const execucao = metricas(10);
    render(<Contadores metricas={execucao.metricas} nosExibidos={execucao.nosExibidos} />);
    expect(screen.getByText('nós desenhados').nextElementSibling).toHaveTextContent(
      String(execucao.nosExibidos),
    );
  });
});
