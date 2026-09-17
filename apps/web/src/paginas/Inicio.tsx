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
    <li className="grid grid-cols-[1rem_5.5rem_1fr] items-baseline gap-x-2">
      <span
        aria-hidden="true"
        className={juntarClasses('h-1 w-4 self-center rounded-full', CLASSES_MARCA[modo])}
      />
      <span>{rotuloModo(modo)}</span>
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
    <Cartao as="article" titulo={info.nome} className="flex h-full flex-col">
      <p className="font-mono text-lg break-words">{info.formula}</p>
      <p className="mt-1 font-mono text-sm text-texto-suave">{info.casos_base}</p>

      <p className="mt-4 text-sm">
        De f(0) a f({ultimoTermo}):{' '}
        <span className="font-mono tabular-nums">{info.primeiros_termos.join(', ')}</span>
      </p>

      <ul className="mt-4 space-y-1 text-sm">
        <LinhaCrescimento modo="sem_cache" texto={info.crescimento_sem_cache} />
        <LinhaCrescimento modo="com_cache" texto={info.crescimento_com_cache} />
      </ul>

      <p className="mt-3 text-sm text-texto-suave">{textoLimites(info)}</p>

      <GrupoBotoes className="mt-auto pt-5">
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
    <div className="space-y-10">
      <section aria-labelledby="titulo-pagina">
        <h1 id="titulo-pagina" className="text-3xl font-semibold sm:text-4xl">
          Recursão com e sem cache
        </h1>
        <p className="mt-3 max-w-prose text-lg text-texto-suave">
          Escolha uma sequência e veja f(n) ser calculado por recursão. Cada invocação é contada, os
          dois modos são medidos lado a lado em tempo e memória, e a árvore de chamadas mostra onde
          o cache evita trabalho repetido.
        </p>
      </section>

      <section aria-labelledby="titulo-sequencias">
        <h2 id="titulo-sequencias" className="text-xl font-semibold">
          As três sequências
        </h2>
        {isError ? (
          <EstadoErro erro={error} aoTentarDeNovo={() => void refetch()} className="mt-4" />
        ) : null}
        {isPending ? (
          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {[0, 1, 2].map((indice) => (
              <Esqueleto
                key={indice}
                linhas={5}
                altura="h-6"
                rotulo="Carregando as sequências"
                className="rounded-xl border border-borda bg-superficie p-4 sm:p-6"
              />
            ))}
          </div>
        ) : null}
        {data ? (
          <ul className="mt-4 grid list-none gap-4 md:grid-cols-2 xl:grid-cols-3">
            {data.sequencias.map((info) => (
              <li key={info.id} className="min-w-0">
                <CartaoSequencia info={info} />
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      <Cartao
        as="section"
        titulo="Modo apresentação"
        descricao="Tela cheia, números grandes e as duas execuções lado a lado, para projetar em sala."
        destaque
        acoes={
          <BotaoLink to="/apresentacao" icone="apresentacao">
            Abrir modo apresentação
          </BotaoLink>
        }
      />
    </div>
  );
}
