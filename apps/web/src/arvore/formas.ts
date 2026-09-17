import type { TipoNo } from '@sequencias/contrato';

/**
 * Cada tipo de nó tem silhueta e marca próprias, para continuar legível em
 * preto e branco: a cor carrega só o argumento.
 */
export interface EstiloTipo {
  /** `d` do contorno do nó, centrado na origem. */
  caminho: string;
  /** `d` da marca interna, centrada na origem. */
  marca: string;
  tracejado?: string;
  /** Variável CSS da cor de apoio do tipo. */
  cor: string;
  rotulo: string;
}

function retanguloArredondado(largura: number, altura: number, raio: number): string {
  const x = largura / 2;
  const y = altura / 2;
  const r = Math.min(raio, x, y);
  return [
    `M ${-x + r} ${-y}`,
    `H ${x - r}`,
    `A ${r} ${r} 0 0 1 ${x} ${-y + r}`,
    `V ${y - r}`,
    `A ${r} ${r} 0 0 1 ${x - r} ${y}`,
    `H ${-x + r}`,
    `A ${r} ${r} 0 0 1 ${-x} ${y - r}`,
    `V ${-y + r}`,
    `A ${r} ${r} 0 0 1 ${-x + r} ${-y}`,
    'Z',
  ].join(' ');
}

function cantosCortados(largura: number, altura: number, corte: number): string {
  const x = largura / 2;
  const y = altura / 2;
  const c = Math.min(corte, x, y);
  return [
    `M ${-x + c} ${-y}`,
    `H ${x - c}`,
    `L ${x} ${-y + c}`,
    `V ${y - c}`,
    `L ${x - c} ${y}`,
    `H ${-x + c}`,
    `L ${-x} ${y - c}`,
    `V ${-y + c}`,
    'Z',
  ].join(' ');
}

function circulo(raio: number): string {
  return `M ${-raio} 0 a ${raio} ${raio} 0 1 0 ${2 * raio} 0 a ${raio} ${raio} 0 1 0 ${-2 * raio} 0 Z`;
}

function quadrado(lado: number): string {
  const m = lado / 2;
  return `M ${-m} ${-m} H ${m} V ${m} H ${-m} Z`;
}

function triangulo(lado: number): string {
  const m = lado / 2;
  return `M 0 ${-m} L ${m} ${m} L ${-m} ${m} Z`;
}

const MARCA = 9;

export function estiloDoTipo(tipo: TipoNo, largura: number, altura: number): EstiloTipo {
  if (tipo === 'base') {
    return {
      caminho: retanguloArredondado(largura, altura, altura / 2),
      marca: circulo(MARCA / 2),
      cor: 'var(--no-base)',
      rotulo: 'caso base',
    };
  }
  if (tipo === 'acerto_cache') {
    return {
      caminho: cantosCortados(largura, altura, 12),
      marca: triangulo(MARCA),
      tracejado: '7 4',
      cor: 'var(--no-acerto)',
      rotulo: 'acerto de cache',
    };
  }
  return {
    caminho: retanguloArredondado(largura, altura, 10),
    marca: quadrado(MARCA - 1),
    cor: 'var(--no-calculado)',
    rotulo: 'calculado',
  };
}

/** Curva suave de pai para filho, saindo pela base e entrando pelo topo. */
export function caminhoDaLigacao(
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  altura: number,
): string {
  const saida = y0 + altura / 2;
  const entrada = y1 - altura / 2;
  const meio = (saida + entrada) / 2;
  return `M ${x0} ${saida} C ${x0} ${meio}, ${x1} ${meio}, ${x1} ${entrada}`;
}
