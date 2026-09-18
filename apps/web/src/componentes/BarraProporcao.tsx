import type { Modo } from '@sequencias/contrato';
import { juntarClasses } from '../utilitarios/classes';

export interface BarraProporcaoProps {
  valor: number;
  /** Topo da escala, comum a todas as barras da mesma coluna. */
  maximo: number;
  modo?: Modo;
  className?: string;
}

const CLASSES_BARRA: Record<Modo, string> = {
  sem_cache: 'bg-serie-sem-cache',
  com_cache: 'bg-serie-com-cache',
};

/**
 * Barra de magnitude para dentro de uma célula de tabela. O número fica na
 * coluna ao lado, por isso a barra é decorativa para leitores de tela.
 */
export function BarraProporcao({
  valor,
  maximo,
  modo = 'sem_cache',
  className,
}: BarraProporcaoProps) {
  const fracao = maximo > 0 ? Math.min(1, Math.max(0, valor / maximo)) : 0;
  return (
    <span
      aria-hidden="true"
      className={juntarClasses(
        'block h-2.5 w-full min-w-24 rounded-[2px] bg-superficie-suave',
        className,
      )}
    >
      <span
        className={juntarClasses('block h-2.5 rounded-r-[4px]', CLASSES_BARRA[modo])}
        style={{ width: `${fracao * 100}%`, minWidth: valor > 0 ? '3px' : undefined }}
      />
    </span>
  );
}
