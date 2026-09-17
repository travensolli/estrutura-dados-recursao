import { corDoArgumento, formatarInteiro } from '../../utilitarios/formatar';
import { ArvoreSvg } from '../ArvoreSvg';
import { contarNos } from '../modelo';
import type { DadosApresentacao } from './dados';
import { DuasArvores } from './DuasArvores';
import { ALTURA_ARVORE_DUPLA, ENQUADRE_APRESENTACAO } from './medidas';

// Peça local da árvore: o Orquestrador harmoniza depois com o design system.

export function EtapaComCache({ dados }: { dados: DadosApresentacao }) {
  const { semCache, comCache, evitada, comparacao } = dados;
  const nosDesenhados = contarNos(evitada.raiz);
  const fecha = nosDesenhados === semCache.metricas.invocacoes;
  const podas = [...evitada.podas].sort((a, b) => b.podadas - a.podadas);

  return (
    <div className="flex min-w-0 flex-col gap-[clamp(0.5rem,1.2vh,1rem)]">
      <DuasArvores
        lados={[
          {
            id: 'sem',
            rotulo: 'Sem cache',
            nota: `${formatarInteiro(semCache.metricas.invocacoes)} invocações`,
            conteudo: (
              <ArvoreSvg
                raiz={semCache.raiz}
                metricas={semCache.metricas}
                sequencia={semCache.sequencia}
                n={semCache.n}
                modo={semCache.modo}
                truncada={semCache.truncada}
                nosExibidos={semCache.nos_exibidos}
                compacto
                enquadreMinimo={ENQUADRE_APRESENTACAO}
                classeAltura={ALTURA_ARVORE_DUPLA}
              />
            ),
          },
          {
            id: 'com',
            rotulo: 'Com cache',
            nota: `${formatarInteiro(comCache.metricas.invocacoes)} invocações e ${formatarInteiro(comparacao.evitadas)} chamadas evitadas`,
            conteudo: (
              <ArvoreSvg
                raiz={evitada.raiz}
                metricas={comCache.metricas}
                sequencia={comCache.sequencia}
                n={comCache.n}
                modo={comCache.modo}
                compacto
                fantasmas={evitada.fantasmas}
                selos={evitada.selos}
                enquadreMinimo={ENQUADRE_APRESENTACAO}
                classeAltura={ALTURA_ARVORE_DUPLA}
              />
            ),
          },
        ]}
      />

      <ul className="flex flex-wrap gap-x-[clamp(0.75rem,2vw,2rem)] gap-y-2" aria-label="Podas">
        {podas.map((poda) => (
          <li
            key={poda.acerto.id}
            data-testid="poda"
            className="flex items-baseline gap-2 font-mono text-[clamp(0.9rem,1.25vw,1.25rem)]"
          >
            <span
              aria-hidden="true"
              className="size-[0.7em] shrink-0 self-center rounded-full"
              style={{ backgroundColor: corDoArgumento(poda.acerto.argumento) }}
            />
            f({poda.acerto.argumento})
            <span className="text-texto-suave">evita {formatarInteiro(poda.podadas)}</span>
          </li>
        ))}
      </ul>

      {fecha && (
        <p className="max-w-[80ch] text-[clamp(0.9rem,1.25vw,1.25rem)] text-balance">
          {`A árvore com cache mais o tracejado dá ${formatarInteiro(nosDesenhados)} nós, exatamente o total sem cache: cada acerto substitui uma subárvore inteira por uma consulta ao dicionário.`}
        </p>
      )}
    </div>
  );
}
