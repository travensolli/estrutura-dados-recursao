import { z } from 'zod';

export const CODIGOS_ERRO = [
  'ENTRADA_INVALIDA',
  'LIMITE_EXCEDIDO',
  'TEMPO_LIMITE',
  'PILHA_ESTOURADA',
  'CANCELADO',
  'NAO_ENCONTRADO',
  'ERRO_INTERNO',
] as const;
export const CodigoErroSchema = z.enum(CODIGOS_ERRO);
export type CodigoErro = z.infer<typeof CodigoErroSchema>;

/** Formato único de erro da API. */
export const ErroSchema = z.object({
  codigo: CodigoErroSchema,
  mensagem: z.string(),
  detalhes: z.unknown().optional(),
});
export type Erro = z.infer<typeof ErroSchema>;

/** Erro de domínio com código estável e mensagem amigável em PT-BR. */
export class ErroSequencia extends Error {
  readonly codigo: CodigoErro;
  readonly detalhes: unknown;

  constructor(codigo: CodigoErro, mensagem: string, detalhes?: unknown) {
    super(mensagem);
    this.name = 'ErroSequencia';
    this.codigo = codigo;
    this.detalhes = detalhes;
  }

  paraJson(): Erro {
    return this.detalhes === undefined
      ? { codigo: this.codigo, mensagem: this.message }
      : { codigo: this.codigo, mensagem: this.message, detalhes: this.detalhes };
  }
}
