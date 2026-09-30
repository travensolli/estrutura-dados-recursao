import type { Metricas, Modo, No, Sequencia } from '@sequencias/contrato';
import { DESCRICAO_SEQUENCIAS } from '@sequencias/contrato';
import { select } from 'd3-selection';
import { zoom, zoomIdentity, type ZoomBehavior, type ZoomTransform } from 'd3-zoom';
import {
  memo,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react';
import { Icone } from '../componentes/Icone';
import {
  abreviarValor,
  corDoArgumento,
  formatarInteiro,
  rotuloModo,
  primeirosNos,
} from '../utilitarios/formatar';
import { baixarPng, baixarSvg, type Extensao } from './exportar';
import { estiloDoTipo } from './formas';
import {
  ALTURA_DESENHO,
  calcularLayout,
  DIMENSOES,
  enquadrar,
  larguraDoNo,
  type NoPosicionado,
} from './layout';
import {
  achatarNos,
  descreverArvore,
  estadoDoNoNoPasso,
  eventoNoPasso,
  indexarPassos,
  rotuloTipo,
  type EstadoNo,
  rotuloAbrirRecolhidos,
} from './modelo';
import { Legenda } from './ui/Legenda';

const ESCALA_MINIMA = 0.15;
const ESCALA_MAXIMA = 2.5;
/** Espaço reservado para a dica acima do nó, em pixels. */
const ALTURA_DICA = 170;
/** Faixa do enquadramento automático: nem ilegível, nem esticado demais. */
const ENQUADRE_MINIMO = 0.25;
const ENQUADRE_MAXIMO = 1.4;
const PASSO_ZOOM = 1.35;
const { altura: A } = DIMENSOES;

export interface ArvoreSvgProps {
  /** Trocar de árvore exige remontar o componente: use `key` na chamada. */
  raiz: No;
  metricas: Metricas;
  sequencia: Sequencia;
  n: number;
  modo: Modo;
  truncada?: boolean;
  nosExibidos?: number;
  /** Instante da reprodução; sem ele a árvore aparece inteira e resolvida. */
  passo?: number | null;
  /** prefers-reduced-motion: sem transições. */
  animacaoReduzida?: boolean;
  /** Esconde contadores e dicas para sobrar altura na reprodução. */
  compacto?: boolean;
  /** Realce vindo de fora, de uma tabela por exemplo; o ponteiro tem prioridade. */
  argumentoRealcado?: number | null;
  /** Avisa qual argumento o ponteiro ou o foco está realçando. */
  aoRealcarArgumento?: (argumento: number | null) => void;
  /** Nós desenhados como subárvore evitada: esmaecidos e tracejados. */
  fantasmas?: ReadonlySet<number>;
  /** Selo próprio por nó, no lugar do selo de descendentes ocultos. */
  selos?: ReadonlyMap<number, string>;
  /** Piso do enquadramento automático: abaixo do padrão cabe árvore maior. */
  enquadreMinimo?: number;
  /** Classes de altura do desenho. */
  classeAltura?: string;
  /** No palco da apresentação: sem exportar, e a barra de zoom só aparece com o
      ponteiro sobre o desenho ou o foco dentro dele, para não ficar na imagem projetada. */
  palco?: boolean;
  /** Ocupa a altura que o contêiner flex sobrar, em vez de seguir a proporção do desenho;
      `classeAltura` passa a ser só o piso. */
  preencher?: boolean;
}

interface Dica {
  titulo: string;
  linhas: string[];
  x: number;
  y: number;
  /** Cai para baixo do nó quando não há espaço acima. */
  abaixo: boolean;
}

/* Os botões moram numa barra flutuante sobre o desenho: sem borda própria, a barra
   é que tem superfície e contorno. */
const BOTAO =
  'inline-flex min-h-toque min-w-toque items-center justify-center gap-1 rounded px-2 text-sm text-texto hover:bg-superficie-suave disabled:opacity-60';
const BARRA =
  'pointer-events-auto flex items-center gap-0.5 rounded-md border border-borda bg-superficie/90 p-0.5 shadow-cartao backdrop-blur-sm';

export function ArvoreSvg({
  raiz,
  metricas,
  sequencia,
  n,
  modo,
  truncada = false,
  nosExibidos,
  passo = null,
  animacaoReduzida = false,
  compacto = false,
  argumentoRealcado = null,
  aoRealcarArgumento,
  fantasmas,
  selos,
  enquadreMinimo = ENQUADRE_MINIMO,
  classeAltura = ALTURA_DESENHO,
  palco = false,
  preencher = false,
}: ArvoreSvgProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const comportamentoRef = useRef<ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const nosRef = useRef(new Map<number, SVGGElement>());

  const [recolhidos, setRecolhidos] = useState<ReadonlySet<number>>(() => new Set<number>());
  const [transformacao, setTransformacao] = useState<ZoomTransform>(zoomIdentity);
  const [idAtivo, setIdAtivo] = useState<number>(raiz.id);
  const [idFoco, setIdFoco] = useState<number | null>(null);
  const [idPonteiro, setIdPonteiro] = useState<number | null>(null);
  const [gerandoPng, setGerandoPng] = useState(false);
  const [erroExportacao, setErroExportacao] = useState<string | null>(null);
  const idDica = idPonteiro ?? idFoco;

  const layout = useMemo(() => calcularLayout(raiz, recolhidos), [raiz, recolhidos]);
  const layoutRef = useRef(layout);
  useEffect(() => {
    layoutRef.current = layout;
  }, [layout]);

  const indicePassos = useMemo(() => indexarPassos(achatarNos(raiz)), [raiz]);
  const idEvento = passo === null ? null : (eventoNoPasso(indicePassos, passo)?.no.id ?? null);

  const ocorrencias = useMemo(
    () => new Map(metricas.invocacoes_por_argumento.map((e) => [e.argumento, e.invocacoes])),
    [metricas],
  );

  const ajustar = useCallback(() => {
    const svg = svgRef.current;
    const comportamento = comportamentoRef.current;
    if (!svg || !comportamento) return;
    const { k, x, y } = enquadrar(
      layoutRef.current.caixa,
      layoutRef.current.raizX,
      svg.clientWidth,
      svg.clientHeight,
      enquadreMinimo,
      ENQUADRE_MAXIMO,
    );
    comportamento.transform(select(svg), zoomIdentity.translate(x, y).scale(k));
  }, [enquadreMinimo]);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const areaVisivel = (): [[number, number], [number, number]] => [
      [0, 0],
      [svg.clientWidth, svg.clientHeight],
    ];
    const comportamento = zoom<SVGSVGElement, unknown>()
      .scaleExtent([ESCALA_MINIMA, ESCALA_MAXIMA])
      .extent(areaVisivel)
      .on('zoom', (evento: { transform: ZoomTransform }) => setTransformacao(evento.transform));
    select(svg).call(comportamento).on('dblclick.zoom', null);
    comportamentoRef.current = comportamento;
    return () => {
      select(svg).on('.zoom', null);
      comportamentoRef.current = null;
    };
  }, []);

  useEffect(() => {
    ajustar();
  }, [raiz, ajustar]);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg || typeof ResizeObserver === 'undefined') return;
    const observador = new ResizeObserver(() => ajustar());
    observador.observe(svg);
    return () => observador.disconnect();
  }, [ajustar]);

  const aplicarZoom = useCallback((fator: number) => {
    const svg = svgRef.current;
    const comportamento = comportamentoRef.current;
    if (!svg || !comportamento) return;
    comportamento.scaleBy(select(svg), fator);
  }, []);

  const focar = useCallback((id: number) => {
    setIdAtivo(id);
    nosRef.current.get(id)?.focus();
  }, []);

  const alternar = useCallback((posicionado: NoPosicionado) => {
    if (posicionado.no.filhos.length === 0) return;
    setRecolhidos((atual) => {
      const proximo = new Set(atual);
      if (proximo.has(posicionado.no.id)) proximo.delete(posicionado.no.id);
      else proximo.add(posicionado.no.id);
      return proximo;
    });
  }, []);

  const vizinho = useCallback(
    (posicionado: NoPosicionado, salto: number): number | null => {
      const pai = posicionado.paiId === null ? null : layout.porId.get(posicionado.paiId);
      if (pai) {
        const irmaos = pai.filhosVisiveis;
        const alvo = irmaos.indexOf(posicionado.no.id) + salto;
        if (alvo >= 0 && alvo < irmaos.length) return irmaos[alvo] ?? null;
      }
      const posicao = layout.ordem.indexOf(posicionado.no.id) + salto;
      return layout.ordem[posicao] ?? null;
    },
    [layout],
  );

  const aoTeclar = useCallback(
    (evento: KeyboardEvent<SVGGElement>, posicionado: NoPosicionado) => {
      const ir = (id: number | null | undefined) => {
        if (id === null || id === undefined) return;
        evento.preventDefault();
        focar(id);
      };
      if (evento.key === 'ArrowUp') ir(posicionado.paiId);
      else if (evento.key === 'ArrowDown') ir(posicionado.filhosVisiveis[0]);
      else if (evento.key === 'ArrowLeft') ir(vizinho(posicionado, -1));
      else if (evento.key === 'ArrowRight') ir(vizinho(posicionado, 1));
      else if (evento.key === 'Home') ir(layout.ordem[0]);
      else if (evento.key === 'End') ir(layout.ordem[layout.ordem.length - 1]);
      else if (evento.key === 'Enter' || evento.key === ' ') {
        evento.preventDefault();
        alternar(posicionado);
      }
    },
    [alternar, focar, layout, vizinho],
  );

  const registrar = useCallback((id: number, elemento: SVGGElement | null) => {
    if (elemento) nosRef.current.set(id, elemento);
    else nosRef.current.delete(id);
  }, []);
  const aoFocar = useCallback((id: number) => setIdFoco(id), []);
  const aoDesfocar = useCallback(
    (id: number) => setIdFoco((atual) => (atual === id ? null : atual)),
    [],
  );
  const aoApontar = useCallback((id: number) => setIdPonteiro(id), []);
  const aoSair = useCallback(
    (id: number) => setIdPonteiro((atual) => (atual === id ? null : atual)),
    [],
  );
  const aoClicar = useCallback(
    (posicionado: NoPosicionado) => {
      focar(posicionado.no.id);
      alternar(posicionado);
    },
    [alternar, focar],
  );

  const posicionadoDica = idDica === null ? null : (layout.porId.get(idDica) ?? null);
  const argumentoInterno = posicionadoDica?.no.argumento ?? null;
  const argumentoFoco = argumentoInterno ?? argumentoRealcado;

  useEffect(() => {
    aoRealcarArgumento?.(argumentoInterno);
  }, [aoRealcarArgumento, argumentoInterno]);

  const dica: Dica | null = useMemo(() => {
    if (!posicionadoDica) return null;
    const { no, ocultos, podadoPorOrcamento } = posicionadoDica;
    const valor = abreviarValor(no.valor, 24);
    const total = ocorrencias.get(no.argumento) ?? 1;
    const evitado = fantasmas?.has(no.id) ?? false;
    const linhas = evitado
      ? ['chamada evitada pelo cache', 'esta subárvore não chegou a ser executada']
      : [
          rotuloTipo(no.tipo),
          `profundidade ${no.profundidade}`,
          `entra no passo ${no.ordem_entrada} e sai no passo ${no.ordem_saida}`,
          total === 1
            ? 'aparece 1 vez na execução'
            : `aparece ${formatarInteiro(total)} vezes na execução`,
        ];
    if (!evitado && ocultos > 0) {
      linhas.push(
        podadoPorOrcamento
          ? `${formatarInteiro(ocultos)} descendentes fora do limite de nós`
          : `${formatarInteiro(ocultos)} descendentes recolhidos`,
      );
    }
    const topo = transformacao.y + transformacao.k * (posicionadoDica.y - A / 2);
    const base = transformacao.y + transformacao.k * (posicionadoDica.y + A / 2);
    const abaixo = topo < ALTURA_DICA;
    return {
      titulo: evitado
        ? `f(${no.argumento}): não foi chamada`
        : `f(${no.argumento}) = ${valor.abreviado}${valor.foiAbreviado ? ` (${valor.digitos} dígitos)` : ''}`,
      linhas,
      x: transformacao.x + transformacao.k * posicionadoDica.x,
      y: abaixo ? base + 12 : topo - 12,
      abaixo,
    };
  }, [fantasmas, ocorrencias, posicionadoDica, transformacao]);

  const descricao = useMemo(() => {
    const base = descreverArvore(DESCRICAO_SEQUENCIAS[sequencia].nome, n, modo, metricas);
    return truncada
      ? `${base} A figura mostra ${primeirosNos(nosExibidos ?? layout.nos.length)}.`
      : base;
  }, [layout.nos.length, metricas, modo, n, nosExibidos, sequencia, truncada]);

  const montadoRef = useRef(true);
  useEffect(() => {
    montadoRef.current = true;
    return () => {
      montadoRef.current = false;
    };
  }, []);

  const exportarArquivo = useCallback(
    async (extensao: Extensao) => {
      const svg = svgRef.current;
      if (!svg) return;
      const alvo = { sequencia, n, modo };
      const opcoes = { svg, caixa: layoutRef.current.caixa, titulo: descricao };
      setErroExportacao(null);
      setGerandoPng(extensao === 'png');
      try {
        if (extensao === 'svg') baixarSvg(alvo, opcoes);
        else await baixarPng(alvo, opcoes);
      } catch (erro) {
        if (montadoRef.current) {
          setErroExportacao(
            erro instanceof Error ? erro.message : 'Não deu para exportar a árvore.',
          );
        }
      } finally {
        if (montadoRef.current) setGerandoPng(false);
      }
    },
    [descricao, modo, n, sequencia],
  );

  return (
    <figure className={`m-0 flex flex-col gap-2 ${preencher ? 'min-h-0 flex-1' : ''}`}>
      <div
        className={`group/desenho relative overflow-hidden rounded-lg border border-borda bg-superficie ${
          preencher ? 'flex min-h-0 flex-1 flex-col' : ''
        }`}
      >
        {/* A barra flutua no canto inferior direito e não custa altura: nas três
            recorrências o ramo mais fundo é o da esquerda, f(n-1), e os da direita são
            rasos, então esse canto fica vazio. O contêiner deixa o ponteiro passar, e
            arrastar a árvore funciona até atrás dele. */}
        <div
          className={`pointer-events-none absolute right-2 bottom-2 z-10 flex flex-wrap justify-end gap-1.5 ${
            palco
              ? 'transition-opacity duration-150 denso:opacity-0 denso:group-focus-within/desenho:opacity-100 denso:group-hover/desenho:opacity-100'
              : ''
          }`}
        >
          <div className={BARRA} role="group" aria-label={`Zoom da árvore ${rotuloModo(modo)}`}>
            <BotaoDaBarra icone="mais" rotulo="Aproximar" onClick={() => aplicarZoom(PASSO_ZOOM)} />
            <BotaoDaBarra
              icone="menos"
              rotulo="Afastar"
              onClick={() => aplicarZoom(1 / PASSO_ZOOM)}
            />
            <BotaoDaBarra icone="ajustar" rotulo="Ajustar à tela" onClick={ajustar} />
          </div>
          {!palco && (
            <MenuBaixar
              modo={modo}
              gerandoPng={gerandoPng}
              aoEscolher={(extensao) => void exportarArquivo(extensao)}
            />
          )}
        </div>
        {recolhidos.size > 0 && (
          <div className="pointer-events-none absolute top-2 left-2 z-10">
            <div className={BARRA}>
              <button
                type="button"
                className={BOTAO}
                onClick={() => setRecolhidos(new Set<number>())}
              >
                {rotuloAbrirRecolhidos(recolhidos.size)}
              </button>
            </div>
          </div>
        )}
        <svg
          ref={svgRef}
          role="group"
          aria-label={descricao}
          className={`block w-full touch-none ${preencher ? 'flex-1' : 'h-auto'} ${classeAltura}`}
          style={
            preencher
              ? undefined
              : { aspectRatio: `${layout.caixa.largura} / ${layout.caixa.altura}` }
          }
        >
          <g
            data-camada="conteudo"
            transform={`translate(${transformacao.x}, ${transformacao.y}) scale(${transformacao.k})`}
          >
            <g fill="none" stroke="var(--borda-forte)" strokeWidth={1.5}>
              {layout.ligacoes.map((ligacao) => {
                const destino = layout.porId.get(ligacao.idDestino);
                const futura =
                  passo !== null &&
                  destino !== undefined &&
                  estadoDoNoNoPasso(destino.no, passo) === 'futuro';
                const realcada =
                  argumentoFoco === null || argumentoFoco === ligacao.argumentoDestino;
                const fantasma = fantasmas?.has(ligacao.idDestino) ?? false;
                return (
                  <path
                    key={ligacao.id}
                    d={ligacao.caminho}
                    strokeDasharray={fantasma ? '6 4' : undefined}
                    opacity={futura ? 0.12 : fantasma ? 0.4 : realcada ? 0.9 : 0.2}
                  />
                );
              })}
            </g>
            {layout.nos.map((posicionado) => (
              <NoDesenhado
                key={posicionado.no.id}
                posicionado={posicionado}
                realce={
                  argumentoFoco === null
                    ? 'neutro'
                    : argumentoFoco === posicionado.no.argumento
                      ? 'sim'
                      : 'nao'
                }
                estado={passo === null ? null : estadoDoNoNoPasso(posicionado.no, passo)}
                emFoco={posicionado.no.id === idEvento}
                ativo={posicionado.no.id === idAtivo}
                fantasma={fantasmas?.has(posicionado.no.id) ?? false}
                selo={selos?.get(posicionado.no.id) ?? null}
                animacaoReduzida={animacaoReduzida}
                registrar={registrar}
                aoFocar={aoFocar}
                aoDesfocar={aoDesfocar}
                aoApontar={aoApontar}
                aoSair={aoSair}
                aoClicar={aoClicar}
                aoTeclar={aoTeclar}
              />
            ))}
          </g>
        </svg>

        {dica && (
          <div
            className={`pointer-events-none absolute z-10 w-56 rounded-md border border-borda bg-superficie-elevada p-3 text-sm shadow-flutuante ${dica.abaixo ? '' : '-translate-y-full'}`}
            style={{ left: `clamp(0px, ${dica.x}px - 7rem, 100% - 14rem)`, top: `${dica.y}px` }}
          >
            <p className="font-mono font-semibold break-all">{dica.titulo}</p>
            <ul className="mt-1 space-y-0.5 text-texto-suave">
              {dica.linhas.map((linha) => (
                <li key={linha}>{linha}</li>
              ))}
            </ul>
          </div>
        )}
        <p className="sr-only" aria-live="polite">
          {dica ? `${dica.titulo}, ${dica.linhas.join(', ')}` : ''}
        </p>
      </div>

      {erroExportacao && (
        <p role="alert" className="text-sm text-erro">
          {erroExportacao}
        </p>
      )}

      <figcaption className="flex flex-wrap items-center justify-between gap-x-6 gap-y-1">
        <Legenda />
        {!compacto && (
          <p className="text-sm text-texto-suave">
            Arraste para mover, role para aproximar e clique para recolher.
          </p>
        )}
      </figcaption>
    </figure>
  );
}

