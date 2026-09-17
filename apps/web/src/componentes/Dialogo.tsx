import { useEffect, useId, useRef, type KeyboardEvent, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { juntarClasses } from '../utilitarios/classes';
import { Botao, BotaoIcone } from './Botao';
import type { VarianteBotao } from './estilos-botao';

const FOCAVEIS = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

export interface DialogoProps {
  aberto: boolean;
  aoFechar: () => void;
  titulo: string;
  descricao?: ReactNode;
  children?: ReactNode;
  acoes?: ReactNode;
  tamanho?: 'medio' | 'grande';
  /** Clique fora fecha o diálogo. */
  fecharNoFundo?: boolean;
  rotuloFechar?: string;
}

const LARGURAS = { medio: 'max-w-lg', grande: 'max-w-3xl' } as const;

/** Diálogo modal: foco preso, Esc fecha e o foco volta para quem abriu. */
export function Dialogo({
  aberto,
  aoFechar,
  titulo,
  descricao,
  children,
  acoes,
  tamanho = 'medio',
  fecharNoFundo = true,
  rotuloFechar = 'Fechar',
}: DialogoProps) {
  const idTitulo = useId();
  const idDescricao = `${idTitulo}-descricao`;
  const painel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!aberto) return;
    const anterior = document.activeElement as HTMLElement | null;
    const overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    painel.current?.focus();
    return () => {
      document.body.style.overflow = overflowAnterior;
      anterior?.focus?.();
    };
  }, [aberto]);

  function prenderFoco(evento: KeyboardEvent<HTMLDivElement>) {
    const caixa = painel.current;
    if (!caixa) return;
    const alvos = [...caixa.querySelectorAll<HTMLElement>(FOCAVEIS)];
    if (alvos.length === 0) {
      evento.preventDefault();
      caixa.focus();
      return;
    }
    const primeiro = alvos[0];
    const ultimo = alvos[alvos.length - 1];
    if (!primeiro || !ultimo) return;
    const ativo = document.activeElement;
    if (evento.shiftKey && (ativo === primeiro || ativo === caixa)) {
      evento.preventDefault();
      ultimo.focus();
    } else if (!evento.shiftKey && ativo === ultimo) {
      evento.preventDefault();
      primeiro.focus();
    }
  }

  function aoTeclar(evento: KeyboardEvent<HTMLDivElement>) {
    if (evento.key === 'Escape') {
      evento.stopPropagation();
      aoFechar();
      return;
    }
    if (evento.key === 'Tab') prenderFoco(evento);
  }

  if (!aberto) return null;

  return createPortal(
    <div
      className="animar-fundo fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4"
      onMouseDown={(evento) => {
        if (fecharNoFundo && evento.target === evento.currentTarget) aoFechar();
      }}
    >
      <div
        ref={painel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={idTitulo}
        aria-describedby={descricao ? idDescricao : undefined}
        tabIndex={-1}
        onKeyDown={aoTeclar}
        className={juntarClasses(
          'animar-painel max-h-[90dvh] w-full overflow-y-auto rounded-t-xl border border-borda bg-superficie-elevada p-4 shadow-flutuante sm:rounded-xl sm:p-6',
          LARGURAS[tamanho],
        )}
      >
        <div className="mb-3 flex items-start justify-between gap-3">
          <h2 id={idTitulo} className="text-lg font-semibold">
            {titulo}
          </h2>
          <BotaoIcone icone="fechar" rotulo={rotuloFechar} variante="discreta" onClick={aoFechar} />
        </div>
        {descricao ? (
          <p id={idDescricao} className="text-texto-suave">
            {descricao}
          </p>
        ) : null}
        {children ? <div className="mt-4">{children}</div> : null}
        {acoes ? (
          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">{acoes}</div>
        ) : null}
      </div>
    </div>,
    document.body,
  );
}

export interface DialogoConfirmacaoProps {
  aberto: boolean;
  aoFechar: () => void;
  aoConfirmar: () => void;
  titulo: string;
  descricao?: ReactNode;
  children?: ReactNode;
  rotuloConfirmar?: string;
  rotuloCancelar?: string;
  varianteConfirmar?: VarianteBotao;
  carregando?: boolean;
}

/** Diálogo com duas saídas claras: confirmar a ação ou voltar. */
export function DialogoConfirmacao({
  aberto,
  aoFechar,
  aoConfirmar,
  titulo,
  descricao,
  children,
  rotuloConfirmar = 'Confirmar',
  rotuloCancelar = 'Cancelar',
  varianteConfirmar = 'primaria',
  carregando = false,
}: DialogoConfirmacaoProps) {
  return (
    <Dialogo
      aberto={aberto}
      aoFechar={aoFechar}
      titulo={titulo}
      descricao={descricao}
      acoes={
        <>
          <Botao variante="neutra" onClick={aoFechar} disabled={carregando}>
            {rotuloCancelar}
          </Botao>
          <Botao variante={varianteConfirmar} onClick={aoConfirmar} carregando={carregando}>
            {rotuloConfirmar}
          </Botao>
        </>
      }
    >
      {children}
    </Dialogo>
  );
}
