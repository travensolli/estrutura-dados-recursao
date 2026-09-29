import {
  DESCRICAO_SEQUENCIAS,
  N_MAXIMO_ESTIMATIVA,
  SEQUENCIAS,
  type CalcularResposta,
  type Metricas,
  type Modo,
  type Sequencia,
} from '@sequencias/contrato';
import { useQueryClient } from '@tanstack/react-query';
import { useMemo, useState, type FormEvent } from 'react';
import type { CalcularEntrada } from '../api/cliente';
import {
  chaves,
  opcoesEstimativa,
  useCalcular,
  useEstimativa,
  useSequencias,
} from '../api/consultas';
import {
  Alerta,
  BarraComparativa,
  BarraProporcao,
  Botao,
  BotaoLink,
  CampoNumero,
  Cartao,
  Detalhes,
  DialogoConfirmacao,
  Esqueleto,
  EstadoErro,
  EstadoVazio,
  GrupoBotoes,
  ListaMetricas,
  Metrica,
  NumeroGrande,
  RotuloModo,
  SeletorSegmentado,
  Selo,
  SeloModo,
  Tabela,
  type ColunaTabela,
  type OpcaoSegmento,
} from '../componentes';
import { useTituloPagina } from '../hooks/titulo-pagina';
import {
  enderecoComEstado,
  modoDeReferencia,
  useEstadoUrl,
  type EstadoUrl,
  type ModoTela,
  type OpcoesEstadoUrl,
} from '../hooks/useEstadoUrl';
import { formatarInteiro, formatarTempoNs, rotuloModo } from '../utilitarios/formatar';
import { validarInteiro } from '../utilitarios/validacao';

const OPCOES_URL: OpcoesEstadoUrl = {};

const OPCOES_SEQUENCIA: ReadonlyArray<OpcaoSegmento<Sequencia>> = SEQUENCIAS.map((id) => ({
  valor: id,
  rotulo: DESCRICAO_SEQUENCIAS[id].nome,
}));

const OPCOES_MODO: ReadonlyArray<OpcaoSegmento<ModoTela>> = [
  { valor: 'sem_cache', rotulo: 'Sem cache', marca: 'sem-cache' },
  { valor: 'com_cache', rotulo: 'Com cache', marca: 'com-cache' },
  { valor: 'comparar', rotulo: 'Comparar', icone: 'comparar' },
];

interface DescricaoMetrica {
  chave: string;
  rotulo: string;
  rotuloComCache?: string;
  detalhe: string;
  detalheSemCache?: string;
  detalheComCache?: string;
  valor: (metricas: Metricas) => number;
}

const METRICAS: DescricaoMetrica[] = [
  {
    chave: 'invocacoes',
    rotulo: 'Invocações',
    detalhe: 'Conta a chamada raiz, os casos base e os acertos de cache.',
    valor: (metricas) => metricas.invocacoes,
  },
  {
    chave: 'recursivas',
    rotulo: 'Chamadas recursivas',
    detalhe: 'As invocações menos a chamada raiz.',
    valor: (metricas) => metricas.chamadas_recursivas,
  },
  {
    chave: 'casos_base',
    rotulo: 'Casos base',
    detalhe: 'Chamadas que já tinham resposta na definição e pararam ali.',
    valor: (metricas) => metricas.casos_base,
  },
  {
    chave: 'calculados',
    rotulo: 'Calculados',
    rotuloComCache: 'Calculados (faltas de cache)',
    detalhe: 'Chamadas que executaram a fórmula; com cache, as faltas de cache.',
    detalheSemCache: 'Chamadas que executaram a fórmula.',
    detalheComCache: 'Chamadas que não estavam no cache e executaram a fórmula.',
    valor: (metricas) => metricas.calculados,
  },
  {
    chave: 'acertos',
    rotulo: 'Acertos de cache',
    detalhe: 'Chamadas que encontraram o valor pronto e não desceram.',
    detalheSemCache: 'Sem cache nada é reaproveitado.',
    valor: (metricas) => metricas.acertos_cache,
  },
  {
    chave: 'entradas',
    rotulo: 'Entradas no cache',
    detalhe: 'Valores guardados ao fim da execução; casos base não entram.',
    detalheSemCache: 'Sem cache nada é guardado.',
    valor: (metricas) => metricas.entradas_cache,
  },
  {
    chave: 'profundidade',
    rotulo: 'Profundidade máxima',
    detalhe: 'Maior número de chamadas ao mesmo tempo na pilha, contando a raiz.',
    valor: (metricas) => metricas.profundidade_maxima,
  },
];

