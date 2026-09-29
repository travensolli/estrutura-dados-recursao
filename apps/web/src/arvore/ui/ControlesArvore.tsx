import {
  DESCRICAO_SEQUENCIAS,
  LIMITE_NOS_ARVORE_PADRAO,
  MODOS,
  SEQUENCIAS,
  type LimitesN,
  type Sequencia,
} from '@sequencias/contrato';
import { useId, useState } from 'react';
import { formatarInteiro, rotuloModo } from '../../utilitarios/formatar';
import {
  consultaValida,
  validarConsulta,
  type ConsultaArvore,
  type ErrosConsulta,
} from '../consulta';

// Peça local da árvore: o Orquestrador harmoniza depois com o design system.

export interface ControlesArvoreProps {
  inicial: ConsultaArvore;
  limitesPorSequencia: Record<Sequencia, LimitesN>;
  limiteNosMaximo: number;
  aoAplicar: (consulta: ConsultaArvore) => void;
}

const CAMPO =
  'h-11 w-full rounded-md border border-borda bg-superficie px-3 text-sm text-texto disabled:opacity-60';
const ROTULO = 'text-xs text-texto-suave';

export function ControlesArvore({
  inicial,
  limitesPorSequencia,
  limiteNosMaximo,
  aoAplicar,
}: ControlesArvoreProps) {
  const [consulta, setConsulta] = useState<ConsultaArvore>(inicial);
  const identificador = useId();
  const limites = limitesPorSequencia[consulta.sequencia];
  const erros: ErrosConsulta = validarConsulta(consulta, limites, limiteNosMaximo);
  const valida = consultaValida(erros);
  const pesado = consulta.limite_nos > LIMITE_NOS_ARVORE_PADRAO;

  const trocar = (parcial: Partial<ConsultaArvore>) =>
    setConsulta((atual) => ({ ...atual, ...parcial }));

  return (
    <form
      className="flex flex-wrap items-start gap-4 rounded-lg border border-borda bg-superficie-suave p-3"
      onSubmit={(evento) => {
        evento.preventDefault();
        if (valida) aoAplicar(consulta);
      }}
    >
      <div className="w-44">
        <label className={ROTULO} htmlFor={`${identificador}-sequencia`}>
          Sequência
        </label>
        <select
          id={`${identificador}-sequencia`}
          className={CAMPO}
          value={consulta.sequencia}
          onChange={(evento) => trocar({ sequencia: evento.target.value as Sequencia })}
        >
          {SEQUENCIAS.map((id) => (
            <option key={id} value={id}>
              {DESCRICAO_SEQUENCIAS[id].nome}
            </option>
          ))}
        </select>
      </div>

      <div className="w-28">
        <label className={ROTULO} htmlFor={`${identificador}-n`}>
          Valor de n
        </label>
        <input
          id={`${identificador}-n`}
          className={CAMPO}
          type="number"
          inputMode="numeric"
          min={0}
          max={limites[consulta.modo]}
          value={consulta.n}
          aria-describedby={`${identificador}-n-ajuda`}
          aria-invalid={erros.n !== undefined}
          onChange={(evento) => trocar({ n: Number(evento.target.value) })}
        />
        <p id={`${identificador}-n-ajuda`} className="mt-1 text-xs text-texto-suave">
          {erros.n ?? `até ${formatarInteiro(limites[consulta.modo])}`}
        </p>
      </div>

      <fieldset className="border-0 p-0">
        <legend className={ROTULO}>Modo</legend>
        <div className="mt-1 inline-flex rounded-md border border-borda bg-superficie p-1">
          {MODOS.map((modo) => (
            <label key={modo}>
              <input
                type="radio"
                name={`${identificador}-modo`}
                value={modo}
                className="peer sr-only"
                checked={consulta.modo === modo}
                onChange={() => trocar({ modo })}
              />
              <span className="inline-flex h-9 cursor-pointer items-center rounded px-3 text-sm peer-checked:bg-primaria peer-checked:font-medium peer-checked:text-primaria-contraste peer-focus-visible:outline-3 peer-focus-visible:outline-foco">
                {rotuloModo(modo)}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="w-32">
        <label className={ROTULO} htmlFor={`${identificador}-limite`}>
          Limite de nós
        </label>
        <input
          id={`${identificador}-limite`}
          className={CAMPO}
          type="number"
          inputMode="numeric"
          min={1}
          max={limiteNosMaximo}
          value={consulta.limite_nos}
          aria-describedby={`${identificador}-limite-ajuda`}
          aria-invalid={erros.limite_nos !== undefined}
          onChange={(evento) => trocar({ limite_nos: Number(evento.target.value) })}
        />
        <p id={`${identificador}-limite-ajuda`} className="mt-1 text-xs text-texto-suave">
          {erros.limite_nos ??
            (pesado ? 'acima de 300 o desenho pesa' : `1 a ${formatarInteiro(limiteNosMaximo)}`)}
        </p>
      </div>

      <button
        type="submit"
        disabled={!valida}
        className="h-11 self-start rounded-md bg-primaria px-5 font-medium text-primaria-contraste hover:bg-primaria-forte disabled:opacity-50"
      >
        Ver árvore
      </button>
    </form>
  );
}
