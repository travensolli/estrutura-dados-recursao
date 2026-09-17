import { describe, expect, it } from 'vitest';
import { ArvoreRespostaSchema } from '@sequencias/contrato';
import type { PedidoCalculo, RespostaCalculo } from './mensagens';
import { processarPedido } from './processar';
import { ErroPlanoB, enviarPedido, montarRespostaArvore } from './usarPlanoB';

const entrada = { sequencia: 'tribonacci', n: 7, modo: 'sem_cache' } as const;

/** Worker falso: roda a mesma função pura do worker real, de forma síncrona. */
function trabalhadorFalso(): Worker {
  const alvo = new EventTarget();
  return Object.assign(alvo, {
    postMessage(pedido: PedidoCalculo) {
      const resposta = processarPedido(pedido);
      alvo.dispatchEvent(new MessageEvent('message', { data: resposta }));
    },
    terminate() {},
  }) as unknown as Worker;
}

describe('plano B', () => {
  it('monta uma ArvoreResposta válida a partir da resposta do worker', () => {
    const resposta = processarPedido({ tipo: 'calcular', id: 1, ...entrada, com_arvore: true });
    expect(resposta.tipo).toBe('resultado');
    const arvore = montarRespostaArvore(entrada, resposta as RespostaCalculo, 300);
    expect(ArvoreRespostaSchema.safeParse(arvore).success).toBe(true);
    expect(arvore.metricas.invocacoes).toBe(46);
    expect(arvore.nos_exibidos).toBe(46);
    expect(arvore.limite_nos).toBe(300);
  });
  it('rejeita resposta sem árvore', () => {
    const resposta = processarPedido({ tipo: 'calcular', id: 1, ...entrada, com_arvore: false });
    expect(() => montarRespostaArvore(entrada, resposta as RespostaCalculo, 300)).toThrow(
      ErroPlanoB,
    );
  });
  it('envia pedido e resolve com a resposta de mesmo id', async () => {
    const resposta = await enviarPedido(trabalhadorFalso(), {
      tipo: 'calcular',
      id: 42,
      ...entrada,
      com_arvore: true,
    });
    expect(resposta.id).toBe(42);
    expect(resposta.metricas.invocacoes).toBe(46);
  });
  it('rejeita na hora quando o sinal já veio cancelado', async () => {
    const controle = new AbortController();
    controle.abort();
    await expect(
      enviarPedido(
        trabalhadorFalso(),
        { tipo: 'calcular', id: 1, ...entrada, com_arvore: true },
        controle.signal,
      ),
    ).rejects.toMatchObject({ codigo: 'CANCELADO' });
  });
  it('rejeita com ErroPlanoB quando o worker responde erro', async () => {
    await expect(
      enviarPedido(trabalhadorFalso(), {
        tipo: 'calcular',
        id: 1,
        sequencia: 'fibonacci',
        n: 99,
        modo: 'sem_cache',
        com_arvore: true,
      }),
    ).rejects.toMatchObject({ codigo: 'LIMITE_EXCEDIDO' });
  });
});
