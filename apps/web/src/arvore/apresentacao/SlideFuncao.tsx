import { Fragment, type ReactNode } from 'react';
import { abreviarValor, corDoArgumento, formatarInteiro } from '../../utilitarios/formatar';
import type { DadosApresentacao } from './dados';
import { contaPassoAPasso, type Termo } from './passos';
import { SEQUENCIA_APRESENTACAO } from './slides';

// Peça local da árvore: o Orquestrador harmoniza depois com o design system.

/** Atraso entre uma linha da conta e a seguinte, na entrada do slide. */
const ATRASO_LINHA_MS = 110;

/** f(argumento). Os parênteses não esticam: só a chave da definição acompanha a altura. */
function Chamada({ children }: { children: ReactNode }) {
  return (
    <mrow>
      <mi>f</mi>
      <mo stretchy="false">(</mo>
      {children}
      <mo stretchy="false">)</mo>
    </mrow>
  );
}

/** Parcelas ligadas por +, cada uma na sua caixa para o espaçamento do operador. */
function Soma({ parcelas }: { parcelas: readonly ReactNode[] }) {
  return (
    <mrow>
      {parcelas.map((parcela, posicao) => (
        <Fragment key={posicao}>
          {posicao > 0 && <mo>+</mo>}
          {parcela}
        </Fragment>
      ))}
    </mrow>
  );
}

function Numero({ valor }: { valor: string }) {
  return <mn>{formatarInteiro(valor)}</mn>;
}

function Condicao({ operador, limite }: { operador: string; limite: number }) {
  return (
    <mtd className="py-[0.2em] pl-[0.9em] text-left">
      <mtext>se</mtext>
      <mspace width="0.35em" />
      <mi>n</mi>
      <mo>{operador}</mo>
      <mn>{limite}</mn>
    </mtd>
  );
}

interface DefinicaoProps {
  ordem: number;
  casosBase: readonly Termo[];
}

/** A definição por partes: o valor dos casos base e a soma dos termos anteriores. */
function Definicao({ ordem, casosBase }: DefinicaoProps) {
  const maiorBase = Math.max(...casosBase.map((termo) => termo.argumento));
  // As três sequências do enunciado têm todos os casos base valendo 1.
  const valorBase = casosBase[0]?.valor ?? '1';
  const anteriores = Array.from({ length: ordem }, (_, i) => (
    <Chamada key={i}>
      <mi>n</mi>
      <mo>−</mo>
      <mn>{i + 1}</mn>
    </Chamada>
  ));

  /* Em linha e não em bloco: o MathML em bloco centraliza a fórmula na coluna. */
  return (
    <div data-testid="definicao" className="text-[clamp(0.85rem,min(4.3cqw,5vh),2.4rem)]">
      <math>
        <mrow>
          <Chamada>
            <mi>n</mi>
          </Chamada>
          <mo>=</mo>
          <mrow>
            <mo>{'{'}</mo>
            <mtable>
              <mtr>
                <mtd className="py-[0.2em] text-left">
                  <Numero valor={valorBase} />
                </mtd>
                <Condicao operador="≤" limite={maiorBase} />
              </mtr>
              <mtr>
                <mtd className="py-[0.2em] text-left">
                  <Soma parcelas={anteriores} />
                </mtd>
                <Condicao operador="≥" limite={maiorBase + 1} />
              </mtr>
            </mtable>
          </mrow>
        </mrow>
      </math>
    </div>
  );
}

function Ponto({ argumento }: { argumento: number }) {
  return (
    <span
      aria-hidden="true"
      className="size-[0.45em] shrink-0 rounded-full"
      style={{ backgroundColor: corDoArgumento(argumento) }}
    />
  );
}

/** Uma linha da conta, entrando depois da anterior. */
function Linha({
  indice,
  destaque = false,
  children,
}: {
  indice: number;
  destaque?: boolean;
  children: ReactNode;
}) {
  return (
    <tr
      data-testid="passo"
      className={`motion-safe:animar-linha ${destaque ? 'bg-primaria-suave' : ''}`}
      style={{ animationDelay: `${indice * ATRASO_LINHA_MS}ms` }}
    >
      {children}
    </tr>
  );
}

const CELULA = 'px-[0.3em] py-[0.12em] whitespace-nowrap';

function Rotulo({ argumento }: { argumento: number }) {
  return (
    <th scope="row" className={`${CELULA} pl-[0.4em] text-left font-normal`}>
      <span className="inline-flex items-center gap-[0.35em]">
        <Ponto argumento={argumento} />
        <math>
          <Chamada>
            <mn>{argumento}</mn>
          </Chamada>
        </math>
      </span>
    </th>
  );
}

