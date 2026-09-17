import { TIPOS_NO } from '@sequencias/contrato';
import { estiloDoTipo } from '../formas';

// Peça local da árvore: o Orquestrador harmoniza depois com o design system.

const LARGURA = 34;
const ALTURA = 20;

export function Legenda() {
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
      {TIPOS_NO.map((tipo) => {
        const estilo = estiloDoTipo(tipo, LARGURA, ALTURA);
        return (
          <span key={tipo} className="inline-flex items-center gap-2">
            <svg
              width={LARGURA + 4}
              height={ALTURA + 4}
              viewBox={`${-(LARGURA + 4) / 2} ${-(ALTURA + 4) / 2} ${LARGURA + 4} ${ALTURA + 4}`}
              aria-hidden="true"
              className="shrink-0"
            >
              <path
                d={estilo.caminho}
                fill="var(--superficie-suave)"
                stroke="var(--texto-suave)"
                strokeWidth={1.5}
                strokeDasharray={estilo.tracejado}
              />
              <path d={estilo.marca} fill="var(--texto-suave)" />
            </svg>
            {estilo.rotulo}
          </span>
        );
      })}
      <span className="text-texto-suave">
        a cor mostra o argumento: todas as ocorrências de f(3) usam a mesma cor
      </span>
    </div>
  );
}
