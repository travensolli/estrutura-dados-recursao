import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterAll, afterEach, beforeAll } from 'vitest';
import { servidorMock } from '../mocks/servidor';

beforeAll(() => servidorMock.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  servidorMock.resetHandlers();
  cleanup();
});
afterAll(() => servidorMock.close());
