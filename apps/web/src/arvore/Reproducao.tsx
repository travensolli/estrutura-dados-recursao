import type { Modo, No } from '@sequencias/contrato';
import { useEffect, useMemo } from 'react';
import { abreviarValor, corDoArgumento, formatarInteiro } from '../utilitarios/formatar';
import {
  acertoNoPasso,
  cacheNoPasso,
  descreverPasso,
  eventoNoPasso,
  indexarPassos,
  pilhaNoPasso,
} from './modelo';
import { MarcaTipo } from './ui/MarcaTipo';
import { VELOCIDADES, type Reproducao as Relogio, type Velocidade } from './usarReproducao';

// Peça local da árvore: o Orquestrador harmoniza depois com o design system.

export interface ReproducaoProps {
  /** Nós achatados em ordem de entrada. */
  nos: readonly No[];
  modo: Modo;
  relogio: Relogio;
  /** Chamadas evitadas por acerto, para a narração do passo. */
  podasPorAcerto?: ReadonlyMap<number, number>;
  /** Escuta espaço, setas, Home e End na janela. */
  atalhos?: boolean;
}

const BOTAO =
  'inline-flex h-11 min-w-11 items-center justify-center gap-2 rounded-md border border-borda bg-superficie px-3 text-sm text-texto hover:bg-superficie-suave disabled:opacity-40';
const CAIXA = 'rounded-lg border border-borda bg-superficie p-3';
const IGNORADOS = 'input, select, textarea, button, a, [role="button"], [role="tree"]';

