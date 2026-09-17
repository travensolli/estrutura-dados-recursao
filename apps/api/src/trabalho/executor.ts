import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { Worker } from 'node:worker_threads';
import { config } from '../config';
import { deErroJson, erroDeEncerramento, erroDeTempoLimite, paraErroSequencia } from './erros';
import {
  type MensagemDoTrabalhador,
  type Pedido,
  type RespostaDeTrabalho,
  type RespostaDoPedido,
} from './mensagens';

export interface OpcoesExecutor {
  tempoLimiteMs?: number;
  pilhaMb?: number;
}

/** Em desenvolvimento o worker é o próprio .ts; no pacote, o .js irmão gerado pelo tsup. */
export function arquivoDoTrabalhador(urlDoModulo: string): URL {
  const nome =
    urlDoModulo.startsWith('file:') && urlDoModulo.endsWith('.ts')
      ? './trabalhador.ts'
      : './trabalhador.js';
  return new URL(nome, urlDoModulo);
}

function partidaComTsx(alvo: URL): string {
  const exigir = createRequire(import.meta.url);
  const tsx = pathToFileURL(exigir.resolve('tsx/esm/api')).href;
  return `import(${JSON.stringify(tsx)}).then((api) => { api.register(); return import(${JSON.stringify(alvo.href)}); });`;
}

/** Cria o worker já com o pedido em workerData e a pilha ampliada. */
export function criarTrabalhador(pedido: Pedido, pilhaMb = config.pilhaMb): Worker {
  const alvo = arquivoDoTrabalhador(import.meta.url);
  const resourceLimits = { stackSizeMb: pilhaMb };
  if (!alvo.pathname.endsWith('.ts')) {
    return new Worker(alvo, { workerData: pedido, resourceLimits });
  }
  return new Worker(partidaComTsx(alvo), { eval: true, workerData: pedido, resourceLimits });
}

/**
 * Espera a resposta do worker. Ao estourar o tempo limite encerra o worker e
 * devolve TEMPO_LIMITE; erros de execução viram erro de domínio.
 */
export function aguardarTrabalhador<T extends RespostaDeTrabalho>(
  trabalhador: Worker,
  tempoLimiteMs: number,
): Promise<T> {
  return new Promise<T>((resolver, rejeitar) => {
    let concluido = false;

    function encerrar(acao: () => void): void {
      if (concluido) return;
      concluido = true;
      clearTimeout(cronometro);
      void trabalhador.terminate();
      acao();
    }

    const cronometro = setTimeout(() => {
      encerrar(() => rejeitar(erroDeTempoLimite(tempoLimiteMs)));
    }, tempoLimiteMs);
    cronometro.unref();

    trabalhador.on('message', (mensagem: MensagemDoTrabalhador) => {
      encerrar(() => {
        if (mensagem.ok) resolver(mensagem.dados as T);
        else rejeitar(deErroJson(mensagem.erro));
      });
    });
    trabalhador.on('error', (erro: unknown) => encerrar(() => rejeitar(paraErroSequencia(erro))));
    trabalhador.on('exit', (codigo: number) =>
      encerrar(() => rejeitar(erroDeEncerramento(codigo))),
    );
  });
}

/** Executa um pedido isolado num worker novo. */
export function executarEmWorker<P extends Pedido>(
  pedido: P,
  opcoes: OpcoesExecutor = {},
): Promise<RespostaDoPedido<P>> {
  const trabalhador = criarTrabalhador(pedido, opcoes.pilhaMb ?? config.pilhaMb);
  return aguardarTrabalhador<RespostaDoPedido<P>>(
    trabalhador,
    opcoes.tempoLimiteMs ?? config.tempoLimiteMs,
  );
}
