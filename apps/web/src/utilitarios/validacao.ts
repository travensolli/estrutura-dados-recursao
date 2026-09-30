import { formatarInteiro } from './formatar';

export interface OpcoesInteiro {
  minimo?: number;
  maximo?: number;
  obrigatorio?: boolean;
  /** Nome do campo na mensagem de valor vazio. */
  rotulo?: string;
}

export type ResultadoInteiro =
  | { valido: true; valor: number; mensagem: null }
  | { valido: false; valor: null; mensagem: string };

const APENAS_DIGITOS = /^\d+$/;

/** Valida texto digitado como inteiro dentro de um intervalo fechado. */
export function validarInteiro(texto: string, opcoes: OpcoesInteiro = {}): ResultadoInteiro {
  const { minimo = 0, maximo, obrigatorio = true, rotulo = 'n' } = opcoes;
  const limpo = texto.trim();

  if (limpo === '') {
    return obrigatorio
      ? { valido: false, valor: null, mensagem: `Informe um valor para ${rotulo}.` }
      : { valido: false, valor: null, mensagem: '' };
  }
  if (minimo >= 0 && !APENAS_DIGITOS.test(limpo)) {
    return { valido: false, valor: null, mensagem: 'Use apenas dígitos, sem sinal nem vírgula.' };
  }
  const numero = Number(limpo);
  if (!Number.isFinite(numero)) {
    return { valido: false, valor: null, mensagem: 'Use apenas dígitos, sem sinal nem vírgula.' };
  }
  if (!Number.isInteger(numero)) {
    return { valido: false, valor: null, mensagem: 'Use um número inteiro.' };
  }
  if (numero < minimo) {
    return {
      valido: false,
      valor: null,
      mensagem: `O menor valor aceito é ${formatarInteiro(minimo)}.`,
    };
  }
  if (maximo !== undefined && numero > maximo) {
    return {
      valido: false,
      valor: null,
      mensagem: `O maior valor aceito é ${formatarInteiro(maximo)}.`,
    };
  }
  return { valido: true, valor: numero, mensagem: null };
}

/** Texto curto com os limites do campo, para aparecer sob ele. */
export function descreverIntervalo(minimo: number, maximo?: number): string {
  return maximo === undefined
    ? `a partir de ${formatarInteiro(minimo)}`
    : `de ${formatarInteiro(minimo)} a ${formatarInteiro(maximo)}`;
}
