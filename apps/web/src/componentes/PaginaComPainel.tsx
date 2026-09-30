import type { ReactNode } from 'react';

export interface PaginaComPainelProps {
  titulo: ReactNode;
  /** Uma linha sobre o que a tela responde, sob o título. */
  descricao?: ReactNode;
  /** Os controles e o que mais morar na coluna da esquerda. */
  painel: ReactNode;
  /** O resultado, na coluna da direita. */
  children: ReactNode;
}

/**
 * Molde de Calcular, Comparar e Árvore: a configuração numa coluna de largura fixa à
 * esquerda e o resultado à direita. A mesma largura nas três telas faz a borda do
 * resultado ficar parada quando se troca de uma para outra.
 */
export function PaginaComPainel({ titulo, descricao, painel, children }: PaginaComPainelProps) {
  return (
    <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[288px_minmax(0,1fr)] lg:items-start lg:gap-x-5">
      <section
        aria-labelledby="titulo-pagina"
        className="flex min-w-0 flex-col gap-3 lg:border-r lg:border-borda lg:pr-5"
      >
        <div>
          <h1 id="titulo-pagina" className="text-xl font-semibold">
            {titulo}
          </h1>
          {descricao ? <p className="mt-0.5 text-sm text-texto-suave">{descricao}</p> : null}
        </div>
        {painel}
      </section>
      <div className="flex min-w-0 flex-col gap-3">{children}</div>
    </div>
  );
}
