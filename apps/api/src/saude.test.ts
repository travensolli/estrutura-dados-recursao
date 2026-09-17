import { describe, expect, it } from 'vitest';
import { criarAplicacao } from './aplicacao';

describe('GET /api/saude', () => {
  it('responde ok', async () => {
    const app = criarAplicacao();
    const resposta = await app.inject({ method: 'GET', url: '/api/saude' });
    expect(resposta.statusCode).toBe(200);
    expect(resposta.json()).toMatchObject({ status: 'ok' });
    await app.close();
  });
});
