import { useId, useRef, type KeyboardEvent } from 'react';
import { juntarClasses } from '../utilitarios/classes';
import { Icone, type NomeIcone } from './Icone';

export type MarcaSerie = 'sem-cache' | 'com-cache';

export interface OpcaoSegmento<T extends string> {
  valor: T;
  rotulo: string;
  descricao?: string;
  icone?: NomeIcone;
  /** Traço colorido da série, sempre acompanhado do rótulo escrito. */
  marca?: MarcaSerie;
}

export interface SeletorSegmentadoProps<T extends string> {
  rotulo: string;
  /** Mostra o rótulo acima do grupo; se falso, ele só é lido por leitores de tela. */
  rotuloVisivel?: boolean;
  valor: T;
  aoMudar: (valor: T) => void;
  opcoes: ReadonlyArray<OpcaoSegmento<T>>;
  desabilitado?: boolean;
  /** Empilha as opções em telas estreitas. */
  empilharNoCelular?: boolean;
  /** Empilha as opções em qualquer tela, para colunas de configuração. */
  vertical?: boolean;
  className?: string;
}

const CLASSES_MARCA: Record<MarcaSerie, string> = {
  'sem-cache': 'bg-serie-sem-cache',
  'com-cache': 'bg-serie-com-cache',
};

/** Grupo de rádios em forma de segmentos, com navegação por setas, Home e End. */
export function SeletorSegmentado<T extends string>({
  rotulo,
  rotuloVisivel = true,
  valor,
  aoMudar,
  opcoes,
  desabilitado = false,
  empilharNoCelular = false,
  vertical = false,
  className,
}: SeletorSegmentadoProps<T>) {
  const idRotulo = useId();
  const referencias = useRef<Array<HTMLButtonElement | null>>([]);

  function irPara(indice: number) {
    const total = opcoes.length;
    const alvo = ((indice % total) + total) % total;
    const opcao = opcoes[alvo];
    if (!opcao) return;
    aoMudar(opcao.valor);
    referencias.current[alvo]?.focus();
  }

  function aoTeclar(evento: KeyboardEvent<HTMLButtonElement>, indice: number) {
    const teclas: Record<string, number> = {
      ArrowRight: indice + 1,
      ArrowDown: indice + 1,
      ArrowLeft: indice - 1,
      ArrowUp: indice - 1,
      Home: 0,
      End: opcoes.length - 1,
    };
    const destino = teclas[evento.key];
    if (destino === undefined) return;
    evento.preventDefault();
    irPara(destino);
  }

  return (
    <div className={className}>
      {rotuloVisivel ? (
        <p id={idRotulo} className="mb-1.5 font-medium">
          {rotulo}
        </p>
      ) : null}
      <div
        role="radiogroup"
        aria-label={rotuloVisivel ? undefined : rotulo}
        aria-labelledby={rotuloVisivel ? idRotulo : undefined}
        className={juntarClasses(
          'flex gap-1 rounded-lg border border-borda bg-superficie-suave p-1',
          vertical ? 'flex-col' : empilharNoCelular ? 'flex-col sm:flex-row' : 'flex-row flex-wrap',
        )}
      >
        {opcoes.map((opcao, indice) => {
          const selecionada = opcao.valor === valor;
          return (
            <button
              key={opcao.valor}
              ref={(elemento) => {
                referencias.current[indice] = elemento;
              }}
              type="button"
              role="radio"
              aria-checked={selecionada}
              tabIndex={selecionada ? 0 : -1}
              disabled={desabilitado}
              onClick={() => aoMudar(opcao.valor)}
              onKeyDown={(evento) => aoTeclar(evento, indice)}
              className={juntarClasses(
                'flex min-h-toque flex-1 items-center gap-2 rounded-md px-3',
                vertical ? 'justify-start text-left' : 'justify-center text-center',
                'transition-colors duration-150 ease-suave disabled:cursor-not-allowed disabled:opacity-60',
                selecionada
                  ? 'bg-superficie font-semibold text-texto shadow-cartao ring-1 ring-borda-forte'
                  : 'text-texto-suave hover:bg-superficie hover:text-texto',
              )}
            >
              {opcao.marca ? (
                <span
                  aria-hidden="true"
                  className={juntarClasses(
                    'h-1 w-4 shrink-0 rounded-full',
                    CLASSES_MARCA[opcao.marca],
                  )}
                />
              ) : null}
              {opcao.icone ? <Icone nome={opcao.icone} /> : null}
              <span className="min-w-0">
                <span className="block truncate">{opcao.rotulo}</span>
                {opcao.descricao ? (
                  <span className="block text-xs font-normal text-texto-suave">
                    {opcao.descricao}
                  </span>
                ) : null}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
