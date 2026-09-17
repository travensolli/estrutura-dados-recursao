import {
  type ArvoreRequisicaoSchema,
  ArvoreRespostaSchema,
  type CalcularRequisicaoSchema,
  CalcularRespostaSchema,
  type CompararRequisicaoSchema,
  CompararRespostaSchema,
  ErroSchema,
  type EstimativaConsultaSchema,
  EstimativaRespostaSchema,
  SaudeRespostaSchema,
  SequenciasRespostaSchema,
  type SerieRequisicaoSchema,
  SerieRespostaSchema,
} from '@sequencias/contrato';
import type { z } from 'zod';

export type CalcularEntrada = z.input<typeof CalcularRequisicaoSchema>;
export type CompararEntrada = z.input<typeof CompararRequisicaoSchema>;
export type SerieEntrada = z.input<typeof SerieRequisicaoSchema>;
export type ArvoreEntrada = z.input<typeof ArvoreRequisicaoSchema>;
export type EstimativaEntrada = z.input<typeof EstimativaConsultaSchema>;

/** Erro de comunicação ou de negócio, com código estável e mensagem em PT-BR. */
export class ErroApi extends Error {
  readonly codigo: string;
  readonly status: number;
  readonly detalhes: unknown;

  constructor(codigo: string, mensagem: string, status: number, detalhes?: unknown) {
    super(mensagem);
    this.name = 'ErroApi';
    this.codigo = codigo;
    this.status = status;
    this.detalhes = detalhes;
  }
}

const BASE = import.meta.env.VITE_API_URL ?? '';

function analisarJson(texto: string): unknown {
  if (!texto) return null;
  try {
    return JSON.parse(texto);
  } catch {
    return null;
  }
}

async function requisitar<T extends z.ZodType>(
  caminho: string,
  schema: T,
  init: RequestInit = {},
): Promise<z.output<T>> {
  let resposta: Response;
  try {
    resposta = await fetch(`${BASE}${caminho}`, {
      ...init,
      headers: { accept: 'application/json', 'content-type': 'application/json', ...init.headers },
    });
  } catch (erro) {
    if (erro instanceof DOMException && erro.name === 'AbortError') {
      throw new ErroApi('CANCELADO', 'Cálculo cancelado.', 0);
    }
    throw new ErroApi(
      'INDISPONIVEL',
      'Não foi possível falar com a API. Verifique se o servidor está rodando.',
      0,
      erro,
    );
  }

  const corpo = analisarJson(await resposta.text());

  if (!resposta.ok) {
    const erro = ErroSchema.safeParse(corpo);
    if (erro.success) {
      throw new ErroApi(erro.data.codigo, erro.data.mensagem, resposta.status, erro.data.detalhes);
    }
    throw new ErroApi(
      'ERRO_INTERNO',
      `A API respondeu com o erro ${resposta.status}. Tente novamente em instantes.`,
      resposta.status,
      corpo,
    );
  }

  const analise = schema.safeParse(corpo);
  if (!analise.success) {
    throw new ErroApi(
      'RESPOSTA_INVALIDA',
      'A resposta da API não está no formato esperado.',
      resposta.status,
      analise.error.issues,
    );
  }
  return analise.data;
}

function post<T extends z.ZodType>(
  caminho: string,
  corpo: unknown,
  schema: T,
  sinal?: AbortSignal,
) {
  return requisitar(caminho, schema, {
    method: 'POST',
    body: JSON.stringify(corpo),
    signal: sinal,
  });
}

export const api = {
  saude: (sinal?: AbortSignal) => requisitar('/api/saude', SaudeRespostaSchema, { signal: sinal }),

  sequencias: (sinal?: AbortSignal) =>
    requisitar('/api/sequencias', SequenciasRespostaSchema, { signal: sinal }),

  estimativa: (consulta: EstimativaEntrada, sinal?: AbortSignal) => {
    const parametros = new URLSearchParams({
      sequencia: consulta.sequencia,
      n: String(consulta.n),
      modo: consulta.modo,
    });
    return requisitar(`/api/estimativa?${parametros}`, EstimativaRespostaSchema, { signal: sinal });
  },

  calcular: (corpo: CalcularEntrada, sinal?: AbortSignal) =>
    post('/api/calcular', corpo, CalcularRespostaSchema, sinal),

  comparar: (corpo: CompararEntrada, sinal?: AbortSignal) =>
    post('/api/comparar', corpo, CompararRespostaSchema, sinal),

  serie: (corpo: SerieEntrada, sinal?: AbortSignal) =>
    post('/api/serie', corpo, SerieRespostaSchema, sinal),

  arvore: (corpo: ArvoreEntrada, sinal?: AbortSignal) =>
    post('/api/arvore', corpo, ArvoreRespostaSchema, sinal),
};
