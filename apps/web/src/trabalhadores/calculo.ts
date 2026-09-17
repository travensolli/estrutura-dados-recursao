import type { MensagemDoTrabalhador, MensagemParaTrabalhador } from '../plano-b/mensagens';

const escopo = self as unknown as DedicatedWorkerGlobalScope;

escopo.onmessage = (evento: MessageEvent<MensagemParaTrabalhador>) => {
  const pedido = evento.data;
  if (pedido.tipo !== 'calcular') return;
  const resposta: MensagemDoTrabalhador = {
    tipo: 'erro',
    id: pedido.id,
    codigo: 'NAO_IMPLEMENTADO',
    mensagem: 'O cálculo offline ainda não está disponível.',
  };
  escopo.postMessage(resposta);
};
