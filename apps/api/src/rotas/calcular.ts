import {
  CalcularRequisicaoSchema,
  CalcularRespostaSchema,
  type CalcularResposta,
} from '@sequencias/contrato';
import { type FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { respostasDeErro } from '../http/erros';
import { executarTrabalho } from '../trabalho/servico';

export const rotaCalcular: FastifyPluginAsyncZod = async (app) => {
  app.post(
    '/api/calcular',
    {
      schema: {
        operationId: 'calcular',
        summary: 'Cálculo instrumentado de um n',
        description:
          'Executa a recursão contando invocações, casos base, cálculos, acertos de cache e profundidade. A duração é só indicativa: o benchmark está em /api/comparar.',
        tags: ['cálculo'],
        body: CalcularRequisicaoSchema,
        response: { 200: CalcularRespostaSchema, ...respostasDeErro(400, 422, 500, 504) },
      },
    },
    async ({ body }): Promise<CalcularResposta> => {
      const { sequencia, n, modo } = body;
      return executarTrabalho({ tipo: 'calcular', sequencia, n, modo });
    },
  );
};
