import type { SVGProps } from 'react';
import { juntarClasses } from '../utilitarios/classes';

export type NomeIcone =
  | 'info'
  | 'alerta'
  | 'erro'
  | 'sucesso'
  | 'copiar'
  | 'verificado'
  | 'expandir'
  | 'colapsar'
  | 'sol'
  | 'lua'
  | 'menu'
  | 'fechar'
  | 'inicio'
  | 'apresentacao'
  | 'arvore'
  | 'calcular'
  | 'comparar'
  | 'seta-direita'
  | 'seta-esquerda'
  | 'carregando'
  | 'tentar'
  | 'reduzir'
  | 'tabela'
  | 'cancelar'
  | 'mais'
  | 'menos'
  | 'relogio'
  | 'memoria';

/* Traços em viewBox 24, desenhados com stroke para herdar a cor do texto. */
const TRACOS: Record<NomeIcone, string[]> = {
  info: ['M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z', 'M12 16v-4', 'M12 8h.01'],
  alerta: [
    'M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z',
    'M12 9v4',
    'M12 17h.01',
  ],
  erro: ['M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z', 'M15 9l-6 6', 'M9 9l6 6'],
  sucesso: ['M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z', 'M8.5 12.5l2.5 2.5 4.5-5'],
  copiar: ['M9 9h11v11H9z', 'M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1'],
  verificado: ['M5 12.5l4.5 4.5L19 7'],
  expandir: ['M6 9l6 6 6-6'],
  colapsar: ['M18 15l-6-6-6 6'],
  sol: [
    'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z',
    'M12 2v2',
    'M12 20v2',
    'M4.9 4.9l1.4 1.4',
    'M17.7 17.7l1.4 1.4',
    'M2 12h2',
    'M20 12h2',
    'M6.3 17.7l-1.4 1.4',
    'M19.1 4.9l-1.4 1.4',
  ],
  lua: ['M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z'],
  menu: ['M4 6h16', 'M4 12h16', 'M4 18h16'],
  fechar: ['M18 6 6 18', 'M6 6l12 12'],
  inicio: ['M3 10.5 12 3l9 7.5', 'M5.5 9.5V20h13V9.5', 'M9.5 20v-6h5v6'],
  apresentacao: ['M3 5h18v11H3z', 'M8 21h8', 'M12 16v5', 'M10 8.5v4l3.5-2z'],
  arvore: [
    'M12 3a2 2 0 1 0 0 4 2 2 0 0 0 0-4z',
    'M5 17a2 2 0 1 0 0 4 2 2 0 0 0 0-4z',
    'M12 17a2 2 0 1 0 0 4 2 2 0 0 0 0-4z',
    'M19 17a2 2 0 1 0 0 4 2 2 0 0 0 0-4z',
    'M12 7v4',
    'M12 11H5v6',
    'M12 11v6',
    'M12 11h7v6',
  ],
  calcular: ['M4 3h16v18H4z', 'M8 7h8', 'M8 12h3', 'M13 12h3', 'M8 16h3', 'M13 16h3'],
  comparar: ['M6 20v-7', 'M12 20V6', 'M18 20v-10', 'M3 20h18'],
  'seta-direita': ['M5 12h14', 'M13 6l6 6-6 6'],
  'seta-esquerda': ['M19 12H5', 'M11 6l-6 6 6 6'],
  carregando: ['M21 12a9 9 0 1 1-6.2-8.6'],
  tentar: ['M21 12a9 9 0 1 1-2.6-6.4', 'M21 3v6h-6'],
  reduzir: ['M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z', 'M8 12h8'],
  tabela: ['M3 5h18v14H3z', 'M3 10h18', 'M3 15h18', 'M9 5v14', 'M15 5v14'],
  cancelar: ['M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z', 'M5.6 5.6l12.8 12.8'],
  mais: ['M12 5v14', 'M5 12h14'],
  menos: ['M5 12h14'],
  relogio: ['M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z', 'M12 7v5.5l3.5 2'],
  memoria: ['M6 6h12v12H6z', 'M9 3v3', 'M15 3v3', 'M9 18v3', 'M15 18v3', 'M3 9h3', 'M3 15h3'],
};

export interface IconeProps extends Omit<SVGProps<SVGSVGElement>, 'name'> {
  nome: NomeIcone;
  tamanho?: number;
  /** Quando informado, o ícone vira imagem acessível; sem ele é decorativo. */
  titulo?: string;
}

export function Icone({ nome, tamanho = 20, titulo, className, ...rest }: IconeProps) {
  return (
    <svg
      width={tamanho}
      height={tamanho}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={titulo ? undefined : true}
      role={titulo ? 'img' : undefined}
      aria-label={titulo}
      focusable="false"
      className={juntarClasses('shrink-0', className)}
      {...rest}
    >
      {titulo ? <title>{titulo}</title> : null}
      {TRACOS[nome].map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}
