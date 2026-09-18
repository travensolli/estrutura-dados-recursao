import { expect, test } from '@playwright/test';
import { abrir } from './auxiliares';

test.describe('árvore de chamadas', () => {
  test('desenha 46 nós sem cache e 16 com cache', async ({ page }, info) => {
    test.skip(info.project.name === 'celular', 'em tela estreita o padrão é a lista');
    await abrir(page, '/arvore?sequencia=tribonacci&n=7&modo=sem_cache');
    await expect(page.getByTestId('no-arvore')).toHaveCount(46);
    await abrir(page, '/arvore?sequencia=tribonacci&n=7&modo=com_cache');
    await expect(page.getByTestId('no-arvore')).toHaveCount(16);
  });

  test('avisa quando corta a árvore pelo orçamento de nós', async ({ page }) => {
    await abrir(page, '/arvore?sequencia=tribonacci&n=7&modo=sem_cache&limite_nos=10');
    await expect(page.getByText(/46/).first()).toBeVisible();
    await expect(page.getByText(/10 n|cort/i).first()).toBeVisible();
  });

  test('oferece a lista indentada como alternativa ao desenho', async ({ page }) => {
    await abrir(page, '/arvore?sequencia=tribonacci&n=7&modo=sem_cache');
    await page.getByRole('button', { name: /Lista/i }).click();
    await expect(page.getByRole('tree')).toBeVisible();
    await expect(page.getByTestId('item-arvore')).toHaveCount(46);
  });

  test('reproduz a execução passo a passo', async ({ page }) => {
    await abrir(page, '/arvore?sequencia=tribonacci&n=7&modo=com_cache');
    await page.getByRole('button', { name: /Reproduzir passo a passo/i }).click();
    await expect(page.getByTestId('quadro-pilha').first()).toBeVisible();
    const avancar = page.getByRole('button', { name: /Próximo passo/i });
    for (let i = 0; i < 6; i++) await avancar.click();
    await expect(page.getByTestId('quadro-pilha')).not.toHaveCount(0);
    await page.getByRole('button', { name: /Ir para o fim/i }).click();
    await expect(page.getByTestId('entrada-dicionario')).toHaveCount(5);
  });
});
