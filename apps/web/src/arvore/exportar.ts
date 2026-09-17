import type { Modo, Sequencia } from '@sequencias/contrato';
import type { Caixa } from './layout';

const NS_SVG = 'http://www.w3.org/2000/svg';
const PADRAO_VARIAVEL = /var\(\s*(--[\w-]+)\s*(?:,([^()]*))?\)/g;

/** Usados quando o ambiente não resolve as variáveis (jsdom dos testes). */
const COR_ALTERNATIVA = '#000000';
const FUNDO_ALTERNATIVO = '#ffffff';
const FONTE_ALTERNATIVA = 'ui-sans-serif, system-ui, sans-serif';
const FONTE_MONO_ALTERNATIVA = 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';

/** Atributos que só fazem sentido na página, não no arquivo exportado. */
const ATRIBUTOS_DESCARTADOS = ['class', 'tabindex', 'role', 'aria-expanded', 'aria-label'];

export type Extensao = 'svg' | 'png';

export interface AlvoArvore {
  sequencia: Sequencia;
  n: number;
  modo: Modo;
}

export function nomeDoArquivo(alvo: AlvoArvore, extensao: Extensao): string {
  return `arvore-${alvo.sequencia}-f${alvo.n}-${alvo.modo}.${extensao}`;
}

export interface OpcoesExportacao {
  /** SVG desenhado na tela; o original não é alterado. */
  svg: SVGSVGElement;
  /** Área da árvore inteira: o arquivo ignora o zoom atual. */
  caixa: Caixa;
  titulo: string;
  /** Multiplicador da resolução do PNG. */
  escala?: number;
}

function criarResolvedor(estilo: CSSStyleDeclaration | null) {
  return (valor: string, alternativa = COR_ALTERNATIVA): string =>
    valor.replace(PADRAO_VARIAVEL, (_todo, nome: string, reserva?: string) => {
      const resolvido = estilo?.getPropertyValue(nome).trim() ?? '';
      return resolvido || reserva?.trim() || alternativa;
    });
}

function estiloCalculado(elemento: Element): CSSStyleDeclaration | null {
  return typeof getComputedStyle === 'function' ? getComputedStyle(elemento) : null;
}

/**
 * Serializa a árvore em SVG autossuficiente: sem variáveis CSS, sem classes do
 * Tailwind e com a caixa inteira, não o recorte visível.
 */
export function serializarSvg({ svg, caixa, titulo }: OpcoesExportacao): string {
  const estilo = estiloCalculado(svg);
  const resolver = criarResolvedor(estilo);
  const fonte = (variavel: string, alternativa: string) =>
    resolver(variavel, alternativa).replace(/\s+/g, ' ').trim();
  const fonteTexto = fonte('var(--font-sans)', FONTE_ALTERNATIVA);
  const fonteMono = fonte('var(--font-mono)', FONTE_MONO_ALTERNATIVA);

  const copia = svg.cloneNode(true) as SVGSVGElement;
  const largura = Math.max(1, Math.round(caixa.largura));
  const altura = Math.max(1, Math.round(caixa.altura));
  copia.setAttribute('xmlns', NS_SVG);
  copia.setAttribute('viewBox', `${caixa.x} ${caixa.y} ${caixa.largura} ${caixa.altura}`);
  copia.setAttribute('width', String(largura));
  copia.setAttribute('height', String(altura));
  copia.setAttribute('font-family', fonteTexto);
  copia.removeAttribute('style');
  copia.removeAttribute('class');

  for (const elemento of [copia, ...copia.querySelectorAll('*')]) {
    const monoespacada = elemento.getAttribute('class')?.includes('font-mono') ?? false;
    for (const atributo of [...elemento.attributes]) {
      if (elemento !== copia && ATRIBUTOS_DESCARTADOS.includes(atributo.name)) {
        elemento.removeAttribute(atributo.name);
        continue;
      }
      if (atributo.value.includes('var(')) {
        elemento.setAttribute(atributo.name, resolver(atributo.value));
      }
    }
    if (monoespacada) elemento.setAttribute('font-family', fonteMono);
  }

  // O zoom da tela não vai para o arquivo: a caixa já enquadra tudo.
  copia.querySelector('[data-camada="conteudo"]')?.removeAttribute('transform');

  const fundo = document.createElementNS(NS_SVG, 'rect');
  fundo.setAttribute('x', String(caixa.x));
  fundo.setAttribute('y', String(caixa.y));
  fundo.setAttribute('width', String(caixa.largura));
  fundo.setAttribute('height', String(caixa.altura));
  fundo.setAttribute('fill', resolver('var(--superficie)', FUNDO_ALTERNATIVO));
  copia.insertBefore(fundo, copia.firstChild);

  const rotulo = document.createElementNS(NS_SVG, 'title');
  rotulo.textContent = titulo;
  copia.insertBefore(rotulo, copia.firstChild);

  return new XMLSerializer().serializeToString(copia);
}

function carregarImagem(url: string): Promise<HTMLImageElement> {
  return new Promise((resolver, rejeitar) => {
    const imagem = new Image();
    imagem.onload = () => resolver(imagem);
    imagem.onerror = () => rejeitar(new Error('Não deu para desenhar a árvore no canvas.'));
    imagem.src = url;
  });
}

/** Desenha o SVG num canvas em escala maior: 2x fica nítido no projetor. */
export async function gerarPng(opcoes: OpcoesExportacao): Promise<Blob> {
  const escala = opcoes.escala ?? 2;
  const texto = serializarSvg(opcoes);
  const url = URL.createObjectURL(new Blob([texto], { type: 'image/svg+xml;charset=utf-8' }));
  try {
    const imagem = await carregarImagem(url);
    const largura = Math.max(1, Math.round(opcoes.caixa.largura * escala));
    const altura = Math.max(1, Math.round(opcoes.caixa.altura * escala));
    const canvas = document.createElement('canvas');
    canvas.width = largura;
    canvas.height = altura;
    const contexto = canvas.getContext('2d');
    if (!contexto) throw new Error('Este navegador não deixa gerar o PNG.');
    contexto.drawImage(imagem, 0, 0, largura, altura);
    return await new Promise<Blob>((resolver, rejeitar) => {
      canvas.toBlob(
        (blob) => (blob ? resolver(blob) : rejeitar(new Error('O PNG saiu vazio.'))),
        'image/png',
      );
    });
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function baixarArquivo(nome: string, blob: Blob): void {
  const url = URL.createObjectURL(blob);
  const ligacao = document.createElement('a');
  ligacao.href = url;
  ligacao.download = nome;
  document.body.append(ligacao);
  ligacao.click();
  ligacao.remove();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

export function baixarSvg(alvo: AlvoArvore, opcoes: OpcoesExportacao): void {
  const texto = serializarSvg(opcoes);
  baixarArquivo(
    nomeDoArquivo(alvo, 'svg'),
    new Blob([texto], { type: 'image/svg+xml;charset=utf-8' }),
  );
}

export async function baixarPng(alvo: AlvoArvore, opcoes: OpcoesExportacao): Promise<void> {
  baixarArquivo(nomeDoArquivo(alvo, 'png'), await gerarPng(opcoes));
}
