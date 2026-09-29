import { expect, test, type Locator, type Page } from '@playwright/test';
import { abrir } from './auxiliares';

/* Cada rota tem uma âncora que só aparece com o conteúdo assíncrono assentado. */
const ROTAS_SEM_ROLAGEM: ReadonlyArray<[string, string, (pagina: Page) => Locator]> = [
  ['início', '/', (pagina) => pagina.getByRole('article', { name: 'Tribonacci' })],
  ['calcular', '/calcular', (pagina) => pagina.getByText('Nenhum cálculo ainda')],
  ['comparar', '/comparar', (pagina) => pagina.getByText('Nenhuma comparação ainda')],
];

async function excessoDeRolagem(pagina: Page): Promise<number> {
  return pagina.evaluate(() => document.documentElement.scrollHeight - window.innerHeight);
}

/* A dobra é a janela útil do notebook da apresentação (projeto desktop,
   1366x641). O estado inicial de cada tela deve caber sem rolagem do
   documento; a prova detalhada fica em blocos que abrem sob demanda. */
test.describe('dobra do notebook', () => {
  for (const [nome, rota, ancora] of ROTAS_SEM_ROLAGEM) {
    test(`${nome} abre sem rolagem do documento`, async ({ page }, info) => {
      test.skip(info.project.name !== 'desktop', 'a dobra é medida na janela do notebook');
      await abrir(page, rota);
      await expect(ancora(page)).toBeVisible();
      expect(await excessoDeRolagem(page)).toBeLessThanOrEqual(1);
    });
  }

  /* Na árvore os controles podem rolar para fora; o que não pode é o palco do
     desenho — contadores, ferramentas e o traçado — passar de uma tela. */
  test('árvore: contadores e desenho cabem juntos numa tela', async ({ page }, info) => {
    test.skip(info.project.name !== 'desktop', 'a dobra é medida na janela do notebook');
    await abrir(page, '/arvore');
    await expect(page.getByRole('button', { name: 'Ajustar à tela' })).toBeVisible();

    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    const janela = page.viewportSize();
    if (janela === null) throw new Error('viewport indisponível');

    for (const alvo of [
      page.getByText('invocações', { exact: true }),
      page.getByRole('group', { name: /Árvore de chamadas de Tribonacci/ }),
    ]) {
      const caixa = await alvo.boundingBox();
      if (caixa === null) throw new Error('alvo sem caixa visível');
      expect(caixa.y).toBeGreaterThanOrEqual(-1);
      expect(caixa.y + caixa.height).toBeLessThanOrEqual(janela.height + 1);
    }
  });
});
