import { type HTMLAttributes, type ReactNode, useId } from 'react';
import { juntarClasses } from '../utilitarios/classes';

export type TagCartao = 'div' | 'section' | 'article' | 'li';

export interface CartaoProps extends HTMLAttributes<HTMLElement> {
  as?: TagCartao;
  titulo?: ReactNode;
  nivelTitulo?: 2 | 3 | 4;
  descricao?: ReactNode;
  /** Ações alinhadas ao título, no canto superior direito. */
  acoes?: ReactNode;
  rodape?: ReactNode;
  destaque?: boolean;
  compacto?: boolean;
}

const NIVEIS = { 2: 'h2', 3: 'h3', 4: 'h4' } as const;

export function Cartao({
  as: Tag = 'div',
  titulo,
  nivelTitulo = 2,
  descricao,
  acoes,
  rodape,
  destaque = false,
  compacto = false,
  className,
  children,
  ...rest
}: CartaoProps) {
  const idTitulo = useId();
  const Titulo = NIVEIS[nivelTitulo];
  const marcavel = Tag === 'section' || Tag === 'article';
  return (
    <Tag
      aria-labelledby={titulo && marcavel ? idTitulo : undefined}
      className={juntarClasses(
        'rounded-xl border bg-superficie shadow-cartao',
        destaque ? 'border-primaria/40' : 'border-borda',
        compacto ? 'p-3' : 'p-4',
        className,
      )}
      {...rest}
    >
      {titulo || acoes ? (
        <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            {titulo ? (
              <Titulo id={idTitulo} className="text-lg font-semibold">
                {titulo}
              </Titulo>
            ) : null}
            {descricao ? <p className="mt-1 text-sm text-texto-suave">{descricao}</p> : null}
          </div>
          {acoes ? <div className="flex shrink-0 flex-wrap gap-2">{acoes}</div> : null}
        </div>
      ) : null}
      {children}
      {rodape ? <div className="mt-3 border-t border-borda pt-3 text-sm">{rodape}</div> : null}
    </Tag>
  );
}
