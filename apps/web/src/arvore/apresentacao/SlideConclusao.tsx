import { formatarInteiro } from '../../utilitarios/formatar';
import type { DadosApresentacao } from './dados';
import { SEQUENCIA_APRESENTACAO } from './slides';

// Peça local da árvore: o Orquestrador harmoniza depois com o design system.

interface Coluna {
  titulo: string;
  numero: string;
  unidade: string;
  texto: string;
}

export function SlideConclusao({ dados }: { dados: DadosApresentacao }) {
  const info = dados.descricoes[SEQUENCIA_APRESENTACAO];
  const { comparacao, semCache, comCache } = dados;
  const n = comCache.n;
  const mesmaPilha =
    semCache.metricas.profundidade_maxima === comCache.metricas.profundidade_maxima;
  const maisChamado = comparacao.argumentoMaisChamado;

  const colunas: Coluna[] = [
    {
      titulo: 'Sem cache',
      numero: formatarInteiro(comparacao.invocacoesSemCache),
      unidade: `invocações para n = ${n}`,
      texto: `Crescimento ${info.crescimento_sem_cache}. Cada n a mais multiplica as chamadas por um fator constante, porque ramos diferentes recalculam as mesmas subárvores.`,
    },
    {
      titulo: 'Com cache',
      numero: formatarInteiro(comparacao.invocacoesComCache),
      unidade: `invocações para n = ${n}`,
      texto: `Crescimento ${info.crescimento_com_cache}. Cada argumento é calculado uma única vez; as chamadas seguintes com o mesmo argumento só consultam o dicionário.`,
    },
    {
      titulo: 'O preço',
      numero: formatarInteiro(comCache.metricas.entradas_cache),
      unidade: 'entradas guardadas na memória',
      texto: mesmaPilha
        ? `Uma entrada por argumento calculado, guardada até o fim da execução. A pilha é a mesma nos dois modos, ${formatarInteiro(comCache.metricas.profundidade_maxima)} quadros: o cache economiza chamadas, não profundidade.`
        : 'Uma entrada por argumento calculado, guardada até o fim da execução.',
    },
  ];

  return (
    <div className="flex min-w-0 flex-1 flex-col justify-center gap-[clamp(1rem,3vh,2.5rem)]">
      <div className="grid gap-[clamp(1rem,2.5vw,2.5rem)] lg:grid-cols-3">
        {colunas.map((coluna) => (
          <section
            key={coluna.titulo}
            aria-label={coluna.titulo}
            className="border-t-3 border-borda-forte pt-3 lg:border-t-0 lg:border-l-3 lg:pt-0 lg:pl-[clamp(0.75rem,1.5vw,1.5rem)]"
          >
            <h2 className="text-[clamp(0.9rem,1.2vw,1.2rem)] text-texto-suave">{coluna.titulo}</h2>
            <p className="font-mono text-[clamp(2.4rem,min(6vw,11vh),7rem)] leading-none font-semibold tabular-nums">
              {coluna.numero}
            </p>
            <p className="mt-1 text-[clamp(0.8rem,1vw,1.05rem)] text-texto-suave">
              {coluna.unidade}
            </p>
            <p className="mt-3 text-[clamp(0.9rem,min(1.2vw,2.7vh),1.5rem)]">{coluna.texto}</p>
          </section>
        ))}
      </div>

      {/* O fecho: o que a turma leva embora é o critério, com um caso de cada lado. Ocupa a
          largura toda do palco, e a letra cresce com a tela. */}
      <div className="border-l-3 border-primaria pl-[clamp(0.75rem,1.5vw,1.5rem)] text-[clamp(1.05rem,min(1.75vw,3.4vh),2.1rem)] leading-snug">
        <p>
          A memoização não acelera a recursão por si só: ela evita refazer chamadas, guardando cada
          resultado já calculado.
        </p>
        <p data-testid="pergunta-cache" className="mt-2">
          Por isso, antes de usar cache, a pergunta é:{' '}
          <strong className="font-semibold text-primaria">
            a função é chamada mais de uma vez com o mesmo argumento?
          </strong>{' '}
          {maisChamado &&
            `No ${info.nome}, sim: f(${maisChamado.argumento}) é chamado ${formatarInteiro(
              maisChamado.semCache,
            )} vezes, e o cache evita ${formatarInteiro(comparacao.evitadas)} das ${formatarInteiro(
              comparacao.invocacoesSemCache,
            )} chamadas. `}
          No fatorial, não: cada argumento é chamado uma única vez, e o cache só ocupa memória.
        </p>
      </div>
    </div>
  );
}
