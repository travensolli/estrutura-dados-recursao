import {
  DESCRICAO_SEQUENCIAS,
  LIMITES_N,
  type LimitesN,
  type Sequencia,
} from '@sequencias/contrato';
import { useMemo } from 'react';
import { useSearchParams } from 'react-router';
import { useSequencias } from '../api/consultas';
import { ALTURA_DESENHO_CAIXA } from '../arvore/layout';
import { VisaoArvore } from '../arvore/VisaoArvore';
import {
  LIMITE_NOS_TELA_MAXIMO,
  consultaValida,
  escreverConsulta,
  lerConsulta,
  validarConsulta,
} from '../arvore/consulta';
import { Aviso } from '../arvore/ui/Aviso';
import { Contadores } from '../arvore/ui/Contadores';
import { ControlesArvore } from '../arvore/ui/ControlesArvore';
import { useArvoreComPlanoB } from '../arvore/usarArvore';
import { Botao } from '../componentes';
import { formatarInteiro, primeirosNos, rotuloModo } from '../utilitarios/formatar';

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
    <div className="flex flex-col gap-3 lg:grid lg:grid-cols-[260px_minmax(0,1fr)] lg:items-start lg:gap-x-5">
      <section
        aria-labelledby="titulo-pagina"
        className="space-y-2 lg:border-r lg:border-borda lg:pr-5"
      >
        <h1 id="titulo-pagina" className="text-xl font-semibold">
          Árvore de chamadas
        </h1>
        <p className="text-sm text-texto-suave">
          Cada caixa é uma invocação: a cor é o argumento e a forma, o que a chamada fez.
        </p>
        <ControlesArvore
          key={parametros.toString()}
          inicial={consulta}
          limitesPorSequencia={limitesPorSequencia}
          limiteNosMaximo={limiteNosMaximo}
          aoAplicar={(nova) => setParametros(escreverConsulta(nova))}
        />

        {/* Os números do que está desenhado ficam aqui, visíveis no desenho e na lista,
            e o desenho fica com a coluna da direita inteira. */}
        {dados && (
          <section aria-labelledby="titulo-execucao" className="border-t border-borda pt-3">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <h2 id="titulo-execucao" className="font-semibold">
                {DESCRICAO_SEQUENCIAS[dados.resposta.sequencia].nome} f({dados.resposta.n}){' '}
                {rotuloModo(dados.resposta.modo)}
              </h2>
              {dados.origem === 'plano_b' && (
                <span className="inline-flex items-center rounded-full border border-alerta bg-alerta-suave px-2 py-0.5 text-sm">
                  modo offline: calculado no navegador
                </span>
              )}
            </div>
            <Contadores
              metricas={dados.resposta.metricas}
              nosExibidos={dados.resposta.nos_exibidos}
              className="mt-1"
            />
          </section>
        )}
      </section>

      <div className="flex min-w-0 flex-col gap-3">
        {!valida && (
          <Aviso tom="alerta" titulo="Ajuste os parâmetros para desenhar a árvore">
            {erros.n ?? erros.limite_nos}
          </Aviso>
        )}

        {valida && arvore.isPending && (
          <div
            role="status"
            className={`flex items-center justify-center rounded-lg border border-borda bg-superficie text-texto-suave ${ALTURA_DESENHO_CAIXA}`}
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
              <Botao variante="neutra" tamanho="pequeno" onClick={() => void arvore.refetch()}>
                Tentar de novo
              </Botao>
            }
          >
            {arvore.error.message}
          </Aviso>
        )}

        {dados && (
          <>
            {dados.resposta.truncada && (
              <Aviso tom="alerta" titulo="A árvore foi cortada no limite de nós">
                {`O desenho traz ${primeirosNos(dados.resposta.nos_exibidos)} de ${formatarInteiro(dados.resposta.metricas.invocacoes)} invocações. Os nós com o selo "ocultos" escondem o resto da subárvore; os contadores continuam sendo os da execução inteira.`}
              </Aviso>
            )}

            <VisaoArvore
              key={`${dados.resposta.sequencia}-${dados.resposta.n}-${dados.resposta.modo}-${dados.resposta.limite_nos}`}
              resposta={dados.resposta}
            />
          </>
        )}
      </div>
    </div>
  );
}
