import { z } from 'zod';

export const SEQUENCIAS = ['fatorial', 'fibonacci', 'tribonacci'] as const;
export const SequenciaSchema = z.enum(SEQUENCIAS);
export type Sequencia = z.infer<typeof SequenciaSchema>;

export const MODOS = ['sem_cache', 'com_cache'] as const;
export const ModoSchema = z.enum(MODOS);
export type Modo = z.infer<typeof ModoSchema>;

export const AMBIENTES = ['node', 'navegador'] as const;
export const AmbienteSchema = z.enum(AMBIENTES);
export type Ambiente = z.infer<typeof AmbienteSchema>;

/** Argumento aceito pelas funções: inteiro seguro e não negativo. */
export const NSchema = z
  .number({ error: 'n deve ser um número' })
  .int({ error: 'n deve ser um número inteiro' })
  .nonnegative({ error: 'n não pode ser negativo' });

/** Variante para query string, em que n chega como texto. */
export const NQuerySchema = z.coerce
  .number({ error: 'n deve ser um número' })
  .int({ error: 'n deve ser um número inteiro' })
  .nonnegative({ error: 'n não pode ser negativo' });

export interface DescricaoSequencia {
  id: Sequencia;
  nome: string;
  formula: string;
  casos_base: string;
  primeiros_termos: string[];
  crescimento_sem_cache: string;
  crescimento_com_cache: string;
}

export const DESCRICAO_SEQUENCIAS: Record<Sequencia, DescricaoSequencia> = {
  fatorial: {
    id: 'fatorial',
    nome: 'Fatorial',
    formula: 'f(n) = n · f(n-1)',
    casos_base: 'f(0) = f(1) = 1',
    primeiros_termos: ['1', '1', '2', '6', '24', '120', '720', '5040'],
    crescimento_sem_cache: 'linear: n invocações',
    crescimento_com_cache: 'linear: n invocações (o cache não evita nenhuma chamada)',
  },
  fibonacci: {
    id: 'fibonacci',
    nome: 'Fibonacci',
    formula: 'f(n) = f(n-1) + f(n-2)',
    casos_base: 'f(0) = f(1) = 1',
    primeiros_termos: ['1', '1', '2', '3', '5', '8', '13', '21'],
    crescimento_sem_cache: 'exponencial: aproximadamente 1,618ⁿ',
    crescimento_com_cache: 'linear: 2n - 1 invocações',
  },
  tribonacci: {
    id: 'tribonacci',
    nome: 'Tribonacci',
    formula: 'f(n) = f(n-1) + f(n-2) + f(n-3)',
    casos_base: 'f(0) = f(1) = f(2) = 1',
    primeiros_termos: ['1', '1', '1', '3', '5', '9', '17', '31'],
    crescimento_sem_cache: 'exponencial: aproximadamente 1,839ⁿ',
    crescimento_com_cache: 'linear: 3n - 5 invocações',
  },
};
