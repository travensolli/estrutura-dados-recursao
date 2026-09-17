import { describe, expect, it } from 'vitest';
import {
  inverterOrdem,
  normalizarOrdem,
  porModo,
  proximaOrdemDeModos,
  reiniciarAlternanciaDeModos,
} from './modos';

describe('normalizarOrdem', () => {
  it('mantém o modo pedido primeiro e completa o par', () => {
    expect(normalizarOrdem(['com_cache'])).toEqual(['com_cache', 'sem_cache']);
    expect(normalizarOrdem(['sem_cache', 'com_cache'])).toEqual(['sem_cache', 'com_cache']);
  });
  it('usa a ordem padrão quando nada é informado', () => {
    expect(normalizarOrdem()).toEqual(['sem_cache', 'com_cache']);
    expect(normalizarOrdem([])).toEqual(['sem_cache', 'com_cache']);
  });
});

describe('porModo', () => {
  it('executa na ordem informada e indexa pelo modo', () => {
    const visitados: string[] = [];
    const resultado = porModo(inverterOrdem(['sem_cache', 'com_cache']), (modo) => {
      visitados.push(modo);
      return modo.toUpperCase();
    });
    expect(visitados).toEqual(['com_cache', 'sem_cache']);
    expect(resultado).toEqual({ sem_cache: 'SEM_CACHE', com_cache: 'COM_CACHE' });
  });
});

describe('proximaOrdemDeModos', () => {
  it('alterna quem é medido primeiro a cada rodada', () => {
    reiniciarAlternanciaDeModos();
    expect(proximaOrdemDeModos()).toEqual(['sem_cache', 'com_cache']);
    expect(proximaOrdemDeModos()).toEqual(['com_cache', 'sem_cache']);
    expect(proximaOrdemDeModos()).toEqual(['sem_cache', 'com_cache']);
    reiniciarAlternanciaDeModos();
    expect(proximaOrdemDeModos()).toEqual(['sem_cache', 'com_cache']);
  });
});
