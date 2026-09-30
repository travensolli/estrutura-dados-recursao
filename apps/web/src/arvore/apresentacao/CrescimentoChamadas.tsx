import type { Sequencia } from '@sequencias/contrato';
import { useMemo } from 'react';
import { formatarDecimal, formatarInteiro, formatarQuantidade } from '../../utilitarios/formatar';
import { crescimentoSemCache, fatorPorPasso, N_MAXIMO_CRESCIMENTO } from './crescimento';

// Peça local da árvore: o Orquestrador harmoniza depois com o design system.

export interface CrescimentoChamadasProps {
  sequencia: Sequencia;
  /** O n da árvore ao lado, marcado na curva. */
  destaque: number;
}

/* Uma coluna por n, na mesma gramática da faixa por argumento ao lado: a barra sobe
   com as invocações, e a escala linear deixa os primeiros n rentes ao chão. */
export function CrescimentoChamadas({ sequencia, destaque }: CrescimentoChamadasProps) {
  const pontos = useMemo(
    () => crescimentoSemCache(sequencia, Math.max(N_MAXIMO_CRESCIMENTO, destaque)),
    [destaque, sequencia],
  );
  const maximo = pontos.reduce((maior, ponto) => Math.max(maior, ponto.invocacoes), 1);
  const fator = fatorPorPasso(pontos);

  return (
    <figure className="m-0 min-w-0">
      <figcaption className="pb-1 text-[clamp(0.85rem,1.05vw,1.1rem)] text-texto-suave">
        Invocações sem cache para cada n
        {fator !== null && `: cada n a mais multiplica por ≈ ${formatarDecimal(fator, 2)}`}
      </figcaption>
      <ol
        className="grid gap-0.5"
        style={{ gridTemplateColumns: `repeat(${pontos.length}, minmax(0, 1fr))` }}
      >
        {pontos.map((ponto) => {
          const marcado = ponto.n === destaque;
          const altura = ponto.invocacoes > 0 ? Math.max(3, (ponto.invocacoes / maximo) * 100) : 0;
          return (
            <li
              key={ponto.n}
              data-testid="ponto-crescimento"
              data-destaque={marcado ? 'sim' : 'nao'}
              aria-label={`n = ${ponto.n}: ${formatarQuantidade(ponto.invocacoes, 'invocação', 'invocações')}`}
              className={`flex min-w-0 flex-col items-center gap-0.5 rounded-md px-0.5 pt-1 pb-1.5 ${
                marcado ? 'bg-primaria-suave' : ''
              }`}
            >
              <span
                aria-hidden="true"
                className="flex h-[clamp(2.25rem,7.5vh,5rem)] w-full items-end justify-center"
              >
                <span
                  className="w-[60%] rounded-t-[3px] bg-serie-sem-cache"
                  style={{ height: `${altura}%`, opacity: marcado ? 1 : 0.55 }}
                />
              </span>
              <span
                aria-hidden="true"
                className={`font-mono text-[clamp(0.75rem,1.05vw,1.15rem)] leading-tight tabular-nums ${
                  marcado ? 'font-semibold' : 'text-texto-suave'
                }`}
              >
                {formatarInteiro(ponto.invocacoes)}
              </span>
              <span
                aria-hidden="true"
                className="font-mono text-[clamp(0.7rem,0.9vw,0.95rem)] text-texto-suave"
              >
                n={ponto.n}
              </span>
            </li>
          );
        })}
      </ol>
    </figure>
  );
}
