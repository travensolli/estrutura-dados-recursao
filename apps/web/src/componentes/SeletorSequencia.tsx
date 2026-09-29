import { DESCRICAO_SEQUENCIAS, SEQUENCIAS, type Sequencia } from '@sequencias/contrato';
import { useId } from 'react';

export interface SeletorSequenciaProps {
  valor: Sequencia;
  aoMudar: (sequencia: Sequencia) => void;
}

/** Rótulo e seletor na mesma linha, para caber na coluna de configuração. */
export function SeletorSequencia({ valor, aoMudar }: SeletorSequenciaProps) {
  const id = useId();
  return (
    <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3">
      <label htmlFor={id} className="font-medium">
        Sequência
      </label>
      <select
        id={id}
        value={valor}
        onChange={(evento) => {
          const escolhida = SEQUENCIAS.find((sequencia) => sequencia === evento.target.value);
          if (escolhida) aoMudar(escolhida);
        }}
        className="min-h-toque w-full rounded-md border border-borda-forte bg-superficie px-3 text-base"
      >
        {SEQUENCIAS.map((sequencia) => (
          <option key={sequencia} value={sequencia}>
            {DESCRICAO_SEQUENCIAS[sequencia].nome}
          </option>
        ))}
      </select>
    </div>
  );
}
