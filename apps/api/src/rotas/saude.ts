import { SaudeRespostaSchema } from '@sequencias/contrato';
import { type FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { config } from '../config';

export const rotaSaude: FastifyPluginAsyncZod = async (app) => {
  app.get(
    '/api/saude',
    {
      schema: {
        operationId: 'saude',
        summary: 'Estado do servidor',
        description: 'Confirma que a API responde e informa a versão e o tempo no ar.',
        tags: ['diagnóstico'],
        response: { 200: SaudeRespostaSchema },
      },
    },
    async () => ({
      status: 'ok' as const,
      versao: config.versao,
      node: process.version,
      tempo_ativo_s: Math.round(process.uptime()),
    }),
  );
};
