import type { Modo } from '@sequencias/contrato';
import { juntarClasses } from '../utilitarios/classes';
import { rotuloModo } from '../utilitarios/formatar';

export interface RotuloModoProps {
  modo: Modo;
  className?: string;
}

const CLASSES_MARCA: Record<Modo, string> = {
  sem_cache: 'bg-serie-sem-cache',
  com_cache: 'bg-serie-com-cache',
};

/** Nome do modo com o traço da série ao lado; serve de cabeçalho de coluna. */
export function RotuloModo({ modo, className }: RotuloModoProps) {
  return (
    <span className={juntarClasses('inline-flex items-center gap-2 whitespace-nowrap', className)}>
      <span
        aria-hidden="true"
        className={juntarClasses('h-1 w-4 shrink-0 rounded-full', CLASSES_MARCA[modo])}
      />
      {rotuloModo(modo)}
    </span>
  );
}
