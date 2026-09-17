import {
  DESCRICAO_SEQUENCIAS,
  LIMITE_NOS_ARVORE_MAXIMO,
  LIMITE_NOS_ARVORE_PADRAO,
  limiteN,
} from '@sequencias/contrato';
import type { MensagemDoTrabalhador, PedidoCalculo } from './mensagens';
import { executarInstrumentado } from './nucleo-adaptador';

function limiteDeNos(pedido: number | undefined): number {
  if (pedido === undefined || !Number.isFinite(pedido)) return LIMITE_NOS_ARVORE_PADRAO;
  return Math.min(Math.max(1, Math.trunc(pedido)), LIMITE_NOS_ARVORE_MAXIMO);
}

/** Lógica do worker isolada para teste: valida limites, executa e mede. */
export function processarPedido(
  pedido: PedidoCalculo,
  agora: () => number = () => performance.now(),
): MensagemDoTrabalhador {
  const { id, sequencia, n, modo } = pedido;
  if (!Number.isInteger(n) || n < 0) {
    return {
      tipo: 'erro',
      id,
      codigo: 'ENTRADA_INVALIDA',
      mensagem: 'n deve ser um inteiro não negativo.',
    };
  }
  const limite = limiteN('navegador', sequencia, modo);
  if (n > limite) {
    return {
      tipo: 'erro',
      id,
      codigo: 'LIMITE_EXCEDIDO',
      mensagem: `No navegador, ${DESCRICAO_SEQUENCIAS[sequencia].nome} ${modo === 'sem_cache' ? 'sem' : 'com'} cache aceita n até ${limite}.`,
    };
  }
  const inicio = agora();
  try {
    const resultado = executarInstrumentado(sequencia, n, modo, {
      comArvore: pedido.com_arvore,
      limiteNos: limiteDeNos(pedido.limite_nos),
    });
    return {
      tipo: 'resultado',
      id,
      metricas: resultado.metricas,
      raiz: resultado.raiz,
      truncada: resultado.truncada,
      nos_exibidos: resultado.nosExibidos,
      duracao_ms: agora() - inicio,
    };
  } catch (erro) {
    if (erro instanceof RangeError) {
      return {
        tipo: 'erro',
        id,
        codigo: 'PILHA_ESTOURADA',
        mensagem:
          'A recursão ficou profunda demais para a pilha do navegador. Reduza n ou use o modo com cache.',
      };
    }
    return {
      tipo: 'erro',
      id,
      codigo: 'ERRO_INTERNO',
      mensagem: erro instanceof Error ? erro.message : 'Falha inesperada no cálculo offline.',
    };
  }
}
