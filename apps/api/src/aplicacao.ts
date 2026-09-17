import cors from '@fastify/cors';
import Fastify, {
  type FastifyBaseLogger,
  type FastifyInstance,
  type RawReplyDefaultExpression,
  type RawRequestDefaultExpression,
  type RawServerDefault,
} from 'fastify';
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod';
import { erroDeRotaDesconhecida, respostaDeErro } from './http/erros';
import { rotas } from './rotas';

export type Aplicacao = FastifyInstance<
  RawServerDefault,
  RawRequestDefaultExpression,
  RawReplyDefaultExpression,
  FastifyBaseLogger,
  ZodTypeProvider
>;

/**
 * Monta a aplicação: validação e serialização pelos schemas Zod do contrato,
 * CORS liberado para o ambiente de desenvolvimento e erros sempre no formato
 * { codigo, mensagem }.
 */
export function criarAplicacao(): Aplicacao {
  const app = Fastify({
    logger: process.env.NODE_ENV !== 'test',
  }).withTypeProvider<ZodTypeProvider>();

  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  app.setErrorHandler((erro, requisicao, resposta) => {
    const { status, corpo } = respostaDeErro(erro);
    if (status >= 500) requisicao.log.error({ erro }, 'falha ao atender a requisição');
    return resposta.status(status).send(corpo);
  });

  app.setNotFoundHandler((requisicao, resposta) => {
    const { status, corpo } = respostaDeErro(
      erroDeRotaDesconhecida(requisicao.method, requisicao.url),
    );
    return resposta.status(status).send(corpo);
  });

  void app.register(cors, { origin: true, methods: ['GET', 'POST', 'OPTIONS'] });
  void app.register(rotas);

  return app;
}
