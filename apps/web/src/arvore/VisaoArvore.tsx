import { DESCRICAO_SEQUENCIAS, type ArvoreResposta } from '@sequencias/contrato';
import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { rotuloModo } from '../utilitarios/formatar';
import { ArvoreLista } from './ArvoreLista';
import { ArvoreSvg } from './ArvoreSvg';
import { ALTURA_DESENHO, ALTURA_DESENHO_REPRODUCAO } from './layout';
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
  /** Vista escolhida numa visita anterior a esta mesma árvore. */
  visaoInicial?: Visao | null;
  aoEscolherVisao?: (visao: Visao) => void;
  /** Recado na linha dos botões, sem custar altura ao desenho. */
  aviso?: ReactNode;
}

const BOTAO =
  'min-h-toque rounded-md border border-borda bg-superficie px-3 text-sm text-texto hover:bg-superficie-suave';
const ABA =
  'min-h-toque rounded px-3 text-sm aria-pressed:bg-primaria aria-pressed:text-primaria-contraste';

/** Junta as duas visões da árvore e a reprodução passo a passo. */
export function VisaoArvore({
  resposta,
  podasPorAcerto,
  visaoInicial = null,
  aoEscolherVisao,
  aviso,
}: VisaoArvoreProps) {
  const { raiz, metricas, sequencia, n, modo } = resposta;
  const nos = useMemo(() => achatarNos(raiz), [raiz]);
  const relogio = useReproducao(totalPassos(raiz));
  const estreita = useMidia(TELA_ESTREITA);
  const [escolha, setEscolha] = useState<Visao | null>(visaoInicial);
  const [reproduzindo, setReproduzindo] = useState(false);

  // Sem escolha do usuário, a tela estreita manda: árvore larga não cabe.
  const visao = escolha ?? (estreita ? 'lista' : 'desenho');
  const passo = reproduzindo ? relogio.passo : null;
  const titulo = `Árvore de chamadas de ${DESCRICAO_SEQUENCIAS[sequencia].nome} f(${n}) ${rotuloModo(modo)}`;

  function escolher(proxima: Visao) {
    setEscolha(proxima);
    aoEscolherVisao?.(proxima);
  }

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
        classeAltura={reproduzindo ? ALTURA_DESENHO_REPRODUCAO : ALTURA_DESENHO}
      />
    );

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <div
          role="group"
          aria-label="Como ver a árvore"
          className="inline-flex rounded-md border border-borda bg-superficie p-1"
        >
          <button
            type="button"
            className={ABA}
            aria-pressed={visao === 'desenho'}
            onClick={() => escolher('desenho')}
          >
            Desenho
          </button>
          <button
            type="button"
            className={ABA}
            aria-pressed={visao === 'lista'}
            onClick={() => escolher('lista')}
          >
            Lista
          </button>
        </div>

        <button type="button" className={BOTAO} onClick={alternarReproducao}>
          {reproduzindo ? 'Ver a árvore inteira' : 'Reproduzir passo a passo'}
        </button>

        {reproduzindo && (
          <p className="text-sm text-texto-suave">
            Espaço inicia e pausa, as setas andam um passo, Home e End vão às pontas.
          </p>
        )}

        {aviso}
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
