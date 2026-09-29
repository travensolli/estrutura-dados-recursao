import {
  DESCRICAO_SEQUENCIAS,
  SEQUENCIAS,
  type CompararResposta,
  type Sequencia,
} from '@sequencias/contrato';
import { arvoreParaTexto, executarInstrumentado } from '@sequencias/nucleo';
import { type DadosRelatorio } from './coleta';
import {
  arvoreEmbutida,
  classificarPeloCache,
  CORES_CLARO,
  CORES_ESCURO,
  ESTILO_SVG,
  figuraDaArvore,
  figuraDePaineis,
  painelEmbutido,
  type ArvoreClassificada,
  type ConfigPainel,
  type SerieGrafico,
} from './figuras';
import {
  abreviarValor,
  formatarBytes,
  formatarDuracao,
  formatarFator,
  formatarInstante,
  formatarInteiro,
} from './markdown';

/**
 * Relatório HTML de uma página, autossuficiente: sem servidor, sem script e
 * sem arquivo externo. É o material projetado na apresentação, e por isso as
 * seções seguem a ordem do enunciado do PRJ.ED.1.
 */

/** n das árvores de chamadas; acima disso a figura não cabe na tela. */
const N_ARVORE = 7;

/** Quantos filhos cada nó calculado gera, por sequência. */
const ARIDADE: Record<Sequencia, number> = { fatorial: 1, fibonacci: 2, tribonacci: 3 };

const FORMA_ARVORE: Record<Sequencia, string> = {
  fatorial: 'corrente (recursão linear)',
  fibonacci: 'árvore binária (recursão dupla)',
  tribonacci: 'árvore ternária (recursão tripla)',
};

function comparacoesDe(dados: DadosRelatorio, sequencia: Sequencia): CompararResposta[] {
  return dados.comparacoes.filter((comparacao) => comparacao.sequencia === sequencia);
}

function celulas(valores: readonly string[], tag: 'td' | 'th' = 'td'): string {
  return valores.map((valor) => `<${tag}>${valor}</${tag}>`).join('');
}

function tabela(cabecalho: readonly string[], linhas: readonly (readonly string[])[]): string {
  const corpo = linhas.map((linha) => `<tr>${celulas(linha)}</tr>`).join('');
  return `<div class="rolagem"><table><thead><tr>${celulas(cabecalho, 'th')}</tr></thead><tbody>${corpo}</tbody></table></div>`;
}

/* ------------------------------------------------------------------ */
/* Seções                                                              */
/* ------------------------------------------------------------------ */

function secaoEnunciado(): string {
  const itens = SEQUENCIAS.map((sequencia) => {
    const descricao = DESCRICAO_SEQUENCIAS[sequencia];
    return `<li><strong>${descricao.nome}:</strong> ${descricao.formula}, com ${descricao.casos_base}</li>`;
  }).join('');

  return `
  <section>
    <h2>1. O enunciado</h2>
    <blockquote>
      <p>Desenvolva um programa que efetue o cálculo recursivo, <strong>com cache e sem cache</strong>,
      das seguintes sequências numéricas:</p>
      <ol class="sequencias">${itens}</ol>
      <p>Para cada caso, compare o desempenho, em <strong>tempo e memória</strong>, para os casos com e
      sem a utilização de cache. Além disso, o seu programa deve exibir a <strong>árvore de chamadas</strong>
      para os casos sem a utilização de cache.</p>
      <p>Explique, para o caso da sequência de Tribonacci, como um cache evita chamadas recursivas
      repetidas. Nesse caso, desenhe a árvore de chamadas para <strong>f(7)</strong> e diga
      <strong>quantas chamadas recursivas são evitadas</strong>.</p>
    </blockquote>
    <p>As seções seguintes respondem a cada pedido na ordem em que ele aparece.</p>
  </section>`;
}

