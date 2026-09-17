import { FilaSerial } from './fila';
import { executarEmWorker, type OpcoesExecutor } from './executor';
import { type Pedido, type RespostaDoPedido } from './mensagens';

const fila = new FilaSerial();

/** Porta de entrada das rotas: um trabalho pesado por vez, cada um em seu worker. */
export function executarTrabalho<P extends Pedido>(
  pedido: P,
  opcoes: OpcoesExecutor = {},
): Promise<RespostaDoPedido<P>> {
  return fila.enfileirar(() => executarEmWorker(pedido, opcoes));
}

export function trabalhosPendentes(): number {
  return fila.pendentes;
}
