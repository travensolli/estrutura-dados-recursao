import { type FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { rotaArvore } from './arvore';
import { rotaCalcular } from './calcular';
import { rotaComparar } from './comparar';
import { rotaEstimativa } from './estimativa';
import { rotaSaude } from './saude';
import { rotaSequencias } from './sequencias';
import { rotaSerie } from './serie';

/** Registra todas as rotas da API. */
export const rotas: FastifyPluginAsyncZod = async (app) => {
  await app.register(rotaSaude);
  await app.register(rotaSequencias);
  await app.register(rotaEstimativa);
  await app.register(rotaCalcular);
  await app.register(rotaArvore);
  await app.register(rotaComparar);
  await app.register(rotaSerie);
};