/** Só o ícone à vista; o nome vai para o leitor de tela e para a dica do ponteiro. */
function BotaoDaBarra({
  icone,
  rotulo,
  onClick,
}: {
  icone: 'mais' | 'menos' | 'ajustar';
  rotulo: string;
  onClick: () => void;
}) {
  return (
    <button type="button" className={BOTAO} title={rotulo} onClick={onClick}>
      <Icone nome={icone} tamanho={18} />
      <span className="sr-only">{rotulo}</span>
    </button>
  );
}

const FORMATOS: ReadonlyArray<{ extensao: Extensao; rotulo: string; detalhe: string }> = [
  { extensao: 'svg', rotulo: 'SVG', detalhe: 'Vetor, abre em editores de slides' },
  { extensao: 'png', rotulo: 'PNG', detalhe: 'Imagem em 2x, nítida no projetor' },
];

interface MenuBaixarProps {
  modo: Modo;
  gerandoPng: boolean;
  aoEscolher: (extensao: Extensao) => void;
}

/** Um botão de baixar que abre, para cima, a escolha do formato do arquivo. */
function MenuBaixar({ modo, gerandoPng, aoEscolher }: MenuBaixarProps) {
  const [aberto, setAberto] = useState(false);
  const idFormatos = useId();
  const raizRef = useRef<HTMLDivElement>(null);
  const gatilhoRef = useRef<HTMLButtonElement>(null);

  // Clicar fora fecha; o clique no próprio botão fica com o onClick dele.
  useEffect(() => {
    if (!aberto) return;
    function aoApertar(evento: PointerEvent) {
      if (!raizRef.current?.contains(evento.target as Node)) setAberto(false);
    }
    document.addEventListener('pointerdown', aoApertar);
    return () => document.removeEventListener('pointerdown', aoApertar);
  }, [aberto]);

  function fechar() {
    setAberto(false);
    gatilhoRef.current?.focus();
  }

  const rotulo = gerandoPng ? 'Gerando PNG…' : 'Baixar a árvore';
  return (
    <div
      ref={raizRef}
      className={`relative ${BARRA}`}
      role="group"
      aria-label={`Exportar a árvore ${rotuloModo(modo)}`}
      onKeyDown={(evento) => {
        if (evento.key !== 'Escape' || !aberto) return;
        evento.stopPropagation();
        fechar();
      }}
      onBlur={(evento) => {
        // Sem destino (clique em área que não recebe foco), quem fecha é o clique fora.
        const destino = evento.relatedTarget;
        if (destino !== null && !evento.currentTarget.contains(destino)) setAberto(false);
      }}
    >
      <button
        ref={gatilhoRef}
        type="button"
        className={BOTAO}
        title={rotulo}
        aria-expanded={aberto}
        aria-controls={aberto ? idFormatos : undefined}
        onClick={() => setAberto((atual) => !atual)}
      >
        <Icone
          nome={gerandoPng ? 'carregando' : 'baixar'}
          tamanho={18}
          className={gerandoPng ? 'animate-spin' : undefined}
        />
        <span className="sr-only">{rotulo}</span>
      </button>
      {aberto && (
        <div
          id={idFormatos}
          className="absolute right-0 bottom-full mb-1.5 flex w-64 flex-col rounded-md border border-borda bg-superficie-elevada p-1 shadow-flutuante"
        >
          {FORMATOS.map((formato) => (
            <button
              key={formato.extensao}
              type="button"
              aria-label={`Baixar ${formato.rotulo}`}
              aria-describedby={`${idFormatos}-${formato.extensao}`}
              className="flex min-h-toque flex-col items-start justify-center rounded px-2.5 py-1 text-left hover:bg-superficie-suave disabled:opacity-60"
              disabled={formato.extensao === 'png' && gerandoPng}
              onClick={() => {
                fechar();
                aoEscolher(formato.extensao);
              }}
            >
              <span className="text-sm font-semibold">{formato.rotulo}</span>
              <span id={`${idFormatos}-${formato.extensao}`} className="text-xs text-texto-suave">
                {formato.detalhe}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

interface NoDesenhadoProps {
  posicionado: NoPosicionado;
  realce: 'neutro' | 'sim' | 'nao';
  /** null quando não há reprodução em curso. */
  estado: EstadoNo | null;
  /** Nó do evento do instante atual. */
  emFoco: boolean;
  ativo: boolean;
  /** Nó que só existe como subárvore evitada pelo cache. */
  fantasma: boolean;
  /** Selo próprio, no lugar do selo de descendentes ocultos. */
  selo: string | null;
  animacaoReduzida: boolean;
  registrar: (id: number, elemento: SVGGElement | null) => void;
  aoFocar: (id: number) => void;
  aoDesfocar: (id: number) => void;
  aoApontar: (id: number) => void;
  aoSair: (id: number) => void;
  aoClicar: (posicionado: NoPosicionado) => void;
  aoTeclar: (evento: KeyboardEvent<SVGGElement>, posicionado: NoPosicionado) => void;
}

/** Memoizado: numa árvore grande, cada passo muda o estado de poucos nós. */
const NoDesenhado = memo(function NoDesenhado({
  posicionado,
  realce,
  estado,
  emFoco,
  ativo,
  fantasma,
  selo: seloProprio,
  animacaoReduzida,
  registrar,
  aoFocar,
  aoDesfocar,
  aoApontar,
  aoSair,
  aoClicar,
  aoTeclar,
}: NoDesenhadoProps) {
  const { no } = posicionado;
  const referencia = useCallback(
    (elemento: SVGGElement | null) => registrar(no.id, elemento),
    [no.id, registrar],
  );
  const cor = corDoArgumento(no.argumento);
  const largura = larguraDoNo(no.tipo);
  const estilo = estiloDoTipo(no.tipo, largura, A);
  const realcado = realce === 'sim';
  const apagado = realce === 'nao';
  const futuro = estado === 'futuro';
  const valor = abreviarValor(no.valor, 9);
  const seloDeOcultos =
    posicionado.ocultos > 0
      ? posicionado.podadoPorOrcamento
        ? `+${formatarInteiro(posicionado.ocultos)} ocultos`
        : `+${formatarInteiro(posicionado.ocultos)}`
      : null;
  const selo = seloProprio ?? seloDeOcultos;

  return (
    <g
      ref={referencia}
      data-testid="no-arvore"
      data-argumento={no.argumento}
      data-tipo={no.tipo}
      data-realce={realce}
      data-estado={estado ?? 'inteira'}
      data-fantasma={fantasma ? 'sim' : 'nao'}
      transform={`translate(${posicionado.x}, ${posicionado.y})`}
      tabIndex={ativo ? 0 : -1}
      role="button"
      aria-label={rotuloAcessivel(posicionado, fantasma)}
      aria-expanded={no.filhos.length > 0 ? !posicionado.recolhido : undefined}
      className={animacaoReduzida ? 'cursor-pointer' : 'cursor-pointer transition-opacity'}
      opacity={futuro ? 0.16 : apagado ? 0.25 : fantasma ? 0.5 : 1}
      onFocus={() => aoFocar(no.id)}
      onBlur={() => aoDesfocar(no.id)}
      onPointerEnter={() => aoApontar(no.id)}
      onPointerLeave={() => aoSair(no.id)}
      onClick={() => aoClicar(posicionado)}
      onKeyDown={(evento) => aoTeclar(evento, posicionado)}
    >
      {emFoco && (
        <path d={estilo.caminho} fill="none" stroke="var(--foco)" strokeWidth={8} opacity={0.8} />
      )}
      <path
        d={estilo.caminho}
        fill={cor}
        fillOpacity={fantasma ? 0.08 : realcado || emFoco ? 0.34 : 0.22}
        stroke={cor}
        strokeWidth={fantasma ? 1.5 : realcado || emFoco ? 3 : 2}
        strokeDasharray={fantasma ? '6 4' : estilo.tracejado}
      />
      <path
        d={estilo.marca}
        transform={`translate(${-largura / 2 + 14}, 0)`}
        fill="var(--texto-suave)"
      />
      <text
        x={8}
        y={-2}
        aria-hidden="true"
        textAnchor="middle"
        className="font-mono"
        fontSize={15}
        fontWeight={600}
        fill="var(--texto)"
      >
        f({no.argumento})
      </text>
      <text
        x={8}
        y={14}
        aria-hidden="true"
        textAnchor="middle"
        className="font-mono"
        fontSize={11}
        fill="var(--texto-suave)"
      >
        {estado === null || estado === 'resolvido' ? valor.abreviado : '…'}
      </text>
      {selo && (
        <g transform={`translate(0, ${A / 2 + 13})`}>
          <rect
            x={-(selo.length * 3.6 + 9)}
            y={-10}
            width={selo.length * 7.2 + 18}
            height={20}
            rx={10}
            fill="var(--superficie)"
            stroke={posicionado.podadoPorOrcamento ? 'var(--no-podado)' : cor}
            strokeWidth={1.5}
            strokeDasharray={posicionado.podadoPorOrcamento ? '4 3' : undefined}
          />
          <text
            x={0}
            y={4}
            textAnchor="middle"
            className="font-mono"
            fontSize={11}
            fill="var(--texto-suave)"
          >
            {selo}
          </text>
        </g>
      )}
    </g>
  );
});

function rotuloAcessivel(posicionado: NoPosicionado, fantasma = false): string {
  const { no, ocultos, podadoPorOrcamento } = posicionado;
  const valor = abreviarValor(no.valor, 24);
  const partes = fantasma
    ? [`f(${no.argumento}): chamada evitada pelo cache`, rotuloTipo(no.tipo)]
    : [
        `f(${no.argumento}) igual a ${valor.abreviado}`,
        rotuloTipo(no.tipo),
        `profundidade ${no.profundidade}`,
        `entra no passo ${no.ordem_entrada}, sai no passo ${no.ordem_saida}`,
      ];
  if (ocultos > 0) {
    partes.push(
      podadoPorOrcamento
        ? `${ocultos} descendentes fora do limite de nós`
        : `${ocultos} descendentes recolhidos`,
    );
  }
  return partes.join(', ');
}
