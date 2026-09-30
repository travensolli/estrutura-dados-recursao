import { DESCRICAO_SEQUENCIAS } from '@sequencias/contrato';
import { useEffect, useRef, type ReactNode } from 'react';
import { Link } from 'react-router';
import { BotaoTema } from '../../componentes/BotaoTema';
import { SLIDES, N_APRESENTACAO, SEQUENCIA_APRESENTACAO, TOTAL_SLIDES, type Slide } from './slides';
import { useTelaCheia } from './usarTelaCheia';

// Peça local da árvore: o Orquestrador harmoniza depois com o design system.

export interface PalcoProps {
  slide: Slide;
  indice: number;
  aoIr: (indice: number) => void;
  /** Passo relativo, resolvido no momento da tecla. */
  aoAndar: (passo: number) => void;
  /** Mostra o selo de cálculo no navegador. */
  offline?: boolean;
  children: ReactNode;
}

/* Cada variante declara o próprio fundo de hover. Somar um hover de variante a outro de
   base deixa a ordem do CSS decidir, e o Próximo ficava com texto branco em fundo branco. */
const BOTAO_BASE =
  'inline-flex min-h-toque items-center gap-2 rounded-md border px-4 text-[clamp(0.9rem,1.1vw,1.1rem)] transition-colors duration-150 ease-suave disabled:opacity-35';
const BOTAO = `${BOTAO_BASE} border-borda-forte enabled:hover:bg-superficie`;
const BOTAO_PRINCIPAL = `${BOTAO_BASE} border-primaria bg-primaria font-medium text-primaria-contraste enabled:hover:border-primaria-forte enabled:hover:bg-primaria-forte`;
/** Campos de texto e afins: nenhum atalho vale dentro deles. */
const CAMPOS = 'input, select, textarea, [contenteditable="true"]';
/** A árvore e a lista usam as setas para andar entre os nós. */
const NAVEGAVEIS = '[role="button"], [role="tree"], [role="treeitem"]';
/** Alvo do roteiro, montado a partir das constantes da apresentação. */
const ALVO = `${DESCRICAO_SEQUENCIAS[SEQUENCIA_APRESENTACAO].nome} f(${N_APRESENTACAO})`;

