import type { ArvoreResposta, Modo, Sequencia } from '@sequencias/contrato';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import type { MensagemDoTrabalhador, PedidoCalculo, RespostaCalculo } from './mensagens';

export interface EntradaPlanoB {
  sequencia: Sequencia;
  n: number;
  modo: Modo;
  limite_nos?: number;
}

export class ErroPlanoB extends Error {
  readonly codigo: string;
  constructor(codigo: string, mensagem: string) {
    super(mensagem);
    this.name = 'ErroPlanoB';
    this.codigo = codigo;
  }
}

export function planoBDisponivel(): boolean {
  return typeof Worker !== 'undefined';
}

export function criarTrabalhador(): Worker {
  return new Worker(new URL('../trabalhadores/calculo.ts', import.meta.url), { type: 'module' });
}

/** Converte a resposta do worker no mesmo formato de `POST /api/arvore`. */
export function montarRespostaArvore(
  entrada: EntradaPlanoB,
  resposta: RespostaCalculo,
  limitePadrao: number,
): ArvoreResposta {
  if (!resposta.raiz)
    throw new ErroPlanoB('ERRO_INTERNO', 'O cálculo offline não devolveu a árvore.');
  return {
    sequencia: entrada.sequencia,
    n: entrada.n,
    modo: entrada.modo,
    metricas: resposta.metricas,
    raiz: resposta.raiz,
    truncada: resposta.truncada,
    limite_nos: entrada.limite_nos ?? limitePadrao,
    nos_exibidos: resposta.nos_exibidos,
  };
}

export function enviarPedido(
  trabalhador: Worker,
  pedido: PedidoCalculo,
  sinal?: AbortSignal,
): Promise<RespostaCalculo> {
  return new Promise((resolver, rejeitar) => {
    if (sinal?.aborted) {
      rejeitar(new ErroPlanoB('CANCELADO', 'Cálculo cancelado.'));
      return;
    }
    const limpar = () => {
      trabalhador.removeEventListener('message', aoReceber);
      trabalhador.removeEventListener('error', aoFalhar);
      sinal?.removeEventListener('abort', aoCancelar);
    };
    const aoReceber = (evento: MessageEvent<MensagemDoTrabalhador>) => {
      const mensagem = evento.data;
      if (mensagem.id !== pedido.id) return;
      limpar();
      if (mensagem.tipo === 'erro') rejeitar(new ErroPlanoB(mensagem.codigo, mensagem.mensagem));
      else resolver(mensagem);
    };
    const aoFalhar = () => {
      limpar();
      rejeitar(new ErroPlanoB('ERRO_INTERNO', 'O worker de cálculo falhou.'));
    };
    const aoCancelar = () => {
      limpar();
      rejeitar(new ErroPlanoB('CANCELADO', 'Cálculo cancelado.'));
    };
    trabalhador.addEventListener('message', aoReceber);
    trabalhador.addEventListener('error', aoFalhar);
    sinal?.addEventListener('abort', aoCancelar, { once: true });
    trabalhador.postMessage(pedido);
  });
}

export interface PlanoB {
  disponivel: boolean;
  calcularArvore(entrada: EntradaPlanoB, sinal?: AbortSignal): Promise<ArvoreResposta>;
  /** Encerra o worker atual (interrompe o cálculo); o próximo pedido cria outro. */
  cancelar(): void;
}

/** Cálculo no próprio navegador quando a API está fora do ar. */
export function usePlanoB(limitePadrao = 300): PlanoB {
  const trabalhadorRef = useRef<Worker | null>(null);
  const proximoId = useRef(1);

  const cancelar = useCallback(() => {
    trabalhadorRef.current?.terminate();
    trabalhadorRef.current = null;
  }, []);

  useEffect(() => cancelar, [cancelar]);

  const calcularArvore = useCallback(
    async (entrada: EntradaPlanoB, sinal?: AbortSignal) => {
      if (!planoBDisponivel()) {
        throw new ErroPlanoB('INDISPONIVEL', 'Este navegador não permite o cálculo offline.');
      }
      trabalhadorRef.current ??= criarTrabalhador();
      const trabalhador = trabalhadorRef.current;
      const pedido: PedidoCalculo = {
        tipo: 'calcular',
        id: proximoId.current++,
        sequencia: entrada.sequencia,
        n: entrada.n,
        modo: entrada.modo,
        com_arvore: true,
        limite_nos: entrada.limite_nos ?? limitePadrao,
      };
      const aoAbortar = () => {
        if (trabalhadorRef.current === trabalhador) cancelar();
      };
      sinal?.addEventListener('abort', aoAbortar, { once: true });
      try {
        const resposta = await enviarPedido(trabalhador, pedido, sinal);
        return montarRespostaArvore(entrada, resposta, limitePadrao);
      } finally {
        sinal?.removeEventListener('abort', aoAbortar);
      }
    },
    [cancelar, limitePadrao],
  );

  return useMemo(
    () => ({ disponivel: planoBDisponivel(), calcularArvore, cancelar }),
    [calcularArvore, cancelar],
  );
}
