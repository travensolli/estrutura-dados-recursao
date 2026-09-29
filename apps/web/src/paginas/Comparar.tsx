import {
  DESCRICAO_SEQUENCIAS,
  MODOS,
  REPETICOES_MAXIMO,
  SEQUENCIAS,
  type AmbienteExecucao,
  type CompararResposta,
  type EstatisticasTempo,
  type InfoSequencia,
  type MemoriaModo,
  type Modo,
  type Sequencia,
  type SerieResposta,
} from '@sequencias/contrato';
import { useQueryClient, type UseQueryResult } from '@tanstack/react-query';
import { lazy, Suspense, useId, useMemo, useState, type FormEvent, type ReactNode } from 'react';
import type { SerieEntrada } from '../api/cliente';
import {
  chaves,
  opcoesEstimativa,
  useComparar,
  useEstimativa,
  useSequencias,
  useSerie,
} from '../api/consultas';
import {
  Alerta,
  Botao,
  BotaoLink,
  CampoNumero,
  Cartao,
  Detalhes,
  DialogoConfirmacao,
  Esqueleto,
  EstadoErro,
  EstadoVazio,
  GrupoBotoes,
  Metrica,
  NumeroGrande,
  RotuloModo,
  SeletorSegmentado,
  Selo,
  Tabela,
  type ColunaTabela,
  type OpcaoSegmento,
} from '../componentes';
import { LegendaSeries } from '../componentes/BarraComparativa';
import type { EscalaGrafico, PontoGrafico } from '../componentes/GraficoLinhas';
import { useTituloPagina } from '../hooks/titulo-pagina';
import { enderecoComEstado, useEstadoUrl, type OpcoesEstadoUrl } from '../hooks/useEstadoUrl';
import { juntarClasses } from '../utilitarios/classes';
import {
  formatarBytes,
  formatarCompacto,
  formatarFator,
  formatarInteiro,
  formatarTempoNs,
  rotuloModo,
} from '../utilitarios/formatar';
import { validarInteiro } from '../utilitarios/validacao';

/* Recharts entra sob demanda: as outras telas não carregam o pacote. */
const GraficoLinhas = lazy(() => import('../componentes/GraficoLinhas'));

const OPCOES_URL: OpcoesEstadoUrl = { padrao: { n: 20 } };

/** Teto de pontos da série; o passo cresce para caber nesse orçamento. */
const PONTOS_MAXIMOS = 40;

/* Os dois gráficos dividem a dobra com os destaques: altura fixa, esqueleto igual. */
const ALTURA_GRAFICO = 150;
const ALTURA_GRAFICO_CLASSE = 'h-[150px]';

const OPCOES_ESCALA: ReadonlyArray<OpcaoSegmento<EscalaGrafico>> = [
  { valor: 'linear', rotulo: 'Linear' },
  { valor: 'log', rotulo: 'Logarítmica' },
];

/** O que cada escala faz com o eixo vertical, dito em texto. */
const NOTA_ESCALA: Record<EscalaGrafico, string> = {
  linear: 'Na escala linear a mesma distância no eixo vertical vale sempre a mesma quantidade.',
  log: 'Na escala logarítmica o eixo vertical cresce multiplicando em vez de somar, então as duas curvas cabem juntas mesmo com tamanhos muito diferentes: aqui uma reta quer dizer crescimento exponencial.',
};

/** Uma medição já disparada: é ela que vira chave da consulta. */
interface Medicao {
  sequencia: Sequencia;
  n: number;
  repeticoes: number;
}

interface LinhaComparada {
  chave: string;
  rotulo: string;
  detalhe: string;
  valores: Record<Modo, string>;
}

/** Texto do campo espelhando o valor do endereço, sem efeito colateral. */
function useRascunho(valor: number) {
  const [texto, setTexto] = useState(() => String(valor));
  const [ecoado, setEcoado] = useState(valor);
  if (valor !== ecoado) {
    setEcoado(valor);
    setTexto(String(valor));
  }
  return [texto, setTexto, setEcoado] as const;
}

function mesmaMedicao(a: Medicao | null, b: Medicao): boolean {
  return a !== null && a.sequencia === b.sequencia && a.n === b.n && a.repeticoes === b.repeticoes;
}

/** Leitura honesta do fator: pode ser ganho, empate ou perda. */
function lerFator(fator: number): string {
  if (!Number.isFinite(fator) || fator <= 0) return 'o relógio não separou as duas medições';
  if (fator >= 1.05) return `com cache foi ${formatarFator(fator)} mais rápido`;
  if (fator > 0.95) return 'as duas medianas ficaram praticamente iguais';
  return `com cache foi ${formatarFator(1 / fator)} mais lento`;
}

function lerMemoria(bytes: number): string {
  if (bytes > 0) return `o cache reteve ${formatarBytes(bytes)} a mais que a execução sem cache`;
  if (bytes < 0) return `a execução com cache reteve ${formatarBytes(-bytes)} a menos`;
  return 'as duas execuções retiveram a mesma memória';
}

