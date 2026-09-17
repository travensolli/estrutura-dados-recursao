export {
  fatorialComCache,
  fatorialSemCache,
  fibonacciComCache,
  fibonacciSemCache,
  tribonacciComCache,
  tribonacciSemCache,
} from './puros';
export type { OpcoesInstrumentacao, ResultadoInstrumentado } from './instrumentacao';
export {
  fatorialComCacheInstrumentado,
  fatorialSemCacheInstrumentado,
  fibonacciComCacheInstrumentado,
  fibonacciSemCacheInstrumentado,
  tribonacciComCacheInstrumentado,
  tribonacciSemCacheInstrumentado,
} from './instrumentados';
export { executarInstrumentado, executarPuro } from './fachadas';
export { arvoreParaTexto, descreverNo } from './arvore';
export { executarProtegido, validarN } from './validacao';
export { estimarInvocacoes, estimarProfundidade } from './estimativa';
