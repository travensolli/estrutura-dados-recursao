import { ErroSchema } from '@sequencias/contrato';
import { afterAll, describe, expect, it, vi } from 'vitest';

const ORIGINAL = { ...process.env };

afterAll(() => {
  process.env = { ...ORIGINAL };
  vi.resetModules();
});

describe('cálculo que passa do prazo', () => {
  it('responde 504 com código TEMPO_LIMITE e mensagem amigável', async () => {
    vi.resetModules();
    process.env.TEMPO_LIMITE_MS = '30';
    const { criarAplicacao } = await import('../aplicacao');
    const app = criarAplicacao();

    const resposta = await app.inject({
      method: 'POST',
      url: '/api/calcular',
      payload: { sequencia: 'fibonacci', n: 32, modo: 'sem_cache' },
    });

    expect(resposta.statusCode).toBe(504);
    const erro = ErroSchema.parse(resposta.json());
    expect(erro.codigo).toBe('TEMPO_LIMITE');
    expect(erro.mensagem).toMatch(/interrompido/);
    await app.close();
  });
});
