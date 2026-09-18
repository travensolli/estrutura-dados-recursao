import type { MensagemParaTrabalhador } from '../plano-b/mensagens';
import { processarPedido } from '../plano-b/processar';

const escopo = self as unknown as DedicatedWorkerGlobalScope;

// Cancelamento: a interface encerra este worker e cria outro; aqui só se ignora.
escopo.onmessage = (evento: MessageEvent<MensagemParaTrabalhador>) => {
  const pedido = evento.data;
  if (pedido.tipo !== 'calcular') return;
  escopo.postMessage(processarPedido(pedido));
};
