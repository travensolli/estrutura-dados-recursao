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

  it('documenta as sete rotas da api, inclusive a árvore recursiva', async () => {
    const resposta = await documento();
    const doc = resposta.json();
    expect(Object.keys(doc.paths).sort()).toEqual([
      '/api/arvore',
      '/api/calcular',
      '/api/comparar',
      '/api/estimativa',
      '/api/saude',
      '/api/sequencias',
      '/api/serie',
    ]);
    const arvore = doc.paths['/api/arvore'].post.responses['200'].content['application/json'];
    expect(arvore.schema.properties.raiz.$ref).toBe('#/components/schemas/No');
    expect(JSON.stringify(doc.components.schemas.No)).toContain('descendentes_ocultos');
    const erro = doc.paths['/api/calcular'].post.responses['422'].content['application/json'];
    expect(erro.schema.properties.codigo.enum).toContain('LIMITE_EXCEDIDO');
  });

  it('não documenta as próprias páginas da documentação', async () => {
    const resposta = await documento();
    const caminhos = Object.keys(resposta.json().paths);
    expect(caminhos.every((caminho) => caminho.startsWith('/api/'))).toBe(true);
  });

  it('não deixa referência sem destino no documento', async () => {
    const doc = (await documento()).json();
    const texto = JSON.stringify(doc);
    const referencias = [...new Set(texto.match(/#\/components\/schemas\/[A-Za-z0-9_]+/g) ?? [])];
    expect(referencias.length).toBeGreaterThan(0);
    for (const referencia of referencias) {
      expect(doc.components.schemas).toHaveProperty(referencia.replace(/^.*\//, ''));
    }
  });

  it('serve a página da documentação em /docs', async () => {
    const app = criarAplicacao();
    const resposta = await app.inject({ method: 'GET', url: '/docs' });
    expect([200, 302]).toContain(resposta.statusCode);
    await app.close();
  });
});
