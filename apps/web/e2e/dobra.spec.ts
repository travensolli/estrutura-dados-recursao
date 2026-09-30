import { expect, test, type Locator, type Page } from '@playwright/test';
import { abrir } from './auxiliares';

/* Cada rota tem uma âncora que só aparece com o conteúdo assíncrono assentado. */
const ROTAS_SEM_ROLAGEM: ReadonlyArray<[string, string, (pagina: Page) => Locator]> = [
  ['início', '/', (pagina) => pagina.getByRole('article', { name: 'Tribonacci' })],
  ['calcular', '/calcular', (pagina) => pagina.getByText('Nenhum cálculo ainda')],
  ['comparar', '/comparar', (pagina) => pagina.getByText('Nenhuma comparação ainda')],
  ['árvore', '/arvore', (pagina) => pagina.getByRole('button', { name: 'Ajustar à tela' })],
];

async function excessoDeRolagem(pagina: Page): Promise<number> {
  return pagina.evaluate(() => document.documentElement.scrollHeight - window.innerHeight);
}

/** O alvo inteiro, do topo à base, está dentro da janela sem rolar. */
async function dentroDaJanela(pagina: Page, alvo: Locator): Promise<void> {
  const janela = pagina.viewportSize();
  const caixa = await alvo.boundingBox();
  if (janela === null || caixa === null) throw new Error('alvo sem caixa visível');
  expect(caixa.y).toBeGreaterThanOrEqual(-1);
  expect(caixa.y + caixa.height).toBeLessThanOrEqual(janela.height + 1);
}

/* A dobra é a janela útil do notebook da apresentação (projeto desktop,
   1366x641). O estado inicial de cada tela cabe sem rolagem do documento,
   e o resultado principal de cada execução cabe na mesma janela; a prova
   detalhada fica abaixo, em blocos que abrem sob demanda. */
