import { AmbienteExecucaoSchema } from '@sequencias/contrato';
import os from 'node:os';
import { describe, expect, it } from 'vitest';
import { coletarAmbiente } from './ambiente';

describe('coletarAmbiente', () => {
  it('produz um objeto válido pelo schema do contrato', () => {
    expect(AmbienteExecucaoSchema.safeParse(coletarAmbiente()).success).toBe(true);
  });

  it('usa os dados do processo e do sistema operacional', () => {
    const ambiente = coletarAmbiente();
    expect(ambiente.node).toBe(process.versions.node);
    expect(ambiente.v8).toBe(process.versions.v8);
    expect(ambiente.plataforma).toBe(process.platform);
    expect(ambiente.arquitetura).toBe(process.arch);
    expect(ambiente.memoria_total_bytes).toBe(os.totalmem());
    expect(ambiente.nucleos).toBeGreaterThanOrEqual(1);
    expect(ambiente.cpu.length).toBeGreaterThan(0);
  });
});
