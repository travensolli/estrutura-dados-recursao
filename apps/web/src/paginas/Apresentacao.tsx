import type { ReactElement } from 'react';
import { useCallback, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router';
import type { DadosApresentacao } from '../arvore/apresentacao/dados';
import { useApresentacao } from '../arvore/apresentacao/dados';
import { EtapaCache } from '../arvore/apresentacao/EtapaCache';
import { EtapaComCache } from '../arvore/apresentacao/EtapaComCache';
import { EtapaConta } from '../arvore/apresentacao/EtapaConta';
import { EtapaFuncao } from '../arvore/apresentacao/EtapaFuncao';
import { EtapaGeral } from '../arvore/apresentacao/EtapaGeral';
import { EtapaSemCache } from '../arvore/apresentacao/EtapaSemCache';
import {
  escreverEtapa,
  etapaPorIndice,
  lerEtapa,
  N_APRESENTACAO,
  TOTAL_ETAPAS,
} from '../arvore/apresentacao/etapas';
import { Palco } from '../arvore/apresentacao/Palco';
import { Aviso } from '../arvore/ui/Aviso';

type Conteudo = (props: { dados: DadosApresentacao }) => ReactElement;

const CONTEUDO_DA_ETAPA: Record<string, Conteudo> = {
  funcao: EtapaFuncao,
  'sem-cache': EtapaSemCache,
  cache: EtapaCache,
  'com-cache': EtapaComCache,
  conta: EtapaConta,
  geral: EtapaGeral,
};

export function PaginaApresentacao() {
  const [parametros, setParametros] = useSearchParams();
  const indice = lerEtapa(parametros);
  const etapa = etapaPorIndice(indice);
  const { dados, carregando, erro, recarregar } = useApresentacao();

  /* A etapa alvo é guardada numa referência e atualizada já no comando, antes
     de a navegação ser pintada: assim dois toques seguidos não se anulam. */
  const alvo = useRef(indice);
  useEffect(() => {
    alvo.current = indice;
  }, [indice]);

  const aoIr = useCallback(
    (destino: number) => {
      const limitado = Math.min(Math.max(destino, 0), TOTAL_ETAPAS - 1);
      alvo.current = limitado;
      setParametros(escreverEtapa(limitado), { replace: true });
    },
    [setParametros],
  );

  const aoAndar = useCallback((passo: number) => aoIr(alvo.current + passo), [aoIr]);

  const ConteudoDaEtapa = CONTEUDO_DA_ETAPA[etapa.id];

  return (
    <Palco etapa={etapa} indice={indice} aoIr={aoIr} aoAndar={aoAndar} offline={dados?.offline}>
      {!dados && carregando && (
        <div role="status" className="flex flex-1 items-center justify-center">
          <span className="animate-pulse text-[clamp(1rem,1.6vw,1.6rem)] text-texto-suave">
            Calculando Tribonacci f({N_APRESENTACAO}) nos dois modos…
          </span>
        </div>
      )}

      {!dados && erro && (
        <Aviso
          tom="erro"
          titulo="Não deu para montar a apresentação"
          acao={
            <button
              type="button"
              className="min-h-toque rounded-md border border-borda-forte px-4 hover:bg-superficie"
              onClick={recarregar}
            >
              Tentar de novo
            </button>
          }
        >
          {erro.message}
        </Aviso>
      )}

      {dados && ConteudoDaEtapa && <ConteudoDaEtapa key={etapa.id} dados={dados} />}
    </Palco>
  );
}
