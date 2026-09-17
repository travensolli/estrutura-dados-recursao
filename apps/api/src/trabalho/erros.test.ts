import { ErroSequencia } from '@sequencias/contrato';
import { describe, expect, it } from 'vitest';
import {
  deErroJson,
  ehEstouroDePilha,
  erroDeTempoLimite,
  mensagemDeTempoLimite,
  paraErroJson,
  paraErroSequencia,
} from './erros';

function recursaoInfinita(): number {
  return recursaoInfinita() + 1;
}

describe('paraErroSequencia', () => {
  it('mantém erros de domínio intactos', () => {
    const original = new ErroSequencia('LIMITE_EXCEDIDO', 'n grande demais');
    expect(paraErroSequencia(original)).toBe(original);
  });

  it('converte estouro de pilha real em PILHA_ESTOURADA', () => {
    let capturado: unknown;
    try {
      recursaoInfinita();
    } catch (erro) {
      capturado = erro;
    }
    expect(capturado).toBeInstanceOf(RangeError);
    expect(ehEstouroDePilha(capturado)).toBe(true);
    const convertido = paraErroSequencia(capturado);
    expect(convertido.codigo).toBe('PILHA_ESTOURADA');
    expect(convertido.message).toContain('pilha');
  });

  it('converte RangeError que cruzou o worker e perdeu o protótipo', () => {
    const copia = new Error('Maximum call stack size exceeded');
    copia.name = 'RangeError';
    expect(paraErroSequencia(copia).codigo).toBe('PILHA_ESTOURADA');
  });

  it('não confunde outro RangeError com estouro de pilha', () => {
    expect(paraErroSequencia(new RangeError('índice fora da faixa')).codigo).toBe('ERRO_INTERNO');
  });

  it('guarda a mensagem original de erros desconhecidos', () => {
    const convertido = paraErroSequencia(new Error('algo estranho'));
    expect(convertido.codigo).toBe('ERRO_INTERNO');
    expect(convertido.detalhes).toEqual({ original: 'algo estranho' });
  });
});

describe('tempo limite', () => {
  it('escreve a mensagem em segundos', () => {
    expect(mensagemDeTempoLimite(15_000)).toContain('15 s');
    expect(erroDeTempoLimite(15_000).codigo).toBe('TEMPO_LIMITE');
    expect(erroDeTempoLimite(15_000).detalhes).toEqual({ tempo_limite_ms: 15_000 });
  });
});

describe('travessia do worker', () => {
  it('serializa e refaz o erro sem perder código nem detalhes', () => {
    const json = paraErroJson(
      new ErroSequencia('LIMITE_EXCEDIDO', 'n = 36 passa do limite', { limite: 35 }),
    );
    expect(json).toEqual({
      codigo: 'LIMITE_EXCEDIDO',
      mensagem: 'n = 36 passa do limite',
      detalhes: { limite: 35 },
    });
    const refeito = deErroJson(json);
    expect(refeito).toBeInstanceOf(ErroSequencia);
    expect(refeito.codigo).toBe('LIMITE_EXCEDIDO');
    expect(refeito.detalhes).toEqual({ limite: 35 });
  });
});
