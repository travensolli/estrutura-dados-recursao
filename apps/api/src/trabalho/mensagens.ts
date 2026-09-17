import {
  type ArvoreResposta,
  type CalcularResposta,
  type CompararResposta,
  type Erro,
  type EstimativaResposta,
  type Modo,
  type Sequencia,
} from '@sequencias/contrato';

export interface PedidoCalcular {
  tipo: 'calcular';
  sequencia: Sequencia;
  n: number;
  modo: Modo;
}

export interface PedidoArvore {
  tipo: 'arvore';
  sequencia: Sequencia;
  n: number;
  modo: Modo;
  limite_nos: number;
}

export interface PedidoComparar {
  tipo: 'comparar';
  sequencia: Sequencia;
  n: number;
  repeticoes: number;
  /** Qual modo entra primeiro na primeira rodada. */
  ordem: Modo[];
}

export interface PedidoEstimativa {
  tipo: 'estimativa';
  sequencia: Sequencia;
  n: number;
  modo: Modo;
}

export type Pedido = PedidoCalcular | PedidoArvore | PedidoComparar | PedidoEstimativa;

export interface RespostaPorTipo {
  calcular: CalcularResposta;
  arvore: ArvoreResposta;
  comparar: CompararResposta;
  estimativa: EstimativaResposta;
}

export type RespostaDeTrabalho = RespostaPorTipo[Pedido['tipo']];
export type RespostaDoPedido<P extends Pedido> = RespostaPorTipo[P['tipo']];

/** Único formato que sai do worker: só dados serializáveis, nunca instâncias. */
export type MensagemDoTrabalhador =
  { ok: true; dados: RespostaDeTrabalho } | { ok: false; erro: Erro };
