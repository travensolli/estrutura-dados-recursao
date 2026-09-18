import { describe, expect, it } from 'vitest';
import { ErroApi, apiIndisponivel } from './cliente';

describe('apiIndisponivel', () => {
  it.each([
    ['sem resposta da rede', new ErroApi('INDISPONIVEL', 'sem resposta', 0)],
    ['erro interno do servidor', new ErroApi('ERRO_INTERNO', 'falhou', 500)],
    ['proxy sem destino', new ErroApi('ERRO_INTERNO', 'gateway', 502)],
    ['serviço parado', new ErroApi('ERRO_INTERNO', 'indisponível', 503)],
    ['rota ausente', new ErroApi('NAO_ENCONTRADO', 'não achei', 404)],
  ])('assume o cálculo offline: %s', (_caso, erro) => {
    expect(apiIndisponivel(erro)).toBe(true);
  });

  it.each([
    ['limite excedido', new ErroApi('LIMITE_EXCEDIDO', 'n grande demais', 422)],
    ['entrada inválida', new ErroApi('ENTRADA_INVALIDA', 'n negativo', 400)],
    ['prazo estourado', new ErroApi('TEMPO_LIMITE', 'demorou', 408)],
    ['cancelado pela pessoa', new ErroApi('CANCELADO', 'cancelado', 0)],
  ])('não assume: %s', (_caso, erro) => {
    expect(apiIndisponivel(erro)).toBe(false);
  });

  it('ignora erro que não seja da API', () => {
    expect(apiIndisponivel(new Error('qualquer'))).toBe(false);
    expect(apiIndisponivel(null)).toBe(false);
  });
});
