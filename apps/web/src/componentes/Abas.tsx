import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { juntarClasses } from '../utilitarios/classes';
import { Icone, type NomeIcone } from './Icone';

export interface Aba {
  id: string;
  rotulo: string;
  icone?: NomeIcone;
  conteudo: ReactNode;
}

export interface AbasProps {
  rotulo: string;
  abas: ReadonlyArray<Aba>;
  /** Aba ativa quando o componente é controlado. */
  ativa?: string;
  aoMudar?: (id: string) => void;
  idPadrao?: string;
  className?: string;
}

/** Abas com `tablist`, seleção pelas setas e Home/End, e painel focável. */
export function Abas({ rotulo, abas, ativa, aoMudar, idPadrao, className }: AbasProps) {
  const prefixo = useId();
  const referencias = useRef<Array<HTMLButtonElement | null>>([]);
  const [internaAtiva, setInternaAtiva] = useState(idPadrao ?? abas[0]?.id ?? '');
  const selecionada = ativa ?? internaAtiva;

  function selecionar(id: string) {
    if (ativa === undefined) setInternaAtiva(id);
    aoMudar?.(id);
  }

  function irPara(indice: number) {
    const total = abas.length;
    if (total === 0) return;
    const alvo = ((indice % total) + total) % total;
    const aba = abas[alvo];
    if (!aba) return;
    selecionar(aba.id);
    referencias.current[alvo]?.focus();
  }

  function aoTeclar(evento: KeyboardEvent<HTMLButtonElement>, indice: number) {
    const destinos: Record<string, number> = {
      ArrowRight: indice + 1,
      ArrowLeft: indice - 1,
      Home: 0,
      End: abas.length - 1,
    };
    const destino = destinos[evento.key];
    if (destino === undefined) return;
    evento.preventDefault();
    irPara(destino);
  }

  return (
    <div className={className}>
      <div
        role="tablist"
        aria-label={rotulo}
        className="rolagem-fina flex gap-1 overflow-x-auto border-b border-borda"
      >
        {abas.map((aba, indice) => {
          const escolhida = aba.id === selecionada;
          return (
            <button
              key={aba.id}
              ref={(elemento) => {
                referencias.current[indice] = elemento;
              }}
              type="button"
              role="tab"
              id={`${prefixo}-aba-${aba.id}`}
              aria-selected={escolhida}
              aria-controls={`${prefixo}-painel-${aba.id}`}
              tabIndex={escolhida ? 0 : -1}
              onClick={() => selecionar(aba.id)}
              onKeyDown={(evento) => aoTeclar(evento, indice)}
              className={juntarClasses(
                'inline-flex min-h-toque shrink-0 items-center gap-2 rounded-t-md border-b-2 px-4',
                'transition-colors duration-150 ease-suave',
                escolhida
                  ? 'border-primaria font-semibold text-primaria'
                  : 'border-transparent text-texto-suave hover:bg-superficie-suave hover:text-texto',
              )}
            >
              {aba.icone ? <Icone nome={aba.icone} /> : null}
              {aba.rotulo}
            </button>
          );
        })}
      </div>
      {abas.map((aba) => (
        <div
          key={aba.id}
          role="tabpanel"
          id={`${prefixo}-painel-${aba.id}`}
          aria-labelledby={`${prefixo}-aba-${aba.id}`}
          tabIndex={0}
          hidden={aba.id !== selecionada}
          className="pt-4"
        >
          {aba.id === selecionada ? aba.conteudo : null}
        </div>
      ))}
    </div>
  );
}
