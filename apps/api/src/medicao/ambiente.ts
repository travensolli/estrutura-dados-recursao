import { type AmbienteExecucao } from '@sequencias/contrato';
import os from 'node:os';

/** Dados da máquina que executou a medição, no formato do schema do contrato. */
export function coletarAmbiente(): AmbienteExecucao {
  const processadores = os.cpus();
  const primeiro = processadores[0];
  return {
    node: process.versions.node,
    v8: process.versions.v8,
    plataforma: process.platform,
    arquitetura: process.arch,
    cpu: primeiro?.model.trim() ?? 'desconhecido',
    nucleos: Math.max(1, processadores.length, os.availableParallelism()),
    memoria_total_bytes: os.totalmem(),
  };
}
