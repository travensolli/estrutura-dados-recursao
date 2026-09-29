import {
  DESCRICAO_SEQUENCIAS,
  MODOS,
  type AmbienteExecucao,
  type CompararResposta,
  type Modo,
  type Sequencia,
} from '@sequencias/contrato';
import { type DadosRelatorio } from './coleta';

const ROTULO_MODO: Record<Modo, string> = { sem_cache: 'sem cache', com_cache: 'com cache' };

function decimal(valor: number, casas: number): string {
  return valor.toLocaleString('pt-BR', {
    minimumFractionDigits: casas,
    maximumFractionDigits: casas,
  });
}

export function formatarInteiro(valor: number): string {
  return Math.round(valor).toLocaleString('pt-BR');
}

/** Escolhe a unidade de tempo pela ordem de grandeza. */
export function formatarDuracao(ns: number): string {
  if (ns < 1_000) return `${decimal(ns, 0)} ns`;
  if (ns < 1_000_000) return `${decimal(ns / 1_000, 2)} µs`;
  if (ns < 1_000_000_000) return `${decimal(ns / 1_000_000, 2)} ms`;
  return `${decimal(ns / 1_000_000_000, 3)} s`;
}

export function formatarBytes(bytes: number): string {
  const sinal = bytes < 0 ? '-' : '';
  const absoluto = Math.abs(bytes);
  if (absoluto < 1024) return `${sinal}${decimal(absoluto, 0)} B`;
  if (absoluto < 1024 ** 2) return `${sinal}${decimal(absoluto / 1024, 1)} KiB`;
  if (absoluto < 1024 ** 3) return `${sinal}${decimal(absoluto / 1024 ** 2, 2)} MiB`;
  return `${sinal}${decimal(absoluto / 1024 ** 3, 2)} GiB`;
}

export function formatarFator(valor: number): string {
  if (valor >= 100) return `${decimal(valor, 0)}×`;
  if (valor >= 10) return `${decimal(valor, 1)}×`;
  return `${decimal(valor, 2)}×`;
}

/** Valores enormes aparecem pelos primeiros dígitos e pelo total de dígitos. */
export function abreviarValor(valor: string, digitos: number): string {
  if (valor.length <= 24) return valor;
  return `${valor.slice(0, 8)}... (${formatarInteiro(digitos)} dígitos)`;
}

export function formatarInstante(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR');
}

function tabela(cabecalho: readonly string[], linhas: readonly (readonly string[])[]): string {
  const linha = (celulas: readonly string[]) => `| ${celulas.join(' | ')} |`;
  return [linha(cabecalho), linha(cabecalho.map(() => '---')), ...linhas.map(linha)].join('\n');
}

function secaoMaquina(ambiente: AmbienteExecucao, dados: DadosRelatorio): string {
  const argumentos = dados.argumentos_node;
  return [
    '## Máquina e versões',
    '',
    tabela(
      ['item', 'valor'],
      [
        ['Processador', ambiente.cpu],
        ['Núcleos lógicos', formatarInteiro(ambiente.nucleos)],
        ['Memória total', formatarBytes(ambiente.memoria_total_bytes)],
        ['Sistema', `${ambiente.plataforma} (${ambiente.arquitetura})`],
        ['Node', ambiente.node],
        ['V8', ambiente.v8],
        ['Argumentos do Node', argumentos.length > 0 ? `\`${argumentos.join(' ')}\`` : 'nenhum'],
        ['Duração total da coleta', formatarDuracao(dados.duracao_total_ms * 1e6)],
      ],
    ),
  ].join('\n');
}

function secaoParametros(dados: DadosRelatorio): string {
  const { parametros, plano } = dados;
  return [
    '## Parâmetros da medição',
    '',
    tabela(
      ['parâmetro', 'valor'],
      [
        ['Repetições pedidas por comparação', formatarInteiro(plano.repeticoes)],
        [
          'Duração mínima de cada bloco medido',
          formatarDuracao(parametros.duracao_minima_bloco_ns),
        ],
        ['Orçamento de tempo por comparação', formatarDuracao(parametros.orcamento_comparacao_ns)],
        ['Repetições da medição de memória', formatarInteiro(parametros.repeticoes_memoria)],
        [
          'Amostragem do pico de heap',
          `a cada ${formatarInteiro(parametros.intervalo_amostragem)} invocações`,
        ],
        ['Prazo de cada trabalho', formatarDuracao(parametros.prazo_ms * 1e6)],
        ['Pilha do worker', `${formatarInteiro(parametros.pilha_mb)} MB`],
      ],
    ),
  ].join('\n');
}