function secaoSequencias(): string {
  const linhas = SEQUENCIAS.map((sequencia) => {
    const descricao = DESCRICAO_SEQUENCIAS[sequencia];
    return [
      descricao.nome,
      descricao.formula,
      descricao.casos_base,
      descricao.primeiros_termos.join(', ') + ', ...',
      String(ARIDADE[sequencia]),
      FORMA_ARVORE[sequencia],
    ];
  });

  return `
  <section>
    <h2>2. As três sequências</h2>
    <p>Os casos base são os do enunciado: o Fibonacci começa em 1, 1, 2, 3, 5 e não em 0, 1, 1, 2, 3.
    Com essa definição, <strong>Tribonacci f(7) = 31</strong>. O número de chamadas recursivas por nível
    é o que decide a forma da árvore, e é ele que decide se o cache tem algo a evitar.</p>
    ${tabela(
      [
        'Sequência',
        'Recorrência',
        'Casos base',
        'Primeiros termos',
        'Filhos por nó',
        'Forma da árvore',
      ],
      linhas,
    )}
  </section>`;
}

function arvoreEmTexto(sequencia: Sequencia): string {
  const resultado = executarInstrumentado(sequencia, N_ARVORE, 'sem_cache', { comArvore: true });
  const nome = DESCRICAO_SEQUENCIAS[sequencia].nome;
  const raiz = resultado.raiz;
  const desenho = raiz === null ? '' : arvoreParaTexto(raiz);
  return `
    <details>
      <summary>${nome} — f(${N_ARVORE}) = ${resultado.valor.toString()} em ${formatarInteiro(resultado.metricas.invocacoes)} invocações</summary>
      <pre>${desenho}</pre>
    </details>`;
}

function secaoArvores(arvore: ArvoreClassificada): string {
  const total = Object.values(arvore.totais).reduce((soma, valor) => soma + valor, 0);
  const descricao =
    `Árvore de chamadas de Tribonacci f(${N_ARVORE}) sem cache, com ${formatarInteiro(total)} nós. ` +
    `A cor de cada nó indica o que aconteceria com o cache ligado.`;

  return `
  <section>
    <h2>3. A árvore de chamadas sem cache</h2>
    <p>Cada nó é uma invocação da função e cada aresta é uma chamada recursiva. A figura é a árvore
    de <strong>Tribonacci f(${N_ARVORE}) sem cache</strong>, com os seus ${formatarInteiro(total)} nós. As cores
    antecipam a seção 5: azul é a primeira vez que um argumento aparece, laranja é uma consulta que o
    cache responderia na hora, e os nós vazios abaixo dos laranja são as chamadas que deixariam de
    existir.</p>
    <ul class="legenda">
      <li><span class="bolinha calculado"></span>Calculada pela primeira vez: ${formatarInteiro(arvore.totais.calculado)}</li>
      <li><span class="bolinha base"></span>Caso base: ${formatarInteiro(arvore.totais.base)}</li>
      <li><span class="bolinha acerto"></span>Viraria acerto de cache: ${formatarInteiro(arvore.totais.acerto)}</li>
      <li><span class="bolinha evitado"></span>Seria evitada pelo cache: ${formatarInteiro(arvore.totais.evitado)}</li>
    </ul>
    ${arvoreEmbutida(arvore, descricao)}
    <p class="nota">As três árvores em texto, como o programa as imprime:</p>
    ${SEQUENCIAS.map(arvoreEmTexto).join('')}
  </section>`;
}

function painelDeSequencia(
  sequencia: Sequencia,
  comparacoes: readonly CompararResposta[],
  metrica: 'invocacoes' | 'tempo' | 'memoria',
): ConfigPainel {
  const nome = DESCRICAO_SEQUENCIAS[sequencia].nome;
  const serie = (
    classe: SerieGrafico['classe'],
    nomeSerie: string,
    valorDe: (comparacao: CompararResposta) => number,
    formatar: (valor: number) => string,
  ): SerieGrafico => ({
    nome: nomeSerie,
    classe,
    pontos: comparacoes.map((comparacao) => ({
      x: comparacao.n,
      y: valorDe(comparacao),
      rotulo: `n = ${formatarInteiro(comparacao.n)}: ${formatar(valorDe(comparacao))}`,
    })),
  });

  if (metrica === 'invocacoes') {
    return {
      titulo: nome,
      escala: 'log',
      formatarEixo: (valor) => formatarPotencia(valor),
      series: [
        serie('s1', 'Sem cache', (c) => c.invocacoes.sem_cache, formatarInteiro),
        serie('s2', 'Com cache', (c) => c.invocacoes.com_cache, formatarInteiro),
      ],
    };
  }
  if (metrica === 'tempo') {
    return {
      titulo: nome,
      escala: 'log',
      formatarEixo: (valor) => formatarDuracao(valor),
      series: [
        serie('s1', 'Sem cache', (c) => c.tempo.sem_cache.mediana_ns, formatarDuracao),
        serie('s2', 'Com cache', (c) => c.tempo.com_cache.mediana_ns, formatarDuracao),
      ],
    };
  }
  return {
    titulo: nome,
    escala: 'linear',
    formatarEixo: (valor) => formatarBytes(valor),
    series: [
      serie(
        's1',
        'Sem cache',
        (c) => Math.max(c.memoria.sem_cache.retida_cache_bytes, 0),
        formatarBytes,
      ),
      serie(
        's2',
        'Com cache',
        (c) => Math.max(c.memoria.com_cache.retida_cache_bytes, 0),
        formatarBytes,
      ),
    ],
  };
}

