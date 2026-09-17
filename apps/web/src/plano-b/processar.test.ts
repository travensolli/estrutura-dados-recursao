import { describe, expect, it, vi } from 'vitest';
import type { PedidoCalculo } from './mensagens';
import * as adaptador from './nucleo-adaptador';
import { processarPedido } from './processar';

const pedido = (extra: Partial<PedidoCalculo> = {}): PedidoCalculo => ({
  tipo: 'calcular',
  id: 7,
  sequencia: 'tribonacci',
  n: 7,
  modo: 'com_cache',
  com_arvore: true,
  ...extra,
});

describe('processarPedido', () => {
  it('devolve resultado com métricas, árvore e duração', () => {
    let relogio = 0;
    const resposta = processarPedido(pedido(), () => (relogio += 5));
    expect(resposta.tipo).toBe('resultado');
    if (resposta.tipo !== 'resultado') return;
    expect(resposta.id).toBe(7);
    expect(resposta.metricas.invocacoes).toBe(16);
    expect(resposta.raiz?.argumento).toBe(7);
    expect(resposta.nos_exibidos).toBe(16);
    expect(resposta.duracao_ms).toBe(5);
  });
  it('recusa n acima do limite do navegador', () => {
    const resposta = processarPedido(pedido({ modo: 'sem_cache', n: 23 }));
    expect(resposta).toMatchObject({ tipo: 'erro', codigo: 'LIMITE_EXCEDIDO' });
  });
  it('recusa n inválido', () => {
    expect(processarPedido(pedido({ n: -1 }))).toMatchObject({ codigo: 'ENTRADA_INVALIDA' });
  });
  it('prende o limite de nós entre 1 e o teto do contrato', () => {
    const acima = processarPedido(pedido({ modo: 'sem_cache', limite_nos: 90_000 }));
    expect(acima).toMatchObject({ tipo: 'resultado', nos_exibidos: 46, truncada: false });
    const abaixo = processarPedido(pedido({ modo: 'sem_cache', limite_nos: 0 }));
    expect(abaixo).toMatchObject({ tipo: 'resultado', truncada: true, nos_exibidos: 1 });
  });
  it('traduz estouro de pilha em erro amigável', () => {
    const espiao = vi.spyOn(adaptador, 'executarInstrumentado').mockImplementation(() => {
      throw new RangeError('Maximum call stack size exceeded');
    });
    const resposta = processarPedido(pedido());
    expect(resposta).toMatchObject({ tipo: 'erro', codigo: 'PILHA_ESTOURADA' });
    if (resposta.tipo === 'erro') expect(resposta.mensagem).toMatch(/Reduza n/);
    espiao.mockRestore();
  });
});
