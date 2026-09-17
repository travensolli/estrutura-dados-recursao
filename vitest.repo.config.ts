import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['scripts/testes/**/*.test.ts'],
    testTimeout: 30_000,
  },
});