function rotuloMetrica(descricao: DescricaoMetrica, modo: Modo): string {
  return modo === 'com_cache' ? (descricao.rotuloComCache ?? descricao.rotulo) : descricao.rotulo;
}

function detalheMetrica(descricao: DescricaoMetrica, modo: Modo): string {
  const especifico = modo === 'com_cache' ? descricao.detalheComCache : descricao.detalheSemCache;
  return especifico ?? descricao.detalhe;
}

function MetricasExecucao({ resposta }: { resposta: CalcularResposta }) {
  return (
    <ListaMetricas colunas={4}>
      {METRICAS.map((descricao, indice) => (
        <Metrica
          key={descricao.chave}
          identificador={descricao.chave}
          rotulo={rotuloMetrica(descricao, resposta.modo)}
          valor={formatarInteiro(descricao.valor(resposta.metricas))}
          detalhe={detalheMetrica(descricao, resposta.modo)}
          marca={
            indice === 0 ? (resposta.modo === 'sem_cache' ? 'sem-cache' : 'com-cache') : undefined
          }
          destaque={indice === 0}
        />
      ))}
    </ListaMetricas>
  );
}

function TabelaMetricas({ respostas }: { respostas: CalcularResposta[] }) {
  const colunas: ColunaTabela<DescricaoMetrica>[] = [
    {
      chave: 'metrica',
      rotulo: 'Métrica',
      cabecalhoDeLinha: true,
      conteudo: (linha) => (
        <>
          <span className="block">{linha.rotulo}</span>
          <span className="hidden text-xs font-normal text-texto-suave sm:block">
            {linha.detalhe}
          </span>
        </>
      ),
    },
    ...respostas.map((resposta) => ({
      chave: resposta.modo,
      rotulo: <RotuloModo modo={resposta.modo} />,
      numerico: true,
      className: 'w-20 sm:w-28',
      conteudo: (linha: DescricaoMetrica) => formatarInteiro(linha.valor(resposta.metricas)),
    })),
  ];
  return (
    <Tabela
      legenda="Métricas de contagem nos dois modos"
      legendaVisivel
      colunas={colunas}
      linhas={METRICAS}
      chave={(linha) => linha.chave}
      destacar={(linha) => linha.chave === 'invocacoes'}
      alturaMaxima="32vh"
    />
  );
}

interface LinhaArgumento {
  argumento: number;
  valores: number[];
}