/** Moldura do modo apresentação: trilha de slides, palco e controles. */
export function Palco({ slide, indice, aoIr, aoAndar, offline = false, children }: PalcoProps) {
  const tela = useTelaCheia();
  const primeira = indice === 0;
  const ultima = indice === TOTAL_SLIDES - 1;

  /* O atalho lê o slide por referência: teclas em sequência rápida não podem
     cair num manipulador antigo e se perder no meio da apresentação. */
  const irPara = useRef(aoIr);
  const andar = useRef(aoAndar);
  const setasOcupadas = useRef(slide.setasOcupadas ?? false);

  useEffect(() => {
    irPara.current = aoIr;
    andar.current = aoAndar;
    setasOcupadas.current = slide.setasOcupadas ?? false;
  }, [aoAndar, aoIr, slide.setasOcupadas]);

  useEffect(() => {
    const ir = (alvo: number) => irPara.current(alvo);
    const passo = (delta: number) => andar.current(delta);
    const aoTeclar = (evento: KeyboardEvent) => {
      if (evento.defaultPrevented || evento.altKey || evento.ctrlKey || evento.metaKey) return;
      const alvo = evento.target instanceof Element ? evento.target : null;
      if (alvo?.closest(CAMPOS)) return;
      const setasLivres = !setasOcupadas.current && alvo?.closest(NAVEGAVEIS) == null;
      const acoes: Record<string, () => void> = {
        PageDown: () => passo(1),
        PageUp: () => passo(-1),
        ...(setasLivres
          ? {
              ArrowRight: () => passo(1),
              ArrowLeft: () => passo(-1),
              ArrowDown: () => passo(1),
              ArrowUp: () => passo(-1),
              Home: () => ir(0),
              End: () => ir(TOTAL_SLIDES - 1),
            }
          : {}),
      };
      const digito = Number(evento.key);
      if (Number.isInteger(digito) && digito >= 1 && digito <= TOTAL_SLIDES) {
        evento.preventDefault();
        ir(digito - 1);
        return;
      }
      const acao = acoes[evento.key];
      if (!acao) return;
      evento.preventDefault();
      acao();
    };
    window.addEventListener('keydown', aoTeclar);
    return () => window.removeEventListener('keydown', aoTeclar);
  }, []);

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-fundo text-texto">
      {/* Uma faixa só: o assunto à esquerda e a trilha de slides ocupando o resto. */}
      <header className="flex flex-wrap items-end gap-x-[clamp(1rem,2.5vw,2.5rem)] gap-y-1 border-b border-borda px-[clamp(1rem,3vw,3rem)] pt-2">
        <div className="flex shrink-0 flex-col gap-1 pb-2">
          <p className="font-mono text-[clamp(0.8rem,1vw,1rem)] tracking-wide text-texto-suave">
            {`${ALVO}: recursão com e sem cache`}
          </p>
          {offline && (
            <span className="self-start rounded-full border border-alerta px-3 py-0.5 text-sm text-texto">
              modo offline: calculado no navegador
            </span>
          )}
        </div>
        {/* A base mínima faz a trilha descer para a própria linha quando não cabe ao lado do
            assunto; com base zero ela se espremeria em vez de quebrar. */}
        <nav aria-label="Slides da apresentação" className="min-w-0 flex-1 basis-[32rem]">
          <ol className="flex gap-1">
            {SLIDES.map((passo, posicao) => {
              const atual = posicao === indice;
              const percorrida = posicao < indice;
              return (
                <li key={passo.id} className="min-w-0 flex-1">
                  <button
                    type="button"
                    data-testid="slide-trilha"
                    aria-current={atual ? 'step' : undefined}
                    onClick={() => aoIr(posicao)}
                    className={`flex min-h-toque w-full items-baseline gap-2 border-t-3 px-1 pt-1.5 pb-1.5 text-left ${
                      atual
                        ? 'border-t-primaria text-texto'
                        : percorrida
                          ? 'border-t-primaria-forte text-texto-suave'
                          : 'border-t-borda text-texto-suave'
                    }`}
                  >
                    <span
                      className={`font-mono text-[clamp(0.85rem,1.1vw,1.15rem)] tabular-nums ${atual ? 'text-primaria' : ''}`}
                    >
                      {posicao + 1}
                    </span>
                    <span
                      className={`hidden truncate text-[clamp(0.8rem,1vw,1.05rem)] sm:inline ${atual ? 'font-medium' : ''}`}
                    >
                      {passo.nome}
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </nav>
      </header>

      <main
        id="conteudo"
        /* A moldura tem altura fixa e só o conteúdo rola: os controles de slide
           ficam sempre visíveis e a chegada dos dados não empurra o rodapé. */
        className="flex min-h-0 flex-1 flex-col gap-[clamp(0.5rem,1.2vh,1rem)] overflow-y-auto px-[clamp(1rem,3vw,3rem)] py-[clamp(0.5rem,1.5vh,1.25rem)]"
      >
        <div>
          {/* Nome da página só para leitor de tela: no projetor vale o título do slide. */}
          <h1 className="text-[clamp(1.3rem,2.5vw,2.25rem)] leading-tight font-semibold tracking-tight text-balance">
            <span className="sr-only">Modo apresentação: </span>
            {slide.titulo}
          </h1>
          {slide.resumo && (
            <p className="mt-0.5 text-[clamp(0.9rem,1.2vw,1.2rem)] text-pretty text-texto-suave">
              {slide.resumo}
            </p>
          )}
        </div>
        {children}
      </main>

      <footer className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-borda px-[clamp(1rem,3vw,3rem)] py-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className={BOTAO}
            disabled={primeira}
            onClick={() => aoIr(indice - 1)}
          >
            <span aria-hidden="true">←</span> Anterior
          </button>
          <button
            type="button"
            className={BOTAO_PRINCIPAL}
            disabled={ultima}
            onClick={() => aoIr(indice + 1)}
          >
            Próximo <span aria-hidden="true">→</span>
          </button>
        </div>
        <p className="font-mono text-[clamp(0.9rem,1.1vw,1.15rem)] tabular-nums">
          Slide {indice + 1} de {TOTAL_SLIDES}
        </p>
        {slide.setasOcupadas && (
          <p className="hidden text-[clamp(0.8rem,0.95vw,1rem)] text-texto-suave lg:block">
            Aqui as setas andam na execução: troque de slide com PageUp e PageDown.
          </p>
        )}
        <div className="ml-auto flex items-center gap-3">
          {/* A sala decide o tema: projetor em sala clara pede o claro, sala escura o escuro. */}
          <BotaoTema />
          {tela.suportada && (
            <button type="button" className={BOTAO} onClick={tela.alternar}>
              {tela.ativa ? 'Sair da tela cheia' : 'Tela cheia'}
            </button>
          )}
          <Link
            to="/"
            className="inline-flex min-h-toque items-center text-[clamp(0.8rem,0.95vw,1rem)] text-texto-suave underline underline-offset-4 hover:text-texto"
          >
            Sair da apresentação
          </Link>
        </div>
      </footer>

      <p className="sr-only" aria-live="polite">
        {`Slide ${indice + 1} de ${TOTAL_SLIDES}: ${slide.titulo}`}
      </p>
    </div>
  );
}
