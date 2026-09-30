import {
  LIMITE_NOS_ARVORE_PADRAO,
  type LimitesN,
  type Modo,
  type Sequencia,
} from '@sequencias/contrato';
import { useState } from 'react';
import {
  Botao,
  CampoNumero,
  SeletorSegmentado,
  SeletorSequencia,
  type OpcaoSegmento,
} from '../../componentes';
import { formatarInteiro } from '../../utilitarios/formatar';
import { consultaValida, mesmaConsulta, validarConsulta, type ConsultaArvore } from '../consulta';

export interface ControlesArvoreProps {
  inicial: ConsultaArvore;
  limitesPorSequencia: Record<Sequencia, LimitesN>;
  limiteNosMaximo: number;
  aoAplicar: (consulta: ConsultaArvore) => void;
  /** Avisa se os controles pedem uma árvore válida diferente da desenhada. */
  aoAlterar?: (alterada: boolean) => void;
}

const OPCOES_MODO: ReadonlyArray<OpcaoSegmento<Modo>> = [
  { valor: 'sem_cache', rotulo: 'Sem cache', marca: 'sem-cache' },
  { valor: 'com_cache', rotulo: 'Com cache', marca: 'com-cache' },
];

/** Os controles da árvore, com os mesmos componentes e a mesma ordem de Calcular e Comparar. */
export function ControlesArvore({
  inicial,
  limitesPorSequencia,
  limiteNosMaximo,
  aoAplicar,
  aoAlterar,
}: ControlesArvoreProps) {
  const [consulta, setConsulta] = useState<ConsultaArvore>(inicial);
  /* Os campos guardam o texto digitado; a consulta só recebe números válidos. */
  const [textoN, setTextoN] = useState(String(inicial.n));
  const [textoLimite, setTextoLimite] = useState(String(inicial.limite_nos));
  const limites = limitesPorSequencia[consulta.sequencia];
  const valida = consultaValida(validarConsulta(consulta, limites, limiteNosMaximo));
  const pesado = consulta.limite_nos > LIMITE_NOS_ARVORE_PADRAO;

  function trocar(parcial: Partial<ConsultaArvore>) {
    const proxima = { ...consulta, ...parcial };
    setConsulta(proxima);
    const erros = validarConsulta(proxima, limitesPorSequencia[proxima.sequencia], limiteNosMaximo);
    aoAlterar?.(consultaValida(erros) && !mesmaConsulta(proxima, inicial));
  }

  return (
    <form
      aria-label="O que desenhar"
      className="flex flex-col gap-3"
      onSubmit={(evento) => {
        evento.preventDefault();
        if (valida) aoAplicar(consulta);
      }}
    >
      <SeletorSequencia valor={consulta.sequencia} aoMudar={(sequencia) => trocar({ sequencia })} />
      <SeletorSegmentado
        rotulo="Modo"
        valor={consulta.modo}
        aoMudar={(modo) => trocar({ modo })}
        opcoes={OPCOES_MODO}
        colunas={2}
      />
      <CampoNumero
        rotulo="n"
        valor={textoN}
        aoMudar={(texto, resultado) => {
          setTextoN(texto);
          trocar({ n: resultado.valido ? resultado.valor : Number.NaN });
        }}
        minimo={0}
        maximo={limites[consulta.modo]}
      />
      <CampoNumero
        rotulo="Limite de nós"
        valor={textoLimite}
        aoMudar={(texto, resultado) => {
          setTextoLimite(texto);
          trocar({ limite_nos: resultado.valido ? resultado.valor : Number.NaN });
        }}
        minimo={1}
        maximo={limiteNosMaximo}
        passo={100}
        ajuda={pesado ? `Acima de ${formatarInteiro(LIMITE_NOS_ARVORE_PADRAO)}, pesa` : undefined}
      />
      <Botao type="submit" tamanho="grande" largo icone="arvore" disabled={!valida}>
        Ver árvore
      </Botao>
    </form>
  );
}