/** Rótulo curto para eixo logarítmico: 1, 10, ..., 10⁶. */
function formatarPotencia(valor: number): string {
  if (valor < 1000) return formatarInteiro(valor);
  const expoente = Math.round(Math.log10(valor));
  const sobrescrito = String(expoente).replace(
    /\d/g,
    (digito) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[Number(digito)] ?? '',
  );
  return `10${sobrescrito}`;
}

function gradeDePaineis(
  dados: DadosRelatorio,
  metrica: 'invocacoes' | 'tempo' | 'memoria',
  rotulo: string,
): string {
  const paineis = SEQUENCIAS.map((sequencia) => {
    const comparacoes = comparacoesDe(dados, sequencia);
    if (comparacoes.length === 0) return '';
    const cfg = painelDeSequencia(sequencia, comparacoes, metrica);
    return `<div class="caixa-painel">${painelEmbutido(cfg, `${rotulo}: ${cfg.titulo}`)}</div>`;
  }).join('');

  return `
    <ul class="legenda">
      <li><span class="chave s1"></span>Recursiva sem cache</li>
      <li><span class="chave s2"></span>Recursiva com cache</li>
    </ul>
    <div class="grade-paineis">${paineis}</div>`;
}

function tabelaDeSequencia(sequencia: Sequencia, comparacoes: readonly CompararResposta[]): string {
  const descricao = DESCRICAO_SEQUENCIAS[sequencia];
  const linhas = comparacoes.map((c) => [
    formatarInteiro(c.n),
    abreviarValor(c.valor, c.digitos),
    formatarInteiro(c.invocacoes.sem_cache),
    formatarInteiro(c.invocacoes.com_cache),
    formatarInteiro(c.chamadas_evitadas),
    formatarDuracao(c.tempo.sem_cache.mediana_ns),
    formatarDuracao(c.tempo.com_cache.mediana_ns),
    formatarFator(c.fator_aceleracao),
    formatarBytes(c.memoria.com_cache.retida_cache_bytes),
    `${formatarInteiro(c.memoria.sem_cache.profundidade_maxima)} / ${formatarInteiro(c.memoria.com_cache.profundidade_maxima)}`,
  ]);

  return `
    <h3>${descricao.nome} <span class="formula">${descricao.formula}, com ${descricao.casos_base}</span></h3>
    ${tabela(
      [
        'n',
        'f(n)',
        'Invocações sem cache',
        'Invocações com cache',
        'Chamadas evitadas',
        'Tempo sem cache',
        'Tempo com cache',
        'Aceleração',
        'Memória do cache',
        'Profundidade (sem / com)',
      ],
      linhas,
    )}`;
}

