import { TEMPO_LIMITE_MS_PADRAO } from '@sequencias/contrato';
import { INTERVALO_AMOSTRAGEM_PADRAO } from './medicao/memoria';

/** Pilha ampliada do worker, em MB: a recursão com cache chega a milhares de quadros. */
export const PILHA_MB_PADRAO = 64;

function numero(chave: string, padrao: number): number {
  const bruto = process.env[chave];
  const valor = bruto === undefined ? Number.NaN : Number(bruto);
  return Number.isFinite(valor) && valor > 0 ? valor : padrao;
}

export const config = {
  porta: numero('PORTA', 3333),
  host: process.env.HOST ?? '0.0.0.0',
  versao: process.env.VERSAO_APP ?? '1.4.0',
  tempoLimiteMs: numero('TEMPO_LIMITE_MS', TEMPO_LIMITE_MS_PADRAO),
  pilhaMb: numero('PILHA_MB', PILHA_MB_PADRAO),
  intervaloAmostragemMemoria: numero('INTERVALO_AMOSTRAGEM', INTERVALO_AMOSTRAGEM_PADRAO),
};