function Resultado({ valor, destaque }: { valor: string; destaque: boolean }) {
  return (
    <td
      className={`${CELULA} pr-[0.4em] text-right ${destaque ? 'font-semibold text-primaria' : ''}`}
    >
      <math>
        <mo>=</mo>
        <Numero valor={valor} />
      </math>
    </td>
  );
}

export function SlideFuncao({ dados }: { dados: DadosApresentacao }) {
  const info = dados.descricoes[SEQUENCIA_APRESENTACAO];
  const { comCache, semCache } = dados;
  const { casosBase, passos } = contaPassoAPasso(comCache.raiz, info.ordem);
  const valor = abreviarValor(semCache.metricas.valor, 18);
  const mesmoValor = semCache.metricas.valor === comCache.metricas.valor;
  const n = comCache.n;

  return (
    <div className="grid min-w-0 flex-1 content-center items-start gap-x-[clamp(1.5rem,4vw,4rem)] gap-y-[clamp(1rem,2.5vh,2rem)] lg:grid-cols-2">
      {/* As fórmulas medem a própria coluna: crescem com a tela sem invadir a vizinha. */}
      <div className="@container flex min-w-0 flex-col gap-[clamp(0.75rem,2.2vh,1.75rem)]">
        <section aria-label="Definição" className="flex flex-col gap-1">
          <h2 className="text-[clamp(0.8rem,1vw,1.05rem)] font-normal text-texto-suave">
            Definição
          </h2>
          <Definicao ordem={info.ordem} casosBase={casosBase} />
          <p className="max-w-[52ch] text-[clamp(0.9rem,1.2vw,1.2rem)] text-texto-suave">
            {`A recursão desce de f(${n}) até os casos base, e os valores voltam somados, como na conta ao lado.`}
          </p>
        </section>

        <section
          aria-label="Resultado"
          className="flex flex-col gap-1 border-l-3 border-primaria pl-[clamp(0.75rem,1.5vw,1.5rem)]"
        >
          <h2 className="text-[clamp(0.8rem,1vw,1.05rem)] font-normal text-texto-suave">
            {`${info.nome} de ${n}`}
          </h2>
          <div className="flex flex-wrap items-baseline gap-x-[0.3em] text-[clamp(1.6rem,min(3.2vw,6vh),3.2rem)]">
            <math>
              <Chamada>
                <mn>{n}</mn>
              </Chamada>
              <mo>=</mo>
            </math>
            <p
              data-testid="valor-alvo"
              className="font-matematica text-[clamp(3rem,min(8vw,15vh),7.5rem)] leading-none break-all text-primaria"
            >
              {valor.abreviado}
            </p>
          </div>
          <p className="text-[clamp(0.9rem,1.2vw,1.2rem)] text-texto-suave">
            Calculado na hora pela própria recursão.
            {mesmoValor &&
              ' Os dois modos devolvem este valor: o cache muda o caminho, não a resposta.'}
          </p>
        </section>
      </div>

      <div className="@container min-w-0">
        <table
          data-testid="conta-passo-a-passo"
          className="w-full border-collapse text-[clamp(0.85rem,min(4.1cqw,3.7vh),2.2rem)]"
        >
          <caption className="pb-1 text-left font-sans text-[clamp(0.8rem,1vw,1.05rem)] text-texto-suave">
            {`O cálculo passo a passo, de f(0) a f(${n})`}
          </caption>
          <tbody>
            {casosBase.map((termo, indice) => (
              <Linha key={termo.argumento} indice={indice}>
                <Rotulo argumento={termo.argumento} />
                <td colSpan={2} className={`${CELULA} text-[0.6em] text-texto-suave`}>
                  caso base
                </td>
                <Resultado valor={termo.valor} destaque={false} />
              </Linha>
            ))}
            {passos.map((passo, posicao) => {
              const destaque = posicao === passos.length - 1;
              return (
                <Linha
                  key={passo.argumento}
                  indice={casosBase.length + posicao}
                  destaque={destaque}
                >
                  <Rotulo argumento={passo.argumento} />
                  <td className={CELULA}>
                    <math>
                      <mo>=</mo>
                      <Soma
                        parcelas={passo.parcelas.map((parcela) => (
                          <Chamada key={parcela.argumento}>
                            <mn>{parcela.argumento}</mn>
                          </Chamada>
                        ))}
                      />
                    </math>
                  </td>
                  <td className={`${CELULA} text-right`}>
                    <math>
                      <mo>=</mo>
                      <Soma
                        parcelas={passo.parcelas.map((parcela) => (
                          <Numero key={parcela.argumento} valor={parcela.valor} />
                        ))}
                      />
                    </math>
                  </td>
                  <Resultado valor={passo.valor} destaque={destaque} />
                </Linha>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