function secaoDesempenho(dados: DadosRelatorio): string {
  return `
  <section>
    <h2>4. Desempenho: tempo e memória</h2>

    <h3>4.1 Invocações</h3>
    <p>Esta é a medida exata: ela não depende da máquina nem do relógio, e dá o mesmo número em
    qualquer execução. O eixo vertical é logarítmico, então uma reta subindo é crescimento
    exponencial.</p>
    ${gradeDePaineis(dados, 'invocacoes', 'Invocações por n')}

    <h3>4.2 Tempo</h3>
    <p>Mediana de várias repetições, com aquecimento e cache vazio a cada execução. Eixo vertical
    logarítmico.</p>
    ${gradeDePaineis(dados, 'tempo', 'Tempo por n')}

    <h3>4.3 Memória retida pelo cache</h3>
    <p>Diferença de heap medida com o cache ainda referenciado, depois de acionar o coletor de lixo.
    Eixo vertical linear. A <strong>pilha</strong> não entra aqui: a profundidade máxima é a mesma nos
    dois modos e aparece na última coluna das tabelas.</p>
    ${gradeDePaineis(dados, 'memoria', 'Memória do cache por n')}

    <h3>4.4 Tabelas</h3>
    ${SEQUENCIAS.map((sequencia) => tabelaDeSequencia(sequencia, comparacoesDe(dados, sequencia))).join('')}
  </section>`;
}

function secaoCache(arvore: ArvoreClassificada): string {
  const semCache = Object.values(arvore.totais).reduce((soma, valor) => soma + valor, 0);
  const comCache = arvore.totais.calculado + arvore.totais.base + arvore.totais.acerto;
  const evitadas = arvore.totais.evitado;

  const podas = [...arvore.podas].sort((a, b) => b.evitadas - a.evitadas);
  const linhasPodas = podas.map((poda) => [
    `f(${poda.argumento})`,
    `dentro de f(${poda.dentroDe})`,
    formatarInteiro(poda.evitadas),
  ]);
  const soma = podas.reduce((total, poda) => total + poda.evitadas, 0);
  linhasPodas.push(['<strong>Total</strong>', '', `<strong>${formatarInteiro(soma)}</strong>`]);

  const comCacheTexto = executarInstrumentado('tribonacci', N_ARVORE, 'com_cache', {
    comArvore: true,
  });
  const desenhoComCache = comCacheTexto.raiz === null ? '' : arvoreParaTexto(comCacheTexto.raiz);

  return `
  <section>
    <h2>5. Como o cache evita chamadas repetidas em Tribonacci f(${N_ARVORE})</h2>

    <div class="destaques">
      <div><span class="rotulo">Invocações sem cache</span><span class="valor">${formatarInteiro(semCache)}</span></div>
      <div><span class="rotulo">Invocações com cache</span><span class="valor">${formatarInteiro(comCache)}</span></div>
      <div><span class="rotulo">Chamadas evitadas</span><span class="valor destaque-forte">${formatarInteiro(evitadas)}</span></div>
    </div>

    <p>Sem cache, a função não tem memória: ela resolve f(5) uma vez dentro de f(7) e de novo, do
    zero, dentro de f(6). São os <strong>subproblemas sobrepostos</strong>. Na árvore da seção 3,
    f(3) é calculado 7 vezes e f(4), 4 vezes, sempre com o mesmo resultado.</p>

    <p>Com cache, a função passa por três situações, nesta ordem:</p>
    <ol>
      <li><strong>Caso base</strong> (n ≤ 2): devolve 1 direto e não toca no cache.</li>
      <li><strong>Argumento já guardado</strong>: devolve o valor e <strong>não visita nenhum filho</strong>.
      É o acerto de cache, e é ele que corta a subárvore inteira.</li>
      <li><strong>Primeira vez</strong>: faz as três chamadas, soma, guarda o resultado e devolve.</li>
    </ol>

    <p>A descida mais à esquerda é idêntica nos dois modos, e é nela que cada argumento de 3 a 7 é
    calculado uma única vez: são ${formatarInteiro(arvore.totais.calculado)} cálculos. Na volta, os irmãos à direita
    já encontram tudo pronto: são ${formatarInteiro(arvore.totais.acerto)} acertos. Cada acerto poda a subárvore que
    estaria abaixo dele:</p>

    ${tabela(['Acerto em', 'Onde ocorre', 'Chamadas evitadas'], linhasPodas)}

    <p>A conta fecha de duas maneiras independentes: pela diferença de totais,
    ${formatarInteiro(semCache)} − ${formatarInteiro(comCache)} = ${formatarInteiro(evitadas)}; e pela soma das
    subárvores podadas, ${podas.map((poda) => formatarInteiro(poda.evitadas)).join(' + ')} =
    ${formatarInteiro(soma)}.</p>

    <p class="resposta"><strong>Resposta:</strong> com cache, Tribonacci f(${N_ARVORE}) faz
    ${formatarInteiro(comCache)} invocações em vez de ${formatarInteiro(semCache)};
    são <strong>${formatarInteiro(evitadas)} chamadas recursivas evitadas</strong>, ou
    ${((evitadas / semCache) * 100).toFixed(0)}% do total. Como a chamada inicial existe nos dois modos, a
    diferença é a mesma contando só as chamadas recursivas: ${formatarInteiro(semCache - 1)} − ${formatarInteiro(comCache - 1)}.</p>

    <details>
      <summary>A árvore que o cache realmente executa: ${formatarInteiro(comCacheTexto.metricas.invocacoes)} invocações</summary>
      <pre>${desenhoComCache}</pre>
    </details>
  </section>`;
}

