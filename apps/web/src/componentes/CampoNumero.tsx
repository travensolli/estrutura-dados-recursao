import { type KeyboardEvent, type ReactNode, useId, useState } from 'react';
import { juntarClasses } from '../utilitarios/classes';
import {
  descreverIntervalo,
  validarInteiro,
  type ResultadoInteiro,
} from '../utilitarios/validacao';
import { Icone } from './Icone';

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

/* Botões internos do conjunto: sem borda própria, só a divisória com o valor. O foco
   fica por dentro, porque o conjunto recorta o que passa da borda. */
const BOTAO_PASSO =
  'flex min-h-toque w-toque shrink-0 items-center justify-center border-borda text-texto-suave hover:bg-superficie-suave hover:text-texto focus-visible:outline-offset-[-3px] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent';

function maiuscula(texto: string): string {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

/**
 * Campo de inteiro no padrão das colunas de configuração: o nome e a faixa aceita à
 * esquerda, e à direita o valor entre menos e mais, numa peça só. O erro aparece sob
 * a linha, e a faixa continua à vista para explicar o limite.
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
      {/* Linha de ajuste: o nome e a faixa à esquerda, o valor à direita. Empilhados, dois
          campos ficam em linhas próprias, sem se encostar. */}
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <label htmlFor={idCampo} className="block text-sm font-medium">
            {rotulo}
          </label>
          <p id={idAjuda} className="text-sm leading-dados text-texto-suave">
            {maiuscula(descreverIntervalo(minimo, maximo))}
            {ajuda ? <>. {ajuda}</> : null}
          </p>
        </div>
        {/* Uma peça só: a borda envolve menos, valor e mais, com divisórias finas. O
            contorno de foco é o do conjunto quando o foco está no valor. */}
        <div
          className={juntarClasses(
            'flex shrink-0 items-stretch overflow-hidden rounded-md border bg-superficie',
            'has-[input:focus-visible]:outline-(length:--espessura-foco) has-[input:focus-visible]:outline-offset-(--recuo-foco) has-[input:focus-visible]:outline-foco',
            desabilitado && 'opacity-60',
            invalido ? 'border-erro' : 'border-borda-forte',
          )}
        >
          {comBotoes ? (
            <button
              type="button"
              aria-label={`Diminuir ${rotulo}`}
              title={`Diminuir ${rotulo}`}
              onClick={() => deslocar(-passo)}
              disabled={desabilitado || noMinimo}
              className={`${BOTAO_PASSO} border-r`}
            >
              <Icone nome="menos" tamanho={16} />
            </button>
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
            className="sem-setas min-h-toque w-14 min-w-0 bg-transparent px-1 text-center text-base font-medium tabular-nums focus-visible:outline-none disabled:cursor-not-allowed"
          />
          {comBotoes ? (
            <button
              type="button"
              aria-label={`Aumentar ${rotulo}`}
              title={`Aumentar ${rotulo}`}
              onClick={() => deslocar(passo)}
              disabled={desabilitado || noMaximo}
              className={`${BOTAO_PASSO} border-l`}
            >
              <Icone nome="mais" tamanho={16} />
            </button>
          ) : null}
        </div>
      </div>
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
