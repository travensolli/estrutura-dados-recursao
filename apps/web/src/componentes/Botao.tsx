import type { ComponentPropsWithRef, ReactNode } from 'react';
import { Link, type LinkProps } from 'react-router';
import { juntarClasses } from '../utilitarios/classes';
import { classesBotao, type TamanhoBotao, type VarianteBotao } from './estilos-botao';
import { Icone, type NomeIcone } from './Icone';

interface PropsComuns {
  variante?: VarianteBotao;
  tamanho?: TamanhoBotao;
  icone?: NomeIcone;
  iconeFinal?: NomeIcone;
  /** Ocupa toda a largura disponível. */
  largo?: boolean;
}

export interface BotaoProps extends ComponentPropsWithRef<'button'>, PropsComuns {
  carregando?: boolean;
  /** Texto exibido enquanto `carregando` for verdadeiro. */
  rotuloCarregando?: string;
}

export function Botao({
  variante,
  tamanho,
  icone,
  iconeFinal,
  largo,
  carregando = false,
  rotuloCarregando,
  className,
  children,
  disabled,
  type = 'button',
  ...rest
}: BotaoProps) {
  return (
    <button
      type={type}
      className={classesBotao({ variante, tamanho, largo, className })}
      disabled={disabled || carregando}
      aria-busy={carregando || undefined}
      {...rest}
    >
      {carregando ? (
        <Icone nome="carregando" className="animate-spin" />
      ) : icone ? (
        <Icone nome={icone} />
      ) : null}
      <span>{carregando && rotuloCarregando ? rotuloCarregando : children}</span>
      {iconeFinal && !carregando ? <Icone nome={iconeFinal} /> : null}
    </button>
  );
}

export interface BotaoIconeProps extends Omit<ComponentPropsWithRef<'button'>, 'children'> {
  icone: NomeIcone;
  /** Nome acessível do botão: obrigatório, já que não há texto visível. */
  rotulo: string;
  variante?: VarianteBotao;
  tamanho?: TamanhoBotao;
  tamanhoIcone?: number;
}

/** Botão quadrado só com ícone, sempre com nome acessível e o piso de alvo. */
export function BotaoIcone({
  icone,
  rotulo,
  variante = 'neutra',
  tamanho = 'medio',
  tamanhoIcone = 20,
  className,
  type = 'button',
  ...rest
}: BotaoIconeProps) {
  return (
    <button
      type={type}
      aria-label={rotulo}
      title={rotulo}
      className={classesBotao({ variante, tamanho, apenasIcone: true, className })}
      {...rest}
    >
      <Icone nome={icone} tamanho={tamanhoIcone} />
    </button>
  );
}

export interface BotaoLinkProps extends Omit<LinkProps, 'className'>, PropsComuns {
  className?: string;
}

/** Link do React Router com aparência de botão. */
export function BotaoLink({
  variante,
  tamanho,
  icone,
  iconeFinal,
  largo,
  className,
  children,
  ...rest
}: BotaoLinkProps) {
  return (
    <Link className={classesBotao({ variante, tamanho, largo, className })} {...rest}>
      {icone ? <Icone nome={icone} /> : null}
      <span>{children}</span>
      {iconeFinal ? <Icone nome={iconeFinal} /> : null}
    </Link>
  );
}

export interface GrupoBotoesProps {
  children: ReactNode;
  className?: string;
}

/** Linha de botões que vira coluna no celular. */
export function GrupoBotoes({ children, className }: GrupoBotoesProps) {
  return (
    <div className={juntarClasses('flex flex-col gap-2 sm:flex-row sm:flex-wrap', className)}>
      {children}
    </div>
  );
}