function secaoFechamento(dados: DadosRelatorio): string {
  const maior = (sequencia: Sequencia): CompararResposta | undefined => {
    const comparacoes = comparacoesDe(dados, sequencia);
    return comparacoes[comparacoes.length - 1];
  };
  const tribonacci = maior('tribonacci');
  const fatorial = maior('fatorial');

  const frasesTribonacci =
    tribonacci === undefined
      ? ''
      : `Em Tribonacci n = ${formatarInteiro(tribonacci.n)}, o cache troca
        ${formatarInteiro(tribonacci.invocacoes.sem_cache)} invocações por
        ${formatarInteiro(tribonacci.invocacoes.com_cache)}, uma aceleração de
        ${formatarFator(tribonacci.fator_aceleracao)}, ao custo de
        ${formatarBytes(tribonacci.memoria.com_cache.retida_cache_bytes)} de cache.`;

  const frasesFatorial =
    fatorial === undefined
      ? ''
      : `No Fatorial n = ${formatarInteiro(fatorial.n)}, as invocações são iguais nos dois modos
        (${formatarInteiro(fatorial.invocacoes.sem_cache)}), a aceleração é de
        ${formatarFator(fatorial.fator_aceleracao)} e o cache ainda retém
        ${formatarBytes(fatorial.memoria.com_cache.retida_cache_bytes)}.`;

  return `
  <section>
    <h2>6. Conclusão</h2>
    <p>O que decide o valor do cache não é o tamanho de n: é a <strong>forma da árvore de
    chamadas</strong>.</p>
    <ul>
      <li><strong>Recursão múltipla</strong> (Fibonacci e Tribonacci): os subproblemas se sobrepõem, e o
      número de chamadas cai de exponencial para linear. ${frasesTribonacci}</li>
      <li><strong>Recursão linear</strong> (Fatorial): nenhum argumento se repete, então não há nada a
      reaproveitar. ${frasesFatorial} O cache só custa.</li>
      <li><strong>A pilha não muda.</strong> A profundidade máxima é a mesma com e sem cache, porque a
      primeira descida é idêntica. O cache economiza chamadas, não altura de pilha.</li>
    </ul>
    <p>Memoização é uma troca de espaço por tempo, e ela só compensa onde existe trabalho repetido
    para evitar. Mostrar o Fatorial, em que a própria otimização do trabalho não serve para nada, é o
    que dá sentido ao critério.</p>
  </section>`;
}

function secaoMetodo(dados: DadosRelatorio): string {
  const ambiente = dados.comparacoes[0]?.ambiente;
  const linhasAmbiente =
    ambiente === undefined
      ? []
      : [
          ['Processador', `${ambiente.cpu} (${formatarInteiro(ambiente.nucleos)} núcleos lógicos)`],
          ['Sistema', `${ambiente.plataforma} (${ambiente.arquitetura})`],
          ['Node', ambiente.node],
          ['V8', ambiente.v8],
        ];
  const linhas = [
    ...linhasAmbiente,
    ['Repetições por comparação', formatarInteiro(dados.plano.repeticoes)],
    ['Repetições da medição de memória', formatarInteiro(dados.parametros.repeticoes_memoria)],
    ['Duração total da coleta', formatarDuracao(dados.duracao_total_ms * 1_000_000)],
  ];

  return `
  <section>
    <h2>7. Como estes números foram obtidos</h2>
    <ul>
      <li>O cronômetro roda só sobre as <strong>funções puras</strong>; as versões instrumentadas contam
      invocações e ficam fora da medição de tempo.</li>
      <li>O valor oficial é a <strong>mediana</strong> das repetições, com aquecimento antes e os dois
      modos medidos em ordem alternada.</li>
      <li>O <strong>cache nasce vazio</strong> em cada execução: nenhuma medição aproveita a anterior.</li>
      <li>Tempo e memória saem de execuções separadas, porque amostrar memória custa tempo.</li>
      <li>Cada comparação roda num <code>worker_thread</code> próprio, um de cada vez, com prazo.</li>
    </ul>
    ${tabela(['Item', 'Valor'], linhas)}
    <p class="nota">As contagens de invocações são exatas e valem em qualquer máquina. Os tempos e a
    memória valem para esta máquina e esta data; rodar de novo muda os tempos, não as contagens.</p>
  </section>`;
}

