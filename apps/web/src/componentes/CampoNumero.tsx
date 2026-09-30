import { type KeyboardEvent, type ReactNode, useId, useState } from 'react';
import { juntarClasses } from '../utilitarios/classes';
import {
  descreverIntervalo,
  validarInteiro,
  type ResultadoInteiro,
} from '../utilitarios/validacao';
import { BotaoIcone } from './Botao';

export interface CampoNumeroProps {
  id?: string;
  rotulo: string;
  /** Controlado como texto para aceitar campo vazio durante a digitação. */
  valor: string;
  aoMudar: (texto: string, resultado: ResultadoInteiro) => void;
  /** Disparado com Enter, quando o valor está válido. */
  aoConfirmar?: (valor: number) => void;
  minimo?: number;
  maximo?: number;
  /** Quanto os botões e as setas do teclado somam ou tiram. */
  passo?: number;
  /** Complemento da faixa aceita, na mesma linha sob o campo. */
  ajuda?: ReactNode;
  /** Mensagem vinda de fora (por exemplo da API); tem prioridade sobre a local. */
  erro?: string | null;
  desabilitado?: boolean;
  autoFoco?: boolean;
  comBotoes?: boolean;
  className?: string;
}

function maiuscula(texto: string): string {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

/**
 * Campo de inteiro no padrão das colunas de configuração: rótulo em cima, o valor
 * entre os botões de menos e mais, e a faixa aceita embaixo. O erro ocupa o lugar
 * da faixa, então o formulário não muda de altura quando ele aparece.
 */
export function CampoNumero({
  id,
  rotulo,
  valor,
  aoMudar,
  aoConfirmar,
  minimo = 0,
  maximo,
  passo = 1,
  ajuda,
  erro,
  desabilitado = false,
  autoFoco = false,
  comBotoes = true,
  className,
}: CampoNumeroProps) {
  const gerado = useId();
  const idCampo = id ?? gerado;
  const idAjuda = `${idCampo}-ajuda`;
  const idErro = `${idCampo}-erro`;
  const [tocado, setTocado] = useState(false);
  const opcoes = { minimo, maximo, rotulo: rotulo.toLowerCase() };

  const resultado = validarInteiro(valor, opcoes);
  const mostrarLocal = !resultado.valido && (valor.trim() !== '' || tocado);
  const mensagem = erro ?? (mostrarLocal ? resultado.mensagem : '');
  const invalido = mensagem !== '';

  function alterar(texto: string) {
    aoMudar(texto, validarInteiro(texto, opcoes));
  }

  function deslocar(delta: number) {
    if (!resultado.valido) {
      alterar(String(minimo));
      return;
    }
    let proximo = resultado.valor + delta;
    if (proximo < minimo) proximo = minimo;
    if (maximo !== undefined && proximo > maximo) proximo = maximo;
    alterar(String(proximo));
  }

  function aoTeclar(evento: KeyboardEvent<HTMLInputElement>) {
    if (evento.key === 'ArrowUp') {
      evento.preventDefault();
      deslocar(passo);
    } else if (evento.key === 'ArrowDown') {
      evento.preventDefault();
      deslocar(-passo);
    } else if (evento.key === 'Enter' && resultado.valido) {
      aoConfirmar?.(resultado.valor);
    }
  }

  const noMinimo = resultado.valido && resultado.valor <= minimo;
  const noMaximo = resultado.valido && maximo !== undefined && resultado.valor >= maximo;

  return (
    <div className={juntarClasses('flex min-w-0 flex-col gap-1', className)}>
      <label htmlFor={idCampo} className="text-sm font-medium">
        {rotulo}
      </label>
      <div className="flex items-center gap-1">
        {comBotoes ? (
          <BotaoIcone
            icone="menos"
            rotulo={`Diminuir ${rotulo}`}
            onClick={() => deslocar(-passo)}
            disabled={desabilitado || noMinimo}
          />
        ) : null}
        <input
          id={idCampo}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete="off"
          enterKeyHint="go"
          value={valor}
          autoFocus={autoFoco}
          disabled={desabilitado}
          aria-invalid={invalido || undefined}
          aria-describedby={juntarClasses(idAjuda, invalido && idErro)}
          onChange={(evento) => alterar(evento.target.value)}
          onBlur={() => setTocado(true)}
          onKeyDown={aoTeclar}
          className={juntarClasses(
            'sem-setas min-h-toque w-full min-w-0 rounded-md border bg-superficie px-2 text-center text-base tabular-nums',
            'disabled:cursor-not-allowed disabled:opacity-60',
            invalido ? 'border-erro' : 'border-borda-forte',
          )}
        />
        {comBotoes ? (
          <BotaoIcone
            icone="mais"
            rotulo={`Aumentar ${rotulo}`}
            onClick={() => deslocar(passo)}
            disabled={desabilitado || noMaximo}
          />
        ) : null}
      </div>
      {/* A faixa continua descrevendo o campo para o leitor de tela mesmo quando o erro
          toma o lugar dela na tela. */}
      <p
        id={idAjuda}
        className={juntarClasses('text-sm leading-dados text-texto-suave', invalido && 'sr-only')}
      >
        {maiuscula(descreverIntervalo(minimo, maximo))}
        {ajuda ? <>. {ajuda}</> : null}
      </p>
      <p
        id={idErro}
        aria-live="polite"
        className="text-sm leading-dados font-medium text-erro empty:sr-only"
      >
        {mensagem}
      </p>
    </div>
  );
}
