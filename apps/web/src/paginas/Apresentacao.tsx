import type { ReactElement } from 'react';
import { useCallback, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router';
import type { DadosApresentacao } from '../arvore/apresentacao/dados';
import { useApresentacao } from '../arvore/apresentacao/dados';
import { SlideCache } from '../arvore/apresentacao/SlideCache';
import { SlideComCache } from '../arvore/apresentacao/SlideComCache';
import { SlideConta } from '../arvore/apresentacao/SlideConta';
import { SlideFuncao } from '../arvore/apresentacao/SlideFuncao';
import { SlideGeral } from '../arvore/apresentacao/SlideGeral';
import { SlideSemCache } from '../arvore/apresentacao/SlideSemCache';
import {
  escreverSlide,
  slidePorIndice,
  lerSlide,
  N_APRESENTACAO,
  TOTAL_SLIDES,
} from '../arvore/apresentacao/slides';
import { Palco } from '../arvore/apresentacao/Palco';
import { Aviso } from '../arvore/ui/Aviso';

type Conteudo = (props: { dados: DadosApresentacao }) => ReactElement;

const CONTEUDO_DO_SLIDE: Record<string, Conteudo> = {
  funcao: SlideFuncao,
  'sem-cache': SlideSemCache,
  cache: SlideCache,
  'com-cache': SlideComCache,
  conta: SlideConta,
  geral: SlideGeral,
};

export function PaginaApresentacao() {
  const [parametros, setParametros] = useSearchParams();
  const indice = lerSlide(parametros);
  const slide = slidePorIndice(indice);
  const { dados, carregando, erro, recarregar } = useApresentacao();

  /* O slide alvo é guardado numa referência e atualizado já no comando, antes
     de a navegação ser pintada: assim dois toques seguidos não se anulam. */
  const alvo = useRef(indice);
  useEffect(() => {
    alvo.current = indice;
  }, [indice]);

  const aoIr = useCallback(
    (destino: number) => {
      const limitado = Math.min(Math.max(destino, 0), TOTAL_SLIDES - 1);
      alvo.current = limitado;
      setParametros(escreverSlide(limitado), { replace: true });
    },
    [setParametros],
  );

  const aoAndar = useCallback((passo: number) => aoIr(alvo.current + passo), [aoIr]);

  const ConteudoDoSlide = CONTEUDO_DO_SLIDE[slide.id];

  return (
    <Palco slide={slide} indice={indice} aoIr={aoIr} aoAndar={aoAndar} offline={dados?.offline}>
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

      {dados && ConteudoDoSlide && <ConteudoDoSlide key={slide.id} dados={dados} />}
    </Palco>
  );
}
