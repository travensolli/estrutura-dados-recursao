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
  passo?: number;
  ajuda?: ReactNode;
  /** Mensagem vinda de fora (por exemplo da API); tem prioridade sobre a local. */
  erro?: string | null;
  desabilitado?: boolean;
  autoFoco?: boolean;
  comBotoes?: boolean;
  /** Guarda a altura da mensagem de erro mesmo sem erro, para o formulário não pular. */
  reservarErro?: boolean;
  className?: string;
}

/** Campo de inteiro com limites visíveis, validação em tempo real e teclado numérico. */
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
  reservarErro = true,
  className,
}: CampoNumeroProps) {
  const gerado = useId();
  const idCampo = id ?? gerado;
  const idAjuda = `${idCampo}-ajuda`;
  const idErro = `${idCampo}-erro`;
  const [tocado, setTocado] = useState(false);

  const resultado = validarInteiro(valor, { minimo, maximo });
  const mostrarLocal = !resultado.valido && (valor.trim() !== '' || tocado);
  const mensagem = erro ?? (mostrarLocal ? resultado.mensagem : '');
  const invalido = mensagem !== '';

  function alterar(texto: string) {
    aoMudar(texto, validarInteiro(texto, { minimo, maximo }));
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
    <div className={juntarClasses('flex flex-col gap-1.5', className)}>
      <label htmlFor={idCampo} className="font-medium">
        {rotulo}
      </label>
      <p id={idAjuda} className="text-sm text-texto-suave">
        Aceita {descreverIntervalo(minimo, maximo)}
        {ajuda ? <>. {ajuda}</> : null}
      </p>
      <div className="flex items-center gap-2">
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
            'sem-setas min-h-toque w-full min-w-0 rounded-md border bg-superficie px-3 text-lg tabular-nums',
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
      <p
        id={idErro}
        aria-live="polite"
        className={juntarClasses(reservarErro && 'min-h-5', 'text-sm font-medium text-erro')}
      >
        {mensagem}
      </p>
    </div>
  );
}
