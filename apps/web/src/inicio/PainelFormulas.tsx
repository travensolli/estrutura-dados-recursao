import { DESCRICAO_SEQUENCIAS, SEQUENCIAS, type Sequencia } from '@sequencias/contrato';
import { Fragment, type ReactNode, useMemo, useState } from 'react';
import { CampoNumero, Detalhes, Tabela, type ColunaTabela } from '../componentes';
import { juntarClasses } from '../utilitarios/classes';
import { formatarInteiro } from '../utilitarios/formatar';
import {
  calcularFormulas,
  type CalculoSequencia,
  type Conta,
  N_EXEMPLO_FORMULAS,
  N_MAXIMO_FORMULAS,
  N_MINIMO_FORMULAS,
  TIPOS,
} from './formulas';

type Calculos = Record<Sequencia, CalculoSequencia>;

interface LinhaFormula {
  chave: string;
  grandeza: string;
  /** O que a linha mede, em palavras, para quem não conhece a notação. */
  significado: string;
  formula: ReactNode;
  valor: (sequencia: Sequencia, calculo: CalculoSequencia) => ReactNode;
}

function ContaComResultado({ conta }: { conta: Conta }) {
  return (
    <span className="font-mono">
      {conta.conta} = <strong className="font-semibold">{formatarInteiro(conta.resultado)}</strong>
    </span>
  );
}

/** A fórmula lida em voz alta, logo abaixo da notação. */
function Leitura({ children }: { children: ReactNode }) {
  return <span className="mt-0.5 block text-texto-suave">{children}</span>;
}

const I_SEM = (
  <>
    I<sub>sem</sub>
  </>
);
const I_COM = (
  <>
    I<sub>com</sub>
  </>
);

/** f(0), f(1) e f(2): os casos base de uma sequência com b deles. */
function listaCasosBase(b: number): string {
  const casos = Array.from({ length: b }, (_, indice) => `f(${indice})`);
  return `${casos.slice(0, -1).join(', ')} e ${casos.at(-1)}`;
}