test.describe('dobra do notebook', () => {
  test.beforeEach(() => {
    test.skip(test.info().project.name !== 'desktop', 'a dobra é medida na janela do notebook');
  });

  for (const [nome, rota, ancora] of ROTAS_SEM_ROLAGEM) {
    test(`${nome} abre sem rolagem do documento`, async ({ page }) => {
      await abrir(page, rota);
      await expect(ancora(page)).toBeVisible();
      expect(await excessoDeRolagem(page)).toBeLessThanOrEqual(1);
    });
  }

  /* A segunda janela comum: 1440x900 menos os mesmos 127 px de barra de tarefas e navegador. */
  test('as mesmas telas abrem sem rolagem na janela útil de um 1440x900', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 773 });
    for (const [nome, rota, ancora] of ROTAS_SEM_ROLAGEM) {
      await abrir(page, rota);
      await expect(ancora(page)).toBeVisible();
      expect(await excessoDeRolagem(page), nome).toBeLessThanOrEqual(1);
    }
  });

  /* O palco tem altura fixa e só o miolo rola: nenhuma etapa pode precisar disso,
     nem em tela cheia (768) nem na janela do notebook (641). */
  test('as seis etapas da apresentação cabem no palco sem rolar por dentro', async ({ page }) => {
    const conteudo: ReadonlyArray<(pagina: Page) => Locator> = [
      (pagina) => pagina.getByTestId('valor-alvo'),
      (pagina) => pagina.getByTestId('linha-argumento').first(),
      (pagina) => pagina.getByTestId('momento-cache').first(),
      (pagina) => pagina.getByTestId('poda').first(),
      (pagina) => pagina.getByTestId('evitadas'),
      (pagina) => pagina.getByRole('region', { name: 'O preço' }),
    ];
    for (const altura of [768, 641]) {
      await page.setViewportSize({ width: 1366, height: altura });
      for (const [indice, ancora] of conteudo.entries()) {
        await abrir(page, `/apresentacao?etapa=${indice + 1}`);
        await expect(ancora(page)).toBeVisible();
        const excesso = await page.evaluate(() => {
          const miolo = document.querySelector('main#conteudo');
          return miolo ? miolo.scrollHeight - miolo.clientHeight : -1;
        });
        expect(excesso, `etapa ${indice + 1} em 1366x${altura}`).toBeLessThanOrEqual(1);
      }
    }
  });

  test('árvore: contadores e desenho inteiros na janela', async ({ page }) => {
    await abrir(page, '/arvore');
    await expect(page.getByRole('button', { name: 'Ajustar à tela' })).toBeVisible();
    await dentroDaJanela(page, page.getByText('invocações', { exact: true }));
    await dentroDaJanela(
      page,
      page.getByRole('group', { name: /Árvore de chamadas de Tribonacci/ }),
    );
  });

  /* A árvore com cache é alta e estreita: é ela que o desenho estica até o fim da janela. */
  test('árvore com cache abre sem rolagem, com o desenho inteiro na janela', async ({ page }) => {
    await abrir(page, '/arvore?sequencia=tribonacci&n=7&modo=com_cache');
    await expect(page.getByRole('button', { name: 'Ajustar à tela' })).toBeVisible();
    expect(await excessoDeRolagem(page)).toBeLessThanOrEqual(1);
    await dentroDaJanela(
      page,
      page.getByRole('group', { name: /Árvore de chamadas de Tribonacci f\(7\) com cache/ }),
    );
  });

  test('árvore: os 46 nós de f(7) ficam dentro do desenho, também num projetor de 1024', async ({
    page,
  }) => {
    for (const largura of [1366, 1024]) {
      await page.setViewportSize({ width: largura, height: 641 });
      await abrir(page, '/arvore?sequencia=tribonacci&n=7&modo=sem_cache');
      await expect(page.getByTestId('no-arvore')).toHaveCount(46);
      const fora = await page.evaluate(() => {
        const desenho = document.querySelector('svg[aria-label^="Árvore de chamadas"]');
        if (!desenho) return -1;
        const caixa = desenho.getBoundingClientRect();
        return [...document.querySelectorAll('[data-testid="no-arvore"]')].filter((no) => {
          const r = no.getBoundingClientRect();
          return r.left < caixa.left - 1 || r.right > caixa.right + 1;
        }).length;
      });
      expect(fora, `nós fora do desenho em ${largura}px`).toBe(0);
    }
  });

  test('calcular no modo comparar mostra os dois placares lado a lado', async ({ page }) => {
    await abrir(page, '/calcular?sequencia=tribonacci&n=7&modo=comparar');
    await page.getByRole('button', { name: /^Calcular$/ }).click();
    const semCache = page.getByRole('region', { name: 'Métricas sem cache' });
    const comCache = page.getByRole('region', { name: 'Métricas com cache' });
    await expect(comCache).toBeVisible();
    await dentroDaJanela(page, semCache);
    await dentroDaJanela(page, comCache);
    const [esquerda, direita] = [await semCache.boundingBox(), await comCache.boundingBox()];
    expect(Math.abs((esquerda?.y ?? 0) - (direita?.y ?? 1))).toBeLessThanOrEqual(1);
  });

  test('início: a janela de código cabe na tela, sem rolagem lateral nem interna', async ({
    page,
  }) => {
    await abrir(page, '/');
    await page.getByRole('button', { name: 'Código de Tribonacci em TypeScript' }).click();
    const janela = page.getByRole('dialog', { name: 'Tribonacci em TypeScript' });
    await expect(janela).toBeVisible();
    await dentroDaJanela(page, janela);
    const excessos = await janela.evaluate((el) => ({
      interno: el.scrollHeight - el.clientHeight,
      lateral: [...el.querySelectorAll('pre')].map((pre) => pre.scrollWidth - pre.clientWidth),
    }));
    expect(excessos.interno).toBeLessThanOrEqual(1);
    expect(excessos.lateral).toEqual([0, 0]);
  });

  test('início: a tabela de fórmulas não rola para o lado, nem com o maior n', async ({ page }) => {
    for (const largura of [1366, 1024]) {
      await page.setViewportSize({ width: largura, height: 641 });
      await abrir(page, '/');
      await page.getByText('Fórmulas gerais: invocações, pilha e complexidade').click();
      await page.getByLabel('n do exemplo', { exact: true }).fill('40');
      const tabela = page.getByRole('region', { name: /Fórmulas gerais aplicadas.*n = 40/ });
      await expect(tabela).toBeVisible();
      const lateral = await tabela.evaluate((el) => el.scrollWidth - el.clientWidth);
      expect(lateral, `rolagem lateral em ${largura}px`).toBeLessThanOrEqual(0);
    }
  });

  test('comparar mostra os destaques e as duas curvas numa tela', async ({ page }) => {
    await abrir(page, '/comparar?sequencia=tribonacci&n=12&repeticoes=2');
    await page.getByRole('button', { name: /^Comparar$/ }).click();
    await expect(page.getByTestId('painel-invocacoes')).toBeVisible({ timeout: 60_000 });
    for (const alvo of [
      page.getByText('Fator de aceleração'),
      page.getByText('Chamadas evitadas pelo cache'),
      page.getByText('Memória a mais com cache'),
      page.getByTestId('painel-tempo'),
      page.getByTestId('painel-invocacoes'),
    ]) {
      await dentroDaJanela(page, alvo);
    }
  });
});
