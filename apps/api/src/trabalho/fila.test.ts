import { describe, expect, it } from 'vitest';
import { FilaSerial } from './fila';

function esperar(ms: number): Promise<void> {
  return new Promise((resolver) => setTimeout(resolver, ms));
}

describe('FilaSerial', () => {
  it('executa um trabalho por vez, na ordem de entrada', async () => {
    const fila = new FilaSerial();
    const eventos: string[] = [];
    let simultaneos = 0;
    let pico = 0;

    const tarefa = (nome: string, ms: number) => async () => {
      simultaneos += 1;
      pico = Math.max(pico, simultaneos);
      eventos.push(`entrou ${nome}`);
      await esperar(ms);
      eventos.push(`saiu ${nome}`);
      simultaneos -= 1;
      return nome;
    };

    const resultados = await Promise.all([
      fila.enfileirar(tarefa('a', 30)),
      fila.enfileirar(tarefa('b', 5)),
      fila.enfileirar(tarefa('c', 1)),
    ]);

    expect(pico).toBe(1);
    expect(resultados).toEqual(['a', 'b', 'c']);
    expect(eventos).toEqual(['entrou a', 'saiu a', 'entrou b', 'saiu b', 'entrou c', 'saiu c']);
  });

  it('segue para o próximo trabalho depois de uma falha', async () => {
    const fila = new FilaSerial();
    const falha = fila.enfileirar(() => Promise.reject(new Error('quebrou')));
    const seguinte = fila.enfileirar(() => 'ok');

    await expect(falha).rejects.toThrow('quebrou');
    await expect(seguinte).resolves.toBe('ok');
  });

  it('conta os trabalhos pendentes', async () => {
    const fila = new FilaSerial();
    expect(fila.pendentes).toBe(0);
    const primeiro = fila.enfileirar(() => esperar(10));
    const segundo = fila.enfileirar(() => esperar(1));
    expect(fila.pendentes).toBe(2);
    await Promise.all([primeiro, segundo]);
    expect(fila.pendentes).toBe(0);
  });
});
