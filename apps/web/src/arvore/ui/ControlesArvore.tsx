import {
  DESCRICAO_SEQUENCIAS,
  LIMITE_NOS_ARVORE_PADRAO,
  MODOS,
  SEQUENCIAS,
  type LimitesN,
  type Sequencia,
} from '@sequencias/contrato';
import { useId, useState } from 'react';
import { RotuloModo } from '../../componentes';
import { formatarInteiro } from '../../utilitarios/formatar';
import {
  consultaValida,
  validarConsulta,
  type ConsultaArvore,
  type ErrosConsulta,
} from '../consulta';

export interface ControlesArvoreProps {
  inicial: ConsultaArvore;
  limitesPorSequencia: Record<Sequencia, LimitesN>;
  limiteNosMaximo: number;
  aoAplicar: (consulta: ConsultaArvore) => void;
}

const CAMPO =
  'min-h-toque w-full rounded-md border border-borda-forte bg-superficie px-3 text-base text-texto aria-invalid:border-erro disabled:opacity-60';
const ROTULO = 'font-medium';
const AJUDA = 'mt-1 text-sm text-texto-suave';
const ERRO = 'text-sm font-medium text-erro';

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
      aria-label="O que desenhar"
      className="space-y-3"
      onSubmit={(evento) => {
        evento.preventDefault();
        if (valida) aoAplicar(consulta);
      }}
    >
      <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3">
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

      <div className="grid grid-cols-2 gap-3">
        <div className="min-w-0">
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
            aria-describedby={
              erros.n === undefined
                ? `${identificador}-n-ajuda`
                : `${identificador}-n-ajuda ${identificador}-n-erro`
            }
            aria-invalid={erros.n !== undefined}
            onChange={(evento) => trocar({ n: Number(evento.target.value) })}
          />
          <p id={`${identificador}-n-ajuda`} className={AJUDA}>
            até {formatarInteiro(limites[consulta.modo])}
          </p>
          <p id={`${identificador}-n-erro`} aria-live="polite" className={ERRO}>
            {erros.n}
          </p>
        </div>

        <div className="min-w-0">
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
            aria-describedby={
              erros.limite_nos === undefined
                ? `${identificador}-limite-ajuda`
                : `${identificador}-limite-ajuda ${identificador}-limite-erro`
            }
            aria-invalid={erros.limite_nos !== undefined}
            onChange={(evento) => trocar({ limite_nos: Number(evento.target.value) })}
          />
          <p id={`${identificador}-limite-ajuda`} className={AJUDA}>
            {pesado ? 'acima de 300 o desenho pesa' : `1 a ${formatarInteiro(limiteNosMaximo)}`}
          </p>
          <p id={`${identificador}-limite-erro`} aria-live="polite" className={ERRO}>
            {erros.limite_nos}
          </p>
        </div>
      </div>

      <fieldset className="border-0 p-0">
        <legend className={ROTULO}>Modo</legend>
        <div className="mt-1 flex gap-1 rounded-lg border border-borda bg-superficie-suave p-1">
          {MODOS.map((modo) => (
            <label key={modo} className="flex-1">
              <input
                type="radio"
                name={`${identificador}-modo`}
                value={modo}
                className="peer sr-only"
                checked={consulta.modo === modo}
                onChange={() => trocar({ modo })}
              />
              <span className="flex min-h-toque cursor-pointer items-center justify-center gap-2 rounded-md px-2 text-sm whitespace-nowrap text-texto-suave peer-checked:bg-superficie peer-checked:font-semibold peer-checked:text-texto peer-checked:shadow-cartao peer-checked:ring-1 peer-checked:ring-borda-forte peer-focus-visible:outline-(length:--espessura-foco) peer-focus-visible:outline-offset-(--recuo-foco) peer-focus-visible:outline-foco">
                <RotuloModo modo={modo} />
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <button
        type="submit"
        disabled={!valida}
        className="min-h-toque w-full rounded-md bg-primaria px-5 font-medium text-primaria-contraste hover:bg-primaria-forte disabled:opacity-50"
      >
        Ver árvore
      </button>
    </form>
  );
}
