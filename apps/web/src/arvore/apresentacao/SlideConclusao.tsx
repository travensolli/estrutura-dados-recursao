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

      {/* O fecho: o que a turma leva embora é o critério, não a ressalva do fatorial. */}
      {/* O fecho ocupa a largura toda do palco: a letra cresce com a tela em vez de a linha
          parar numa coluna estreita. */}
      <div className="border-l-3 border-primaria pl-[clamp(0.75rem,1.5vw,1.5rem)] text-[clamp(1.05rem,min(1.75vw,3.4vh),2.1rem)] leading-snug">
        <p>
          Memoização não acelera a recursão: ela apaga o trabalho repetido, e repetição só existe
          quando a recursão ramifica. No fatorial, de ordem 1, cada argumento aparece uma vez e o
          dicionário só cobra memória.
        </p>
        <p className="mt-2">
          A pergunta que decide o uso do cache é uma só:{' '}
          <strong className="font-semibold text-primaria">o mesmo argumento volta?</strong> A árvore
          mostra; o contador prova.
        </p>
      </div>
    </div>
  );
}
