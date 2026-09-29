import { z } from 'zod';
import { NoSchema } from './arvore';
import {
  LIMITE_NOS_ARVORE_MAXIMO,
  LIMITE_NOS_ARVORE_PADRAO,
  LimitesNSchema,
  N_MAXIMO_ESTIMATIVA,
  PONTOS_SERIE_MAXIMO,
  REPETICOES_MAXIMO,
  REPETICOES_PADRAO,
} from './limites';
import { MetricasSchema } from './metricas';
import { ModoSchema, NQuerySchema, NSchema, SequenciaSchema } from './sequencias';

const valorTexto = z.string().regex(/^\d+$/);
const nanos = z.number().nonnegative();

// GET /api/saude
export const SaudeRespostaSchema = z.object({
  status: z.literal('ok'),
  versao: z.string(),
  node: z.string(),
  tempo_ativo_s: z.number().nonnegative(),
});
export type SaudeResposta = z.infer<typeof SaudeRespostaSchema>;

// GET /api/sequencias
export const InfoSequenciaSchema = z.object({
  id: SequenciaSchema,
  nome: z.string(),
  formula: z.string(),
  casos_base: z.string(),
  ordem: z.number().int().positive(),
  primeiros_termos: z.array(valorTexto),
  crescimento_sem_cache: z.string(),
  crescimento_com_cache: z.string(),
  limites: LimitesNSchema,
});
export type InfoSequencia = z.infer<typeof InfoSequenciaSchema>;

export const SequenciasRespostaSchema = z.object({
  sequencias: z.array(InfoSequenciaSchema),
  limite_nos_arvore_padrao: z.number().int().positive(),
  limite_nos_arvore_maximo: z.number().int().positive(),
  limiar_confirmacao_invocacoes: z.number().int().positive(),
});
export type SequenciasResposta = z.infer<typeof SequenciasRespostaSchema>;

// GET /api/estimativa?sequencia=&n=&modo=
export const EstimativaConsultaSchema = z.object({
  sequencia: SequenciaSchema,
  n: NQuerySchema.max(N_MAXIMO_ESTIMATIVA, {
    error: `n da estimativa não pode passar de ${N_MAXIMO_ESTIMATIVA}`,
  }),
  modo: ModoSchema,
});
export type EstimativaConsulta = z.infer<typeof EstimativaConsultaSchema>;

export const EstimativaRespostaSchema = z.object({
  sequencia: SequenciaSchema,
  n: NSchema,
  modo: ModoSchema,
  /** Pode ser astronômico, por isso é texto. */
  invocacoes_previstas: valorTexto,
  profundidade_prevista: z.number().int().positive(),
  limite_n: z.number().int().nonnegative(),
  dentro_do_limite: z.boolean(),
  /** Verdadeiro acima do limiar de confirmação. */
  pesado: z.boolean(),
  aviso: z.string().nullable(),
});
export type EstimativaResposta = z.infer<typeof EstimativaRespostaSchema>;

// POST /api/calcular
export const CalcularRequisicaoSchema = z.object({
  sequencia: SequenciaSchema,
  n: NSchema,
  modo: ModoSchema,
});
export type CalcularRequisicao = z.infer<typeof CalcularRequisicaoSchema>;

export const CalcularRespostaSchema = z.object({
  sequencia: SequenciaSchema,
  n: NSchema,
  modo: ModoSchema,
  metricas: MetricasSchema,
  /** Duração da execução instrumentada; apenas indicativa, não é benchmark. */
  duracao_ms: z.number().nonnegative(),
});
export type CalcularResposta = z.infer<typeof CalcularRespostaSchema>;

// POST /api/comparar
export const CompararRequisicaoSchema = z.object({
  sequencia: SequenciaSchema,
  n: NSchema,
  repeticoes: z.number().int().min(1).max(REPETICOES_MAXIMO).default(REPETICOES_PADRAO),
});
export type CompararRequisicao = z.infer<typeof CompararRequisicaoSchema>;

export const EstatisticasTempoSchema = z.object({
  mediana_ns: nanos,
  media_ns: nanos,
  minimo_ns: nanos,
  maximo_ns: nanos,
  desvio_padrao_ns: nanos,
  repeticoes: z.number().int().positive(),
  aquecimentos: z.number().int().nonnegative(),
  /** Em casos muito rápidos cada repetição executa várias vezes e divide. */
  execucoes_por_repeticao: z.number().int().positive(),
});
export type EstatisticasTempo = z.infer<typeof EstatisticasTempoSchema>;

