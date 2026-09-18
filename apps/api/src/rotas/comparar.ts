import {
  CompararRequisicaoSchema,
  CompararRespostaSchema,
  type CompararResposta,
} from '@sequencias/contrato';
import { type FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { respostasDeErro } from '../http/erros';
import { executarTrabalho, pedidoDeComparacao } from '../trabalho/servico';

export const rotaComparar: FastifyPluginAsyncZod = async (app) => {
  app.post(
    '/api/comparar',
    {
      schema: {
        operationId: 'comparar',
        summary: 'Comparação de tempo e memória entre os dois modos',
        description:
          'Mede os dois modos intercalados sobre as funções puras, mede a memória retida pelo cache em execução separada e devolve invocações, fator de aceleração, chamadas evitadas, diferença de memória, ordem de execução e o ambiente da máquina. Vale o limite de n do modo sem cache, que é o mais restrito.',
        tags: ['desempenho'],
        body: CompararRequisicaoSchema,
        response: { 200: CompararRespostaSchema, ...respostasDeErro(400, 422, 500, 504) },
      },
    },
    async ({ body }): Promise<CompararResposta> => {
      const { sequencia, n, repeticoes } = body;
      return executarTrabalho(pedidoDeComparacao(sequencia, n, repeticoes));
    },
  );
};