function linhaDoResumo(comparacao: CompararResposta): string[] {
  return [
    DESCRICAO_SEQUENCIAS[comparacao.sequencia].nome,
    formatarInteiro(comparacao.n),
    formatarInteiro(comparacao.invocacoes.sem_cache),
    formatarInteiro(comparacao.invocacoes.com_cache),
    formatarInteiro(comparacao.chamadas_evitadas),
    formatarFator(comparacao.fator_aceleracao),
    formatarBytes(comparacao.diferenca_memoria_bytes),
  ];
}

function secaoResumo(comparacoes: readonly CompararResposta[]): string {
  return [
    '## Resumo no maior n de cada sequência',
    '',
    tabela(
      [
        'sequência',
        'n',
        'invocações sem cache',
        'invocações com cache',
        'chamadas evitadas',
        'aceleração',
        'memória a mais com cache',
      ],
      comparacoes.map(linhaDoResumo),
    ),
  ].join('\n');
}

function tabelaDeInvocacoes(comparacoes: readonly CompararResposta[]): string {
  return tabela(
    [
      'n',
      'valor',
      'invocações sem cache',
      'invocações com cache',
      'chamadas evitadas',
      'tempo sem cache',
      'tempo com cache',
      'aceleração',
    ],
    comparacoes.map((c) => [
      formatarInteiro(c.n),
      abreviarValor(c.valor, c.digitos),
      formatarInteiro(c.invocacoes.sem_cache),
      formatarInteiro(c.invocacoes.com_cache),
      formatarInteiro(c.chamadas_evitadas),
      formatarDuracao(c.tempo.sem_cache.mediana_ns),
      formatarDuracao(c.tempo.com_cache.mediana_ns),
      formatarFator(c.fator_aceleracao),
    ]),
  );
}

function pico(valor: number | null): string {
  return valor === null ? 'não amostrado' : formatarBytes(valor);
}

function tabelaDeMemoria(comparacoes: readonly CompararResposta[]): string {
  return tabela(
    [
      'n',
      'retida sem cache',
      'retida com cache',
      'diferença',
      'entradas no cache',
      'profundidade máxima',
      'pico de heap sem cache',
      'pico de heap com cache',
    ],
    comparacoes.map((c) => [
      formatarInteiro(c.n),
      formatarBytes(c.memoria.sem_cache.retida_cache_bytes),
      formatarBytes(c.memoria.com_cache.retida_cache_bytes),
      formatarBytes(c.diferenca_memoria_bytes),
      formatarInteiro(c.memoria.com_cache.entradas_cache),
      formatarInteiro(c.memoria.com_cache.profundidade_maxima),
      pico(c.memoria.sem_cache.pico_heap_bytes),
      pico(c.memoria.com_cache.pico_heap_bytes),
    ]),
  );
}

function tabelaDeDispersao(comparacoes: readonly CompararResposta[]): string {
  const linhas = comparacoes.flatMap((c) =>
    MODOS.map((modo) => {
      const tempo = c.tempo[modo];
      return [
        formatarInteiro(c.n),
        ROTULO_MODO[modo],
        formatarDuracao(tempo.mediana_ns),
        formatarDuracao(tempo.media_ns),
        formatarDuracao(tempo.minimo_ns),
        formatarDuracao(tempo.maximo_ns),
        formatarDuracao(tempo.desvio_padrao_ns),
        formatarInteiro(tempo.repeticoes),
        formatarInteiro(tempo.execucoes_por_repeticao),
      ];
    }),
  );
  return tabela(
    [
      'n',
      'modo',
      'mediana',
      'média',
      'mínimo',
      'máximo',
      'desvio padrão',
      'repetições',
      'execuções por repetição',
    ],
    linhas,
  );
}

/** A leitura sai dos próprios números medidos, inclusive quando não há ganho. */
function leitura(comparacoes: readonly CompararResposta[]): string {
  const maior = comparacoes[comparacoes.length - 1];
  if (maior === undefined) return 'Nenhuma medição para esta sequência.';
  const semGanho = comparacoes.every((c) => c.chamadas_evitadas === 0);

  if (semGanho) {
    return [
      `O cache não evita nenhuma chamada: em todos os n medidos as invocações são iguais`,
      `nos dois modos (em n = ${formatarInteiro(maior.n)}, ${formatarInteiro(maior.invocacoes.sem_cache)} de cada lado).`,
      `O tempo mediano fica em ${formatarFator(maior.fator_aceleracao)} e o cache ainda retém`,
      `${formatarBytes(maior.memoria.com_cache.retida_cache_bytes)} em ${formatarInteiro(maior.memoria.com_cache.entradas_cache)} entradas,`,
      `contra ${formatarBytes(maior.memoria.sem_cache.retida_cache_bytes)} sem cache.`,
      'Numa execução isolada o cache só acrescenta memória.',
    ].join(' ');
  }

  return [
    `Em n = ${formatarInteiro(maior.n)} o cache evita ${formatarInteiro(maior.chamadas_evitadas)} chamadas:`,
    `${formatarInteiro(maior.invocacoes.sem_cache)} invocações sem cache contra ${formatarInteiro(maior.invocacoes.com_cache)} com cache.`,
    `O tempo mediano cai de ${formatarDuracao(maior.tempo.sem_cache.mediana_ns)} para`,
    `${formatarDuracao(maior.tempo.com_cache.mediana_ns)}, uma aceleração de ${formatarFator(maior.fator_aceleracao)}.`,
    `O preço são ${formatarBytes(maior.memoria.com_cache.retida_cache_bytes)} retidos pelas`,
    `${formatarInteiro(maior.memoria.com_cache.entradas_cache)} entradas do cache.`,
  ].join(' ');
}

