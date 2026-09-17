import type { Metricas, Modo, No, Sequencia } from '@sequencias/contrato';

/** Protocolo entre a interface e o Web Worker do plano B offline. */
export interface PedidoCalculo {
  tipo: 'calcular';
  id: number;
  sequencia: Sequencia;
  n: number;
  modo: Modo;
  com_arvore: boolean;
  limite_nos?: number;
}

export interface PedidoCancelar {
  tipo: 'cancelar';
  id: number;
}

export type MensagemParaTrabalhador = PedidoCalculo | PedidoCancelar;

export interface RespostaCalculo {
  tipo: 'resultado';
  id: number;
  metricas: Metricas;
  raiz: No | null;
  truncada: boolean;
  /** Indicativo: no navegador o relógio tem precisão reduzida. */
  duracao_ms: number;
}

export interface RespostaErro {
  tipo: 'erro';
  id: number;
  codigo: string;
  mensagem: string;
}

export type MensagemDoTrabalhador = RespostaCalculo | RespostaErro;