/** Sem ganho de memória, o sinal vem do coletor de lixo e não do cache: diga isso no destaque. */
function detalheMemoria(resposta: CompararResposta): string {
  const entradas = `${formatarInteiro(resposta.memoria.com_cache.entradas_cache)} entradas guardadas`;
  const leitura = lerMemoria(resposta.diferenca_memoria_bytes);
  return resposta.diferenca_memoria_bytes > 0
    ? `${entradas}: ${leitura}.`
    : `${entradas}, mas ${leitura}: a variação do coletor de lixo pesa mais que um cache tão pequeno.`;
}

interface TabelaComparadaProps {
  legenda: string;
  linhas: ReadonlyArray<LinhaComparada>;
  rodape?: ReactNode;
  destacar?: (linha: LinhaComparada) => boolean;
}

/** Uma métrica por linha, um modo por coluna: o mesmo formato em tempo e memória. */
function TabelaComparada({ legenda, linhas, rodape, destacar }: TabelaComparadaProps) {
  const colunas: ColunaTabela<LinhaComparada>[] = [
    {
      chave: 'metrica',
      rotulo: 'Métrica',
      cabecalhoDeLinha: true,
      className: 'min-w-36',
      conteudo: (linha) => (
        <>
          <span className="block">{linha.rotulo}</span>
          <span className="block text-xs font-normal text-texto-suave">{linha.detalhe}</span>
        </>
      ),
    },
    ...MODOS.map((modo) => ({
      chave: modo,
      rotulo: <RotuloModo modo={modo} />,
      numerico: true,
      className: 'w-24 sm:w-32',
      conteudo: (linha: LinhaComparada) => linha.valores[modo],
    })),
  ];
  return (
    <Tabela
      legenda={legenda}
      legendaVisivel
      colunas={colunas}
      linhas={linhas}
      chave={(linha) => linha.chave}
      rodape={rodape}
      destacar={destacar}
    />
  );
}

const ESTATISTICAS: ReadonlyArray<{
  chave: string;
  rotulo: string;
  detalhe: string;
  valor: (tempo: EstatisticasTempo) => number;
}> = [
  {
    chave: 'mediana',
    rotulo: 'Mediana',
    detalhe: 'O valor do meio das repetições, menos sensível a picos do sistema.',
    valor: (tempo) => tempo.mediana_ns,
  },
  {
    chave: 'media',
    rotulo: 'Média',
    detalhe: 'A soma das repetições dividida pela quantidade delas.',
    valor: (tempo) => tempo.media_ns,
  },
  {
    chave: 'minimo',
    rotulo: 'Mínimo',
    detalhe: 'A repetição mais rápida.',
    valor: (tempo) => tempo.minimo_ns,
  },
  {
    chave: 'maximo',
    rotulo: 'Máximo',
    detalhe: 'A repetição mais lenta.',
    valor: (tempo) => tempo.maximo_ns,
  },
  {
    chave: 'desvio',
    rotulo: 'Desvio padrão',
    detalhe: 'O quanto as repetições variaram em torno da média.',
    valor: (tempo) => tempo.desvio_padrao_ns,
  },
];

function TabelaTempo({ resposta }: { resposta: CompararResposta }) {
  const linhas: LinhaComparada[] = ESTATISTICAS.map((estatistica) => ({
    chave: estatistica.chave,
    rotulo: estatistica.rotulo,
    detalhe: estatistica.detalhe,
    valores: {
      sem_cache: formatarTempoNs(estatistica.valor(resposta.tempo.sem_cache)),
      com_cache: formatarTempoNs(estatistica.valor(resposta.tempo.com_cache)),
    },
  }));
  const amostra = resposta.tempo.sem_cache;
  const ordem = resposta.ordem_execucao.map(rotuloModo).join(', ');
  return (
    <TabelaComparada
      legenda={`Tempo de execução em ${formatarInteiro(resposta.repeticoes)} repetições`}
      linhas={linhas}
      destacar={(linha) => linha.chave === 'mediana'}
      rodape={
        <>
          {formatarInteiro(amostra.repeticoes)} repetições por modo, com{' '}
          {formatarInteiro(amostra.aquecimentos)} aquecimentos descartados antes de medir. A ordem
          desta rodada foi: {ordem}.
          {amostra.execucoes_por_repeticao > 1
            ? ` Cada repetição executou ${formatarInteiro(amostra.execucoes_por_repeticao)} vezes e dividiu o tempo, porque uma execução isolada é curta demais para o relógio.`
            : null}
        </>
      }
    />
  );
}

