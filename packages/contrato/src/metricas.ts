import { z } from 'zod';

const inteiroNaoNegativo = z.number().int().nonnegative();

export const InvocacoesPorArgumentoSchema = z.array(
  z.object({
    argumento: inteiroNaoNegativo,
    invocacoes: z.number().int().positive(),
  }),
);
export type InvocacoesPorArgumento = z.infer<typeof InvocacoesPorArgumentoSchema>;

/**
 * Convenção de contagem: "invocação" é toda chamada da função, incluindo a
 * raiz, os casos base e os acertos de cache. Ordem de verificação dentro da
 * função: caso base, depois cache, depois cálculo.
 *
 * Invariantes: invocacoes = casos_base + calculados + acertos_cache e
 * chamadas_recursivas = invocacoes - 1. No modo com cache, `calculados`
 * equivale às faltas de cache.
 */
export const MetricasSchema = z.object({
  /** Valor exato da sequência, serializado como texto decimal (bigint). */
  valor: z.string().regex(/^\d+$/, 'valor deve ser um inteiro em texto'),
  digitos: z.number().int().positive(),
  invocacoes: z.number().int().positive(),
  chamadas_recursivas: inteiroNaoNegativo,
  casos_base: inteiroNaoNegativo,
  calculados: inteiroNaoNegativo,
  acertos_cache: inteiroNaoNegativo,
  entradas_cache: inteiroNaoNegativo,
  /** Maior quantidade de quadros da função simultaneamente na pilha (a raiz conta 1). */
  profundidade_maxima: z.number().int().positive(),
  /** Ordenado do maior argumento para o menor. */
  invocacoes_por_argumento: InvocacoesPorArgumentoSchema,
});
export type Metricas = z.infer<typeof MetricasSchema>;
