import { parentPort, workerData } from 'node:worker_threads';
import { paraErroJson } from './erros';
import { type MensagemDoTrabalhador, type Pedido } from './mensagens';
import { executarPedido } from './tarefas';

function responder(mensagem: MensagemDoTrabalhador): void {
  parentPort?.postMessage(mensagem);
  parentPort?.close();
}

try {
  responder({ ok: true, dados: executarPedido<Pedido>(workerData as Pedido) });
} catch (erro) {
  responder({ ok: false, erro: paraErroJson(erro) });
}
