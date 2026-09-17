import { ErroSchema, SaudeRespostaSchema } from '@sequencias/contrato';
import { describe, expect, it } from 'vitest';
import { criarAplicacao } from '../aplicacao';

describe('GET /api/saude', () => {
  it('responde ok no formato do contrato', async () => {
    const app = criarAplicacao();
    const resposta = await app.inject({ method: 'GET', url: '/api/saude' });
    expect(resposta.statusCode).toBe(200);
    expect(SaudeRespostaSchema.parse(resposta.json())).toMatchObject({ status: 'ok' });
    await app.close();
  });

  it('libera o CORS para o navegador em desenvolvimento', async () => {
    const app = criarAplicacao();
    const resposta = await app.inject({
      method: 'GET',
      url: '/api/saude',
      headers: { origin: 'http://localhost:5173' },
    });
    expect(resposta.headers['access-control-allow-origin']).toBe('http://localhost:5173');
    await app.close();
  });
});

describe('rota desconhecida', () => {
  it('responde 404 no formato de erro do contrato', async () => {
    const app = criarAplicacao();
    const resposta = await app.inject({ method: 'GET', url: '/api/inexistente' });
    expect(resposta.statusCode).toBe(404);
    expect(ErroSchema.parse(resposta.json()).codigo).toBe('NAO_ENCONTRADO');
    await app.close();
  });
});
