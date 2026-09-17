import { EstimativaRespostaSchema } from '@sequencias/contrato';
import { describe, expect, it } from 'vitest';
import { descreverQuantidade, estimativaPrecisaDeWorker, montarEstimativa } from './estimativa';

describe('montarEstimativa', () => {
  it('reproduz os valores de referência do enunciado', () => {
    expect(montarEstimativa('tribonacci', 7, 'sem_cache').invocacoes_previstas).toBe('46');
    expect(montarEstimativa('tribonacci', 7, 'com_cache').invocacoes_previstas).toBe('16');
    expect(montarEstimativa('fibonacci', 10, 'sem_cache').invocacoes_previstas).toBe('177');
    expect(montarEstimativa('fibonacci', 10, 'com_cache').invocacoes_previstas).toBe('19');
    expect(montarEstimativa('fatorial', 10, 'com_cache').invocacoes_previstas).toBe('10');
  });

  it('informa profundidade, limite e ausência de aviso no caso leve', () => {
    const estimativa = montarEstimativa('tribonacci', 7, 'sem_cache');
    expect(EstimativaRespostaSchema.parse(estimativa)).toEqual(estimativa);
    expect(estimativa.profundidade_prevista).toBe(6);
    expect(estimativa.limite_n).toBe(30);
    expect(estimativa.dentro_do_limite).toBe(true);
    expect(estimativa.pesado).toBe(false);
    expect(estimativa.aviso).toBeNull();
  });

  it('marca como pesado acima do limiar de confirmação', () => {
    const estimativa = montarEstimativa('fibonacci', 35, 'sem_cache');
    expect(estimativa.invocacoes_previstas).toBe('29860703');
    expect(estimativa.pesado).toBe(true);
    expect(estimativa.aviso).toMatch(/29\.860\.703 invocações/);
  });

  it('avisa quando n passa do limite de execução', () => {
    const estimativa = montarEstimativa('fibonacci', 60, 'sem_cache');
    expect(estimativa.dentro_do_limite).toBe(false);
    expect(estimativa.aviso).toMatch(/até n = 35/);
  });
});

describe('descreverQuantidade', () => {
  it('agrupa milhares em números legíveis', () => {
    expect(descreverQuantidade(46n)).toBe('46');
    expect(descreverQuantidade(29860703n)).toBe('29.860.703');
  });

  it('usa notação científica aproximada em números longos', () => {
    expect(descreverQuantidade(10n ** 30n + 234n * 10n ** 27n)).toBe('cerca de 1,23 × 10^30');
  });
});

describe('estimativaPrecisaDeWorker', () => {
  it('só manda para o worker a recursão profunda sem cache', () => {
    expect(estimativaPrecisaDeWorker('fibonacci', 20_000, 'sem_cache')).toBe(true);
    expect(estimativaPrecisaDeWorker('fibonacci', 20_000, 'com_cache')).toBe(false);
    expect(estimativaPrecisaDeWorker('fatorial', 20_000, 'sem_cache')).toBe(false);
    expect(estimativaPrecisaDeWorker('tribonacci', 30, 'sem_cache')).toBe(false);
  });
});
