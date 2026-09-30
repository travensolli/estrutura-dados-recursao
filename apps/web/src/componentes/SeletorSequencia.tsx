import { DESCRICAO_SEQUENCIAS, SEQUENCIAS, type Sequencia } from '@sequencias/contrato';
import { SeletorSegmentado, type OpcaoSegmento } from './SeletorSegmentado';

export interface SeletorSequenciaProps {
  valor: Sequencia;
  aoMudar: (sequencia: Sequencia) => void;
}

const OPCOES: ReadonlyArray<OpcaoSegmento<Sequencia>> = SEQUENCIAS.map((sequencia) => ({
  valor: sequencia,
  rotulo: DESCRICAO_SEQUENCIAS[sequencia].nome,
}));

/** As três sequências à vista, lado a lado: escolher é um clique, e a escolhida fica marcada. */
export function SeletorSequencia({ valor, aoMudar }: SeletorSequenciaProps) {
  return (
    <SeletorSegmentado
      rotulo="Sequência"
      valor={valor}
      aoMudar={aoMudar}
      opcoes={OPCOES}
      colunas={3}
    />
  );
}