export const MemoriaModoSchema = z.object({
  /** Mediana da diferença de heapUsed após gc(), com o cache ainda referenciado. */
  retida_cache_bytes: z.number(),
  /** Pico aproximado de heapUsed amostrado a cada K invocações; nulo se não amostrado. */
  pico_heap_bytes: z.number().nullable(),
  intervalo_amostragem: z.number().int().positive().nullable(),
  entradas_cache: z.number().int().nonnegative(),
  profundidade_maxima: z.number().int().positive(),
  repeticoes: z.number().int().positive(),
});
export type MemoriaModo = z.infer<typeof MemoriaModoSchema>;

export const AmbienteExecucaoSchema = z.object({
  node: z.string(),
  v8: z.string(),
  plataforma: z.string(),
  arquitetura: z.string(),
  cpu: z.string(),
  nucleos: z.number().int().positive(),
  memoria_total_bytes: z.number().nonnegative(),
});
export type AmbienteExecucao = z.infer<typeof AmbienteExecucaoSchema>;

const porModo = <T extends z.ZodType>(schema: T) =>
  z.object({ sem_cache: schema, com_cache: schema });

export const CompararRespostaSchema = z.object({
  sequencia: SequenciaSchema,
  n: NSchema,
  valor: valorTexto,
  digitos: z.number().int().positive(),
  repeticoes: z.number().int().positive(),
  tempo: porModo(EstatisticasTempoSchema),
  memoria: porModo(MemoriaModoSchema),
  invocacoes: porModo(z.number().int().positive()),
  /** mediana sem cache dividida pela mediana com cache. */
  fator_aceleracao: z.number().nonnegative(),
  chamadas_evitadas: z.number().int().nonnegative(),
  /** memória retida com cache menos memória retida sem cache. */
  diferenca_memoria_bytes: z.number(),
  /** Ordem em que os modos foram medidos (alterna entre rodadas). */
  ordem_execucao: z.array(ModoSchema),
  ambiente: AmbienteExecucaoSchema,
});
export type CompararResposta = z.infer<typeof CompararRespostaSchema>;

// POST /api/serie
export const SerieRequisicaoSchema = z
  .object({
    sequencia: SequenciaSchema,
    n_inicial: NSchema,
    n_final: NSchema,
    passo: z.number().int().min(1).default(1),
    repeticoes: z.number().int().min(1).max(REPETICOES_MAXIMO).default(3),
  })
  .refine((v) => v.n_final >= v.n_inicial, {
    error: 'n_final deve ser maior ou igual a n_inicial',
    path: ['n_final'],
  })
  .refine((v) => Math.floor((v.n_final - v.n_inicial) / v.passo) + 1 <= PONTOS_SERIE_MAXIMO, {
    error: `a série não pode ter mais de ${PONTOS_SERIE_MAXIMO} pontos`,
    path: ['passo'],
  });
export type SerieRequisicao = z.infer<typeof SerieRequisicaoSchema>;

export const PontoSerieSchema = z.object({
  n: NSchema,
  digitos: z.number().int().positive(),
  /** Nulo quando o modo sem cache ultrapassa o limite de n. */
  tempo_ns: z.object({ sem_cache: nanos.nullable(), com_cache: nanos }),
  invocacoes: z.object({
    sem_cache: z.number().int().positive(),
    com_cache: z.number().int().positive(),
  }),
});
export type PontoSerie = z.infer<typeof PontoSerieSchema>;

export const SerieRespostaSchema = z.object({
  sequencia: SequenciaSchema,
  n_inicial: NSchema,
  n_final: NSchema,
  passo: z.number().int().positive(),
  repeticoes: z.number().int().positive(),
  pontos: z.array(PontoSerieSchema),
  ambiente: AmbienteExecucaoSchema,
});
export type SerieResposta = z.infer<typeof SerieRespostaSchema>;

// POST /api/arvore
export const ArvoreRequisicaoSchema = z.object({
  sequencia: SequenciaSchema,
  n: NSchema,
  modo: ModoSchema,
  limite_nos: z
    .number()
    .int()
    .min(1)
    .max(LIMITE_NOS_ARVORE_MAXIMO)
    .default(LIMITE_NOS_ARVORE_PADRAO),
});
export type ArvoreRequisicao = z.infer<typeof ArvoreRequisicaoSchema>;

export const ArvoreRespostaSchema = z.object({
  sequencia: SequenciaSchema,
  n: NSchema,
  modo: ModoSchema,
  /** Métricas da execução completa, calculadas sem montar a árvore inteira. */
  metricas: MetricasSchema,
  raiz: NoSchema,
  truncada: z.boolean(),
  limite_nos: z.number().int().positive(),
  nos_exibidos: z.number().int().positive(),
});
export type ArvoreResposta = z.infer<typeof ArvoreRespostaSchema>;
