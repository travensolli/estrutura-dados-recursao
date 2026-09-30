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
        'flex flex-col items-center rounded-xl bg-superficie-suave px-5 py-5 text-center',
        className,
      )}
    >
      {icone ? (
        <span className="mb-2 inline-flex rounded-full bg-superficie p-2.5 text-texto-suave">
          <Icone nome={icone} tamanho={24} />
        </span>
      ) : null}
      <p className="text-lg font-semibold">{titulo}</p>
      {descricao ? <p className="mt-1 max-w-prose text-texto-suave">{descricao}</p> : null}
      {acoes ? <div className="mt-4 flex flex-wrap justify-center gap-2">{acoes}</div> : null}
    </div>
  );
}
