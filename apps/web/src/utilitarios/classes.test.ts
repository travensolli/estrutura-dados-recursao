import { describe, expect, it } from 'vitest';
import { juntarClasses } from './classes';

describe('juntarClasses', () => {
  it('descarta vazios, falsos e indefinidos', () => {
    expect(juntarClasses('a', false, undefined, null, '', 'b')).toBe('a b');
  });
});
