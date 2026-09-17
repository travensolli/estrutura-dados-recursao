import type { HTMLAttributes } from 'react';
import type { Modo } from '@sequencias/contrato';
import { juntarClasses } from '../utilitarios/classes';
import { Icone, type NomeIcone } from './Icone';

export type TomSelo =
  'neutro' | 'primaria' | 'sucesso' | 'alerta' | 'erro' | 'sem-cache' | 'com-cache';

export interface SeloProps extends HTMLAttributes<HTMLSpanElement> {
  tom?: TomSelo;
  icone?: NomeIcone;
}

const TONS: Record<TomSelo, string> = {
  neutro: 'bg-superficie-suave text-texto-suave',
  primaria: 'bg-primaria-suave text-primaria',
  sucesso: 'bg-sucesso-suave text-sucesso',
  alerta: 'bg-alerta-suave text-alerta',
  erro: 'bg-erro-suave text-erro',
  'sem-cache': 'bg-superficie-suave text-texto',
  'com-cache': 'bg-superficie-suave text-texto',
};

/* Séries: um traço colorido identifica o modo; o texto continua na cor de texto. */
const CHAVE_SERIE: Partial<Record<TomSelo, string>> = {
  'sem-cache': 'bg-serie-sem-cache',
  'com-cache': 'bg-serie-com-cache',
};

export function Selo({ tom = 'neutro', icone, className, children, ...rest }: SeloProps) {
  const chave = CHAVE_SERIE[tom];
  return (
    <span
      className={juntarClasses(
        'inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium',
        TONS[tom],
        className,
      )}
      {...rest}
    >
      {chave ? (
        <span aria-hidden="true" className={juntarClasses('h-0.5 w-3 rounded-full', chave)} />
      ) : null}
      {icone ? <Icone nome={icone} tamanho={14} /> : null}
      {children}
    </span>
  );
}

export interface SeloModoProps extends Omit<SeloProps, 'tom' | 'children'> {
  modo: Modo;
}

/** Selo do modo com rótulo fixo: a cor nunca é o único indicador. */
export function SeloModo({ modo, ...rest }: SeloModoProps) {
  return (
    <Selo tom={modo === 'sem_cache' ? 'sem-cache' : 'com-cache'} {...rest}>
      {modo === 'sem_cache' ? 'sem cache' : 'com cache'}
    </Selo>
  );
}
