import { expect, test, type Page } from '@playwright/test';
import { abrir } from './auxiliares';

/* O indicador de etapa só aparece depois que a moldura montou: esperar por ele
   garante que o atalho de teclado já está escutando. */
async function abrirEtapa(pagina: Page, numero: number) {
  await abrir(pagina, `/apresentacao?etapa=${numero}`);
  await expect(pagina.getByText(`Etapa ${numero} de 6`).first()).toBeVisible();
}

test.describe('modo apresentação', () => {
  test('abre com o valor de f(7) vindo da execução', async ({ page }) => {
    await abrir(page, '/apresentacao?etapa=1');
    await expect(page.getByTestId('valor-alvo')).toContainText('31');
  });

  test('mostra 46, 16 e 30 obtidos da execução', async ({ page }) => {
    await abrir(page, '/apresentacao?etapa=5');
    await expect(page.getByTestId('contador')).toContainText('16');
    await expect(page.getByText('de 46 sem cache para 16 com cache')).toBeVisible();
    await expect(page.getByTestId('evitadas')).toContainText('30');
    await expect(page.getByTestId('prova-podas')).toContainText('12 + 6 + 6 + 3 + 3 = 30');
    await expect(page.getByTestId('prova-recursivas')).toContainText('45');
  });

  test('anda pelas seis etapas pelo teclado', async ({ page }) => {
    await abrirEtapa(page, 1);
    for (let etapa = 2; etapa <= 6; etapa++) {
      await page.keyboard.press('PageDown');
      await expect(page).toHaveURL(new RegExp(`etapa=${etapa}`));
    }
    await page.keyboard.press('PageUp');
    await expect(page).toHaveURL(/etapa=5/);
  });

  test('as setas trocam de etapa onde não comandam a execução', async ({ page }) => {
    await abrirEtapa(page, 1);
    await page.keyboard.press('ArrowRight');
    await expect(page).toHaveURL(/etapa=2/);
    await page.keyboard.press('ArrowLeft');
    await expect(page).toHaveURL(/etapa=1/);
  });

  test('os números de 1 a 6 vão direto à etapa', async ({ page }) => {
    await abrirEtapa(page, 1);
    await page.keyboard.press('4');
    await expect(page).toHaveURL(/etapa=4/);
  });

  test('desenha as subárvores que o cache evitou', async ({ page }) => {
    await abrir(page, '/apresentacao?etapa=4');
    await expect(page.getByTestId('poda')).toHaveCount(5);
  });
});
