import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { RotuloModo } from './RotuloModo';

describe('RotuloModo', () => {
  it('escreve o nome do modo, sem depender da cor', () => {
    render(<RotuloModo modo="sem_cache" />);
    expect(screen.getByText('sem cache')).toBeInTheDocument();
  });

  it('esconde o traço colorido de leitores de tela', () => {
    const { container } = render(<RotuloModo modo="com_cache" />);
    expect(container.querySelector('[aria-hidden="true"]')).toHaveClass('bg-serie-com-cache');
  });
});
