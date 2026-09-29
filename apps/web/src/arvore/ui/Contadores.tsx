import type { Metricas } from '@sequencias/contrato';
import { formatarInteiro } from '../../utilitarios/formatar';

// Peça local da árvore: o Orquestrador harmoniza depois com o design system.

export interface ContadoresProps {
  metricas: Metricas;
  /** Quantos nós a árvore desenhada realmente traz, quando ela veio truncada. */
  nosExibidos?: number;
}

export function Contadores({ metricas, nosExibidos }: ContadoresProps) {
  const itens = [
    { rotulo: 'invocações', valor: metricas.invocacoes, destaque: true },
    { rotulo: 'chamadas recursivas', valor: metricas.chamadas_recursivas },
    { rotulo: 'casos base', valor: metricas.casos_base },
    { rotulo: 'calculados', valor: metricas.calculados },
    { rotulo: 'acertos de cache', valor: metricas.acertos_cache },
    { rotulo: 'profundidade máxima', valor: metricas.profundidade_maxima },
  ];
  return (
    <dl className="flex flex-wrap items-stretch gap-x-4 gap-y-3">
      {itens.map((item) => (
        <div key={item.rotulo} className="border-l border-borda pl-3 first:border-l-0 first:pl-0">
          <dt className="text-xs text-texto-suave">{item.rotulo}</dt>
          <dd
            className={`font-mono tabular-nums ${item.destaque ? 'text-xl font-semibold' : 'text-lg'}`}
          >
            {formatarInteiro(item.valor)}
          </dd>
        </div>
      ))}
      {nosExibidos !== undefined && nosExibidos < metricas.invocacoes && (
        <div className="border-l border-borda pl-3">
          <dt className="text-xs text-texto-suave">nós desenhados</dt>
          <dd className="font-mono text-lg tabular-nums text-alerta">
            {formatarInteiro(nosExibidos)}
          </dd>
        </div>
      )}
    </dl>
  );
}
