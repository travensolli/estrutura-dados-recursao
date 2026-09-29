import type { ReactNode } from 'react';
import { juntarClasses } from '../utilitarios/classes';
import { Icone } from './Icone';

export interface DetalhesProps {
  /** Rótulo sempre visível; um toque abre e fecha o bloco. */
  resumo: ReactNode;
  children: ReactNode;
  className?: string;
}

/** Prova sob demanda: nasce fechado para a resposta caber na dobra da tela. */
export function Detalhes({ resumo, children, className }: DetalhesProps) {
  return (
    <details
      className={juntarClasses(
        'group rounded-xl border border-borda bg-superficie px-4',
        className,
      )}
    >
      <summary className="flex min-h-toque cursor-pointer list-none items-center justify-between gap-3 [&::-webkit-details-marker]:hidden">
        {resumo}
        <Icone
          nome="expandir"
          className="text-texto-suave transition-transform duration-150 ease-suave group-open:rotate-180"
        />
      </summary>
      <div className="pb-4">{children}</div>
    </details>
  );
}
