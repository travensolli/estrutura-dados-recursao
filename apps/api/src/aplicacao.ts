import { SaudeRespostaSchema } from '@sequencias/contrato';
import Fastify from 'fastify';
import { config } from './config';

export function criarAplicacao() {
  const app = Fastify({ logger: process.env.NODE_ENV !== 'test' });

  app.get('/api/saude', async () => {
    return SaudeRespostaSchema.parse({
      status: 'ok',
      versao: config.versao,
      node: process.version,
      tempo_ativo_s: Math.round(process.uptime()),
    });
  });

  return app;
}
