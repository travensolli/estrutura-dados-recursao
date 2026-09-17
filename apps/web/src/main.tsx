import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import { App } from './App';
import './estilos/global.css';

async function iniciarMocks(): Promise<void> {
  if (import.meta.env.VITE_USAR_MOCKS !== 'true') return;
  const { trabalhadorMock } = await import('./mocks/navegador');
  await trabalhadorMock.start({ onUnhandledRequest: 'bypass', quiet: true });
}

const clienteConsultas = new QueryClient({
  defaultOptions: {
    queries: { retry: false, staleTime: 30_000, refetchOnWindowFocus: false },
  },
});

void iniciarMocks().then(() => {
  const raiz = document.getElementById('raiz');
  if (!raiz) throw new Error('Elemento #raiz não encontrado');
  createRoot(raiz).render(
    <StrictMode>
      <QueryClientProvider client={clienteConsultas}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </QueryClientProvider>
    </StrictMode>,
  );
});
