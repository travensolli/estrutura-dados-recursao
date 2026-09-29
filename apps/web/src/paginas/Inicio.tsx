import type { InfoSequencia, Modo } from '@sequencias/contrato';
import type { ReactNode } from 'react';
import { useSequencias } from '../api/consultas';
import { BotaoLink, Cartao, Esqueleto, EstadoErro, GrupoBotoes } from '../componentes';
import { useTituloPagina } from '../hooks/titulo-pagina';
import { enderecoComEstado } from '../hooks/useEstadoUrl';
import { juntarClasses } from '../utilitarios/classes';
import { formatarInteiro, rotuloModo } from '../utilitarios/formatar';

const CLASSES_MARCA: Record<Modo, string> = {
  sem_cache: 'bg-serie-sem-cache',
  com_cache: 'bg-serie-com-cache',
};

function Marca({ modo }: { modo: Modo }) {
  return (
    <span
      aria-hidden="true"
      className={juntarClasses('h-1 w-4 shrink-0 rounded-full', CLASSES_MARCA[modo])}
    />
  );
}

function LinhaCrescimento({ modo, texto }: { modo: Modo; texto: string }) {
  return (
    <li className="grid grid-cols-[6.5rem_1fr] items-baseline gap-x-2">
      <span className="flex items-center gap-2">
        <Marca modo={modo} />
        {rotuloModo(modo)}
      </span>
      <span className="text-texto-suave">{texto}</span>
    </li>
  );
}

function LinhaMotivacao({ modo, children }: { modo: Modo; children: ReactNode }) {
  return (
    <li className="flex items-baseline gap-2">
      <span className="flex h-5 shrink-0 items-center">
        <Marca modo={modo} />
      </span>
      <span>{children}</span>
    </li>
  );
}

function SeloOrdem({ ordem }: { ordem: number }) {
  return (
    <span className="rounded-md bg-primaria-suave px-2 py-0.5 text-sm font-medium text-primaria">
      ordem {ordem}
      <span className="sr-only">
        : {ordem} {ordem === 1 ? 'chamada recursiva' : 'chamadas recursivas'} em cada caso não base
      </span>
    </span>
  );
}

function textoLimites(info: InfoSequencia): string {
  const { sem_cache, com_cache } = info.limites;
  return sem_cache === com_cache
    ? `Aqui n vai até ${formatarInteiro(sem_cache)} nos dois modos.`
    : `Aqui n vai até ${formatarInteiro(sem_cache)} sem cache e ${formatarInteiro(com_cache)} com cache.`;
}

function CartaoSequencia({ info }: { info: InfoSequencia }) {
  const ultimoTermo = info.primeiros_termos.length - 1;
  return (
    <Cartao
      as="article"
      titulo={info.nome}
      acoes={<SeloOrdem ordem={info.ordem} />}
      compacto
      className="flex h-full flex-col"
    >
      <p className="font-mono text-base break-words">{info.formula}</p>
      <p className="mt-1 font-mono text-sm text-texto-suave">com {info.casos_base}</p>

      <p className="mt-1 text-sm">
        De f(0) a f({ultimoTermo}):{' '}
        <span className="font-mono tabular-nums">{info.primeiros_termos.join(', ')}</span>
      </p>

      <ul className="mt-1 space-y-1 text-sm">
        <LinhaCrescimento modo="sem_cache" texto={info.crescimento_sem_cache} />
        <LinhaCrescimento modo="com_cache" texto={info.crescimento_com_cache} />
      </ul>

      <p className="mt-1 text-sm text-texto-suave">{textoLimites(info)}</p>

      <GrupoBotoes className="mt-auto pt-2">
        <BotaoLink
          to={enderecoComEstado('/calcular', { sequencia: info.id })}
          variante="secundaria"
          tamanho="pequeno"
        >
          Calcular
        </BotaoLink>
        <BotaoLink
          to={enderecoComEstado('/comparar', { sequencia: info.id })}
          variante="neutra"
          tamanho="pequeno"
        >
          Comparar
        </BotaoLink>
        <BotaoLink
          to={enderecoComEstado('/arvore', { sequencia: info.id })}
          variante="neutra"
          tamanho="pequeno"
        >
          Árvore
        </BotaoLink>
      </GrupoBotoes>
    </Cartao>
  );
}

export function PaginaInicio() {
  useTituloPagina('Início');
  const { data, isPending, isError, error, refetch } = useSequencias();

  return (
    <div className="space-y-3">
      <section aria-labelledby="titulo-pagina">
        <h1 id="titulo-pagina" className="text-2xl font-semibold">
          Recursão com e sem cache
        </h1>
        <ul className="mt-1 space-y-0.5 text-sm text-texto-suave">
          <LinhaMotivacao modo="sem_cache">
            <strong className="font-semibold text-texto">Sem cache</strong>, cada chamada que não é
            caso base abre uma chamada por termo anterior — a <em>ordem</em> da recorrência. Com
            ordem 2 ou mais, os subproblemas se repetem e o custo é exponencial.
          </LinhaMotivacao>
          <LinhaMotivacao modo="com_cache">
            <strong className="font-semibold text-texto">Com cache</strong> (memoização), cada f(k)
            acima dos casos base é calculado uma vez e guardado; quando se repete, a chamada só
            consulta o cache, e o custo vira linear.
          </LinhaMotivacao>
        </ul>
      </section>

      <section aria-labelledby="titulo-enunciado" className="flex flex-wrap items-center gap-2">
        <h2 id="titulo-enunciado" className="mr-1 text-sm font-medium text-texto-suave">
          O enunciado:
        </h2>
        <BotaoLink
          to={enderecoComEstado('/calcular', { sequencia: 'tribonacci', n: 7, modo: 'comparar' })}
          variante="neutra"
          tamanho="pequeno"
        >
          1 · Calcular com e sem cache
        </BotaoLink>
        <BotaoLink
          to={enderecoComEstado('/comparar', { sequencia: 'tribonacci' })}
          variante="neutra"
          tamanho="pequeno"
        >
          2 · Comparar tempo e memória
        </BotaoLink>
        <BotaoLink
          to={enderecoComEstado('/arvore', { sequencia: 'tribonacci', n: 7, modo: 'sem_cache' })}
          variante="neutra"
          tamanho="pequeno"
        >
          3 · Árvore de chamadas
        </BotaoLink>
        <BotaoLink to="/apresentacao" variante="secundaria" tamanho="pequeno">
          4 · Apresentação do f(7)
        </BotaoLink>
      </section>

      <section aria-label="As três sequências">
        {isError ? (
          <EstadoErro erro={error} aoTentarDeNovo={() => void refetch()} className="mt-4" />
        ) : null}
        {isPending ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((indice) => (
              <Esqueleto
                key={indice}
                linhas={5}
                altura="h-6"
                rotulo="Carregando as sequências"
                className="rounded-xl border border-borda bg-superficie p-4"
              />
            ))}
          </div>
        ) : null}
        {data ? (
          <ul className="grid list-none gap-4 md:grid-cols-2 lg:grid-cols-3">
            {data.sequencias.map((info) => (
              <li key={info.id} className="min-w-0">
                <CartaoSequencia info={info} />
              </li>
            ))}
          </ul>
        ) : null}
      </section>
    </div>
  );
}
