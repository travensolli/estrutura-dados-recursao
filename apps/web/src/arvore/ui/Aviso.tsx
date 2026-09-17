import type { ReactNode } from 'react';

// Peça local da árvore: o Orquestrador harmoniza depois com o design system.

export type TomAviso = 'info' | 'alerta' | 'erro';

export interface AvisoProps {
  tom?: TomAviso;
  titulo: string;
  children?: ReactNode;
  acao?: ReactNode;
}

const TONS: Record<TomAviso, string> = {
  info: 'border-primaria bg-primaria-suave text-texto',
  alerta: 'border-alerta bg-alerta-suave text-texto',
  erro: 'border-erro bg-erro-suave text-texto',
};

export function Aviso({ tom = 'info', titulo, children, acao }: AvisoProps) {
  return (
    <div
      role={tom === 'erro' ? 'alert' : 'status'}
      className={`flex flex-wrap items-start gap-3 rounded-lg border-l-4 px-4 py-3 ${TONS[tom]}`}
    >
      <div className="min-w-0 flex-1">
        <p className="font-medium">{titulo}</p>
        {children && <div className="mt-1 text-sm text-texto-suave">{children}</div>}
      </div>
      {acao}
    </div>
  );
}
