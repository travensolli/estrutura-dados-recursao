import { expect, test, type Locator, type Page } from '@playwright/test';
import { abrir } from './auxiliares';

/* Cada rota tem uma âncora que só aparece com o conteúdo assíncrono assentado. */
const ROTAS_SEM_ROLAGEM: ReadonlyArray<[string, string, (pagina: Page) => Locator]> = [
  ['início', '/', (pagina) => pagina.getByRole('article', { name: 'Tribonacci' })],
  ['calcular', '/calcular', (pagina) => pagina.getByText('Nenhum cálculo ainda')],
  ['comparar', '/comparar', (pagina) => pagina.getByText('Nenhuma comparação ainda')],
  ['árvore', '/arvore', (pagina) => pagina.getByRole('button', { name: 'Ajustar à tela' })],
];

async function excessoDeRolagem(pagina: Page): Promise<number> {
  return pagina.evaluate(() => document.documentElement.scrollHeight - window.innerHeight);
}

/** O alvo inteiro, do topo à base, está dentro da janela sem rolar. */
async function dentroDaJanela(pagina: Page, alvo: Locator): Promise<void> {
  const janela = pagina.viewportSize();
  const caixa = await alvo.boundingBox();
  if (janela === null || caixa === null) throw new Error('alvo sem caixa visível');
  expect(caixa.y).toBeGreaterThanOrEqual(-1);
  expect(caixa.y + caixa.height).toBeLessThanOrEqual(janela.height + 1);
}

/* A dobra é a janela útil do notebook da apresentação (projeto desktop,
   1366x641). O estado inicial de cada tela cabe sem rolagem do documento,
   e o resultado principal de cada execução cabe na mesma janela; a prova
   detalhada fica abaixo, em blocos que abrem sob demanda. */
test.describe('dobra do notebook', () => {
  test.beforeEach(() => {
    test.skip(test.info().project.name !== 'desktop', 'a dobra é medida na janela do notebook');
  });

  for (const [nome, rota, ancora] of ROTAS_SEM_ROLAGEM) {
    test(`${nome} abre sem rolagem do documento`, async ({ page }) => {
      await abrir(page, rota);
      await expect(ancora(page)).toBeVisible();
      expect(await excessoDeRolagem(page)).toBeLessThanOrEqual(1);
    });
  }

  test('árvore: contadores e desenho inteiros na janela', async ({ page }) => {
    await abrir(page, '/arvore');
    await expect(page.getByRole('button', { name: 'Ajustar à tela' })).toBeVisible();
    await dentroDaJanela(page, page.getByText('invocações', { exact: true }));
    await dentroDaJanela(
      page,
      page.getByRole('group', { name: /Árvore de chamadas de Tribonacci/ }),
    );
  });

  test('calcular no modo comparar mostra os dois placares lado a lado', async ({ page }) => {
    await abrir(page, '/calcular?sequencia=tribonacci&n=7&modo=comparar');
    await page.getByRole('button', { name: /^Calcular$/ }).click();
    const semCache = page.getByRole('region', { name: 'Métricas sem cache' });
    const comCache = page.getByRole('region', { name: 'Métricas com cache' });
    await expect(comCache).toBeVisible();
    await dentroDaJanela(page, semCache);
    await dentroDaJanela(page, comCache);
    const [esquerda, direita] = [await semCache.boundingBox(), await comCache.boundingBox()];
    expect(Math.abs((esquerda?.y ?? 0) - (direita?.y ?? 1))).toBeLessThanOrEqual(1);
  });

  test('comparar mostra os destaques e as duas curvas numa tela', async ({ page }) => {
    await abrir(page, '/comparar?sequencia=tribonacci&n=12&repeticoes=2');
    await page.getByRole('button', { name: /^Comparar$/ }).click();
    await expect(page.getByTestId('painel-invocacoes')).toBeVisible({ timeout: 60_000 });
    for (const alvo of [
      page.getByText('Fator de aceleração'),
      page.getByText('Chamadas evitadas pelo cache'),
      page.getByText('Memória a mais com cache'),
      page.getByTestId('painel-tempo'),
      page.getByTestId('painel-invocacoes'),
    ]) {
      await dentroDaJanela(page, alvo);
    }
  });
});
