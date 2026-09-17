import { CODIGOS_ERRO, ErroSchema, ErroSequencia } from '@sequencias/contrato';
import { describe, expect, it } from 'vitest';
import { erroDeValidacao, respostaDeErro, statusDoCodigo, traduzirErro } from './erros';

describe('statusDoCodigo', () => {
  it('cobre todos os códigos do contrato', () => {
    for (const codigo of CODIGOS_ERRO) {
      expect(statusDoCodigo(codigo)).toBeGreaterThanOrEqual(400);
    }
  });

  it('usa 400 para entrada inválida, 422 para limite e 504 para tempo limite', () => {
    expect(statusDoCodigo('ENTRADA_INVALIDA')).toBe(400);
    expect(statusDoCodigo('LIMITE_EXCEDIDO')).toBe(422);
    expect(statusDoCodigo('TEMPO_LIMITE')).toBe(504);
    expect(statusDoCodigo('PILHA_ESTOURADA')).toBe(422);
    expect(statusDoCodigo('NAO_ENCONTRADO')).toBe(404);
    expect(statusDoCodigo('ERRO_INTERNO')).toBe(500);
  });
});

describe('erroDeValidacao', () => {
  it('usa a primeira falha na mensagem e lista todos os campos', () => {
    const erro = erroDeValidacao([
      { instancePath: '/n', message: 'n não pode ser negativo' },
      { instancePath: '', message: 'entrada incompleta' },
    ]);
    expect(erro.codigo).toBe('ENTRADA_INVALIDA');
    expect(erro.message).toBe('n: n não pode ser negativo');
    expect(erro.detalhes).toEqual({
      campos: [
        { campo: 'n', mensagem: 'n não pode ser negativo' },
        { campo: 'entrada', mensagem: 'entrada incompleta' },
      ],
    });
  });

  it('achata caminhos aninhados com ponto', () => {
    expect(erroDeValidacao([{ instancePath: '/tempo/sem_cache' }]).message).toBe(
      'tempo.sem_cache: valor inválido',
    );
  });
});

describe('traduzirErro', () => {
  it('mantém o erro de domínio intacto', () => {
    const original = new ErroSequencia('LIMITE_EXCEDIDO', 'n não pode passar de 30.');
    expect(traduzirErro(original)).toBe(original);
  });

  it('reconhece falhas de validação do provedor zod', () => {
    const falha = Object.assign(new Error('validação'), {
      validation: [
        {
          [Symbol.for('ZodFastifySchemaValidationError')]: true,
          instancePath: '/modo',
          message: 'valor inesperado',
        },
      ],
    });
    expect(traduzirErro(falha).codigo).toBe('ENTRADA_INVALIDA');
  });

  it('trata corpo ilegível como entrada inválida', () => {
    const falha = Object.assign(new SyntaxError('Unexpected token'), { statusCode: 400 });
    const traduzido = traduzirErro(falha);
    expect(traduzido.codigo).toBe('ENTRADA_INVALIDA');
    expect(traduzido.message).toMatch(/JSON válido/);
  });

  it('converte estouro de pilha em código próprio', () => {
    const falha = new RangeError('Maximum call stack size exceeded');
    expect(traduzirErro(falha).codigo).toBe('PILHA_ESTOURADA');
  });

  it('cai em erro interno no caso desconhecido', () => {
    expect(traduzirErro(new Error('qualquer coisa')).codigo).toBe('ERRO_INTERNO');
  });
});

describe('respostaDeErro', () => {
  it('devolve status e corpo no formato do contrato', () => {
    const { status, corpo } = respostaDeErro(
      new ErroSequencia('TEMPO_LIMITE', 'O cálculo passou de 15 s.', { tempo_limite_ms: 15000 }),
    );
    expect(status).toBe(504);
    expect(ErroSchema.parse(corpo)).toEqual({
      codigo: 'TEMPO_LIMITE',
      mensagem: 'O cálculo passou de 15 s.',
      detalhes: { tempo_limite_ms: 15000 },
    });
  });
});
