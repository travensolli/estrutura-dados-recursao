import type { No } from '@sequencias/contrato';
import { useCallback, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { abreviarValor, corDoArgumento, formatarInteiro } from '../utilitarios/formatar';
import { descendentesDe, estadoDoNoNoPasso, rotuloTipo } from './modelo';
import { MarcaTipo } from './ui/MarcaTipo';

const RECUO = 18;

export interface ArvoreListaProps {
  raiz: No;
  /** Instante da reprodução; sem ele a lista aparece inteira e resolvida. */
  passo?: number | null;
  rotulo?: string;
}

interface Item {
  no: No;
  nivel: number;
  paiId: number | null;
  posicao: number;
  irmaos: number;
  filhos: number[];
  recolhido: boolean;
  ocultos: number;
}

function montarItens(raiz: No, recolhidos: ReadonlySet<number>): Item[] {
  const itens: Item[] = [];
  const visitar = (
    no: No,
    nivel: number,
    paiId: number | null,
    posicao: number,
    irmaos: number,
  ) => {
    const recolhido = recolhidos.has(no.id) && no.filhos.length > 0;
    const podado = no.descendentes_ocultos ?? 0;
    itens.push({
      no,
      nivel,
      paiId,
      posicao,
      irmaos,
      filhos: recolhido ? [] : no.filhos.map((filho) => filho.id),
      recolhido,
      ocultos: recolhido ? descendentesDe(no) : podado,
    });
    if (recolhido) return;
    no.filhos.forEach((filho, indice) =>
      visitar(filho, nivel + 1, no.id, indice + 1, no.filhos.length),
    );
  };
  visitar(raiz, 1, null, 1, 1);
  return itens;
}

/** Mesma árvore em lista indentada: árvore larga não cabe em 360 px. */
export function ArvoreLista({
  raiz,
  passo = null,
  rotulo = 'Árvore de chamadas',
}: ArvoreListaProps) {
  const [recolhidos, setRecolhidos] = useState<ReadonlySet<number>>(() => new Set<number>());
  const [idAtivo, setIdAtivo] = useState<number>(raiz.id);
  const itensRef = useRef(new Map<number, HTMLLIElement>());

  const itens = useMemo(() => montarItens(raiz, recolhidos), [raiz, recolhidos]);
  const posicaoPorId = useMemo(
    () => new Map(itens.map((item, indice) => [item.no.id, indice])),
    [itens],
  );

  const focar = useCallback((id: number | null | undefined) => {
    if (id === null || id === undefined) return;
    setIdAtivo(id);
    itensRef.current.get(id)?.focus();
  }, []);

  const alternar = useCallback((no: No, abrir: boolean) => {
    if (no.filhos.length === 0) return;
    setRecolhidos((atual) => {
      const proximo = new Set(atual);
      if (abrir) proximo.delete(no.id);
      else proximo.add(no.id);
      return proximo;
    });
  }, []);

  const aoTeclar = (evento: KeyboardEvent<HTMLLIElement>, item: Item) => {
    const indice = posicaoPorId.get(item.no.id) ?? 0;
    const ir = (alvo: number | null | undefined) => {
      if (alvo === null || alvo === undefined) return;
      evento.preventDefault();
      focar(alvo);
    };
    if (evento.key === 'ArrowDown') ir(itens[indice + 1]?.no.id);
    else if (evento.key === 'ArrowUp') ir(itens[indice - 1]?.no.id);
    else if (evento.key === 'Home') ir(itens[0]?.no.id);
    else if (evento.key === 'End') ir(itens[itens.length - 1]?.no.id);
    else if (evento.key === 'ArrowRight') {
      evento.preventDefault();
      if (item.recolhido) alternar(item.no, true);
      else ir(item.filhos[0]);
    } else if (evento.key === 'ArrowLeft') {
      evento.preventDefault();
      if (!item.recolhido && item.no.filhos.length > 0) alternar(item.no, false);
      else ir(item.paiId);
    } else if (evento.key === 'Enter' || evento.key === ' ') {
      evento.preventDefault();
      alternar(item.no, item.recolhido);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {recolhidos.size > 0 && (
        <button
          type="button"
          className="self-start rounded-md border border-borda bg-superficie px-3 py-2 text-sm hover:bg-superficie-suave"
          onClick={() => setRecolhidos(new Set<number>())}
        >
          Abrir os {formatarInteiro(recolhidos.size)} nós recolhidos
        </button>
      )}
      <ul
        role="tree"
        aria-label={rotulo}
        className="max-h-[70vh] overflow-auto rounded-lg border border-borda bg-superficie p-2"
      >
        {itens.map((item) => {
          const { no } = item;
          const estado = passo === null ? null : estadoDoNoNoPasso(no, passo);
          const valor = abreviarValor(no.valor, 14);
          const mostraValor = estado === null || estado === 'resolvido';
          return (
            <li
              key={no.id}
              ref={(elemento) => {
                if (elemento) itensRef.current.set(no.id, elemento);
                else itensRef.current.delete(no.id);
              }}
              role="treeitem"
              data-testid="item-arvore"
              data-argumento={no.argumento}
              data-tipo={no.tipo}
              data-estado={estado ?? 'inteira'}
              aria-level={item.nivel}
              aria-posinset={item.posicao}
              aria-setsize={item.irmaos}
              aria-expanded={no.filhos.length > 0 ? !item.recolhido : undefined}
              aria-label={rotuloAcessivel(item, mostraValor ? valor.abreviado : 'ainda calculando')}
              tabIndex={no.id === idAtivo ? 0 : -1}
              style={{ paddingInlineStart: `${item.nivel * RECUO}px` }}
              className={`flex cursor-pointer items-center gap-2 rounded-md border-l border-borda px-2 py-1.5 hover:bg-superficie-suave focus-visible:outline-3 focus-visible:outline-foco ${
                estado === 'futuro' ? 'opacity-45' : ''
              } ${estado === 'ativo' ? 'bg-superficie-suave' : ''}`}
              onClick={() => {
                focar(no.id);
                alternar(no, item.recolhido);
              }}
              onKeyDown={(evento) => aoTeclar(evento, item)}
            >
              <span aria-hidden="true" className="w-4 shrink-0 text-center text-texto-suave">
                {no.filhos.length > 0 ? (item.recolhido ? '+' : '−') : ''}
              </span>
              <MarcaTipo tipo={no.tipo} cor={corDoArgumento(no.argumento)} />
              <span className="font-mono text-base whitespace-nowrap">
                f({no.argumento}) = {mostraValor ? valor.abreviado : '…'}
              </span>
              <span className="truncate text-xs text-texto-suave">
                {rotuloTipo(no.tipo)} · profundidade {no.profundidade} · passos {no.ordem_entrada} a{' '}
                {no.ordem_saida}
              </span>
              {item.ocultos > 0 && (
                <span className="ml-auto shrink-0 rounded-full border border-borda px-2 py-0.5 font-mono text-xs text-texto-suave">
                  +{formatarInteiro(item.ocultos)} ocultos
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function rotuloAcessivel(item: Item, valor: string): string {
  const { no } = item;
  const partes = [
    `f(${no.argumento}) igual a ${valor}`,
    rotuloTipo(no.tipo),
    `profundidade ${no.profundidade}`,
    `entra no passo ${no.ordem_entrada}, sai no passo ${no.ordem_saida}`,
  ];
  if (item.ocultos > 0) partes.push(`${item.ocultos} descendentes ocultos`);
  return partes.join(', ');
}