/* ------------------------------------------------------------------ */
/* Página                                                              */
/* ------------------------------------------------------------------ */

const ESTILO_PAGINA = `
  :root { color-scheme: light;${CORES_CLARO} }
  @media (prefers-color-scheme: dark) { :root { color-scheme: dark;${CORES_ESCURO} } }
  * { box-sizing: border-box; }
  body { margin: 0; padding: 32px 16px; background: var(--pagina); color: var(--texto);
         font-family: system-ui, -apple-system, "Segoe UI", sans-serif; }
  .folha { max-width: 1040px; margin: 0 auto; padding: 28px; background: var(--superficie);
           border: 1px solid var(--borda); border-radius: 14px; }
  h1 { margin: 0 0 6px; font-size: 22px; font-weight: 650; letter-spacing: -0.01em; }
  h2 { margin: 42px 0 8px; font-size: 17px; font-weight: 650; }
  h3 { margin: 26px 0 8px; font-size: 14px; font-weight: 650; }
  p, li { font-size: 13.5px; line-height: 1.65; color: var(--texto-suave); }
  strong { color: var(--texto); font-weight: 650; }
  .subtitulo { margin: 0 0 4px; font-size: 13.5px; }
  .meta { margin: 0; font-size: 12px; color: var(--apagado); }
  blockquote { margin: 12px 0; padding: 12px 18px; border-left: 3px solid var(--serie-1);
               background: var(--pagina); border-radius: 0 8px 8px 0; }
  blockquote p { margin: 6px 0; }
  ol.sequencias { margin: 8px 0; padding-left: 22px; list-style-type: lower-alpha; }
  ol.sequencias li { margin: 2px 0; }
  .legenda { display: flex; flex-wrap: wrap; gap: 18px; margin: 10px 0; padding: 0;
             list-style: none; font-size: 12.5px; color: var(--texto-suave); }
  .legenda li { display: flex; align-items: center; gap: 7px; }
  .chave { display: inline-block; width: 16px; height: 2px; border-radius: 1px; }
  .chave.s1 { background: var(--serie-1); }
  .chave.s2 { background: var(--serie-2); }
  .bolinha { display: inline-block; width: 11px; height: 11px; border-radius: 50%; }
  .bolinha.calculado { background: var(--serie-1); }
  .bolinha.acerto { background: var(--serie-2); }
  .bolinha.base { background: var(--superficie); border: 1.5px solid var(--eixo); }
  .bolinha.evitado { background: var(--superficie); border: 1px solid var(--grade); }
  .grade-paineis { display: grid; grid-template-columns: repeat(auto-fit, minmax(270px, 1fr)); gap: 20px; }
  .painel, .arvore { display: block; width: 100%; height: auto; }
  .arvore { margin: 12px 0 8px; }
${ESTILO_SVG}
  .rolagem { overflow-x: auto; margin: 10px 0; }
  table { width: 100%; border-collapse: collapse; font-size: 12.5px; }
  th, td { padding: 7px 10px; text-align: right; border-bottom: 1px solid var(--grade); }
  th { font-weight: 650; color: var(--texto-suave); vertical-align: bottom; }
  td { font-variant-numeric: tabular-nums; white-space: nowrap; color: var(--texto); }
  th:first-child, td:first-child { text-align: left; }
  .destaques { display: flex; flex-wrap: wrap; gap: 36px; margin: 18px 0 22px; }
  .destaques div { display: grid; gap: 2px; }
  .destaques .rotulo { font-size: 12px; color: var(--texto-suave); }
  .destaques .valor { font-size: 34px; font-weight: 650; font-variant-numeric: tabular-nums;
                      line-height: 1.1; }
  .destaques .destaque-forte { color: var(--serie-2); }
  .resposta { padding: 12px 16px; background: var(--pagina); border: 1px solid var(--borda);
              border-radius: 8px; }
  .nota { font-size: 12.5px; color: var(--apagado); }
  details { margin: 8px 0; }
  summary { cursor: pointer; font-size: 12.5px; color: var(--texto-suave); padding: 4px 0; }
  pre { font-size: 11.5px; line-height: 1.45; background: var(--pagina); border: 1px solid var(--borda);
        border-radius: 8px; padding: 12px; overflow-x: auto; color: var(--texto); }
  code { font-size: 0.92em; }
  footer { margin-top: 36px; padding-top: 16px; border-top: 1px solid var(--grade);
           font-size: 12px; color: var(--apagado); }
  @media print {
    body { padding: 0; background: #fff; }
    .folha { max-width: none; border: 0; padding: 0; }
    details { display: none; }
  }`;

