import {
  DESCRICAO_SEQUENCIAS,
  LIMIAR_CONFIRMACAO_INVOCACOES,
  LIMITES_N,
  LIMITE_NOS_ARVORE_MAXIMO,
  LIMITE_NOS_ARVORE_PADRAO,
  SEQUENCIAS,
  SequenciasRespostaSchema,
  type SequenciasResposta,
} from '@sequencias/contrato';
import { type FastifyPluginAsyncZod } from 'fastify-type-provider-zod';

/** Os limites publicados são os do ambiente node, que é quem executa aqui. */
export function metadadosDasSequencias(): SequenciasResposta {
  return {
    sequencias: SEQUENCIAS.map((id) => ({
      ...DESCRICAO_SEQUENCIAS[id],
      limites: LIMITES_N.node[id],
    })),
    limite_nos_arvore_padrao: LIMITE_NOS_ARVORE_PADRAO,
    limite_nos_arvore_maximo: LIMITE_NOS_ARVORE_MAXIMO,
    limiar_confirmacao_invocacoes: LIMIAR_CONFIRMACAO_INVOCACOES,
  };
}

export const rotaSequencias: FastifyPluginAsyncZod = async (app) => {
  app.get(
    '/api/sequencias',
    {
      schema: {
        operationId: 'sequencias',
        summary: 'Metadados das três sequências',
        description:
          'Nome, fórmula, casos base, primeiros termos, crescimento em cada modo e maior n aceito pela API.',
        tags: ['diagnóstico'],
        response: { 200: SequenciasRespostaSchema },
      },
    },
    async () => metadadosDasSequencias(),
  );
};
