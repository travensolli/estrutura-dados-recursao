import { ErroSequencia } from '@sequencias/contrato';
import { describe, expect, it } from 'vitest';
import {
  aguardarTrabalhador,
  arquivoDoTrabalhador,
  criarTrabalhador,
  executarEmWorker,
} from './executor';
import { type PedidoComparar } from './mensagens';

// Comparação longa de propósito: o worker ainda está ocupado quando o prazo acaba.
const PESADO: PedidoComparar = {
  tipo: 'comparar',
  sequencia: 'fibonacci',
  n: 30,
  repeticoes: 30,
  ordem: ['sem_cache', 'com_cache'],
};

function codigoDoErro(erro: unknown): string {
  return erro instanceof ErroSequencia ? erro.codigo : `inesperado: ${String(erro)}`;
}

describe('arquivoDoTrabalhador', () => {
  it('usa o .ts ao rodar do código-fonte e o .js ao rodar do pacote', () => {
    expect(arquivoDoTrabalhador('file:///app/src/trabalho/executor.ts').pathname).toBe(
      '/app/src/trabalho/trabalhador.ts',
    );
    expect(arquivoDoTrabalhador('file:///app/dist/servidor.js').pathname).toBe(
      '/app/dist/trabalhador.js',
    );
  });

  it('ignora a consulta que alguns carregadores acrescentam na url', () => {
    expect(arquivoDoTrabalhador('file:///app/src/trabalho/executor.ts?v=12').href).toBe(
      'file:///app/src/trabalho/trabalhador.ts',
    );
  });
});

describe('executarEmWorker', () => {
  it('calcula em outra thread e devolve as métricas', async () => {
    const resposta = await executarEmWorker({
      tipo: 'calcular',
      sequencia: 'tribonacci',
      n: 7,
      modo: 'sem_cache',
    });
    expect(resposta.metricas.invocacoes).toBe(46);
    expect(resposta.metricas.valor).toBe('31');
  });

  it('traz o erro de domínio do worker com o mesmo código', async () => {
    await expect(
      executarEmWorker({ tipo: 'calcular', sequencia: 'fibonacci', n: 36, modo: 'sem_cache' }),
    ).rejects.toMatchObject({ codigo: 'LIMITE_EXCEDIDO' });
  });

  it('aguenta recursão profunda com a pilha ampliada do worker', async () => {
    const resposta = await executarEmWorker({
      tipo: 'calcular',
      sequencia: 'fatorial',
      n: 5_000,
      modo: 'com_cache',
    });
    expect(resposta.metricas.invocacoes).toBe(5_000);
    expect(resposta.metricas.profundidade_maxima).toBe(5_000);
  });

  it('converte estouro de pilha em PILHA_ESTOURADA quando a pilha é pequena', async () => {
    const promessa = executarEmWorker(
      { tipo: 'calcular', sequencia: 'fatorial', n: 5_000, modo: 'com_cache' },
      { pilhaMb: 0.3 },
    );
    await expect(promessa).rejects.toSatisfy(
      (erro: unknown) => codigoDoErro(erro) === 'PILHA_ESTOURADA',
    );
  });
});

describe('tempo limite', () => {
  it('encerra o worker e devolve TEMPO_LIMITE', async () => {
    const trabalhador = criarTrabalhador(PESADO);
    const encerrou = new Promise<number>((resolver) => trabalhador.on('exit', resolver));

    const erro = await aguardarTrabalhador(trabalhador, 2_000).catch((falha: unknown) => falha);

    expect(erro).toBeInstanceOf(ErroSequencia);
    expect(codigoDoErro(erro)).toBe('TEMPO_LIMITE');
    expect((erro as ErroSequencia).message).toContain('2 s');
    await expect(encerrou).resolves.toBeTypeOf('number');
  });
});
