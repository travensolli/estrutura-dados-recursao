import { defineConfig, devices } from '@playwright/test';

const PORTA_WEB = 5273;
const PORTA_API = 3373;
const BASE = `http://127.0.0.1:${PORTA_WEB}`;

/* Sobe a API e a interface de verdade: os testes conferem os números que a
   demonstração vai mostrar, sem mocks no caminho. */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['html', { open: 'never' }], ['list']] : [['list']],
  timeout: 90_000,
  expect: { timeout: 20_000 },
  use: {
    baseURL: BASE,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    locale: 'pt-BR',
  },
  projects: [
    {
      name: 'desktop',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
    },
    {
      name: 'tablet',
      use: { ...devices['Desktop Chrome'], viewport: { width: 768, height: 1024 } },
    },
    { name: 'celular', use: { ...devices['Pixel 5'], viewport: { width: 360, height: 780 } } },
  ],
  webServer: [
    {
      command: `pnpm --filter @sequencias/api exec node --expose-gc --import tsx src/servidor.ts`,
      env: { PORTA: String(PORTA_API), HOST: '127.0.0.1', NODE_ENV: 'test' },
      url: `http://127.0.0.1:${PORTA_API}/api/saude`,
      reuseExistingServer: false,
      timeout: 120_000,
      stdout: 'ignore',
    },
    {
      command: `pnpm --filter @sequencias/web exec vite --port ${PORTA_WEB} --strictPort`,
      env: { VITE_USAR_MOCKS: 'false', VITE_API_URL: `http://127.0.0.1:${PORTA_API}` },
      url: BASE,
      reuseExistingServer: false,
      timeout: 120_000,
      stdout: 'ignore',
    },
  ],
});
