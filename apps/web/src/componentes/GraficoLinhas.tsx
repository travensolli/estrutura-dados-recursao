import { MODOS, type Modo } from '@sequencias/contrato';
import {
  CartesianGrid,
  LabelList,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useConsultaMidia } from '../hooks/midia';
import { juntarClasses } from '../utilitarios/classes';
import { rotuloModo } from '../utilitarios/formatar';

export interface PontoGrafico {
  n: number;
  sem_cache: number | null;
  com_cache: number | null;
}

export type EscalaGrafico = 'linear' | 'log';

export interface GraficoLinhasProps {
  pontos: ReadonlyArray<PontoGrafico>;
  escala: EscalaGrafico;
  /** Formata o valor na dica de contexto. */
  formatar: (valor: number) => string;
  /** Formata a marca do eixo vertical; por padrão usa `formatar`. */
  formatarEixo?: (valor: number) => string;
  /** Nome da grandeza medida, usado na dica. */
  grandeza: string;
  altura?: number;
}

const CORES: Record<Modo, string> = {
  sem_cache: 'var(--serie-sem-cache)',
  com_cache: 'var(--serie-com-cache)',
};

const CLASSES_MARCA: Record<Modo, string> = {
  sem_cache: 'bg-serie-sem-cache',
  com_cache: 'bg-serie-com-cache',
};

const EIXO = { fill: 'var(--texto-suave)', fontSize: 12 };

function ultimoComValor(pontos: ReadonlyArray<PontoGrafico>, modo: Modo): number {
  for (let i = pontos.length - 1; i >= 0; i--) {
    const valor = pontos[i]?.[modo];
    if (valor !== null && valor !== undefined) return i;
  }
  return -1;
}

/** Escala logarítmica não aceita zero nem negativo: esses pontos ficam sem valor. */
function valorNaEscala(valor: number | null, escala: EscalaGrafico): number | null {
  if (valor === null) return null;
  if (escala === 'log' && valor <= 0) return null;
  return valor;
}

/**
 * Duas linhas na mesma escala, uma por modo. O gráfico é decorativo para
 * leitores de tela: título, descrição e tabela de dados ficam ao lado, por isso
 * a camada de acessibilidade do Recharts fica desligada (ela colocaria um alvo
 * de foco dentro de uma região `aria-hidden`).
 */
export default function GraficoLinhas({
  pontos,
  escala,
  formatar,
  formatarEixo,
  grandeza,
  altura = 260,
}: GraficoLinhasProps) {
  const temEspaco = useConsultaMidia('(min-width: 40rem)');
  const marcaEixo = formatarEixo ?? formatar;
  const dados = pontos.map((ponto) => ({
    n: ponto.n,
    sem_cache: valorNaEscala(ponto.sem_cache, escala),
    com_cache: valorNaEscala(ponto.com_cache, escala),
  }));
  const finais: Record<Modo, number> = {
    sem_cache: ultimoComValor(dados, 'sem_cache'),
    com_cache: ultimoComValor(dados, 'com_cache'),
  };

  return (
    <div aria-hidden="true" className="w-full">
      <ResponsiveContainer width="100%" height={altura}>
        <LineChart
          data={dados}
          accessibilityLayer={false}
          margin={{ top: 8, right: temEspaco ? 76 : 12, bottom: 4, left: 0 }}
        >
          <CartesianGrid stroke="var(--borda)" strokeWidth={1} vertical={false} />
          <XAxis
            dataKey="n"
            type="number"
            domain={['dataMin', 'dataMax']}
            allowDecimals={false}
            tickLine={false}
            stroke="var(--borda)"
            tick={EIXO}
          />
          <YAxis
            scale={escala}
            domain={escala === 'log' ? (['auto', 'auto'] as const) : ([0, 'auto'] as const)}
            allowDataOverflow={escala === 'log'}
            tickFormatter={marcaEixo}
            tickLine={false}
            stroke="var(--borda)"
            tick={EIXO}
            width={64}
          />
          <Tooltip
            isAnimationActive={false}
            cursor={{ stroke: 'var(--borda-forte)', strokeWidth: 1 }}
            wrapperStyle={{ outline: 'none' }}
            content={({ active, label }) =>
              active && typeof label === 'number' ? (
                <Dica
                  ponto={pontos.find((item) => item.n === label)}
                  formatar={formatar}
                  grandeza={grandeza}
                />
              ) : null
            }
          />
          {MODOS.map((modo) => (
            <Line
              key={modo}
              type="monotone"
              dataKey={modo}
              name={rotuloModo(modo)}
              stroke={CORES[modo]}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              dot={false}
              activeDot={{ r: 4, stroke: 'var(--superficie)', strokeWidth: 2 }}
              connectNulls={false}
              isAnimationActive={false}
            >
              {temEspaco ? (
                /* Sem `dataKey`: com ele o Recharts ignora o acessório e
                   escreve o valor de todos os pontos. */
                <LabelList
                  position="right"
                  offset={8}
                  fill="var(--texto-suave)"
                  fontSize={12}
                  valueAccessor={(_entrada: unknown, indice: number) =>
                    indice === finais[modo] ? rotuloModo(modo) : ''
                  }
                />
              ) : null}
            </Line>
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

interface DicaProps {
  ponto: PontoGrafico | undefined;
  formatar: (valor: number) => string;
  grandeza: string;
}

function Dica({ ponto, formatar, grandeza }: DicaProps) {
  if (!ponto) return null;
  return (
    <div className="rounded-lg border border-borda bg-superficie-elevada px-3 py-2 text-sm shadow-flutuante">
      <p className="text-texto-suave">
        {grandeza} em f({ponto.n})
      </p>
      <ul className="mt-1 space-y-0.5">
        {MODOS.map((modo) => {
          const valor = ponto[modo];
          return (
            <li key={modo} className="flex items-center gap-2 whitespace-nowrap">
              <span
                aria-hidden="true"
                className={juntarClasses('h-1 w-4 shrink-0 rounded-full', CLASSES_MARCA[modo])}
              />
              <span className="text-texto-suave">{rotuloModo(modo)}</span>
              <span className="ml-auto pl-3 font-semibold tabular-nums">
                {valor === null ? 'não medido' : formatar(valor)}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
