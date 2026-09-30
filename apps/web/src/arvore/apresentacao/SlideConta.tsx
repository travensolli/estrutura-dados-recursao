import { useState } from 'react';
import { formatarInteiro } from '../../utilitarios/formatar';
import { Contador } from './Contador';
import type { DadosApresentacao } from './dados';
import { TabelaArgumentos } from './TabelaArgumentos';

// Peça local da árvore: o Orquestrador harmoniza depois com o design system.

export function SlideConta({ dados }: { dados: DadosApresentacao }) {
  const [rodada, setRodada] = useState(0);
  const { comparacao } = dados;
  const soma = `${comparacao.parcelas.join(' + ')} = ${formatarInteiro(comparacao.somaParcelas)}`;
  const diferenca = `${formatarInteiro(comparacao.recursivasSemCache)} − ${formatarInteiro(
    comparacao.recursivasComCache,
  )} = ${formatarInteiro(comparacao.diferencaRecursivas)}`;

  return (
    <div className="grid min-w-0 items-start gap-[clamp(1rem,3vw,3rem)] lg:grid-cols-[1.05fr_1fr]">
      <div className="flex min-w-0 flex-col gap-[clamp(0.5rem,1.5vh,1.25rem)]">
        <p className="text-[clamp(0.8rem,1vw,1.05rem)] text-texto-suave">invocações</p>
        <Contador
          de={comparacao.invocacoesSemCache}
          para={comparacao.invocacoesComCache}
          rodada={rodada}
          classe="text-[length:clamp(3.5rem,min(13vw,19vh),10rem)] leading-none font-semibold"
        />
        <p className="text-[clamp(1rem,1.5vw,1.5rem)]">
          {`de ${formatarInteiro(comparacao.invocacoesSemCache)} sem cache para ${formatarInteiro(
            comparacao.invocacoesComCache,
          )} com cache`}
        </p>
        <p
          data-testid="evitadas"
          className="font-mono text-[clamp(1.4rem,3vw,2.8rem)] font-semibold text-primaria"
        >
          {`− ${formatarInteiro(comparacao.evitadas)} chamadas evitadas`}
        </p>

        <dl className="mt-1 flex flex-col gap-2">
          <div className="border-l-3 border-borda-forte pl-3">
            <dt className="text-[clamp(0.8rem,1vw,1.05rem)] text-texto-suave">
              pela soma das subárvores podadas
            </dt>
            <dd
              data-testid="prova-podas"
              className="font-mono text-[clamp(1rem,1.7vw,1.7rem)] tabular-nums"
            >
              {soma}
            </dd>
          </div>
          <div className="border-l-3 border-borda-forte pl-3">
            <dt className="text-[clamp(0.8rem,1vw,1.05rem)] text-texto-suave">
              pela diferença das chamadas recursivas
            </dt>
            <dd
              data-testid="prova-recursivas"
              className="font-mono text-[clamp(1rem,1.7vw,1.7rem)] tabular-nums"
            >
              {diferenca}
            </dd>
          </div>
        </dl>

        <button
          type="button"
          className="min-h-toque self-start rounded-md border border-borda-forte px-4 text-[clamp(0.85rem,1.05vw,1.05rem)] hover:bg-superficie"
          onClick={() => setRodada((atual) => atual + 1)}
        >
          Repetir a contagem
        </button>
      </div>

      <div className="min-w-0">
        <TabelaArgumentos
          linhas={comparacao.linhas}
          maximo={comparacao.maiorInvocacao}
          colunas="ambos"
          legenda="Invocações por argumento nos dois modos"
        />
      </div>
    </div>
  );
}
