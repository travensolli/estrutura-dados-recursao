import type { InfoSequencia, Modo } from '@sequencias/contrato';
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

function LinhaCrescimento({ modo, texto }: { modo: Modo; texto: string }) {
  return (
    <li className="grid grid-cols-[6.5rem_1fr] items-baseline gap-x-2">
      <span className="flex items-center gap-2">
        <span
          aria-hidden="true"
          className={juntarClasses('h-1 w-4 shrink-0 rounded-full', CLASSES_MARCA[modo])}
        />
        {rotuloModo(modo)}
      </span>
      <span className="text-texto-suave">{texto}</span>
    </li>
  );
}

function textoLimites(info: InfoSequencia): string {
  const { sem_cache, com_cache } = info.limites;
  return sem_cache === com_cache
    ? `Nesta demonstração n vai até ${formatarInteiro(sem_cache)} nos dois modos.`
    : `Nesta demonstração n vai até ${formatarInteiro(sem_cache)} sem cache e ${formatarInteiro(com_cache)} com cache.`;
}

function CartaoSequencia({ info }: { info: InfoSequencia }) {
  const ultimoTermo = info.primeiros_termos.length - 1;
  return (
    <Cartao as="article" titulo={info.nome} compacto className="flex h-full flex-col">
      <p className="font-mono text-lg break-words">{info.formula}</p>
      <p className="mt-1 font-mono text-sm text-texto-suave">{info.casos_base}</p>

      <p className="mt-2 text-sm">
        De f(0) a f({ultimoTermo}):{' '}
        <span className="font-mono tabular-nums">{info.primeiros_termos.join(', ')}</span>
      </p>

      <ul className="mt-2 space-y-1 text-sm">
        <LinhaCrescimento modo="sem_cache" texto={info.crescimento_sem_cache} />
        <LinhaCrescimento modo="com_cache" texto={info.crescimento_com_cache} />
      </ul>

      <p className="mt-2 text-sm text-texto-suave">{textoLimites(info)}</p>

      <GrupoBotoes className="mt-auto pt-3">
        <BotaoLink
          to={enderecoComEstado('/calcular', { sequencia: info.id })}
          variante="secundaria"
          tamanho="pequeno"
          icone="calcular"
        >
          Calcular
        </BotaoLink>
        <BotaoLink
          to={enderecoComEstado('/comparar', { sequencia: info.id })}
          variante="neutra"
          tamanho="pequeno"
          icone="comparar"
        >
          Comparar
        </BotaoLink>
        <BotaoLink
          to={enderecoComEstado('/arvore', { sequencia: info.id })}
          variante="neutra"
          tamanho="pequeno"
          icone="arvore"
        >
          Ver árvore
        </BotaoLink>
      </GrupoBotoes>
    </Cartao>
  );
}

export function PaginaInicio() {
  useTituloPagina('Início');
  const { data, isPending, isError, error, refetch } = useSequencias();

  return (
    <div className="space-y-5">
      <section aria-labelledby="titulo-pagina">
        <h1 id="titulo-pagina" className="text-2xl font-semibold sm:text-3xl">
          Recursão com e sem cache
        </h1>
        <p className="mt-2 max-w-prose text-base text-texto-suave">
          Cada invocação é contada; tempo, memória e a árvore de chamadas mostram onde o cache evita
          trabalho repetido.
        </p>
      </section>

      <section aria-labelledby="titulo-enunciado" className="flex flex-wrap items-center gap-2">
        <h2 id="titulo-enunciado" className="mr-1 text-sm font-medium text-texto-suave">
          O que o enunciado pede — e onde está:
        </h2>
        <BotaoLink
          to={enderecoComEstado('/calcular', { sequencia: 'tribonacci', n: 7 })}
          variante="neutra"
          tamanho="pequeno"
          icone="verificado"
        >
          1 · Calcular com e sem cache
        </BotaoLink>
        <BotaoLink
          to={enderecoComEstado('/comparar', { sequencia: 'tribonacci' })}
          variante="neutra"
          tamanho="pequeno"
          icone="verificado"
        >
          2 · Comparar tempo e memória
        </BotaoLink>
        <BotaoLink
          to={enderecoComEstado('/arvore', { sequencia: 'tribonacci', n: 7, modo: 'sem_cache' })}
          variante="neutra"
          tamanho="pequeno"
          icone="verificado"
        >
          3 · Árvore de chamadas
        </BotaoLink>
        <BotaoLink to="/apresentacao" variante="secundaria" tamanho="pequeno" icone="apresentacao">
          4 · Apresentação: f(7) de 46 → 16
        </BotaoLink>
      </section>

      <section aria-labelledby="titulo-sequencias">
        <h2 id="titulo-sequencias" className="text-lg font-semibold">
          As três sequências
        </h2>
        {isError ? (
          <EstadoErro erro={error} aoTentarDeNovo={() => void refetch()} className="mt-4" />
        ) : null}
        {isPending ? (
          <div className="mt-3 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
          <ul className="mt-3 grid list-none gap-4 md:grid-cols-2 lg:grid-cols-3">
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
