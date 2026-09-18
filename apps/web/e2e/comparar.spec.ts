import { expect, test } from '@playwright/test';
import { abrir } from './auxiliares';

test.describe('comparação de desempenho', () => {
  test('mede tribonacci e mostra as chamadas evitadas', async ({ page }) => {
    await abrir(page, '/comparar?sequencia=tribonacci&n=12&repeticoes=2');
    await page.getByRole('button', { name: /^Comparar$/ }).click();
    await expect(page.getByText(/Fator de aceleração/)).toBeVisible({ timeout: 60_000 });
    await expect(page.getByText(/Chamadas evitadas pelo cache/)).toBeVisible();
    await expect(page.getByText(/Ambiente de execução/)).toBeVisible();
  });

  test('diz com honestidade que o fatorial não ganha com cache', async ({ page }) => {
    await abrir(page, '/comparar?sequencia=fatorial&n=200&repeticoes=2');
    await page.getByRole('button', { name: /^Comparar$/ }).click();
    await expect(page.getByText(/Chamadas evitadas pelo cache/)).toBeVisible({ timeout: 60_000 });
    await expect(page.getByText(/Nenhum argumento se repetiu/)).toBeVisible();
    await expect(page.getByText(/Memória a mais com cache/)).toBeVisible();
  });
});
