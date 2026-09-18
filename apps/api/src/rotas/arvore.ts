import {
  ArvoreRequisicaoSchema,
  ArvoreRespostaSchema,
  type ArvoreResposta,
} from '@sequencias/contrato';
import { type FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { respostasDeErro } from '../http/erros';
import { executarTrabalho } from '../trabalho/servico';

export const rotaArvore: FastifyPluginAsyncZod = async (app) => {
  app.post(
    '/api/arvore',
    {
      schema: {
        operationId: 'arvore',
        summary: 'Árvore de chamadas da execução',
        description:
          'As métricas são sempre da execução inteira. A árvore devolvida respeita o orçamento de nós: ao estourar, as subárvores viram nós colapsados com a contagem de descendentes ocultos e truncada fica verdadeiro.',
        tags: ['cálculo'],
        body: ArvoreRequisicaoSchema,
        response: { 200: ArvoreRespostaSchema, ...respostasDeErro(400, 422, 500, 504) },
      },
    },
    async ({ body }): Promise<ArvoreResposta> => {
      const { sequencia, n, modo, limite_nos } = body;
      return executarTrabalho({ tipo: 'arvore', sequencia, n, modo, limite_nos });
    },
  );
};
