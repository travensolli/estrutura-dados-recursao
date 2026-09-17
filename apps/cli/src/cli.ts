import { parseArgs } from 'node:util';
import {
  DESCRICAO_SEQUENCIAS,
  ErroSequencia,
  LIMITE_NOS_ARVORE_PADRAO,
  MODOS,
  SEQUENCIAS,
  limitesNCli,
  type Modo,
  type Sequencia,
} from '@sequencias/contrato';
import {
  arvoreParaTexto,
  executarInstrumentado,
  executarProtegido,
  validarN,
  type ResultadoInstrumentado,
} from '@sequencias/nucleo';
import {
  blocoAcertos,
  blocoInvocacoesPorArgumento,
  blocoMetricas,
  blocoObservacao,
  cabecalho,
  formatarInteiro,
  formatarValor,
} from './formatacao';

export interface ResultadoCli {
  saida: string;
  codigo: number;
}

interface Pedido {
  sequencia: Sequencia;
  n: number;
  modo: Modo;
  arvore: boolean;
  limiteNos: number;
  json: boolean;
}

const OPCOES = {
  modo: { type: 'string', default: 'sem_cache' },
  arvore: { type: 'boolean', default: false },
  'limite-nos': { type: 'string', default: String(LIMITE_NOS_ARVORE_PADRAO) },
  json: { type: 'boolean', default: false },
  ajuda: { type: 'boolean', default: false },
} as const;

export function textoAjuda(): string {
  const limites = SEQUENCIAS.map((sequencia) => {
    const { sem_cache, com_cache } = limitesNCli(sequencia);
    const nome = DESCRICAO_SEQUENCIAS[sequencia].nome.padEnd(11);
    return `  ${nome}sem cache até ${String(sem_cache).padEnd(6)}com cache até ${com_cache}`;
  });
  return [
    'Uso: pnpm cli <sequencia> <n> [opções]',
    '',
    'Sequências: fatorial, fibonacci, tribonacci',
    '',
    'Opções:',
    '  --modo <sem_cache|com_cache>  estratégia de cálculo (padrão: sem_cache)',
    '  --arvore                      mostra a árvore de chamadas indentada',
    `  --limite-nos <n>              nós exibidos na árvore (padrão: ${LIMITE_NOS_ARVORE_PADRAO})`,
    '  --json                        imprime o resultado em JSON',
    '  --ajuda                       mostra esta mensagem',
    '',
    'Exemplos:',
    '  pnpm cli tribonacci 7 --modo sem_cache --arvore',
    '  pnpm cli fibonacci 10 --modo com_cache',
    '  pnpm cli fatorial 10 --json',
    '',
    'Limites de n neste ambiente:',
    ...limites,
  ].join('\n');
}

// parseArgs leria "-3" como opção curta; a marca invisível protege números
// negativos até a validação, que é quem dá a mensagem correta.
const MARCA_NEGATIVO = '\u0000';
const NUMERO_NEGATIVO = /^-\d/;

function protegerNegativos(argv: string[]): string[] {
  return argv.map((token) => (NUMERO_NEGATIVO.test(token) ? MARCA_NEGATIVO + token : token));
}

function semMarca(texto: string): string {
  return texto.startsWith(MARCA_NEGATIVO) ? texto.slice(MARCA_NEGATIVO.length) : texto;
}

function codigoDoErro(erro: unknown): string | undefined {
  if (typeof erro !== 'object' || erro === null || !('code' in erro)) return undefined;
  const { code } = erro as { code: unknown };
  return typeof code === 'string' ? code : undefined;
}

function mensagemDeParse(erro: unknown): string {
  const mensagem = erro instanceof Error ? erro.message : String(erro);
  const token = /'([^']+)'/.exec(mensagem)?.[1]?.replace(' <value>', '');
  const codigo = codigoDoErro(erro);
  if (codigo === 'ERR_PARSE_ARGS_UNKNOWN_OPTION') {
    return token === undefined ? 'opção desconhecida.' : `opção desconhecida: ${token}.`;
  }
  if (codigo === 'ERR_PARSE_ARGS_INVALID_OPTION_VALUE') {
    return token === undefined
      ? 'uma opção ficou sem valor.'
      : `a opção ${token} precisa de um valor.`;
  }
  return 'não consegui entender as opções informadas.';
}

function paraNumero(texto: string): number {
  const limpo = texto.trim();
  return limpo === '' ? Number.NaN : Number(limpo);
}

function validarSequencia(texto: string): Sequencia {
  if ((SEQUENCIAS as readonly string[]).includes(texto)) return texto as Sequencia;
  throw new ErroSequencia(
    'ENTRADA_INVALIDA',
    `sequência desconhecida: "${texto}". Use fatorial, fibonacci ou tribonacci.`,
  );
}

function validarModo(texto: string): Modo {
  if ((MODOS as readonly string[]).includes(texto)) return texto as Modo;
  throw new ErroSequencia(
    'ENTRADA_INVALIDA',
    `modo inválido: "${texto}". Use sem_cache ou com_cache.`,
  );
}

