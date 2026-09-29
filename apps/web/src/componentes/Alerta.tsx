import type { HTMLAttributes, ReactNode } from 'react';
import { juntarClasses } from '../utilitarios/classes';
import { Icone, type NomeIcone } from './Icone';

export type TipoAlerta = 'info' | 'alerta' | 'erro' | 'sucesso';

export interface AlertaProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  tipo?: TipoAlerta;
  titulo?: ReactNode;
  acoes?: ReactNode;
  /** Força `role="alert"` (anúncio imediato). Erros já usam isso por padrão. */
  urgente?: boolean;
}

interface EstiloAlerta {
  caixa: string;
  icone: string;
  nome: NomeIcone;
  prefixo: string;
}

const ESTILOS: Record<TipoAlerta, EstiloAlerta> = {
  info: {
    caixa: 'border-primaria/30 bg-primaria-suave',
    icone: 'text-primaria',
    nome: 'info',
    prefixo: 'Informação:',
  },
  alerta: {
    caixa: 'border-alerta/40 bg-alerta-suave',
    icone: 'text-alerta',
    nome: 'alerta',
    prefixo: 'Atenção:',
  },
  erro: {
    caixa: 'border-erro/40 bg-erro-suave',
    icone: 'text-erro',
    nome: 'erro',
    prefixo: 'Erro:',
  },
  sucesso: {
    caixa: 'border-sucesso/40 bg-sucesso-suave',
    icone: 'text-sucesso',
    nome: 'sucesso',
    prefixo: 'Sucesso:',
  },
};

export function Alerta({
  tipo = 'info',
  titulo,
  acoes,
  urgente,
  className,
  children,
  ...rest
}: AlertaProps) {
  const estilo = ESTILOS[tipo];
  const papel = urgente || tipo === 'erro' ? 'alert' : 'status';
  return (
    <div
      role={papel}
      className={juntarClasses(
        'flex gap-3 rounded-lg border p-3 text-texto',
        estilo.caixa,
        className,
      )}
      {...rest}
    >
      <Icone nome={estilo.nome} className={juntarClasses('mt-0.5', estilo.icone)} />
      <div className="min-w-0 flex-1">
        <span className="sr-only">{estilo.prefixo} </span>
        {titulo ? <p className="font-semibold">{titulo}</p> : null}
        {children ? (
          <div className={titulo ? 'mt-1 text-sm text-texto-suave' : 'text-sm'}>{children}</div>
        ) : null}
        {acoes ? <div className="mt-3 flex flex-wrap gap-2">{acoes}</div> : null}
      </div>
    </div>
  );
}
