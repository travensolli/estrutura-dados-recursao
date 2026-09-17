import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { BarraProporcao } from './BarraProporcao';

function preenchimento(container: HTMLElement): HTMLElement {
  const barra = container.firstElementChild?.firstElementChild;
  if (!(barra instanceof HTMLElement)) throw new Error('barra não encontrada');
  return barra;
}

describe('BarraProporcao', () => {
  it('usa a fração do valor sobre o máximo', () => {
    const { container } = render(<BarraProporcao valor={13} maximo={52} />);
    expect(preenchimento(container).style.width).toBe('25%');
  });

  it('não passa de 100% nem fica negativa', () => {
    const { container: acima } = render(<BarraProporcao valor={10} maximo={4} />);
    expect(preenchimento(acima).style.width).toBe('100%');
    const { container: abaixo } = render(<BarraProporcao valor={-2} maximo={4} />);
    expect(preenchimento(abaixo).style.width).toBe('0%');
  });

  it('mantém largura mínima visível quando o valor é pequeno mas existe', () => {
    const { container } = render(<BarraProporcao valor={1} maximo={100000} />);
    expect(preenchimento(container).style.minWidth).toBe('3px');
  });

  it('não desenha nada com máximo zero', () => {
    const { container } = render(<BarraProporcao valor={0} maximo={0} />);
    expect(preenchimento(container).style.width).toBe('0%');
    expect(preenchimento(container).style.minWidth).toBe('');
  });

  it('fica fora da árvore de acessibilidade, porque o número está na tabela', () => {
    const { container } = render(<BarraProporcao valor={1} maximo={2} />);
    expect(container.firstElementChild).toHaveAttribute('aria-hidden', 'true');
  });

  it('pinta cada modo com a cor da sua série', () => {
    const { container: sem } = render(<BarraProporcao valor={1} maximo={2} modo="sem_cache" />);
    expect(preenchimento(sem).className).toContain('bg-serie-sem-cache');
    const { container: com } = render(<BarraProporcao valor={1} maximo={2} modo="com_cache" />);
    expect(preenchimento(com).className).toContain('bg-serie-com-cache');
  });
});
