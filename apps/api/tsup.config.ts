import { defineConfig } from 'tsup';

export default defineConfig({
  // Nomes explícitos deixam servidor.js e trabalhador.js lado a lado em dist.
  entry: { servidor: 'src/servidor.ts', trabalhador: 'src/trabalho/trabalhador.ts' },
  format: ['esm'],
  target: 'node22',
  platform: 'node',
  clean: true,
  sourcemap: true,
  noExternal: ['@sequencias/nucleo', '@sequencias/contrato'],
});