function TabelaArgumentos({ respostas }: { respostas: CalcularResposta[] }) {
  const modos = respostas.map((resposta) => resposta.modo);
  const contagens = respostas.map(
    (resposta) =>
      new Map(
        resposta.metricas.invocacoes_por_argumento.map((item) => [item.argumento, item.invocacoes]),
      ),
  );
  const argumentos = [...new Set(contagens.flatMap((mapa) => [...mapa.keys()]))].sort(
    (a, b) => b - a,
  );
  const linhas: LinhaArgumento[] = argumentos.map((argumento) => ({
    argumento,
    valores: contagens.map((mapa) => mapa.get(argumento) ?? 0),
  }));
  const todos = linhas.flatMap((linha) => linha.valores);
  const maximo = Math.max(1, ...todos);
  // Barra só informa quando há diferença entre os argumentos.
  const comBarras = todos.some((valor) => valor !== maximo);

  const colunas: ColunaTabela<LinhaArgumento>[] = [
    {
      chave: 'argumento',
      rotulo: 'Argumento',
      cabecalhoDeLinha: true,
      className: 'w-20 sm:w-28',
      conteudo: (linha) => <span className="font-mono">f({linha.argumento})</span>,
    },
  ];
  modos.forEach((modo, indice) => {
    colunas.push({
      chave: `invocacoes-${modo}`,
      rotulo: modos.length > 1 ? <RotuloModo modo={modo} /> : 'Invocações',
      numerico: true,
      className: 'w-20 sm:w-28',
      conteudo: (linha) => formatarInteiro(linha.valores[indice] ?? 0),
    });
    if (!comBarras) return;
    colunas.push({
      chave: `barra-${modo}`,
      rotulo: <span className="sr-only">Proporção {rotuloModo(modo)}</span>,
      className: 'w-full',
      conteudo: (linha) => (
        <BarraProporcao valor={linha.valores[indice] ?? 0} maximo={maximo} modo={modo} />
      ),
    });
  });

  const totais = respostas
    .map(
      (resposta) => `${formatarInteiro(resposta.metricas.invocacoes)} ${rotuloModo(resposta.modo)}`,
    )
    .join(' e ');

  return (
    <Detalhes resumo={<span className="text-base font-semibold">Invocações por argumento</span>}>
      <Tabela
        legenda="Invocações por argumento, do maior para o menor"
        colunas={colunas}
        linhas={linhas}
        chave={(linha) => linha.argumento}
        alturaMaxima="38vh"
      />
      <p className="mt-2 text-sm text-texto-suave">Somando todos os argumentos: {totais}.</p>
    </Detalhes>
  );
}

/** Valores enormes viram contagem de dígitos: ninguém ouve 26 algarismos. */
function valorFalado(metricas: Metricas): string {
  return metricas.digitos <= 12
    ? formatarInteiro(metricas.valor)
    : `um número de ${formatarInteiro(metricas.digitos)} dígitos`;
}

/** Relógios do navegador arredondam para baixo; zero vira texto em vez de "0 ns". */
function duracaoLegivel(duracaoMs: number): string {
  return duracaoMs > 0
    ? formatarTempoNs(duracaoMs * 1_000_000)
    : 'menos que a resolução do relógio';
}

/** Parâmetros de uma execução já disparada; repetições não valem aqui. */
type Pedido = Pick<EstadoUrl, 'sequencia' | 'n' | 'modo'>;

function entradaPara(execucao: Pedido | null, alvo: Modo): CalcularEntrada | null {
  if (execucao === null) return null;
  if (execucao.modo !== 'comparar' && execucao.modo !== alvo) return null;
  return { sequencia: execucao.sequencia, n: execucao.n, modo: alvo };
}

function mesmoPedido(a: Pedido | null, b: Pedido): boolean {
  return a !== null && a.sequencia === b.sequencia && a.n === b.n && a.modo === b.modo;
}

