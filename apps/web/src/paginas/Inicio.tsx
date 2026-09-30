import type { InfoSequencia, Modo } from '@sequencias/contrato';
import { useId, useState, type ReactNode } from 'react';
import { useSequencias } from '../api/consultas';
import { Botao, BotaoLink, Cartao, Esqueleto, EstadoErro } from '../componentes';
import { useTituloPagina } from '../hooks/titulo-pagina';
import { enderecoComEstado } from '../hooks/useEstadoUrl';
import { BlocoPseudocodigo } from '../inicio/BlocoPseudocodigo';
import { JanelaCodigo } from '../inicio/JanelaCodigo';
import { PainelFormulas } from '../inicio/PainelFormulas';
import { TIPOS } from '../inicio/formulas';
import { juntarClasses } from '../utilitarios/classes';
import { rotuloModo } from '../utilitarios/formatar';

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

/** Um dos dois jeitos de resolver: a definição curta ao lado do pseudocódigo. */
function BlocoModo({
  modo,
  titulo,
  children,
}: {
  modo: Modo;
  titulo: ReactNode;
  children: ReactNode;
}) {
  const idTitulo = useId();
  return (
    <section
      aria-labelledby={idTitulo}
      className="grid content-start items-start gap-x-4 gap-y-2 xl:grid-cols-[minmax(0,1fr)_auto]"
    >
      <div>
        <h2 id={idTitulo} className="flex items-center gap-2 text-lg font-semibold">
          <Marca modo={modo} />
          {titulo}
        </h2>
        <p className="mt-1 text-texto">{children}</p>
      </div>
      {/* Mesma largura nos dois blocos, para as linhas iguais ficarem na mesma coluna. */}
      <BlocoPseudocodigo modo={modo} className="xl:min-w-72" />
    </section>
  );
}

function SeloTipo({ info }: { info: InfoSequencia }) {
  const { ordem } = info;
  return (
    <span className="rounded-md bg-primaria-suave px-2 py-0.5 text-sm font-medium text-primaria">
      recursão {TIPOS[info.id].recursao} · ordem {ordem}
      <span className="sr-only">
        : {ordem} {ordem === 1 ? 'chamada recursiva' : 'chamadas recursivas'} em cada caso não base
      </span>
    </span>
  );
}

function CartaoSequencia({ info }: { info: InfoSequencia }) {
  const ultimoTermo = info.primeiros_termos.length - 1;
  const [codigoAberto, setCodigoAberto] = useState(false);
  return (
    <Cartao
      as="article"
      titulo={info.nome}
      acoes={<SeloTipo info={info} />}
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

      {/* Atalhos que já trazem a sequência escolhida: discretos, porque a navegação
          é a rota principal. O recuo alinha o texto do primeiro atalho ao conteúdo
          do cartão. */}
      <div className="mt-auto -ml-3 flex flex-wrap pt-1.5">
        <BotaoLink
          to={enderecoComEstado('/calcular', { sequencia: info.id })}
          variante="discreta"
          tamanho="pequeno"
        >
          Calcular
        </BotaoLink>
        <BotaoLink
          to={enderecoComEstado('/comparar', { sequencia: info.id })}
          variante="discreta"
          tamanho="pequeno"
        >
          Comparar
        </BotaoLink>
        <BotaoLink
          to={enderecoComEstado('/arvore', { sequencia: info.id })}
          variante="discreta"
          tamanho="pequeno"
        >
          Árvore
        </BotaoLink>
        <Botao
          variante="discreta"
          tamanho="pequeno"
          aria-haspopup="dialog"
          aria-label={`Código de ${info.nome} em TypeScript`}
          onClick={() => setCodigoAberto(true)}
        >
          Código
        </Botao>
      </div>
      <JanelaCodigo
        sequencia={info.id}
        aberta={codigoAberto}
        aoFechar={() => setCodigoAberto(false)}
      />
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
        {/* A definição do material de apoio; os dois blocos a aplicam às sequências dos cartões. */}
        <p className="mt-1 leading-prosa text-texto">
          <strong className="font-semibold">Problemas recursivos</strong> são aqueles em que uma
          determinada instância do problema contém uma instância “menor” do mesmo problema.
        </p>
        <div className="mt-2 grid gap-x-8 gap-y-4 md:grid-cols-2">
          <BlocoModo modo="sem_cache" titulo="Sem cache">
            A instância pequena, o <strong className="font-semibold">caso base</strong> (
            <span className="whitespace-nowrap">“com f(0) = …”</span> nos cartões), sai direto. As
            maiores chamam a função para os k termos anteriores, a{' '}
            <strong className="font-semibold">ordem</strong> do cartão, e combinam. Com k ≥ 2 as
            chamadas se repetem: custo <strong className="font-semibold">exponencial</strong>.
          </BlocoModo>
          <BlocoModo modo="com_cache" titulo="Com cache (memoização)">
            Antes de chamar de novo, a função consulta o cache (linhas marcadas): se f(n) já foi
            calculado, devolve o valor guardado. Cada f(n) é calculado uma vez: custo{' '}
            <strong className="font-semibold">linear</strong>. No Fatorial nada se repete, e não há
            ganho.
          </BlocoModo>
        </div>
      </section>

      <section aria-label="As três sequências">
        {isError ? (
          <EstadoErro erro={error} aoTentarDeNovo={() => void refetch()} className="mt-4" />
        ) : null}
        {isPending ? (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
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
          <ul className="grid list-none gap-3 md:grid-cols-2 lg:grid-cols-3">
            {data.sequencias.map((info) => (
              <li key={info.id} className="min-w-0">
                <CartaoSequencia info={info} />
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      <PainelFormulas />
    </div>
  );
}
