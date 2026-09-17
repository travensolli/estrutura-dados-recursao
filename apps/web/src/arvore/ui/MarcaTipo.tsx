import type { TipoNo } from '@sequencias/contrato';
import { estiloDoTipo } from '../formas';

// Peça local da árvore: o Orquestrador harmoniza depois com o design system.

export interface MarcaTipoProps {
  tipo: TipoNo;
  /** Cor do argumento; sem ela a marca sai em tinta neutra. */
  cor?: string;
  largura?: number;
  altura?: number;
}

/** Mesma silhueta do nó no desenho, em miniatura: o tipo nunca é só cor. */
export function MarcaTipo({ tipo, cor, largura = 30, altura = 18 }: MarcaTipoProps) {
  const estilo = estiloDoTipo(tipo, largura, altura);
  const traco = cor ?? 'var(--texto-suave)';
  return (
    <svg
      width={largura + 4}
      height={altura + 4}
      viewBox={`${-(largura + 4) / 2} ${-(altura + 4) / 2} ${largura + 4} ${altura + 4}`}
      aria-hidden="true"
      className="shrink-0"
    >
      <path
        d={estilo.caminho}
        fill={cor ?? 'var(--superficie-suave)'}
        fillOpacity={cor ? 0.22 : 1}
        stroke={traco}
        strokeWidth={1.5}
        strokeDasharray={estilo.tracejado}
      />
      <path d={estilo.marca} fill="var(--texto-suave)" />
    </svg>
  );
}