const MEMORIA: ReadonlyArray<{
  chave: string;
  rotulo: string;
  detalhe: string;
  valor: (memoria: MemoriaModo) => string;
}> = [
  {
    chave: 'retida',
    rotulo: 'Retida pelo cache',
    detalhe: 'Heap ainda ocupado com o cache na memória.',
    valor: (memoria) => formatarBytes(memoria.retida_cache_bytes),
  },
  {
    chave: 'pico',
    rotulo: 'Pico aproximado',
    detalhe: 'Maior heap amostrado durante a execução.',
    valor: (memoria) =>
      memoria.pico_heap_bytes === null ? 'não amostrado' : formatarBytes(memoria.pico_heap_bytes),
  },
  {
    chave: 'entradas',
    rotulo: 'Entradas no cache',
    detalhe: 'Valores guardados ao fim; casos base não entram.',
    valor: (memoria) => formatarInteiro(memoria.entradas_cache),
  },
  {
    chave: 'profundidade',
    rotulo: 'Profundidade máxima',
    detalhe: 'Maior número de chamadas ao mesmo tempo na pilha.',
    valor: (memoria) => formatarInteiro(memoria.profundidade_maxima),
  },
];

function TabelaMemoria({ resposta }: { resposta: CompararResposta }) {
  const linhas: LinhaComparada[] = MEMORIA.map((item) => ({
    chave: item.chave,
    rotulo: item.rotulo,
    detalhe: item.detalhe,
    valores: {
      sem_cache: item.valor(resposta.memoria.sem_cache),
      com_cache: item.valor(resposta.memoria.com_cache),
    },
  }));
  const amostragem = resposta.memoria.com_cache.intervalo_amostragem;
  return (
    <TabelaComparada
      legenda="Memória das duas execuções"
      linhas={linhas}
      destacar={(linha) => linha.chave === 'retida'}
      rodape={
        <>
          Leia estes números como ordem de grandeza. O coletor de lixo não é determinista, então a
          medida varia entre rodadas, e os quadros da pilha ficam fora do heap: a profundidade custa
          memória que não aparece aqui.
          {amostragem === null
            ? null
            : ` O pico é amostrado a cada ${formatarInteiro(amostragem)} invocações.`}
        </>
      }
    />
  );
}

/** Parágrafos escritos a partir dos números medidos, sem forçar ganho. */
function interpretar(resposta: CompararResposta, info: InfoSequencia | undefined): string[] {
  const nome = DESCRICAO_SEQUENCIAS[resposta.sequencia].nome;
  const chamada = `${nome} f(${resposta.n})`;
  const sem = formatarInteiro(resposta.invocacoes.sem_cache);
  const com = formatarInteiro(resposta.invocacoes.com_cache);
  const entradas = formatarInteiro(resposta.memoria.com_cache.entradas_cache);
  const retida = formatarBytes(resposta.memoria.com_cache.retida_cache_bytes);
  const tempo = `A mediana de ${formatarInteiro(resposta.repeticoes)} repetições foi ${formatarTempoNs(resposta.tempo.sem_cache.mediana_ns)} sem cache e ${formatarTempoNs(resposta.tempo.com_cache.mediana_ns)} com cache, ou seja, ${lerFator(resposta.fator_aceleracao)}.`;

  if (resposta.chamadas_evitadas === 0) {
    return [
      `Em ${chamada} cada argumento é pedido uma vez só, então não existe trabalho repetido para reaproveitar. Os dois modos fizeram as mesmas ${sem} invocações e o cache evitou zero chamadas.`,
      `${tempo} O que o cache acrescentou foi memória: ${entradas} entradas guardadas e ${retida} retidos, ${lerMemoria(resposta.diferenca_memoria_bytes)}. Numa execução isolada o cache aqui só cobra, e mostrar isso também é resultado.`,
    ];
  }

  const crescimento = info
    ? ` Sem cache o crescimento é ${info.crescimento_sem_cache}; com cache, ${info.crescimento_com_cache}.`
    : '';
  return [
    `Sem cache, ${chamada} fez ${sem} invocações; com cache foram ${com}. A diferença, ${formatarInteiro(resposta.chamadas_evitadas)} chamadas, é trabalho repetido que o cache não precisou refazer: cada argumento já resolvido volta pronto.${crescimento}`,
    `${tempo} O preço é memória: ${entradas} entradas no cache e ${retida} retidos ao fim, ${lerMemoria(resposta.diferenca_memoria_bytes)}. É a troca de sempre: guardar resultado para não recalcular.`,
  ];
}

/** Série de n = 1 até o n medido, com passo que respeita o teto de pontos. */
function entradaDaSerie(medicao: Medicao): SerieEntrada {
  const inicial = Math.min(1, medicao.n);
  return {
    sequencia: medicao.sequencia,
    n_inicial: inicial,
    n_final: medicao.n,
    passo: Math.max(1, Math.ceil((medicao.n - inicial + 1) / PONTOS_MAXIMOS)),
    repeticoes: Math.min(medicao.repeticoes, 3),
  };
}

function textoDoPonto(
  ponto: PontoGrafico,
  modo: Modo,
  formatar: (valor: number) => string,
): string {
  const valor = ponto[modo];
  return valor === null ? 'não medido' : formatar(valor);
}

