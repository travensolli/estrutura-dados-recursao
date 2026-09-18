import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import {
  createJsonSchemaTransform,
  createJsonSchemaTransformObject,
} from 'fastify-type-provider-zod';
import { type Aplicacao } from '../aplicacao';
import { config } from '../config';
import { registroDeSchemas } from './registro-schemas';

export const CAMINHO_DOCUMENTACAO = '/docs';

/** As próprias páginas da documentação ficam fora do documento OpenAPI. */
const ROTAS_IGNORADAS = [
  CAMINHO_DOCUMENTACAO,
  `${CAMINHO_DOCUMENTACAO}/`,
  `${CAMINHO_DOCUMENTACAO}/json`,
  `${CAMINHO_DOCUMENTACAO}/yaml`,
  `${CAMINHO_DOCUMENTACAO}/uiConfig`,
  `${CAMINHO_DOCUMENTACAO}/initOAuth`,
  `${CAMINHO_DOCUMENTACAO}/*`,
  `${CAMINHO_DOCUMENTACAO}/static/*`,
];

export const ETIQUETAS = [
  { name: 'diagnóstico', description: 'Estado do servidor e metadados das sequências' },
  { name: 'cálculo', description: 'Execução instrumentada e árvore de chamadas' },
  { name: 'desempenho', description: 'Comparação entre os modos e séries para os gráficos' },
];

const DESCRICAO = [
  'API do trabalho PRJ.ED.1: Fatorial, Fibonacci e Tribonacci calculados',
  'recursivamente com e sem cache, com métricas de execução, comparação de',
  'tempo e memória e árvore de chamadas.',
  '',
  'Os valores das sequências trafegam como texto decimal, porque JSON não',
  'representa bigint e o tipo number perde precisão acima de 2^53 - 1.',
  'Todo erro segue o formato { codigo, mensagem }.',
].join('\n');

/** Documento OpenAPI gerado dos mesmos schemas Zod usados na validação. */
export function registrarDocumentacao(app: Aplicacao): void {
  void app.register(swagger, {
    openapi: {
      info: {
        title: 'Sequências recursivas: cálculo, cache e desempenho',
        description: DESCRICAO,
        version: config.versao,
      },
      servers: [{ url: `http://localhost:${config.porta}`, description: 'desenvolvimento' }],
      tags: ETIQUETAS,
    },
    transform: createJsonSchemaTransform({
      skipList: ROTAS_IGNORADAS,
      schemaRegistry: registroDeSchemas,
    }),
    transformObject: createJsonSchemaTransformObject({ schemaRegistry: registroDeSchemas }),
  });

  void app.register(swaggerUi, {
    routePrefix: CAMINHO_DOCUMENTACAO,
    uiConfig: { docExpansion: 'list', deepLinking: true, displayRequestDuration: true },
  });
}
