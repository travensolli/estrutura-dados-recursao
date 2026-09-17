import type { Modo } from '@sequencias/contrato';
import type { ReactNode } from 'react';
import { juntarClasses } from '../utilitarios/classes';
import { rotuloModo } from '../utilitarios/formatar';

export interface SerieComparativa {
  modo: Modo;
  valor: number;
  /** Valor já formatado; quando ausente, mostra o número cru. */
  texto?: string;
}

export interface BarraComparativaProps {
  titulo: ReactNode;
  descricao?: ReactNode;
  series: readonly [SerieComparativa, SerieComparativa];
  /** Topo da escala; por padrão, o maior valor das duas séries. */
  maximo?: number;
  nota?: ReactNode;
  className?: string;
}

const CLASSES_BARRA: Record<Modo, string> = {
  sem_cache: 'bg-serie-sem-cache',
  com_cache: 'bg-serie-com-cache',
};

function largura(valor: number, maximo: number): string {
  if (maximo <= 0) return '0%';
  const porcentagem = Math.min(100, Math.max(0, (valor / maximo) * 100));
  return `${porcentagem}%`;
}

/**
 * Duas barras na mesma escala, uma por modo. Cada barra traz o nome do modo
 * e o valor escritos: a cor só reforça a identidade.
 */
export function BarraComparativa({
  titulo,
  descricao,
  series,
  maximo,
  nota,
  className,
}: BarraComparativaProps) {
  const topo = maximo ?? Math.max(...series.map((serie) => serie.valor));
  return (
    <figure className={juntarClasses('min-w-0', className)}>
      <figcaption className="font-medium">{titulo}</figcaption>
      {descricao ? <p className="mt-0.5 text-sm text-texto-suave">{descricao}</p> : null}
      <ul className="mt-3 space-y-0.5">
        {series.map((serie) => (
          <li
            key={serie.modo}
            className="grid grid-cols-[5rem_1fr] items-center gap-x-3 sm:grid-cols-[6.5rem_1fr]"
          >
            <span className="text-sm text-texto-suave">{rotuloModo(serie.modo)}</span>
            <span className="flex min-w-0 items-center gap-2">
              <span
                aria-hidden="true"
                className="h-5 min-w-0 flex-1 rounded-[4px] bg-superficie-suave"
              >
                <span
                  className={juntarClasses('block h-5 rounded-r-[4px]', CLASSES_BARRA[serie.modo])}
                  style={{ width: largura(serie.valor, topo) }}
                />
              </span>
              <span className="shrink-0 font-semibold tabular-nums">
                {serie.texto ?? serie.valor}
              </span>
            </span>
          </li>
        ))}
      </ul>
      {nota ? <p className="mt-2 text-sm text-texto-suave">{nota}</p> : null}
    </figure>
  );
}

export interface LegendaSeriesProps {
  className?: string;
}

export function LegendaSeries({ className }: LegendaSeriesProps) {
  return (
    <ul className={juntarClasses('flex flex-wrap gap-x-4 gap-y-1 text-sm', className)}>
      {(['sem_cache', 'com_cache'] as const).map((modo) => (
        <li key={modo} className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className={juntarClasses('h-1 w-5 rounded-full', CLASSES_BARRA[modo])}
          />
          <span className="text-texto-suave">{rotuloModo(modo)}</span>
        </li>
      ))}
    </ul>
  );
}
