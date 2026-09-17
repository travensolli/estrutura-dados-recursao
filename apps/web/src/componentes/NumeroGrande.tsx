import { useId, useState, type ReactNode } from 'react';
import { useCopiar } from '../hooks/copiar';
import { juntarClasses } from '../utilitarios/classes';
import { abreviarValor, formatarInteiro } from '../utilitarios/formatar';
import { Botao } from './Botao';
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
  medio: 'text-xl sm:text-2xl lg:text-3xl',
  grande: 'text-3xl sm:text-4xl lg:text-5xl',
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
      <p
        className={juntarClasses('mt-1 leading-tight font-semibold break-all', TAMANHOS[tamanho])}
        title={resumo.foiAbreviado ? `${resumo.digitos} dígitos` : undefined}
      >
        {resumo.abreviado}
      </p>
      <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
        <Selo>
          {formatarInteiro(resumo.digitos)} {resumo.digitos === 1 ? 'dígito' : 'dígitos'}
        </Selo>
        <Botao
          variante="discreta"
          tamanho="pequeno"
          icone={estado === 'copiado' ? 'verificado' : 'copiar'}
          aria-label={`Copiar o valor${sufixo}`}
          onClick={() => void copiar(valor)}
        >
          Copiar
        </Botao>
        {resumo.foiAbreviado ? (
          <Botao
            variante="discreta"
            tamanho="pequeno"
            icone={expandido ? 'colapsar' : 'expandir'}
            aria-expanded={expandido}
            aria-controls={idCompleto}
            onClick={() => setExpandido((atual) => !atual)}
          >
            {expandido ? 'Ocultar valor completo' : 'Ver valor completo'}
          </Botao>
        ) : null}
        <span
          role="status"
          className={estado === 'ocioso' ? 'sr-only' : 'text-sm font-medium text-sucesso'}
        >
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
