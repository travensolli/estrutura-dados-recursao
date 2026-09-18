import { expect, test, type Page } from '@playwright/test';
import { abrir } from './auxiliares';

/* A tela não calcula sozinha pelo endereço: ela pré-preenche o formulário,
   mostra a previsão de invocações e espera o comando. */
async function calcular(pagina: Page, rota: string) {
  await abrir(pagina, rota);
  await pagina.getByRole('button', { name: /^Calcular$/ }).click();
}

test.describe('cálculo', () => {
  test('tribonacci f(7) sem cache faz 46 invocações', async ({ page }) => {
    await calcular(page, '/calcular?sequencia=tribonacci&n=7&modo=sem_cache');
    await expect(page.getByTestId('metrica-invocacoes')).toContainText('46');
    await expect(page.getByTestId('metrica-recursivas')).toContainText('45');
    await expect(page.getByTestId('metrica-casos_base')).toContainText('31');
  });

  test('tribonacci f(7) com cache faz 16 invocações e 5 acertos', async ({ page }) => {
    await calcular(page, '/calcular?sequencia=tribonacci&n=7&modo=com_cache');
    await expect(page.getByTestId('metrica-invocacoes')).toContainText('16');
    await expect(page.getByTestId('metrica-acertos')).toContainText('5');
  });

  test('fibonacci f(10) confere com a fórmula fechada', async ({ page }) => {
    await calcular(page, '/calcular?sequencia=fibonacci&n=10&modo=sem_cache');
    await expect(page.getByTestId('metrica-invocacoes')).toContainText('177');
  });

  test('fatorial de 25 aparece exato, sem perder precisão', async ({ page }) => {
    await calcular(page, '/calcular?sequencia=fatorial&n=25&modo=com_cache');
    await expect(page.getByText('26 dígitos', { exact: true })).toBeVisible();
    await page.getByRole('button', { name: /Ver valor completo/i }).click();
    await expect(page.getByText('15511210043330985984000000')).toBeVisible();
  });

  test('prevê as invocações antes de executar', async ({ page }) => {
    await abrir(page, '/calcular?sequencia=tribonacci&n=7&modo=sem_cache');
    await expect(page.getByText(/Previsão para f\(7\) sem cache: 46 invocações/)).toBeVisible();
  });

  test('recusa n acima do limite e não executa', async ({ page }) => {
    await abrir(page, '/calcular?sequencia=fibonacci&n=90&modo=sem_cache');
    await expect(page.getByText(/35/).first()).toBeVisible();
    await expect(page.getByTestId('metrica-invocacoes')).toHaveCount(0);
  });
});