function linhas(n: number): LinhaFormula[] {
  return [
    {
      chave: 'tipo',
      grandeza: 'Tipo de recursão',
      significado: 'quantas chamadas cada passo abre',
      formula: 'k chamadas recursivas em cada caso que não é base',
      valor: (s) => `${TIPOS[s].recursao} (k = ${TIPOS[s].k}) · árvore ${TIPOS[s].arvore}`,
    },
    {
      chave: 'recorrencia',
      grandeza: 'Recorrência',
      significado: 'a regra que monta f(n)',
      formula: (
        <>
          combina os k termos anteriores:{' '}
          <span className="font-mono whitespace-nowrap">f(n−1) … f(n−k)</span>
        </>
      ),
      valor: (s) => TIPOS[s].combinacao,
    },
    {
      chave: 'casos-base',
      grandeza: 'Casos base',
      significado: 'os primeiros termos, que já têm valor',
      formula: (
        <>
          b casos, de <span className="font-mono">f(0)</span> a{' '}
          <span className="font-mono">f(b − 1)</span>, todos iguais a 1
          <Leitura>as contagens abaixo valem a partir de n = b − 1</Leitura>
        </>
      ),
      valor: (s) => (
        <>
          b = {TIPOS[s].b}: <span className="font-mono">{listaCasosBase(TIPOS[s].b)}</span>
          <Leitura>contagens para n ≥ {TIPOS[s].b - 1}</Leitura>
        </>
      ),
    },
    {
      chave: 'valor',
      grandeza: 'Valor',
      significado: 'o termo pedido',
      formula: <span className="font-mono">f(n)</span>,
      valor: (_, c) => (
        <span className="font-mono">
          f({n}) = <strong className="font-semibold">{formatarInteiro(c.valor)}</strong>
        </span>
      ),
    },
    {
      chave: 'invocacoes-sem',
      grandeza: 'Invocações sem cache',
      significado: 'quantas vezes a função é chamada, contando as repetições',
      formula: (
        <>
          <span className="font-mono">
            {I_SEM}(n) = 1 + {I_SEM}(n−1) + … + {I_SEM}(n−k)
          </span>
          <Leitura>a própria chamada, mais as chamadas de cada termo anterior. Resolvendo:</Leitura>
          <span className="mt-0.5 block font-mono">
            k = 1: n − b + 2
            <br />k ≥ 2: (k·f(n) − 1) / (k − 1)
          </span>
        </>
      ),
      valor: (_, c) => <ContaComResultado conta={c.invocacoesSemCache} />,
    },
    {
      chave: 'invocacoes-com',
      grandeza: 'Invocações com cache',
      significado: 'quantas vezes a função é chamada quando consulta o cache',
      formula: (
        <>
          <span className="font-mono">{I_COM}(n) = 1 + k · (n − b + 1)</span>
          <Leitura>a primeira chamada, mais k chamadas para cada valor calculado</Leitura>
        </>
      ),
      valor: (_, c) => <ContaComResultado conta={c.invocacoesComCache} />,
    },
    {
      chave: 'evitadas',
      grandeza: 'Chamadas evitadas',
      significado: 'as chamadas que o cache poupa',
      formula: (
        <>
          <span className="font-mono">
            E(n) = {I_SEM}(n) − {I_COM}(n)
          </span>
          <Leitura>a diferença entre os dois modos</Leitura>
        </>
      ),
      valor: (_, c) => <ContaComResultado conta={c.evitadas} />,
    },
    {
      chave: 'entradas',
      grandeza: 'Valores no cache',
      significado: 'quantos resultados ficam guardados',
      formula: (
        <>
          <span className="font-mono">n − b + 1</span>
          <Leitura>um por argumento calculado, de b até n; os casos base não entram</Leitura>
        </>
      ),
      valor: (_, c) => <ContaComResultado conta={c.entradasCache} />,
    },
    {
      chave: 'profundidade',
      grandeza: 'Profundidade da pilha',
      significado: 'o máximo de chamadas abertas ao mesmo tempo',
      formula: (
        <>
          <span className="font-mono">P(n) = n − b + 2</span>
          <Leitura>
            a descida mais longa, de f(n) até o caso base{' '}
            <span className="whitespace-nowrap">f(b − 1)</span>, igual nos dois modos
          </Leitura>
        </>
      ),
      valor: (_, c) => <ContaComResultado conta={c.profundidade} />,
    },
    {
      chave: 'tempo',
      grandeza: 'Tempo: sem → com cache',
      significado: 'como o trabalho cresce quando n aumenta',
      formula: (
        <>
          <span className="font-mono">Θ({I_SEM}(n)) → Θ(n)</span>
          <Leitura>sem cache, acompanha as invocações; com cache, cresce junto com n</Leitura>
        </>
      ),
      valor: (s) => <span className="font-mono">{TIPOS[s].complexidadeSemCache} → Θ(n)</span>,
    },
  ];
}

function colunas(calculos: Calculos): ColunaTabela<LinhaFormula>[] {
  return [
    {
      chave: 'grandeza',
      rotulo: 'O que se mede',
      conteudo: (linha) => (
        <>
          {linha.grandeza}{' '}
          <span className="mt-0.5 block font-normal text-texto-suave">{linha.significado}</span>
        </>
      ),
      cabecalhoDeLinha: true,
      className: 'w-[19%]',
    },
    {
      chave: 'formula',
      rotulo: 'Fórmula geral',
      conteudo: (linha) => linha.formula,
      className: 'w-[27%]',
    },
    ...SEQUENCIAS.map((sequencia): ColunaTabela<LinhaFormula> => ({
      chave: sequencia,
      rotulo: DESCRICAO_SEQUENCIAS[sequencia].nome,
      conteudo: (linha) => linha.valor(sequencia, calculos[sequencia]),
      className: 'w-[18%]',
    })),
  ];
}

interface Termo {
  simbolo: ReactNode;
  definicao: ReactNode;
  /** Palavra, e não símbolo: fica na fonte do texto. */
  palavra?: boolean;
}

