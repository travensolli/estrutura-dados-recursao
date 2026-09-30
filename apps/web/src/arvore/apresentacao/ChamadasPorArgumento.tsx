import type { CSSProperties } from 'react';
import { corDoArgumento, formatarInteiro } from '../../utilitarios/formatar';
import { instanteDaContagem } from './contagem';
import type { Comparacao, LinhaArgumento } from './dados';

// Peça local da árvore: o Orquestrador harmoniza depois com o design system.

/* A fileira mais longa, de --colunas quadrados, cabe na coluna sem quebrar: o lado sai da
   largura do contêiner menos a dos rótulos e números, e a altura da janela põe o teto. */
const QUADRO =
  'size-[clamp(0.5rem,min(calc((100cqw-17rem)/var(--colunas)-3px),3.6vh),2.2rem)] shrink-0 rounded-[3px] border-2 [border-color:var(--cor)]';
/* A cor do argumento vem por variável: a mesma regra serve a todos os quadrados. */
const CHEIO = `${QUADRO} [background-color:var(--cor)]`;
const EVITADO = `${QUADRO} border-dashed [background-color:color-mix(in_srgb,var(--cor)_12%,transparent)]`;
const NUMERO = 'px-[0.5em] py-1 text-right font-mono tabular-nums';

function cor(argumento: number): CSSProperties {
  return { '--cor': corDoArgumento(argumento) } as CSSProperties;
}

/** A legenda não é de argumento nenhum: fica no tom do texto secundário. */
const COR_LEGENDA = { '--cor': 'var(--texto-suave)' } as CSSProperties;

/** Posição do primeiro tracejado de cada linha na fila de esvaziamento. */
function inicioDosEvitados(linhas: readonly LinhaArgumento[]): number[] {
  const inicios: number[] = [];
  let soma = 0;
  for (const linha of linhas) {
    inicios.push(soma);
    soma += linha.evitadas;
  }
  return inicios;
}

export interface ChamadasPorArgumentoProps {
  comparacao: Comparacao;
}

/**
 * Um quadrado por chamada de cada argumento: os cheios continuam com cache, os
 * tracejados são os que o cache evitou. Na entrada, os tracejados se esvaziam
 * um a um no ritmo do contador ao lado, que desce das chamadas sem cache para
 * as com cache.
 */
export function ChamadasPorArgumento({ comparacao }: ChamadasPorArgumentoProps) {
  const { linhas } = comparacao;
  /* Cada tracejado se esvazia quando o contador passa por ele: a mesma curva, invertida. */
  const atraso = (ordem: number) =>
    instanteDaContagem((ordem + 0.5) / Math.max(1, comparacao.evitadas));
  const inicios = inicioDosEvitados(linhas);

  return (
    <table
      className="w-full border-collapse text-[clamp(0.85rem,1.15vw,1.2rem)]"
      style={{ '--colunas': comparacao.maiorInvocacao } as CSSProperties}
    >
      <caption className="pb-2 text-left">
        <span className="block text-[clamp(0.85rem,1.05vw,1.1rem)] text-texto-suave">
          Cada quadrado é uma chamada: todos acontecem sem cache, só os cheios com cache
        </span>
        <span className="mt-1 flex flex-wrap gap-x-5 gap-y-1 text-[clamp(0.8rem,1vw,1.05rem)]">
          <span className="inline-flex items-center gap-2">
            <span aria-hidden="true" className={CHEIO} style={COR_LEGENDA} />
            feita com cache
          </span>
          <span className="inline-flex items-center gap-2">
            <span aria-hidden="true" className={EVITADO} style={COR_LEGENDA} />
            evitada pelo cache
          </span>
        </span>
      </caption>
      <thead>
        <tr className="text-[clamp(0.75rem,0.95vw,1rem)] text-texto-suave">
          <th scope="col" className="py-1 pr-2 text-left font-normal">
            argumento
          </th>
          <th scope="col" className="py-1 text-left font-normal">
            <span className="sr-only">chamadas, uma por quadrado</span>
          </th>
          <th scope="col" className="px-[0.5em] py-1 text-right font-normal whitespace-nowrap">
            sem cache
          </th>
          <th scope="col" className="px-[0.5em] py-1 text-right font-normal whitespace-nowrap">
            com cache
          </th>
          <th scope="col" className="py-1 pl-[0.5em] text-right font-normal">
            evitadas
          </th>
        </tr>
      </thead>
      <tbody>
        {linhas.map((linha, posicao) => {
          const inicioEvitadas = inicios[posicao] ?? 0;
          return (
            <tr
              key={linha.argumento}
              data-testid="linha-chamadas"
              data-argumento={linha.argumento}
              className="border-t border-borda"
              style={cor(linha.argumento)}
            >
              <th scope="row" className="py-1 pr-2 text-left font-mono font-normal">
                <span className="inline-flex items-center gap-2">
                  <span
                    aria-hidden="true"
                    className="size-[0.6em] shrink-0 rounded-full [background-color:var(--cor)]"
                  />
                  f({linha.argumento})
                </span>
              </th>
              <td aria-hidden="true" className="py-1">
                <span className="flex gap-[3px]">
                  {Array.from({ length: linha.comCache }, (_, i) => (
                    <span key={`com-${i}`} data-testid="quadro-chamada" className={CHEIO} />
                  ))}
                  {Array.from({ length: linha.evitadas }, (_, i) => (
                    <span
                      key={`evitada-${i}`}
                      data-testid="quadro-chamada"
                      data-evitada="sim"
                      className={`${EVITADO} motion-safe:animar-esvaziar`}
                      style={{ animationDelay: `${atraso(inicioEvitadas + i)}ms` }}
                    />
                  ))}
                </span>
              </td>
              <td className={NUMERO}>{formatarInteiro(linha.semCache)}</td>
              <td className={NUMERO}>{formatarInteiro(linha.comCache)}</td>
              <td className={`${NUMERO} pr-0 font-semibold text-primaria`}>
                {linha.evitadas > 0 ? `−${formatarInteiro(linha.evitadas)}` : '–'}
              </td>
            </tr>
          );
        })}
      </tbody>
      <tfoot>
        <tr data-testid="total-chamadas" className="border-t-2 border-borda-forte">
          <th scope="row" className="py-1.5 pr-2 text-left font-normal text-texto-suave">
            total
          </th>
          <td />
          <td className={`${NUMERO} font-semibold`}>
            {formatarInteiro(comparacao.invocacoesSemCache)}
          </td>
          <td className={`${NUMERO} font-semibold`}>
            {formatarInteiro(comparacao.invocacoesComCache)}
          </td>
          <td className={`${NUMERO} pr-0 font-semibold text-primaria`}>
            −{formatarInteiro(comparacao.evitadas)}
          </td>
        </tr>
      </tfoot>
    </table>
  );
}
