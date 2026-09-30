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
  /** Empilha as opções em qualquer tela, para colunas de configuração. */
  vertical?: boolean;
  /**
   * Opções em grade de colunas iguais. Com duas colunas e um número ímpar de opções,
   * a última ocupa a linha inteira: "Comparar" fica sob "Sem cache" e "Com cache".
   */
  colunas?: 2 | 3;
  className?: string;
}

/* Colunas do tamanho do conteúdo, com a folga dividida por igual: com fonte mais larga
   ou em negrito na opção escolhida, "Tribonacci" não é cortado para caber num terço. */
const GRADE = {
  2: 'grid grid-cols-[repeat(2,auto)]',
  3: 'grid grid-cols-[repeat(3,auto)]',
} as const;

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
  vertical = false,
  colunas,
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
        <p id={idRotulo} className="mb-1 text-sm font-medium">
          {rotulo}
        </p>
      ) : null}
      <div
        role="radiogroup"
        aria-label={rotuloVisivel ? undefined : rotulo}
        aria-labelledby={rotuloVisivel ? idRotulo : undefined}
        className={juntarClasses(
          'gap-1 rounded-lg border border-borda bg-superficie-suave p-1',
          colunas ? GRADE[colunas] : vertical ? 'flex flex-col' : 'flex flex-row flex-wrap',
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
                'flex min-h-toque min-w-0 flex-1 items-center gap-2 rounded-md text-sm',
                colunas === 3 ? 'px-1.5' : colunas === 2 ? 'px-2.5' : 'px-3',
                colunas === 2 && 'odd:last:col-span-2',
                vertical && !colunas ? 'justify-start text-left' : 'justify-center text-center',
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
