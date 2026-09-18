import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SeloModo } from './Selo';

describe('SeloModo', () => {
  it('identifica o modo por texto, não só por cor', () => {
    const { rerender } = render(<SeloModo modo="sem_cache" />);
    expect(screen.getByText('sem cache')).toBeInTheDocument();
    rerender(<SeloModo modo="com_cache" />);
    expect(screen.getByText('com cache')).toBeInTheDocument();
  });
});
