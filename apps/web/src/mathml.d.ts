import type { DetailedHTMLProps, HTMLAttributes } from 'react';

/* As fórmulas usam MathML, que o navegador desenha com a fonte matemática do
   sistema. O React cria os elementos no namespace certo sozinho; faltam só os
   tipos, porque o @types/react não traz as tags do MathML. */

type PropsMathMl<Extras = object> = DetailedHTMLProps<
  HTMLAttributes<MathMLElement>,
  MathMLElement
> &
  Extras;

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      math: PropsMathMl<{ display?: 'block' | 'inline' }>;
      mrow: PropsMathMl;
      mi: PropsMathMl<{ mathvariant?: 'normal' }>;
      mn: PropsMathMl;
      mo: PropsMathMl<{ stretchy?: 'true' | 'false'; form?: 'prefix' | 'infix' | 'postfix' }>;
      mtext: PropsMathMl;
      mspace: PropsMathMl<{ width?: string }>;
      mtable: PropsMathMl;
      mtr: PropsMathMl;
      mtd: PropsMathMl;
    }
  }
}
