import { corDoArgumento, formatarInteiro } from '../../utilitarios/formatar';
import type { LinhaArgumento } from './dados';

// Peça local da árvore: o Orquestrador harmoniza depois com o design system.

export interface TabelaArgumentosProps {
  linhas: readonly LinhaArgumento[];
  /** Escala comum das barras. */
  maximo: number;
  /** Uma coluna por modo ou só o modo sem cache. */
  colunas?: 'sem_cache' | 'ambos';
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
  legenda,
  argumentoRealcado = null,
  argumentoFixado = null,
  aoRealcar,
  aoFixar,
}: TabelaArgumentosProps) {
  const ambos = colunas === 'ambos';
  const interativa = Boolean(aoRealcar ?? aoFixar);
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
