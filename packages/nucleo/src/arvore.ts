import type { No } from '@sequencias/contrato';

const ROTULO_TIPO: Record<No['tipo'], string> = {
  base: 'base',
  calculado: 'calculado',
  acerto_cache: 'acerto de cache',
};

/** Linha de um nó: "f(3) = 3 [calculado]". */
export function descreverNo(no: No): string {
  return `f(${no.argumento}) = ${no.valor} [${ROTULO_TIPO[no.tipo]}]`;
}

/**
 * Árvore em texto indentado (dois espaços por nível), em pré-ordem. Percurso
 * iterativo para não depender da pilha em árvores profundas. Subárvores
 * colapsadas pelo orçamento aparecem como "+N descendentes ocultos".
 */
export function arvoreParaTexto(raiz: No): string {
  const linhas: string[] = [];
  const pendentes: No[] = [raiz];
  while (pendentes.length > 0) {
    const no = pendentes.pop();
    if (no === undefined) break;
    const recuo = '  '.repeat(no.profundidade - raiz.profundidade);
    linhas.push(`${recuo}${descreverNo(no)}`);
    const ocultos = no.descendentes_ocultos ?? 0;
    if (ocultos > 0) {
      const rotulo = ocultos === 1 ? 'descendente oculto' : 'descendentes ocultos';
      linhas.push(`${recuo}  +${ocultos} ${rotulo}`);
    }
    for (let i = no.filhos.length - 1; i >= 0; i -= 1) {
      const filho = no.filhos[i];
      if (filho !== undefined) pendentes.push(filho);
    }
  }
  return linhas.join('\n');
}
