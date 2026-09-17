import { describe, expect, it } from 'vitest';
import { ErroApi } from '../api/cliente';
import { descreverErro } from './erros';

describe('descreverErro', () => {
  it('limite excedido sugere reduzir n e expõe o limite', () => {
    const descricao = descreverErro(
      new ErroApi('LIMITE_EXCEDIDO', 'O maior n permitido é 30.', 422, { limite: 30 }),
    );
    expect(descricao.titulo).toBe('Esse n passa do limite');
    expect(descricao.sugerirReduzirN).toBe(true);
    expect(descricao.sugerirTentarDeNovo).toBe(false);
    expect(descricao.limite).toBe(30);
  });

  it('código fora da lista cai na regra padrão', () => {
    const descricao = descreverErro(new ErroApi('CODIGO_NOVO', 'Falha.', 500));
    expect(descricao.codigo).toBe('CODIGO_NOVO');
    expect(descricao.titulo).toBe('Algo deu errado no servidor');
    expect(descricao.sugerirTentarDeNovo).toBe(true);
  });

  it('erro sem mensagem usa texto genérico', () => {
    const descricao = descreverErro(new Error(''));
    expect(descricao.codigo).toBe('DESCONHECIDO');
    expect(descricao.mensagem).toMatch(/Erro inesperado/);
  });

  it('detalhes sem limite numérico não viram limite', () => {
    const descricao = descreverErro(new ErroApi('LIMITE_EXCEDIDO', 'Falha.', 422, { limite: 'x' }));
    expect(descricao.limite).toBeUndefined();
  });
});
