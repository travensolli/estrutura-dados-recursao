import {
  DESCRICAO_SEQUENCIAS,
  LIMITE_NOS_ARVORE_PADRAO,
  MODOS,
  SEQUENCIAS,
  type LimitesN,
  type Modo,
  type Sequencia,
} from '@sequencias/contrato';
import { rotuloModo } from '../utilitarios/formatar';

export interface ConsultaArvore {
  sequencia: Sequencia;
  n: number;
  modo: Modo;
  limite_nos: number;
}

export const CONSULTA_PADRAO: ConsultaArvore = {
  sequencia: 'tribonacci',
  n: 7,
  modo: 'sem_cache',
  limite_nos: LIMITE_NOS_ARVORE_PADRAO,
};

/** Teto oferecido na tela; acima do padrão o desenho já pesa no projetor. */
export const LIMITE_NOS_TELA_MAXIMO = 2000;

export interface ErrosConsulta {
  n?: string;
  limite_nos?: string;
}

function inteiro(texto: string | null, padrao: number): number {
  if (texto === null) return padrao;
  const valor = Number(texto);
  return Number.isInteger(valor) ? valor : padrao;
}

export function lerConsulta(parametros: URLSearchParams): ConsultaArvore {
  const sequencia = parametros.get('sequencia');
  const modo = parametros.get('modo');
  return {
    sequencia: SEQUENCIAS.find((id) => id === sequencia) ?? CONSULTA_PADRAO.sequencia,
    n: inteiro(parametros.get('n'), CONSULTA_PADRAO.n),
    modo: MODOS.find((id) => id === modo) ?? CONSULTA_PADRAO.modo,
    limite_nos: inteiro(parametros.get('limite_nos'), CONSULTA_PADRAO.limite_nos),
  };
}

export function mesmaConsulta(a: ConsultaArvore, b: ConsultaArvore): boolean {
  return (
    a.sequencia === b.sequencia && a.n === b.n && a.modo === b.modo && a.limite_nos === b.limite_nos
  );
}

export function escreverConsulta(consulta: ConsultaArvore): Record<string, string> {
  return {
    sequencia: consulta.sequencia,
    n: String(consulta.n),
    modo: consulta.modo,
    limite_nos: String(consulta.limite_nos),
  };
}

export function validarConsulta(
  consulta: ConsultaArvore,
  limites: LimitesN,
  limiteNosMaximo: number,
): ErrosConsulta {
  const erros: ErrosConsulta = {};
  const limiteN = limites[consulta.modo];
  if (!Number.isInteger(consulta.n) || consulta.n < 0) {
    erros.n = 'n precisa ser um inteiro não negativo.';
  } else if (consulta.n > limiteN) {
    const nome = DESCRICAO_SEQUENCIAS[consulta.sequencia].nome;
    erros.n = `${nome} ${rotuloModo(consulta.modo)} vai até n = ${limiteN}.`;
  }
  if (!Number.isInteger(consulta.limite_nos) || consulta.limite_nos < 1) {
    erros.limite_nos = 'O limite de nós precisa ser um inteiro a partir de 1.';
  } else if (consulta.limite_nos > limiteNosMaximo) {
    erros.limite_nos = `O limite de nós vai até ${limiteNosMaximo}.`;
  }
  return erros;
}

export function consultaValida(erros: ErrosConsulta): boolean {
  return erros.n === undefined && erros.limite_nos === undefined;
}
