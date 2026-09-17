import {
  SerieRequisicaoSchema,
  SerieRespostaSchema,
  type SerieResposta,
} from '@sequencias/contrato';
import { type FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { respostasDeErro } from '../http/erros';
import { executarTrabalho } from '../trabalho/servico';

export const rotaSerie: FastifyPluginAsyncZod = async (app) => {
  app.post(
    '/api/serie',
    {
      schema: {
        operationId: 'serie',
        summary: 'Pontos de tempo e invocações para os gráficos',
        description:
          'Mede um intervalo de n de uma vez. O tempo sem cache vem nulo nos pontos acima do limite desse modo. As medições usam blocos curtos, para a série inteira caber no prazo: a comparação rigorosa de um n é /api/comparar.',
        tags: ['desempenho'],
        body: SerieRequisicaoSchema,
        response: { 200: SerieRespostaSchema, ...respostasDeErro(400, 422, 500, 504) },
      },
    },
    async ({ body }): Promise<SerieResposta> => {
      const { sequencia, n_inicial, n_final, passo, repeticoes } = body;
      return executarTrabalho({ tipo: 'serie', sequencia, n_inicial, n_final, passo, repeticoes });
    },
  );
};
