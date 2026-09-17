import { formatarInteiro } from '../../utilitarios/formatar';
import type { DadosApresentacao } from './dados';
import { SEQUENCIA_APRESENTACAO } from './etapas';

// Peça local da árvore: o Orquestrador harmoniza depois com o design system.

interface Coluna {
  titulo: string;
  numero: string;
  unidade: string;
  texto: string;
}

export function EtapaGeral({ dados }: { dados: DadosApresentacao }) {
  const info = dados.descricoes[SEQUENCIA_APRESENTACAO];
  const fatorial = dados.descricoes.fatorial;
  const { comparacao, semCache, comCache } = dados;
  const n = comCache.n;
  const mesmaPilha =
    semCache.metricas.profundidade_maxima === comCache.metricas.profundidade_maxima;

  const colunas: Coluna[] = [
    {
      titulo: 'Sem cache',
      numero: formatarInteiro(comparacao.invocacoesSemCache),
      unidade: `invocações para n = ${n}`,
      texto: `Crescimento ${info.crescimento_sem_cache}. Cada aumento de 1 em n multiplica o trabalho, porque a árvore inteira é refeita em cada ramo.`,
    },
    {
      titulo: 'Com cache',
      numero: formatarInteiro(comparacao.invocacoesComCache),
      unidade: `invocações para n = ${n}`,
      texto: `Crescimento ${info.crescimento_com_cache}. Cada argumento é calculado uma única vez, e as demais chamadas viram consulta.`,
    },
    {
      titulo: 'O preço',
      numero: formatarInteiro(comCache.metricas.entradas_cache),
      unidade: 'entradas guardadas na memória',
      texto: mesmaPilha
        ? `A pilha não muda: ${formatarInteiro(comCache.metricas.profundidade_maxima)} quadros nos dois modos. O que o cache troca é memória por chamadas, não profundidade.`
        : 'O cache troca memória por chamadas: o dicionário fica vivo até o fim da execução.',
    },
  ];

  return (
    <div className="flex min-w-0 flex-col gap-[clamp(1rem,3vh,2.5rem)]">
      <div className="grid gap-[clamp(1rem,2.5vw,2.5rem)] lg:grid-cols-3">
        {colunas.map((coluna) => (
          <section
            key={coluna.titulo}
            aria-label={coluna.titulo}
            className="border-t-3 border-borda-forte pt-3 lg:border-t-0 lg:border-l-3 lg:pt-0 lg:pl-[clamp(0.75rem,1.5vw,1.5rem)]"
          >
            <h2 className="text-[clamp(0.9rem,1.2vw,1.2rem)] text-texto-suave">{coluna.titulo}</h2>
            <p className="font-mono text-[clamp(2.4rem,6vw,5rem)] leading-none font-semibold tabular-nums">
              {coluna.numero}
            </p>
            <p className="mt-1 text-[clamp(0.8rem,1vw,1.05rem)] text-texto-suave">
              {coluna.unidade}
            </p>
            <p className="mt-3 max-w-[46ch] text-[clamp(0.9rem,1.2vw,1.2rem)]">{coluna.texto}</p>
          </section>
        ))}
      </div>

      <p className="max-w-[80ch] text-[clamp(0.95rem,1.35vw,1.35rem)] text-balance">
        {`O ganho vem da repetição, não do cache em si: no fatorial o crescimento é ${fatorial.crescimento_com_cache}, porque cada argumento aparece uma vez só. Ali o dicionário custa memória e não evita chamada nenhuma.`}
      </p>
    </div>
  );
}
