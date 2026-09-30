import { expect, test, type Page } from '@playwright/test';
import { abrir } from './auxiliares';

/* O indicador de slide só aparece depois que a moldura montou: esperar por ele
   garante que o atalho de teclado já está escutando. */
async function abrirSlide(pagina: Page, numero: number) {
  await abrir(pagina, `/apresentacao?slide=${numero}`);
  await expect(pagina.getByText(`Slide ${numero} de 6`).first()).toBeVisible();
}

/** Contraste WCAG entre duas cores rgb() calculadas pelo navegador. */
function contraste(primeira: string, segunda: string): number {
  const luminancia = (cor: string) => {
    const [r, g, b] = (cor.match(/\d+(\.\d+)?/g) ?? []).slice(0, 3).map((canal) => {
      const c = Number(canal) / 255;
      return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * (r ?? 0) + 0.7152 * (g ?? 0) + 0.0722 * (b ?? 0);
  };
  const [clara, escura] = [luminancia(primeira), luminancia(segunda)].sort((x, y) => y - x);
  return ((clara ?? 0) + 0.05) / ((escura ?? 0) + 0.05);
}

test.describe('modo apresentação', () => {
  test('abre com o valor de f(7) vindo da execução', async ({ page }) => {
    await abrir(page, '/apresentacao?slide=1');
    await expect(page.getByTestId('valor-alvo')).toContainText('31');
  });

  test('mostra 46, 16 e 30 obtidos da execução', async ({ page }) => {
    await abrir(page, '/apresentacao?slide=5');
    await expect(page.getByTestId('contador')).toContainText('30');
    await expect(page.getByTestId('evitadas')).toContainText('chamadas evitadas');
    await expect(
      page.getByText('das 46 invocações sem cache, só 16 acontecem com cache'),
    ).toBeVisible();
    await expect(page.getByTestId('prova-podas')).toContainText('12 + 6 + 6 + 3 + 3 = 30');
    await expect(page.getByTestId('prova-recursivas')).toContainText('45');
  });

  test('anda pelos seis slides pelo teclado', async ({ page }) => {
    await abrirSlide(page, 1);
    for (let slide = 2; slide <= 6; slide++) {
      await page.keyboard.press('PageDown');
      await expect(page).toHaveURL(new RegExp(`slide=${slide}`));
    }
    await page.keyboard.press('PageUp');
    await expect(page).toHaveURL(/slide=5/);
  });

  test('as setas trocam de slide onde não comandam a execução', async ({ page }) => {
    await abrirSlide(page, 1);
    await page.keyboard.press('ArrowRight');
    await expect(page).toHaveURL(/slide=2/);
    await page.keyboard.press('ArrowLeft');
    await expect(page).toHaveURL(/slide=1/);
  });

  test('os números de 1 a 6 vão direto ao slide', async ({ page }) => {
    await abrirSlide(page, 1);
    await page.keyboard.press('4');
    await expect(page).toHaveURL(/slide=4/);
  });

  for (const tema of ['light', 'dark'] as const) {
    test(`o Próximo continua legível com o ponteiro em cima, no tema ${tema === 'light' ? 'claro' : 'escuro'}`, async ({
      page,
    }) => {
      await page.emulateMedia({ colorScheme: tema });
      await abrirSlide(page, 1);
      const proximo = page.getByRole('button', { name: /Próximo/ });
      await proximo.hover();
      await expect
        .poll(async () => {
          const { fundo, texto } = await proximo.evaluate((botao) => {
            const estilo = getComputedStyle(botao);
            return { fundo: estilo.backgroundColor, texto: estilo.color };
          });
          return contraste(fundo, texto);
        })
        .toBeGreaterThanOrEqual(4.5);
    });
  }

  test('desenha as subárvores que o cache evitou numa árvore só', async ({ page }) => {
    await abrir(page, '/apresentacao?slide=4');
    await expect(page.getByTestId('soma-arvore')).toContainText('46');
    await expect(page.getByTestId('no-arvore')).toHaveCount(46);
    await expect(page.locator('[data-testid="no-arvore"][data-fantasma="sim"]')).toHaveCount(30);
  });
});
