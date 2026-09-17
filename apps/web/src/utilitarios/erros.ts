import { ErroApi } from '../api/cliente';

export interface DescricaoErro {
  codigo: string;
  titulo: string;
  mensagem: string;
  sugerirReduzirN: boolean;
  sugerirTentarDeNovo: boolean;
  /** Maior n aceito, quando a API informa. */
  limite?: number;
}

interface RegraErro {
  titulo: string;
  reduzir: boolean;
  tentar: boolean;
}

const REGRA_PADRAO: RegraErro = {
  titulo: 'Algo deu errado no servidor',
  reduzir: false,
  tentar: true,
};

const REGRAS: Record<string, RegraErro> = {
  LIMITE_EXCEDIDO: { titulo: 'Esse n passa do limite', reduzir: true, tentar: false },
  TEMPO_LIMITE: { titulo: 'O cálculo passou do tempo limite', reduzir: true, tentar: true },
  PILHA_ESTOURADA: { titulo: 'A recursão ficou funda demais', reduzir: true, tentar: false },
  CANCELADO: { titulo: 'Cálculo cancelado', reduzir: false, tentar: true },
  ENTRADA_INVALIDA: { titulo: 'Confira os valores informados', reduzir: false, tentar: false },
  NAO_ENCONTRADO: { titulo: 'Nada encontrado nesse endereço', reduzir: false, tentar: false },
  INDISPONIVEL: { titulo: 'A API não respondeu', reduzir: false, tentar: true },
  RESPOSTA_INVALIDA: {
    titulo: 'A resposta veio num formato inesperado',
    reduzir: false,
    tentar: true,
  },
  ERRO_INTERNO: REGRA_PADRAO,
};

function limiteDosDetalhes(detalhes: unknown): number | undefined {
  if (typeof detalhes !== 'object' || detalhes === null) return undefined;
  const limite = (detalhes as { limite?: unknown }).limite;
  return typeof limite === 'number' ? limite : undefined;
}

/** Traduz qualquer erro numa descrição humana com a ação sugerida. */
export function descreverErro(erro: unknown): DescricaoErro {
  if (erro instanceof ErroApi) {
    const regra = REGRAS[erro.codigo] ?? REGRA_PADRAO;
    return {
      codigo: erro.codigo,
      titulo: regra.titulo,
      mensagem: erro.message,
      sugerirReduzirN: regra.reduzir,
      sugerirTentarDeNovo: regra.tentar,
      limite: limiteDosDetalhes(erro.detalhes),
    };
  }
  return {
    codigo: 'DESCONHECIDO',
    titulo: 'Algo deu errado',
    mensagem:
      erro instanceof Error && erro.message
        ? erro.message
        : 'Erro inesperado. Tente novamente em instantes.',
    sugerirReduzirN: false,
    sugerirTentarDeNovo: true,
  };
}
