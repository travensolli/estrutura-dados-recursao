import { formatarInteiro } from '../../utilitarios/formatar';
import { ArvoreSvg } from '../ArvoreSvg';
import { contarNos } from '../modelo';
import type { DadosApresentacao } from './dados';
import { ALTURA_ARVORE_EVITADA, ENQUADRE_APRESENTACAO } from './medidas';

// Peça local da árvore: o Orquestrador harmoniza depois com o design system.

const NUMERO = 'font-mono text-[clamp(1.5rem,2.8vw,2.6rem)] leading-none tabular-nums';
const OPERADOR = 'pb-[0.1em] font-mono text-[clamp(1.1rem,2vw,1.9rem)] text-texto-suave';
const ROTULO = 'flex items-center gap-1.5 text-[clamp(0.75rem,0.95vw,1rem)] text-texto-suave';

/** Um nó tracejado em miniatura, a mesma marca das chamadas evitadas no desenho. */
function MarcaTracejada() {
  return (
    <svg aria-hidden="true" viewBox="0 0 26 16" className="h-[1em] w-[1.6em] shrink-0">
      <rect
        x="1"
        y="1"
        width="24"
        height="14"
        rx="4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeDasharray="4 3"
      />
    </svg>
  );
}

export function SlideComCache({ dados }: { dados: DadosApresentacao }) {
  const { semCache, comCache, evitada } = dados;
  // Os números são os do próprio desenho: nós feitos, nós tracejados e o total.
  const feitas = comCache.metricas.invocacoes;
  const evitadas = evitada.fantasmas.size;
  const desenhados = contarNos(evitada.raiz);
  const fecha = desenhados === semCache.metricas.invocacoes;

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-[clamp(0.5rem,1.2vh,1rem)]">
      <div className="flex flex-wrap items-end justify-between gap-x-[clamp(1rem,3vw,3rem)] gap-y-2">
        <dl
          data-testid="soma-arvore"
          aria-label="Chamadas do desenho"
          className="flex items-end gap-x-[clamp(0.75rem,1.6vw,1.6rem)]"
        >
          <div>
            <dt className={ROTULO}>feitas com cache</dt>
            <dd className={NUMERO}>{formatarInteiro(feitas)}</dd>
          </div>
          <span aria-hidden="true" className={OPERADOR}>
            +
          </span>
          <div>
            <dt className={ROTULO}>
              <MarcaTracejada />
              evitadas
            </dt>
            <dd className={`${NUMERO} text-texto-suave`}>{formatarInteiro(evitadas)}</dd>
          </div>
          <span aria-hidden="true" className={OPERADOR}>
            =
          </span>
          <div>
            <dt className={ROTULO}>{fecha ? 'as invocações sem cache' : 'nós no desenho'}</dt>
            <dd className={`${NUMERO} font-semibold text-primaria`}>
              {formatarInteiro(desenhados)}
            </dd>
          </div>
        </dl>
        <p className="max-w-[60ch] flex-1 basis-[20rem] text-[clamp(0.95rem,1.3vw,1.3rem)]">
          Cada acerto troca uma subárvore inteira por uma consulta ao dicionário; o selo diz quantas
          chamadas ela teria.
        </p>
      </div>

      {/* Uma árvore só, na largura e na altura que sobram: a com cache já traz, no tracejado,
          tudo o que a sem cache faria. */}
      <ArvoreSvg
        raiz={evitada.raiz}
        metricas={comCache.metricas}
        sequencia={comCache.sequencia}
        n={comCache.n}
        modo={comCache.modo}
        compacto
        palco
        fantasmas={evitada.fantasmas}
        selos={evitada.selos}
        enquadreMinimo={ENQUADRE_APRESENTACAO}
        classeAltura={ALTURA_ARVORE_EVITADA}
        preencher
      />
    </div>
  );
}