/** Alternativa em texto do gráfico: os extremos de cada série e os vazios. */
function descreverSerie(
  pontos: ReadonlyArray<PontoGrafico>,
  formatar: (valor: number) => string,
): string {
  const primeiro = pontos[0];
  const ultimo = pontos[pontos.length - 1];
  if (!primeiro || !ultimo) return '';
  const trechos = MODOS.map((modo) => {
    const semValor = pontos.filter((ponto) => ponto[modo] === null).length;
    const inicio = primeiro[modo];
    const fim = ultimo[modo];
    if (inicio === null || fim === null || semValor === pontos.length) {
      return `${rotuloModo(modo)} ficou sem medida em ${formatarInteiro(semValor)} dos ${formatarInteiro(pontos.length)} pontos`;
    }
    const vazios = semValor > 0 ? ` (${formatarInteiro(semValor)} pontos sem medida no meio)` : '';
    return `${rotuloModo(modo)} vai de ${formatar(inicio)} a ${formatar(fim)}${vazios}`;
  });
  return `De f(${primeiro.n}) a f(${ultimo.n}), ${trechos.join('; ')}.`;
}

interface PainelGraficoProps {
  identificador: string;
  titulo: string;
  /** Uma linha visível sob o título. */
  subtitulo: string;
  /** Leitura completa, junto da descrição dos pontos, para leitores de tela. */
  explicacao: string;
  grandeza: string;
  pontos: ReadonlyArray<PontoGrafico>;
  escala: EscalaGrafico;
  formatar: (valor: number) => string;
  /** Forma curta para as marcas do eixo, quando o valor cheio não cabe. */
  formatarEixo?: (valor: number) => string;
}

/** Gráfico com título, descrição em texto, legenda e tabela dos mesmos dados. */
function PainelGrafico({
  identificador,
  titulo,
  subtitulo,
  explicacao,
  grandeza,
  pontos,
  escala,
  formatar,
  formatarEixo,
}: PainelGraficoProps) {
  const [dadosVisiveis, setDadosVisiveis] = useState(false);
  const idDados = useId();
  const colunas: ColunaTabela<PontoGrafico>[] = [
    {
      chave: 'n',
      rotulo: 'n',
      cabecalhoDeLinha: true,
      className: 'w-20',
      conteudo: (ponto) => <span className="font-mono">f({ponto.n})</span>,
    },
    ...MODOS.map((modo) => ({
      chave: modo,
      rotulo: <RotuloModo modo={modo} />,
      numerico: true,
      conteudo: (ponto: PontoGrafico) => textoDoPonto(ponto, modo, formatar),
    })),
  ];

  return (
    <Cartao compacto className="min-w-0" data-testid={identificador}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="text-base font-semibold">{titulo}</h3>
          <p className="text-sm text-texto-suave">{subtitulo}</p>
        </div>
        <Botao
          variante="discreta"
          tamanho="pequeno"
          icone="tabela"
          aria-expanded={dadosVisiveis}
          aria-controls={idDados}
          onClick={() => setDadosVisiveis((atual) => !atual)}
        >
          {dadosVisiveis ? 'Ocultar dados' : 'Ver dados'}
        </Botao>
      </div>
      <figure className="m-0 mt-2">
        <figcaption className="sr-only">
          {titulo}. {explicacao} {descreverSerie(pontos, formatar)} {NOTA_ESCALA[escala]}
        </figcaption>
        <Suspense
          fallback={
            <Esqueleto
              linhas={1}
              altura={ALTURA_GRAFICO_CLASSE}
              rotulo={`Carregando o gráfico: ${titulo}`}
            />
          }
        >
          <GraficoLinhas
            pontos={pontos}
            escala={escala}
            formatar={formatar}
            formatarEixo={formatarEixo}
            grandeza={grandeza}
            altura={ALTURA_GRAFICO}
          />
        </Suspense>
      </figure>
      <div id={idDados} hidden={!dadosVisiveis} className="mt-3">
        {dadosVisiveis ? (
          <Tabela
            legenda={`${titulo}, valor de cada ponto`}
            colunas={colunas}
            linhas={pontos}
            chave={(ponto) => ponto.n}
            alturaMaxima="20rem"
          />
        ) : null}
      </div>
    </Cartao>
  );
}

/** Faixa medida descrita a partir da própria resposta. */
function descreverFaixa(dados: SerieResposta | undefined): string {
  if (!dados) return 'Cada ponto é uma execução dos dois modos ao longo da faixa de n.';
  const passo =
    dados.passo > 1
      ? `, de ${formatarInteiro(dados.passo)} em ${formatarInteiro(dados.passo)}`
      : '';
  return `Cada ponto é uma execução dos dois modos: ${formatarInteiro(dados.pontos.length)} pontos de f(${dados.n_inicial}) a f(${dados.n_final})${passo}, com ${formatarInteiro(dados.repeticoes)} repetições por ponto. A escala escolhida vale para os dois gráficos.`;
}

