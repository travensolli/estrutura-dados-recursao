import {
  ErroSequencia,
  limiteN,
  type ArvoreResposta,
  type CalcularResposta,
  type CompararResposta,
} from '@sequencias/contrato';
import { executarInstrumentado, executarProtegido, validarN } from '@sequencias/nucleo';
import { compararModos } from '../medicao/comparacao';
import {
  type Pedido,
  type PedidoArvore,
  type PedidoCalcular,
  type PedidoComparar,
  type RespostaDoPedido,
} from './mensagens';

function calcular(pedido: PedidoCalcular): CalcularResposta {
  const { sequencia, n, modo } = pedido;
  validarN(n, limiteN('node', sequencia, modo));
  const inicio = process.hrtime.bigint();
  const { metricas } = executarInstrumentado(sequencia, n, modo, { comArvore: false });
  const duracao_ms = Number(process.hrtime.bigint() - inicio) / 1e6;
  return { sequencia, n, modo, metricas, duracao_ms };
}

function montarArvore(pedido: PedidoArvore): ArvoreResposta {
  const { sequencia, n, modo, limite_nos } = pedido;
  validarN(n, limiteN('node', sequencia, modo));
  const resultado = executarInstrumentado(sequencia, n, modo, {
    comArvore: true,
    limiteNos: limite_nos,
  });
  if (resultado.raiz === null) {
    throw new ErroSequencia('ERRO_INTERNO', 'A árvore de chamadas não pôde ser montada.');
  }
  return {
    sequencia,
    n,
    modo,
    metricas: resultado.metricas,
    raiz: resultado.raiz,
    truncada: resultado.truncada,
    limite_nos,
    nos_exibidos: resultado.nosExibidos,
  };
}

function comparar(pedido: PedidoComparar): CompararResposta {
  const { sequencia, n, repeticoes, ordem } = pedido;
  // A comparação roda os dois modos, então vale o limite do mais restrito.
  validarN(n, limiteN('node', sequencia, 'sem_cache'));
  return compararModos(sequencia, n, { repeticoes, ordem });
}

/** Ponto único de execução dos trabalhos pesados, chamado dentro do worker. */
export function executarPedido<P extends Pedido>(pedido: P): RespostaDoPedido<P> {
  const resposta = executarProtegido(() => {
    switch (pedido.tipo) {
      case 'calcular':
        return calcular(pedido);
      case 'arvore':
        return montarArvore(pedido);
      case 'comparar':
        return comparar(pedido);
    }
  });
  // O switch já cobre os três tipos; a conversão só liga o genérico ao retorno.
  return resposta as RespostaDoPedido<P>;
}
