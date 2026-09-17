import { z } from 'zod';

export const TIPOS_NO = ['base', 'calculado', 'acerto_cache'] as const;
export const TipoNoSchema = z.enum(TIPOS_NO);
export type TipoNo = z.infer<typeof TipoNoSchema>;

/**
 * Nó da árvore de chamadas. `ordem_entrada` e `ordem_saida` são instantes de
 * um relógio global que avança a cada entrada e a cada saída de função; a
 * pilha no instante t é formada pelos nós com ordem_entrada <= t < ordem_saida.
 * Um nó com `descendentes_ocultos` > 0 teve a subárvore colapsada por
 * orçamento; nesse caso `filhos` vem vazio, mas `valor` continua exato.
 */
export const NoSchema = z.object({
  id: z.number().int().positive(),
  argumento: z.number().int().nonnegative(),
  valor: z.string().regex(/^\d+$/),
  profundidade: z.number().int().nonnegative(),
  tipo: TipoNoSchema,
  ordem_entrada: z.number().int().nonnegative(),
  ordem_saida: z.number().int().positive(),
  get filhos() {
    return z.array(NoSchema);
  },
  descendentes_ocultos: z.number().int().nonnegative().optional(),
});
export type No = z.infer<typeof NoSchema>;
