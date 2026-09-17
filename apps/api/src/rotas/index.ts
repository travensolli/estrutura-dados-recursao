import { type FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { rotaSaude } from './saude';
import { rotaSequencias } from './sequencias';

/** Registra todas as rotas da API. */
export const rotas: FastifyPluginAsyncZod = async (app) => {
  await app.register(rotaSaude);
  await app.register(rotaSequencias);
};
