import type { Metricas } from '@sequencias/contrato';
import { juntarClasses } from '../../utilitarios/classes';
import { formatarInteiro } from '../../utilitarios/formatar';

export interface ContadoresProps {
  metricas: Metricas;
  /** Quantos nós a árvore desenhada realmente traz, quando ela veio truncada. */
  nosExibidos?: number;
  className?: string;
}

/** Os números da execução em lista de placar: invocações em destaque, o resto em linhas. */
export function Contadores({ metricas, nosExibidos, className }: ContadoresProps) {
  const itens = [
    { rotulo: 'chamadas recursivas', valor: metricas.chamadas_recursivas },
    { rotulo: 'casos base', valor: metricas.casos_base },
    { rotulo: 'calculados', valor: metricas.calculados },
    { rotulo: 'acertos de cache', valor: metricas.acertos_cache },
    { rotulo: 'profundidade máxima', valor: metricas.profundidade_maxima },
  ];
  const truncada = nosExibidos !== undefined && nosExibidos < metricas.invocacoes;
  return (
    <dl className={juntarClasses('divide-y divide-borda', className)}>
      <div className="flex items-baseline justify-between gap-3 pb-1">
        <dt className="font-medium">invocações</dt>
        <dd className="font-mono text-2xl leading-tight font-semibold tabular-nums">
          {formatarInteiro(metricas.invocacoes)}
        </dd>
      </div>
      {itens.map((item) => (
        <div key={item.rotulo} className="flex items-baseline justify-between gap-3 py-0.5">
          <dt className="text-sm leading-dados text-texto-suave">{item.rotulo}</dt>
          <dd className="font-mono text-sm leading-dados font-medium tabular-nums">
            {formatarInteiro(item.valor)}
          </dd>
        </div>
      ))}
      {truncada && (
        <div className="flex items-baseline justify-between gap-3 py-0.5">
          <dt className="text-sm leading-dados text-texto-suave">nós desenhados</dt>
          <dd className="font-mono text-sm leading-dados font-medium text-alerta tabular-nums">
            {formatarInteiro(nosExibidos)}
          </dd>
        </div>
      )}
    </dl>
  );
}
