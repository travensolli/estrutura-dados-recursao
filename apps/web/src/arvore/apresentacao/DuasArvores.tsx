import { useState, type ReactNode } from 'react';
import { TELA_ESTREITA, useMidia } from '../usarMidia';

// Peça local da árvore: o Orquestrador harmoniza depois com o design system.

export interface LadoArvore {
  id: string;
  rotulo: string;
  nota?: string;
  conteudo: ReactNode;
}

export interface DuasArvoresProps {
  lados: readonly [LadoArvore, LadoArvore];
}

const ABA =
  'min-h-toque rounded-md px-4 text-[clamp(0.9rem,1.1vw,1.1rem)] aria-pressed:bg-primaria aria-pressed:font-medium aria-pressed:text-primaria-contraste';

function Cabecalho({ lado }: { lado: LadoArvore }) {
  return (
    <div className="flex flex-wrap items-baseline gap-x-3">
      <h2 className="text-[clamp(1rem,1.5vw,1.5rem)] font-medium">{lado.rotulo}</h2>
      {lado.nota && (
        <p className="text-[clamp(0.8rem,1vw,1.05rem)] text-texto-suave">{lado.nota}</p>
      )}
    </div>
  );
}

/** Lado a lado na tela larga; no celular, uma árvore de cada vez. */
export function DuasArvores({ lados }: DuasArvoresProps) {
  const estreita = useMidia(TELA_ESTREITA);
  const [visivel, setVisivel] = useState(lados[0].id);

  if (!estreita) {
    return (
      <div className="grid min-w-0 gap-[clamp(0.75rem,1.5vw,1.5rem)] lg:grid-cols-2">
        {lados.map((lado) => (
          <section key={lado.id} aria-label={lado.rotulo} className="flex min-w-0 flex-col gap-2">
            <Cabecalho lado={lado} />
            {lado.conteudo}
          </section>
        ))}
      </div>
    );
  }

  const atual = lados.find((lado) => lado.id === visivel) ?? lados[0];
  return (
    <div className="flex min-w-0 flex-col gap-3">
      <div
        role="group"
        aria-label="Qual árvore mostrar"
        className="inline-flex self-start rounded-md border border-borda bg-superficie p-1"
      >
        {lados.map((lado) => (
          <button
            key={lado.id}
            type="button"
            className={ABA}
            aria-pressed={lado.id === atual.id}
            onClick={() => setVisivel(lado.id)}
          >
            {lado.rotulo}
          </button>
        ))}
      </div>
      <section aria-label={atual.rotulo} className="flex min-w-0 flex-col gap-2">
        <Cabecalho lado={atual} />
        {atual.conteudo}
      </section>
    </div>
  );
}
