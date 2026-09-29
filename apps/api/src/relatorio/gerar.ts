import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { coletarDados, type Progresso } from './coleta';
import { montarFigurasSvg, montarRelatorioHtml } from './html';
import { montarRelatorio } from './markdown';
import { PLANO_PADRAO } from './plano';

/** Relatório da apresentação: uma página, sem servidor e sem arquivo externo. */
const DESTINO_HTML = new URL('../../../../docs/relatorio.html', import.meta.url);

/** Mesma coleta em Markdown, para versionar e revisar no editor. */
const DESTINO_MARKDOWN = new URL('../../../../docs/resultados-benchmark.md', import.meta.url);

/** Figuras avulsas usadas pelo artigo e pelos slides. */
const PASTA_FIGURAS = new URL('../../../../docs/figuras/', import.meta.url);

function relatarProgresso({ indice, total, sequencia, n, duracao_ms }: Progresso): void {
  const prefixo = `[${indice}/${total}] ${sequencia} n = ${n}`;
  if (duracao_ms === null) console.log(`${prefixo}: medindo...`);
  else console.log(`${prefixo}: ${(duracao_ms / 1000).toFixed(1)} s`);
}

const dados = await coletarDados(PLANO_PADRAO, relatarProgresso);

await writeFile(DESTINO_HTML, montarRelatorioHtml(dados), 'utf8');
await writeFile(DESTINO_MARKDOWN, montarRelatorio(dados), 'utf8');

await mkdir(PASTA_FIGURAS, { recursive: true });
const figuras = montarFigurasSvg(dados);
for (const [arquivo, conteudo] of Object.entries(figuras)) {
  await writeFile(new URL(arquivo, PASTA_FIGURAS), conteudo, 'utf8');
}

console.log(`Relatório da apresentação: ${fileURLToPath(DESTINO_HTML)}`);
console.log(`Resultados em Markdown:   ${fileURLToPath(DESTINO_MARKDOWN)}`);
console.log(
  `Figuras:                  ${Object.keys(figuras).length} em ${fileURLToPath(PASTA_FIGURAS)}`,
);