interface SecaoCurvasProps {
  consulta: UseQueryResult<SerieResposta>;
  escala: EscalaGrafico;
  aoTentarDeNovo: () => void;
}

/** Os dois gráficos da série, com uma única escala mandando nos dois. */
function SecaoCurvas({ consulta, escala, aoTentarDeNovo }: SecaoCurvasProps) {
  const pontos = consulta.data?.pontos ?? [];
  const pontosTempo: PontoGrafico[] = pontos.map((ponto) => ({
    n: ponto.n,
    sem_cache: ponto.tempo_ns.sem_cache,
    com_cache: ponto.tempo_ns.com_cache,
  }));
  const pontosInvocacoes: PontoGrafico[] = pontos.map((ponto) => ({
    n: ponto.n,
    sem_cache: ponto.invocacoes.sem_cache,
    com_cache: ponto.invocacoes.com_cache,
  }));
  /* Uma linha precisa de dois pontos; com menos, só a tabela faz sentido. */
  const desenhavel = pontos.length > 1;

  function conteudo() {
    if (desenhavel) {
      return (
        <div
          aria-busy={consulta.isFetching}
          className={juntarClasses(
            'grid gap-3 transition-opacity duration-150 ease-suave lg:grid-cols-2',
            consulta.isFetching && 'opacity-60',
          )}
        >
          <PainelGrafico
            identificador="painel-tempo"
            titulo="Tempo por n"
            subtitulo="Mediana das repetições."
            explicacao="A mediana das repetições em cada n. Onde a medida faltou, a linha fica interrompida."
            grandeza="Tempo"
            pontos={pontosTempo}
            escala={escala}
            formatar={formatarTempoNs}
          />
          <PainelGrafico
            identificador="painel-invocacoes"
            titulo="Invocações por n"
            subtitulo="Contagem exata, sem relógio."
            explicacao="Quantas vezes a função foi chamada em cada n. É contagem exata, sem relógio no meio."
            grandeza="Invocações"
            pontos={pontosInvocacoes}
            escala={escala}
            formatar={formatarInteiro}
            formatarEixo={formatarCompacto}
          />
        </div>
      );
    }
    if (consulta.isFetching) {
      return (
        <div className="grid gap-3 lg:grid-cols-2">
          {['Tempo por n', 'Invocações por n'].map((titulo) => (
            <Cartao key={titulo} compacto className="min-w-0">
              <h3 className="text-base font-semibold">{titulo}</h3>
              <p className="text-sm text-texto-suave">Medindo ponto a ponto, um de cada vez.</p>
              <Esqueleto
                linhas={1}
                altura={ALTURA_GRAFICO_CLASSE}
                rotulo={`Montando o gráfico de ${titulo.toLowerCase()}`}
                className="mt-2"
              />
            </Cartao>
          ))}
        </div>
      );
    }
    if (consulta.error !== null) {
      return <EstadoErro erro={consulta.error} aoTentarDeNovo={aoTentarDeNovo} />;
    }
    return (
      <EstadoVazio
        icone="comparar"
        titulo="Faixa curta para desenhar uma curva"
        descricao="Uma linha precisa de pelo menos dois valores de n. Compare um n maior e as duas curvas aparecem aqui."
      />
    );
  }

  return (
    <section aria-labelledby="titulo-curvas" className="space-y-2">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
        <h2 id="titulo-curvas" className="text-xl font-semibold">
          Como cada modo cresce com n
        </h2>
        <LegendaSeries />
      </div>
      <p className="sr-only">{descreverFaixa(consulta.data)}</p>
      {conteudo()}
    </section>
  );
}

function BlocoAmbiente({ ambiente }: { ambiente: AmbienteExecucao }) {
  const itens: Array<[string, string]> = [
    ['Node', ambiente.node],
    ['V8', ambiente.v8],
    ['Plataforma', `${ambiente.plataforma} ${ambiente.arquitetura}`],
    ['Processador', ambiente.cpu],
    ['Núcleos', formatarInteiro(ambiente.nucleos)],
    [
      'Memória total',
      ambiente.memoria_total_bytes > 0
        ? formatarBytes(ambiente.memoria_total_bytes)
        : 'não informada',
    ],
  ];
  return (
    <Detalhes resumo={<h2 className="text-base font-semibold">Ambiente de execução</h2>}>
      <dl className="grid grid-cols-1 gap-x-6 gap-y-2 text-sm sm:grid-cols-2 lg:grid-cols-3">
        {itens.map(([rotulo, valor]) => (
          <div
            key={rotulo}
            className="flex flex-wrap justify-between gap-x-3 border-b border-borda pb-1"
          >
            <dt className="text-texto-suave">{rotulo}</dt>
            <dd className="font-medium break-all">{valor}</dd>
          </div>
        ))}
      </dl>
    </Detalhes>
  );
}

