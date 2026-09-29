import { juntarClasses } from '../utilitarios/classes';

export type VarianteBotao = 'primaria' | 'secundaria' | 'neutra' | 'discreta' | 'perigo';
export type TamanhoBotao = 'pequeno' | 'medio' | 'grande';

export interface OpcoesClassesBotao {
  variante?: VarianteBotao;
  tamanho?: TamanhoBotao;
  largo?: boolean;
  /** Botão quadrado, sem rótulo visível ao lado do ícone. */
  apenasIcone?: boolean;
  className?: string;
}

const BASE =
  'inline-flex items-center justify-center gap-2 rounded-md font-medium whitespace-nowrap select-none transition-colors duration-150 ease-suave disabled:cursor-not-allowed disabled:opacity-60';

const VARIANTES: Record<VarianteBotao, string> = {
  primaria: 'bg-primaria text-primaria-contraste hover:bg-primaria-forte',
  secundaria: 'border border-primaria bg-superficie text-primaria hover:bg-primaria-suave',
  neutra: 'border border-borda-forte bg-superficie text-texto hover:bg-superficie-suave',
  discreta: 'text-primaria hover:bg-primaria-suave',
  perigo: 'bg-erro text-texto-invertido hover:brightness-95 dark:hover:brightness-110',
};

/* Todo tamanho respeita o alvo mínimo de toque de 44 px. */
const TAMANHOS: Record<TamanhoBotao, string> = {
  pequeno: 'min-h-toque px-3 text-sm',
  medio: 'min-h-toque px-4 text-base',
  grande: 'min-h-12 px-5 text-lg',
};

/* Sem shrink-0, ao lado de um campo de largura total o botão encolhe abaixo do alvo de toque. */
const TAMANHOS_ICONE: Record<TamanhoBotao, string> = {
  pequeno: 'size-toque shrink-0',
  medio: 'size-toque shrink-0',
  grande: 'size-12 shrink-0',
};

export function classesBotao({
  variante = 'primaria',
  tamanho = 'medio',
  largo = false,
  apenasIcone = false,
  className,
}: OpcoesClassesBotao = {}): string {
  return juntarClasses(
    BASE,
    VARIANTES[variante],
    apenasIcone ? TAMANHOS_ICONE[tamanho] : TAMANHOS[tamanho],
    largo && 'w-full',
    className,
  );
}
