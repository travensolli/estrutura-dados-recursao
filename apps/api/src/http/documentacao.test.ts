import { describe, expect, it } from 'vitest';
import { criarAplicacao } from '../aplicacao';

async function documento() {
  const app = criarAplicacao();
  const resposta = await app.inject({ method: 'GET', url: '/docs/json' });
  await app.close();
  return resposta;
}

describe('documentação OpenAPI', () => {
  it('descreve a rota de saúde a partir do schema do contrato', async () => {
    const resposta = await documento();
    expect(resposta.statusCode).toBe(200);
    const doc = resposta.json();
    expect(doc.openapi).toMatch(/^3\./);
    const saude = doc.paths['/api/saude'].get;
    expect(saude.tags).toEqual(['diagnóstico']);
    const corpo = saude.responses['200'].content['application/json'].schema;
    expect(Object.keys(corpo.properties)).toEqual(['status', 'versao', 'node', 'tempo_ativo_s']);
  });

  it('não documenta as próprias páginas da documentação', async () => {
    const resposta = await documento();
    const caminhos = Object.keys(resposta.json().paths);
    expect(caminhos.every((caminho) => caminho.startsWith('/api/'))).toBe(true);
  });

  it('serve a página da documentação em /docs', async () => {
    const app = criarAplicacao();
    const resposta = await app.inject({ method: 'GET', url: '/docs' });
    expect([200, 302]).toContain(resposta.statusCode);
    await app.close();
  });
});