function secaoDaSequencia(sequencia: Sequencia, comparacoes: readonly CompararResposta[]): string {
  const descricao = DESCRICAO_SEQUENCIAS[sequencia];
  return [
    `## ${descricao.nome}`,
    '',
    `Fórmula: ${descricao.formula}. Casos base: ${descricao.casos_base}.`,
    `Crescimento sem cache: ${descricao.crescimento_sem_cache}.`,
    `Crescimento com cache: ${descricao.crescimento_com_cache}.`,
    '',
    '### Invocações e tempo',
    '',
    tabelaDeInvocacoes(comparacoes),
    '',
    '### Memória',
    '',
    tabelaDeMemoria(comparacoes),
    '',
    '### Dispersão das medições de tempo',
    '',
    tabelaDeDispersao(comparacoes),
    '',
    '### Leitura',
    '',
    leitura(comparacoes),
  ].join('\n');
}

const METODO = [
  '## Como as medições são feitas',
  '',
  '- O tempo é medido só sobre as funções puras, com `process.hrtime.bigint()`.',
  '  As versões instrumentadas contam invocações e não entram no cronômetro.',
  '- Cada bloco medido cresce até passar da duração mínima da tabela de',
  '  parâmetros, e o tempo de uma execução é o total do bloco dividido pelo',
  '  número de execuções. Isso mantém a resolução do relógio longe do erro.',
  '- Os dois modos são medidos intercalados e a ordem alterna a cada rodada e a',
  '  cada comparação, para o aquecimento não favorecer sempre o mesmo modo.',
  '- O valor relatado é a mediana das repetições; média, mínimo, máximo e desvio',
  '  padrão aparecem na tabela de dispersão.',
  '- O cache nasce e morre dentro de cada execução: nenhuma medição aproveita o',
  '  cache da anterior.',
  '- A memória retida é a diferença de `heapUsed` entre duas coletas de lixo com',
  '  o cache ainda referenciado. O pico de heap é o `heapUsed` absoluto do',
  '  worker, amostrado a cada K invocações, então inclui a linha de base do',
  '  processo: o que interessa nele é a comparação entre os dois modos.',
  '- Cada comparação roda em um worker próprio, um de cada vez, com prazo.',
  '',
  'Nenhum número deste relatório está escrito no código: todos vêm da execução',
  'registrada acima. Rodar de novo em outra máquina muda os tempos, não as',
  'contagens de invocações.',
].join('\n');

function comparacoesDe(dados: DadosRelatorio, sequencia: Sequencia): readonly CompararResposta[] {
  return dados.comparacoes.filter((comparacao) => comparacao.sequencia === sequencia);
}

function maiorDeCadaSequencia(dados: DadosRelatorio): CompararResposta[] {
  return dados.plano.casos
    .map((caso) => comparacoesDe(dados, caso.sequencia).at(-1))
    .filter((comparacao): comparacao is CompararResposta => comparacao !== undefined);
}

/** Monta o relatório inteiro em Markdown a partir dos dados coletados. */
export function montarRelatorio(dados: DadosRelatorio): string {
  const primeira = dados.comparacoes[0];
  if (primeira === undefined) throw new Error('Nenhuma comparação foi coletada.');

  const partes = [
    '# Resultados de benchmark',
    '',
    `Gerado por \`pnpm relatorio\` em ${formatarInstante(dados.gerado_em)}.`,
    'Todos os números vêm da execução registrada abaixo, nesta máquina.',
    '',
    secaoMaquina(primeira.ambiente, dados),
    '',
    secaoParametros(dados),
    '',
    secaoResumo(maiorDeCadaSequencia(dados)),
    '',
  ];

  for (const caso of dados.plano.casos) {
    partes.push(secaoDaSequencia(caso.sequencia, comparacoesDe(dados, caso.sequencia)), '');
  }

  partes.push(METODO, '');
  return partes.join('\n');
}
