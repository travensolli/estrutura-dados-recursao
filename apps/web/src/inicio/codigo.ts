import type { Modo, Sequencia } from '@sequencias/contrato';
import fontePuras from '../../../../packages/nucleo/src/puros.ts?raw';

/** Nome da função pura de cada sequência e modo em packages/nucleo/src/puros.ts. */
export function nomeDaFuncao(sequencia: Sequencia, modo: Modo): string {
  return `${sequencia}${modo === 'sem_cache' ? 'SemCache' : 'ComCache'}`;
}

/** Recorta da fonte a função exportada, do `export function` até a chave que a fecha na coluna 0. */
export function recortarFuncao(fonte: string, nome: string): string {
  const inicio = fonte.indexOf(`export function ${nome}(`);
  if (inicio < 0) throw new Error(`A função ${nome} não está em puros.ts.`);
  const fim = fonte.indexOf('\n}', inicio);
  if (fim < 0) throw new Error(`A função ${nome} não fecha em puros.ts.`);
  return fonte.slice(inicio, fim + 2);
}

/** Linhas em que a função consulta ou grava o cache: o que a versão com cache acrescenta. */
export const LINHA_DO_CACHE = /cache\.(get|set)\(|guardado/;

/** O código que o app executa e cronometra, lido do próprio arquivo no build. */
export function codigoDaFuncao(sequencia: Sequencia, modo: Modo): string {
  return recortarFuncao(fontePuras, nomeDaFuncao(sequencia, modo));
}
