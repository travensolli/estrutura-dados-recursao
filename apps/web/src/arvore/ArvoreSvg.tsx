import type { Metricas, Modo, No, Sequencia } from '@sequencias/contrato';
import { DESCRICAO_SEQUENCIAS } from '@sequencias/contrato';
import { select } from 'd3-selection';
import { zoom, zoomIdentity, type ZoomBehavior, type ZoomTransform } from 'd3-zoom';
import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { abreviarValor, corDoArgumento, formatarInteiro } from '../utilitarios/formatar';
import { baixarPng, baixarSvg, type Extensao } from './exportar';
import { estiloDoTipo } from './formas';
import { calcularLayout, DIMENSOES, enquadrar, larguraDoNo, type NoPosicionado } from './layout';
import { descreverArvore, rotuloTipo } from './modelo';
import { Contadores } from './ui/Contadores';
import { Legenda } from './ui/Legenda';

const ESCALA_MINIMA = 0.15;
const ESCALA_MAXIMA = 2.5;
/** Espaço reservado para a dica acima do nó, em pixels. */
const ALTURA_DICA = 170;
/** Faixa do enquadramento automático: nem ilegível, nem esticado demais. */
const ENQUADRE_MINIMO = 0.4;
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
}

interface Dica {
  titulo: string;
  linhas: string[];
  x: number;
  y: number;
  /** Cai para baixo do nó quando não há espaço acima. */
  abaixo: boolean;
}

const BOTAO =
  'inline-flex h-9 min-w-9 items-center justify-center gap-1 rounded-md border border-borda bg-superficie px-2 text-sm text-texto hover:bg-superficie-suave disabled:opacity-60';

