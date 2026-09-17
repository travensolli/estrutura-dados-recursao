import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { coletarDados, type Progresso } from './coleta';
import { montarRelatorio } from './markdown';
import { PLANO_PADRAO } from './plano';

const DESTINO = new URL('../../../../docs/resultados-benchmark.md', import.meta.url);

function relatarProgresso({ indice, total, sequencia, n, duracao_ms }: Progresso): void {
  const prefixo = `[${indice}/${total}] ${sequencia} n = ${n}`;
  if (duracao_ms === null) console.log(`${prefixo}: medindo...`);
  else console.log(`${prefixo}: ${(duracao_ms / 1000).toFixed(1)} s`);
}

const dados = await coletarDados(PLANO_PADRAO, relatarProgresso);
await writeFile(DESTINO, montarRelatorio(dados), 'utf8');
console.log(`Relatório escrito em ${fileURLToPath(DESTINO)}`);
