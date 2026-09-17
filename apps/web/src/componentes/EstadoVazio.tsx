import type { ReactNode } from 'react';
import { juntarClasses } from '../utilitarios/classes';
import { Icone, type NomeIcone } from './Icone';

export interface EstadoVazioProps {
  icone?: NomeIcone;
  titulo: ReactNode;
  descricao?: ReactNode;
  acoes?: ReactNode;
  className?: string;
}

export function EstadoVazio({ icone, titulo, descricao, acoes, className }: EstadoVazioProps) {
  return (
    <div
      className={juntarClasses(
        'flex flex-col items-center rounded-xl bg-superficie-suave px-6 py-10 text-center',
        className,
      )}
    >
      {icone ? (
        <span className="mb-3 inline-flex rounded-full bg-superficie p-3 text-texto-suave">
          <Icone nome={icone} tamanho={28} />
        </span>
      ) : null}
      <p className="text-lg font-semibold">{titulo}</p>
      {descricao ? <p className="mt-1 max-w-prose text-sm text-texto-suave">{descricao}</p> : null}
      {acoes ? <div className="mt-5 flex flex-wrap justify-center gap-2">{acoes}</div> : null}
    </div>
  );
}
