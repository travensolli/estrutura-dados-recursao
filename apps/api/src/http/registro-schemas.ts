import { NoSchema } from '@sequencias/contrato';
import { z } from 'zod';

export interface MetaDeSchema {
  id?: string | undefined;
  [chave: string]: unknown;
}

/**
 * Schema recursivo precisa de id para virar componente no documento OpenAPI:
 * sem isso o nó da árvore vira uma referência sem destino.
 */
export const registroDeSchemas = z.registry<MetaDeSchema>();

registroDeSchemas.add(NoSchema, { id: 'No' });
