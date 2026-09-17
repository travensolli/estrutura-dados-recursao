import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/servidor.ts'],
  format: ['esm'],
  target: 'node22',
  platform: 'node',
  clean: true,
  sourcemap: true,
  noExternal: ['@sequencias/nucleo', '@sequencias/contrato'],
});
