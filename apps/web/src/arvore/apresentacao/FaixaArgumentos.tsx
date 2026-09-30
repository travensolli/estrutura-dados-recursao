import { corDoArgumento, formatarInteiro, formatarQuantidade } from '../../utilitarios/formatar';
import type { LinhaArgumento } from './dados';

// Peça local da árvore: o Orquestrador harmoniza depois com o design system.

export interface FaixaArgumentosProps {
  linhas: readonly LinhaArgumento[];
  /** Escala comum das barras. */
  maximo: number;
  legenda: string;
  argumentoRealcado?: number | null;
  /** Argumento com o realce preso, para o estado do botão da coluna. */
  argumentoFixado?: number | null;
  /** Realce enquanto o ponteiro ou o foco está na coluna. */
  aoRealcar?: (argumento: number | null) => void;
  /** Toque ou clique: prende o realce até o próximo toque. */
  aoFixar?: (argumento: number) => void;
}

function Ponto({ cor }: { cor: string }) {
  return (
    <span
      aria-hidden="true"
      className="size-[0.7em] shrink-0 rounded-full"
      style={{ backgroundColor: cor }}
    />
  );
}

/* Um argumento por coluna, de f(n) a f(0): a barra sobe com as invocações e a
   repetição salta aos olhos sem roubar a altura do desenho. */
export function FaixaArgumentos({
  linhas,
  maximo,
  legenda,
  argumentoRealcado = null,
  argumentoFixado = null,
  aoRealcar,
  aoFixar,
}: FaixaArgumentosProps) {
  const interativa = Boolean(aoRealcar ?? aoFixar);
  return (
    <figure className="m-0 min-w-0">
      <figcaption className="pb-1 text-[clamp(0.85rem,1.05vw,1.1rem)] text-texto-suave">
        {legenda}
      </figcaption>
      <ol
        className="grid gap-1"
        style={{ gridTemplateColumns: `repeat(${linhas.length}, minmax(0, 1fr))` }}
      >
        {linhas.map((linha) => {
          const cor = corDoArgumento(linha.argumento);
          const realcada = argumentoRealcado === linha.argumento;
          const altura =
            maximo > 0 ? Math.max(linha.semCache > 0 ? 4 : 0, (linha.semCache / maximo) * 100) : 0;
          const conteudo = (
            <>
              <span
                aria-hidden="true"
                className="flex h-[clamp(2.25rem,7.5vh,5rem)] w-full items-end justify-center"
              >
                <span
                  className="w-[55%] rounded-t-[3px]"
                  style={{ height: `${altura}%`, backgroundColor: cor }}
                />
              </span>
              <span className="font-mono text-[clamp(0.95rem,1.35vw,1.35rem)] leading-tight tabular-nums">
                {formatarInteiro(linha.semCache)}
              </span>
              <span className="flex items-center gap-1 font-mono text-[clamp(0.8rem,1vw,1.05rem)] text-texto-suave">
                <Ponto cor={cor} />
                f({linha.argumento})
              </span>
            </>
          );
          const nome = `f(${linha.argumento}): ${formatarQuantidade(linha.semCache, 'invocação', 'invocações')}`;
          return (
            <li
              key={linha.argumento}
              data-testid="linha-argumento"
              data-argumento={linha.argumento}
              data-realcada={realcada ? 'sim' : 'nao'}
              className={`min-w-0 rounded-md ${realcada ? 'bg-primaria-suave' : ''}`}
              onPointerEnter={() => aoRealcar?.(linha.argumento)}
              onPointerLeave={() => aoRealcar?.(null)}
            >
              {interativa ? (
                <button
                  type="button"
                  aria-pressed={argumentoFixado === linha.argumento}
                  aria-label={nome}
                  className="flex w-full flex-col items-center gap-0.5 rounded-md px-1 pt-1 pb-1.5 hover:bg-superficie"
                  onFocus={() => aoRealcar?.(linha.argumento)}
                  onBlur={() => aoRealcar?.(null)}
                  onClick={() => aoFixar?.(linha.argumento)}
                >
                  {conteudo}
                </button>
              ) : (
                <div
                  className="flex flex-col items-center gap-0.5 px-1 pt-1 pb-1.5"
                  aria-label={nome}
                >
                  {conteudo}
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </figure>
  );
}
