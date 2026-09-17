import {
  DESCRICAO_SEQUENCIAS,
  LIMITES_N,
  type LimitesN,
  type Sequencia,
} from '@sequencias/contrato';
import { useMemo } from 'react';
import { useSearchParams } from 'react-router';
import { useSequencias } from '../api/consultas';
import { ArvoreSvg } from '../arvore/ArvoreSvg';
import {
  LIMITE_NOS_TELA_MAXIMO,
  consultaValida,
  escreverConsulta,
  lerConsulta,
  validarConsulta,
} from '../arvore/consulta';
import { Aviso } from '../arvore/ui/Aviso';
import { ControlesArvore } from '../arvore/ui/ControlesArvore';
import { useArvoreComPlanoB } from '../arvore/usarArvore';
import { formatarInteiro, rotuloModo } from '../utilitarios/formatar';

const BOTAO_SECUNDARIO =
  'h-10 shrink-0 rounded-md border border-borda bg-superficie px-4 text-sm font-medium text-texto hover:bg-superficie-suave';

export function PaginaArvore() {
  const [parametros, setParametros] = useSearchParams();
  const catalogo = useSequencias();
  const consulta = lerConsulta(parametros);

  const limitesPorSequencia = useMemo(() => {
    const mapa: Record<Sequencia, LimitesN> = { ...LIMITES_N.node };
    for (const info of catalogo.data?.sequencias ?? []) mapa[info.id] = info.limites;
    return mapa;
  }, [catalogo.data]);
  const limiteNosMaximo = Math.min(
    LIMITE_NOS_TELA_MAXIMO,
    catalogo.data?.limite_nos_arvore_maximo ?? LIMITE_NOS_TELA_MAXIMO,
  );

  const erros = validarConsulta(consulta, limitesPorSequencia[consulta.sequencia], limiteNosMaximo);
  const valida = consultaValida(erros);
  const arvore = useArvoreComPlanoB(valida ? consulta : null);
  const dados = arvore.data;

  return (
    <section aria-labelledby="titulo-pagina" className="flex flex-col gap-5">
      <header>
        <h1 id="titulo-pagina" className="text-2xl font-semibold">
          Árvore de chamadas
        </h1>
        <p className="mt-1 max-w-prose text-texto-suave">
          Cada caixa é uma invocação da função. A cor mostra o argumento e a forma mostra o que
          aconteceu na chamada: caso base, cálculo ou acerto no dicionário.
        </p>
      </header>

      <ControlesArvore
        key={parametros.toString()}
        inicial={consulta}
        limitesPorSequencia={limitesPorSequencia}
        limiteNosMaximo={limiteNosMaximo}
        aoAplicar={(nova) => setParametros(escreverConsulta(nova))}
      />

      {!valida && (
        <Aviso tom="alerta" titulo="Ajuste os parâmetros para desenhar a árvore">
          {erros.n ?? erros.limite_nos}
        </Aviso>
      )}

      {valida && arvore.isPending && (
        <div
          role="status"
          className="flex h-[clamp(320px,58vh,680px)] items-center justify-center rounded-lg border border-borda bg-superficie text-texto-suave"
        >
          <span className="animate-pulse">
            Calculando {DESCRICAO_SEQUENCIAS[consulta.sequencia].nome} f({consulta.n}){' '}
            {rotuloModo(consulta.modo)}…
          </span>
        </div>
      )}

      {valida && arvore.isError && (
        <Aviso
          tom="erro"
          titulo="Não deu para montar a árvore"
          acao={
            <button
              type="button"
              className={BOTAO_SECUNDARIO}
              onClick={() => void arvore.refetch()}
            >
              Tentar de novo
            </button>
          }
        >
          {arvore.error.message}
        </Aviso>
      )}

      {dados && (
        <>
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-lg font-medium">
              {DESCRICAO_SEQUENCIAS[dados.resposta.sequencia].nome} f({dados.resposta.n}){' '}
              {rotuloModo(dados.resposta.modo)}
            </h2>
            {dados.origem === 'plano_b' && (
              <span className="inline-flex items-center rounded-full border border-alerta bg-alerta-suave px-3 py-1 text-sm">
                modo offline: calculado no navegador
              </span>
            )}
          </div>

          {dados.resposta.truncada && (
            <Aviso tom="alerta" titulo="A árvore foi cortada no limite de nós">
              {`O desenho traz os primeiros ${formatarInteiro(dados.resposta.nos_exibidos)} nós de ${formatarInteiro(dados.resposta.metricas.invocacoes)} invocações. Os nós com o selo "ocultos" escondem o resto da subárvore; os contadores continuam sendo os da execução inteira.`}
            </Aviso>
          )}

          <ArvoreSvg
            key={`${dados.resposta.sequencia}-${dados.resposta.n}-${dados.resposta.modo}-${dados.resposta.limite_nos}`}
            raiz={dados.resposta.raiz}
            metricas={dados.resposta.metricas}
            sequencia={dados.resposta.sequencia}
            n={dados.resposta.n}
            modo={dados.resposta.modo}
            truncada={dados.resposta.truncada}
            nosExibidos={dados.resposta.nos_exibidos}
          />
        </>
      )}
    </section>
  );
}
