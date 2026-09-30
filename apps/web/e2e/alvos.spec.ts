import { expect, test, type Page } from '@playwright/test';
import { abrir } from './auxiliares';

/* O piso de alvo dos controles muda com o ponteiro: 44 px no toque (WCAG 2.5.5) e
   32 px com mouse, acima dos 24 px de WCAG 2.2 SC 2.5.8. O axe do projeto não roda
   a regra target-size, que é wcag22aa, então é este teste que guarda o piso.
   Os projetos desktop e tablet usam o Chrome de mesa, com ponteiro fino e hover;
   só o celular (Pixel 5, com toque) vê o alvo de 44 px. */
const ROTAS: ReadonlyArray<string> = [
  '/',
  '/calcular',
  '/comparar',
  '/arvore',
  '/apresentacao?etapa=3',
];

const SELETOR = [
  'button',
  'a[href]',
  'summary',
  'select',
  'input:not([type="range"]):not([type="radio"])',
  'label:has(> input[type="radio"])',
  '[role="radio"]',
  '[role="tab"]',
].join(', ');

interface AlvoPequeno {
  alvo: string;
  largura: number;
  altura: number;
}

async function alvosAbaixoDe(pagina: Page, piso: number): Promise<AlvoPequeno[]> {
  return pagina.evaluate(
    ({ seletor, minimo }) =>
      [...document.querySelectorAll<HTMLElement>(seletor)]
        .map((elemento) => ({ elemento, caixa: elemento.getBoundingClientRect() }))
        // Fora da tela ou só para leitor de tela (o atalho "Ir para o conteúdo" tem 1 px).
        .filter(({ caixa }) => caixa.width > 1 && caixa.height > 1)
        .filter(({ caixa }) => Math.min(caixa.width, caixa.height) < minimo - 0.5)
        .map(({ elemento, caixa }) => ({
          alvo: `${elemento.tagName.toLowerCase()} "${(elemento.getAttribute('aria-label') ?? elemento.textContent ?? '').trim().slice(0, 40)}"`,
          largura: Math.round(caixa.width),
          altura: Math.round(caixa.height),
        })),
    { seletor: SELETOR, minimo: piso },
  );
}

test.describe('piso de alvo dos controles', () => {
  for (const rota of ROTAS) {
    test(`nenhum controle abaixo do piso em ${rota}`, async ({ page }) => {
      const piso = test.info().project.name === 'celular' ? 44 : 32;
      await abrir(page, rota);
      await expect(page.getByText(/^Calculando /)).toHaveCount(0, { timeout: 60_000 });
      expect(await alvosAbaixoDe(page, piso)).toEqual([]);
    });
  }
});
