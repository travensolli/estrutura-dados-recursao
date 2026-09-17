import { ErroSequencia, type Erro } from '@sequencias/contrato';

const MENSAGEM_PILHA =
  'A recursão ficou profunda demais para a pilha disponível. Tente um n menor ou o modo com cache.';
const MENSAGEM_MEMORIA =
  'O cálculo pediu mais memória do que o worker tem disponível. Tente um n menor.';
const MENSAGEM_INTERNA = 'Não foi possível concluir o cálculo. Tente de novo ou use um n menor.';
const MENSAGEM_ENCERRADO = 'O cálculo foi encerrado antes de terminar.';

export function mensagemDeTempoLimite(tempoLimiteMs: number): string {
  const segundos = (tempoLimiteMs / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 1 });
  return `O cálculo passou de ${segundos} s e foi interrompido. Tente um n menor ou o modo com cache.`;
}

export function erroDeTempoLimite(tempoLimiteMs: number): ErroSequencia {
  return new ErroSequencia('TEMPO_LIMITE', mensagemDeTempoLimite(tempoLimiteMs), {
    tempo_limite_ms: tempoLimiteMs,
  });
}

export function erroDeEncerramento(codigo: number): ErroSequencia {
  return new ErroSequencia('ERRO_INTERNO', MENSAGEM_ENCERRADO, { codigo_saida: codigo });
}

/** Estouro de pilha chega como RangeError, inclusive depois de cruzar o worker. */
export function ehEstouroDePilha(erro: unknown): boolean {
  return (
    erro instanceof Error &&
    (erro instanceof RangeError || erro.name === 'RangeError') &&
    erro.message.includes('Maximum call stack size exceeded')
  );
}

function ehFaltaDeMemoria(erro: unknown): boolean {
  return erro instanceof Error && (erro as { code?: string }).code === 'ERR_WORKER_OUT_OF_MEMORY';
}

/** Traduz qualquer falha para o erro de domínio com código estável. */
export function paraErroSequencia(erro: unknown): ErroSequencia {
  if (erro instanceof ErroSequencia) return erro;
  if (ehEstouroDePilha(erro)) return new ErroSequencia('PILHA_ESTOURADA', MENSAGEM_PILHA);
  if (ehFaltaDeMemoria(erro)) return new ErroSequencia('ERRO_INTERNO', MENSAGEM_MEMORIA);
  const original = erro instanceof Error ? erro.message : String(erro);
  return new ErroSequencia('ERRO_INTERNO', MENSAGEM_INTERNA, { original });
}

export function paraErroJson(erro: unknown): Erro {
  return paraErroSequencia(erro).paraJson();
}

/** Refaz o erro do outro lado da fronteira do worker, que só trafega JSON. */
export function deErroJson(erro: Erro): ErroSequencia {
  return new ErroSequencia(erro.codigo, erro.mensagem, erro.detalhes);
}