export function PaginaComparar() {
  const { estado, definir } = useEstadoUrl(OPCOES_URL);
  const { sequencia, n, repeticoes } = estado;
  const nome = DESCRICAO_SEQUENCIAS[sequencia].nome;
  useTituloPagina(`Comparar ${nome} f(${n})`);

  const clienteConsultas = useQueryClient();
  const idSequencia = useId();
  const sequencias = useSequencias();
  const info = sequencias.data?.sequencias.find((item) => item.id === sequencia);
  const limite = info?.limites.sem_cache;

  const [rascunhoN, setRascunhoN, ecoarN] = useRascunho(n);
  const [rascunhoRepeticoes, setRascunhoRepeticoes, ecoarRepeticoes] = useRascunho(repeticoes);

  const [medicao, setMedicao] = useState<Medicao | null>(null);
  const [escala, setEscala] = useState<EscalaGrafico>('linear');
  const [confirmando, setConfirmando] = useState(false);
  const [verificando, setVerificando] = useState(false);
  const [cancelada, setCancelada] = useState(false);

  const consultaEstimativa = useMemo(
    () => ({ sequencia, n, modo: 'sem_cache' as const }),
    [sequencia, n],
  );
  const previsao = useEstimativa(consultaEstimativa).data;

  const comparacao = useComparar(medicao);
  const resposta = comparacao.data;
  const medindo = comparacao.isFetching;

  const entradaSerie = useMemo(
    () => (medicao === null ? null : entradaDaSerie(medicao)),
    [medicao],
  );
  const serie = useSerie(entradaSerie);

  const rascunhosValidos =
    validarInteiro(rascunhoN, { minimo: 0 }).valido &&
    validarInteiro(rascunhoRepeticoes, { minimo: 1, maximo: REPETICOES_MAXIMO }).valido;
  const limiteExibido = previsao?.limite_n ?? limite;
  const bloqueado = previsao?.dentro_do_limite === false || (limite !== undefined && n > limite);
  const podeComparar = rascunhosValidos && !bloqueado && !medindo && !verificando;
  const desatualizada = medicao !== null && !mesmaMedicao(medicao, { sequencia, n, repeticoes });

  function iniciar() {
    setCancelada(false);
    setConfirmando(false);
    const pedido: Medicao = { sequencia, n, repeticoes };
    if (mesmaMedicao(medicao, pedido)) {
      void comparacao.refetch();
      void serie.refetch();
      return;
    }
    setMedicao(pedido);
  }

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (!podeComparar) return;
    setVerificando(true);
    try {
      const prevista = await clienteConsultas.fetchQuery(opcoesEstimativa(consultaEstimativa));
      if (!prevista.dentro_do_limite) return;
      if (prevista.pesado) {
        setConfirmando(true);
        return;
      }
      iniciar();
    } catch {
      iniciar();
    } finally {
      setVerificando(false);
    }
  }

  async function cancelar() {
    if (medicao !== null) {
      await clienteConsultas.cancelQueries({ queryKey: chaves.comparar(medicao) });
    }
    if (entradaSerie !== null) {
      await clienteConsultas.cancelQueries({ queryKey: chaves.serie(entradaSerie) });
    }
    setMedicao(null);
    setCancelada(true);
  }

  function aoMudarN(texto: string) {
    setRascunhoN(texto);
    const conferido = validarInteiro(texto, { minimo: 0 });
    if (conferido.valido) {
      ecoarN(conferido.valor);
      definir({ n: conferido.valor }, { substituir: true });
    }
  }

  function aoMudarRepeticoes(texto: string) {
    setRascunhoRepeticoes(texto);
    const conferido = validarInteiro(texto, { minimo: 1, maximo: REPETICOES_MAXIMO });
    if (conferido.valido) {
      ecoarRepeticoes(conferido.valor);
      definir({ repeticoes: conferido.valor }, { substituir: true });
    }
  }

  const resumoAcessivel = resposta
    ? `${DESCRICAO_SEQUENCIAS[resposta.sequencia].nome} f(${resposta.n}): ${formatarInteiro(resposta.invocacoes.sem_cache)} invocações sem cache e ${formatarInteiro(resposta.invocacoes.com_cache)} com cache. Mediana de ${formatarTempoNs(resposta.tempo.sem_cache.mediana_ns)} contra ${formatarTempoNs(resposta.tempo.com_cache.mediana_ns)}: ${lerFator(resposta.fator_aceleracao)}.`
    : '';

  return (
    <div className="space-y-4 lg:grid lg:grid-cols-[300px_minmax(0,1fr)] lg:items-start lg:gap-x-6 lg:space-y-0">
      <section
        aria-labelledby="titulo-pagina"
        className="space-y-2 lg:border-r lg:border-borda lg:pr-6"
      >
        <h1 id="titulo-pagina" className="text-2xl font-semibold">
          Comparar
        </h1>

        <form
          aria-label="O que medir"
          onSubmit={(evento) => void enviar(evento)}
          className="space-y-2"
        >
          <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3">
            <label htmlFor={idSequencia} className="font-medium">
              Sequência
            </label>
            <select
              id={idSequencia}
              value={sequencia}
              onChange={(evento) => {
                const escolhida = SEQUENCIAS.find((id) => id === evento.target.value);
                if (escolhida) definir({ sequencia: escolhida });
              }}
              className="min-h-toque w-full rounded-md border border-borda-forte bg-superficie px-3 text-base"
            >
              {SEQUENCIAS.map((id) => (
                <option key={id} value={id}>
                  {DESCRICAO_SEQUENCIAS[id].nome}
                </option>
              ))}
            </select>
          </div>
          <CampoNumero
            rotulo="n"
            valor={rascunhoN}
            aoMudar={aoMudarN}
            minimo={0}
            maximo={limite}
            reservarErro={false}
          />
          <CampoNumero
            rotulo="Repetições"
            valor={rascunhoRepeticoes}
            aoMudar={aoMudarRepeticoes}
            minimo={1}
            maximo={REPETICOES_MAXIMO}
            reservarErro={false}
          />
          <div className="flex gap-2">
            <Botao
              type="submit"
              className="flex-1"
              icone="comparar"
              carregando={medindo || verificando}
              rotuloCarregando={medindo ? 'Medindo' : 'Conferindo o tamanho'}
              disabled={!podeComparar}
            >
              Comparar
            </Botao>
            {medindo ? (
              <Botao
                variante="neutra"
                className="flex-1"
                icone="cancelar"
                onClick={() => void cancelar()}
              >
                Cancelar
              </Botao>
            ) : null}
          </div>
          <p className="min-h-10 text-sm text-texto-suave">
            {previsao
              ? `Previsão: ${formatarInteiro(previsao.invocacoes_previstas)} invocações sem cache; ${formatarInteiro(repeticoes)} repetições por modo.`
              : null}
          </p>
        </form>

        <SeletorSegmentado
          rotulo="Escala dos gráficos"
          valor={escala}
          aoMudar={setEscala}
          opcoes={OPCOES_ESCALA}
        />
      </section>

      <div className="min-w-0 space-y-3">
        <p role="status" aria-live="polite" className="sr-only">
          {resumoAcessivel}
        </p>

        {bloqueado ? (
          <Alerta
            tipo="erro"
            titulo="Esse n passa do limite desta demonstração"
            acoes={
              limiteExibido !== undefined ? (
                <Botao
                  variante="secundaria"
                  tamanho="pequeno"
                  icone="reduzir"
                  onClick={() => definir({ n: limiteExibido })}
                >
                  Usar n = {formatarInteiro(limiteExibido)}
                </Botao>
              ) : null
            }
          >
            <p>
              Comparar executa os dois modos, e sem cache {nome} não passa de n ={' '}
              {limiteExibido === undefined
                ? 'um valor menor que o pedido'
                : formatarInteiro(limiteExibido)}
              . Acima disso a recursão estoura o tempo e a pilha disponíveis.
            </p>
          </Alerta>
        ) : null}

        {cancelada ? (
          <Alerta tipo="alerta" titulo="Comparação cancelada">
            <p>Nada foi medido. Ajuste os valores e toque em Comparar de novo.</p>
          </Alerta>
        ) : null}

        {comparacao.error !== null ? (
          <EstadoErro
            erro={comparacao.error}
            aoTentarDeNovo={() => iniciar()}
            aoReduzirN={
              limiteExibido === undefined ? undefined : () => definir({ n: limiteExibido })
            }
          />
        ) : null}

        <section aria-labelledby="titulo-resultado" className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 id="titulo-resultado" className="text-xl font-semibold">
              Resultado
            </h2>
            {medicao ? (
              <div className="flex flex-wrap items-center gap-2">
                <Selo>
                  {DESCRICAO_SEQUENCIAS[medicao.sequencia].nome} f({medicao.n})
                </Selo>
                <Selo>
                  {formatarInteiro(medicao.repeticoes)}{' '}
                  {medicao.repeticoes === 1 ? 'repetição' : 'repetições'}
                </Selo>
              </div>
            ) : null}
          </div>

          {medindo ? <Esqueleto linhas={4} altura="h-20" rotulo="Medindo os dois modos" /> : null}

          {medicao === null && !medindo ? (
            <EstadoVazio
              icone="comparar"
              titulo="Nenhuma comparação ainda"
              descricao="Escolha os parâmetros à esquerda e toque em Comparar: aparecem o fator de aceleração, as chamadas evitadas, a memória e as curvas dos dois modos."
            />
          ) : null}

          {resposta && !medindo ? (
            <div className="space-y-2">
              {desatualizada ? (
                <p className="text-sm text-texto-suave">
                  O formulário mudou depois desta medição. Toque em Comparar para atualizar.
                </p>
              ) : null}

              {resposta.ambiente.node === 'mock' ? (
                <Alerta tipo="alerta" titulo="Dados simulados">
                  <p>
                    A API real ainda não está ligada: estes números vêm dos mocks do navegador. As
                    contagens de invocações e as entradas no cache são exatas, mas os tempos e a
                    memória são simulados a partir do número de chamadas.
                  </p>
                </Alerta>
              ) : null}

              <div className="grid gap-3 lg:grid-cols-3">
                <Cartao destaque compacto>
                  <p className="text-sm text-texto-suave">Fator de aceleração</p>
                  <p className="mt-1 text-4xl leading-none font-semibold">
                    {formatarFator(resposta.fator_aceleracao)}
                  </p>
                  <p className="mt-2 text-sm text-texto-suave">
                    Medianas de {formatarTempoNs(resposta.tempo.sem_cache.mediana_ns)} sem cache e{' '}
                    {formatarTempoNs(resposta.tempo.com_cache.mediana_ns)} com cache:{' '}
                    {lerFator(resposta.fator_aceleracao)}.
                  </p>
                </Cartao>

                <Metrica
                  rotulo="Chamadas evitadas pelo cache"
                  valor={formatarInteiro(resposta.chamadas_evitadas)}
                  marca="com-cache"
                  destaque
                  detalhe={
                    resposta.chamadas_evitadas > 0
                      ? `${formatarInteiro(resposta.invocacoes.sem_cache)} invocações sem cache contra ${formatarInteiro(resposta.invocacoes.com_cache)} com cache.`
                      : `Nenhum argumento se repetiu: ${formatarInteiro(resposta.invocacoes.sem_cache)} invocações nos dois modos.`
                  }
                />

                <Metrica
                  rotulo="Memória a mais com cache"
                  valor={formatarBytes(resposta.diferenca_memoria_bytes)}
                  marca="com-cache"
                  destaque
                  detalhe={detalheMemoria(resposta)}
                />
              </div>

              <SecaoCurvas
                consulta={serie}
                escala={escala}
                aoTentarDeNovo={() => void serie.refetch()}
              />

              <div className="space-y-4 pt-2">
                <Cartao as="section" titulo="O que esses números dizem" nivelTitulo={2} compacto>
                  <div className="space-y-3">
                    {interpretar(resposta, info).map((paragrafo) => (
                      <p key={paragrafo.slice(0, 40)} className="max-w-prose">
                        {paragrafo}
                      </p>
                    ))}
                  </div>
                </Cartao>

                <Cartao
                  as="section"
                  titulo="Valor calculado"
                  nivelTitulo={2}
                  descricao="Os dois modos chegam ao mesmo valor: o cache muda o caminho, nunca o resultado."
                  compacto
                >
                  <NumeroGrande
                    valor={resposta.valor}
                    tamanho="medio"
                    rotulo={`${DESCRICAO_SEQUENCIAS[resposta.sequencia].nome} f(${resposta.n}) vale`}
                    nome={`f(${resposta.n})`}
                  />
                </Cartao>

                <Detalhes
                  resumo={
                    <h2 id="titulo-tempo" className="text-base font-semibold">
                      Tempo
                    </h2>
                  }
                >
                  <TabelaTempo resposta={resposta} />
                </Detalhes>

                <Detalhes
                  resumo={
                    <h2 id="titulo-memoria" className="text-base font-semibold">
                      Memória
                    </h2>
                  }
                >
                  <TabelaMemoria resposta={resposta} />
                </Detalhes>

                <BlocoAmbiente ambiente={resposta.ambiente} />

                <GrupoBotoes>
                  <BotaoLink
                    variante="secundaria"
                    icone="calcular"
                    to={enderecoComEstado('/calcular', {
                      sequencia: resposta.sequencia,
                      n: resposta.n,
                      modo: 'comparar',
                    })}
                  >
                    Ver as contagens desta execução
                  </BotaoLink>
                  <BotaoLink
                    variante="neutra"
                    icone="arvore"
                    to={enderecoComEstado('/arvore', {
                      sequencia: resposta.sequencia,
                      n: resposta.n,
                      modo: 'com_cache',
                    })}
                  >
                    Ver árvore com cache
                  </BotaoLink>
                </GrupoBotoes>
              </div>
            </div>
          ) : null}
        </section>
      </div>

      <DialogoConfirmacao
        aberto={confirmando}
        aoFechar={() => setConfirmando(false)}
        aoConfirmar={() => iniciar()}
        titulo="Esta medição é pesada"
        descricao={
          previsao
            ? `Cada execução sem cache de ${nome} f(${previsao.n}) deve fazer ${formatarInteiro(previsao.invocacoes_previstas)} invocações, e são ${formatarInteiro(repeticoes)} repetições.`
            : undefined
        }
        rotuloConfirmar="Medir mesmo assim"
        rotuloCancelar="Voltar e ajustar"
      >
        <p className="text-texto-suave">
          A tela pode ficar parada por alguns segundos. Reduzir o n ou o número de repetições traz o
          mesmo retrato bem mais rápido.
        </p>
      </DialogoConfirmacao>
    </div>
  );
}
