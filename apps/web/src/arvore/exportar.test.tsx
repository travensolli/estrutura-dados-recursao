import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { executarInstrumentado } from '../plano-b/nucleo-adaptador';
import { ArvoreSvg } from './ArvoreSvg';
import { baixarArquivo, nomeDoArquivo, serializarSvg } from './exportar';
import { calcularLayout } from './layout';

function desenhar() {
  const execucao = executarInstrumentado('tribonacci', 7, 'sem_cache', { comArvore: true });
  if (!execucao.raiz) throw new Error('execução sem árvore');
  render(
    <ArvoreSvg
      raiz={execucao.raiz}
      metricas={execucao.metricas}
      sequencia="tribonacci"
      n={7}
      modo="sem_cache"
    />,
  );
  const svg = screen.getByRole('img') as unknown as SVGSVGElement;
  const { caixa } = calcularLayout(execucao.raiz, new Set<number>());
  return { svg, caixa };
}

describe('nomeDoArquivo', () => {
  it('usa o formato arvore-sequencia-fN-modo', () => {
    const alvo = { sequencia: 'tribonacci', n: 7, modo: 'sem_cache' } as const;
    expect(nomeDoArquivo(alvo, 'svg')).toBe('arvore-tribonacci-f7-sem_cache.svg');
    expect(nomeDoArquivo(alvo, 'png')).toBe('arvore-tribonacci-f7-sem_cache.png');
    expect(nomeDoArquivo({ sequencia: 'fibonacci', n: 10, modo: 'com_cache' }, 'png')).toBe(
      'arvore-fibonacci-f10-com_cache.png',
    );
  });
});

describe('serializarSvg', () => {
  it('não deixa variável CSS no arquivo exportado', () => {
    const { svg, caixa } = desenhar();
    expect(svg.outerHTML).toContain('var(--');

    const texto = serializarSvg({ svg, caixa, titulo: 'Tribonacci f(7) sem cache' });
    expect(texto).not.toContain('var(--');
    expect(texto).toContain('#');
  });

  it('gera um SVG autossuficiente e enquadrado na árvore inteira', () => {
    const { svg, caixa } = desenhar();
    const texto = serializarSvg({ svg, caixa, titulo: 'Tribonacci f(7) sem cache' });

    expect(texto).toContain('xmlns="http://www.w3.org/2000/svg"');
    expect(texto).toContain(`viewBox="${caixa.x} ${caixa.y} ${caixa.largura} ${caixa.altura}"`);
    expect(texto).toContain(`width="${Math.round(caixa.largura)}"`);
    expect(texto).toContain('<title>Tribonacci f(7) sem cache</title>');
    expect(texto).toContain('font-family=');
    expect(texto).not.toContain('tabindex');
    expect(texto).not.toContain('class=');
  });

  it('não altera o desenho que está na tela', () => {
    const { svg, caixa } = desenhar();
    const antes = svg.outerHTML;
    serializarSvg({ svg, caixa, titulo: 'Tribonacci f(7) sem cache' });
    expect(svg.outerHTML).toBe(antes);
  });
});

describe('baixarArquivo', () => {
  const criar = vi.fn(() => 'blob:teste');
  const revogar = vi.fn();
  afterEach(() => vi.restoreAllMocks());

  it('dispara o download com o nome pedido', () => {
    vi.stubGlobal('URL', Object.assign(URL, { createObjectURL: criar, revokeObjectURL: revogar }));
    const clicar = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (
      this: HTMLAnchorElement,
    ) {
      expect(this.download).toBe('arvore-tribonacci-f7-sem_cache.svg');
      expect(this.href).toBe('blob:teste');
      expect(this.isConnected).toBe(true);
    });

    baixarArquivo('arvore-tribonacci-f7-sem_cache.svg', new Blob(['<svg />']));

    expect(clicar).toHaveBeenCalledTimes(1);
    expect(document.querySelector('a')).toBeNull();
  });
});
