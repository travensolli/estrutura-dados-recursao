import { DESCRICAO_SEQUENCIAS } from '@sequencias/contrato';
import { useEffect, useRef, type ReactNode } from 'react';
import { Link } from 'react-router';
import { ETAPAS, N_APRESENTACAO, SEQUENCIA_APRESENTACAO, TOTAL_ETAPAS, type Etapa } from './etapas';
import { useTelaCheia } from './usarTelaCheia';

// Peça local da árvore: o Orquestrador harmoniza depois com o design system.

export interface PalcoProps {
  etapa: Etapa;
  indice: number;
  aoIr: (indice: number) => void;
  /** Passo relativo, resolvido no momento da tecla. */
  aoAndar: (passo: number) => void;
  /** Mostra o selo de cálculo no navegador. */
  offline?: boolean;
  children: ReactNode;
}

const BOTAO =
  'inline-flex min-h-toque items-center gap-2 rounded-md border border-borda-forte px-4 text-[clamp(0.9rem,1.1vw,1.1rem)] hover:bg-superficie disabled:opacity-35';
/** Campos de texto e afins: nenhum atalho vale dentro deles. */
const CAMPOS = 'input, select, textarea, [contenteditable="true"]';
/** A árvore e a lista usam as setas para andar entre os nós. */
const NAVEGAVEIS = '[role="button"], [role="tree"], [role="treeitem"]';
/** Alvo do roteiro, montado a partir das constantes da apresentação. */
const ALVO = `${DESCRICAO_SEQUENCIAS[SEQUENCIA_APRESENTACAO].nome} f(${N_APRESENTACAO})`;

/** Moldura do modo apresentação: trilha de etapas, palco e controles. */
export function Palco({ etapa, indice, aoIr, aoAndar, offline = false, children }: PalcoProps) {
  const tela = useTelaCheia();
  const primeira = indice === 0;
  const ultima = indice === TOTAL_ETAPAS - 1;

  /* O atalho lê a etapa por referência: teclas em sequência rápida não podem
     cair num manipulador antigo e se perder no meio da apresentação. */
  const irPara = useRef(aoIr);
  const andar = useRef(aoAndar);
  const setasOcupadas = useRef(etapa.setasOcupadas ?? false);

  useEffect(() => {
    irPara.current = aoIr;
    andar.current = aoAndar;
    setasOcupadas.current = etapa.setasOcupadas ?? false;
  }, [aoAndar, aoIr, etapa.setasOcupadas]);

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
              End: () => ir(TOTAL_ETAPAS - 1),
            }
          : {}),
      };
      const digito = Number(evento.key);
      if (Number.isInteger(digito) && digito >= 1 && digito <= TOTAL_ETAPAS) {
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
      <header className="border-b border-borda px-[clamp(1rem,3vw,3rem)] pt-3">
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <p className="font-mono text-[clamp(0.8rem,1vw,1rem)] tracking-wide text-texto-suave">
            {`${ALVO}: recursão com e sem cache`}
          </p>
          {offline && (
            <span className="rounded-full border border-alerta px-3 py-0.5 text-sm text-texto">
              modo offline: calculado no navegador
            </span>
          )}
        </div>
        <nav aria-label="Etapas da apresentação" className="mt-2">
          <ol className="flex gap-1">
            {ETAPAS.map((passo, posicao) => {
              const atual = posicao === indice;
              const percorrida = posicao < indice;
              return (
                <li key={passo.id} className="min-w-0 flex-1">
                  <button
                    type="button"
                    data-testid="etapa-trilha"
                    aria-current={atual ? 'step' : undefined}
                    onClick={() => aoIr(posicao)}
                    className={`flex min-h-toque w-full items-baseline gap-2 border-t-3 px-1 pt-2 pb-2 text-left ${
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
        /* A moldura tem altura fixa e só o conteúdo rola: os controles de etapa
           ficam sempre visíveis e a chegada dos dados não empurra o rodapé. */
        className="flex min-h-0 flex-1 flex-col gap-[clamp(0.75rem,1.5vh,1.5rem)] overflow-y-auto px-[clamp(1rem,3vw,3rem)] py-[clamp(0.75rem,2vh,2rem)]"
      >
        <div>
          {/* Nome da página só para leitor de tela: no projetor vale o título da etapa. */}
          <h1 className="text-[clamp(1.5rem,3.1vw,2.9rem)] leading-tight font-semibold tracking-tight text-balance">
            <span className="sr-only">Modo apresentação: </span>
            {etapa.titulo}
          </h1>
          <p className="mt-1 max-w-[70ch] text-[clamp(0.95rem,1.35vw,1.35rem)] text-texto-suave text-balance">
            {etapa.resumo}
          </p>
        </div>
        {children}
      </main>

      <footer className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-borda px-[clamp(1rem,3vw,3rem)] py-3">
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
            className={`${BOTAO} border-primaria bg-primaria font-medium text-primaria-contraste hover:bg-primaria-forte`}
            disabled={ultima}
            onClick={() => aoIr(indice + 1)}
          >
            Próxima <span aria-hidden="true">→</span>
          </button>
        </div>
        <p className="font-mono text-[clamp(0.9rem,1.1vw,1.15rem)] tabular-nums">
          Etapa {indice + 1} de {TOTAL_ETAPAS}
        </p>
        <p className="hidden text-[clamp(0.8rem,0.95vw,1rem)] text-texto-suave lg:block">
          {etapa.setasOcupadas
            ? 'Aqui as setas andam na execução: troque de etapa com PageUp e PageDown.'
            : 'As setas trocam de etapa; os números de 1 a 6 vão direto.'}
        </p>
        <div className="ml-auto flex items-center gap-3">
          {tela.suportada && (
            <button type="button" className={BOTAO} onClick={tela.alternar}>
              {tela.ativa ? 'Sair da tela cheia' : 'Tela cheia'}
            </button>
          )}
          <Link
            to="/"
            className="text-[clamp(0.8rem,0.95vw,1rem)] text-texto-suave underline underline-offset-4 hover:text-texto"
          >
            Sair da apresentação
          </Link>
        </div>
      </footer>

      <p className="sr-only" aria-live="polite">
        {`Etapa ${indice + 1} de ${TOTAL_ETAPAS}: ${etapa.titulo}`}
      </p>
    </div>
  );
}