function validarLimiteNos(texto: string): number {
  const valor = paraNumero(texto);
  if (!Number.isInteger(valor) || valor < 1) {
    throw new ErroSequencia(
      'ENTRADA_INVALIDA',
      `--limite-nos precisa de um inteiro maior ou igual a 1 (recebido: "${texto}").`,
    );
  }
  return valor;
}

function validarNComDica(n: number, sequencia: Sequencia, modo: Modo): void {
  try {
    validarN(n, limitesNCli(sequencia)[modo]);
  } catch (erro) {
    if (erro instanceof ErroSequencia && erro.codigo === 'LIMITE_EXCEDIDO') {
      const { sem_cache, com_cache } = limitesNCli(sequencia);
      const nome = DESCRICAO_SEQUENCIAS[sequencia].nome;
      throw new ErroSequencia(
        'LIMITE_EXCEDIDO',
        `${erro.message} ${nome} vai até n = ${sem_cache} sem cache e n = ${com_cache} com cache.`,
      );
    }
    throw erro;
  }
}

function blocoArvore(resultado: ResultadoInstrumentado, limiteNos: number): string[] {
  const { raiz, metricas, nosExibidos, truncada } = resultado;
  if (raiz === null) return ['Árvore de chamadas', '  nenhum nó coube no limite pedido'];
  const linhas = [
    `Árvore de chamadas (${formatarInteiro(nosExibidos)} de ${formatarInteiro(metricas.invocacoes)} nós)`,
    arvoreParaTexto(raiz),
  ];
  if (truncada) {
    linhas.push(
      `Árvore cortada no limite de ${formatarInteiro(limiteNos)} nós: use --limite-nos para ver mais.`,
    );
  }
  return linhas;
}

function montarTexto(pedido: Pedido, resultado: ResultadoInstrumentado): string {
  const { metricas } = resultado;
  const blocos: string[][] = [
    cabecalho(pedido.sequencia, pedido.n, pedido.modo),
    [`Valor: ${formatarValor(metricas.valor)}`],
    blocoMetricas(metricas),
    blocoInvocacoesPorArgumento(metricas),
    blocoAcertos(metricas),
    blocoObservacao(pedido.sequencia, pedido.modo, metricas),
  ];
  if (pedido.arvore) blocos.push(blocoArvore(resultado, pedido.limiteNos));
  return blocos
    .filter((bloco) => bloco.length > 0)
    .map((bloco) => bloco.join('\n'))
    .join('\n\n');
}

function montarJson(pedido: Pedido, resultado: ResultadoInstrumentado): string {
  return JSON.stringify(
    {
      sequencia: pedido.sequencia,
      n: pedido.n,
      modo: pedido.modo,
      valor: resultado.metricas.valor,
      digitos: resultado.metricas.digitos,
      metricas: resultado.metricas,
      arvore: pedido.arvore ? resultado.raiz : null,
      truncada: resultado.truncada,
      limite_nos: pedido.limiteNos,
      nos_exibidos: resultado.nosExibidos,
    },
    null,
    2,
  );
}

function mensagemDeErro(erro: unknown): string {
  const detalhe = erro instanceof Error ? erro.message : String(erro);
  return `Erro: ${detalhe}\nUse --ajuda para ver as opções e os limites.`;
}

/** Ponto único de entrada da CLI: recebe os argumentos e devolve texto e código. */
export function executarCli(argv: string[]): ResultadoCli {
  try {
    let analisado;
    try {
      analisado = parseArgs({
        args: protegerNegativos(argv),
        options: OPCOES,
        allowPositionals: true,
      });
    } catch (erro) {
      throw new ErroSequencia('ENTRADA_INVALIDA', mensagemDeParse(erro));
    }

    const { values, positionals } = analisado;
    if (values.ajuda) return { saida: textoAjuda(), codigo: 0 };
    if (positionals.length === 0) {
      return { saida: `Erro: informe a sequência e o n.\n\n${textoAjuda()}`, codigo: 1 };
    }

    const sequencia = validarSequencia(semMarca(positionals[0] ?? ''));
    const modo = validarModo(semMarca(values.modo));
    const limiteNos = validarLimiteNos(semMarca(values['limite-nos']));
    if (positionals.length < 2) {
      throw new ErroSequencia('ENTRADA_INVALIDA', 'informe o valor de n depois da sequência.');
    }
    const n = paraNumero(semMarca(positionals[1] ?? ''));
    validarNComDica(n, sequencia, modo);

    const pedido: Pedido = {
      sequencia,
      n,
      modo,
      arvore: values.arvore,
      limiteNos,
      json: values.json,
    };
    const resultado = executarProtegido(() =>
      executarInstrumentado(sequencia, n, modo, { comArvore: pedido.arvore, limiteNos }),
    );
    return {
      saida: pedido.json ? montarJson(pedido, resultado) : montarTexto(pedido, resultado),
      codigo: 0,
    };
  } catch (erro) {
    return { saida: mensagemDeErro(erro), codigo: 1 };
  }
}
