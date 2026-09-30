import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { abrir } from './auxiliares';

const ROTAS = [
  ['início', '/'],
  ['calcular', '/calcular?sequencia=tribonacci&n=7&modo=sem_cache'],
  ['comparar', '/comparar?sequencia=tribonacci&n=12&repeticoes=2'],
  ['árvore', '/arvore?sequencia=tribonacci&n=7&modo=sem_cache'],
  ['apresentação', '/apresentacao?slide=5'],
] as const;

test.describe('acessibilidade', () => {
  for (const [nome, rota] of ROTAS) {
    test(`sem violações graves em ${nome}`, async ({ page }) => {
      await abrir(page, rota);
      const { violations } = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();
      const graves = violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
      expect(graves.map((v) => `${v.id}: ${v.nodes.length} elementos`)).toEqual([]);
    });
  }

  test('navega até o conteúdo só pelo teclado', async ({ page }) => {
    await abrir(page, '/');
    await page.keyboard.press('Tab');
    await expect(page.getByRole('link', { name: /Ir para o conteúdo/i })).toBeFocused();
  });
});
