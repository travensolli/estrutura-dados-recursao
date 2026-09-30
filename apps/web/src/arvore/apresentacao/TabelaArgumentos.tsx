import { corDoArgumento, formatarInteiro, formatarQuantidade } from '../../utilitarios/formatar';
import type { LinhaArgumento } from './dados';

// Peça local da árvore: o Orquestrador harmoniza depois com o design system.

export interface TabelaArgumentosProps {
  linhas: readonly LinhaArgumento[];
  /** Escala comum das barras. */
  maximo: number;
  /** Uma coluna por modo ou só o modo sem cache. */
  colunas?: 'sem_cache' | 'ambos';
  /** Tabela em linhas, ou faixa horizontal curta, um histograma, abaixo de um desenho largo. */
  disposicao?: 'tabela' | 'faixa';
  legenda: string;
  argumentoRealcado?: number | null;
  /** Argumento com o realce preso, para o estado do botão da linha. */
  argumentoFixado?: number | null;
  /** Realce enquanto o ponteiro ou o foco está na linha. */
  aoRealcar?: (argumento: number | null) => void;
  /** Toque ou clique: prende o realce até o próximo toque. */
  aoFixar?: (argumento: number) => void;
}

const ETIQUETA = 'flex items-center gap-2 font-mono text-[clamp(0.95rem,1.35vw,1.35rem)]';

function Ponto({ cor }: { cor: string }) {
  return (
    <span
      aria-hidden="true"
      className="size-[0.7em] shrink-0 rounded-full"
      style={{ backgroundColor: cor }}
    />
  );
}

function Barra({ valor, maximo, cor }: { valor: number; maximo: number; cor: string }) {
  const largura = maximo > 0 ? Math.max(valor > 0 ? 2 : 0, (valor / maximo) * 100) : 0;
  return (
    <div className="flex items-center gap-2">
      <div className="h-[clamp(0.6rem,1.1vh,0.9rem)] min-w-0 flex-1">
        <div
          className="h-full rounded-r-[4px]"
          style={{ width: `${largura}%`, backgroundColor: cor }}
        />
      </div>
      <span className="w-[3ch] shrink-0 text-right font-mono text-[clamp(0.9rem,1.3vw,1.3rem)] tabular-nums">
        {formatarInteiro(valor)}
      </span>
    </div>
  );
}

/** Invocações por argumento, com barra na cor do argumento e o número ao lado. */
export function TabelaArgumentos({
  linhas,
  maximo,
  colunas = 'sem_cache',
  disposicao = 'tabela',
  legenda,
  argumentoRealcado = null,
  argumentoFixado = null,
  aoRealcar,
  aoFixar,
}: TabelaArgumentosProps) {
  const ambos = colunas === 'ambos';
  const interativa = Boolean(aoRealcar ?? aoFixar);
  if (disposicao === 'faixa') {
    return (
      <FaixaArgumentos
        linhas={linhas}
        maximo={maximo}
        legenda={legenda}
        argumentoRealcado={argumentoRealcado}
        argumentoFixado={argumentoFixado}
        aoRealcar={aoRealcar}
        aoFixar={aoFixar}
        interativa={interativa}
      />
    );
  }
  return (
    <table className="w-full border-collapse">
      <caption className="pb-2 text-left text-[clamp(0.85rem,1.05vw,1.1rem)] text-texto-suave">
        {legenda}
      </caption>
      <thead>
        <tr className="text-[clamp(0.75rem,0.95vw,1rem)] text-texto-suave">
          <th scope="col" className="w-[11ch] py-1 pr-3 text-left font-normal whitespace-nowrap">
            argumento
          </th>
          <th scope="col" className="py-1 text-left font-normal">
            sem cache
          </th>
          {ambos && (
            <th scope="col" className="py-1 text-left font-normal">
              com cache
            </th>
          )}
          {ambos && (
            <th scope="col" className="w-[8ch] py-1 text-right font-normal">
              evitadas
            </th>
          )}
        </tr>
      </thead>
      <tbody>
        {linhas.map((linha) => {
          const cor = corDoArgumento(linha.argumento);
          const realcada = argumentoRealcado === linha.argumento;
          return (
            <tr
              key={linha.argumento}
              data-testid="linha-argumento"
              data-argumento={linha.argumento}
              data-realcada={realcada ? 'sim' : 'nao'}
              className={realcada ? 'bg-primaria-suave' : ''}
              onPointerEnter={() => aoRealcar?.(linha.argumento)}
              onPointerLeave={() => aoRealcar?.(null)}
            >
              <th scope="row" className="py-1 text-left font-normal">
                {interativa ? (
                  <button
                    type="button"
                    aria-pressed={argumentoFixado === linha.argumento}
                    className={`${ETIQUETA} min-h-toque w-full rounded-sm`}
                    onFocus={() => aoRealcar?.(linha.argumento)}
                    onBlur={() => aoRealcar?.(null)}
                    onClick={() => aoFixar?.(linha.argumento)}
                  >
                    <Ponto cor={cor} />
                    f({linha.argumento})
                  </button>
                ) : (
                  <span className={`${ETIQUETA} py-1`}>
                    <Ponto cor={cor} />
                    f({linha.argumento})
                  </span>
                )}
              </th>
              <td className="py-1 pr-3">
                <Barra valor={linha.semCache} maximo={maximo} cor={cor} />
              </td>
              {ambos && (
                <td className="py-1 pr-3">
                  <Barra valor={linha.comCache} maximo={maximo} cor={cor} />
                </td>
              )}
              {ambos && (
                <td className="py-1 text-right font-mono text-[clamp(0.9rem,1.3vw,1.3rem)] tabular-nums">
                  {linha.evitadas > 0 ? `−${formatarInteiro(linha.evitadas)}` : '–'}
                </td>
              )}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

type PropsFaixa = Pick<
  TabelaArgumentosProps,
  'linhas' | 'maximo' | 'legenda' | 'aoRealcar' | 'aoFixar'
> & {
  argumentoRealcado: number | null;
  argumentoFixado: number | null;
  interativa: boolean;
};

/* Um argumento por coluna, de f(n) a f(0): a barra sobe com as invocações e a
   repetição salta aos olhos sem roubar a altura do desenho. */
function FaixaArgumentos({
  linhas,
  maximo,
  legenda,
  argumentoRealcado,
  argumentoFixado,
  aoRealcar,
  aoFixar,
  interativa,
}: PropsFaixa) {
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