/** Classifica a árvore de Tribonacci f(7), base das figuras e da seção 5. */
function arvoreDeReferencia(): ArvoreClassificada {
  const semCache = executarInstrumentado('tribonacci', N_ARVORE, 'sem_cache', { comArvore: true });
  if (semCache.raiz === null) throw new Error('a árvore de Tribonacci f(7) não foi montada');
  return classificarPeloCache(semCache.raiz);
}

/**
 * As mesmas figuras do relatório, cada uma em um arquivo SVG avulso, para o
 * artigo e para os slides.
 *
 * @returns Mapa nome do arquivo → conteúdo SVG.
 */
export function montarFigurasSvg(dados: DadosRelatorio): Record<string, string> {
  const grade = (metrica: 'invocacoes' | 'tempo' | 'memoria'): ConfigPainel[] =>
    SEQUENCIAS.map((sequencia) =>
      painelDeSequencia(sequencia, comparacoesDe(dados, sequencia), metrica),
    );

  return {
    'grafico-invocacoes.svg': figuraDePaineis(
      grade('invocacoes'),
      'Invocações por n, nos dois modos, com eixo vertical logarítmico.',
    ),
    'grafico-tempo.svg': figuraDePaineis(
      grade('tempo'),
      'Tempo mediano por n, nos dois modos, com eixo vertical logarítmico.',
    ),
    'grafico-memoria.svg': figuraDePaineis(
      grade('memoria'),
      'Memória retida pelo cache por n, com eixo vertical linear.',
    ),
    'arvore-tribonacci-f7.svg': figuraDaArvore(
      arvoreDeReferencia(),
      'Árvore de chamadas de Tribonacci f(7) sem cache, com cada nó pintado pelo seu destino com cache.',
    ),
  };
}

/** Monta o relatório inteiro a partir de uma coleta de medições. */
export function montarRelatorioHtml(dados: DadosRelatorio): string {
  const arvore = arvoreDeReferencia();

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>PRJ.ED.1 — Sequências recursivas com e sem cache</title>
<style>${ESTILO_PAGINA}
</style>
</head>
<body>
<main class="folha">
  <h1>Sequências recursivas com e sem cache</h1>
  <p class="subtitulo">Fatorial, Fibonacci e Tribonacci: árvore de chamadas, tempo e memória.
  PRJ.ED.1 — Estrutura de Dados.</p>
  <p class="meta">Medições de ${formatarInstante(dados.gerado_em)}. Todos os números desta página vêm
  dessa execução; nenhum está escrito à mão.</p>

  ${secaoEnunciado()}
  ${secaoSequencias()}
  ${secaoArvores(arvore)}
  ${secaoDesempenho(dados)}
  ${secaoCache(arvore)}
  ${secaoFechamento(dados)}
  ${secaoMetodo(dados)}

  <footer>Gerado por <code>pnpm relatorio</code>. Para conferir qualquer número com outro n, use a
  interface em <code>/calcular</code> e <code>/comparar</code>, ou a linha de comando.</footer>
</main>
</body>
</html>
`;
}
