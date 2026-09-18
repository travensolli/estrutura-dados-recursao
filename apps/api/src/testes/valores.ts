/** Campos que carregam valor de sequência e precisam sair como texto decimal. */
const CAMPOS_DE_VALOR = new Set(['valor', 'invocacoes_previstas']);
const CAMPOS_DE_LISTA = new Set(['primeiros_termos']);

const ehTextoDecimal = (valor: unknown): boolean =>
  typeof valor === 'string' && /^\d+$/.test(valor);

function inspecionar(valor: unknown, caminho: string, achados: string[]): void {
  if (typeof valor === 'bigint') {
    achados.push(`${caminho}: bigint cru`);
    return;
  }
  if (Array.isArray(valor)) {
    valor.forEach((item, indice) => inspecionar(item, `${caminho}[${indice}]`, achados));
    return;
  }
  if (typeof valor !== 'object' || valor === null) return;

  for (const [chave, conteudo] of Object.entries(valor)) {
    const filho = caminho === '' ? chave : `${caminho}.${chave}`;
    if (CAMPOS_DE_VALOR.has(chave) && !ehTextoDecimal(conteudo)) {
      achados.push(`${filho}: ${typeof conteudo}`);
    }
    if (CAMPOS_DE_LISTA.has(chave) && Array.isArray(conteudo)) {
      conteudo.forEach((item, indice) => {
        if (!ehTextoDecimal(item)) achados.push(`${filho}[${indice}]: ${typeof item}`);
      });
    }
    inspecionar(conteudo, filho, achados);
  }
}

/** Lista os campos que deveriam ser texto decimal e não são; vazio é o esperado. */
export function valoresForaDoFormato(corpo: unknown): string[] {
  const achados: string[] = [];
  inspecionar(corpo, '', achados);
  return achados;
}