/** Os símbolos das fórmulas, na ordem em que aparecem na tabela. */
const TERMOS: readonly Termo[] = [
  { simbolo: 'n', definicao: 'a posição do termo pedido: n = 7 calcula f(7)' },
  { simbolo: 'f(n)', definicao: 'o valor da sequência nessa posição' },
  {
    simbolo: 'k',
    definicao:
      'a ordem: quantas chamadas recursivas cada caso que não é base faz (1 no Fatorial, 2 no Fibonacci, 3 no Tribonacci)',
  },
  {
    simbolo: 'b',
    definicao: 'quantos casos base a sequência tem: os primeiros termos, dados sem nova chamada',
  },
  {
    simbolo: 'invocação',
    definicao: 'cada vez que a função é chamada, a primeira incluída',
    palavra: true,
  },
  {
    simbolo: (
      <>
        {I_SEM}, {I_COM}
      </>
    ),
    definicao: 'as invocações para calcular f(n) sem e com cache',
  },
  {
    simbolo: 'pilha',
    definicao: 'as chamadas abertas ao mesmo tempo, cada uma esperando as que ela fez',
    palavra: true,
  },
  {
    simbolo: 'Θ(…)',
    definicao:
      'cresce no ritmo de: Θ(n) cresce junto com n; Θ(φⁿ) se multiplica por φ ≈ 1,618 a cada n a mais, e Θ(τⁿ) por τ ≈ 1,839',
  },
];

/** Fórmulas gerais de invocações, pilha e complexidade, aplicadas às três sequências. */
export function PainelFormulas() {
  const [texto, setTexto] = useState(String(N_EXEMPLO_FORMULAS));
  const [n, setN] = useState(N_EXEMPLO_FORMULAS);
  const calculos = useMemo(
    () =>
      Object.fromEntries(
        SEQUENCIAS.map((sequencia) => [sequencia, calcularFormulas(sequencia, n)]),
      ) as Calculos,
    [n],
  );

  return (
    <Detalhes
      resumo={
        <span>
          <span className="font-medium">Fórmulas gerais: invocações, pilha e complexidade</span>
          <span className="text-sm text-texto-suave"> — com a conta para cada sequência</span>
        </span>
      }
    >
      <div className="flex flex-wrap items-start justify-between gap-x-8 gap-y-3">
        <div className="min-w-0 flex-1 basis-[36rem]">
          <p className="text-sm">
            Cada linha da tabela mede uma coisa. A <strong>fórmula geral</strong> vale para as três
            sequências; as colunas ao lado trocam k, b e n pelos números de cada uma e fazem a
            conta. Os símbolos:
          </p>
          <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm xl:grid-cols-[auto_1fr_auto_1fr]">
            {TERMOS.map((termo, indice) => (
              <Fragment key={indice}>
                <dt className={juntarClasses('font-semibold', !termo.palavra && 'font-mono')}>
                  {termo.simbolo}
                </dt>
                <dd>{termo.definicao}</dd>
              </Fragment>
            ))}
          </dl>
        </div>
        <CampoNumero
          rotulo="n do exemplo"
          valor={texto}
          aoMudar={(novo, resultado) => {
            setTexto(novo);
            if (resultado.valido) setN(resultado.valor);
          }}
          minimo={N_MINIMO_FORMULAS}
          maximo={N_MAXIMO_FORMULAS}
          className="w-56"
        />
      </div>

      <Tabela
        legenda={`Fórmulas gerais aplicadas às três sequências, com n = ${formatarInteiro(n)}`}
        colunas={colunas(calculos)}
        linhas={linhas(n)}
        chave={(linha) => linha.chave}
        cabecalhoFixo={false}
        grade
        zebrado
        ajustada
        className="mt-3"
      />

      <p className="mt-3 text-sm text-texto-suave">
        De onde vem (k·f(n) − 1) / (k − 1): sem cache, com k ≥ 2, a árvore de chamadas termina em
        casos base que valem 1, e f(n) é a soma deles. Então f(n) é o número de folhas, e uma árvore
        em que cada chamada que não é caso base abre k outras e que tem f(n) folhas tem (k·f(n) − 1)
        / (k − 1) chamadas no total. Com cache, cada argumento de b até n é calculado uma vez e abre
        k chamadas; as outras já são casos base ou acertos, quando o valor estava guardado. As telas
        Calcular e Árvore mostram os mesmos números, medidos na execução.
      </p>
    </Detalhes>
  );
}
