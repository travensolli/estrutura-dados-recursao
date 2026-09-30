import { expect, test, type Page } from '@playwright/test';
import { abrir } from './auxiliares';

/** Quantas vezes a tela pediu cada execução à API. */
function contarPedidos(pagina: Page): Record<string, number> {
  const contagem: Record<string, number> = {};
  pagina.on('request', (pedido) => {
    if (pedido.method() !== 'POST') return;
    const caminho = new URL(pedido.url()).pathname;
    contagem[caminho] = (contagem[caminho] ?? 0) + 1;
  });
  return contagem;
}

async function irPeloMenu(pagina: Page, item: string, titulo: string) {
  await pagina
    .getByRole('navigation', { name: 'Principal' })
    .getByRole('link', { name: item })
    .click();
  await expect(pagina.getByRole('heading', { level: 1 })).toHaveText(titulo);
}

/* Trocar de tela e voltar não refaz nada: o formulário, o resultado e a
   medição continuam os mesmos, inclusive os tempos medidos. */
test('as três telas voltam como foram deixadas', async ({ page }) => {
  const pedidos = contarPedidos(page);

  await abrir(page, '/calcular');
  await page.getByRole('radio', { name: 'Com cache' }).click();
  await page.getByRole('button', { name: /^Calcular$/ }).click();
  const tempoCalculo = page.getByTestId('metrica-tempo');
  await expect(page.getByTestId('metrica-invocacoes')).toContainText('16');
  const tempoAntes = await tempoCalculo.textContent();

  await irPeloMenu(page, 'Comparar', 'Comparar');
  await page.getByRole('button', { name: /^Comparar$/ }).click();
  const destaque = page.getByText('Fator de aceleração').locator('..');
  await expect(destaque).toBeVisible({ timeout: 60_000 });
  const medicaoAntes = await destaque.textContent();
  await page.getByRole('radio', { name: 'Logarítmica' }).click();

  await irPeloMenu(page, 'Árvore', 'Árvore de chamadas');
  await page.getByRole('radio', { name: 'Com cache' }).click();
  await page.getByRole('button', { name: 'Ver árvore' }).click();
  await expect(page.getByRole('heading', { level: 2 }).first()).toContainText('com cache');
  await page.getByRole('button', { name: 'Lista', exact: true }).click();
  const pedidosAntes = { ...pedidos };

  await irPeloMenu(page, 'Calcular', 'Calcular');
  await expect(page.getByRole('radio', { name: 'Com cache' })).toBeChecked();
  await expect(tempoCalculo).toHaveText(tempoAntes ?? '');

  await irPeloMenu(page, 'Comparar', 'Comparar');
  await expect(destaque).toHaveText(medicaoAntes ?? '');
  await expect(page.getByRole('radio', { name: 'Logarítmica' })).toBeChecked();

  await irPeloMenu(page, 'Árvore', 'Árvore de chamadas');
  await expect(page.getByRole('heading', { level: 2 }).first()).toContainText(
    'Tribonacci f(7) com cache',
  );
  await expect(page.getByRole('button', { name: 'Lista', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  );

  // A volta não pediu nada à API: tudo veio do que já estava na tela.
  expect(pedidos).toEqual(pedidosAntes);
  expect(pedidos['/api/calcular']).toBe(1);
  expect(pedidos['/api/comparar']).toBe(1);
});
