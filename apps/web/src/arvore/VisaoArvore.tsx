import { DESCRICAO_SEQUENCIAS, type ArvoreResposta } from '@sequencias/contrato';
import { useCallback, useMemo, useState } from 'react';
import { rotuloModo } from '../utilitarios/formatar';
import { ArvoreLista } from './ArvoreLista';
import { ArvoreSvg } from './ArvoreSvg';
import { Reproducao } from './Reproducao';
import { achatarNos, totalPassos } from './modelo';
import { TELA_ESTREITA, useMidia } from './usarMidia';
import { useReproducao } from './usarReproducao';

export type Visao = 'desenho' | 'lista';

export interface VisaoArvoreProps {
  /** Trocar de árvore exige remontar: use `key` na chamada. */
  resposta: ArvoreResposta;
  /** Chamadas evitadas por acerto, para a narração do passo. */
  podasPorAcerto?: ReadonlyMap<number, number>;
}

const BOTAO =
  'h-10 rounded-md border border-borda bg-superficie px-3 text-sm text-texto hover:bg-superficie-suave';
const ABA =
  'h-9 rounded px-3 text-sm aria-pressed:bg-primaria aria-pressed:text-primaria-contraste';

/** Junta as duas visões da árvore e a reprodução passo a passo. */
export function VisaoArvore({ resposta, podasPorAcerto }: VisaoArvoreProps) {
  const { raiz, metricas, sequencia, n, modo } = resposta;
  const nos = useMemo(() => achatarNos(raiz), [raiz]);
  const relogio = useReproducao(totalPassos(raiz));
  const estreita = useMidia(TELA_ESTREITA);
  const [escolha, setEscolha] = useState<Visao | null>(null);
  const [reproduzindo, setReproduzindo] = useState(false);

  // Sem escolha do usuário, a tela estreita manda: árvore larga não cabe.
  const visao = escolha ?? (estreita ? 'lista' : 'desenho');
  const passo = reproduzindo ? relogio.passo : null;
  const titulo = `Árvore de chamadas de ${DESCRICAO_SEQUENCIAS[sequencia].nome} f(${n}) ${rotuloModo(modo)}`;

  const alternarReproducao = useCallback(() => {
    relogio.paraOInicio();
    setReproduzindo((atual) => !atual);
  }, [relogio]);

  const arvore =
    visao === 'lista' ? (
      <ArvoreLista raiz={raiz} passo={passo} rotulo={titulo} />
    ) : (
      <ArvoreSvg
        raiz={raiz}
        metricas={metricas}
        sequencia={sequencia}
        n={n}
        modo={modo}
        truncada={resposta.truncada}
        nosExibidos={resposta.nos_exibidos}
        passo={passo}
        animacaoReduzida={relogio.animacaoReduzida}
        compacto={reproduzindo}
      />
    );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <div
          role="group"
          aria-label="Como ver a árvore"
          className="inline-flex rounded-md border border-borda bg-superficie p-1"
        >
          <button
            type="button"
            className={ABA}
            aria-pressed={visao === 'desenho'}
            onClick={() => setEscolha('desenho')}
          >
            Desenho
          </button>
          <button
            type="button"
            className={ABA}
            aria-pressed={visao === 'lista'}
            onClick={() => setEscolha('lista')}
          >
            Lista
          </button>
        </div>

        <button type="button" className={BOTAO} onClick={alternarReproducao}>
          {reproduzindo ? 'Ver a árvore inteira' : 'Reproduzir passo a passo'}
        </button>

        {reproduzindo && (
          <p className="text-sm text-texto-suave">
            Espaço toca e pausa, as setas andam um passo, Home e End vão às pontas.
          </p>
        )}
      </div>

      {reproduzindo ? (
        <Reproducao
          nos={nos}
          modo={modo}
          relogio={relogio}
          podasPorAcerto={podasPorAcerto}
          focarAoMontar
        >
          {arvore}
        </Reproducao>
      ) : (
        arvore
      )}
    </div>
  );
}
