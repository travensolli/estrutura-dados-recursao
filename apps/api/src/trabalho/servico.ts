import { type Sequencia } from '@sequencias/contrato';
import { proximaOrdemDeModos } from '../medicao/modos';
import { executarEmWorker, type OpcoesExecutor } from './executor';
import { FilaSerial } from './fila';
import { type Pedido, type PedidoComparar, type RespostaDoPedido } from './mensagens';

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

/** Monta a comparação já com a ordem dos modos alternada em relação à anterior. */
export function pedidoDeComparacao(
  sequencia: Sequencia,
  n: number,
  repeticoes: number,
): PedidoComparar {
  return { tipo: 'comparar', sequencia, n, repeticoes, ordem: [...proximaOrdemDeModos()] };
}
