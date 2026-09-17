import { juntarClasses } from '../utilitarios/classes';

export interface EsqueletoProps {
  linhas?: number;
  /** Classe de altura de cada linha, por exemplo `h-4` ou `h-24`. */
  altura?: string;
  rotulo?: string;
  className?: string;
}

/** Marcador de carregamento. A animação respeita `prefers-reduced-motion`. */
export function Esqueleto({
  linhas = 3,
  altura = 'h-4',
  rotulo = 'Carregando…',
  className,
}: EsqueletoProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={juntarClasses('space-y-2', className)}
    >
      <span className="sr-only">{rotulo}</span>
      {Array.from({ length: linhas }, (_, i) => (
        <div
          key={i}
          aria-hidden="true"
          className={juntarClasses('animate-pulse rounded-md bg-superficie-suave', altura)}
          style={{ width: linhas > 1 && i === linhas - 1 ? '70%' : '100%' }}
        />
      ))}
    </div>
  );
}
