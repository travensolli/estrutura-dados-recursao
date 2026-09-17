import { ErroSequencia, type CodigoErro, type Erro } from '@sequencias/contrato';
import {
  hasZodFastifySchemaValidationErrors,
  isResponseSerializationError,
} from 'fastify-type-provider-zod';
import { paraErroSequencia } from '../trabalho/erros';

/** Status HTTP de cada código de erro do contrato. */
export const STATUS_POR_CODIGO: Record<CodigoErro, number> = {
  ENTRADA_INVALIDA: 400,
  LIMITE_EXCEDIDO: 422,
  TEMPO_LIMITE: 504,
  PILHA_ESTOURADA: 422,
  CANCELADO: 499,
  NAO_ENCONTRADO: 404,
  ERRO_INTERNO: 500,
};

const MENSAGEM_CORPO = 'Não foi possível ler o corpo da requisição: envie um JSON válido.';
const MENSAGEM_RESPOSTA =
  'A resposta gerada não obedeceu ao contrato da API. O erro foi registrado no servidor.';
const MENSAGEM_ROTA = 'Rota não encontrada. Veja as rotas disponíveis em /docs.';

export function statusDoCodigo(codigo: CodigoErro): number {
  return STATUS_POR_CODIGO[codigo];
}

interface FalhaDeValidacao {
  instancePath: string;
  message?: string;
}

function campoLegivel(instancePath: string): string {
  const campo = instancePath.replace(/^\//, '').replaceAll('/', '.');
  return campo.length > 0 ? campo : 'entrada';
}

/** Primeira falha vira a mensagem; todas viram detalhes campo a campo. */
export function erroDeValidacao(falhas: readonly FalhaDeValidacao[]): ErroSequencia {
  const detalhes = falhas.map((falha) => ({
    campo: campoLegivel(falha.instancePath),
    mensagem: falha.message ?? 'valor inválido',
  }));
  const primeira = detalhes[0];
  const mensagem = primeira ? `${primeira.campo}: ${primeira.mensagem}` : 'Entrada inválida.';
  return new ErroSequencia('ENTRADA_INVALIDA', mensagem, { campos: detalhes });
}

export function erroDeRotaDesconhecida(metodo: string, url: string): ErroSequencia {
  return new ErroSequencia('NAO_ENCONTRADO', MENSAGEM_ROTA, { metodo, url });
}

function statusDe(erro: unknown): number | null {
  const status = (erro as { statusCode?: unknown }).statusCode;
  return typeof status === 'number' ? status : null;
}

/** Erros do próprio Fastify (corpo ilegível, tipo errado) são culpa da entrada. */
function erroDeEntradaDoFastify(erro: unknown, status: number): ErroSequencia {
  const original = erro instanceof Error ? erro.message : String(erro);
  if (status === 404) return new ErroSequencia('NAO_ENCONTRADO', MENSAGEM_ROTA, { original });
  return new ErroSequencia('ENTRADA_INVALIDA', MENSAGEM_CORPO, { original, status });
}

/** Ponto único de tradução: qualquer falha vira erro de domínio com código estável. */
export function traduzirErro(erro: unknown): ErroSequencia {
  if (erro instanceof ErroSequencia) return erro;
  if (hasZodFastifySchemaValidationErrors(erro)) return erroDeValidacao(erro.validation);
  if (typeof erro === 'object' && erro !== null && isResponseSerializationError(erro)) {
    return new ErroSequencia('ERRO_INTERNO', MENSAGEM_RESPOSTA);
  }
  const status = statusDe(erro);
  if (status !== null && status >= 400 && status < 500) return erroDeEntradaDoFastify(erro, status);
  return paraErroSequencia(erro);
}

export interface RespostaDeErro {
  status: number;
  corpo: Erro;
}

export function respostaDeErro(erro: unknown): RespostaDeErro {
  const traduzido = traduzirErro(erro);
  return { status: statusDoCodigo(traduzido.codigo), corpo: traduzido.paraJson() };
}
