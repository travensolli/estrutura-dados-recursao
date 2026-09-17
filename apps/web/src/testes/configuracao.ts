import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterAll, afterEach, beforeAll } from 'vitest';
import { servidorMock } from '../mocks/servidor';

/* jsdom não implementa matchMedia; o mínimo necessário para os ganchos de mídia. */
if (typeof window.matchMedia !== 'function') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (consulta: string): MediaQueryList =>
      ({
        media: consulta,
        matches: false,
        onchange: null,
        addEventListener: () => {},
        removeEventListener: () => {},
        addListener: () => {},
        removeListener: () => {},
        dispatchEvent: () => false,
      }) as unknown as MediaQueryList,
  });
}

beforeAll(() => servidorMock.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  servidorMock.resetHandlers();
  cleanup();
});
afterAll(() => servidorMock.close());