export function ArvoreSvg({
  raiz,
  metricas,
  sequencia,
  n,
  modo,
  truncada = false,
  nosExibidos,
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
      ENQUADRE_MINIMO,
      ENQUADRE_MAXIMO,
    );
    comportamento.transform(select(svg), zoomIdentity.translate(x, y).scale(k));
  }, []);

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
    (posicionado: NoPosicionado, passo: number): number | null => {
      const pai = posicionado.paiId === null ? null : layout.porId.get(posicionado.paiId);
      if (pai) {
        const irmaos = pai.filhosVisiveis;
        const alvo = irmaos.indexOf(posicionado.no.id) + passo;
        if (alvo >= 0 && alvo < irmaos.length) return irmaos[alvo] ?? null;
      }
      const posicao = layout.ordem.indexOf(posicionado.no.id) + passo;
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

  const posicionadoDica = idDica === null ? null : (layout.porId.get(idDica) ?? null);
  const argumentoFoco = posicionadoDica?.no.argumento ?? null;

  const dica: Dica | null = useMemo(() => {
    if (!posicionadoDica) return null;
    const { no, ocultos, podadoPorOrcamento } = posicionadoDica;
    const valor = abreviarValor(no.valor, 24);
    const total = ocorrencias.get(no.argumento) ?? 1;
    const linhas = [
      rotuloTipo(no.tipo),
      `profundidade ${no.profundidade}`,
      `entra no passo ${no.ordem_entrada} e sai no passo ${no.ordem_saida}`,
      total === 1
        ? 'aparece 1 vez na execução'
        : `aparece ${formatarInteiro(total)} vezes na execução`,
    ];
    if (ocultos > 0) {
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
      titulo: `f(${no.argumento}) = ${valor.abreviado}${valor.foiAbreviado ? ` (${valor.digitos} dígitos)` : ''}`,
      linhas,
      x: transformacao.x + transformacao.k * posicionadoDica.x,
      y: abaixo ? base + 12 : topo - 12,
      abaixo,
    };
  }, [ocorrencias, posicionadoDica, transformacao]);

  const descricao = useMemo(() => {
    const base = descreverArvore(DESCRICAO_SEQUENCIAS[sequencia].nome, n, modo, metricas);
    return truncada
      ? `${base} A figura mostra os primeiros ${formatarInteiro(nosExibidos ?? layout.nos.length)} nós.`
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
    <figure className="m-0 flex flex-col gap-3">
      <Contadores metricas={metricas} nosExibidos={nosExibidos} />

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1" role="group" aria-label="Zoom da árvore">
          <button type="button" className={BOTAO} onClick={() => aplicarZoom(PASSO_ZOOM)}>
            <span aria-hidden="true">+</span>
            <span className="sr-only">Aproximar</span>
          </button>
          <button type="button" className={BOTAO} onClick={() => aplicarZoom(1 / PASSO_ZOOM)}>
            <span aria-hidden="true">−</span>
            <span className="sr-only">Afastar</span>
          </button>
          <button type="button" className={BOTAO} onClick={ajustar}>
            Ajustar à tela
          </button>
        </div>
        <div className="flex items-center gap-1" role="group" aria-label="Exportar a árvore">
          <button type="button" className={BOTAO} onClick={() => void exportarArquivo('svg')}>
            Baixar SVG
          </button>
          <button
            type="button"
            className={BOTAO}
            disabled={gerandoPng}
            onClick={() => void exportarArquivo('png')}
          >
            {gerandoPng ? 'Gerando PNG…' : 'Baixar PNG'}
          </button>
        </div>
        {recolhidos.size > 0 && (
          <button type="button" className={BOTAO} onClick={() => setRecolhidos(new Set<number>())}>
            Abrir os {formatarInteiro(recolhidos.size)} nós recolhidos
          </button>
        )}
        <p className="ml-auto text-sm text-texto-suave">
          Arraste para mover, role para aproximar, clique num nó para recolher.
        </p>
        {erroExportacao && (
          <p role="alert" className="basis-full text-sm text-erro">
            {erroExportacao}
          </p>
        )}
      </div>

      <div className="relative overflow-hidden rounded-lg border border-borda bg-superficie">
        <svg
          ref={svgRef}
          role="img"
          aria-label={descricao}
          className="block h-auto max-h-[680px] min-h-[320px] w-full touch-none"
          style={{ aspectRatio: `${layout.caixa.largura} / ${layout.caixa.altura}` }}
        >
          <g
            data-camada="conteudo"
            transform={`translate(${transformacao.x}, ${transformacao.y}) scale(${transformacao.k})`}
          >
            <g fill="none" stroke="var(--borda-forte)" strokeWidth={1.5}>
              {layout.ligacoes.map((ligacao) => (
                <path
                  key={ligacao.id}
                  d={ligacao.caminho}
                  opacity={
                    argumentoFoco === null || argumentoFoco === ligacao.argumentoDestino ? 0.9 : 0.2
                  }
                />
              ))}
            </g>
            {layout.nos.map((posicionado) => {
              const { no } = posicionado;
              const cor = corDoArgumento(no.argumento);
              const largura = larguraDoNo(no.tipo);
              const estilo = estiloDoTipo(no.tipo, largura, A);
              const realcado = argumentoFoco !== null && argumentoFoco === no.argumento;
              const apagado = argumentoFoco !== null && !realcado;
              const valor = abreviarValor(no.valor, 9);
              const selo =
                posicionado.ocultos > 0
                  ? posicionado.podadoPorOrcamento
                    ? `+${formatarInteiro(posicionado.ocultos)} ocultos`
                    : `+${formatarInteiro(posicionado.ocultos)}`
                  : null;
              return (
                <g
                  key={no.id}
                  ref={(elemento) => {
                    if (elemento) nosRef.current.set(no.id, elemento);
                    else nosRef.current.delete(no.id);
                  }}
                  data-testid="no-arvore"
                  data-argumento={no.argumento}
                  data-tipo={no.tipo}
                  data-realce={argumentoFoco === null ? 'neutro' : realcado ? 'sim' : 'nao'}
                  transform={`translate(${posicionado.x}, ${posicionado.y})`}
                  tabIndex={no.id === idAtivo ? 0 : -1}
                  role="button"
                  aria-label={rotuloAcessivel(posicionado)}
                  aria-expanded={no.filhos.length > 0 ? !posicionado.recolhido : undefined}
                  className="cursor-pointer transition-opacity"
                  opacity={apagado ? 0.25 : 1}
                  onFocus={() => setIdFoco(no.id)}
                  onBlur={() => setIdFoco((atual) => (atual === no.id ? null : atual))}
                  onPointerEnter={() => setIdPonteiro(no.id)}
                  onPointerLeave={() => setIdPonteiro((atual) => (atual === no.id ? null : atual))}
                  onClick={() => {
                    focar(no.id);
                    alternar(posicionado);
                  }}
                  onKeyDown={(evento) => aoTeclar(evento, posicionado)}
                >
                  <path
                    d={estilo.caminho}
                    fill={cor}
                    fillOpacity={realcado ? 0.34 : 0.22}
                    stroke={cor}
                    strokeWidth={realcado ? 3 : 2}
                    strokeDasharray={estilo.tracejado}
                  />
                  <path
                    d={estilo.marca}
                    transform={`translate(${-largura / 2 + 14}, 0)`}
                    fill="var(--texto-suave)"
                  />
                  <text
                    x={8}
                    y={-2}
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
                    textAnchor="middle"
                    className="font-mono"
                    fontSize={11}
                    fill="var(--texto-suave)"
                  >
                    {valor.abreviado}
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
            })}
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

      <figcaption>
        <Legenda />
      </figcaption>
    </figure>
  );
}

function rotuloAcessivel(posicionado: NoPosicionado): string {
  const { no, ocultos, podadoPorOrcamento } = posicionado;
  const valor = abreviarValor(no.valor, 24);
  const partes = [
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
