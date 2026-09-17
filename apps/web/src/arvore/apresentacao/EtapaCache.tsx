import { useMemo, useState } from 'react';
import { formatarInteiro } from '../../utilitarios/formatar';
import { ArvoreSvg } from '../ArvoreSvg';
import { achatarNos, podasPorAcerto, totalPassos } from '../modelo';
import { Reproducao } from '../Reproducao';
import { useReproducao } from '../usarReproducao';
import type { DadosApresentacao } from './dados';
import { ALTURA_ARVORE, ENQUADRE_APRESENTACAO } from './medidas';
import { momentosDoCache } from './momentos';

// Peça local da árvore: o Orquestrador harmoniza depois com o design system.

const CHIP =
  'min-h-toque rounded-full border border-borda px-4 text-[clamp(0.85rem,1.05vw,1.05rem)] font-mono hover:bg-superficie aria-pressed:border-primaria aria-pressed:bg-primaria-suave';

export function EtapaCache({ dados }: { dados: DadosApresentacao }) {
  const { comCache, evitada } = dados;
  const [realce, setRealce] = useState<number | null>(null);
  const nos = useMemo(() => achatarNos(comCache.raiz), [comCache.raiz]);
  const momentos = useMemo(() => momentosDoCache(comCache.raiz), [comCache.raiz]);
  const podas = useMemo(() => podasPorAcerto(evitada.podas), [evitada.podas]);
  const relogio = useReproducao(totalPassos(comCache.raiz));

  return (
    <div className="flex min-w-0 flex-col gap-[clamp(0.5rem,1.2vh,1rem)]">
      <p className="font-mono text-[clamp(0.85rem,1.15vw,1.2rem)] text-texto-suave">
        {'1. caso base? devolve  →  2. está no dicionário? devolve  →  3. calcula e guarda'}
      </p>

      <div className="flex flex-wrap gap-2" role="group" aria-label="Momentos do cache">
        {momentos.map((momento) => (
          <button
            key={momento.id}
            type="button"
            data-testid="momento-cache"
            className={CHIP}
            aria-pressed={relogio.passo === momento.passo}
            onClick={() => {
              relogio.irPara(momento.passo);
              setRealce(momento.argumento);
            }}
          >
            {momento.rotulo}
          </button>
        ))}
        <span className="self-center text-[clamp(0.8rem,1vw,1rem)] text-texto-suave">
          {`${formatarInteiro(comCache.metricas.acertos_cache)} acertos em ${formatarInteiro(comCache.metricas.entradas_cache)} entradas guardadas`}
        </span>
      </div>

      <Reproducao
        nos={nos}
        modo={comCache.modo}
        relogio={relogio}
        podasPorAcerto={podas}
        focarAoMontar
      >
        <ArvoreSvg
          raiz={comCache.raiz}
          metricas={comCache.metricas}
          sequencia={comCache.sequencia}
          n={comCache.n}
          modo={comCache.modo}
          passo={relogio.passo}
          animacaoReduzida={relogio.animacaoReduzida}
          compacto
          argumentoRealcado={realce}
          aoRealcarArgumento={setRealce}
          enquadreMinimo={ENQUADRE_APRESENTACAO}
          classeAltura={ALTURA_ARVORE}
        />
      </Reproducao>
    </div>
  );
}
