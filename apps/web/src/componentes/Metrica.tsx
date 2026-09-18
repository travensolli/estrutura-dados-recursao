import type { ReactNode } from 'react';
import { juntarClasses } from '../utilitarios/classes';
import { Icone, type NomeIcone } from './Icone';
import type { MarcaSerie } from './SeletorSegmentado';

export interface MetricaProps {
  /** Nome curto e estável, usado para localizar o cartão nos testes. */
  identificador?: string;
  rotulo: ReactNode;
  /** Valor já formatado por quem chama. */
  valor: ReactNode;
  unidade?: ReactNode;
  detalhe?: ReactNode;
  icone?: NomeIcone;
  /** Traço colorido da série, sempre ao lado do rótulo escrito. */
  marca?: MarcaSerie;
  destaque?: boolean;
  className?: string;
}

const CLASSES_MARCA: Record<MarcaSerie, string> = {
  'sem-cache': 'bg-serie-sem-cache',
  'com-cache': 'bg-serie-com-cache',
};

/** Número medido com rótulo curto. O texto fica em cor de texto; só a marca é colorida. */
export function Metrica({
  identificador,
  rotulo,
  valor,
  unidade,
  detalhe,
  icone,
  marca,
  destaque = false,
  className,
}: MetricaProps) {
  return (
    <div
      data-testid={identificador === undefined ? undefined : `metrica-${identificador}`}
      className={juntarClasses(
        'rounded-xl border border-borda bg-superficie p-4',
        destaque && 'border-primaria/40',
        className,
      )}
    >
      <div className="flex items-center gap-2 text-sm text-texto-suave">
        {marca ? (
          <span
            aria-hidden="true"
            className={juntarClasses('h-1 w-4 shrink-0 rounded-full', CLASSES_MARCA[marca])}
          />
        ) : null}
        {icone ? <Icone nome={icone} tamanho={16} /> : null}
        <span className="min-w-0">{rotulo}</span>
      </div>
      <p
        className={juntarClasses(
          'mt-1 leading-tight font-semibold break-words',
          destaque ? 'text-3xl sm:text-4xl' : 'text-2xl',
        )}
      >
        {valor}
        {unidade ? (
          <span className="ml-1 text-base font-medium text-texto-suave">{unidade}</span>
        ) : null}
      </p>
      {detalhe ? <p className="mt-1 text-sm text-texto-suave">{detalhe}</p> : null}
    </div>
  );
}

export interface ListaMetricasProps {
  children: ReactNode;
  /** Quantidade de colunas na tela larga. */
  colunas?: 2 | 3 | 4;
  className?: string;
}

const COLUNAS = {
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-2 lg:grid-cols-3',
  4: 'sm:grid-cols-2 lg:grid-cols-4',
} as const;

export function ListaMetricas({ children, colunas = 4, className }: ListaMetricasProps) {
  return (
    <div className={juntarClasses('grid grid-cols-1 gap-3', COLUNAS[colunas], className)}>
      {children}
    </div>
  );
}
