import { useId, useState, type ReactNode } from 'react';
import { useCopiar } from '../hooks/copiar';
import { juntarClasses } from '../utilitarios/classes';
import { abreviarValor, formatarInteiro } from '../utilitarios/formatar';
import { BotaoIcone } from './Botao';
import { Selo } from './Selo';

export interface NumeroGrandeProps {
  /** Valor inteiro em texto decimal, como trafega no JSON. */
  valor: string;
  rotulo?: ReactNode;
  descricao?: ReactNode;
  digitosVisiveis?: number;
  tamanho?: 'medio' | 'grande';
  /** Complemento do rótulo dos botões, útil quando há vários na mesma tela. */
  nome?: string;
  className?: string;
}

const TAMANHOS = {
  medio: 'text-2xl sm:text-3xl',
  grande: 'text-4xl sm:text-5xl',
} as const;

/** Valor exato: abreviado com a contagem de dígitos, copiável e expansível. */
export function NumeroGrande({
  valor,
  rotulo,
  descricao,
  digitosVisiveis = 14,
  tamanho = 'grande',
  nome,
  className,
}: NumeroGrandeProps) {
  const idCompleto = useId();
  const [expandido, setExpandido] = useState(false);
  const { estado, copiar } = useCopiar();
  const resumo = abreviarValor(valor, digitosVisiveis);
  const sufixo = nome ? ` de ${nome}` : '';

  return (
    <div className={juntarClasses('min-w-0', className)}>
      {rotulo ? <p className="text-sm text-texto-suave">{rotulo}</p> : null}
      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-2">
        <p
          className={juntarClasses('leading-tight font-semibold break-all', TAMANHOS[tamanho])}
          title={resumo.foiAbreviado ? `${resumo.digitos} dígitos` : undefined}
        >
          {resumo.abreviado}
        </p>
        <BotaoIcone
          icone={estado === 'copiado' ? 'verificado' : 'copiar'}
          rotulo={`Copiar o valor${sufixo}`}
          tamanho="pequeno"
          onClick={() => void copiar(valor)}
        />
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <Selo>
          {formatarInteiro(resumo.digitos)} {resumo.digitos === 1 ? 'dígito' : 'dígitos'}
        </Selo>
        {resumo.foiAbreviado ? (
          <button
            type="button"
            aria-expanded={expandido}
            aria-controls={idCompleto}
            onClick={() => setExpandido((atual) => !atual)}
            className="min-h-toque rounded-md px-2 text-sm font-medium text-primaria underline underline-offset-4 hover:bg-primaria-suave"
          >
            {expandido ? 'Ocultar valor completo' : 'Ver valor completo'}
          </button>
        ) : null}
        <span role="status" className={estado === 'ocioso' ? 'sr-only' : 'text-sm text-sucesso'}>
          {estado === 'copiado' ? 'Valor copiado' : null}
          {estado === 'falhou' ? 'Não foi possível copiar. Selecione o número e copie.' : null}
        </span>
      </div>
      {descricao ? <p className="mt-2 text-sm text-texto-suave">{descricao}</p> : null}
      {resumo.foiAbreviado ? (
        <div id={idCompleto} hidden={!expandido} className="mt-3">
          <p className="max-h-60 overflow-y-auto rounded-md border border-borda bg-superficie-suave p-3 font-mono text-sm break-all tabular-nums">
            {resumo.completo}
          </p>
        </div>
      ) : null}
    </div>
  );
}
