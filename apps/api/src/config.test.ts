import { TEMPO_LIMITE_MS_PADRAO } from '@sequencias/contrato';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PILHA_MB_PADRAO, config } from './config';
import { INTERVALO_AMOSTRAGEM_PADRAO } from './medicao/memoria';

const ORIGINAL = { ...process.env };

afterEach(() => {
  process.env = { ...ORIGINAL };
  vi.resetModules();
});

describe('config', () => {
  it('usa o tempo limite do contrato e a pilha ampliada como padrões', () => {
    expect(config.tempoLimiteMs).toBe(TEMPO_LIMITE_MS_PADRAO);
    expect(config.pilhaMb).toBe(PILHA_MB_PADRAO);
    expect(config.intervaloAmostragemMemoria).toBe(INTERVALO_AMOSTRAGEM_PADRAO);
  });

  it('lê os números do ambiente', async () => {
    vi.resetModules();
    process.env.TEMPO_LIMITE_MS = '2500';
    process.env.PILHA_MB = '16';
    process.env.INTERVALO_AMOSTRAGEM = '500';
    const recarregado = await import('./config');
    expect(recarregado.config.tempoLimiteMs).toBe(2500);
    expect(recarregado.config.pilhaMb).toBe(16);
    expect(recarregado.config.intervaloAmostragemMemoria).toBe(500);
  });

  it('ignora valores do ambiente que não são números positivos', async () => {
    vi.resetModules();
    process.env.TEMPO_LIMITE_MS = 'depois';
    process.env.PILHA_MB = '-4';
    const recarregado = await import('./config');
    expect(recarregado.config.tempoLimiteMs).toBe(TEMPO_LIMITE_MS_PADRAO);
    expect(recarregado.config.pilhaMb).toBe(PILHA_MB_PADRAO);
  });
});
