import type { ReactElement } from 'react';
import { useCallback } from 'react';
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

  const aoIr = useCallback(
    (alvo: number) => setParametros(escreverEtapa(alvo), { replace: true }),
    [setParametros],
  );

  const ConteudoDaEtapa = CONTEUDO_DA_ETAPA[etapa.id];

  return (
    <Palco etapa={etapa} indice={indice} aoIr={aoIr} offline={dados?.offline}>
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