export function PaginaCalcular() {
  const { estado, definir } = useEstadoUrl(OPCOES_URL);
  const { sequencia, n, modo } = estado;
  const nome = DESCRICAO_SEQUENCIAS[sequencia].nome;
  useTituloPagina(`Calcular ${nome} f(${n})`);

  const clienteConsultas = useQueryClient();
  const sequencias = useSequencias();
  const info = sequencias.data?.sequencias.find((item) => item.id === sequencia);
  const modoReferencia = modoDeReferencia(modo);
  const limite = info?.limites[modoReferencia];

  const [rascunho, setRascunho] = useState(() => String(n));
  const [nEcoado, setNEcoado] = useState(n);
  if (n !== nEcoado) {
    setNEcoado(n);
    setRascunho(String(n));
  }

  const [execucao, setExecucao] = useState<Pedido | null>(null);
  const [confirmando, setConfirmando] = useState(false);
  const [verificando, setVerificando] = useState(false);
  const [cancelado, setCancelado] = useState(false);

  const consultaEstimativa = useMemo(
    () => ({ sequencia, n, modo: modoReferencia }),
    [sequencia, n, modoReferencia],
  );
  const estimativa = useEstimativa(consultaEstimativa);
  const previsao = estimativa.data;

  const entradaSemCache = useMemo(() => entradaPara(execucao, 'sem_cache'), [execucao]);
  const entradaComCache = useMemo(() => entradaPara(execucao, 'com_cache'), [execucao]);
  const calculoSemCache = useCalcular(entradaSemCache);
  const calculoComCache = useCalcular(entradaComCache);

  const consultas = [
    { entrada: entradaSemCache, consulta: calculoSemCache },
    { entrada: entradaComCache, consulta: calculoComCache },
  ].filter((item) => item.entrada !== null);

  const carregando = consultas.some((item) => item.consulta.isFetching);
  const erro = consultas.find((item) => item.consulta.error)?.consulta.error ?? null;
  const respostas = consultas.flatMap((item) => (item.consulta.data ? [item.consulta.data] : []));
  const prontos = !carregando && erro === null && respostas.length === consultas.length;
  const resultado = prontos && respostas.length > 0 ? respostas : null;
  const primeira = resultado?.[0];
  const segunda = resultado?.[1];
  const evitadas =
    primeira && segunda ? primeira.metricas.invocacoes - segunda.metricas.invocacoes : 0;

  const rascunhoValido = validarInteiro(rascunho, {
    minimo: 0,
    maximo: N_MAXIMO_ESTIMATIVA,
  }).valido;
  const limiteExibido = previsao?.limite_n ?? limite;
  const bloqueado = previsao?.dentro_do_limite === false || (limite !== undefined && n > limite);
  const podeCalcular = rascunhoValido && !bloqueado && !carregando && !verificando;
  const desatualizado = execucao !== null && !mesmoPedido(execucao, estado);

  function iniciar() {
    setCancelado(false);
    setConfirmando(false);
    if (mesmoPedido(execucao, estado)) {
      void calculoSemCache.refetch();
      void calculoComCache.refetch();
      return;
    }
    setExecucao({ sequencia, n, modo });
  }

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (!podeCalcular) return;
    setVerificando(true);
    try {
      const prevista = await clienteConsultas.fetchQuery(opcoesEstimativa(consultaEstimativa));
      if (!prevista.dentro_do_limite) return;
      if (prevista.pesado) {
        setConfirmando(true);
        return;
      }
      iniciar();
    } catch {
      iniciar();
    } finally {
      setVerificando(false);
    }
  }

  async function cancelar() {
    await Promise.all(
      consultas.map((item) =>
        clienteConsultas.cancelQueries({
          queryKey: chaves.calcular(item.entrada as CalcularEntrada),
        }),
      ),
    );
    setExecucao(null);
    setCancelado(true);
  }

  function aoMudarN(texto: string) {
    setRascunho(texto);
    const conferido = validarInteiro(texto, { minimo: 0, maximo: N_MAXIMO_ESTIMATIVA });
    if (conferido.valido) {
      setNEcoado(conferido.valor);
      definir({ n: conferido.valor }, { substituir: true });
    }
  }

  const resumoAcessivel =
    resultado && primeira
      ? `${DESCRICAO_SEQUENCIAS[primeira.sequencia].nome} f(${primeira.n}) = ${valorFalado(primeira.metricas)}. ${resultado
          .map(
            (item) =>
              `${formatarInteiro(item.metricas.invocacoes)} invocações ${rotuloModo(item.modo)}`,
          )
          .join(', ')}.`
      : '';

  return (
    <div className="space-y-4">
      <section aria-labelledby="titulo-pagina">
        <h1 id="titulo-pagina" className="text-2xl font-semibold">
          Calcular
        </h1>
        <p className="mt-1 text-sm text-texto-suave">
          Escolha a sequência, o n e o modo: o resultado traz o valor exato e as contagens da
          execução instrumentada.
        </p>
      </section>

      <p role="status" aria-live="polite" className="sr-only">
        {resumoAcessivel}
      </p>

      <Cartao as="section" aria-label="O que calcular" compacto>
        <form
          onSubmit={(evento) => void enviar(evento)}
          className="flex flex-wrap items-end gap-x-5 gap-y-3"
        >
          <SeletorSegmentado
            className="min-w-0"
            rotulo="Sequência"
            valor={sequencia}
            aoMudar={(valor) => definir({ sequencia: valor })}
            opcoes={OPCOES_SEQUENCIA}
          />
          <SeletorSegmentado
            className="min-w-0"
            rotulo="Modo"
            valor={modo}
            aoMudar={(valor) => definir({ modo: valor })}
            opcoes={OPCOES_MODO}
            empilharNoCelular
          />
          <CampoNumero
            className="w-32"
            rotulo="n"
            valor={rascunho}
            aoMudar={aoMudarN}
            minimo={0}
            maximo={limite}
            ajuda={modo === 'comparar' ? 'O limite é o do modo sem cache.' : undefined}
          />
          <GrupoBotoes>
            <Botao
              type="submit"
              tamanho="medio"
              icone="calcular"
              carregando={carregando || verificando}
              rotuloCarregando={carregando ? 'Calculando' : 'Conferindo o tamanho'}
              disabled={!podeCalcular}
            >
              Calcular
            </Botao>
            {carregando ? (
              <Botao
                variante="neutra"
                tamanho="medio"
                icone="cancelar"
                onClick={() => void cancelar()}
              >
                Cancelar
              </Botao>
            ) : null}
          </GrupoBotoes>
          <p className="min-h-5 basis-full text-sm text-texto-suave">
            {previsao
              ? `Previsão para f(${previsao.n}) ${rotuloModo(previsao.modo)}: ${formatarInteiro(previsao.invocacoes_previstas)} invocações e profundidade ${formatarInteiro(previsao.profundidade_prevista)}.`
              : null}
          </p>
        </form>
      </Cartao>

      {bloqueado ? (
        <Alerta
          tipo="erro"
          titulo="Esse n passa do limite desta demonstração"
          acoes={
            limiteExibido !== undefined ? (
              <Botao
                variante="secundaria"
                tamanho="pequeno"
                icone="reduzir"
                onClick={() => definir({ n: limiteExibido })}
              >
                Usar n = {formatarInteiro(limiteExibido)}
              </Botao>
            ) : null
          }
        >
          <p>
            Para {nome} {rotuloModo(modoReferencia)}, o maior n permitido é{' '}
            {limiteExibido === undefined ? 'menor que o pedido' : formatarInteiro(limiteExibido)}.
            Acima disso a recursão passa do tempo e da pilha disponíveis.
          </p>
        </Alerta>
      ) : null}

      {!bloqueado && previsao?.aviso ? (
        <Alerta tipo="alerta" titulo="Cálculo pesado">
          <p>{previsao.aviso}</p>
        </Alerta>
      ) : null}

      {cancelado ? (
        <Alerta tipo="alerta" titulo="Cálculo cancelado">
          <p>Nada foi medido. Ajuste o n ou o modo e calcule de novo.</p>
        </Alerta>
      ) : null}

      {erro !== null ? (
        <EstadoErro
          erro={erro}
          aoTentarDeNovo={() => iniciar()}
          aoReduzirN={limiteExibido === undefined ? undefined : () => definir({ n: limiteExibido })}
        />
      ) : null}

      <section aria-labelledby="titulo-resultado" className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="titulo-resultado" className="text-xl font-semibold">
            Resultado
          </h2>
          {execucao ? (
            <div className="flex flex-wrap items-center gap-2">
              <Selo>
                {DESCRICAO_SEQUENCIAS[execucao.sequencia].nome} f({execucao.n})
              </Selo>
              {respostas.map((resposta) => (
                <SeloModo key={resposta.modo} modo={resposta.modo} />
              ))}
            </div>
          ) : null}
        </div>

        {carregando ? <Esqueleto linhas={4} altura="h-16" rotulo="Calculando" /> : null}

        {execucao === null && !carregando ? (
          <EstadoVazio
            icone="calcular"
            titulo="Nenhum cálculo ainda"
            descricao="Escolha os parâmetros e toque em Calcular: aparecem o valor exato, as contagens e as invocações por argumento."
          />
        ) : null}

        {resultado && primeira ? (
          <div className="space-y-4">
            {desatualizado ? (
              <p className="text-sm text-texto-suave">
                O formulário mudou depois deste resultado. Toque em Calcular para atualizar.
              </p>
            ) : null}

            <NumeroGrande
              valor={primeira.metricas.valor}
              rotulo={`${DESCRICAO_SEQUENCIAS[primeira.sequencia].nome} f(${primeira.n}) vale`}
              nome={`f(${primeira.n})`}
              descricao={
                resultado.length > 1
                  ? 'Os dois modos chegam ao mesmo valor: o cache muda o caminho, nunca o resultado.'
                  : undefined
              }
            />

            {segunda ? (
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <Metrica
                    rotulo="Chamadas evitadas pelo cache"
                    valor={formatarInteiro(evitadas)}
                    destaque
                    detalhe={
                      evitadas > 0
                        ? `${formatarInteiro(primeira.metricas.invocacoes)} invocações sem cache contra ${formatarInteiro(segunda.metricas.invocacoes)} com cache.`
                        : 'Nenhum argumento se repetiu nesta execução, então não havia o que reaproveitar.'
                    }
                  />
                  <div className="rounded-xl border border-borda bg-superficie p-4">
                    <BarraComparativa
                      titulo="Invocações por modo"
                      series={[
                        {
                          modo: 'sem_cache',
                          valor: primeira.metricas.invocacoes,
                          texto: formatarInteiro(primeira.metricas.invocacoes),
                        },
                        {
                          modo: 'com_cache',
                          valor: segunda.metricas.invocacoes,
                          texto: formatarInteiro(segunda.metricas.invocacoes),
                        },
                      ]}
                    />
                  </div>
                </div>
                <TabelaMetricas respostas={resultado} />
              </div>
            ) : (
              <section aria-label={`Métricas ${rotuloModo(primeira.modo)}`}>
                <MetricasExecucao resposta={primeira} />
              </section>
            )}

            <TabelaArgumentos respostas={resultado} />

            <p className="flex flex-wrap gap-x-2 text-sm text-texto-suave">
              <span>
                Duração desta execução:{' '}
                {resultado
                  .map(
                    (resposta) =>
                      `${duracaoLegivel(resposta.duracao_ms)} ${rotuloModo(resposta.modo)}`,
                  )
                  .join(' e ')}
                .
              </span>
              <span>
                É uma medida única, só para dar ordem de grandeza: não é benchmark. A tela Comparar
                repete a execução e mostra mediana, desvio e memória.
              </span>
            </p>

            <GrupoBotoes>
              {resultado.map((resposta) => (
                <BotaoLink
                  key={resposta.modo}
                  variante="secundaria"
                  icone="arvore"
                  to={enderecoComEstado('/arvore', {
                    sequencia: resposta.sequencia,
                    n: resposta.n,
                    modo: resposta.modo,
                  })}
                >
                  {resultado.length > 1
                    ? `Ver árvore ${rotuloModo(resposta.modo)}`
                    : 'Ver árvore desta execução'}
                </BotaoLink>
              ))}
            </GrupoBotoes>
          </div>
        ) : null}
      </section>

      <DialogoConfirmacao
        aberto={confirmando}
        aoFechar={() => setConfirmando(false)}
        aoConfirmar={() => iniciar()}
        titulo="Este cálculo é pesado"
        descricao={
          previsao
            ? `${nome} f(${previsao.n}) ${rotuloModo(previsao.modo)} deve fazer ${formatarInteiro(previsao.invocacoes_previstas)} invocações.`
            : undefined
        }
        rotuloConfirmar="Calcular mesmo assim"
        rotuloCancelar="Voltar e ajustar"
      >
        <p className="text-texto-suave">
          A tela pode ficar parada por alguns segundos. Reduzir o n ou usar o modo com cache traz o
          mesmo valor bem mais rápido.
        </p>
      </DialogoConfirmacao>
    </div>
  );
}
