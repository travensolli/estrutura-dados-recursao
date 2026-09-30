import { useCallback, useState } from 'react';
import { formatarInteiro } from '../../utilitarios/formatar';
import { ArvoreSvg } from '../ArvoreSvg';
import { CrescimentoChamadas } from './CrescimentoChamadas';
import { ALTURA_ARVORE, ENQUADRE_APRESENTACAO } from './medidas';
import type { DadosApresentacao } from './dados';
import { Placar } from './Placar';
import { FaixaArgumentos } from './FaixaArgumentos';

// Peça local da árvore: o Orquestrador harmoniza depois com o design system.

export function SlideSemCache({ dados }: { dados: DadosApresentacao }) {
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
    <div className="flex min-w-0 flex-col gap-[clamp(0.5rem,1.2vh,1rem)]">
      {/* O placar e a frase dividem a primeira faixa: a frase não custa altura ao desenho. */}
      <div className="flex flex-wrap items-end justify-between gap-x-[clamp(1rem,3vw,3rem)] gap-y-2">
        <Placar
          rotulo="Números da execução sem cache"
          itens={[
            { rotulo: 'invocações', valor: formatarInteiro(metricas.invocacoes), destaque: true },
            { rotulo: 'casos base', valor: formatarInteiro(metricas.casos_base) },
            { rotulo: 'calculados', valor: formatarInteiro(metricas.calculados) },
            {
              rotulo: 'profundidade máxima',
              valor: formatarInteiro(metricas.profundidade_maxima),
            },
          ]}
        />
        {comparacao.argumentoMaisChamado && (
          <p className="max-w-[44ch] flex-1 basis-[22rem] text-[clamp(0.95rem,1.3vw,1.3rem)]">
            {`Sozinho, f(${comparacao.argumentoMaisChamado.argumento}) é chamado ${formatarInteiro(
              comparacao.argumentoMaisChamado.semCache,
            )} vezes das ${formatarInteiro(metricas.invocacoes)} invocações, sempre para devolver o mesmo resultado.`}
          </p>
        )}
      </div>

      {/* A árvore sem cache é larga: na largura toda ela cresce, e a contagem por argumento
          vira uma faixa curta embaixo em vez de uma coluna que disputa a largura. */}
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

      {/* Dentro de f(7), quem se repete; fora dele, quanto a repetição cresce com n. */}
      <div className="grid min-w-0 items-start gap-x-[clamp(1.5rem,3.5vw,3.5rem)] gap-y-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <FaixaArgumentos
          linhas={comparacao.linhas}
          maximo={comparacao.maiorInvocacao}
          legenda={`Invocações por argumento em f(${semCache.n})`}
          argumentoRealcado={argumento}
          argumentoFixado={fixado}
          aoRealcar={setRealce}
          aoFixar={fixar}
        />
        <CrescimentoChamadas sequencia={semCache.sequencia} destaque={semCache.n} />
      </div>
    </div>
  );
}
