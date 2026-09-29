import { useCallback, useState } from 'react';
import { formatarInteiro } from '../../utilitarios/formatar';
import { ArvoreSvg } from '../ArvoreSvg';
import { ALTURA_ARVORE, ENQUADRE_APRESENTACAO } from './medidas';
import type { DadosApresentacao } from './dados';
import { Placar } from './Placar';
import { TabelaArgumentos } from './TabelaArgumentos';

// Peça local da árvore: o Orquestrador harmoniza depois com o design system.

export function EtapaSemCache({ dados }: { dados: DadosApresentacao }) {
  const [realce, setRealce] = useState<number | null>(null);
  const [fixado, setFixado] = useState<number | null>(null);
  const { semCache, comparacao } = dados;
  const metricas = semCache.metricas;
  const argumento = realce ?? fixado;

  const fixar = useCallback(
    (alvo: number) => setFixado((atual) => (atual === alvo ? null : alvo)),
    [],
  );

  return (
    <div className="flex min-w-0 flex-col gap-[clamp(0.75rem,1.5vh,1.25rem)]">
      <Placar
        rotulo="Números da execução sem cache"
        itens={[
          { rotulo: 'invocações', valor: formatarInteiro(metricas.invocacoes), destaque: true },
          { rotulo: 'casos base', valor: formatarInteiro(metricas.casos_base) },
          { rotulo: 'calculados', valor: formatarInteiro(metricas.calculados) },
          {
            rotulo: 'profundidade máxima',
            valor: formatarInteiro(metricas.profundidade_maxima),
            nota: 'quadros na pilha',
          },
        ]}
      />

      <div className="grid min-w-0 gap-[clamp(0.75rem,1.5vw,1.5rem)] xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <ArvoreSvg
          raiz={semCache.raiz}
          metricas={metricas}
          sequencia={semCache.sequencia}
          n={semCache.n}
          modo={semCache.modo}
          truncada={semCache.truncada}
          nosExibidos={semCache.nos_exibidos}
          compacto
          palco
          argumentoRealcado={argumento}
          aoRealcarArgumento={setRealce}
          enquadreMinimo={ENQUADRE_APRESENTACAO}
          classeAltura={ALTURA_ARVORE}
        />

        <div className="flex min-w-0 flex-col gap-3">
          <TabelaArgumentos
            linhas={comparacao.linhas}
            maximo={comparacao.maiorInvocacao}
            legenda="Invocações por argumento"
            argumentoRealcado={argumento}
            argumentoFixado={fixado}
            aoRealcar={setRealce}
            aoFixar={fixar}
          />
          {comparacao.argumentoMaisChamado && (
            <p className="text-[clamp(0.9rem,1.2vw,1.2rem)] text-balance">
              {`Sozinho, f(${comparacao.argumentoMaisChamado.argumento}) é chamado ${formatarInteiro(
                comparacao.argumentoMaisChamado.semCache,
              )} vezes das ${formatarInteiro(metricas.invocacoes)} invocações, sempre para devolver o mesmo resultado.`}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