export function Reproducao({
  nos,
  modo,
  relogio,
  podasPorAcerto,
  atalhos = true,
}: ReproducaoProps) {
  const { passo, ultimoPasso, tocando } = relogio;
  const indice = useMemo(() => indexarPassos(nos), [nos]);
  const pilha = useMemo(() => pilhaNoPasso(nos, passo), [nos, passo]);
  const dicionario = useMemo(
    () => (modo === 'com_cache' ? cacheNoPasso(nos, passo) : []),
    [modo, nos, passo],
  );
  const acerto = acertoNoPasso(indice, passo);
  const narracao = descreverPasso(eventoNoPasso(indice, passo), modo, podasPorAcerto);
  const contagem = `Passo ${formatarInteiro(passo)} de ${formatarInteiro(ultimoPasso)}`;

  useEffect(() => {
    if (!atalhos) return;
    const aoTeclar = (evento: KeyboardEvent) => {
      if (evento.defaultPrevented || evento.altKey || evento.ctrlKey || evento.metaKey) return;
      const alvo = evento.target;
      if (alvo instanceof Element && alvo.closest(IGNORADOS)) return;
      const acoes: Record<string, () => void> = {
        ' ': relogio.alternarToque,
        ArrowRight: relogio.avancar,
        ArrowUp: relogio.avancar,
        ArrowLeft: relogio.voltar,
        ArrowDown: relogio.voltar,
        Home: relogio.paraOInicio,
        End: relogio.paraOFim,
      };
      const acao = acoes[evento.key];
      if (!acao) return;
      evento.preventDefault();
      acao();
    };
    window.addEventListener('keydown', aoTeclar);
    return () => window.removeEventListener('keydown', aoTeclar);
  }, [atalhos, relogio]);

  return (
    <section aria-label="Reprodução passo a passo" className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1" role="group" aria-label="Controles da reprodução">
          <button
            type="button"
            className={BOTAO}
            onClick={relogio.paraOInicio}
            disabled={relogio.noInicio}
          >
            <Icone nome="inicio" />
            <span className="sr-only">Ir para o início</span>
          </button>
          <button
            type="button"
            className={BOTAO}
            onClick={relogio.voltar}
            disabled={relogio.noInicio}
          >
            <Icone nome="voltar" />
            <span className="sr-only">Passo anterior</span>
          </button>
          <button
            type="button"
            className={`${BOTAO} bg-primaria font-medium text-primaria-contraste hover:bg-primaria-forte`}
            onClick={relogio.alternarToque}
          >
            <Icone nome={tocando ? 'pausar' : 'tocar'} />
            {tocando ? 'Pausar' : 'Tocar'}
          </button>
          <button
            type="button"
            className={BOTAO}
            onClick={relogio.avancar}
            disabled={relogio.noFim}
          >
            <Icone nome="avancar" />
            <span className="sr-only">Próximo passo</span>
          </button>
          <button
            type="button"
            className={BOTAO}
            onClick={relogio.paraOFim}
            disabled={relogio.noFim}
          >
            <Icone nome="fim" />
            <span className="sr-only">Ir para o fim</span>
          </button>
        </div>

        <label className="ml-auto flex items-center gap-2 text-sm text-texto-suave">
          Velocidade
          <select
            className="h-11 rounded-md border border-borda bg-superficie px-2 text-sm text-texto"
            value={relogio.velocidade}
            onChange={(evento) =>
              relogio.definirVelocidade(Number(evento.target.value) as Velocidade)
            }
          >
            {VELOCIDADES.map((velocidade) => (
              <option key={velocidade} value={velocidade}>
                {velocidade.toLocaleString('pt-BR')}×
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex items-center gap-3">
        <input
          type="range"
          min={0}
          max={ultimoPasso}
          step={1}
          value={passo}
          aria-label="Passo da reprodução"
          aria-valuetext={contagem}
          className="h-11 w-full accent-primaria"
          onChange={(evento) => relogio.irPara(Number(evento.target.value))}
        />
        <p className="shrink-0 font-mono text-sm tabular-nums text-texto-suave">
          {formatarInteiro(passo)} / {formatarInteiro(ultimoPasso)}
        </p>
      </div>

      <p className="min-h-12 text-lg text-balance">{narracao}</p>
      <p className="sr-only" aria-live="polite">
        {`${contagem}. ${narracao}`}
      </p>

      <div className="grid gap-3 md:grid-cols-2">
        <PilhaDeChamadas pilha={pilha} />
        <Dicionario modo={modo} entradas={dicionario} argumentoUsado={acerto?.argumento ?? null} />
      </div>
    </section>
  );
}

function PilhaDeChamadas({ pilha }: { pilha: readonly No[] }) {
  const doTopoParaBase = [...pilha].reverse();
  return (
    <div className={CAIXA}>
      <h3 className="text-sm font-medium">
        Pilha de chamadas{' '}
        <span className="font-mono text-texto-suave">({formatarInteiro(pilha.length)})</span>
      </h3>
      {doTopoParaBase.length === 0 ? (
        <p className="mt-2 text-sm text-texto-suave">A pilha está vazia: a execução terminou.</p>
      ) : (
        <ol className="mt-2 flex max-h-56 flex-col gap-1 overflow-y-auto">
          {doTopoParaBase.map((no, posicao) => (
            <li
              key={no.id}
              data-testid="quadro-pilha"
              data-argumento={no.argumento}
              className={`flex items-center gap-2 rounded-md px-2 py-1 ${
                posicao === 0 ? 'bg-superficie-suave ring-2 ring-primaria' : ''
              }`}
            >
              <MarcaTipo tipo={no.tipo} cor={corDoArgumento(no.argumento)} />
              <span className="font-mono text-base">f({no.argumento})</span>
              <span className="text-sm text-texto-suave">profundidade {no.profundidade}</span>
              {posicao === 0 && <span className="ml-auto text-xs text-primaria">topo</span>}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

interface DicionarioProps {
  modo: Modo;
  entradas: readonly { argumento: number; valor: string }[];
  argumentoUsado: number | null;
}

function Dicionario({ modo, entradas, argumentoUsado }: DicionarioProps) {
  if (modo === 'sem_cache') {
    return (
      <div className={CAIXA}>
        <h3 className="text-sm font-medium">Dicionário</h3>
        <p className="mt-2 text-sm text-texto-suave">
          Sem cache não existe dicionário: cada chamada refaz todo o trabalho, mesmo já tendo
          calculado aquele argumento antes.
        </p>
      </div>
    );
  }
  return (
    <div className={CAIXA}>
      <h3 className="text-sm font-medium">
        Dicionário{' '}
        <span className="font-mono text-texto-suave">
          ({formatarInteiro(entradas.length)} {entradas.length === 1 ? 'entrada' : 'entradas'})
        </span>
      </h3>
      {entradas.length === 0 ? (
        <p className="mt-2 text-sm text-texto-suave">Ainda vazio: nada foi calculado até aqui.</p>
      ) : (
        <dl className="mt-2 flex max-h-56 flex-col gap-1 overflow-y-auto">
          {entradas.map((entrada) => {
            const usada = entrada.argumento === argumentoUsado;
            const valor = abreviarValor(entrada.valor, 18);
            return (
              <div
                key={entrada.argumento}
                data-testid="entrada-dicionario"
                data-argumento={entrada.argumento}
                data-usada={usada ? 'sim' : 'nao'}
                className={`flex items-center gap-2 rounded-md px-2 py-1 ${
                  usada ? 'bg-primaria-suave ring-2 ring-primaria' : ''
                }`}
              >
                <span
                  aria-hidden="true"
                  className="size-3 shrink-0 rounded-full"
                  style={{ backgroundColor: corDoArgumento(entrada.argumento) }}
                />
                <dt className="font-mono text-base">f({entrada.argumento})</dt>
                <dd className="font-mono text-base break-all">= {valor.abreviado}</dd>
                {usada && (
                  <span className="ml-auto shrink-0 text-xs text-primaria">usada agora</span>
                )}
              </div>
            );
          })}
        </dl>
      )}
    </div>
  );
}

const ICONES = {
  inicio: 'M 3 3 V 13 M 13 3 L 5 8 L 13 13 Z',
  voltar: 'M 12 3 L 4 8 L 12 13 Z',
  tocar: 'M 5 3 L 13 8 L 5 13 Z',
  avancar: 'M 4 3 L 12 8 L 4 13 Z',
  fim: 'M 13 3 V 13 M 3 3 L 11 8 L 3 13 Z',
} as const;

function Icone({ nome }: { nome: keyof typeof ICONES | 'pausar' }) {
  return (
    <svg width={16} height={16} viewBox="0 0 16 16" aria-hidden="true" className="shrink-0">
      {nome === 'pausar' ? (
        <g fill="currentColor">
          <rect x={4} y={3} width={3} height={10} rx={1} />
          <rect x={9} y={3} width={3} height={10} rx={1} />
        </g>
      ) : (
        <path
          d={ICONES[nome]}
          fill="currentColor"
          stroke="currentColor"
          strokeWidth={1.6}
          strokeLinejoin="round"
        />
      )}
    </svg>
  );
}
