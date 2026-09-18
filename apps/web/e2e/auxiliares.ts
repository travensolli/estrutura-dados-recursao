import { expect, type Page } from '@playwright/test';

/** Espera o conteúdo assíncrono da rota assentar antes de medir a tela. */
export async function abrir(pagina: Page, rota: string): Promise<void> {
  await pagina.goto(rota);
  await expect(pagina.getByRole('heading', { level: 1 })).toBeVisible();
}

/** Número mostrado num cartão de métrica, pelo rótulo. */
export async function metrica(pagina: Page, rotulo: string): Promise<string> {
  const caixa = pagina.getByTestId(`metrica-${rotulo}`);
  await expect(caixa).toBeVisible();
  return ((await caixa.textContent()) ?? '').replace(/\s+/g, ' ').trim();
}

export function apenasDigitos(texto: string): string {
  return texto.replace(/[^\d]/g, '');
}
