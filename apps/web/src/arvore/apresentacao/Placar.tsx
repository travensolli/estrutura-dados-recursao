// Peça local da árvore: o Orquestrador harmoniza depois com o design system.

export interface ItemPlacar {
  rotulo: string;
  valor: string;
  /** Número principal do grupo. */
  destaque?: boolean;
  nota?: string;
}

export interface PlacarProps {
  itens: readonly ItemPlacar[];
  rotulo?: string;
}

/** Números grandes da execução, em tamanho de projetor. */
export function Placar({ itens, rotulo }: PlacarProps) {
  return (
    <dl
      aria-label={rotulo}
      className="flex flex-wrap items-stretch gap-x-[clamp(1rem,2.5vw,2.5rem)] gap-y-3"
    >
      {itens.map((item) => (
        <div
          key={item.rotulo}
          data-testid="item-placar"
          className="border-l border-borda pl-[clamp(0.75rem,1.5vw,1.5rem)] first:border-l-0 first:pl-0"
        >
          <dt className="text-[clamp(0.75rem,0.95vw,1rem)] text-texto-suave">{item.rotulo}</dt>
          <dd
            className={`font-mono leading-none tabular-nums ${
              item.destaque
                ? 'text-[clamp(2rem,4vw,3.6rem)] font-semibold text-primaria'
                : 'text-[clamp(1.4rem,2.6vw,2.4rem)]'
            }`}
          >
            {item.valor}
          </dd>
          {item.nota && (
            <p className="mt-1 text-[clamp(0.7rem,0.9vw,0.95rem)] text-texto-suave">{item.nota}</p>
          )}
        </div>
      ))}
    </dl>
  );
}
