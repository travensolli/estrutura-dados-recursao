import { DESCRICAO_SEQUENCIAS, SEQUENCIAS, type Sequencia } from '@sequencias/contrato';
import { type ReactNode, useMemo, useState } from 'react';
import { CampoNumero, Detalhes, Tabela, type ColunaTabela } from '../componentes';
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

function linhas(n: number): LinhaFormula[] {
  return [
    {
      chave: 'tipo',
      grandeza: 'Tipo de recursão',
      formula: 'k chamadas por caso não base',
      valor: (s) => `${TIPOS[s].recursao} (k = ${TIPOS[s].k}) · árvore ${TIPOS[s].arvore}`,
    },
    {
      chave: 'recorrencia',
      grandeza: 'Recorrência',
      formula: 'combina os k termos anteriores',
      valor: (s) => TIPOS[s].combinacao,
    },
    {
      chave: 'casos-base',
      grandeza: 'Casos base',
      formula: 'b casos: f(0) … f(b − 1) = 1; as contagens valem para n ≥ b − 1',
      valor: (s) => `b = ${TIPOS[s].b} · contagens para n ≥ ${TIPOS[s].b - 1}`,
    },
    {
      chave: 'valor',
      grandeza: 'Valor',
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
      formula: (
        <span className="font-mono">
          {I_SEM}(n) = 1 + {I_SEM}(n−1) + … + {I_SEM}(n−k)
          <br />
          k = 1: n − b + 2
          <br />k ≥ 2: (k·f(n) − 1) / (k − 1)
        </span>
      ),
      valor: (_, c) => <ContaComResultado conta={c.invocacoesSemCache} />,
    },
    {
      chave: 'invocacoes-com',
      grandeza: 'Invocações com cache',
      formula: <span className="font-mono">{I_COM}(n) = 1 + k · (n − b + 1)</span>,
      valor: (_, c) => <ContaComResultado conta={c.invocacoesComCache} />,
    },
    {
      chave: 'evitadas',
      grandeza: 'Chamadas evitadas',
      formula: (
        <span className="font-mono">
          E(n) = {I_SEM}(n) − {I_COM}(n)
        </span>
      ),
      valor: (_, c) => <ContaComResultado conta={c.evitadas} />,
    },
    {
      chave: 'entradas',
      grandeza: 'Valores no cache',
      formula: <span className="font-mono">n − b + 1</span>,
      valor: (_, c) => <ContaComResultado conta={c.entradasCache} />,
    },
    {
      chave: 'profundidade',
      grandeza: 'Profundidade da pilha',
      formula: <span className="font-mono">P(n) = n − b + 2, igual nos dois modos</span>,
      valor: (_, c) => <ContaComResultado conta={c.profundidade} />,
    },
    {
      chave: 'tempo',
      grandeza: 'Tempo: sem → com cache',
      formula: <span className="font-mono">Θ({I_SEM}(n)) → Θ(n)</span>,
      valor: (s) => <span className="font-mono">{TIPOS[s].complexidadeSemCache} → Θ(n)</span>,
    },
  ];
}

function colunas(calculos: Calculos): ColunaTabela<LinhaFormula>[] {
  return [
    {
      chave: 'grandeza',
      rotulo: 'Grandeza',
      conteudo: (linha) => linha.grandeza,
      cabecalhoDeLinha: true,
      className: 'w-[16%]',
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
      className: 'w-[19%]',
    })),
  ];
}

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
      <div className="flex flex-wrap items-start justify-between gap-x-8 gap-y-2">
        <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
          <dt className="font-mono font-semibold">k</dt>
          <dd>ordem: quantas chamadas recursivas cada caso não base abre</dd>
          <dt className="font-mono font-semibold">b</dt>
          <dd>casos base: f(0) até f(b − 1), todos valendo 1</dd>
          <dt className="font-mono font-semibold">f(n)</dt>
          <dd>valor da sequência; as fórmulas valem para n ≥ b − 1</dd>
        </dl>
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
        className="mt-2"
      />

      <p className="mt-3 text-sm text-texto-suave">
        Com k ≥ 2 e todos os casos base valendo 1, cada folha da árvore sem cache soma 1 ao
        resultado: f(n) é o número de folhas, e uma árvore k-ária cheia com f(n) folhas tem (k·f(n)
        − 1) / (k − 1) nós. Com cache, cada argumento de b a n é calculado uma vez e abre k
        chamadas; as demais são casos base ou acertos. As telas Calcular e Árvore mostram os mesmos
        números medidos na execução.
      </p>
    </Detalhes>
  );
}
