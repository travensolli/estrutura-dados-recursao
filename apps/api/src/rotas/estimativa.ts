import {
  EstimativaConsultaSchema,
  EstimativaRespostaSchema,
  type EstimativaResposta,
} from '@sequencias/contrato';
import { executarProtegido } from '@sequencias/nucleo';
import { type FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { respostasDeErro } from '../http/erros';
import { estimativaPrecisaDeWorker, montarEstimativa } from '../medicao/estimativa';
import { executarTrabalho } from '../trabalho/servico';

export const rotaEstimativa: FastifyPluginAsyncZod = async (app) => {
  app.get(
    '/api/estimativa',
    {
      schema: {
        operationId: 'estimativa',
        summary: 'Previsão de invocações e profundidade',
        description:
          'Aplica as fórmulas fechadas sem executar o cálculo. As invocações vêm como texto porque podem ser astronômicas. Aceita n acima do limite de execução, só para informar o tamanho.',
        tags: ['diagnóstico'],
        querystring: EstimativaConsultaSchema,
        response: { 200: EstimativaRespostaSchema, ...respostasDeErro(400, 422, 500) },
      },
    },
    async ({ query }): Promise<EstimativaResposta> => {
      const { sequencia, n, modo } = query;
      if (estimativaPrecisaDeWorker(sequencia, n, modo)) {
        return executarTrabalho({ tipo: 'estimativa', sequencia, n, modo });
      }
      return executarProtegido(() => montarEstimativa(sequencia, n, modo));
    },
  );
};
